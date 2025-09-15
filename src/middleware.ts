import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_REQUESTS_PER_IP = 10;
const MAX_REQUESTS_PER_USER = 20;
const WINDOW_SIZE = 60 * 5; 

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  console.log("Request from IP:", ip);

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const [userId, role] = Buffer.from(token, "base64").toString().split(":");

    const ipKey = `ip:${ip}`;
    const userKey = `user:${userId}`;

    const ipRequests = await redis.get(ipKey);
    if (ipRequests && Number(ipRequests) >= MAX_REQUESTS_PER_IP) {
      return NextResponse.json(
        { error: "Too many requests from this IP. Try again later." },
        { status: 429 }
      );
    }

    const userRequests = await redis.get(userKey);
    if (userRequests && Number(userRequests) >= MAX_REQUESTS_PER_USER) {
      return NextResponse.json(
        { error: "Too many requests from this user. Try again later." },
        { status: 429 }
      );
    }
    if (ipRequests) {
      await redis.incr(ipKey);
    } else {
      await redis.set(ipKey, 1, { ex: WINDOW_SIZE });
    }
    if (userRequests) {
      await redis.incr(userKey);
    } else {
      await redis.set(userKey, 1, { ex: WINDOW_SIZE });
    }
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
