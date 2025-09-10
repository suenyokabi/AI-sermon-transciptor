import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DisplayContent, DisplayContentType, Theme, GeminiAnalysisResult } from './types';
import { analyzeTranscript } from './services/geminiService';
import { fetchVerse } from './services/bibleService';
import ControlPanel from './components/ControlPanel';
import DisplayScreen from './components/DisplayScreen';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [preacherName, setPreacherName] = useState('Preacher');
  const [transcript, setTranscript] = useState('');
  const [displayContent, setDisplayContent] = useState<DisplayContent>({
    type: DisplayContentType.WELCOME,
    title: 'Sermon Scripture Projector',
    subtitle: 'Ready to begin. Click "Start Listening" to activate.',
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Fix: Use ReturnType<typeof setTimeout> for browser environments instead of NodeJS.Timeout
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processTranscript = useCallback(async (text: string) => {
    if (text.trim().split(' ').length < 5) return;

    setDisplayContent({ type: DisplayContentType.LOADING, message: 'Analyzing sermon...' });

    try {
      const result: GeminiAnalysisResult | null = await analyzeTranscript(text);

      if (result && result.type === 'SCRIPTURE' && result.reference) {
        if (result.confidence < 0.7) {
            // In a real app, you might ask for confirmation here.
            // For now, we'll proceed but this is where the "ask for confirmation" logic would go.
             console.log(`Low confidence (${result.confidence}) for: ${result.reference}. Proceeding anyway.`);
        }
        const verseData = await fetchVerse(result.reference);
        if(verseData) {
            setDisplayContent({
                id: `${Date.now()}`,
                type: DisplayContentType.SCRIPTURE,
                reference: verseData.reference,
                text: verseData.text,
                theme: result.theme || Theme.NEUTRAL,
            });
            setTranscript(''); // Clear transcript after finding scripture
        } else {
             throw new Error(`Could not fetch scripture for ${result.reference}`);
        }
      } else if (result && result.type === 'QUOTE' && result.quote) {
        setDisplayContent({
          id: `${Date.now()}`,
          type: DisplayContentType.QUOTE,
          text: result.quote,
          author: preacherName,
          theme: result.theme || Theme.NEUTRAL,
        });
      } else {
        // Nothing found, revert to welcome/neutral screen after a bit
        setTimeout(() => {
            if (displayContent.type === DisplayContentType.LOADING) {
                 setDisplayContent({
                    type: DisplayContentType.WELCOME,
                    title: 'Listening...',
                    subtitle: 'No scripture detected recently.',
                });
            }
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setDisplayContent({
        type: DisplayContentType.ERROR,
        message: `AI Error: ${errorMessage}`,
      });
    }
  }, [preacherName, displayContent]);


  const startListening = useCallback(() => {
    if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setDisplayContent({ type: DisplayContentType.WELCOME, title: 'Listening...', subtitle: 'Speak into the microphone.' });
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDisplayContent({ type: DisplayContentType.ERROR, message: 'Speech Recognition API not supported in this browser.' });
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setDisplayContent({ type: DisplayContentType.WELCOME, title: 'Listening...', subtitle: 'Speak into the microphone.' });
    };

    recognition.onend = () => {
      if(isListening) { // Restart if it wasn't stopped manually
        recognition.start();
      } else {
        setIsListening(false);
        setDisplayContent({ type: DisplayContentType.WELCOME, title: 'Sermon Scripture Projector', subtitle: 'Session ended.' });
      }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setDisplayContent({ type: DisplayContentType.ERROR, message: 'Microphone access denied. Please allow microphone permissions in your browser settings.' });
        } else {
            setDisplayContent({ type: DisplayContentType.ERROR, message: `Speech Error: ${event.error}` });
        }
        setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => (prev + ' ' + finalTranscript).trim());
        
        // Reset silence timer on new speech
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
            setTranscript(currentTranscript => {
                if (currentTranscript.length > 0) {
                     processTranscript(currentTranscript);
                }
                return currentTranscript; // return it to avoid issues with async state
            });
        }, 3000); // Process after 3 seconds of silence
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [processTranscript, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }
  }, []);

  useEffect(() => {
    return () => { // Cleanup on unmount
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
    };
  }, []);

  const handleFileUpload = (file: File) => {
    // This is a placeholder for future functionality.
    // Processing audio files client-side is complex and requires libraries like ffmpeg.wasm.
    // For now, we'll just show an info message.
    setDisplayContent({
      type: DisplayContentType.WELCOME,
      title: "File Upload",
      subtitle: `File "${file.name}" selected. Audio file processing is not implemented in this version.`,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 font-sans">
      <DisplayScreen content={displayContent} />
      <ControlPanel
        isListening={isListening}
        preacherName={preacherName}
        onPreacherNameChange={setPreacherName}
        onStartListening={startListening}
        onStopListening={stopListening}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
};

export default App;