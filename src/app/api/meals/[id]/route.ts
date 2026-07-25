import { deleteMeal } from "@/lib/models";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteMeal(Number(id));
  return new Response(null, { status: 204 });
}
