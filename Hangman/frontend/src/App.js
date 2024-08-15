import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Hangman from "./components/game.js";
import HighScores from "./components/highscores.js";
import LoadWords from "./components/loadwords.js";

const App = () => {
  const [gameData, setGameData] = useState({
    playersName: "",
    attempts: 0,
    wordLength: 0
  });

  return (
    <div>
      <Routes>
        <Route path="/" element={<Hangman onFinish={setGameData} />} />
        <Route path="/highscores" element={<HighScores finish={gameData} />} />
        <Route path="/loadWords" element={<LoadWords />} />
      </Routes>
    </div>
  );
}
export default App;