"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

import { logger } from "@rccyx/logger";

interface CalBookingProps {
  calLink?: string;
  config?: {
    name?: string;
    email?: string;
    notes?: string;
    guests?: string[];
    theme?: "light" | "dark";
  };
}

export function CalBooking({ calLink = "rccyx", config }: CalBookingProps) {
  useEffect(() => {
    void (async function () {
      try {
        const cal = await getCalApi();
        cal("ui", {
          theme: config?.theme ?? "dark",
          styles: { branding: { brandColor: "#6366f1" } },
          hideEventTypeDetails: false,
        });
      } catch (error) {
        logger.error("Failed to initialize Cal API:", error);
      }
    })();
  }, [config?.theme]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Cal
        calLink={calLink}
        style={{ width: "100%", overflow: "hidden" }}
        config={{
          name: config?.name ?? "",
          email: config?.email ?? "",
          notes: config?.notes ?? "",
          guests: config?.guests ?? [],
          layout: "month_view",
          theme: "dark",
        }}
      />
    </div>
  );
}
