import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Register from "./components/registration.js";
import Login from "./components/login.js";
import TransactionHistory from "./components/transaction_history.js";
import Transaction from "./components/transaction.js";
import Balances from "./components/balances.js";
import RoleChange from "./components/role_change.js";

const App = () => {
  const [userData, setUserData] = useState({
    username: "",
    role: ""
  });

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register onLogin={setUserData}/>} />
        <Route path="/login" element={<Login onLogin={setUserData}/>} />
        <Route path="/transaction" element={<Transaction login={userData} />} />
        <Route path="/balances/:userId" element={<Balances />} />
        <Route path="/transactions/:userId/:account" element={<TransactionHistory />} />
        <Route path="/roleChange" element={<RoleChange />} />
      </Routes>
    </div>
  );
}
export default App;

