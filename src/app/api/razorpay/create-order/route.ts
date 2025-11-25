import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_SECRET!,
  });

  const { amount, currency } = await request.json();

  const options = {
    amount,
    currency,
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
