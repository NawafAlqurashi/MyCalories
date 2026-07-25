import MealForm from "@/components/MealForm";

export default async function NewMealPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const initialMode =
    mode === "voice" || mode === "text" || mode === "manual" ? mode : "photo";

  return <MealForm initialMode={initialMode} />;
}
