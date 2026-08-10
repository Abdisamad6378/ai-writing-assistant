// client/src/components/ContentDisplay.jsx
import { useState, useEffect } from 'react';

function ContentDisplay({ content, isLoading, onSave, onRegenerate, settings }) {
  const [draftTitle, setDraftTitle] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [regenTone, setRegenTone] = useState(settings?.tone || 'casual');
  const [regenLength, setRegenLength] = useState(settings?.length || 'medium');

  useEffect(() => {
    if (settings) {
      setRegenTone(settings.tone || 'casual');
      setRegenLength(settings.length || 'medium');
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        <p className="text-sm text-slate-500">Generating content...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="font-medium text-slate-700">Your content will appear here</p>
        <p className="text-sm text-slate-500">
          Fill in the form on the left and click Generate.
        </p>
      </div>
    );
  }

  const handleSave = () => {
    if (!draftTitle.trim()) return;
    onSave(draftTitle);
    setDraftTitle('');
    setShowSaveForm(false);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([content.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-content.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const actionButtonClasses =
    'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50';

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Generated Content
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {content.provider}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {content.usage?.total || 0} tokens
          </span>
        </div>
      </div>

      <div className="px-6 py-4">
        <pre className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800">
          {content.content}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-6 py-4">
        <button
          onClick={() => setShowSaveForm(true)}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          Save Draft
        </button>
        <button
          onClick={() => onRegenerate({ tone: regenTone, length: regenLength })}
          disabled={!onRegenerate}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Regenerate
        </button>
        <select
          value={regenTone}
          onChange={(e) => setRegenTone(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 shadow-sm"
          aria-label="Regenerate tone"
        >
          <option value="formal">Formal</option>
          <option value="casual">Casual</option>
          <option value="persuasive">Persuasive</option>
        </select>
        <select
          value={regenLength}
          onChange={(e) => setRegenLength(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 shadow-sm"
          aria-label="Regenerate length"
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
        <button onClick={handleExportMarkdown} className={actionButtonClasses}>
          Export Markdown
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(content.content)}
          className={actionButtonClasses}
        >
          Copy to Clipboard
        </button>
      </div>

      {showSaveForm && (
        <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Draft title..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button
            onClick={handleSave}
            disabled={!draftTitle.trim()}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            Save
          </button>
          <button
            onClick={() => setShowSaveForm(false)}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default ContentDisplay;
