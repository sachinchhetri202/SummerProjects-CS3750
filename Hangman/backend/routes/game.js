const express = require("express");
const gameRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

// Starting a new game
gameRoutes.route("/new").get(async (req, res) => {
    try {
        console.log("In new get route");
        const dbConnect = dbo.getDb();
        console.log("Connected to db");
        
        const rand_num = Math.floor(Math.random() * 10000);
        const result = await dbConnect.collection("words").find({"wordId": rand_num}).project({"word": 0}).toArray();

        res.json(result);  
    } catch (err) {
        console.error(err);
        res.status(500).send("Error starting new game!");
    }
});

// Guess a letter
gameRoutes.route("/guess/:id/:letter").get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb("HangmanWords");
        let guessedLetter = req.params.letter;
        let selectedWordId = parseInt(req.params.id);

        const result = await dbConnect.collection("words").find({"wordId": selectedWordId}).toArray();
        const word = result[0].word;
        let positions = [];

        for (let i = 0; i < word.length; i++) {
            if (guessedLetter.toLowerCase() == word[i]) {
                positions.push(i);
            }
        }

        res.send(positions);
    } catch (err) {
        res.status(500).send("Error guessing the letter!!");
    }
});

gameRoutes.route("/reveal/:id").get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb("HangmanWords");
        let selectedWordId = parseInt(req.params.id);

        const result = await dbConnect.collection("words").find({"wordId": selectedWordId}).toArray();

        res.send(result[0]);
    } catch (err) {
        res.status(500).send("Error retrieving the word!!");
    }
});

// Get top 10 high scores
gameRoutes.route("/highscores/:wordLength").get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const wordLength = parseInt(req.params.wordLength);

        const highScores = await dbConnect.collection("scores")
            .find({ wordLength: wordLength })
            .sort({ attempts: 1 })
            .limit(10)
            .toArray();
        res.json(highScores);
    } catch (err) {
        res.status(500).send("Error fetching high scores!");
    }
});

// Saves the score
gameRoutes.route("/save").post(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const newScore = {
            playersName: req.body.playersName,
            attempts: req.body.attempts,
            wordLength: req.body.wordLength
        };

        await dbConnect.collection("scores").insertOne(newScore);
        res.send("Score Saved!!");
    } catch (err) {
        res.status(500).send("Error saving score!");
    }
});

// Loads words into the database 
gameRoutes.route("/loadWords").post(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        let myobj = {
            word: req.body.word,
            wordLength: req.body.wordLength,
            wordId: req.body.wordId
        };

        const result = db_connect.collection("words").insertOne(myobj);
        res.json(result);
    }
    catch (err) {
        throw err;
    }
});

module.exports = gameRoutes;
