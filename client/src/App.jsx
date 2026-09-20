import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Login from "./Login";
import Subscriptions from "./Subscriptions";
import { getExpenses, createExpense, deleteExpense, updateExpense } from "./api/expenses";
import { getSubscriptions } from "./api/subscriptions";
import { API_URL } from "./utils/auth";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line
} from "recharts";
import "./App.css";

const CATEGORIES = ["food","transport","shopping","health","entertainment","music","bills","other"];

const CAT_COLORS = {
  food:          { bg: "#fef3e8", accent: "#f5a623", emoji: "🍛" },
  transport:     { bg: "#e8f0fe", accent: "#5b7fff", emoji: "🚌" },
  shopping:      { bg: "#fde8f5", accent: "#d45ba1", emoji: "🛍️" },
  health:        { bg: "#e8fef0", accent: "#34c77b", emoji: "💊" },
  entertainment: { bg: "#f0e8fe", accent: "#8b5cf6", emoji: "🎬" },
  music:         { bg: "#ffe8f5", accent: "#ec407a", emoji: "🎵" },
  bills:         { bg: "#fff0e8", accent: "#f57c42", emoji: "💡" },
  other:         { bg: "#f0f0f0", accent: "#888",    emoji: "📦" },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const formVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expenses");
  
  const [expenses, setExpenses]   = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [income, setIncome]       = useState(() => {
    const saved = localStorage.getItem("userIncome");
    return saved ? Number(saved) : 42000;
  });
  const [editingIncome, setEditingIncome] = useState(false);
  const [form, setForm] = useState({
    title: "", amount: "", category: "food", note: "", date: ""
  });
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    localStorage.setItem("userIncome", income.toString());
  }, [income]);

  const checkLoginStatus = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-api-xrxj.onrender.com';
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username);
        setIsLoggedIn(true);
        fetchExpenses();
        fetchSubscriptions();
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUsername');
      }
    } catch (err) {
      console.log('Not logged in');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-api-xrxj.onrender.com';
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUsername');
      setIsLoggedIn(false);
      setUsername("");
      setExpenses([]);
      setSubscriptions([]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await getSubscriptions();
      setSubscriptions(res.data);
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || form.title.trim().length === 0) {
      alert("Title is required");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }
    if (!form.category) {
      alert("Category is required");
      return;
    }
    
    try {
      if (editingId) {
        await updateExpense(editingId, { ...form, amount: Number(form.amount) });
        setEditingId(null);
      } else {
        await createExpense({ ...form, amount: Number(form.amount) });
      }
      setForm({ title: "", amount: "", category: "food", note: "", date: "" });
      setShowForm(false);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("Failed to save expense. Please try again.");
    }
  };

  const handleEdit = (exp) => {
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      note: exp.note,
      date: exp.date ? exp.date.split("T")[0] : ""
    });
    setEditingId(exp._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this expense?")) {
      try {
        await deleteExpense(id);
        fetchExpenses();
        fetchSubscriptions();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setForm({ title: "", amount: "", category: "food", note: "", date: "" });
    setEditingId(null);
    setShowForm(false);
  };

  let filtered = expenses;

  if (filterCategory !== "all") {
    filtered = filtered.filter(e => e.category === filterCategory);
  }

  if (searchText) {
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(searchText.toLowerCase()) ||
      e.note.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  if (dateFrom) {
    filtered = filtered.filter(e => {
      const expDate = e.date ? new Date(e.date) : new Date(0);
      return expDate >= new Date(dateFrom);
    });
  }

  if (dateTo) {
    filtered = filtered.filter(e => {
      const expDate = e.date ? new Date(e.date) : new Date();
      return expDate <= new Date(dateTo);
    });
  }

  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date || 0) - new Date(a.date || 0);
      case "oldest":
        return new Date(a.date || 0) - new Date(b.date || 0);
      case "highest":
        return b.amount - a.amount;
      case "lowest":
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const exportToCSV = () => {
    const headers = ["Title", "Amount", "Category", "Date", "Note"];
    const rows = filtered.map(e => [
      e.title,
      e.amount,
      e.category,
      e.date ? new Date(e.date).toLocaleDateString("en-IN") : "",
      e.note
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toLocaleDateString("en-IN")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalExpense = expenses.reduce((a, e) => a + e.amount, 0);
  const balance      = income - totalExpense;
  const budgetPct    = Math.min(100, Math.round((totalExpense / income) * 100));

  const now   = new Date();
  const month = MONTHS[now.getMonth()];
  const year  = now.getFullYear();

  const catTotals = CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((a, e) => a + e.amount, 0),
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const monthStr = MONTHS[d.getMonth()];
    const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const spent = expenses
      .filter(e => e.date && e.date.startsWith(monthYear))
      .reduce((a, e) => a + e.amount, 0);
    monthlyData.push({ month: monthStr, spent: spent || 0 });
  }

  const dayTotals = {};
  expenses.forEach(e => {
    const day = e.date ? e.date.split("T")[0] : "unknown";
    dayTotals[day] = (dayTotals[day] || 0) + e.amount;
  });
  const topDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
  const topDayAmount = topDay ? topDay[1] : 0;
  const topDayFormatted = topDay
    ? new Date(topDay[0]).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        weekday: "short"
      })
    : "—";

  const highestCat = catTotals[0];
  const highestPct = totalExpense > 0
    ? Math.round((highestCat?.value / totalExpense) * 100)
    : 0;

  const avgExpense = expenses.length > 0
    ? Math.round(totalExpense / expenses.length)
    : 0;

  const barChartData = catTotals.map(d => ({
    name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
    amount: d.value,
    fullName: d.name
  }));

  if (loading) {
    return (
      <div style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        minHeight:'100vh',
        fontSize: '18px',
        color: '#888'
      }}>
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={(username) => {
      setUsername(username || localStorage.getItem('authUsername') || '');
      setIsLoggedIn(true);
      fetchExpenses();
      fetchSubscriptions();
    }} />;
  }

  return (
    <div className="page">

      <motion.div className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div>
          <div className="page-title">{month} {year}</div>
          <div className="page-sub">expense overview for {username}</div>
        </div>
        <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
          <button
            onClick={() => setActiveTab("expenses")}
            style={{background: activeTab === "expenses" ? "#8b5cf6" : "#f0ece4",
              color: activeTab === "expenses" ? "#fff" : "#2d2a35",
              border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
              fontWeight: 500, fontSize: '13px', fontFamily: 'inherit'}}>
            Expenses
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            style={{background: activeTab === "subscriptions" ? "#8b5cf6" : "#f0ece4",
              color: activeTab === "subscriptions" ? "#fff" : "#2d2a35",
              border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
              fontWeight: 500, fontSize: '13px', fontFamily: 'inherit'}}>
            Subscriptions
          </button>
          {activeTab === "expenses" && (
            <motion.button className="add-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!editingId) {
                  setShowForm(!showForm);
                }
              }}>
              {showForm ? "✕ cancel" : "+ add expense"}
            </motion.button>
          )}
          <motion.button className="add-btn" style={{background: '#e05252'}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}>
            logout
          </motion.button>
        </div>
      </motion.div>

      {/* EXPENSES TAB */}
      {activeTab === "expenses" && (
        <>

          {showForm && (
            <motion.div className="form-card"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit">
              <div className="form-title">{editingId ? "edit expense" : "new expense"}</div>
              <form onSubmit={handleSubmit} className="form-grid">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  required
                />
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount (₹)"
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  required
                />
                <select
                  name="category"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{CAT_COLORS[c]?.emoji || "📦"} {c}</option>
                  ))}
                </select>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                />
                <textarea
                  name="note"
                  placeholder="Note (optional)"
                  value={form.note}
                  onChange={e => setForm({...form, note: e.target.value})}
                  className="form-grid-full"
                  style={{minHeight: "60px", resize: "none"}}
                />
                <motion.button type="submit" className="add-btn form-grid-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}>
                  {editingId ? "update expense" : "save expense"}
                </motion.button>
                {editingId && (
                  <motion.button type="button" onClick={handleCancel}
                    className="add-btn form-grid-full"
                    style={{background: "#ccc", color: "#333"}}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    cancel edit
                  </motion.button>
                )}
              </form>
            </motion.div>
          )}

          <motion.div className="stats-row"
            variants={containerVariants}
            initial="hidden"
            animate="visible">
            <motion.div className="card stat-card stat-income" variants={itemVariants}>
              <div className="stat-label">total income</div>
              {editingIncome ? (
                <input
                  style={{background: "transparent", border: "none",
                    borderBottom: "1.5px solid #5b7fff", outline: "none", width: "100%",
                    color: "#5b7fff", fontFamily: "inherit", padding: 0, fontSize: "24px", fontWeight: 600}}
                  type="number"
                  value={income}
                  onChange={e => setIncome(Number(e.target.value) || 0)}
                  onBlur={() => setEditingIncome(false)}
                  onKeyDown={e => {
                    if (e.key === "Enter") setEditingIncome(false);
                    if (e.key === "Escape") setEditingIncome(false);
                  }}
                  onFocus={e => {
                    e.currentTarget.select();
                    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
                  }}
                  autoFocus
                />
              ) : (
                <motion.div className="stat-val color-income" style={{cursor: "pointer"}}
                  onClick={() => setEditingIncome(true)}
                  whileHover={{ scale: 1.05 }}>
                  ₹{income.toLocaleString("en-IN")}
                </motion.div>
              )}
            </motion.div>
            <motion.div className="card stat-card stat-expense" variants={itemVariants}>
              <div className="stat-label">total expense</div>
              <motion.div className="stat-val color-expense"
                key={totalExpense}>
                ₹{totalExpense.toLocaleString("en-IN")}
              </motion.div>
            </motion.div>
            <motion.div className="card stat-card stat-balance" variants={itemVariants}>
              <div className="stat-label">balance left</div>
              <motion.div className={`stat-val ${balance >= 0 ? 'color-balance-positive' : 'color-balance-negative'}`}
                key={balance}>
                ₹{balance.toLocaleString("en-IN")}
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="insight-row"
            variants={containerVariants}
            initial="hidden"
            animate="visible">
            <motion.div className="insight-card" variants={itemVariants}>
              <div className="insight-label">highest category</div>
              <div style={{display:"flex", alignItems:"center", gap:10, marginTop:8}}>
                <motion.div style={{fontSize:28}} whileHover={{scale: 1.2}}>
                  {highestCat ? CAT_COLORS[highestCat.name]?.emoji || "📦" : "—"}
                </motion.div>
                <div>
                  <div style={{fontSize:16, fontWeight:600, color:"#2d2a35"}}>
                    {highestCat?.name ?? "—"}
                  </div>
                  <div style={{fontSize:12, color:"#aaa", marginTop:2}}>
                    {highestPct}% of total
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="insight-card" variants={itemVariants}>
              <div className="insight-label">top spending day</div>
              <div style={{display:"flex", alignItems:"center", gap:10, marginTop:8}}>
                <motion.div style={{fontSize:28}} whileHover={{scale: 1.2}}>
                  📅
                </motion.div>
                <div>
                  <div style={{fontSize:16, fontWeight:600, color:"#2d2a35"}}>
                    ₹{topDayAmount.toLocaleString("en-IN")}
                  </div>
                  <div style={{fontSize:12, color:"#aaa", marginTop:2}}>
                    {topDayFormatted}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="insight-card" variants={itemVariants}>
              <div className="insight-label">avg per expense</div>
              <div style={{display:"flex", alignItems:"center", gap:10, marginTop:8}}>
                <motion.div style={{fontSize:28}} whileHover={{scale: 1.2}}>
                  📊
                </motion.div>
                <div>
                  <div style={{fontSize:16, fontWeight:600, color:"#2d2a35"}}>
                    ₹{avgExpense.toLocaleString("en-IN")}
                  </div>
                  <div style={{fontSize:12, color:"#aaa", marginTop:2}}>
                    {expenses.length} expenses
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="charts-row"
            variants={containerVariants}
            initial="hidden"
            animate="visible">
            <motion.div className="card" variants={itemVariants}>
              <div className="card-title">6-month spending trend</div>
              {monthlyData.every(d => d.spent === 0) ? (
                <div className="empty">no data</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                    <XAxis dataKey="month" tick={{fontSize:11, fill:"#aaa"}} />
                    <YAxis tick={{fontSize:11, fill:"#aaa"}} />
                    <Tooltip
                      contentStyle={{borderRadius:10, border:"none", background:"#fff",
                        fontSize:12, boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}
                      formatter={v => `₹${v.toLocaleString("en-IN")}`}
                    />
                    <Line type="monotone" dataKey="spent" stroke="#8b5cf6"
                      strokeWidth={3} dot={{fill:"#8b5cf6", r:4}} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div className="card" variants={itemVariants}>
              <div className="card-title">category comparison</div>
              {barChartData.length === 0 ? (
                <div className="empty">no data</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                    <XAxis dataKey="name" tick={{fontSize:11, fill:"#aaa"}} />
                    <YAxis tick={{fontSize:11, fill:"#aaa"}} />
                    <Tooltip
                      contentStyle={{borderRadius:10, border:"none", background:"#fff",
                        fontSize:12, boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}
                      formatter={(v, name, props) => [
                        `₹${v.toLocaleString("en-IN")}`,
                        props.payload.fullName
                      ]}
                    />
                    <Bar dataKey="amount" radius={[6,6,0,0]}>
                      {barChartData.map((d, i) => (
                        <Cell key={i} fill={CAT_COLORS[d.fullName]?.accent ?? "#ccc"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </motion.div>

          <motion.div className="mid-row"
            variants={containerVariants}
            initial="hidden"
            animate="visible">
            <motion.div className="card" variants={itemVariants}>
              <div className="card-title">spending by category</div>
              {catTotals.length === 0 ? (
                <div className="empty">no expenses yet</div>
              ) : (
                <div style={{display:"flex", alignItems:"center", gap:16}}>
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={catTotals} innerRadius={36} outerRadius={54}
                        dataKey="value" paddingAngle={3}>
                        {catTotals.map((d, i) => (
                          <Cell key={i} fill={CAT_COLORS[d.name]?.accent ?? "#ccc"} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{display:"flex", flexDirection:"column", gap:6, flex:1}}>
                    {catTotals.map((d, i) => (
                      <motion.div key={i} className="leg-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}>
                        <div className="leg-dot" style={{background: CAT_COLORS[d.name]?.accent ?? "#ccc"}}/>
                        <span className="leg-name">{d.name}</span>
                        <span className="leg-amt">₹{d.value.toLocaleString("en-IN")}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div className="card" variants={itemVariants}>
              <div className="card-title">monthly budget</div>
              <div style={{marginBottom:16}}>
                <div style={{display:"flex", justifyContent:"space-between",
                  fontSize:12, color:"#2d2a35", marginBottom:8}}>
                  <span>Spent</span>
                  <span style={{fontWeight:600}}>₹{totalExpense.toLocaleString("en-IN")}</span>
                </div>
                <div className="budget-track">
                  <motion.div className="budget-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${budgetPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                      background: budgetPct > 80
                        ? "linear-gradient(90deg,#f5a623,#e05252)"
                        : "linear-gradient(90deg,#8b5cf6,#d45ba1)"
                    }}/>
                </div>
                <div style={{display:"flex", justifyContent:"space-between",
                  fontSize:11, color:"#aaa", marginTop:8}}>
                  <span>{budgetPct}% used</span>
                  <span>₹{balance.toLocaleString("en-IN")} left</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="filter-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}>
            <input
              type="text"
              className="filter-input"
              placeholder="Search expenses..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{flex: 2}}
            />
            <select
              className="filter-input"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="all">all categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{CAT_COLORS[c]?.emoji || "📦"} {c}</option>
              ))}
            </select>
          </motion.div>

          <motion.div className="filter-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}>
            <div className="date-range-group" style={{flex: 1}}>
              <label>from</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className="date-range-group" style={{flex: 1}}>
              <label>to</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            {(dateFrom || dateTo) && (
              <motion.button
                className="filter-input"
                style={{background: "#f0ece4", cursor: "pointer"}}
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                clear dates
              </motion.button>
            )}
          </motion.div>

          <motion.div className="filter-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}>
            <span style={{fontSize:12, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:500}}>
              sort by:
            </span>
            <div className="sort-control">
              {["newest", "oldest", "highest", "lowest"].map(opt => (
                <motion.button
                  key={opt}
                  className={`sort-btn ${sortBy === opt ? 'active' : ''}`}
                  onClick={() => setSortBy(opt)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  {opt}
                </motion.button>
              ))}
            </div>
            <motion.button className="export-btn" onClick={exportToCSV}
              style={{marginLeft: "auto"}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              ⬇️ export CSV
            </motion.button>
          </motion.div>

          <motion.div className="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}>
            <div className="card-title" style={{marginBottom:14}}>
              {filtered.length} expense{filtered.length !== 1 ? "s" : ""}
            </div>
            {filtered.length === 0 && (
              <div className="empty">
                {expenses.length === 0
                  ? `no expenses added yet — hit "+ add expense" above`
                  : "no expenses match your filter"}
              </div>
            )}
            <motion.div variants={containerVariants}
              initial="hidden"
              animate="visible">
              {filtered.map((exp, idx) => {
                const cat = CAT_COLORS[exp.category?.toLowerCase()] || CAT_COLORS.other;
                return (
                  <motion.div key={exp._id} className="exp-row"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, paddingLeft: 8 }}>
                    <motion.div className="exp-icon" style={{background: cat.bg}}
                      whileHover={{ rotate: 10, scale: 1.1 }}>
                      {cat.emoji}
                    </motion.div>
                    <div style={{flex:1}}>
                      <div className="exp-name">{exp.title}</div>
                      <div className="exp-meta">
                        {exp.category} · {exp.date
                          ? new Date(exp.date).toLocaleDateString("en-IN",
                              {day:"numeric", month:"short"})
                          : "—"}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div className="exp-amt">-₹{Number(exp.amount).toLocaleString("en-IN")}</div>
                      <div className="exp-actions">
                        <motion.span className="exp-action-btn edit" onClick={() => handleEdit(exp)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}>
                          edit
                        </motion.span>
                        <motion.span className="exp-action-btn delete" onClick={() => handleDelete(exp._id)}
                          whileHover={{ scale: 1.1, color: "#d45ba1" }}
                          whileTap={{ scale: 0.9 }}>
                          delete
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

        </>
      )}

      {/* SUBSCRIPTIONS TAB */}
      {activeTab === "subscriptions" && (
        <Subscriptions 
          onExpensesUpdated={fetchExpenses}
          onSubscriptionsUpdated={fetchSubscriptions}
        />
      )}

    </div>
  );
}