import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  deleteProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const container = req.scope;
  const query: any = container.resolve(ContainerRegistrationKeys.QUERY);

  try {
    // 1. Fetch existing categories
    const { data: existingCategories } = await query.graph({
      entity: "product_category",
      fields: ["id", "name", "handle"],
    });

    // Delete old clothing categories (Shirts, Sweatshirts, Pants, Merch)
    const demoCatIds = (existingCategories || [])
      .filter((c: any) =>
        ["shirts", "sweatshirts", "pants", "merch"].includes(c.handle?.toLowerCase())
      )
      .map((c: any) => c.id);

    if (demoCatIds.length > 0) {
      try {
        await deleteProductCategoriesWorkflow(container).run({
          input: demoCatIds,
        });
      } catch (e) {
        console.error("Error deleting demo categories:", e);
      }
    }

    // 2. Define Handbag Categories
    const desiredCategories = [
      { name: "Shoulder Bags", handle: "shoulder-bags", rank: 0 },
      { name: "Handbags", handle: "handbags", rank: 1 },
      { name: "Tote Bags", handle: "tote-bags", rank: 2 },
      { name: "Crossbody Bags", handle: "crossbody-bags", rank: 3 },
      { name: "Handbag Sets", handle: "handbag-sets", rank: 4 },
    ];

    const toCreate: any[] = [];
    const remainingHandles = (existingCategories || [])
      .filter((c: any) => !demoCatIds.includes(c.id))
      .map((c: any) => c.handle);

    for (const cat of desiredCategories) {
      if (!remainingHandles.includes(cat.handle)) {
        toCreate.push({
          name: cat.name,
          handle: cat.handle,
          rank: cat.rank,
          is_active: true,
          is_internal: false,
        });
      }
    }

    let createdResult = [];
    if (toCreate.length > 0) {
      const { result } = await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: toCreate,
        },
      });
      createdResult = result;
    }

    return res.status(200).json({
      success: true,
      deleted: demoCatIds,
      created: createdResult,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
