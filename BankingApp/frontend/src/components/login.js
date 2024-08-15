import React, { useState } from "react";
import { useNavigate } from "react-router";

export default function Login() {
    const [form, setForm] = useState({
        userId: 0,
        password: "",
    });

    const navigate = useNavigate();
    function updateForm(jsonObj) {
        return setForm((prevJsonObj) => {
            return { ...prevJsonObj, ...jsonObj};
        });
    }

    async function onSubmit(e) {
        e.preventDefault();
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
        const response = await fetch(`http://localhost:4000/session_login`,
            {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(newForm),
            }
        );
        if (!response.ok) {
            window.alert("Could not login, user is not registered or session already exists");
            return;
        }
        console.log("ran session_login, about to check response");
        const responseEval = await response.json();
        console.log("status: " + responseEval.status.toString());
        if(response.status.toString() === "200"){
            console.log("LOGIN STATUS:");
            console.log(responseEval.status);
            if (responseEval.status === "Session already exists") {
                window.alert("Could not login, session already exists");
                return;
            }
            if (responseEval.status === "Session does not exist in db") {
                window.alert("Could not login login info is incorrect");
                return;
            }
            console.log("about to navigate");
            navigate(`/balances/${form.userId}`);
        } else {
            window.alert("Could not login, user is not registered or session already exists");
        }
    }
    return (
        <div className="login-container">
            <h3 className="login-header">Login</h3>
            <form onSubmit={onSubmit}>
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
                        value="Login"
                    />
                </div>
            </form>
        </div>
    );
}