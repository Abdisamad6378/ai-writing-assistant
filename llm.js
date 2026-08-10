// server/llm.js
require('dotenv').config({ path: require('path').join(__dirname, 'server', '.env') });
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const DEFAULT_PROVIDER = 'gemini';
const DEFAULT_MODELS = {
    gemini: 'gemini-3.5-flash-lite',
};

async function generateResponse({
  provider = DEFAULT_PROVIDER,
  model,
  system,
  messages,
  temperature = 0.7,
  maxTokens = 1024,
}) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array');
  }

  const selectedProvider = provider || DEFAULT_PROVIDER;
  const selectedModel = model || DEFAULT_MODELS[selectedProvider];

  if (selectedProvider !== 'gemini') {
    throw new Error(`Unsupported provider: ${selectedProvider}`);
  }

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: [{ text: m.content }],
  }));

  const config = {
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    temperature: Math.max(0, Math.min(1, temperature)),
    maxOutputTokens: Math.min(maxTokens, 4096),
  };

  const response = await ai.models.generateContent({
    model: selectedModel,
    contents,
    config,
  });

  const text =
    response.text ||
    (response.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || '')
      .join('')
      .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  return {
    text,
    provider: 'gemini',
    model: selectedModel,
    usage: response.usageMetadata
      ? {
          promptTokens: response.usageMetadata.promptTokenCount,
          completionTokens: response.usageMetadata.candidatesTokenCount,
          totalTokens: response.usageMetadata.totalTokenCount,
        }
      : null,
    finished: response.finishReason || response.candidates?.[0]?.finishReason,
  };
}

module.exports = { generateResponse };
