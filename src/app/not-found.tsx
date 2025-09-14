"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen" >
      <h1 className="text-2xl">OOPS, seems you are lost :)</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link
        href="/"
        style={{
          marginTop: 20,
          padding: "8px 16px",
          backgroundColor: "#6366F1",
          color: "white",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
