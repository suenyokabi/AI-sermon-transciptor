
import React, { useRef } from 'react';
import { MicIcon } from './icons/MicIcon';
import { StopIcon } from './icons/StopIcon';
import { UploadIcon } from './icons/UploadIcon';

interface ControlPanelProps {
  isListening: boolean;
  preacherName: string;
  onPreacherNameChange: (name: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onFileUpload: (file: File) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isListening,
  preacherName,
  onPreacherNameChange,
  onStartListening,
  onStopListening,
  onFileUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <label htmlFor="preacherName" className="text-xs text-gray-400">
            Preacher's Name
          </label>
          <input
            id="preacherName"
            type="text"
            value={preacherName}
            onChange={(e) => onPreacherNameChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            placeholder="Enter name..."
            disabled={isListening}
          />
        </div>

        <div className="flex items-center gap-2">
          {isListening ? (
            <button
              onClick={onStopListening}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
              aria-label="Stop listening"
            >
              <StopIcon />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={onStartListening}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
              aria-label="Start listening"
            >
              <MicIcon />
              <span>Start Listening</span>
            </button>
          )}
        </div>

        <div className="border-l border-gray-600 pl-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="audio/*"
                disabled={isListening}
            />
            <button
                onClick={handleUploadClick}
                disabled={isListening}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload audio file"
            >
                <UploadIcon />
                <span>Upload Audio</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
