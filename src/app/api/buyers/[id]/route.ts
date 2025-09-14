import {prisma} from "@/lib/prisma";
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

  const createdBy = await prisma.user.findUnique({
    where: { id: buyer?.creatorId },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ buyer, history, createdBy });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { params } = context;
    const { id } = await params;
    const buyerId = Number(id);

    const userId = req.cookies.get("user-id")?.value;
    const role = req.cookies.get("role")?.value;

    console.log("PUT Request by User ID:", userId, "Role:", role);
    if (!userId || !role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(buyerId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }
    const body = await req.json();
    const existing = await prisma.buyer.findUnique({ where: { id: buyerId } });

    if (!existing) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    if (role !== "ADMIN" && String(existing.creatorId) !== String(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.updatedAt !== existing.updatedAt.toISOString()) {
      return NextResponse.json({ error: "This record has been modified by someone else. Please refresh and try again." }, { status: 409 });
    }

    const dataForDb = {
      ...body,
      bhk: mapBHK(body.bhk),
      timeline: mapTimeline(body.timeline),
    };
    delete dataForDb.id;
    delete dataForDb.updatedAt;
    delete dataForDb.createdAt;

    const diff: Record<string, { old: any; new: any }> = {};
    Object.keys(dataForDb).forEach((key) => {
      const typedKey = key as keyof typeof existing;
      if (JSON.stringify(dataForDb[typedKey]) !== JSON.stringify(existing[typedKey])) {
        diff[typedKey] = { old: existing[typedKey], new: dataForDb[typedKey] };
      }
    });

    let updatedBuyer = existing;

    if (Object.keys(diff).length > 0) {
      console.log("Changes detected, updating database:", diff);

      updatedBuyer = await prisma.buyer.update({
        where: { id: buyerId },
        data: dataForDb,
      });

      await prisma.buyerHistory.create({
        data: {
          buyerId: buyerId,
          changedBy: Number(userId),
          diff,
        },
      });
    } else {
      console.log("No changes detected. Skipping database update.");
    }

    const history = await prisma.buyerHistory.findMany({
      where: { buyerId: buyerId },
      orderBy: { changedAt: "desc" },
      take: 5,
      include: { changedByUser: true },
    });

    const clientResponse = mapBuyerToClientFormat(updatedBuyer);

    return NextResponse.json({ buyer: clientResponse, history });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

const mapBuyerToClientFormat = (buyer: any) => {
  if (!buyer) return null;
  return {
    ...buyer,
    bhk: bhkToLabel(buyer.bhk),
    timeline: timelineToLabel(buyer.timeline),
  };
};

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  const { id } = await params;

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

  await prisma.buyerHistory.deleteMany({ where: { buyerId: Number(id) } });
  await prisma.buyer.delete({ where: { id: Number(id) } });

  return NextResponse.json({ success: true });
}
