const express = require("express");
const routes = express.Router();
// This will help us connect to the database
const dbo = require("../db/conn");

routes.route("/session_check").get(async function (req, res) {
  console.log("in session_check");
  let status = "";
  console.log("current session: " + req.session.userId);
  console.log("body: " + req.body);
  console.log("input email: " + req.body.userId);

  try {
      console.log("In session check");
      if (req.session.userId) {
        status = "Session exists";
        console.log(status);
        const resultObj = { status: status, role: req.session.role, userId: req.session.userId };
        res.json(resultObj);
      }
      else {
        status = "Session does not exist";
        console.log(status);
        const resultObj = { status: status, role: "", userId: "" };
        res.json(resultObj);
      }
    } catch (err) {
        throw err;
    }
});

routes.route("/session_logout").get(async function (req, res) {
  console.log("in session_delete");
  req.session.destroy();

  let status = "No session set";
  
  const resultObj = { status: status};

  res.json(resultObj);
});

routes.route("/session_register").post(async function (req, res) {
    console.log("in session_register");
    let status = "";
    console.log("current session: " + req.session.userId);
    console.log("body: " + req.body);
    console.log("input userId: " + req.body.userId);
    console.log("input password: " + req.body.password);

    try {
        let db_connect = dbo.getDb();
        const records = db_connect.collection("Accounts");
        const query = {userId: req.body.userId};
        const options = {};
        const cursor = records.find(query, options);
        const numResults = await records.countDocuments(query);
        console.log(`Found ${numResults} documents`);
        if (numResults === 0) {
          if ((req.session.userId != req.body.userId) && req.body.userId && req.body.password) {
            req.session.userId = req.body.userId;
            req.session.role = req.body.role;
            status = "Session set";
            console.log(status + " " + req.body.userId);
            const resultObj = { status: status };
            res.json(resultObj);
            //res.status(400).json(status);
          } else if ((req.session.userId == req.body.userId) && req.body.userId && req.body.password) {
            status = "Session already exists";
            console.log(status + " " + req.body.userId);
            const resultObj = { status: status };
            // req.session.destroy();
            // console.log("TEMP destroy session");
            //res.json(resultObj);
            res.status(500).json(status);
          }
        }
        else if (numResults === 1) {
            status = "Session already exists";
            console.log(status + " " + req.body.userId);
            const resultObj = { status: status };
            //res.json(resultObj);
            res.status(500).json(status);
        }
        else {
          res.status(500).json({message: "BAD ERROR: found more than one result for email+password combo"});
        }
      } catch (err) {
          throw err;
      }
});

routes.route("/session_login").post(async function (req, res) {
    console.log("in session_login");
    let status = "";
  
    try {
        let db_connect = dbo.getDb();
        const records = db_connect.collection("Accounts");
        console.log("LOGIN SESSION userId:");
        console.log(req.session.userId);
        const query = {userId: req.body.userId, password: req.body.password};
        const cursor = await records.find(query).toArray();
        console.log(cursor);
        const numResults = await records.countDocuments(query);
        console.log(`Found ${numResults} documents`);
        if (numResults === 1) {
          if (!req.session.userId) {
            req.session.userId = req.body.userId;
            req.session.role = cursor[0].role;
            console.log("role set:");
            console.log(req.session.role);
            status = "Session set";
            console.log(status + " " + req.body.userId);
            const resultObj = { status: status };
            res.json(resultObj);
          }
          else if (req.session.userId) {
            status = "Session already exists";
            console.log(status + " " + req.session.userId);
            const resultObj = { status: status };
            res.json(resultObj);
          }
        }
        else if (numResults === 0) {
            status = "Session does not exist in db";
            console.log(status + " " + req.body.userId);
            const resultObj = { status: status };
            res.json(resultObj);
        }
        else {
          res.status(500).json({status: "BAD ERROR: found more than one result for email+password combo"});
        }
      } catch (err) {
          throw err;
      }
  });


module.exports = routes;