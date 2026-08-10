// client/src/App.jsx
import { useState } from 'react';
import GenerateForm from './components/GenerateForm';
import ContentDisplay from './components/ContentDisplay';
import ChatPanel from './components/ChatPanel';
import DraftList from './components/DraftList';

function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await response.json();
      setGeneratedContent(data);
      setConversationId(data.conversationId);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatMessage = async (message) => {
    if (!conversationId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Chat failed');
      }

      const data = await response.json();
      setGeneratedContent(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (title) => {
    if (!generatedContent) return;

    try {
      const response = await fetch('http://localhost:3001/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: generatedContent.content,
          contentType: generatedContent.contentType || 'blog',
          tone: generatedContent.tone || 'casual',
          topic: generatedContent.topic || '',
          provider: generatedContent.provider,
          model: generatedContent.model,
          tokensUsed: generatedContent.usage?.total || 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to save draft');
      alert('Draft saved successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const tabs = [
    { id: 'generate', label: 'Generate' },
    { id: 'drafts', label: 'Saved Drafts' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                AI Writing Assistant
              </h1>
              <p className="text-sm text-slate-500">
                Blog posts, emails, social media, and academic writing with AI
              </p>
            </div>
          </div>
        </header>

        <nav className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-6 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <GenerateForm onGenerate={handleGenerate} isLoading={isLoading} />

              {generatedContent && (
                <ChatPanel
                  onSendMessage={handleChatMessage}
                  isLoading={isLoading}
                />
              )}
            </div>

            <div className="lg:col-span-3">
              <ContentDisplay
                content={generatedContent}
                isLoading={isLoading}
                onSave={handleSaveDraft}
              />
            </div>
          </div>
        )}

        {activeTab === 'drafts' && <DraftList />}
      </div>
    </div>
  );
}

export default App;
