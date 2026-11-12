import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/submit")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
