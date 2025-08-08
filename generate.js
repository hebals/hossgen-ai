import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variable
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Legacy comments extracted from your Swim for Life sample file to anchor the AI's tone
// These examples should not be copied verbatim; they provide style guidance.
const LEGACY_STYLE_EXAMPLES = [
  "FAILING front crawl because of the following must sees: No overarm recovery (arms not coming out of water), No rhythmic kicking at surface, No regular breathing pattern.",
  "PASSING back crawl because of the following must sees: Weak, needs to kick harder.",
  "FAILING treading water because of the following must sees: Mouth and nose underwater.",
  "Delene was a pleasure to teach this session. When doing front crawl, she is reminded to bring her arms all the way out of the water, to breathe to the side with her ear in the water and to kick harder at the surface. Delene has shown much improvement in her back crawl, however she is encouraged to consistently maintain a stronger kick at the surface. She also needs to practise her treading water so that she can keep her face out of the water for the full 30 seconds. Awesome jumps into the deep end!",
  "Alex worked hard this session and showed good improvement in his flutter kick during back crawl. He is encouraged to keep his hips up and maintain a steady kick to help with body position. In front crawl, Alex should focus on a full arm recovery and turning his head to breathe. Great effort in treading water today!",
  "Samantha has demonstrated consistent improvement in her swimming skills this session. She is reminded to extend her arms fully during front crawl and keep her legs straight while kicking. Back crawl is becoming smoother, but she needs to watch her hand entry. Keep practising your surface dives, Samantha!",
  "Marcus enjoyed his time in the pool and made progress in his endurance. He is encouraged to practise bilateral breathing in front crawl to improve balance. His back crawl is steady, but maintaining a faster kick will help. Well done in completing the endurance swim, Marcus!",
  "Isabella showed great enthusiasm throughout the session. She should focus on a higher elbow recovery in front crawl and keeping her head still during back crawl. Continued practise with whip kick timing will help her breaststroke. Fantastic effort in all skills, Isabella!",
  "Nathan displayed strong effort in improving his swimming. He needs to work on consistent breathing in front crawl and keeping his legs close together during the kick. His back crawl arm movements are improving, but maintaining rhythm will help further. Great work on your dives, Nathan!"
];

/**
 * Build system and user prompts from client inputs.
 * @param {Object} inputs - form data from the front end
 * @returns {Object} system and user prompt strings
 */
function promptFromInputs(inputs) {
  const sysPrompt = 'You are a swim instructor reproducing the tone, cadence, and phrasing of the provided legacy comments. Match their sentence length, punctuation, Canadian spelling, and warm, coach-like voice. Keep it concise: 3–5 sentences, around 80–110 words. Avoid bullet points.';
  const examples = LEGACY_STYLE_EXAMPLES.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const styleBlock = 'Legacy examples to imitate (do not copy verbatim):\n' + examples;

  const userPrompt = [
    `Student: ${inputs.name || 'the student'}`,
    `Level: ${inputs.level || 'unspecified level'}`,
    `Strengths: ${(inputs.strengths && inputs.strengths.length ? inputs.strengths.join(', ') : '(none)')}`,
    `Weaknesses: ${(inputs.weaknesses && inputs.weaknesses.length ? inputs.weaknesses.join(', ') : '(none)')}`,
    `Advance to next level: ${inputs.advance ? 'yes' : 'no'}`,
    '',
    styleBlock,
    '',
    'Write one comment now in the legacy style. Address the student by first name once.'
  ].join('\n');

  return { sys: sysPrompt, user: userPrompt };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { sys, user } = promptFromInputs(req.body || {});
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      temperature: 0.55,
      max_output_tokens: 200,
      input: [
        { role: 'system', content: sys },
        { role: 'user', content: user }
      ]
    });
    res.status(200).json({ text: response.output_text || '' });
  } catch (err) {
    res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
}