import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createRegionsWorkflow,
  updateRegionsWorkflow,
  createSalesChannelsWorkflow,
  createApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const container = req.scope;
  const query: any = container.resolve(ContainerRegistrationKeys.QUERY);

  try {
    // 1. Ensure Region with PK country
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "name", "currency_code", "countries.iso_2"],
    });

    let pkRegion: any = regions?.find((r: any) => r.currency_code === "pkr" || r.name === "Pakistan");

    if (!pkRegion) {
      const { result: newRegions } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Pakistan",
              currency_code: "pkr",
              countries: ["pk"],
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      });
      pkRegion = newRegions?.[0];
    } else {
      // Update existing region to ensure 'pk' country is assigned
      await updateRegionsWorkflow(container).run({
        input: {
          selector: { id: pkRegion.id },
          update: {
            countries: ["pk"],
          },
        },
      });
    }

    // 2. Ensure Sales Channel
    const { data: salesChannels } = await query.graph({
      entity: "sales_channel",
      fields: ["id", "name"],
    });

    let salesChannel: any = salesChannels?.[0];
    if (!salesChannel) {
      const { result: newChannels } = await createSalesChannelsWorkflow(container).run({
        input: {
          salesChannelsData: [{ name: "Default Sales Channel" }],
        },
      });
      salesChannel = newChannels?.[0];
    }

    // 3. Ensure Publishable API Key
    const { data: apiKeys } = await query.graph({
      entity: "api_key",
      fields: ["id", "token", "type"],
    });

    let publishableKey: any = apiKeys?.find((k: any) => k.type === "publishable");
    if (!publishableKey) {
      const { result: newKeys } = await createApiKeysWorkflow(container).run({
        input: {
          api_keys: [
            {
              title: "Storefront Key",
              type: "publishable",
              created_by: "system",
            },
          ],
        },
      });
      publishableKey = newKeys?.[0];
    }

    if (publishableKey?.id && salesChannel?.id) {
      try {
        await linkSalesChannelsToApiKeyWorkflow(container).run({
          input: {
            id: publishableKey.id,
            add: [salesChannel.id],
          },
        });
      } catch (e) {
        // already linked
      }
    }

    return res.status(200).json({
      success: true,
      region: pkRegion,
      salesChannel,
      publishableKey: publishableKey?.token,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
