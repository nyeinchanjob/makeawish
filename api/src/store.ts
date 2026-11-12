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
  let resource: unknown;
  try {
    ({ resource } = await container.item("app-settings", "SYSTEM").read());
  } catch (error) {
    if (errorCode(error) !== 404) throw error;
  }
  if (
    resource &&
    typeof resource === "object" &&
    "id" in resource &&
    resource.id === "app-settings" &&
    "plant" in resource &&
    resource.plant === "SYSTEM" &&
    "autoApprove" in resource &&
    typeof resource.autoApprove === "boolean"
  ) {
    if (
      !("updatedAt" in resource) ||
      typeof resource.updatedAt !== "string" ||
      Number.isNaN(Date.parse(resource.updatedAt))
    ) {
      // Upgrade legacy metadata without switching a valid disabled toggle back on.
      return writeSettings(container, resource.autoApprove);
    }
    return { autoApprove: resource.autoApprove };
  }
  console.warn(
    "Missing or invalid app-settings document; persisting default Auto-Approve settings.",
  );
  return writeSettings(container, true);
}

export async function writeSettings(
  container: Container,
  autoApprove: boolean,
): Promise<{ autoApprove: boolean }> {
  await container.items.upsert({
    id: "app-settings",
    plant: "SYSTEM",
    autoApprove,
    updatedAt: new Date().toISOString(),
  });
  return { autoApprove };
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
