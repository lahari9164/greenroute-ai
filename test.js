const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`;

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Say hello in one short sentence." }] }]
  })
})
  .then(r => r.json())
  .then(d => console.log(d.candidates?.[0]?.content?.parts?.[0]?.text ?? d));