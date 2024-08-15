const express = require("express");
const routes = express.Router();
const dbo = require("../db/conn");

// Creates a new account with the provided credentials
routes.route("/session_set").post(async function (req, res) {
    let status = "";
    if (!req.session.username || req.session.username != req.body.name) {
        req.session.username = req.body.name;
        status = "Session set";
    }
    else {
        status = "Session already existed";
    }
    const resultObj = { status: status };

    res.json(resultObj);
});

// Returns if there is a user logged in or not
routes.route("/session_get").get(async function (req, res) {
    let myObj = {
        username: ""
    };
    if (req.session.username) {
        myObj.username = req.session.username;
    }

    res.json(myObj);
})

routes.route("/session_delete").get(async function (req, res) {
    req.session.destroy();

    let status = "No session set";

    const resultObj = { status: status };

    res.json(resultObj);
})

module.exports = routes;