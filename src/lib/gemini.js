// --- Gemini API Layer ---
// One request per call. No hidden retries. Global queue prevents concurrent requests.

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash']; // fallback chain
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Global request queue — only 1 request at a time to avoid burning quota
let requestInFlight = false;
const requestQueue = [];

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      requestInFlight = true;
      try {
        resolve(await fn());
      } catch (err) {
        reject(err);
      } finally {
        requestInFlight = false;
        if (requestQueue.length > 0) {
          requestQueue.shift()();
        }
      }
    };
    if (requestInFlight) {
      requestQueue.push(run);
    } else {
      run();
    }
  });
}

async function callGemini(apiKey, prompt) {
  return enqueue(async () => {
    // Try each model in the fallback chain
    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      let response;
      try {
        response = await fetch(`${API_BASE}/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 },
          }),
          signal: controller.signal,
        });
      } catch (fetchErr) {
        clearTimeout(timeout);
        if (fetchErr.name === 'AbortError') {
          throw new Error('Request timed out. Check your connection and try again.');
        }
        throw new Error('Network error. Check your connection.');
      }
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('AI returned an empty response. Try again.');
        }
        return data.candidates[0].content.parts[0].text;
      }

      // On 429: try next model in fallback chain instead of retrying same one
      if (response.status === 429 && i < MODELS.length - 1) {
        console.warn(`${model} rate limited, falling back to ${MODELS[i + 1]}`);
        continue;
      }

      // All models exhausted or non-429 error
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || 'Request failed';

      if (response.status === 429) {
        // Parse wait time for user-friendly message
        const match = msg.match(/retry in ([\d.]+)s/i);
        const waitSec = match ? Math.ceil(parseFloat(match[1])) : 60;
        throw new Error(`Rate limited. Wait ${waitSec}s and try again.`);
      }

      throw new Error(`API Error ${response.status}: ${msg}`);
    }
  });
}

function parseJSON(text) {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse AI JSON:', text);
    throw new Error('AI returned invalid data. Please try again.');
  }
}

// --- Onboarding: Generate initial Story Arcs + Side Quests ---

export async function generateOnboardingQuests(apiKey, profileData) {
  const { name, endgame, current, healthNotes, wealthNotes, relationshipsNotes } = profileData;

  const prompt = `A user wants to build better habits and reach their goals. Create a practical action plan for them.

Name: ${name || 'User'}
Where they are now: "${current || 'Not specified'}"
Where they want to be: "${endgame || 'Not specified'}"

Their breakdown by area:
- Health: ${healthNotes || 'Not specified'}
- Wealth: ${wealthNotes || 'Not specified'}
- Relationships: ${relationshipsNotes || 'Not specified'}

Return a JSON object with:

{
  "storyArcs": [
    {
      "title": "short name",
      "desc": "one line on what this achieves",
      "pillar": "health" | "wealth" | "relationships",
      "steps": [
        { "title": "step name", "desc": "what to actually do", "done": false }
      ]
    }
  ],
  "sideQuests": [
    {
      "title": "short name",
      "desc": "what to do",
      "pillar": "health" | "wealth" | "relationships",
      "frequency": "daily" | "weekly"
    }
  ]
}

Rules:
- 2-4 story arcs with 3-6 steps each. These are multi-week projects, not vague aspirations.
- 3-5 side quests. These are small recurring habits (e.g. "30 min walk", "read 20 pages", "message a friend").
- Cover all three pillars.
- Be specific to their situation. No generic self-help fluff.
- Keep titles short (3-5 words). Keep descriptions to one sentence.
- Respond ONLY with the JSON. No commentary.`;

  const text = await callGemini(apiKey, prompt);
  return parseJSON(text);
}

// --- Generate Daily Quests ---

export async function generateDailyQuests(apiKey, context) {
  const { activeArcs, activeSideQuests, recentCompletions, profile } = context;

  const prompt = `Generate today's tasks for a user working on their goals.

Goal: "${profile.endgame}"
Level: ${profile.level}

Their active projects:
${activeArcs.map(a => `- "${a.title}" (${a.pillar}): Next step: ${(a.steps.find(s => !s.done) || {}).title || 'All steps complete'}`).join('\n')}

Their recurring habits:
${activeSideQuests.map(q => `- "${q.title}" (${q.pillar}, ${q.frequency})`).join('\n')}

Completed ${recentCompletions.length} tasks in the last 7 days.

Generate 4-6 concrete tasks for today. Mix of:
- Progress on active projects (advancing a specific step)
- Recurring habit instances
- One or two fresh tasks that fit their goals

Return a JSON array:
[
  {
    "title": "short task name",
    "desc": "one line on what to do",
    "pillar": "health" | "wealth" | "relationships",
    "xpReward": number (15-30),
    "sourceArcId": null
  }
]

Keep it practical. No motivational fluff. Respond ONLY with the JSON array.`;

  const text = await callGemini(apiKey, prompt);
  return parseJSON(text);
}

// --- Chat with The Architect ---

export async function chatWithArchitect(apiKey, message, context) {
  const { profile, activeArcs, activeSideQuests, chatHistory } = context;

  const prompt = `You are "The Architect" — an AI life-coach entity inside a gamified life app.
You speak in a calm, direct, and slightly wise tone. You're practical, not flowery.

User context:
- Name: ${profile.name || 'User'}
- Level: ${profile.level}
- Endgame: ${profile.endgame}
- Current position: ${profile.current}
- Active story arcs: ${activeArcs.map(a => a.title).join(', ')}
- Active side quests: ${activeSideQuests.map(q => q.title).join(', ')}

Recent conversation history:
${chatHistory && chatHistory.length > 0 ? chatHistory.map(m => `${m.role === 'user' ? 'User' : 'Architect'}: ${m.content}`).join('\n') : 'No recent history.'}

The user says: "${message}"

Respond helpfully. If they want to change quests, adjust goals, or report progress, acknowledge it and give practical advice.
Keep responses concise (2-4 sentences). If they ask to modify quests or goals, tell them what you'd recommend changing.`;

  return await callGemini(apiKey, prompt);
}

// --- Automatic Story Arc Generation ---

export async function generateNextStoryArc(apiKey, context) {
  const { profile, completedArc } = context;

  const prompt = `You are "The Architect" — an AI life-coach inside a gamified life app.
The user just completed a story arc! 

User: ${profile.name || 'User'} (Level ${profile.level})
Endgame: ${profile.endgame}

Recently completed arc:
"${completedArc.title}" (${completedArc.pillar})
Description: ${completedArc.desc || 'N/A'}

Generate the logical NEXT story arc to continue their progression in the "${completedArc.pillar}" pillar towards their endgame.
Make it a bit more challenging or a natural evolution from what they just finished.

Return ONLY a JSON object:
{
  "title": "string - epic name for the arc",
  "desc": "string - 1 sentence summary",
  "pillar": "${completedArc.pillar}",
  "steps": [
    { "title": "string", "desc": "string", "done": false }
  ]
}

The steps array should have 3-5 concrete, actionable milestones. Respond ONLY with the JSON object.`;

  const text = await callGemini(apiKey, prompt);
  return parseJSON(text);
}

// --- Weekly Recalibration ---

export async function recalibrateWeekly(apiKey, context) {
  const { profile, activeArcs, activeSideQuests, weeklyStats } = context;

  const prompt = `You are "The Architect" — an AI life-coach inside a gamified life app.

User: ${profile.name || 'User'} (Level ${profile.level})
Endgame: ${profile.endgame}

Weekly performance summary:
- Daily quests completed this week: ${weeklyStats.dailyCompleted}
- Story arc steps completed: ${weeklyStats.storyCompleted}
- Side quests completed: ${weeklyStats.sideCompleted}
- Most active pillar: ${weeklyStats.topPillar || 'none'}
- Least active pillar: ${weeklyStats.weakPillar || 'none'}
- Current streak: ${weeklyStats.streak} days

Active story arcs: ${activeArcs.map(a => `"${a.title}" (${a.pillar}, ${a.steps?.filter(s => s.done).length}/${a.steps?.length} steps)`).join(', ')}

Based on this week's performance, write a brief weekly recap (2-3 sentences) and suggest adjustments. Be direct and practical.

Return JSON:
{
  "recap": "string - brief weekly summary",
  "suggestion": "string - what to focus on next week",
  "focusPillar": "health" | "wealth" | "relationships"
}

Respond ONLY with the JSON object.`;

  const text = await callGemini(apiKey, prompt);
  return parseJSON(text);
}
