import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "./lib/prisma";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path === "/api/users/create") {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("Bootstrap mode: no users exist, allowing account creation without token");
      return NextResponse.next();
    }
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  try {
    const [userId, role] = Buffer.from(token, "base64").toString().split(":");

    const response = NextResponse.next();
    response.cookies.set("user-id", userId, { path: "/" });
    response.cookies.set("role", role, { path: "/" });

    return response;
  } catch (error) {
    console.error("Middleware Error:", error);
    return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
  }
}

export const config = {
  matcher: ["/api/buyers/:path*", "/api/users/create"],
};
