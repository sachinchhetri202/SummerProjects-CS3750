import React, {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";

export default function Hangman({ onFinish }) {
    const alphabets = ["A", "B", "C", "D", "E", "F", "G",
        "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R",
        "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const [wordId, setWordId] = useState("");
    const [wordLen, setWordLen] = useState(0);
    const [imageName, setImageName] = useState("./1.jpeg");
    const [imageNum, setImageNum] = useState(1);
    const [maskedWord, setMaskedWord] = useState("");
    const [playerName, setPlayerName] = useState({ name: "" });
    const [guessAttempts, setGuessAttempts] = useState(0);
    const [gameMessage, setGameMessage] = useState("");
    const [revealedWord, setRevealedWord] = useState("");

    useEffect(() => {
        console.log(wordId)
        console.log(maskedWord)
    }, [maskedWord, wordId, wordLen, imageName, imageNum]);

    async function SetWordId() {
        let new_word_id = wordId
        let new_word_len = wordLen
        var button = document.getElementById("startGame");
        button.setAttribute("disabled", "");
        if (new_word_id == "") {
            const response = await fetch(`http://localhost:4000/new`);
            if (!response.ok) {
                const message = `An error occured: ${response.statusText}`;
                window.alert(message);
                navigate("/");
            }
            const responseRecords = await response.json();
            new_word_id = responseRecords[0].wordId
            new_word_len = responseRecords[0].wordLength
            setWordId(new_word_id)
            setWordLen(new_word_len)
            let start_masked_word = ""
            for (let i = 0; i < new_word_len; i++) {
                start_masked_word = start_masked_word + "_ "
            }
            setMaskedWord(start_masked_word)
        }
    }

    const navigate = useNavigate();

    async function onClickLetter(letter) {
        console.log("in onClickLetter")
        console.log("letter:")
        console.log(letter)
        const attempts = guessAttempts + 1;
        var button = document.getElementById(letter);
        button.setAttribute("disabled", "");
        let new_word_id = wordId
        if (letter != "" && new_word_id != null && letter != null) {
            const guess = {
                letter: letter
            }
            const response = await fetch(`http://localhost:4000/guess/${wordId}/${letter}`);
            console.log("ran id guess, about to check response");
            console.log("status: " + response.status.toString() + " " +  response.statusText.toString());
            if (!response.ok) {
                const message = `An error occured: ${response.statusText}`;
                window.alert(message);
                navigate("/");
            }
            const record = await response.json();
            console.log("guess response:")
            console.log(record)
            if (record.length == 0) {
                console.log("Inside the hangman.")
                const new_num = imageNum + 1
                const new_name = new_num.toString() + ".jpeg"
                setImageNum(new_num)
                setImageName(new_name)
                if (new_num == 7) {
                    console.log("Inside lose condition - hanged.");
                    const message = "Oh no! You have been hanged!";
                    setGameMessage(message);
                    revealWord();
                }
            }
            else {
                let guessWord = maskedWord.split(" ");
                for (let i = 0; i < record.length; i++) {
                    guessWord[record[i]] = letter;
                }
                let newMaskedWord = "";
                for (let i = 0; i < guessWord.length; i++) {
                    newMaskedWord += guessWord[i] + " ";
                }
                if (!newMaskedWord.includes("_")) {
                    console.log("Inside win condition.");
                    const message = "Congratulations!! You've won!";
                    setGameMessage(message);
                    var endGameForm = document.getElementById("endGame");
                    endGameForm.removeAttribute("hidden");
                    var gameForm = document.getElementById("inputForm");
                    gameForm.removeAttribute("hidden");
                }
                setMaskedWord(newMaskedWord);
            }
            if (attempts == 11) {
                console.log("Inside lose condition - attemtps.");
                const message = "You've ran out of attempts. Bad luck!";
                setGameMessage(message);
                revealWord();
            }
            setGuessAttempts(attempts);
            return;
        }
    }

    async function revealWord() {
        const obtain = await fetch(`http://localhost:4000/reveal/${wordId}`);
        const obj = await obtain.json();
        const word = obj.word;
        setRevealedWord(word);
        const data = {
            playersName: "",
            attempts: guessAttempts,
            wordLength: wordLen
        }
        onFinish(data);
        var endGameForm = document.getElementById("endGame");
        endGameForm.removeAttribute("hidden");
        var wordReveal = document.getElementById("revealWord");
        wordReveal.removeAttribute("hidden");
        var button = document.getElementById("highscoresButton");
        button.removeAttribute("hidden");
    }

    async function Highscores() {
        navigate("/highscores");
    }

    async function onSubmit(e) {
        e.preventDefault();
        console.log(playerName);
        console.log(guessAttempts);
        console.log(wordLen);
        const data = {
            playersName: playerName.name,
            attempts: guessAttempts,
            wordLength: wordLen
        };
        console.log(data);
        const response = await fetch("http://localhost:4000/save", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).catch(err => {
            window.alert(err);
            return;
        });
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }
        onFinish(data);
        navigate(`/highscores`);
    }

    function updatePlayerName(obj) {
        return setPlayerName((prevObj) => {
            prevObj = obj;
            return prevObj;
        });
    }

    return  (
        <div>
            <button type="button" id="startGame" onClick={SetWordId}>Start Game</button>
            <br />
            {alphabets
            .map((alphabet, index) => 
            <button key={index} id={alphabet} onClick={() => {
                onClickLetter(alphabet)
            }}>{alphabet}</button>)}
            <p>{maskedWord}</p>
            <p>{!maskedWord.includes("_") ? maskedWord : ""}</p>
            <div className="div_float_right">
                <img src={imageName} alt="man" />
            </div>
            <div id="endGame" hidden>
                <h2>{gameMessage}</h2>
                <h3 id="revealWord" hidden>The hidden word is: {revealedWord}</h3>
                <button type="button" id="highscoresButton" onClick={Highscores} hidden>Highscores</button>
                <form id="inputForm" onSubmit={onSubmit} hidden>
                    <div>
                        <label>Your Name: </label>
                        <input
                            type="text"
                            id="playerName"
                            value={playerName.name}
                            onChange={(e) => updatePlayerName({ name: e.target.value })}
                        />
                    </div>
                    <br/>
                    <div>
                        <input
                            type="submit"
                            value="Enter Name"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}