"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { YoutubeLogo, LinkedinLogo, InstagramLogo } from "@phosphor-icons/react";

interface ProviderRowProps {
  provider: "youtube-shorts" | "linkedin" | "instagram";
  initialDisabled?: boolean;
  initialPublish?: boolean;
  showDownload?: boolean;
  connected?: boolean;
}

const providerLabels: Record<ProviderRowProps["provider"], string> = {
  "youtube-shorts": "YouTube Shorts",
  linkedin: "LinkedIn",
  instagram: "Instagram",
};

const providerIcons: Record<ProviderRowProps["provider"], React.ReactElement> = {
  "youtube-shorts": <YoutubeLogo size={18} weight="fill" className="text-red-600" />,
  linkedin: <LinkedinLogo size={18} weight="fill" className="text-sky-700" />,
  instagram: <InstagramLogo size={18} weight="fill" className="text-pink-500" />,
};

export function ProviderRow({
  provider,
  initialDisabled = true,
  initialPublish = false,
  showDownload = false,
  connected = true,
}: ProviderRowProps) {
  const [disabled, setDisabled] = useState(initialDisabled);
  const [publish, setPublish] = useState(initialPublish);

  if (!connected) {
    return (
      <div className="flex items-center gap-2 py-3">
        {providerIcons[provider]}
        <button
          onClick={() => signIn("linkedin")}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
        >
          {`Connect to ${providerLabels[provider]}`}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b last:border-b-0">
      <div className="flex items-center gap-2">
        {providerIcons[provider]}
        <span className="text-sm font-medium truncate">
          {providerLabels[provider]}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs whitespace-nowrap">
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <span>Disable</span>
          <input
            type="checkbox"
            checked={!disabled}
            onChange={(e) => setDisabled(!e.target.checked)}
            className="appearance-none w-9 h-5 rounded-full bg-gray-300 checked:bg-blue-600 relative transition-colors outline-none focus:ring-2 ring-offset-2 ring-blue-600/50 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-md checked:after:translate-x-4 after:transition-transform"
          />
        </label>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <span>Publish</span>
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="appearance-none w-9 h-5 rounded-full bg-gray-300 checked:bg-blue-600 relative transition-colors outline-none focus:ring-2 ring-offset-2 ring-blue-600/50 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-md checked:after:translate-x-4 after:transition-transform"
          />
        </label>
        {showDownload && (
          <a href="#" className="underline whitespace-nowrap">
            download video
          </a>
        )}
      </div>
    </div>
  );
} 