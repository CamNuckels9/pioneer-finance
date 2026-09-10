import { useEffect, useState } from "react";
import "./App.css";
import pioneerLogo from "./assets/pioneer-logo.png";

function App() {
  // =========================
  // AUTH STATE
  // =========================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [token, setToken] = useState(
    () => localStorage.getItem("pioneerToken") || ""
  );

  const [error, setError] = useState("");

  // =========================
  // APP STATE
  // =========================
  const [activePage, setActivePage] = useState("dashboard");
  const [accounts, setAccounts] = useState([]);
const [accountName, setAccountName] = useState("");
const [accountType, setAccountType] = useState("CHECKING");
const [accountBalance, setAccountBalance] = useState("");
const [showAccountForm, setShowAccountForm] = useState(false);
const [editingAccountId, setEditingAccountId] = useState(null);

  const [dashboard, setDashboard] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  const [transactions, setTransactions] = useState([]);

  // =========================
  // TRANSACTION FORM STATE
  // =========================
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("INCOME");
  const [transactionAccountId, setTransactionAccountId] = useState("");
  const [destinationAccountId, setDestinationAccountId] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [showTransactionForm, setShowTransactionForm] =
    useState(false);

  // =========================
  // LOAD DATA WHEN LOGGED IN
  // =========================
  useEffect(() => {
    if (token) {
      loadDashboard(token);
      loadTransactions(token);
      loadAccounts(token);
    }
  }, [token]);

  // =========================
  // LOGIN
  // =========================
  async function login() {
    try {
      setError("");
      setSuccessMessage("");

      if (!email.trim() || !password) {
        throw new Error("Please enter your email and password.");
      }

      const response = await fetch(
        "http://localhost:8080/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Incorrect email or password.");
        }

        throw new Error(
          `Login failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error(
          "Login succeeded, but the server did not return a token."
        );
      }

      localStorage.setItem("pioneerToken", data.token);

      setToken(data.token);
      setEmail("");
      setPassword("");
      setSuccessMessage("");
    } catch (err) {
      setError(err.message);
    }
  }

  // =========================
  // REGISTER
  // =========================
  async function register() {
    try {
      setError("");
      setSuccessMessage("");

      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim() ||
        !password ||
        !confirmPassword
      ) {
        throw new Error("Please complete all fields.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      if (password.length < 6) {
        throw new Error(
          "Password must be at least 6 characters long."
        );
      }

      const response = await fetch(
        "http://localhost:8080/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      if (!response.ok) {
        let message = `Registration failed with status ${response.status}`;

        try {
          const data = await response.json();

          if (data.message) {
            message = data.message;
          }
        } catch {
          // Keep the default message.
        }

        throw new Error(message);
      }

      setFirstName("");
      setLastName("");
      setPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        "Account created successfully. You can now sign in."
      );

      setAuthMode("login");
    } catch (err) {
      setError(err.message);
    }
  }

  // =========================
  // LOGOUT
  // =========================
  function logout() {
    localStorage.removeItem("pioneerToken");

    setToken("");
    setError("");
    setSuccessMessage("");
    setActivePage("dashboard");

    setDashboard({
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
    });

    setTransactions([]);
    setAccounts([]);

    clearForm();
    clearAccountForm();
  }

  // =========================
  // LOAD DASHBOARD
  // =========================
  async function loadDashboard(jwtToken) {
    try {
      const response = await fetch(
        "http://localhost:8080/transactions/dashboard",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();

        throw new Error(
          "Your session expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Dashboard request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      setDashboard(data);
    } catch (err) {
      setError(err.message);
    }
  }

  // =========================
  // LOAD TRANSACTIONS
  // =========================
  async function loadTransactions(jwtToken) {
    try {
      const response = await fetch(
        "http://localhost:8080/transactions",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();

        throw new Error(
          "Your session expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Transactions request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      setTransactions(data);
    } catch (err) {
      setError(err.message);
    }
  }

  // =========================
  // LOAD ACCOUNTS
  // =========================
  async function loadAccounts(jwtToken) {
    try {
      const response = await fetch(
        "http://localhost:8080/accounts",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Accounts request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  // =========================
  // ADD ACCOUNT
  // =========================
  async function addAccount() {
    try {
      setError("");

      const numericBalance = Number(accountBalance);

      if (!accountName.trim()) {
        throw new Error("Please enter an account name.");
      }

      if (
        accountBalance === "" ||
        Number.isNaN(numericBalance)
      ) {
        throw new Error("Please enter a valid balance.");
      }

      const response = await fetch(
        "http://localhost:8080/accounts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: accountName.trim(),
            type: accountType,
            balance: numericBalance,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Account creation failed with status ${response.status}`
        );
      }

      clearAccountForm();
      await loadAccounts(token);
      await loadDashboard(token);
    } catch (err) {
      setError(err.message);
    }
  }

  // =========================
  // UPDATE ACCOUNT
  // =========================
  async function updateAccount() {
    try {
      setError("");

      const numericBalance = Number(accountBalance);

      if (!accountName.trim()) {
        throw new Error("Please enter an account name.");
      }

      if (
        accountBalance === "" ||
        Number.isNaN(numericBalance)
      ) {
        throw new Error("Please enter a valid balance.");
      }

      const response = await fetch(
        `http://localhost:8080/accounts/${editingAccountId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: accountName.trim(),
            type: accountType,
            balance: numericBalance,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Account update failed with status ${response.status}`
        );
      }

      clearAccountForm();
      await loadAccounts(token);
      await loadDashboard(token);
    } catch (err) {
      setError(err.message);
    }
  }

  // =========================
  // DELETE ACCOUNT
  // =========================
  async function deleteAccount(id) {
  try {
    setError("");

    const response = await fetch(
      `http://localhost:8080/accounts/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      logout();
      return;
    }

    if (!response.ok) {
      let message =
        `Account delete failed with status ${response.status}`;

      try {
        const data = await response.json();

        if (data.message) {
          message = data.message;
        }
      } catch {
        // Keep the default message.
      }

      throw new Error(message);
    }

    if (editingAccountId === id) {
      clearAccountForm();
    }

    await loadAccounts(token);
    await loadDashboard(token);
  } catch (err) {
    setError(err.message);
  }
}

  // =========================
  // START EDITING ACCOUNT
  // =========================
  function startEditingAccount(account) {
    setError("");
    setActivePage("accounts");

    setEditingAccountId(account.id);
    setAccountName(account.name);
    setAccountType(account.type);
    setAccountBalance(account.balance);
    setShowAccountForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================
  // CLEAR ACCOUNT FORM
  // =========================
  function clearAccountForm() {
    setAccountName("");
    setAccountType("CHECKING");
    setAccountBalance("");
    setEditingAccountId(null);
    setShowAccountForm(false);
  }

  // =========================
  // OPEN ADD ACCOUNT
  // =========================
  function openAddAccount() {
    setError("");
    setActivePage("accounts");
    clearAccountForm();
    setShowAccountForm(true);
  }

  // =========================
  // ADD TRANSACTION
  // =========================
  async function addTransaction() {
    try {
      setError("");

      const numericAmount = Number(amount);

      if (!description.trim()) {
        throw new Error("Please enter a description.");
      }

      if (!category.trim()) {
        throw new Error("Please enter a category.");
      }

      if (!date) {
        throw new Error("Please select a date.");
      }

      if (!amount || Number.isNaN(numericAmount)) {
        throw new Error("Please enter a valid amount.");
      }

      if (numericAmount <= 0) {
        throw new Error("Amount must be greater than $0.");
      }

      if (!transactionAccountId) {
        throw new Error(
          type === "TRANSFER"
            ? "Please select a from account."
            : "Please select an account."
        );
      }

      if (type === "TRANSFER") {
        if (!destinationAccountId) {
          throw new Error("Please select a to account.");
        }

        if (transactionAccountId === destinationAccountId) {
          throw new Error(
            "From Account and To Account must be different."
          );
        }
      }

      const payload = {
        description: description.trim(),
        amount: numericAmount,
        category: category.trim(),
        date,
        type,
        account: {
          id: Number(transactionAccountId),
        },
      };

      if (type === "TRANSFER") {
        payload.destinationAccount = {
          id: Number(destinationAccountId),
        };
      }

      const response = await fetch(
        "http://localhost:8080/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();

        throw new Error(
          "Your session expired. Please log in again."
        );
      }

      if (!response.ok) {
        let message =
          `Transaction failed with status ${response.status}`;

        try {
          const data = await response.json();
          if (data.message) {
            message = data.message;
          }
        } catch {
          // Keep the default message.
        }

        throw new Error(message);
      }

      clearForm();

      await loadDashboard(token);
      await loadTransactions(token);
      await loadAccounts(token);
    } catch (err) {
      setError(err.message);
    }
  }

  // =========================
  // UPDATE TRANSACTION
  // =========================
  async function updateTransaction() {
    try {
      setError("");

      const numericAmount = Number(amount);

      if (!description.trim()) {
        throw new Error("Please enter a description.");
      }

      if (!category.trim()) {
        throw new Error("Please enter a category.");
      }

      if (!date) {
        throw new Error("Please select a date.");
      }

      if (!amount || Number.isNaN(numericAmount)) {
        throw new Error("Please enter a valid amount.");
      }

      if (numericAmount <= 0) {
        throw new Error("Amount must be greater than $0.");
      }

      if (!transactionAccountId) {
        throw new Error(
          type === "TRANSFER"
            ? "Please select a from account."
            : "Please select an account."
        );
      }

      if (type === "TRANSFER") {
        if (!destinationAccountId) {
          throw new Error("Please select a to account.");
        }

        if (transactionAccountId === destinationAccountId) {
          throw new Error(
            "From Account and To Account must be different."
          );
        }
      }

      const payload = {
        description: description.trim(),
        amount: numericAmount,
        category: category.trim(),
        date,
        type,
        account: {
          id: Number(transactionAccountId),
        },
      };

      if (type === "TRANSFER") {
        payload.destinationAccount = {
          id: Number(destinationAccountId),
        };
      }

      const response = await fetch(
        `http://localhost:8080/transactions/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();

        throw new Error(
          "Your session expired. Please log in again."
        );
      }

      if (!response.ok) {
        let message =
          `Update failed with status ${response.status}`;

        try {
          const data = await response.json();
          if (data.message) {
            message = data.message;
          }
        } catch {
          // Keep the default message.
        }

        throw new Error(message);
      }

      clearForm();

      await loadDashboard(token);
      await loadTransactions(token);
      await loadAccounts(token);
    } catch (err) {
      setError(err.message);
    }
  }

  // =========================
  // DELETE TRANSACTION
  // =========================
  async function deleteTransaction(id) {
    try {
      setError("");

      const response = await fetch(
        `http://localhost:8080/transactions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();

        throw new Error(
          "Your session expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Delete failed with status ${response.status}`
        );
      }

      if (editingId === id) {
        clearForm();
      }

      await loadDashboard(token);
      await loadTransactions(token);
      await loadAccounts(token);
    } catch (err) {
      setError(err.message);
    }
  }

  // =========================
  // START EDITING
  // =========================
  function startEditing(transaction) {
    setError("");
    setActivePage("transactions");

    setEditingId(transaction.id);
    setDescription(transaction.description);
    setAmount(transaction.amount);
    setCategory(transaction.category);
    setDate(transaction.date);
    setType(transaction.type);
    setTransactionAccountId(
      transaction.account?.id ? String(transaction.account.id) : ""
    );
    setDestinationAccountId(
      transaction.destinationAccount?.id
        ? String(transaction.destinationAccount.id)
        : ""
    );

    setShowTransactionForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================
  // CLEAR TRANSACTION FORM
  // =========================
  function clearForm() {
    setDescription("");
    setAmount("");
    setCategory("");
    setDate("");
    setType("INCOME");
    setTransactionAccountId("");
    setDestinationAccountId("");
    setEditingId(null);
    setShowTransactionForm(false);
  }

  // =========================
  // OPEN ADD TRANSACTION
  // =========================
  function openAddTransaction() {
    setError("");
    setActivePage("transactions");
    clearForm();
    setShowTransactionForm(true);
  }

  // =========================
  // CHANGE AUTH MODE
  // =========================
  function switchAuthMode(mode) {
    setAuthMode(mode);
    setError("");
    setSuccessMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  // =========================
  // CURRENCY FORMATTER
  // =========================
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value || 0);

  // =====================================================
  // LOGIN / REGISTRATION SCREEN
  // =====================================================
  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <img
            src={pioneerLogo}
            alt="Pioneer Finance logo"
            className="login-logo"
          />

          <h1>Pioneer Finance</h1>

          <p className="login-subtitle">
            Personal finance made simple.
          </p>

          {authMode === "login" ? (
            <div className="login-form">
              <label>Email</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    login();
                  }
                }}
              />

              <button
                className="primary-button login-button"
                onClick={login}
              >
                Sign In
              </button>

              {successMessage && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#ecfdf3",
                    color: "#067647",
                    fontSize: "14px",
                  }}
                >
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div
                style={{
                  marginTop: "18px",
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() =>
                    switchAuthMode("register")
                  }
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    color: "#990000",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <div className="login-form">
              <label>First Name</label>

              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
              />

              <label>Last Name</label>

              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
              />

              <label>Email</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

              <label>Confirm Password</label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    register();
                  }
                }}
              />

              <button
                className="primary-button login-button"
                onClick={register}
              >
                Create Account
              </button>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div
                style={{
                  marginTop: "18px",
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() =>
                    switchAuthMode("login")
                  }
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    color: "#990000",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN APPLICATION
  // =====================================================
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <img
              src={pioneerLogo}
              alt="Pioneer Finance"
              style={{
                width: "150px",
                height: "auto",
                display: "block",
                borderRadius: "10px",
              }}
            />
          </div>

          <nav>
            <button
              className={`nav-item ${
                activePage === "dashboard"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setError("");
                clearForm();
                clearAccountForm();
                setActivePage("dashboard");
              }}
            >
              Dashboard
            </button>

            <button
              className={`nav-item ${
                activePage === "accounts"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setError("");
                clearForm();
                clearAccountForm();
                setActivePage("accounts");
              }}
            >
              Accounts
            </button>

            <button
              className={`nav-item ${
                activePage === "transactions"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setError("");
                clearForm();
                clearAccountForm();
                setActivePage("transactions");
              }}
            >
              Transactions
            </button>
          </nav>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </aside>

      <main className="main-content">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* =========================
            DASHBOARD
        ========================== */}
        {activePage === "dashboard" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">
                  FINANCIAL OVERVIEW
                </p>

                <h1>Dashboard</h1>

                <p className="subtitle">
                  Track your income, spending, and balance.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={openAddTransaction}
              >
                + Add Transaction
              </button>
            </header>

            <section className="summary-grid">
              <div className="summary-card">
                <span className="card-label">
                  Total Income
                </span>

                <strong className="money income">
                  {formatCurrency(
                    dashboard.totalIncome
                  )}
                </strong>

                <span className="card-note">
                  Money coming in
                </span>
              </div>

              <div className="summary-card">
                <span className="card-label">
                  Total Expenses
                </span>

                <strong className="money expense">
                  {formatCurrency(
                    dashboard.totalExpenses
                  )}
                </strong>

                <span className="card-note">
                  Money going out
                </span>
              </div>

              <div className="summary-card">
                <span className="card-label">
                  Current Balance
                </span>

                <strong className="money">
                  {formatCurrency(
                    dashboard.balance
                  )}
                </strong>

                <span className="card-note">
                  Across your cash accounts
                </span>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Recent Transactions</h2>

                  <p>
                    Your latest financial activity.
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => {
                    setError("");
                    setActivePage("transactions");
                  }}
                >
                  View All
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    $
                  </div>

                  <h3>No transactions yet</h3>

                  <p>
                    Add your first income, expense, or transfer
                    to get started.
                  </p>

                  <button
                    className="primary-button"
                    onClick={openAddTransaction}
                  >
                    Add Transaction
                  </button>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions
                        .slice(0, 5)
                        .map((transaction) => (
                          <tr key={transaction.id}>
                            <td>
                              {transaction.date}
                            </td>

                            <td className="description-cell">
                              {transaction.description}
                            </td>

                            <td>
                              {transaction.category}
                            </td>

                            <td>
                              <span
                                className={`type-badge ${
                                  transaction.type === "INCOME"
                                    ? "income-badge"
                                    : transaction.type === "EXPENSE"
                                      ? "expense-badge"
                                      : ""
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </td>

                            <td
                              className={
                                transaction.type === "INCOME"
                                  ? "income amount-cell"
                                  : transaction.type === "EXPENSE"
                                    ? "expense amount-cell"
                                    : "amount-cell"
                              }
                            >
                              {transaction.type === "INCOME"
                                ? "+"
                                : transaction.type === "EXPENSE"
                                  ? "-"
                                  : ""}

                              {formatCurrency(
                                transaction.amount
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* =========================
            ACCOUNTS PAGE
        ========================== */}
        {activePage === "accounts" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">
                  MONEY ACCOUNTS
                </p>

                <h1>Accounts</h1>

                <p className="subtitle">
                  Track the accounts that make up your financial picture.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={openAddAccount}
              >
                + Add Account
              </button>
            </header>

            {showAccountForm && (
              <section className="panel transaction-form-panel">
                <div className="panel-header">
                  <div>
                    <h2>
                      {editingAccountId !== null
                        ? "Edit Account"
                        : "Add Account"}
                    </h2>

                    <p>
                      {editingAccountId !== null
                        ? "Update the account information below."
                        : "Enter the details for your new account."}
                    </p>
                  </div>

                  <button
                    className="close-button"
                    onClick={clearAccountForm}
                  >
                    ×
                  </button>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Account Name</label>

                    <input
                      type="text"
                      placeholder="Example: Primary Checking"
                      value={accountName}
                      onChange={(event) =>
                        setAccountName(event.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Balance</label>

                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={accountBalance}
                      onChange={(event) =>
                        setAccountBalance(event.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Account Type</label>

                    <select
                      value={accountType}
                      onChange={(event) =>
                        setAccountType(event.target.value)
                      }
                    >
                      <option value="CHECKING">Checking</option>
                      <option value="SAVINGS">Savings</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="secondary-button"
                    onClick={clearAccountForm}
                  >
                    Cancel
                  </button>

                  <button
                    className="primary-button"
                    onClick={
                      editingAccountId !== null
                        ? updateAccount
                        : addAccount
                    }
                  >
                    {editingAccountId !== null
                      ? "Save Changes"
                      : "Add Account"}
                  </button>
                </div>
              </section>
            )}

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>All Accounts</h2>

                  <p>
                    View and manage your financial accounts.
                  </p>
                </div>

                <span className="transaction-count">
                  {accounts.length}{" "}
                  {accounts.length === 1
                    ? "account"
                    : "accounts"}
                </span>
              </div>

              {accounts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">$</div>

                  <h3>No accounts yet</h3>

                  <p>
                    Add your first checking, savings, credit card,
                    or cash account to get started.
                  </p>

                  <button
                    className="primary-button"
                    onClick={openAddAccount}
                  >
                    Add Account
                  </button>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Balance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {accounts.map((account) => (
                        <tr key={account.id}>
                          <td className="description-cell">
                            {account.name}
                          </td>

                          <td>
                            {account.type.replace("_", " ")}
                          </td>

                          <td className="amount-cell">
                            {formatCurrency(account.balance)}
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                className="edit-button"
                                onClick={() =>
                                  startEditingAccount(account)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="delete-button"
                                onClick={() =>
                                  deleteAccount(account.id)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* =========================
            TRANSACTIONS PAGE
        ========================== */}
        {activePage === "transactions" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">
                  MONEY ACTIVITY
                </p>

                <h1>Transactions</h1>

                <p className="subtitle">
                  Add, edit, and manage all of your
                  financial activity.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={openAddTransaction}
              >
                + Add Transaction
              </button>
            </header>

            {showTransactionForm && (
              <section className="panel transaction-form-panel">
                <div className="panel-header">
                  <div>
                    <h2>
                      {editingId !== null
                        ? "Edit Transaction"
                        : "Add Transaction"}
                    </h2>

                    <p>
                      {editingId !== null
                        ? "Update the transaction information below."
                        : "Enter the details for your new transaction."}
                    </p>
                  </div>

                  <button
                    className="close-button"
                    onClick={clearForm}
                  >
                    ×
                  </button>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Description
                    </label>

                    <input
                      type="text"
                      placeholder="Example: Paycheck"
                      value={description}
                      onChange={(event) =>
                        setDescription(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Amount</label>

                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(event) =>
                        setAmount(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>

                    <input
                      type="text"
                      placeholder="Example: Housing"
                      value={category}
                      onChange={(event) =>
                        setCategory(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Date</label>

                    <input
                      type="date"
                      value={date}
                      onChange={(event) =>
                        setDate(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Type</label>

                    <select
                      value={type}
                      onChange={(event) => {
                        const nextType = event.target.value;
                        setType(nextType);

                        if (nextType !== "TRANSFER") {
                          setDestinationAccountId("");
                        }
                      }}
                    >
                      <option value="INCOME">
                        Income
                      </option>

                      <option value="EXPENSE">
                        Expense
                      </option>

                      <option value="TRANSFER">
                        Transfer
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      {type === "TRANSFER" ? "From Account" : "Account"}
                    </label>

                    <select
                      value={transactionAccountId}
                      onChange={(event) =>
                        setTransactionAccountId(event.target.value)
                      }
                    >
                      <option value="">
                        {type === "TRANSFER"
                          ? "Select a from account"
                          : "Select an account"}
                      </option>

                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({account.type.replace("_", " ")})
                        </option>
                      ))}
                    </select>
                  </div>

                  {type === "TRANSFER" && (
                    <div className="form-group">
                      <label>To Account</label>

                      <select
                        value={destinationAccountId}
                        onChange={(event) =>
                          setDestinationAccountId(event.target.value)
                        }
                      >
                        <option value="">Select a to account</option>

                        {accounts
                          .filter(
                            (account) =>
                              String(account.id) !== transactionAccountId
                          )
                          .map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name} ({account.type.replace("_", " ")})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    className="secondary-button"
                    onClick={clearForm}
                  >
                    Cancel
                  </button>

                  <button
                    className="primary-button"
                    onClick={
                      editingId !== null
                        ? updateTransaction
                        : addTransaction
                    }
                  >
                    {editingId !== null
                      ? "Save Changes"
                      : "Add Transaction"}
                  </button>
                </div>
              </section>
            )}

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    All Transactions
                  </h2>

                  <p>
                    View and manage your complete
                    transaction history.
                  </p>
                </div>

                <span className="transaction-count">
                  {transactions.length}{" "}
                  {transactions.length === 1
                    ? "transaction"
                    : "transactions"}
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    $
                  </div>

                  <h3>
                    No transactions yet
                  </h3>

                  <p>
                    Add your first income, expense, or transfer
                    to get started.
                  </p>

                  <button
                    className="primary-button"
                    onClick={openAddTransaction}
                  >
                    Add Transaction
                  </button>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Account</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.map(
                        (transaction) => (
                          <tr
                            key={transaction.id}
                          >
                            <td>
                              {transaction.date}
                            </td>

                            <td className="description-cell">
                              {transaction.description}
                            </td>

                            <td>
                              {transaction.category}
                            </td>

                            <td>
                              {transaction.type === "TRANSFER"
                                ? `${transaction.account?.name || "Unassigned"} → ${
                                    transaction.destinationAccount?.name || "Unassigned"
                                  }`
                                : transaction.account?.name || "Unassigned"}
                            </td>

                            <td>
                              <span
                                className={`type-badge ${
                                  transaction.type === "INCOME"
                                    ? "income-badge"
                                    : transaction.type === "EXPENSE"
                                      ? "expense-badge"
                                      : ""
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </td>

                            <td
                              className={
                                transaction.type === "INCOME"
                                  ? "income amount-cell"
                                  : transaction.type === "EXPENSE"
                                    ? "expense amount-cell"
                                    : "amount-cell"
                              }
                            >
                              {transaction.type === "INCOME"
                                ? "+"
                                : transaction.type === "EXPENSE"
                                  ? "-"
                                  : ""}

                              {formatCurrency(
                                transaction.amount
                              )}
                            </td>

                            <td>
                              <div className="action-buttons">
                                <button
                                  className="edit-button"
                                  onClick={() =>
                                    startEditing(
                                      transaction
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className="delete-button"
                                  onClick={() =>
                                    deleteTransaction(
                                      transaction.id
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
