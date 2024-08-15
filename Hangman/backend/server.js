const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config({ path: "./config.env" });

const port = process.env.PORT || 4000;

app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
        mongoUrl: process.env.ATLAS_URI
    })
}));

app.use(express.json());
app.use(require("./routes/game"));
app.use(require("./routes/session"));

const dbo = require("./db/conn");

app.get("/", (req, res) => {
    res.send("Hangman API is working!");
});

app.listen(port, () => {
    dbo.connectToServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
    console.log(`Server is running on port ${port}`);
});
