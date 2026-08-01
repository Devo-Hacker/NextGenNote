const Groq = require('groq-sdk');
const CodeSnippet = require('../models/CodeSnippet');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Fixed language list — keeps detection/translation a classification task
// instead of open-ended generation, which is faster, cheaper, and far more
// reliable than letting the model invent arbitrary language names.
const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css', 'plaintext',
];

exports.getSupportedLanguages = (req, res) => {
  res.status(200).json(SUPPORTED_LANGUAGES);
};

// ---------- CRUD ----------

exports.createSnippet = async (req, res) => {
  try {
    const snippet = await CodeSnippet.create({
      userId: req.userId,
      title: req.body.title || 'Untitled Snippet',
      code: req.body.code || '',
      language: req.body.language || 'plaintext',
    });
    res.status(201).json(snippet);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSnippets = async (req, res) => {
  try {
    const snippets = await CodeSnippet.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.status(200).json(snippets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSnippetById = async (req, res) => {
  try {
    const snippet = await CodeSnippet.findOne({ _id: req.params.id, userId: req.userId });
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    res.status(200).json(snippet);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSnippet = async (req, res) => {
  try {
    const { title, code, language } = req.body;
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (code !== undefined) updateFields.code = code;
    if (language !== undefined) updateFields.language = language;

    const snippet = await CodeSnippet.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateFields,
      { new: true }
    );
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    res.status(200).json(snippet);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteSnippet = async (req, res) => {
  try {
    const snippet = await CodeSnippet.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    res.status(200).json({ message: 'Snippet deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ---------- AI: language detection ----------

exports.detectLanguage = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(200).json({ language: 'plaintext' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You classify source code into exactly one of these language identifiers: ${SUPPORTED_LANGUAGES.join(', ')}. Respond with ONLY the identifier, nothing else, no punctuation, no explanation.`,
        },
        { role: 'user', content: code.slice(0, 3000) },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const raw = (completion.choices[0]?.message?.content || 'plaintext').trim().toLowerCase();
    const language = SUPPORTED_LANGUAGES.includes(raw) ? raw : 'plaintext';

    res.status(200).json({ language });
  } catch (err) {
    console.error('Language detection error:', err);
    res.status(500).json({ message: 'Detection failed', error: err.message });
  }
};

// ---------- AI: translate to another language ----------

exports.translateCode = async (req, res) => {
  try {
    const { code, fromLanguage, toLanguage } = req.body;
    if (!code || !toLanguage) {
      return res.status(400).json({ message: 'code and toLanguage are required' });
    }
    if (!SUPPORTED_LANGUAGES.includes(toLanguage)) {
      return res.status(400).json({ message: 'Unsupported target language' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a precise code translator. Translate the given ${fromLanguage || 'source'} code into idiomatic ${toLanguage}, preserving behavior exactly. Respond with ONLY the translated code, no explanation, no markdown code fences, no commentary.`,
        },
        { role: 'user', content: code.slice(0, 4000) },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    let translated = completion.choices[0]?.message?.content || '';
    // strip accidental markdown fences if the model adds them anyway
    translated = translated.replace(/^```[\w]*\n?/, '').replace(/```$/, '').trim();

    res.status(200).json({ code: translated, language: toLanguage });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ message: 'Translation failed', error: err.message });
  }
};

// ---------- AI: diagram from code (Mermaid flowchart) ----------

exports.generateDiagram = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'code is required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You convert source code into a Mermaid.js flowchart diagram describing its control flow (branches, loops, function calls, return points). Respond with ONLY valid Mermaid flowchart syntax starting with "flowchart TD", no markdown fences, no explanation.`,
        },
        { role: 'user', content: `Language: ${language || 'unknown'}\n\nCode:\n${code.slice(0, 3000)}` },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    let mermaid = completion.choices[0]?.message?.content || '';
    mermaid = mermaid.replace(/^```[\w]*\n?/, '').replace(/```$/, '').trim();

    res.status(200).json({ diagram: mermaid });
  } catch (err) {
    console.error('Diagram generation error:', err);
    res.status(500).json({ message: 'Diagram generation failed', error: err.message });
  }
};