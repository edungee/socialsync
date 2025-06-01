"use client";

import Link from "next/link";

interface TriggerCardProps {
  connected: boolean;
  channelHandle?: string; // e.g. youtube.com/@edunge
  latestVideoUrl?: string;
  latestVideoDate?: string; // formatted string
}

export function TriggerCard({
  connected,
  channelHandle,
  latestVideoUrl,
  latestVideoDate,
}: TriggerCardProps) {
  if (!connected) {
    return (
      <div className="border rounded-lg p-6 flex flex-col items-center justify-center gap-4 w-full h-full min-h-[220px]">
        <Link
          href="/api/auth/signin?provider=youtube"
          className="px-4 py-2 border rounded text-sm bg-blue-600 text-white"
        >
          Connect your YouTube
        </Link>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2 text-sm">
        <span className="w-3 h-3 rounded-full bg-blue-600" />
        <span className="font-medium truncate">
          {channelHandle ?? "youtube.com/"}
        </span>
      </div>

      {latestVideoUrl && (
        <div className="text-xs space-y-1 break-words">
          <p className="font-semibold">Latest video:</p>
          <Link
            href={latestVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {latestVideoUrl}
          </Link>
          {latestVideoDate && (
            <p className="text-muted-foreground mt-1">{latestVideoDate}</p>
          )}
        </div>
      )}
    </div>
  );
} 