import React, { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you with train schedules, routes, or stations?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply || 'Sorry, I did not understand that.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error connecting to server.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 bg-white shadow-lg rounded-lg flex flex-col overflow-hidden mb-2 border border-gray-200">
          <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
            <span className="font-semibold">AI Chat Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">×</button>
          </div>
          <div className="flex-1 h-80 overflow-y-auto px-4 py-2 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg max-w-[75%] text-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mb-2 flex justify-start">
                <div className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm animate-pulse">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center border-t border-gray-200 px-2 py-2 bg-white">
            <input
              type="text"
              className="flex-1 px-3 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl focus:outline-none"
        aria-label="Open chat"
      >
        💬
      </button>
    </div>
  );
};

export default ChatBot; 