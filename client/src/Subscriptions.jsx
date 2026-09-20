import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getSubscriptions, createSubscription, chargeSubscription, deleteSubscription } from "./api/subscriptions";
import "./Subscriptions.css";

const SUB_COLORS = {
  entertainment: { bg: "#f0e8fe", accent: "#8b5cf6", emoji: "🎬" },
  productivity: { bg: "#e8f0fe", accent: "#5b7fff", emoji: "⚙️" },
  health: { bg: "#e8fef0", accent: "#34c77b", emoji: "💊" },
  music: { bg: "#ffe8f5", accent: "#ec407a", emoji: "🎵" },
  other: { bg: "#f0f0f0", accent: "#888", emoji: "📦" },
};

const CATEGORIES = ["entertainment", "productivity", "health", "music", "other"];

export default function Subscriptions({ onExpensesUpdated, onSubscriptionsUpdated }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "entertainment",
    billingCycle: "monthly"
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await getSubscriptions();
      setSubscriptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || form.name.trim().length === 0) {
      alert("Subscription name is required");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    try {
      await createSubscription({ ...form, amount: Number(form.amount) });
      setForm({ name: "", amount: "", category: "entertainment", billingCycle: "monthly" });
      setShowForm(false);
      fetchSubscriptions();
      if (onSubscriptionsUpdated) onSubscriptionsUpdated();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create subscription");
    }
  };

  const handleCharge = async (id) => {
    try {
      await chargeSubscription(id);
      toast.success("Charged successfully!");
      fetchSubscriptions();
      if (onExpensesUpdated) onExpensesUpdated();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to charge");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this subscription?")) {
      try {
        await deleteSubscription(id);
        toast.success("Subscription deleted!");
        fetchSubscriptions();
        if (onExpensesUpdated) onExpensesUpdated();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.error || "Failed to delete");
      }
    }
  };

  return (
    <div className="subscriptions-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <button
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
          style={{ marginBottom: "20px" }}>
          {showForm ? "✕ cancel" : "+ add subscription"}
        </button>
      </motion.div>

      {showForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}>
          <div className="form-title">new subscription</div>
          <form onSubmit={handleSubmit} className="form-grid">
            <input
              type="text"
              placeholder="Subscription name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Amount (₹)"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              required
            />
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{SUB_COLORS[c]?.emoji || "📦"} {c}</option>
              ))}
            </select>
            <select
              value={form.billingCycle}
              onChange={e => setForm({...form, billingCycle: e.target.value})}>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
            <motion.button type="submit" className="add-btn form-grid-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              add subscription
            </motion.button>
          </form>
        </motion.div>
      )}

      {subscriptions.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#aaa",
          fontSize: "14px"
        }}>
          no subscriptions yet
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {subscriptions.map(sub => {
            const color = SUB_COLORS[sub.category?.toLowerCase()] || SUB_COLORS.other;
            const thisMonth = new Date().toISOString().slice(0, 7);
            const isPaidThisMonth = sub.paidMonths?.includes(thisMonth);

            return (
              <motion.div
                key={sub._id}
                className="card"
                style={{ borderLeft: `4px solid ${color.accent}` }}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#2d2a35" }}>
                      {color.emoji} {sub.name}
                    </div>
                    <div style={{ fontSize: "14px", color: "#aaa", marginTop: "6px" }}>
                      ₹{Number(sub.amount).toLocaleString("en-IN")} / {sub.billingCycle}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: isPaidThisMonth ? "#34c77b" : "#f5a623",
                      marginTop: "6px",
                      fontWeight: "500"
                    }}>
                      {isPaidThisMonth ? "✓ Paid this month" : "Not charged yet"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {!isPaidThisMonth && (
                      <motion.button
                        onClick={() => handleCharge(sub._id)}
                        style={{
                          background: color.accent,
                          color: "#fff",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "500"
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        Charge
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleDelete(sub._id)}
                      style={{
                        background: "#f0ece4",
                        color: "#d45ba1",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500"
                      }}
                      whileHover={{ scale: 1.05, color: "#e05252" }}
                      whileTap={{ scale: 0.95 }}>
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}