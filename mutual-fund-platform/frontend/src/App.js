import { useEffect, useState } from "react";

const API = "https://mutual-fund-platform.onrender.com";

function App() {
  const [funds, setFunds] = useState([]);
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newFund, setNewFund] = useState({
    fund_name: "",
    fund_type: "",
    risk_level: "",
    returns: ""
  });

  const [sipAmount, setSipAmount] = useState("");
  const [sipYears, setSipYears] = useState("");
  const [sipReturn, setSipReturn] = useState(12);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isLoggedIn) fetchFunds();
  }, [isLoggedIn]);

  const fetchFunds = () => {
    setLoading(true);
    fetch(`${API}/funds`)
      .then(res => res.json())
      .then(data => setFunds(data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    setNewFund({ ...newFund, [e.target.name]: e.target.value });
  };

  const addFund = () => {
    fetch(`${API}/funds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...newFund,
        returns: Number(newFund.returns)
      })
    }).then(() => {
      fetchFunds();
      setNewFund({
        fund_name: "",
        fund_type: "",
        risk_level: "",
        returns: ""
      });
    });
  };

  const deleteFund = (id) => {
    fetch(`${API}/funds/${id}`, {
      method: "DELETE"
    }).then(() => fetchFunds());
  };

  // LOGIN
  const handleLogin = () => {
    if (username === "harsha" && password === "143") {
      setIsLoggedIn(true);
      setPage("home");
    } else {
      alert("Invalid credentials");
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPage("login");
  };

  // BUY
  const buyFund = (fund) => {
    const qty = prompt("Enter quantity:");
    if (!qty || isNaN(qty)) return;

    setPortfolio(prev => [...prev, { ...fund, qty: Number(qty) }]);
  };

  // SELL
  const sellFund = (id) => {
    setPortfolio(prev => prev.filter(f => f.fund_id !== id));
  };

  // SIP CALCULATOR
  const calculateSIP = () => {
    const P = Number(sipAmount);
    const r = sipReturn / 100 / 12;
    const n = sipYears * 12;

    if (!P || !n) return 0;

    return Math.round(
      P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
    );
  };

  const getRiskColor = (risk) => {
    if (risk === "High") return "#ff4d4f";
    if (risk === "Medium") return "#faad14";
    return "#52c41a";
  };

  // STYLES
  const container = {
    minHeight: "100vh",
    padding: "30px",
    background: "linear-gradient(135deg, #141e30, #243b55)",
    color: "white",
    fontFamily: "Poppins, Arial"
  };

  const card = {
    background: "rgba(255,255,255,0.08)",
    padding: "20px",
    borderRadius: "15px",
    margin: "10px",
    width: "260px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
  };

  const button = {
    margin: "5px",
    padding: "10px 18px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    background: "#00c6ff",
    color: "white",
    fontWeight: "bold"
  };

  const input = {
    padding: "10px",
    margin: "5px",
    borderRadius: "10px",
    border: "none"
  };

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div style={{ ...container, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: "rgba(255,255,255,0.1)", padding: "40px", borderRadius: "15px", textAlign: "center" }}>
          <h1 style={{ fontSize: "32px" }}>🔐 Login</h1>

          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={input} /><br />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} /><br />

          <button onClick={handleLogin} style={button}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <h1 style={{ textAlign: "center" }}>💰 Mutual Fund Platform</h1>

      {loading && <p style={{ textAlign: "center" }}>⏳ Loading data...</p>}

      {/* NAV */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {["home", "investor", "portfolio", "admin", "advisor", "analyst"].map(p => (
          <button key={p} style={button} onClick={() => setPage(p)}>
            {p.toUpperCase()}
          </button>
        ))}
        <button style={{ ...button, background: "red" }} onClick={logout}>Logout</button>
      </div>

      {/* HOME */}
      {page === "home" && (
        <>
          <h2 style={{ fontSize: "28px" }}>🏠 About Mutual Funds</h2>

          <p style={{ fontSize: "18px" }}>
            Mutual funds pool money from investors to invest in diversified assets like stocks and bonds.
            They are managed by professionals and help reduce risk while growing wealth.
          </p>

          <h2>📊 SIP Calculator</h2>

          <input placeholder="Monthly Investment" value={sipAmount} onChange={(e)=>setSipAmount(e.target.value)} style={input}/>
          <input placeholder="Years" value={sipYears} onChange={(e)=>setSipYears(e.target.value)} style={input}/>
          <input placeholder="Return %" value={sipReturn} onChange={(e)=>setSipReturn(e.target.value)} style={input}/>

          <h3>💸 Future Value: ₹ {calculateSIP()}</h3>
        </>
      )}

      {/* INVESTOR */}
      {page === "investor" && (
        <>
          <h2>📊 Market</h2>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {funds.map(f => (
              <div key={f.fund_id} style={card}>
                <h3>{f.fund_name}</h3>
                <p>{f.fund_type}</p>
                <p style={{ color: getRiskColor(f.risk_level) }}>{f.risk_level}</p>
                <p>{f.returns}%</p>
                <button style={{ background: "#00ff88" }} onClick={() => buyFund(f)}>Buy</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PORTFOLIO */}
      {page === "portfolio" && (
        <>
          <h2>💼 Portfolio</h2>
          {portfolio.map(f => (
            <div key={f.fund_id} style={card}>
              <h3>{f.fund_name}</h3>
              <p>Qty: {f.qty}</p>
              <button style={{ background: "red" }} onClick={() => sellFund(f.fund_id)}>Sell</button>
            </div>
          ))}
        </>
      )}

      {/* ADMIN */}
      {page === "admin" && (
        <>
          <h2>⚙️ Admin Panel</h2>

          <input name="fund_name" placeholder="Name" onChange={handleChange} style={input}/>
          <input name="fund_type" placeholder="Type" onChange={handleChange} style={input}/>
          <input name="risk_level" placeholder="Risk" onChange={handleChange} style={input}/>
          <input name="returns" placeholder="Returns" onChange={handleChange} style={input}/>

          <button style={button} onClick={addFund}>Add Fund</button>

          {funds.map(f => (
            <div key={f.fund_id}>
              {f.fund_name}
              <button onClick={() => deleteFund(f.fund_id)}>Delete</button>
            </div>
          ))}
        </>
      )}

      {/* ADVISOR */}
      {page === "advisor" && (
        <>
          <h2>📘 Advisor</h2>
          {funds.map(f => (
            <div key={f.fund_id} style={card}>
              <h3>{f.fund_name}</h3>
              <p>{f.risk_level === "Low" ? "Safe Investment" : f.risk_level === "Medium" ? "Balanced Risk" : "High Growth Potential"}</p>
            </div>
          ))}
        </>
      )}

      {/* ANALYST */}
      {page === "analyst" && (
        <>
          <h2>📈 Analysis</h2>
          <p>Total Funds: {funds.length}</p>
          <p>High Return: {funds.filter(f=>f.returns>=12).length}</p>
          <p>Top Fund: {funds.length > 0 && [...funds].sort((a,b)=>b.returns-a.returns)[0].fund_name}</p>
        </>
      )}
    </div>
  );
}

export default App;