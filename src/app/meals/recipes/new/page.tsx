import RecipeForm from "@/components/RecipeForm";
import { saveNewRecipe } from "../actions";

export default function NewRecipePage() {
  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">New recipe</h1>
      <RecipeForm action={saveNewRecipe} />
    </div>
  );
}
