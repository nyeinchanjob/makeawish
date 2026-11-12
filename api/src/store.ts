import { CosmosClient, type Container } from "@azure/cosmos";
import type { Wish } from "../../shared/wishes";

let client: CosmosClient | undefined;
let containerPromise: Promise<Container> | undefined;

export function getContainer(): Promise<Container> {
  if (!containerPromise) {
    // Defer configuration and provisioning so failures reach the HTTP error boundary.
    containerPromise = initializeContainer().catch((error: unknown) => {
      containerPromise = undefined;
      throw new Error("Cosmos DB initialization failed.", { cause: error });
    });
  }
  return containerPromise;
}

async function initializeContainer(): Promise<Container> {
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  if (!endpoint?.trim() || !key?.trim())
    throw new Error(
      "COSMOS_ENDPOINT and COSMOS_KEY must be configured in Azure Static Web Apps application settings.",
    );
  client ??= new CosmosClient({ endpoint, key });
  const { database } = await client.databases.createIfNotExists({
    id: process.env.COSMOS_DATABASE || "makeawish-db",
  });
  const { container, resource } = await database.containers.createIfNotExists({
    id: process.env.COSMOS_CONTAINER || "wishes",
    partitionKey: { paths: ["/plant"] },
  });
  if (
    resource?.partitionKey &&
    (resource.partitionKey.paths.length !== 1 ||
      resource.partitionKey.paths[0] !== "/plant")
  ) {
    throw new Error("The wishes container must use the /plant partition key.");
  }
  return container;
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
