const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.generateNote = async (req, res) => {
  try {
    const { prompt, mood } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const systemPrompt = `You are a thoughtful journaling assistant. The user will share a feeling, mood, or thought with you. Turn it into a short, reflective, well-written journal-style note in their voice — warm, honest, not overly poetic or clinical. Keep it to 2-4 short paragraphs. Do not add a title, greeting, or sign-off — just the note content itself.`;

    const userPrompt = mood
      ? `Mood: ${mood}\n\nWhat's on my mind: ${prompt}`
      : prompt;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    res.status(200).json({ content: generatedContent });
  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ message: 'AI generation failed', error: err.message });
  }
};