// client/src/components/ChatPanel.jsx
import { useState } from 'react';

function ChatPanel({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');

    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await onSendMessage(userMessage);
      if (response) {
        setChatHistory((prev) => [
          ...prev,
          { role: 'assistant', content: 'Content updated based on your feedback.' },
        ]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: 'error', content: 'Failed to process your message. Please try again.' },
      ]);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-1 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <h2 className="text-base font-semibold text-slate-900">
          Refine Your Content
        </h2>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Ask for changes like "Make it shorter", "Add more detail about pricing",
        or "Change the tone to be more formal"
      </p>

      {chatHistory.length > 0 && (
        <div className="mb-4 flex max-h-60 flex-col gap-2 overflow-y-auto">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg border px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'border-indigo-200 bg-indigo-50 text-slate-800'
                  : msg.role === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <strong className="mb-0.5 block text-xs text-slate-500">
                {msg.role === 'user' ? 'You' : 'AI'}
              </strong>
              {msg.content}
            </div>
          ))}
        </div>
      )}

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g., Make it more concise and add a call-to-action"
          disabled={isLoading}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
