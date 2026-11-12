import { CosmosClient, type Container } from "@azure/cosmos";
import type { Wish } from "../../shared/wishes";

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client =
  endpoint && key ? new CosmosClient({ endpoint, key }) : undefined;

export function getContainer(): Container {
  if (!client)
    throw new Error("COSMOS_ENDPOINT and COSMOS_KEY must be configured.");
  return client
    .database(process.env.COSMOS_DATABASE || "makeawish-db")
    .container(process.env.COSMOS_CONTAINER || "wishes");
}

export function errorCode(error: unknown): number | undefined {
  if (error && typeof error === "object" && "code" in error)
    return Number(error.code);
  return undefined;
}

export async function readSettings(
  container: Container,
): Promise<{ autoApprove: boolean }> {
  try {
    const { resource } = await container
      .item("app-settings", "SYSTEM")
      .read<{ autoApprove: boolean }>();
    if (!resource || typeof resource.autoApprove !== "boolean") {
      throw new Error("The app-settings document is invalid.");
    }
    return { autoApprove: resource.autoApprove };
  } catch (error) {
    if (errorCode(error) !== 404) throw error;
    try {
      await container.items.create({
        id: "app-settings",
        plant: "SYSTEM",
        autoApprove: true,
      });
      return { autoApprove: true };
    } catch (createError) {
      // Another invocation may have created or updated the singleton first.
      if (errorCode(createError) === 409) return readSettings(container);
      throw createError;
    }
  }
}

export function fullWish(wish: Wish): Wish {
  return {
    id: wish.id,
    employee_name: wish.employee_name,
    email: wish.email,
    plant: wish.plant,
    message: wish.message,
    status: wish.status,
    created_on: wish.created_on,
  };
}
