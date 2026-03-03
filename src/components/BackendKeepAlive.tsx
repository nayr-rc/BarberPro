"use client";

import { useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://barberpro-api-v4kj.onrender.com/v1";
const HEALTH_URL = `${API_BASE_URL.replace(/\/$/, "")}/health`;
const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;

export default function BackendKeepAlive() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const pingBackend = async () => {
      try {
        await fetch(HEALTH_URL, {
          method: "GET",
          cache: "no-store",
        });
      } catch {
        // Intencionalmente silencioso para não afetar UX
      }
    };

    void pingBackend();
    const intervalId = window.setInterval(() => {
      void pingBackend();
    }, KEEP_ALIVE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}
