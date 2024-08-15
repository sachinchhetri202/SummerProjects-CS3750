const express = require("express");
 
const recordRoutes = express.Router();
 
const dbo = require("../db/conn");
 
const ObjectId = require("mongodb").ObjectId;

recordRoutes.route("/record/:userId").get(async (req, res) => {
    try {
      let db_connect = dbo.getDb();
      let myquery = { userId: req.params.userId };
      const result = await db_connect.collection("Accounts").findOne(myquery);
      let myobj = {
        name: result.name,
        userId: result.userId,
        role: result.role,
        checking: result.checking,
        savings: result.savings,
        investing: result.investing,
        password: result.password
      };
      res.json(myobj);
    } catch(err) {
      throw err;
    }
  });
 

  recordRoutes.route("/record/add").post(async (req, res) => {
    try {
      console.log("goes in add route");
      //ensure email does not already exist
      // Execute query 
      let db_connect = dbo.getDb();
      const records = db_connect.collection("Accounts");
      const query = {userId: req.body.userId };
      const options = {};
      const cursor = records.find(query, options);
      const numResults = await records.countDocuments(query);
      
      // Print a message if no documents were found
      if (numResults === 0) {
        console.log("No documents found!");
        let myobj = {
            name: req.body.name,
            userId: req.body.userId,
            role: req.body.role,
            checking: req.body.checking,
            savings: req.body.savings,
            investing: req.body.investing,
            password: req.body.password
        };
        const result = await db_connect.collection("Accounts").insertOne(myobj);
        console.log("creating object");
        res.json(myobj);
      } else {
        console.log(`Found ${numResults} documents`);
      }
  
      // Print returned documents
      for await (const doc of cursor) {
        console.dir(doc);
      }
    }catch (err) {
      throw err;
    }
  });

  recordRoutes.route("/accounts/:userId/:type").get(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        let myquery = { userId: req.params.userId, type: req.params.type };
        const result = await db_connect.collection("Accounts").findOne(myquery);
        res.json({ balance: result.balance });
    } catch (err) {
        res.status(500).send(err);
    }
});


  recordRoutes.route("/transactions/:userId/:account").get(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        let myquery;
        if (req.params.account == "all") {
          myquery = { userId: req.params.userId };
        }
        else {
          myquery = { userId: req.params.userId, account: req.params.account };
        }
        const transactions = await db_connect.collection("Transactions").find(myquery).toArray();
        res.json(transactions);
    } catch (err) {
        res.status(500).send(err);
    }
  });

  recordRoutes.route("/changeRole").post(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const { userId, newRole } = req.body;

        console.log("Received userId:", userId);
        console.log("Received newRole:", newRole); 

        // Check if admin
        if (req.session.role && req.session.role.toLowerCase() !== 'administrator') {
            console.log("Unauthorized access attempt by user with role:", req.session.role);
            return res.status(403).json({ message: "Unauthorized" });
        }

        const myquery = { userId: userId };
        const newValues = { $set: { role: newRole } };
        const result = await db_connect.collection("Accounts").updateOne(myquery, newValues);

        if (result.modifiedCount === 1) {
            res.json({ message: "Role updated successfully" });
        } else {
            res.status(400).json({ message: "Failed to update role" });
        }
    } catch (err) {
        res.status(500).send(err);
    }
  });

  recordRoutes.route("/users").get(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const users = await db_connect.collection("Accounts").find({}).toArray();
        res.json(users);
    } catch (err) {
        res.status(500).send(err);
    }
  });

  // This section will deposit money into the specified account
