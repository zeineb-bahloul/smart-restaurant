import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios.js';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversation history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/chat/history');
        if (response.data && response.data.length > 0) {
          setMessages(response.data);
        } else {
          // Welcome message if history is empty
          setMessages([
            {
              role: 'assistant',
              content: 'Bonjour ! Je suis Alex 🍽️ Comment puis-je vous aider aujourd\'hui ? Vous pouvez me demander la carte, commander des plats ou réserver une table.',
              id: 'welcome'
            }
          ]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique', error);
        setMessages([
          {
            role: 'assistant',
            content: 'Bonjour ! Je suis Alex 🍽️ Comment puis-je vous aider aujourd\'hui ?',
            id: 'welcome-fallback'
          }
        ]);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      id: Date.now().toString()
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', { message: messageToSend });
      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply,
        id: (Date.now() + 1).toString()
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur chatbot', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Désolé, je rencontre des difficultés techniques à me connecter au service.',
        id: (Date.now() + 2).toString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[360px] sm:w-[380px] h-[500px] flex flex-col rounded-2xl shadow-2xl overflow-hidden glass-effect-card border border-white/10 animate-fade-in">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="font-bold tracking-tight">🤖 Alex — Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/10 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300"
        >
          ✕
        </button>
      </div>

      {/* Messages Zone */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md transition-all ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-white rounded-br-none font-medium'
                  : 'bg-slate-800/80 text-slate-100 rounded-bl-none border border-slate-700/50'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-400 flex items-center gap-1">
              <span className="font-semibold text-xs text-amber-500">Alex écrit</span>
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900/60 border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Posez votre question à Alex..."
          className="flex-1 bg-slate-800 text-white border border-slate-700/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
