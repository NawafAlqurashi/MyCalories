import { notFound } from "next/navigation";
import RecipeForm from "@/components/RecipeForm";
import { getRecipe } from "@/lib/models";
import { saveExistingRecipe } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = getRecipe(Number(id));
  if (!recipe) notFound();

  const updateAction = saveExistingRecipe.bind(null, recipe.id);

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">Edit recipe</h1>
      <RecipeForm recipe={recipe} action={updateAction} />
    </div>
  );
}
