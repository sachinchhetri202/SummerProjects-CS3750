import React, { useState } from "react";

export default function LoadWords() {
    const [list, setList] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        let newListString = list;
        let newListArray = newListString.split("\n");
        let wordObj = {
            word: "",
            wordLength: 0,
            wordId: 0
        };

        for (let i = 0; i < newListArray.length; i++) {
            wordObj.word = newListArray[i];
            wordObj.wordLength = newListArray[i].length;
            wordObj.wordId = i + 1;

            const response = await fetch("http://localhost:4000/loadWords", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(wordObj),
            }).catch(err => {
                window.alert(err);
                return;
            });
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}. Failed on word ${i}`;
                window.alert(message);
                return;
            }
        }

        return;
    }

    function handleChange(e) {
        setList(e.target.value);
    }

    return (
        <div>
            <h3>Words Load</h3>
            <form onSubmit={onSubmit}>
                <div>
                    <label>Word: </label>
                    <textarea
                        type="text"
                        id="word"
                        name="wordList"
                        rows="10000"
                        columns="1"
                        value={list}
                        onChange={handleChange}
                    />
                </div>
                <br/>
                <div>
                    <input
                        type="submit"
                        value="Load Word List"
                    />
                </div>
            </form>
        </div>
    );
}