recordRoutes.route("/deposit").post(async (req, res) => {
  try {
      let depositAmount = req.body.amount;
      let result = {
          status: ""
      };
      if (depositAmount >= 0) {
          let db_connect = dbo.getDb("Banking");
          let myQuery = { userId: req.body.userId };
          let accountType = req.body.fromAccount;
          const account = await db_connect.collection("Accounts").find(myQuery).toArray();
          let newAmount;
          let newValues;
          if (accountType.toLowerCase() == "checking") {
              newAmount = depositAmount + account[0].checking;
              newValues = {
                  $set: {
                      checking: newAmount
                  }
              };
          }
          else if (accountType.toLowerCase() == "savings") {
              newAmount = depositAmount + account[0].savings;
              newValues = {
                  $set: {
                      savings: newAmount
                  }
              };
          }
          else if (accountType.toLowerCase() == "investing") {
              newAmount = depositAmount + account[0].investing;
              newValues = {
                  $set: {
                      investing: newAmount
                  }
              };
          }
          else {
              result.status = "No account was selected.";
              res.statusMessage = result.status;
              res.status(400).json(result);
          }
          const response = await db_connect.collection("Accounts").updateOne(myQuery, newValues);
          result.status = "Deposit is successful.";

          let currentDate = new Date();
          const transaction = {
              userId: myQuery.userId,
              account: accountType,
              date: currentDate.toLocaleString(),
              action: "deposit",
              amount: depositAmount,
              total: newAmount
          }
          const recordTransaction = await db_connect.collection("Transactions").insertOne(transaction);

          res.statusMessage = result.status;
          res.json(result);
      }
      else {
          result.status = "The deposit amount cannot be a negative number.";
          res.statusMessage = result.status;
          res.status(400).json(result);
      }
  }
  catch (err) {
      throw err;
  }
});

