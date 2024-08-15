import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// One React component for the entire table (High Scores)
// Another React component for each row of the result set (High Score)
const HighScore = (props) => (
    <tr>
        <td>{props.record.playersName}</td>
        <td>{props.record.attempts}</td>
    </tr>
)

export default function HighScores({ finish }) {
    const [highScores, setHighScores] = useState([]);

    const navigate = useNavigate();
    
    useEffect(() => {
        async function getHighScores() {
            const length = finish.wordLength;
            const response = await fetch(`http://localhost:4000/highscores/${length}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
            const result = await response.json();
            setHighScores(result);
            return;
        }

        getHighScores();
        return;
    },[]);

    function highScoreList() {
        highScores.map((highScore) => {
            console.log(highScore.playersName);
        });
        return highScores.map((highScore) => {
            return (
                <HighScore
                    record={highScore}
                    key={highScore._id}
                />
            );
        });
    }
    
    function onClickNo() {
        const message = "Close the browser to exit the program.";
        window.alert(message);
        return;
    }

    function onClickYes() {
        navigate("/");
        return;
    }

    return (
        <div>
            <h2>Top 10 High Scores</h2>
            <h3>{finish.wordLength} Letter Words</h3>
            <table style={{marginTop: 20}}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Guesses</th>
                    </tr>
                </thead>
                <tbody>{highScoreList()}</tbody>
            </table>
            <div>
                <p>Do you wish to play again?</p>
                <button type='button' onClick={onClickNo}>No</button>
                <button type='button' onClick={onClickYes}>Yes</button>
            </div>
        </div>
    );
}