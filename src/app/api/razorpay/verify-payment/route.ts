import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const {
    order_id,
    payment_id,
    signature,
    plan,
    user_id,
  } = await request.json();

  const body = order_id + "|" + payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === signature;

  if (isAuthentic) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ plan })
      .eq("id", user_id);

    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }
}
