import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { z } from "zod";

export async function PUT(req: NextRequest, { params }:{ params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();
  const userId = req.cookies.get("user-id")?.value;
  const role = req.cookies.get("role")?.value;
  if (!userId || !role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const buyer = await prisma.buyer.findUnique({ where: { id: Number(id) } });
  if (!buyer) {
    return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
  }
  if (role !== "ADMIN" && String(buyer.creatorId) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const StatusEnum = z.enum(["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]);
  if (!StatusEnum.safeParse(status).success) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }
  await prisma.buyer.update({ where: { id: Number(id) }, data: { status } });
  await prisma.buyerHistory.create({
    data: {
      buyerId: Number(id),
      changedBy: Number(userId),
      diff: { status },
    },
  });
  return NextResponse.json({ success: true });
}
