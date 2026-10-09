module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { options, profile, preferences, timeAvail, budget, km } = req.body;

    const prompt = `You are GreenRoute AI, a sustainable trip planner.
Your job: pick the MOST SUSTAINABLE option the user will REALISTICALLY take, not just the greenest one.

Trip distance: ${km} km
User time available: ${timeAvail} minutes
User budget: Rs ${budget}
User preferences: ${preferences || "none stated"}
What we've learned about this user from past Accept/Reject choices: ${JSON.stringify(profile)}

Options (time in minutes, cost in rupees, co2 in kg, all rough estimates):
${JSON.stringify(options)}

Rules:
- Strongly consider comfort, effort, weather, and the stated preferences.
- If the greenest option is unrealistic for this user, pick a more realistic one and say why.
- Also suggest one short compromise (for example: take the bus, then walk the last 800 m).

Return ONLY JSON with exactly these keys:
{"recommended_mode": string (one of the option names), "realism_score": number 0-100, "reason": string (max 2 sentences), "compromise": string (max 1 sentence)}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await r.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: "No AI answer", details: data });
    }

    res.status(200).json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};