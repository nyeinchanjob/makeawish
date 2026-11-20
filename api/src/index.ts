import { app } from "@azure/functions";
import { forbidden } from "./handlers";

app.http("wishes", {
  route: "wishes",
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: forbidden,
});
app.http("clearWishes", {
  route: "wishes/all",
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: forbidden,
});
app.http("wishById", {
  route: "wishes/{id}",
  methods: ["PATCH", "DELETE"],
  authLevel: "anonymous",
  handler: forbidden,
});
app.http("settings", {
  route: "settings",
  methods: ["GET", "PATCH", "PUT"],
  authLevel: "anonymous",
  handler: forbidden,
});
