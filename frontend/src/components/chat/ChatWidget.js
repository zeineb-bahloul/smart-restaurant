import React, { useState } from 'react';
import ChatWindow from './ChatWindow.js';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 transition-all duration-300 transform scale-100 origin-bottom-right">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95 focus:outline-none border border-amber-400/20"
      >
        {isOpen ? (
          <span className="text-xl font-bold">✕</span>
        ) : (
          <span className="text-2xl animate-bounce">🤖</span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
