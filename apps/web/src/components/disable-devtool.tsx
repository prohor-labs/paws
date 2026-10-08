"use client";

import { useEffect } from "react";
import disableDevtool from "disable-devtool";

export function DisableDevtool() {
  useEffect(() => {
    disableDevtool();
  }, []);

  return null;
}
