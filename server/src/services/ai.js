const OpenAI = require("openai");

let client = null;

function getClient() {
  if (!client && process.env.OPENAI_API_KEY) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

async function estimateDistanceWithAI(addressFrom, addressTo) {
  const ai = getClient();
  if (!ai) return null;

  try {
    const response = await ai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: "You are a Swiss geography expert. Estimate driving distances between Swiss addresses. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: `Estimate the driving distance in kilometers between these two Swiss addresses:\n\nFrom: ${addressFrom}\nTo: ${addressTo}\n\nRespond with this exact JSON:\n{ "km": <number>, "explanation": "<short explanation, e.g. Zürich to Bern via A1>" }`,
        },
      ],
    });

    const content = response.choices[0].message.content.trim();
    const parsed = JSON.parse(content);
    if (parsed.km && typeof parsed.km === "number" && parsed.km > 0) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn("AI distance estimation failed:", err.message);
    return null;
  }
}

async function enrichWithAI(inputData, offerResult) {
  const ai = getClient();
  if (!ai) {
    return fallbackEnrich(inputData, offerResult);
  }

  try {
    const prompt = buildPrompt(inputData, offerResult);
    const response = await ai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You are a professional moving company assistant for Umzugsfirma Zürich. Generate clear, professional task descriptions and a short execution summary for a moving offer. Respond ONLY with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content.trim();
    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.warn("AI enrichment failed, using fallback:", err.message);
    return fallbackEnrich(inputData, offerResult);
  }
}

function buildPrompt(input, offer) {
  return `Generate enhanced task descriptions and an execution summary for this moving job.

Input:
- Service: Moving
- Rooms: ${input.rooms}
- From: ${input.addressFrom}
- To: ${input.addressTo}
- Distance: ${offer.distance.km} km
- Lift available: ${input.hasLift ? "Yes" : "No"}
- Floor: ${input.floor || 0}
- Assembly included: ${input.includeAssembly ? "Yes" : "No"}
- Express service: ${input.expressService ? "Yes" : "No"}
- Heavy items: ${input.heavyItems || 0}

Current tasks:
${offer.tasks.map((t) => `- ${t.name}: ${t.description}`).join("\n")}

Total price: ${offer.totalPrice} ${offer.currency}

Respond with this exact JSON structure:
{
  "enhancedTasks": [
    { "id": <number>, "name": "<string>", "description": "<enhanced description>" }
  ],
  "executionSummary": "<A 2-3 sentence professional summary of how the move will be executed>"
}`;
}

function fallbackEnrich(input, offer) {
  const executionSummary = `Moving service for a ${input.rooms}-room apartment from ${input.addressFrom} to ${input.addressTo} (${offer.distance.km} km). ` +
    `Our team will handle packing, transport${!input.hasLift ? " (manual carrying, no elevator)" : ""}${input.includeAssembly ? ", furniture assembly," : ""} and final cleaning. ` +
    `${input.expressService ? "Express service selected — priority scheduling guaranteed. " : ""}` +
    `Estimated total: ${offer.totalPrice} ${offer.currency}.`;

  return {
    enhancedTasks: offer.tasks.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
    })),
    executionSummary,
  };
}

module.exports = { enrichWithAI, estimateDistanceWithAI };
