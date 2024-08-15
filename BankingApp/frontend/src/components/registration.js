import React, { useState } from "react";
import { useNavigate } from "react-router";

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        role: "",
        userId: "",
        password: "",
        checking: 0,
        savings: 0,
        investment: 0
    });

    const navigate = useNavigate();

    function updateForm(jsonObj) {
        return setForm((prevJsonObj) => {
            return { ...prevJsonObj, ...jsonObj};
        });
    }

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

    function handleClick() {
        navigate("/roleChange");
    };

    async function onSubmit(e) {
        console.log("inside onSubmit");
        e.preventDefault();
        
        const response1 = await fetch(`http://localhost:4000/session_check`, {
            method: "GET",
            credentials: "include"
        });
        if (!response1.ok) {
            const message = `error occured: ${response1.statusText}`;
            window.alert(message);
            window.alert("Cannot register a new account if not logged in as employee or administrator");
            navigate("/login");
            return;
        }
        const statusResponse = await response1.json();
        if (!statusResponse.role) {
            window.alert("Cannot register a new account if not logged in as employee or administrator");
            navigate("/login");
            return;
        }
        if (statusResponse.role.toString().toLowerCase() != "employee" && statusResponse.role.toString().toLowerCase() != "administrator") {
            window.alert("Cannot register a new account if not logged in as employee or administrator.");
            return;
        }

        console.log("FORM BEFORE SESSION ASSIGNMENT: ");
        console.log(JSON.stringify(form));
        var sha256 = require('js-sha256');
        var hash = sha256(form.password.toString())
        const newPassword = hash
        const newForm = {
            name: form.name,
            role: form.role,
            userId: form.userId,
            password: newPassword,
            checking: 0,
            savings: 0,
            investment: 0
        }
        // const response = await fetch(`http://localhost:4000/session_register`,
        //     {
        //         method: "POST",
        //         credentials: 'include',
        //         headers: {
        //             "Content-type": "application/json"
        //         },
        //         body: JSON.stringify(newForm),
        //     }
        // );
        // console.log("ran session_register, about to check response");
        // console.log("status: " + response.status.toString() + " " +  response.statusText.toString());
        // if (!response.ok) {
        //     const message = `error occured: ${response.statusText}`;
        //     console.log("error calling session_register: " + message);
        //     window.alert(message);
        //     return;
        // }
        if(response1.status.toString() === "200"){
            console.log("backend evaluated to 200 success");
            await fetch("http://localhost:4000/record/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newForm),
            })
            .catch(error => {
                window.alert(error);
                return;
            });
            console.log("about to navigate");
            navigate("/balances/" + form.userId.toString());
        }
        else if (response1.status.toString() === "500") {
            console.log("backend evaluated to 500 not success");
            window.alert("session not set, already exists");
        }
        else {
            console.log("UNEXPECTED BACKEND RESULT RETURN");
            window.alert("session not set, already exists");
        }
    }
    return (
        <div className="login-container">
            <nav className="logout-nav">
                <button className="logout-button" onClick={onLogout}>Logout</button>
            </nav>
            <h3 className="login-header">Register New Account</h3>
            <form onSubmit={onSubmit}>
                <div className="login-input">
                    <label className="login-label">Name: </label>
                    <input
                        className="login-input-box"
                        type="text"
                        id="name"
                        value={form.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                    />
                </div>
                <div className="login-input">
                    <label className="login-label">Role: </label>
                    <input
                        className="login-input-box"
                        type="text"
                        id="role"
                        value={form.role}
                        onChange={(e) => updateForm({ role: e.target.value })}
                    />
                </div>
                <div className="login-input">
                    <label className="login-label">userId: </label>
                    <input
                        className="login-input-box"
                        type="text"
                        id="userId"
                        value={form.userId}
                        onChange={(e) => updateForm({ userId: e.target.value })}
                    />
                </div>
                <div className="login-input">
                    <label className="login-label">Password: </label>
                    <input
                        className="login-input-box"
                        type="text"
                        id="password"
                        value={form.password}
                        onChange={(e) => updateForm({ password: e.target.value })}
                    />
                </div>
                <br/>
                <div>
                    <input
                        className="login-button"
                        type="submit"
                        value="Create"
                    />
                </div>
            </form>
            <div className="account-boxes">
                <div className="button-box" onClick={() => handleClick()}>
                    <h4>Change Account Roles</h4>
                </div>
            </div>
        </div>
    );
}