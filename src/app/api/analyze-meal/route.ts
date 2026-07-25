import { NextRequest } from "next/server";
import { estimateNutrition } from "@/lib/nutrition";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const grams = Number(formData.get("grams") ?? 0);
  const description = (formData.get("description") as string | null) ?? undefined;
  const image = formData.get("image") as File | null;

  if (!grams || grams <= 0) {
    return Response.json({ error: "Enter the weight in grams" }, { status: 400 });
  }
  if (!image && !description) {
    return Response.json(
      { error: "Add a photo or describe the meal" },
      { status: 400 }
    );
  }

  let imageBase64: string | undefined;
  let imageMediaType: string | undefined;
  if (image && image.size > 0) {
    const buffer = Buffer.from(await image.arrayBuffer());
    imageBase64 = buffer.toString("base64");
    imageMediaType = image.type || "image/jpeg";
  }

  try {
    const estimate = await estimateNutrition({
      grams,
      imageBase64,
      imageMediaType,
      description,
    });
    return Response.json(estimate);
  } catch (error) {
    console.error("analyze-meal failed", error);
    return Response.json(
      { error: "Could not analyze that meal. Try again or enter macros manually." },
      { status: 500 }
    );
  }
}
