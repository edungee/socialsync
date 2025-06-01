import { auth, signIn, signOut } from "./auth";
import { TriggerCard } from "../components/TriggerCard";
import { ProviderRow } from "../components/ProviderRow";
import { getCloudflareContext } from "@opennextjs/cloudflare";

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

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-6">
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button
            type="submit"
            className="border rounded px-4 py-2 shadow-sm bg-blue-600 text-white"
          >
            Sign in with Google
          </button>
        </form>
      </main>
    );
  }

  // gather provider status + channel meta
  const providerStatus = await getProviderStatus(session.user!.id ?? "");
  const ytMeta = providerStatus.youtube
    ? await getYoutubeChannelInfo(session.user!.id ?? "")
    : null;

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-8 gap-6">
      {/* Top bar */}
      <header className="flex justify-end">
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="border rounded px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200"
          >
            Logout
          </button>
        </form>
      </header>

      {/* Main grid */}
      <section
        className="grid gap-6 md:gap-12 flex-1 md:grid-cols-2 items-start"
      >
        {/* Trigger column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Trigger</h2>
          <TriggerCard
            connected={providerStatus.youtube}
            channelHandle={ytMeta?.handle}
          />
        </div>

        {/* Action column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Action</h2>
          <div className="border rounded-lg p-4 flex flex-col divide-y">
            <ProviderRow
              provider="youtube-shorts"
              showDownload
              initialDisabled={!providerStatus.youtube}
              connected={true}
            />
            <ProviderRow
              provider="linkedin"
              showDownload={false}
              initialDisabled={!providerStatus.linkedin}
              connected={providerStatus.linkedin}
            />
          </div>
        </div>
      </section>

      {/* bottom email bar */}
      <footer className="mt-auto w-full">
        <div className="border rounded-lg p-4 text-center text-sm bg-gray-50">
          {session.user?.email && (
            <>Send email to: {session.user.email.replace(/(.{3}).*@/, "$1***@gmail.com")}</>
          )}
        </div>
      </footer>
    </main>
  );
}
