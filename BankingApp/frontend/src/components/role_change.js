import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleChange() {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [newRole, setNewRole] = useState("");
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
        async function fetchUsers() {
            const response = await fetch(`http://localhost:4000/users`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const usersData = await response.json();
                setUsers(usersData);
            } else {
                window.alert("Failed to fetch users.");
            }
        }

        async function checkSession() {
            const response = await fetch(`http://localhost:4000/session_check`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const sessionData = await response.json();
                if (!sessionData.role || sessionData.role.toString().toLowerCase() !== "administrator") {
                    console.log("Current role:", sessionData.role);
                    window.alert("Unauthorized access. Only administrators can change roles.");
                    navigate("/login");
                } else {
                    console.log("Session validated as administrator.");
                    fetchUsers();
                }
            } else {
                window.alert("You must be logged in to access this page.");
                navigate("/login");
            }
        }

        checkSession();
    }, [navigate]);

    async function onSubmit(userId, role) {
        const response = await fetch(`http://localhost:4000/changeRole`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, newRole }), 
        });

        if (response.ok) {
            window.alert("Role updated successfully.");
            setUsers(users.map(user => user.userId === userId ? { ...user, role: role } : user));
        } else {
            const errorData = await response.json();
            window.alert(`Error: ${errorData.message}`);
        }
    }

    return (
        <div className="role-change-container">
            <nav className="logout-nav">
                <button className="logout-button" onClick={onLogout}>Logout</button>
            </nav>
            <h3>Change User Role</h3>
            {users.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Current Role</th>
                            <th>New Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.name}</td>
                                <td>{user.role}</td>
                                <td>
                                    <select
                                        value={selectedUserId === user.userId ? newRole : ""}
                                        onChange={(e) => {
                                            setSelectedUserId(user.userId);
                                            setNewRole(e.target.value);
                                        }}
                                    >
                                        <option value="">Select a role</option>
                                        <option value="customer">Customer</option>
                                        <option value="employee">Employee</option>
                                        <option value="administrator">Administrator</option>
                                    </select>
                                </td>
                                <td>
                                    <button 
                                        onClick={() => onSubmit(user.userId, newRole)}
                                        disabled={!newRole || selectedUserId !== user.userId}
                                    >
                                        Update Role
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Loading users...</p>
            )}
        </div>
    );
}
