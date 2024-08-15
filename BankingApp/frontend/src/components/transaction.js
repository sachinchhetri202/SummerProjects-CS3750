import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Transaction() {
    const [account, setAccount] = useState({
        name: "",
        userId: "",
        role: "",
        checking: 0,
        savings: 0,
        investing: 0,
        password: ""
    });
    const [form, setForm] = useState({
        userId: "",
        action: "",
        fromAccount: "",
        toAccount: "",
        amount: ""
    });
    const [updateAccount, setUpdateAccount] = useState(false);
    const AccountList = (props) => (
        <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Select Account
            </button>
            <ul className="dropdown-menu">
                <li><button type="button" className="dropdown-item" id={props.accounts.account1} onClick={(e) => updateForm({ toAccount: e.target.id })}>{props.accounts.account1}</button></li>
                <li><button type="button" className="dropdown-item" id={props.accounts.account2} onClick={(e) => updateForm({ toAccount: e.target.id })}>{props.accounts.account2}</button></li>
            </ul>
        </div>     
    );
    const AccountDisplay = (props) => (
        <div>
            <br />
            <ul className="list-group list-group-horizontal">
                <li className="list-group-item">{props.account.displayName}</li>
                <li className="list-group-item">{props.account.amount}</li>
            </ul>
        </div>
    );

    const navigate = useNavigate();

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
        async function getAccount() {
            const sessionResponse = await fetch(`http://localhost:4000/session_check`, {
                method: "GET",
                credentials: "include"
            });
            const session = await sessionResponse.json();
            if (session.role === "Customer") {
                form.userId = session.userId;
            }
            else if (session.role.toString().toLowerCase() === "employee" || session.role.toString().toLowerCase() === "administrator") {
                document.getElementById("searchForm").hidden = false;
            }
            else {
                const message = "No user is logged in.";
                window.alert(message);
                navigate("/login");
            }
            if (form.userId != "") {
                const response = await fetch(`http://localhost:4000/record/${form.userId}`, {
                    method: "GET",
                    credentials: "include"
                });
                if (!response.ok) {
                    const message = `An error occurred: ${response.statusText}`;
                    window.alert(message);
                    return;
                }
                const responseAccount = await response.json();
                setAccount(responseAccount);
                setUpdateAccount(false);
                return;
            }
            else {
                return;
            }
        }
        console.log("Inside the hook.")
        console.log(form);
        getAccount();
        return;
    },[form, updateAccount]);

    async function searchAccounts(e) {
        e.preventDefault();
        const accountNumber = e.target[0].value;
        
        if (accountNumber) {
            form.userId = accountNumber;
            form.action = "";
            form.fromAccount = "";
            form.toAccount = "";
            form.amount = "";
            const response = await fetch(`http://localhost:4000/record/${form.userId}`, {
                method: "GET",
                credentials: "include"
            });
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
            const responseAccount = await response.json();
            setAccount(responseAccount);
            document.getElementById("checking").checked = false;
            document.getElementById("savings").checked = false;
            document.getElementById("investing").checked = false;
            document.getElementById("deposit").checked = false;
            document.getElementById("withdraw").checked = false;
            document.getElementById("transfer").checked = false;
            document.getElementById("actionsForm").hidden = true;
            return;
        }
        else {
            const message = "Enter an account number.";
            window.alert(message);
            return;
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        const submission = {...form};
        submission.amount = parseFloat(submission.amount);

        console.log(submission);
        if (form.action === "deposit") {
            const response = await fetch ("http://localhost:4000/deposit", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(submission)
            }).catch(err => {
                window.alert(err);
                return;
            });
    
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
            else {
                const message = "Deposit completed successfully.";
                window.alert(message);
            }
        }
        else if (form.action === "withdraw") {
            const response = await fetch ("http://localhost:4000/withdraw", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(submission)
            }).catch(err => {
                window.alert(err);
                return;
            });
    
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
            else {
                const message = "Withdrawal completed successfully.";
                window.alert(message);
            }
        }
        else if (form.action === "transfer") {
            const response = await fetch ("http://localhost:4000/transfer", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(submission)
            }).catch(err => {
                window.alert(err);
                return;
            });

            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
            else {
                const message = "Transfer completed successfully.";
                window.alert(message);
            }
        }

        document.getElementById(form.action).checked = false;
        form.action = "";
        actionSelect();

        setUpdateAccount(true);
        setForm({
            userId: form.userId,
            action: "",
            fromAccount: form.fromAccount,
            toAccount: "",
            amount: ""
        });
        return;
    }

    function accountSelect() {
        let accounts = {
            account1: "",
            account2: ""
        };
        if (form.fromAccount == "checking") {
            accounts.account1 = "Savings",
            accounts.account2 = "Investment"
            
        }
        else if (form.fromAccount == "savings") {
            accounts.account1 = "Checking",
            accounts.account2 = "Investment"
        }
        else if (form.fromAccount == "investing") {
            accounts.account1 = "Checking",
            accounts.account2 = "Savings"
        }

        return (
            <AccountList
                accounts={accounts}
            />
        );
    }

    function showAccount(accountName) {
        let myObj = {
            account: accountName,
            displayName: "",
            amount: 0,
        };

        if (accountName == "checking" || accountName == "Checking") {
            myObj.displayName = "Checking";
            myObj.amount = account.checking;
        }
        else if (accountName == "savings" || accountName == "Savings") {
            myObj.displayName = "Savings";
            myObj.amount = account.savings;
        }
        else if (accountName == "investing" || accountName == "Investment") {
            myObj.displayName = "Investment";
            myObj.amount = account.investing;
        }
        else {
            return (
                <div>
                    <span className="placeholder w-20"></span>
                    <br />
                    <span className="placeholder w-20"></span>
                </div>
            )
        }

        return (
            <AccountDisplay
                account={myObj}
            />
        )
    }

    function showForm() {
        if (form.toAccount) {
            return (
                <form className="row g-2" onSubmit={onSubmit}>
                    <div className="col-auto">
                        <div className="input-group mb-3">
                            <span className="input-group-text">$</span>
                            <input 
                                type="text"
                                className="form-control"
                                id="transferAmountBox"
                                value={form.amount}
                                onChange={(e) => updateForm({ amount: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="col-auto">
                    <button type="submit" className="btn btn-primary">Transfer</button>
                    </div>
                </form>
            )
        }
        else {
            return (
                <div>
                    <p aria-hidden="true">
                       <span className="placeholder col-2 placeholder-lg"></span>
                       <a className="btn btn-primary disabled placeholder-sm col-1" aria-disabled="true"></a>
                    </p>
                </div>    
            )
        }
    }

    function showActions(e) {
        e.preventDefault();
        if (form.fromAccount !== "") {
            document.getElementById("actionsForm").hidden = false;
        }
        else {
            return;
        }
    }

    function actionSelect() {
        if (form.action === "transfer") {
            return (
                <div id="transferForm">
                    <h1>Transfer</h1>
                    <h3>From Account</h3>
                    {showAccount(form.fromAccount)}
                    <br />
                    <h3>To Account</h3>
                    {accountSelect()}
                    {showAccount(form.toAccount)}
                    <br />
                    {showForm()}
                </div>
            )
        }
        else if (form.action === "deposit") {
            return (
                <form className="row g-3" onSubmit={onSubmit}>
                    <div className="col-auto">
                        <label className="form-label">Amount to Deposit</label>
                    </div>
                    <div className="col-auto">
                        <div className="input-group mb-3">
                            <span className="input-group-text">$</span>
                            <input type="text" className="form-control" id="depositAmount" value={form.amount}
                            onChange={(e) => updateForm({ amount: e.target.value })} />
                        </div>
                    </div>
                    <div className="col-auto">
                        <button type="submit" className="btn btn-primary">Deposit</button>
                    </div>
                </form>
            )
        }
        else if (form.action === "withdraw") {
            return (
                <form className="row g-3" onSubmit={onSubmit}>
                    <div className="col-auto">
                        <label className="form-label">Amount to Withdraw</label>
                    </div>
                    <div className="col-auto">
                        <div className="input-group mb-3">
                            <span className="input-group-text">$</span>
                            <input type="text" className="form-control" id="withdrawAmount" value={form.amount}
                            onChange={(e) => updateForm({ amount: e.target.value })} />
                        </div>
                    </div>
                    <div className="col-auto">
                        <button type="submit" className="btn btn-primary">withdraw</button>
                    </div>
                </form>
            )
        }
        else {
            return;
        }
    }

    function updateForm(jsonObj) {
        if (jsonObj.fromAccount) {
            jsonObj = {
                fromAccount: jsonObj.fromAccount,
                toAccount: ""
            };
        }

        return setForm((prevJsonObj) => {
            return { ...prevJsonObj, ...jsonObj};
        });
    }

    return (
        <div>
            <nav className="logout-nav">
                <button className="logout-button" onClick={onLogout}>Logout</button>
            </nav>
            <h1>Accounts</h1>
            <div id="searchForm" hidden>
                <label>Account Search</label>
                <form onSubmit={searchAccounts}>
                    <input 
                        type="text"
                        id="accountNumberBox"
                    />
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>
            </div>
            <br />
            <h3>Account Number: {form.userId}</h3>
            <form onSubmit={showActions}>
                <table className="table">
                    <thead>
                        <tr>
                        <th scope="col">Select</th>
                        <th scope="col">Account</th>
                        <th scope="col">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row"><input className="form-check-input" type="radio" name="flexRadioDefault" id="checking" onChange={(e) => updateForm({ fromAccount: e.target.id })}/></th>
                            <td>
                                <label className="form-check-label">Checking</label>
                            </td>
                            <td><label>{account.checking}</label></td>
                        </tr>
                        <tr>
                            <th scope="row"><input className="form-check-input" type="radio" name="flexRadioDefault" id="savings" onChange={(e) => updateForm({ fromAccount: e.target.id })}/></th>
                            <td>
                                <label className="form-check-label">Savings</label>
                            </td>
                            <td><label>{account.savings}</label></td>
                        </tr>
                        <tr>
                            <th scope="row"><input className="form-check-input" type="radio" name="flexRadioDefault" id="investing" onChange={(e) => updateForm({ fromAccount: e.target.id })}/></th>
                            <td>
                                <label className="form-check-label">Investment</label>
                            </td>
                            <td><label>{account.investing}</label></td>
                        </tr>
                    </tbody>
                </table>
                <button type="submit" className="btn btn-primary">Select Account</button>
            </form>
            <br />
            <div id="actionsForm" hidden>
                <h3>Select Action:</h3>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="deposit" name="actionSelectRadio" value="deposit" onChange={(e) => updateForm({ action: e.target.value })} />
                    <label className="form-check-label">Deposit</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="withdraw" name="actionSelectRadio" value="withdraw" onChange={(e) => updateForm({ action: e.target.value })} />
                    <label className="form-check-label">Withdraw</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="transfer" name="actionSelectRadio" value="transfer" onChange={(e) => updateForm({ action: e.target.value })} />
                    <label className="form-check-label">Transfer</label>
                </div>
            </div>
            <br />
            {actionSelect()}
        </div>
    );
}