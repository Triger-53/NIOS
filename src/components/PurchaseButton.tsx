"use client";

import { useRouter } from "next/navigation";

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface PurchaseButtonProps {
  plan: "advanced" | "premium";
  amount: number;
  userId: string;
}

export default function PurchaseButton({
  plan,
  amount,
  userId,
}: PurchaseButtonProps) {
  const router = useRouter();

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const orderResponse = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        currency: "INR",
      }),
    });

    const orderData = await orderResponse.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "NIOS Learning Platform",
      description: `Purchase ${plan} plan`,
      order_id: orderData.id,
      handler: async function (response: RazorpaySuccessResponse) {
        const verifyResponse = await fetch("/api/razorpay/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            plan,
            user_id: userId,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          router.push(plan === "advanced" ? "/advance-notes" : "/premium");
        } else {
          alert("Payment verification failed. Please contact support.");
        }
      },
      prefill: {
        name: "Test User",
        email: "test.user@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "Test Address",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Buy {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
    </button>
  );
}
