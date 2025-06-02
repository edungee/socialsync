import { Navbar } from "../components/Navbar";
import { auth, signIn, signOut } from "./auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { TriggerCard } from "../components/TriggerCard";
import { ProviderRow } from "../components/ProviderRow";

interface ProviderStatus {
  youtube: boolean;
  linkedin: boolean;
}

async function getProviderStatus(userId: string): Promise<ProviderStatus> {
  const { env } = await getCloudflareContext();

  const { results } = await env.DB.prepare(
    "SELECT provider FROM accounts WHERE userId = ?"
  )
    .bind(userId)
    .all<{ provider: string }>();

  const connected = new Set<string>(results.map((r) => r.provider));

  return {
    youtube: connected.has("youtube"),
    linkedin: connected.has("linkedin"),
  };
}

async function getYoutubeChannelInfo(userId: string) {
  const { env } = await getCloudflareContext();
  const { results } = await env.DB.prepare(
    "SELECT access_token FROM accounts WHERE userId = ? AND provider = 'youtube' LIMIT 1"
  )
    .bind(userId)
    .all();

  const token = results?.[0]?.access_token as string | undefined;
  if (!token) return null;

  try {
    const res = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) return null;
    const data = (await res.json()) as unknown as {
      items?: { id: string; snippet: { customUrl?: string } }[];
    };
    const channel = data.items?.[0];
    if (!channel) return null;

    return {
      handle: `youtube.com/@${channel.snippet?.customUrl ?? channel.id}`,
    };
  } catch {
    return null;
  }
}

export default async function Home() {
  const session = await auth();

  let providerStatus: ProviderStatus | null = null;
  let ytMeta: { handle: string } | null = null;

  if (session) {
    providerStatus = await getProviderStatus(session.user!.id ?? "");
    ytMeta = providerStatus.youtube
      ? await getYoutubeChannelInfo(session.user!.id ?? "")
      : null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto p-4 md:p-8">
        {session ? (
          <>
            {/* Top-right logout */}
            <div className="flex justify-end mb-6">
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button className="px-6 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
                  Logout
                </button>
              </form>
            </div>

            {/* Main grid */}
            <div className="grid gap-8 md:grid-cols-2">
              {/* Trigger column */}
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Trigger</h2>
                <TriggerCard
                  connected={providerStatus?.youtube ?? false}
                  channelHandle={ytMeta?.handle}
                />
              </div>

              {/* Action column */}
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Action</h2>
                <div className="border rounded-lg divide-y">
                  <ProviderRow
                    provider="youtube-shorts"
                    showDownload
                    initialDisabled={!providerStatus?.youtube}
                    connected={true}
                  />
                  <ProviderRow
                    provider="linkedin"
                    initialDisabled={!providerStatus?.linkedin}
                    connected={providerStatus?.linkedin ?? false}
                  />
                  <ProviderRow
                    provider="instagram"
                    initialDisabled={true}
                    connected={false}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <button className="px-6 py-3 rounded-md bg-indigo-600 text-white">
                Sign in with Google
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="text-center p-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
        © {new Date().getFullYear()} SocialSync. All rights reserved.
      </footer>
    </div>
  );
}
