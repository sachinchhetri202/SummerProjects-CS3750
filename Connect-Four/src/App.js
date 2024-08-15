import { useState } from "react";

function Square({ value, onSquareClick }) {
    const style = {
        backgroundColor: value === 'X' ? 'red' : value === 'O' ? 'yellow' : 'white',
    };
    return (
        <button
            className="square"
            onClick={onSquareClick}
            style={style}
        >
            {value}
        </button>
    );
}

export default function Board() {
    const [xIsNext, setXIsNext] = useState(true);
    const [squares, setSquares] = useState(Array(42).fill(null));
    const [winner, setWinner] = useState(null);

    function handleClick(i) {
        if (winner) return;

        const column = i % 7;
        let bottomMostEmptySquare = null;
        for (let row = 5; row >= 0; row--) {
            const index = row * 7 + column;
            if (!squares[index]) {
                bottomMostEmptySquare = index;
                break;
            }
        }
        if (bottomMostEmptySquare === null) {
            return;
        }
        const nextSquares = squares.slice();
        nextSquares[bottomMostEmptySquare] = xIsNext ? 'X' : 'O';
        setSquares(nextSquares);
        setXIsNext(!xIsNext);

        const detectedWinner = calculateWinner(nextSquares);
        if (detectedWinner) {
            setWinner(detectedWinner);
        } else if (!nextSquares.includes(null)) {
            setWinner('Tie');
        }
    }

    let status;
    if (winner) {
        status = winner === 'Tie' ? 'The game is a tie!' : 'The Winner is: ' + winner;
    } else {
        status = 'Next player: ' + (xIsNext ? 'X' : 'O');
    }

    return (
        <>
            <div className="status"><h1>{status}</h1></div>
            {[...Array(6)].map((_, rowIndex) => (
                <div className="board-row" key={rowIndex}>
                    {[...Array(7)].map((_, colIndex) => {
                        const index = rowIndex * 7 + colIndex;
                        return <Square value={squares[index]} onSquareClick={() => handleClick(index)} key={index} />;
                    })}
                </div>
            ))}
        </>
    );
}

// The Connect Four game logic was implemented using guidelines from OpenAI
function calculateWinner(squares) {
    const lines = [
        // Horizontal
        ...Array(6).fill().map((_, r) => Array(4).fill().map((_, i) => [r * 7 + i, r * 7 + i + 1, r * 7 + i + 2, r * 7 + i + 3])),
        // Vertical
        ...Array(7).fill().map((_, c) => Array(3).fill().map((_, i) => [i * 7 + c, (i + 1) * 7 + c, (i + 2) * 7 + c, (i + 3) * 7 + c])),
        // Diagonal (bottom-left to top-right)
        ...Array(3).fill().map((_, r) => Array(4).fill().map((_, i) => [r * 7 + i, (r + 1) * 7 + i + 1, (r + 2) * 7 + i + 2, (r + 3) * 7 + i + 3])),
        // Diagonal (top-left to bottom-right)
        ...Array(3).fill().map((_, r) => Array(4).fill().map((_, i) => [(r + 3) * 7 + i, (r + 2) * 7 + i + 1, (r + 1) * 7 + i + 2, r * 7 + i + 3])),
    ].flat();

    for (const line of lines) {
        const [a, b, c, d] = line;
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] === squares[d]) {
            return squares[a];
        }
    }
    return null;
}
