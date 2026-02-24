const OpenAI = require("openai");

let client = null;

function getClient() {
  if (!client && process.env.OPENAI_API_KEY) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

/**
 * Single AI call that estimates distance AND enriches task descriptions.
 * Returns { distanceKm, enhancedTasks, executionSummary } or null on failure.
 */
async function generateOfferWithAI(inputData, offerResult) {
  const ai = getClient();
  if (!ai) return null;

  try {
    const prompt = buildCombinedPrompt(inputData, offerResult);
    const response = await ai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content:
            "You are a professional moving company assistant for Umzugsfirma Zürich with expert knowledge of Swiss geography. Respond ONLY with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content.trim();
    const parsed = JSON.parse(content);

    // Validate distance
    if (!parsed.distanceKm || typeof parsed.distanceKm !== "number" || parsed.distanceKm <= 0) {
      parsed.distanceKm = null;
    }

    return parsed;
  } catch (err) {
    console.warn("AI offer generation failed:", err.message);
    return null;
  }
}

function buildCombinedPrompt(input, offer) {
  return `You have two jobs for this moving offer:

1. Estimate the driving distance in km between the two Swiss addresses.
2. Generate enhanced task descriptions and an execution summary.

Moving details:
- Rooms: ${input.rooms}
- From: ${input.addressFrom}
- To: ${input.addressTo}
- Lift available: ${input.hasLift ? "Yes" : "No"}
- Floor: ${input.floor || 0}
- Assembly included: ${input.includeAssembly ? "Yes" : "No"}
- Express service: ${input.expressService ? "Yes" : "No"}
- Heavy items: ${input.heavyItems || 0}

Current tasks:
${offer.tasks.map((t) => `- ${t.name} (id: ${t.id}): ${t.description}`).join("\n")}

Total price: ${offer.totalPrice} ${offer.currency}

Respond with this exact JSON structure:
{
  "distanceKm": <number>,
  "distanceExplanation": "<short explanation, e.g. Zürich to Bern via A1>",
  "enhancedTasks": [
    { "id": <number>, "name": "<string>", "description": "<enhanced description>" }
  ],
  "executionSummary": "<A 2-3 sentence professional summary of how the move will be executed>"
}`;
}

function fallbackEnrich(input, offer) {
  const executionSummary = `Moving service for a ${input.rooms}-room apartment from ${input.addressFrom} to ${input.addressTo} (${offer.distance.km} km). ` +
    `Our team will handle packing, transport${!input.hasLift ? " (manual carrying, no elevator)" : ""}${input.includeAssembly ? " and furniture assembly" : ""}. ` +
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

module.exports = { generateOfferWithAI, fallbackEnrich };
