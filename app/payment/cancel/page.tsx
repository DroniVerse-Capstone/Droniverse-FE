import React from "react";

import PaymentResultCard from "@/components/payment/PaymentResultCard";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-greyscale-950">
      <PaymentResultCard type="cancel" />
    </div>
  );
}
