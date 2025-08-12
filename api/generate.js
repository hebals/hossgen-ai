import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = req.body || {};
    const legacy = [
      "FAILING front crawl because of the following must sees: No overarm recovery (arms not coming out of water), No rhythmic kicking at surface, No regular breathing pattern.",
      "PASSING back crawl because of the following must sees: Weak, needs to kick harder.",
      "FAILING treading water because of the following must sees: Mouth and nose underwater.",
      "Delene was a pleasure to teach this session. When doing front crawl, she is reminded to bring her arms all the way out of the water, to breathe to the side with her ear in the water and to kick harder at the surface. Delene has shown much improvement in her back crawl, however she is encouraged to consistently maintain a stronger kick at the surface. She also needs to practise her treading water so that she can keep her face out of the water for the full 30 seconds. Awesome jumps into the deep end!"
    ];

    const sys = "You are a swim instructor reproducing the tone, cadence, and phrasing of the provided legacy comments. Match sentence length, punctuation, Canadian spelling, and warm, coach-like voice. Keep it concise: 3–5 sentences, ~80–110 words. Avoid bullet points. If ‘advance to next level’ is yes, include one short promotion line; otherwise include 1–2 concrete next steps tied to weaknesses.";
    const examples = legacy.map((s,i)=>`${i+1}. ${s}`).join('\n');
    const user =
      `Student: ${body.name || 'the student'}\n` +
      `Level: ${body.level || 'unspecified level'}\n` +
      `Strengths: ${(body.strengths||[]).join(', ') || '(none)'}\n` +
      `Weaknesses: ${(body.weaknesses||[]).join(', ') || '(none)'}\n` +
      `Advance to next level: ${body.advance ? 'yes' : 'no'}\n\n` +
      `Legacy examples to imitate (do not copy verbatim):\n${examples}\n\n` +
      'Write one comment now in the legacy style. Address the student by first name once.';

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.55,
      max_tokens: 220,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user }
      ]
    });

    const text = completion.choices?.[0]?.message?.content || '';
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
}
