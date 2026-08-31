import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const container = req.scope;
  const { ids } = req.body as { ids: string[] };

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Missing or empty ids array" });
  }

  try {
    await deleteProductsWorkflow(container).run({
      input: {
        ids,
      },
    });

    return res.status(200).json({
      success: true,
      deleted_ids: ids,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
