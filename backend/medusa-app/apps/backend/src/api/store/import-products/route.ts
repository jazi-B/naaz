import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const container = req.scope;
  const { products } = req.body as any;

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ error: "Missing or invalid products array" });
  }

  try {
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products,
      },
    });

    return res.status(200).json({
      success: true,
      count: result?.length || 0,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
