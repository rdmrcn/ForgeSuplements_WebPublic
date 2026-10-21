import { NextResponse } from "next/server";
import { createDemoOrder } from "@/server/orders";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32_000;

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ code: "invalid_request", message: "Request too large." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ code: "invalid_request", message: "Invalid JSON." }, { status: 400 });
  }

  const result = await createDemoOrder(payload);
  if (!result.ok) {
    return NextResponse.json(
      {
        code: result.code,
        message: result.message,
        fieldErrors: result.fieldErrors,
        serverTotalCents: result.serverTotalCents,
      },
      { status: result.status },
    );
  }

  return NextResponse.json({ id: result.order.id, paymentStatus: result.order.paymentStatus }, { status: 201 });
}
