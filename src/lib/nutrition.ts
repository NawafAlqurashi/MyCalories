import Anthropic from "@anthropic-ai/sdk";

export interface NutritionEstimate {
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mock: boolean;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text;
}

// Rough per-100g fallback profile so the app is fully usable end-to-end
// before an ANTHROPIC_API_KEY is configured.
function mockEstimate(grams: number, description?: string): NutritionEstimate {
  const per100g = { calories: 165, protein: 12, carbs: 18, fat: 5 };
  const ratio = grams / 100;
  return {
    foodName: description?.trim()
      ? `${description.trim()} (demo estimate)`
      : "Sample meal (demo estimate)",
    grams,
    calories: Math.round(per100g.calories * ratio),
    protein: Math.round(per100g.protein * ratio * 10) / 10,
    carbs: Math.round(per100g.carbs * ratio * 10) / 10,
    fat: Math.round(per100g.fat * ratio * 10) / 10,
    mock: true,
  };
}

export async function estimateNutrition(params: {
  grams: number;
  imageBase64?: string;
  imageMediaType?: string;
  description?: string;
}): Promise<NutritionEstimate> {
  const { grams, imageBase64, imageMediaType, description } = params;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return mockEstimate(grams, description);
  }

  const client = new Anthropic({ apiKey });
  const content: Anthropic.Messages.ContentBlockParam[] = [];

  if (imageBase64 && imageMediaType) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imageMediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        data: imageBase64,
      },
    });
  }

  content.push({
    type: "text",
    text: [
      "You are a nutrition estimation assistant for a meal-tracking app.",
      description
        ? `The food is described as: "${description}".`
        : "Identify the food shown in the photo (it may be a plate of food or a nutrition label).",
      `Estimate its nutrition for exactly ${grams} grams total.`,
      "Respond with ONLY a raw JSON object (no markdown fences, no commentary) matching exactly:",
      '{"foodName": string, "calories": number, "protein": number, "carbs": number, "fat": number}',
      "calories is in kcal; protein, carbs, fat are in grams. All values already scaled for the given gram amount.",
    ].join(" "),
  });

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 500,
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.Messages.TextBlock => block.type === "text"
  );
  const parsed = JSON.parse(extractJson(textBlock?.text ?? "{}"));

  return {
    grams,
    mock: false,
    foodName: String(parsed.foodName ?? "Unknown meal"),
    calories: Number(parsed.calories ?? 0),
    protein: Number(parsed.protein ?? 0),
    carbs: Number(parsed.carbs ?? 0),
    fat: Number(parsed.fat ?? 0),
  };
}
