"use client";

import { useState } from "react";
import { DownloadSimple, Check, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  templateId: string;
  downloadUrl: string;
  label?: string;
  size?: "default" | "lg";
}

export function DownloadButton({
  templateId,
  downloadUrl,
  label = "다운로드",
  size = "default",
}: DownloadButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function handleClick() {
    if (state !== "idle") return;

    setState("loading");

    try {
      // Increment download counter
      await fetch(`/api/download/${templateId}`, { method: "POST" }).catch(
        () => {
          // Silently fail counter - don't block download
        }
      );

      // Trigger file download
      if (downloadUrl && downloadUrl !== "#") {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("idle");
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={state === "loading"}
      size={size === "lg" ? "lg" : "default"}
      className="gap-1.5 transition-all active:scale-[0.98]"
    >
      {state === "loading" && (
        <CircleNotch weight="bold" className="size-4 animate-spin" />
      )}
      {state === "done" && <Check weight="bold" className="size-4" />}
      {state === "idle" && (
        <DownloadSimple weight="bold" className="size-4" />
      )}
      <span>{state === "done" ? "완료" : label}</span>
    </Button>
  );
}
