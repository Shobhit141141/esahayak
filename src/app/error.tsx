"use client";

import { Button } from "@mantine/core";
import { useEffect } from "react";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 w-full md:max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-center">{error.message}</p>
      <Button className="mt-4" onClick={() => reset()} variant="filled" color="red">
        Try Again
      </Button>
    </div>
  );
}
