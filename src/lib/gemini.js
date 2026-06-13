export async function generateQuests(apiKey, endgame, current) {
  const prompt = `
You are an expert life-coach AI for a gamified life tracking app.
The user's ultimate "Endgame" goal is: "${endgame}"
Their "Current Position" is: "${current}"

Your task is to break this gap down into actionable quests across three pillars: 'health', 'wealth', and 'relationships'.
Every quest must have a 'type':
- 'main': 1 overarching quest representing the big picture goal.
- 'story': 2-3 milestone quests that serve as stepping stones.
- 'side': 3-5 daily/weekly habit quests to support the journey.

Respond ONLY with a valid JSON array of objects.
Each object MUST have these exact properties:
- "id": a unique string (e.g. "q1", "q2")
- "title": string (short, engaging)
- "desc": string (actionable description)
- "type": string ("main", "story", "side")
- "pillar": string ("health", "wealth", "relationships")
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Fetch the list of available models to help the user debug
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          const availableModels = modelsData.models.map(m => m.name.replace('models/', '')).join(', ');
          throw new Error(`Model not found. Your API key has access to these models: ${availableModels}`);
        }
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Invalid API Key or Rate Limit'}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('AI returned an empty response.');
    }

    const text = data.candidates[0].content.parts[0].text;
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let quests;
    try {
      quests = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON. Raw AI Output:", text);
      throw new Error('AI returned invalid JSON formatting.');
    }
    
    // Add status to each quest
    return quests.map(q => ({ ...q, status: 'active' }));

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error; // Re-throw to be caught by UI
  }
}
