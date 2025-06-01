import type { NextRequest } from "next/server";
import { up } from "@auth/d1-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_: NextRequest) {
  const { env } = await getCloudflareContext();

  // Restrict access: only allow when running in local development.
  if (env.NEXTJS_ENV !== "development") {
    return new Response("Not Found", { status: 404 });
  }

  try {
    await up(env.DB);
  } catch (e: unknown) {
    console.error((e as Error)?.message ?? e);
    return new Response("Migration failed", { status: 500 });
  }

  return new Response("Migration completed");
} 