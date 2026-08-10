// client/src/components/DraftList.jsx
import { useState, useEffect } from 'react';

function DraftList() {
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/drafts');
      const data = await response.json();
      setDrafts(data.drafts);
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      await fetch(`http://localhost:3001/api/drafts/${id}`, { method: 'DELETE' });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      if (selectedDraft?.id === id) setSelectedDraft(null);
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Saved Drafts ({drafts.length})
        </h2>
        {drafts.length === 0 ? (
          <p className="text-sm text-slate-500">
            No drafts saved yet. Generate some content and save it.
          </p>
        ) : (
          <ul className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
            {drafts.map((draft) => (
              <li
                key={draft.id}
                onClick={() => setSelectedDraft(draft)}
                className={`group cursor-pointer rounded-xl border p-3 transition-colors ${
                  selectedDraft?.id === draft.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-slate-900">
                      {draft.title}
                    </strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      {draft.content_type} | {draft.tone} |{' '}
                      {new Date(draft.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(draft.id);
                    }}
                    className="shrink-0 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-3">
        {selectedDraft ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedDraft.title}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                {selectedDraft.content_type}
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                {selectedDraft.tone}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {selectedDraft.provider || 'N/A'}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {selectedDraft.tokens_used} tokens
              </span>
            </div>
            <pre className="mt-4 max-h-[28rem] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800">
              {selectedDraft.content}
            </pre>
          </>
        ) : (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
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
            <p className="text-sm text-slate-500">Select a draft to preview it.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DraftList;
