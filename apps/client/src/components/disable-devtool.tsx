"use client";

import disableDevtool from "disable-devtool";
import { useEffect } from "react";

export function DisableDevtool() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" ||
      window.location.hostname.includes("prohor.dev") ||
      window.location.hostname.includes("vercel.app")
    ) {
      disableDevtool();
    }
  }, []);

  return null;
}
