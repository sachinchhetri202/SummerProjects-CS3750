import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";


const TransactionSingle = (props) => (
  <tr>
    <td>{props.transaction.date}</td>
    <td>{props.transaction.action.charAt(0).toUpperCase() + props.transaction.action.slice(1)}</td>
    {props.transaction.action === "withdraw" ? (<td>-${props.transaction.amount.toFixed(2)}</td>) :
    (<td>${props.transaction.amount.toFixed(2)}</td>)}
  </tr>
)

const TransactionAll = (props) => (
  <tr>
    <td>{props.transaction.account === "investing" ? "Investment" : 
         props.transaction.account.charAt(0).toUpperCase() + props.transaction.account.slice(1)}</td>
    <td>{props.transaction.date}</td>
    <td>{props.transaction.action.charAt(0).toUpperCase() + props.transaction.action.slice(1)}</td>
    {props.transaction.action === "withdraw" ? (<td>-${props.transaction.amount.toFixed(2)}</td>) :
    (<td>${props.transaction.amount.toFixed(2)}</td>)}
  </tr>
)

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const params = useParams();

  const userId = params.userId.toString();
  const account = params.account.toString();

  async function onLogout(e) {
    console.log("inside onLogout");
    e.preventDefault();

    const response1 = await fetch(`http://localhost:4000/session_check`, {
        method: "GET",
        credentials: "include"
    });
    if (!response1.ok) {
        const message = `error occured: ${response1.statusText}`;
        window.alert(message);
        navigate("/login");
        return;
    }
    const statusResponse = await response1.json();
    if (!statusResponse.role) {
        window.alert("Cannot logout if not already logged in");
        navigate("/login");
        return;
    }
    else {
        const response = await fetch(`http://localhost:4000/session_logout`, {
            method: "GET",
            credentials: "include"
        });
        if (!response.ok) {
            const message = `An error occured: ${response.statusText}`;
            window.alert(message);
            return;
        }
        const responseRecords = await response.json();
        if (responseRecords.status == "No session set") {
            console.log("logout response records: " + responseRecords.status);
            window.alert("Logged out successfully");
            navigate("/login");
            return;
        }
    }
}

  useEffect(() => {
    const fetchTransactions = async () => {

      try {
        //check if logged in as user
        //check if logged in as admin or employee
        const response1 = await fetch(`http://localhost:4000/session_check`, {
            method: "GET",
            credentials: "include"
        });
        if (!response1.ok) {
            const message = `error occured: ${response1.statusText}`;
            window.alert(message);
            window.alert("Cannot view account if not logged in as user, employee, or administrator");
            navigate("/login");
            return;
        }
        const statusResponse = await response1.json();
        if (!statusResponse.role) {
            window.alert("Cannot view account if not logged in as user, employee, or administrator");
            navigate("/login");
            return;
        }
        if (statusResponse.role.toString().toLowerCase() != "employee" && 
        statusResponse.role.toString().toLowerCase() != "administrator" &&
        statusResponse.userId.toString().toLowerCase() != userId.toString()) {
            window.alert("Cannot view account if not logged in as user, employee, or administrator");
            navigate("/login");
            return;
        }
      }
      catch (error) {
          console.error("Error checking login data:", error);
      }

      try {
        const response = await fetch(`http://localhost:4000/transactions/${userId}/${account}`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          console.error("Error fetching transactions:", response.statusText);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    };

    fetchTransactions();
  }, [transactions]);

  function transactionList(format) {
    if (format === "single") {
      return transactions.map((transaction) => {
        return (
          <TransactionSingle
            transaction={transaction}
            key={transaction._id}
          />
        );
      });
    }
    else if (format === "all") {
      return transactions.map((transaction) => {
        return (
          <TransactionAll
            transaction={transaction}
            key={transaction._id}
          />
        );
      });
    }
    else {
      return;
    }
  }

  function tableFormat() {
    if (account === "all") {
      return (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Account</th>
              <th scope="col">Date</th>
              <th scope="col">Type</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {transactionList("all")}
          </tbody>
        </table>
      )
    }
    else {
      return (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Type</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {transactionList("single")}
          </tbody>
        </table>
      )
    }
  }

  function accountFormat() {
    let accountName;

    if (account === "checking" || account === "savings") {
      accountName = account.charAt(0).toUpperCase() + account.substring(1) + " Account";
    }
    else if (account === "investing") {
      accountName = "Investment Account";
    }
    else if (account === "all") {
      return "All Accounts";
    }
    else {
      accountName = "No Account Selected";
    }

    return accountName;
  }

  return (
    <div className="transaction-history">
      <nav className="logout-nav">
          <button className="logout-button" onClick={onLogout}>Logout</button>
      </nav>
      <h2>Transaction History - {accountFormat()}</h2>
      {transactions.length === 0 ? (
        <p>No transactions found for this account.</p>
      ) : (
        tableFormat()
      )}
      <div className="actions">
        <button className="btn btn-primary" onClick={() => navigate(`/transaction`)}>
          Make a Transaction
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/balances/${userId}`)}>
          Back to Account Summary
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;
