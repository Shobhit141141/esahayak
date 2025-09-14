import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  const { buyers } = await req.json();
  const userId = req.cookies.get("user-id")?.value;
  const role = req.cookies.get("role")?.value;

  if (!Array.isArray(buyers) || buyers.length === 0) {
    return NextResponse.json({ error: "No valid buyers to import" }, { status: 400 });
  }

  // Validate each buyer using Zod
  const { leadFormSchema } = await import("@/utils/leadFormSchema");
  const errors: string[] = [];
  const validBuyers: any[] = [];
  buyers.forEach((buyer: any, idx: number) => {
    const result = leadFormSchema.safeParse(buyer);
    if (!result.success) {
      errors.push(`Row ${idx + 1}: ${result.error.issues.map((e: any) => e.message).join(", ")}`);
    } else {
      validBuyers.push(buyer);
    }
  });

  if (validBuyers.length === 0) {
    return NextResponse.json({ error: "No valid buyers to import", errors }, { status: 400 });
  }

  try {
    await prisma.$transaction(
      validBuyers.map((buyer: any) =>
        prisma.buyer.create({
          data: {
            ...buyer,
            creatorId: Number(userId),
          },
        })
      )
    );
    return NextResponse.json({ success: true, errors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, errors }, { status: 500 });
  }
}
