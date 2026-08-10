// client/src/components/GenerateForm.jsx
import { useState } from 'react';

function GenerateForm({ onGenerate, isLoading }) {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [tone, setTone] = useState('casual');
  const [length, setLength] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic, contentType, tone, length });
  };

  const inputClasses =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200';
  const labelClasses = 'mb-1.5 block text-sm font-medium text-slate-700';

  return (
    <form
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      onSubmit={handleSubmit}
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Create New Content
      </h2>

      <div className="mb-4">
        <label htmlFor="topic" className={labelClasses}>
          Topic or Brief
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Benefits of mobile banking for small businesses in Kenya"
          rows={3}
          required
          className={inputClasses}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="contentType" className={labelClasses}>
            Content Type
          </label>
          <select
            id="contentType"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className={inputClasses}
          >
            <option value="blog">Blog Post</option>
            <option value="email">Email</option>
            <option value="social">Social Media Post</option>
            <option value="academic">Academic Paper</option>
          </select>
        </div>

        <div>
          <label htmlFor="tone" className={labelClasses}>
            Tone
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className={inputClasses}
          >
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="persuasive">Persuasive</option>
          </select>
        </div>

        <div>
          <label htmlFor="length" className={labelClasses}>
            Length
          </label>
          <select
            id="length"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className={inputClasses}
          >
            <option value="short">Short (150-250 words)</option>
            <option value="medium">Medium (400-600 words)</option>
            <option value="long">Long (800-1200 words)</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !topic.trim()}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
      >
        {isLoading ? 'Generating...' : 'Generate Content'}
      </button>
    </form>
  );
}

export default GenerateForm;
