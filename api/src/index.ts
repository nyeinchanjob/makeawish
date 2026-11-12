import { app } from "@azure/functions";
import {
  clearWishes,
  settings,
  wishById,
  wishes,
  withErrors,
} from "./handlers";

app.http("wishes", {
  route: "wishes",
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: withErrors(wishes),
});
app.http("clearWishes", {
  route: "wishes/all",
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: withErrors(clearWishes),
});
app.http("wishById", {
  route: "wishes/{id}",
  methods: ["PATCH", "DELETE"],
  authLevel: "anonymous",
  handler: withErrors(wishById),
});
app.http("settings", {
  route: "settings",
  methods: ["GET", "PATCH", "PUT"],
  authLevel: "anonymous",
  handler: withErrors(settings),
});
