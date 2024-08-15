import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../styles.css';

export default function Balances() {
    const [account, setAccount] = useState({
        checking: 0,
        savings: 0,
        investing: 0,
    });

    const { userId } = useParams();
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
        async function fetchAccountData() {
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
                const response = await fetch(`http://localhost:4000/record/${userId}`);
                if (!response.ok) {
                    const message = `An error occurred: ${response.statusText}`;
                    window.alert(message);
                    console.log(message);
                    return;
                }

                const accountData = await response.json();
                console.log("Fetched account data:", accountData);
                setAccount(accountData);
            } catch (error) {
                console.error("Error fetching account data:", error);
            }
        }

        fetchAccountData();
    }, [userId]);

    function handleClick(accountType) {
        console.log(accountType);
        navigate(`/transactions/${userId}/${accountType}`);
    };

    return (
        <div className="balance-container">
            <nav className="logout-nav">
                <button className="logout-button" onClick={onLogout}>Logout</button>
            </nav>
            <h3>Account Balances</h3>
            <div className="account-boxes">
                <div className="account-box" onClick={() => handleClick('checking')}>
                    <h4>Checking</h4>
                    <p>${account.checking}</p>
                </div>
                <div className="account-box" onClick={() => handleClick('savings')}>
                    <h4>Savings</h4>
                    <p>${account.savings}</p>
                </div>
                <div className="account-box" onClick={() => handleClick('investing')}>
                    <h4>Investment</h4>
                    <p>${account.investing}</p>
                </div>
            </div>
            <br />
            <div className="account-boxes">
                <div className="button-box" onClick={() => handleClick('all')}>
                    <h4>View All Transactions</h4>
                </div>
            </div>
        </div>
    );
}
