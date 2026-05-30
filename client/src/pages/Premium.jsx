import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import PlanCard from "../components/premium/PlanCard";
import PremiumBadge from "../components/premium/PremiumBadge";
import PremiumModal from "../components/premium/PremiumModal";
import { setPremiumStatus } from "../redux/slices/premiumSlice";
import { api } from "../services/api";

const Premium = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.premium.status);
  const [plans, setPlans] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState("");
  
  // Sandbox checkout states
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [fakeCard, setFakeCard] = useState({
    number: "4242 •••• •••• 4242",
    expiry: "12/29",
    cvc: "123",
    name: "Guest Explorer"
  });

  const loadStatus = async () => {
    const [{ data: plansData }, { data: statusData }] = await Promise.all([
      api.get("/premium/plans"),
      api.get("/premium/status"),
    ]);
    setPlans(plansData);
    dispatch(setPremiumStatus(statusData));
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const subscribe = async (plan) => {
    setLoadingPlan(plan);
    try {
      const { data } = await api.post("/premium/create-order", { plan, currency: "INR", gateway: "razorpay" });
      setCheckoutOrder(data); // Open high-fidelity sandbox modal
    } catch (err) {
      alert("Failed to initialize checkout. Please try again.");
    } finally {
      setLoadingPlan("");
    }
  };

  const completeSandboxPurchase = async () => {
    if (!checkoutOrder) return;
    setProcessingPayment(true);
    try {
      await api.post("/premium/webhook", {
        orderId: checkoutOrder.orderId,
        paymentId: `sandbox_pay_${Date.now()}`,
        status: "success",
      });
      setCheckoutOrder(null);
      await loadStatus();
    } catch (err) {
      alert("Sandbox payment confirmation failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const cancel = async () => {
    await api.post("/premium/cancel");
    await loadStatus();
  };

  if (!plans) return <div className="card" style={{ padding: "2rem", textAlign: "center" }}>Loading plans...</div>;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PremiumModal />
      <section className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.25rem" }}>PeekPost Premium</h3>
          <p style={{ margin: "0.3rem 0 0", color: "var(--tcl-muted)" }}>
            Remove feed, story, reel, and explore ads.
          </p>
        </div>
        <PremiumBadge enabled={status.isPremium} />
      </section>

      <div className="grid-2">
        <PlanCard
          title="Monthly"
          price={`INR ${(plans.monthly.inr / 100).toFixed(2)}`}
          actionLabel={loadingPlan === "monthly" ? "Processing..." : "Subscribe Monthly"}
          disabled={loadingPlan === "monthly" || status.isPremium}
          onAction={() => subscribe("monthly")}
        />
        <PlanCard
          title="Yearly"
          price={`INR ${(plans.yearly.inr / 100).toFixed(2)}`}
          actionLabel={loadingPlan === "yearly" ? "Processing..." : "Subscribe Yearly"}
          disabled={loadingPlan === "yearly" || status.isPremium}
          onAction={() => subscribe("yearly")}
        />
      </div>

      {status.isPremium && (
        <section className="card" style={{ display: "grid", gap: "0.75rem", padding: "1.5rem" }}>
          <p style={{ margin: 0 }}>
            Active plan: <strong style={{ color: "var(--tcl-blue)", textTransform: "capitalize" }}>{status.premiumPlan}</strong>
          </p>
          <p style={{ margin: 0 }}>
            Expires: <strong>{new Date(status.premiumExpiry).toLocaleDateString()}</strong>
          </p>
          <button className="btn-ghost" type="button" onClick={cancel} style={{ width: "max-content", marginTop: "0.5rem" }}>
            Cancel subscription
          </button>
        </section>
      )}

      {/* ── Secure Sandbox Checkout Overlay ── */}
      {checkoutOrder && (
        <div className="ig-overlay" onClick={() => setCheckoutOrder(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "grid", placeItems: "center" }}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: "min(440px, 94vw)", padding: "2rem", display: "grid", gap: "1.5rem", borderRadius: "var(--tcl-radius-lg)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.25rem" }}>🛡️</span>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Secure Sandbox Checkout</h3>
              </div>
              <button onClick={() => setCheckoutOrder(null)} style={{ fontSize: "1.5rem", opacity: 0.5, cursor: "pointer", lineheight: 1 }}>✕</button>
            </div>

            {/* Order Details */}
            <div style={{ background: "var(--tcl-bg)", padding: "1rem", borderRadius: "var(--tcl-radius-sm)", display: "grid", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--tcl-muted)" }}>Plan:</span>
                <strong style={{ textTransform: "capitalize" }}>{checkoutOrder.plan} Subscription</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--tcl-muted)" }}>Amount Due:</span>
                <strong style={{ color: "var(--tcl-blue)", fontSize: "1.1rem" }}>{checkoutOrder.currency} {(checkoutOrder.amount / 100).toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--tcl-muted)" }}>
                <span>Order ID:</span>
                <span style={{ fontFamily: "monospace" }}>{checkoutOrder.orderId.slice(0, 16)}...</span>
              </div>
            </div>

            {/* Sandbox Notice Alert */}
            <div style={{ borderLeft: "4px solid #f59e0b", background: "rgba(245, 158, 11, 0.08)", padding: "0.75rem", borderRadius: "4px", fontSize: "0.85rem", color: "#d97706" }}>
              ⚠️ <strong>Developer Sandbox:</strong> Simulated credentials are prefilled below. No actual money will be charged.
            </div>

            {/* Mock Credit Card Form */}
            <form onSubmit={(e) => { e.preventDefault(); completeSandboxPurchase(); }} style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "grid", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--tcl-muted)" }}>CARDHOLDER NAME</label>
                <input className="ig-input" type="text" value={fakeCard.name} onChange={(e) => setFakeCard({...fakeCard, name: e.target.value})} required />
              </div>
              
              <div style={{ display: "grid", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--tcl-muted)" }}>CARD NUMBER</label>
                <input className="ig-input" type="text" value={fakeCard.number} disabled style={{ letterSpacing: "1px", opacity: 0.8 }} />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ display: "grid", gap: "0.3rem", flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--tcl-muted)" }}>EXPIRY</label>
                  <input className="ig-input" type="text" value={fakeCard.expiry} disabled style={{ textAlign: "center", opacity: 0.8 }} />
                </div>
                <div style={{ display: "grid", gap: "0.3rem", flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--tcl-muted)" }}>CVC</label>
                  <input className="ig-input" type="text" value={fakeCard.cvc} disabled style={{ textAlign: "center", opacity: 0.8 }} />
                </div>
              </div>

              {/* Submit Button */}
              <button className="ig-btn-primary" type="submit" disabled={processingPayment} style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem", borderRadius: "var(--tcl-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {processingPayment ? (
                  <>⏳ Processing Sandbox Auth...</>
                ) : (
                  <>🔒 Complete Secure Purchase</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;