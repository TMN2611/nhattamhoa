import { CheckoutContent } from "@/components/checkout-content";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 pt-28 pb-24">
      <div className="mb-10 text-center">
        <p
          className="text-[10px] tracking-[0.5em] uppercase mb-4"
          style={{ color: "#D4AF37" }}
        >
          Commitment
        </p>
        <h1
          className="text-3xl md:text-4xl font-light font-display"
          style={{ color: "#F5E6C8" }}
        >
          {"Thanh toán & Chứng thư"}
        </h1>
        <div
          className="mx-auto mt-4 h-px w-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, #D4AF37, transparent)",
          }}
        />
      </div>
      <CheckoutContent />
    </div>
  );
}
