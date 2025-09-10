
import React from 'react';
import { DisplayContent, DisplayContentType, Theme } from '../types';

interface DisplayScreenProps {
  content: DisplayContent;
}

const themeClasses: Record<Theme, string> = {
  [Theme.HOPE]: 'from-blue-900 via-sky-800 to-indigo-900 text-sky-100',
  [Theme.GRACE]: 'from-purple-900 via-violet-800 to-fuchsia-900 text-violet-100',
  [Theme.JUDGMENT]: 'from-slate-900 via-red-900 to-black text-red-100',
  [Theme.LOVE]: 'from-rose-900 via-pink-800 to-red-900 text-pink-100',
  [Theme.NEUTRAL]: 'from-gray-800 via-slate-900 to-gray-900 text-gray-100',
};

const getThemeClass = (theme?: Theme) => {
    return theme ? themeClasses[theme] : themeClasses.NEUTRAL;
};

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400"></div>
    </div>
);

const DisplayScreen: React.FC<DisplayScreenProps> = ({ content }) => {

  const renderContent = () => {
    switch (content.type) {
      case DisplayContentType.WELCOME:
        return (
          <div className="text-center">
            <h1 className="text-5xl font-bold font-serif mb-4">{content.title}</h1>
            <p className="text-2xl text-gray-300">{content.subtitle}</p>
          </div>
        );
      case DisplayContentType.SCRIPTURE:
        return (
          <div key={content.id} className="text-center animate-fade-in px-8">
            <p className="text-4xl lg:text-5xl leading-relaxed font-serif mb-6">{content.text}</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-wider uppercase">{content.reference}</h2>
          </div>
        );
      case DisplayContentType.QUOTE:
        return (
          <div key={content.id} className="text-center animate-fade-in px-8">
            <p className="text-4xl lg:text-5xl leading-relaxed font-serif italic mb-6">"{content.text}"</p>
            <h2 className="text-3xl lg:text-4xl font-semibold">- {content.author}</h2>
          </div>
        );
      case DisplayContentType.LOADING:
        return (
          <div className="flex flex-col items-center justify-center gap-4">
              <LoadingSpinner />
              <p className="text-2xl text-gray-300 animate-pulse">{content.message}</p>
          </div>
        );
      case DisplayContentType.ERROR:
        return (
          <div className="text-center bg-red-900/50 p-8 rounded-lg">
            <h1 className="text-3xl font-bold text-red-300 mb-2">Error</h1>
            <p className="text-xl text-red-200">{content.message}</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  const currentTheme = (content.type === DisplayContentType.SCRIPTURE || content.type === DisplayContentType.QUOTE)
    ? getThemeClass(content.theme)
    : getThemeClass(Theme.NEUTRAL);

  return (
    <div
      className={`flex-grow flex items-center justify-center p-8 transition-all duration-1000 bg-gradient-to-br ${currentTheme}`}
    >
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.7s ease-out forwards;
            }
        `}</style>
      {renderContent()}
    </div>
  );
};

export default DisplayScreen;
