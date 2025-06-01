"use client";

import { signIn } from "next-auth/react";

interface ConnectCardProps {
  provider: "youtube" | "linkedin";
  connected: boolean;
  accountName?: string;
}

const providerMeta = {
  youtube: {
    label: "YouTube",
    bg: "bg-red-600",
  },
  linkedin: {
    label: "LinkedIn",
    bg: "bg-blue-700",
  },
};

export function ConnectCard({ provider, connected, accountName }: ConnectCardProps) {
  const meta = providerMeta[provider];
  return (
    <div className="border rounded-lg p-4 flex flex-col gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <span className={`${meta.bg} w-3 h-3 rounded-full`}></span>
        <h3 className="font-semibold text-lg">{meta.label}</h3>
      </div>

      {connected ? (
        <>
          <p className="text-sm text-muted-foreground">Connected as {accountName}</p>
          <div className="flex gap-2">
            <form action={`/api/oauth/unlink/${provider}`} method="post">
              <button className="text-xs px-3 py-1 border rounded">Unlink</button>
            </form>
          </div>
        </>
      ) : (
        <button
          onClick={() => signIn(provider === 'youtube' ? 'google-youtube' : provider)}
          className="px-4 py-2 bg-blue-600 text-white rounded text-center text-sm"
        >
          Connect
        </button>
      )}
    </div>
  );
} 