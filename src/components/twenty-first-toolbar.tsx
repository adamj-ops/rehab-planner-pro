"use client";

import { TwentyFirstToolbar } from "@21st-extension/toolbar-next";
import { ReactPlugin } from "@21st-extension/react";
import { useEffect, useState } from "react";

export function DevToolbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <TwentyFirstToolbar config={{ plugins: [ReactPlugin()] }} />;
}

