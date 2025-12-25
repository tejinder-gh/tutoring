"use client";

import { createOrder, verifyPayment } from '@/app/actions/payment';
import { siteConfig } from '@/config/site';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useState } from 'react';

interface CheckoutButtonProps {
  courseId: string;
  courseTitle: string;
  amount: number;
  className?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutButton({ courseId, courseTitle, amount, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create Order
      const order = await createOrder(courseId);

      // 2. Open Razorpay
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: siteConfig.name,
        description: `Enrollment for ${courseTitle}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              courseId
            );
            alert("Payment Successful! You are now enrolled.");
            router.push("/student/learn"); // Redirect to learning dashboard
            router.refresh();
          } catch (err: any) {
            alert(err.message || "Payment verification failed");
          }
        },
        prefill: {
          // Can prefill if we pass user email/phone props
        },
        theme: {
          color: "#3B82F6"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(error.message || "Something went wrong initiating payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${className}`}
      >
        {loading ? <Loader2 className="animate-spin" /> : null}
        {loading ? "Processing..." : `Enroll Now (₹${amount})`}
      </button>
    </>
  );
}
