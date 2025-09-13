import prisma from "@/lib/prisma";
import { bhkToLabel, mapBHK, mapTimeline, timelineToLabel } from "@/utils/map";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: number | string }> }) {
  const { params } = context;
  const { id } = await params;
  const buyerId = typeof id === "string" ? Number(id) : id;
  if (isNaN(buyerId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const buyer = await prisma.buyer.findUnique({ where: { id: buyerId } });
  const history = await prisma.buyerHistory.findMany({
    where: { buyerId: buyerId },
    orderBy: { changedAt: "desc" },
    take: 5,
    include: { changedByUser: true },
  });

  return NextResponse.json({ buyer, history });
}
export async function PUT(req: NextRequest, context: { params: Promise<{ id: number }> }) {
  const { params } = context;
  const { id } = await params;
  const buyerId = typeof id === "string" ? Number(id) : id;
  const body = await req.json();
  const existing = await prisma.buyer.findUnique({ where: { id: buyerId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (body.updatedAt !== existing.updatedAt.toISOString()) {
    return NextResponse.json({ error: "Record changed, please refresh" }, { status: 409 });
  }
  const diff: Record<string, { old: any; new: any }> = {};
  (Object.keys(body) as Array<keyof typeof existing>).forEach((key) => {
    if (body[key] !== existing[key]) {
      diff[key as string] = { old: existing[key], new: body[key] };
    }
  });
  const buyer = await prisma.buyer.update({
    where: { id: buyerId },
    data: body,
  });
  await prisma.buyerHistory.create({
    data: {
      buyerId: buyerId,
      changedBy: body.ownerId || 1,
      diff,
    },
  });
  const history = await prisma.buyerHistory.findMany({
    where: { buyerId: buyerId },
    orderBy: { changedAt: "desc" },
    take: 5,
    include: { changedByUser: true },
  });
  return NextResponse.json({ buyer, history });
}
