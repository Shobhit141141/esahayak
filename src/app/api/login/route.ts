import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const token = Buffer.from(`${user.id}:${user.role}`).toString("base64");
  const response = NextResponse.json({ token });
  response.cookies.set("username", user.name, { path: "/" });
  response.cookies.set("role", user.role, { path: "/" });
  return response;
}
