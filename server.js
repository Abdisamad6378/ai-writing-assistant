// server/server.js
require('dotenv').config({ path: require('path').join(__dirname, 'server', '.env') });
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { generateResponse } = require('./llm');
const { getSystemPrompt, buildGenerationPrompt, LENGTH_CONFIG } = require('./prompts');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
const drafts = new Map();
const conversations = new Map();

const now = () => new Date().toISOString();

const insertDraft = (id, title, content, contentType, tone, topic, provider, model, tokensUsed) => {
  drafts.set(id, {
    id,
    title,
    content,
    content_type: contentType,
    tone,
    topic,
    provider,
    model,
    tokens_used: tokensUsed,
    created_at: now(),
    updated_at: now(),
  });
};

const getDrafts = () =>
  [...drafts.values()].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

const getDraftById = (id) => drafts.get(id) || null;

const updateDraft = (content, id) => {
  const draft = drafts.get(id);
  if (!draft) return;
  draft.content = content;
  draft.updated_at = now();
};

const deleteDraft = (id) => drafts.delete(id);

const insertConversation = (id, draftId) => conversations.set(id, []);

const insertMessage = (conversationId, role, content) => {
  if (!conversations.has(conversationId)) conversations.set(conversationId, []);
  conversations.get(conversationId).push({ role, content });
};

const getConversationMessages = (conversationId) => conversations.get(conversationId) || [];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Generate content
app.post('/api/generate', async (req, res) => {
  try {
    const {
      topic,
      contentType = 'blog',
      tone = 'casual',
      length = 'medium',
      provider,
    } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const validTypes = ['blog', 'email', 'social', 'academic'];
    if (!validTypes.includes(contentType)) {
      return res.status(400).json({
        error: `Invalid content type. Use: ${validTypes.join(', ')}`,
      });
    }

    const validTones = ['formal', 'casual', 'persuasive'];
    if (!validTones.includes(tone)) {
      return res.status(400).json({
        error: `Invalid tone. Use: ${validTones.join(', ')}`,
      });
    }

    const validLengths = ['short', 'medium', 'long'];
    if (!validLengths.includes(length)) {
      return res.status(400).json({
        error: `Invalid length. Use: ${validLengths.join(', ')}`,
      });
    }

    const systemPrompt = getSystemPrompt(contentType, tone);
    const userPrompt = buildGenerationPrompt(topic, contentType, tone, length);
    const lengthConfig = LENGTH_CONFIG[length];

    const response = await generateResponse({
      provider,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
      maxTokens: lengthConfig.maxTokens,
    });

    // Create a conversation for this generation
    const conversationId = uuidv4();
    insertConversation(conversationId, null);
    insertMessage(conversationId, 'user', userPrompt);
    insertMessage(conversationId, 'assistant', response.text);

    res.json({
      content: response.text,
      conversationId,
      provider: response.provider,
      model: response.model,
      usage: response.usage,
      finished: response.finished,
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate content. Please try again.' });
  }
});

// Continue conversation (refine content)
app.post('/api/chat', async (req, res) => {
  try {
    const { conversationId, message, provider } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({
        error: 'conversationId and message are required.',
      });
    }

    // Get existing conversation messages
    const history = getConversationMessages(conversationId);

    if (history.length === 0) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // Add the new user message
    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await generateResponse({
      provider,
      system: 'You are a professional content writer. The user is refining content you previously generated. Help them improve it based on their feedback. When they ask for changes, return the complete updated content, not just the changes.',
      messages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Save the new messages to the conversation
    insertMessage(conversationId, 'user', message);
    insertMessage(conversationId, 'assistant', response.text);

    res.json({
      content: response.text,
      conversationId,
      provider: response.provider,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message. Please try again.' });
  }
});

// Save draft
app.post('/api/drafts', (req, res) => {
  try {
    const { title, content, contentType, tone, topic, provider, model, tokensUsed } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const id = uuidv4();
    insertDraft(
      id,
      title,
      content,
      contentType || 'blog',
      tone || 'casual',
      topic || '',
      provider || null,
      model || null,
      tokensUsed || 0
    );

    res.status(201).json({
      id,
      message: 'Draft saved successfully.',
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save draft.' });
  }
});

// Get all drafts
app.get('/api/drafts', (req, res) => {
  try {
    res.json({ drafts: getDrafts() });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch drafts.' });
  }
});

// Get single draft
app.get('/api/drafts/:id', (req, res) => {
  try {
    const draft = getDraftById(req.params.id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found.' });
    }
    res.json({ draft });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch draft.' });
  }
});

// Update draft content
app.patch('/api/drafts/:id', (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    const draft = getDraftById(req.params.id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found.' });
    }

    updateDraft(content, req.params.id);
    res.json({ message: 'Draft updated successfully.' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update draft.' });
  }
});

// Delete draft
app.delete('/api/drafts/:id', (req, res) => {
  try {
    const draft = getDraftById(req.params.id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found.' });
    }

    deleteDraft(req.params.id);
    res.json({ message: 'Draft deleted successfully.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete draft.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Writing Assistant API running on http://localhost:${PORT}`);
});
