import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const WINDOW_SIZE = 60; 
const MAX_REQUESTS = 10;

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  console.log("Request from IP:", ip);
  try {
    const requests = await redis.get(ip);

    if (requests && Number(requests) >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    if (requests) {
      await redis.incr(ip);
    } else {
      await redis.set(ip, 1, { ex: WINDOW_SIZE }); 
    }

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const [userId, role] = Buffer.from(token, "base64").toString().split(":");
    const response = NextResponse.next();
    response.cookies.set("user-id", userId, { path: "/" });
    response.cookies.set("role", role, { path: "/" });

    return response;
  } catch (error) {
    console.error("Middleware Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const config = {
  matcher: ["/api/buyers/:path*", "/api/users/create"],
};
