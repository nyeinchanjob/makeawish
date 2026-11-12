import { createFileRoute } from "@tanstack/react-router";
import { Display } from "@/components/Display";

export const Route = createFileRoute("/")({ component: Display });
