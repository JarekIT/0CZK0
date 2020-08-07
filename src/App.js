import React, { useState } from "react";
import "./App.css";
import GameSystem from "./components/GameSystem";
import Footer from "./components/Footer";

function App() {
  const [players, setPlayers] = useState([]);

  const [game, setGame] = useState({
    deck_id: null,
    status: "PREPARE",
    winner: null,
    mode: null,
  });

  const player = {
    id: null,
    name: "",
    score: 0,
    cards: [],
    lose: false,
  };

  const createMultiPlayers = (numberOfPlayers) => {
    const newPlayers = [];
    let i = 0;

    while (i < numberOfPlayers) {
      const newPlayer = { ...player };
      newPlayer.name = "Gracz nr: " + i;
      newPlayer.id = i;
      newPlayers.push(newPlayer);
      i++;
    }
    setPlayers(newPlayers);

    const newGameStatus = { ...game };
    newGameStatus.status = "DEALING";
    newGameStatus.mode = "MULTI";
    setGame(newGameStatus);
  };

  const createOnePlayer = () => {
    const newPlayer = { ...player };
    newPlayer.id = 0;
    newPlayer.name = "GRACZ";

    const newBot = { ...player };
    newBot.id = 1;
    newBot.name = "KOMPUTER";

    const newPlayers = [newPlayer, newBot];

    setPlayers(newPlayers);

    const newGameStatus = { ...game };
    newGameStatus.status = "DEALING";
    newGameStatus.mode = "SINGLE";
    setGame(newGameStatus);
  };

  const prepareNewGame = () => {
    setPlayers([]);
    setGame({
      deck_id: null,
      status: "PREPARE",
      winner: null,
      mode: null,
    });
  };

  return (
    <div className="App">
      {game.status === "PREPARE" ? (
        <div className="table-prepare-end">
          <p>Wybierz tryb rozgrywki</p>

          <div>
            <h4>Zagraj w oczko sam na sam z komputerem:</h4>
          </div>

          <div>
            <button onClick={() => createOnePlayer()}>Gra z botem</button>
          </div>

          <div>
            <h4>Zagraj z kolegami:</h4>
          </div>

          <div>
            <button onClick={() => createMultiPlayers(2)}>2 graczy</button>
            <button onClick={() => createMultiPlayers(3)}>3 graczy</button>
            <button onClick={() => createMultiPlayers(4)}>4 graczy</button>
            <button onClick={() => createMultiPlayers(5)}>5 graczy</button>
            <button onClick={() => createMultiPlayers(6)}>6 graczy</button>
            <button onClick={() => createMultiPlayers(7)}>7 graczy</button>
            <button onClick={() => createMultiPlayers(8)}>8 graczy</button>
          </div>
          <br />

          <div>
            <h4>Zagraj w inne gry:</h4>
          </div>

          <div>
            <a href="https://pokemon-fight-jarekit.netlify.app">
              <button>Pokemon Fight (JavaScript)</button>
            </a>
          </div>
        </div>
      ) : null}

      {game.status === "DEALING" ||
      game.status === "INGAME" ||
      game.status === "END" ? (
        <div className="table-ingame">
          <GameSystem
            players={players}
            setPlayers={setPlayers}
            game={game}
            setGame={setGame}
          />
        </div>
      ) : null}

      {game.status === "END" ? (
        <div className="table-prepare-end">
          {console.log("Zwyciężcą jest: ", players[game.winner].name)}
          <p>
            Zwycięzcą jest: {players[game.winner].name}
            <br />
            Wynik: {players[game.winner].score} punktów
          </p>
          <div>
            <button onClick={() => prepareNewGame()}>
              Rozpocznij grę na nowo
            </button>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}

export { App as default };