// This section will withdraw money from the specified account, assuming there is enough to withdraw
recordRoutes.route("/withdraw").post(async (req, res) => {
  try {
      let withdrawAmount = req.body.amount;
      let result = {
          status: ""
      };
      if (withdrawAmount >= 0) {
          let db_connect = dbo.getDb("Banking");
          let myQuery = { userId: req.body.userId };
          let accountType = req.body.fromAccount;
          const account = await db_connect.collection("Accounts").find(myQuery).toArray();
          let newAmount;
          let newValues;
          if (accountType.toLowerCase() == "checking" && withdrawAmount <= account[0].checking) {
              newAmount = account[0].checking - withdrawAmount;
              newValues = {
                  $set: {
                      checking: newAmount
                  }
              };
          }
          else if (accountType.toLowerCase() == "savings" && withdrawAmount <= account[0].savings) {
              newAmount = account[0].savings - withdrawAmount;
              newValues = {
                  $set: {
                      savings: newAmount
                  }
              };
          }
          else if (accountType.toLowerCase() == "investing" && withdrawAmount <= account[0].investing) {
              newAmount = account[0].investing - withdrawAmount;
              newValues = {
                  $set: {
                      investing: newAmount
                  }
              };
          }
          else {
              result.status = "The withdrawal failed. Make sure the withdrawal amount is not a negative number " +
                              "and is less than or equal to the amount in the specified account.";
              res.statusMessage = result.status;
              res.status(400).json(result);
              return;
          }
          await db_connect.collection("Accounts").updateOne(myQuery, newValues);
          result.status = "The withdrawal was successful. The new account balance is " + newAmount;
          
          let currentDate = new Date();
          const transaction = {
              userId: myQuery.userId,
              account: accountType,
              date: currentDate.toLocaleString(),
              action: "withdraw",
              amount: withdrawAmount,
              total: newAmount
          }
          const recordTransaction = await db_connect.collection("Transactions").insertOne(transaction);

          res.statusMessage = result.status;
          res.json(result);
      }
      else {
          result.status = "The withdrawal amount cannot be a negative number.";
          res.statusMessage = result.status;
          res.status(400).json(result);
          return;
      }
  }
  catch (err) {
      throw err;
  }
});

  recordRoutes.route("/transfer").post(async (req, res) => {
    try {
        let transferAmount = parseInt(req.body.amount);
        let result = {
            status: ""
        };
        if (transferAmount >= 0) {
            let db_connect = dbo.getDb("Banking");
            let myQuery = { userId: req.body.userId };
            let withdrawAccount = req.body.fromAccount;
            let depositAccount = req.body.toAccount;
            let currentDate = new Date();
            const account = await db_connect.collection("Accounts").find(myQuery).toArray();
            let transaction1 = {
              userId: myQuery.userId,
              account: withdrawAccount,
              date: currentDate.toLocaleString(),
              action: "withdraw",
              amount: transferAmount,
              total: 0
            }
            let transaction2 = {
              userId: myQuery.userId,
              account: depositAccount,
              date: currentDate.toLocaleString(),
              action: "deposit",
              amount: transferAmount,
              total: 0
            }
            let newCheckingAmount;
            let newSavingsAmount;
            let newInvestAmount;
            let newValues;
            if (withdrawAccount.toLowerCase() == "checking" && transferAmount <= account[0].checking && depositAccount.toLowerCase() == "savings") {
                newCheckingAmount = account[0].checking - transferAmount;
                newSavingsAmount = account[0].savings + transferAmount;
                newInvestAmount = account[0].investing;
                transaction1.total = newCheckingAmount;
                transaction2.total = newSavingsAmount;
            }
            else if (withdrawAccount.toLowerCase() == "checking" && transferAmount <= account[0].checking && depositAccount.toLowerCase() == "investment") {
                newCheckingAmount = account[0].checking - transferAmount;
                newInvestAmount = account[0].investing + transferAmount;
                newSavingsAmount = account[0].savings;
                transaction1.total = newCheckingAmount;
                transaction2.total = newInvestAmount;
            }
            else if (withdrawAccount.toLowerCase() == "savings" && transferAmount <= account[0].savings && depositAccount.toLowerCase() == "checking") {
                newSavingsAmount = account[0].savings - transferAmount;
                newCheckingAmount = account[0].checking + transferAmount;
                newInvestAmount = account[0].investing;
                transaction1.total = newSavingsAmount;
                transaction2.total = newCheckingAmount;
            }
            else if (withdrawAccount.toLowerCase() == "savings" && transferAmount <= account[0].savings && depositAccount.toLowerCase() == "investment") {
                newSavingsAmount = account[0].savings - transferAmount;
                newInvestAmount = account[0].investing + transferAmount;
                newCheckingAmount = account[0].checking;
                transaction1.total = newSavingsAmount;
                transaction2.total = newInvestAmount;
            }
            else if (withdrawAccount.toLowerCase() == "investing" && transferAmount <= account[0].investing && depositAccount.toLowerCase() == "checking") {
                newInvestAmount = account[0].investing - transferAmount;
                newCheckingAmount = account[0].checking + transferAmount;
                newSavingsAmount = account[0].savings;
                transaction1.total = newInvestAmount;
                transaction2.total = newCheckingAmount;
            }
            else if (withdrawAccount.toLowerCase() == "investing" && transferAmount <= account[0].investing && depositAccount.toLowerCase() == "savings") {
                newInvestAmount = account[0].investing - transferAmount;
                newSavingsAmount = account[0].savings + transferAmount;
                newCheckingAmount = account[0].checking;
                transaction1.total = newInvestAmount;
                transaction2.total = newSavingsAmount;
            }
            else {
                const status = "The transfer failed. Make sure the transfer amount is not a negative number " +
                         "and is less than or equal to the amount in the specified withdrawal account.";
                const result = { status: status };
                res.statusMessage = status;
                res.status(400).json(result);
                return;
            }
            newValues = {
                $set: {
                    userId: req.body.userId,
                    checking: newCheckingAmount,
                    savings: newSavingsAmount,
                    investing: newInvestAmount
                }
            }
            const result = await db_connect.collection("Accounts").updateOne(myQuery, newValues);
            result.status = "The transfer was successful.";
            
            const recordTransaction = await db_connect.collection("Transactions").insertOne(transaction1);
            const recordTransaction2 = await db_connect.collection("Transactions").insertOne(transaction2);

            res.statusMessage = result.status;
            res.json(result);
        }
        else {
            result.status = "The transfer amount cannot be a negative number.";
            res.statusMessage = result.status;
            res.status(400).json(result);
        }
    }
    catch (err) {
        throw err;
    }
});

  module.exports = recordRoutes;