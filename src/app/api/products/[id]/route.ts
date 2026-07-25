import { deleteProduct } from "@/lib/models";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteProduct(Number(id));
  return new Response(null, { status: 204 });
}
