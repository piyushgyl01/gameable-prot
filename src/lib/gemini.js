const GEMINI_MODEL = 'gemini-3.5-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function callGemini(apiKey, prompt) {
  const response = await fetch(`${API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Request failed'}`);
  }

  const data = await response.json();
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('AI returned an empty response.');
  }

  return data.candidates[0].content.parts[0].text;
}

function parseJSON(text) {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse AI JSON:', text);
    throw new Error('AI returned invalid JSON. Please try again.');
  }
}

// --- Onboarding: Generate initial Story Arcs + Side Quests ---

export async function generateOnboardingQuests(apiKey, profileData) {
  const { name, endgame, current, healthNotes, wealthNotes, relationshipsNotes } = profileData;

  const prompt = `You are an expert life-coach AI. A user named "${name || 'User'}" wants to transform their life.

Their ultimate endgame: "${endgame}"
Their current position: "${current}"

Their self-assessment by pillar:
- Health: ${healthNotes || 'No details provided'}
- Wealth: ${wealthNotes || 'No details provided'}
- Relationships: ${relationshipsNotes || 'No details provided'}

Generate a structured quest plan. Return a JSON object with two arrays:

{
  "storyArcs": [
    {
      "title": "string - short arc name",
      "desc": "string - what this arc achieves",
      "pillar": "health" | "wealth" | "relationships",
      "steps": [
        { "title": "string - step name", "desc": "string - concrete action", "done": false }
      ]
    }
  ],
  "sideQuests": [
    {
      "title": "string - short quest name",
      "desc": "string - what to do",
      "pillar": "health" | "wealth" | "relationships",
      "frequency": "daily" | "weekly"
    }
  ]
}

Rules:
- Generate 2-4 Story Arcs. Each arc should have 3-6 ordered steps. Arcs should span weeks to months.
- Generate 3-5 Side Quests. These are recurring habits independent of the main quest.
- Distribute across all three pillars.
- Be specific and actionable, not generic. Base them on the user's actual situation.
- Respond ONLY with the JSON object. No other text.`;

  const text = await callGemini(apiKey, prompt);
  return parseJSON(text);
}

// --- Generate Daily Quests ---

export async function generateDailyQuests(apiKey, context) {
  const { activeArcs, activeSideQuests, recentCompletions, profile } = context;

  const prompt = `You are a life-coaching AI generating today's daily quests for a user.

User's endgame: "${profile.endgame}"
User's level: ${profile.level}

Active Story Arcs:
${activeArcs.map(a => `- "${a.title}" (${a.pillar}): Next step: ${(a.steps.find(s => !s.done) || {}).title || 'All steps complete'}`).join('\n')}

Active Side Quests:
${activeSideQuests.map(q => `- "${q.title}" (${q.pillar}, ${q.frequency})`).join('\n')}

Recent completions (last 7 days): ${recentCompletions.length} quests completed.

Generate 3-7 concrete daily quests for today. Each quest should be completable in a single day.
Some should advance story arc steps, some should be side quest instances, and some can be original.

Return a JSON array:
[
  {
    "title": "string",
    "desc": "string - brief actionable description",
    "pillar": "health" | "wealth" | "relationships",
    "xpReward": number (15-30),
    "sourceArcId": number | null
  }
]

Respond ONLY with the JSON array.`;

  const text = await callGemini(apiKey, prompt);
  return parseJSON(text);
}

// --- Chat with The Architect ---

export async function chatWithArchitect(apiKey, message, context) {
  const { profile, activeArcs, activeSideQuests } = context;

  const prompt = `You are "The Architect" — an AI life-coach entity inside a gamified life app.
You speak in a calm, direct, and slightly wise tone. You're practical, not flowery.

User context:
- Name: ${profile.name || 'User'}
- Level: ${profile.level}
- Endgame: ${profile.endgame}
- Current position: ${profile.current}
- Active story arcs: ${activeArcs.map(a => a.title).join(', ')}
- Active side quests: ${activeSideQuests.map(q => q.title).join(', ')}

The user says: "${message}"

Respond helpfully. If they want to change quests, adjust goals, or report progress, acknowledge it and give practical advice.
Keep responses concise (2-4 sentences). If they ask to modify quests or goals, tell them what you'd recommend changing.`;

  return await callGemini(apiKey, prompt);
}
