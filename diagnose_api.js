const apiKey = "AIzaSyB9KvwOqPB9Vm2QyWDf1fFnAOeUwPJLaUk"; // From user's state
const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

async function diagnose() {
  console.log("Starting Neural Diagnosis for Gemini API...");
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello, system check." }] }]
          })
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Model ${model} is ONLINE and accessible.`);
      } else {
        console.log(`❌ Model ${model} returned error: ${data.error?.message || response.statusText}`);
      }
    } catch (err) {
      console.log(`❌ Failed to reach ${model}: ${err.message}`);
    }
  }
}

diagnose();
