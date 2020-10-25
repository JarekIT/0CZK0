import React, { useState } from "react";
import "./App.css";
import GameSystem from "./components/GameSystem";
import Footer from "./components/Footer";
import Hand from "./components/Hand";
import AllScores from "./components/AllScores";

import "./types/types.d.ts";
import { Difficulty, IGame, IPlayer } from "./types/types";

const initialGame: IGame = {
  deck_id: null,
  status: "PREPARE",
  winner: -1,
  mode: "NOTCHOSEN",
  difficulty: "NOTCHOSEN",
};

function App(): JSX.Element {
  const [players, setPlayers] = useState<IPlayer[]>([]);

  const [game, setGame] = useState<IGame>(initialGame);

  const player: IPlayer = {
    id: -1,
    name: "",
    score: 0,
    cards: [],
    lose: false,
    human: false,
  };

  const createMultiPlayers: (numberOfPlayers: number) => void = (
    numberOfPlayers
  ) => {
    const newPlayers: IPlayer[] = [];
    let i = 0;

    while (i < numberOfPlayers) {
      const newPlayer: IPlayer = { ...player };
      newPlayer.name = "Gracz nr: " + i;
      newPlayer.id = i;
      newPlayer.human = true;
      newPlayers.push(newPlayer);
      i++;
    }
    setPlayers(newPlayers);

    const newGameStatus: IGame = { ...game };
    newGameStatus.status = "INGAME";
    newGameStatus.mode = "MULTI";
    setGame(newGameStatus);
  };

  const createOnePlayer: (difficulty: Difficulty) => void = (difficulty) => {
    const newPlayer = { ...player };
    newPlayer.id = 0;
    newPlayer.name = "GRACZ";
    newPlayer.human = true;

    const newBot: IPlayer = { ...player };
    newBot.id = 1;
    newBot.name = "KOMPUTER";

    const newPlayers: IPlayer[] = [newPlayer, newBot];

    setPlayers(newPlayers);

    const newGameStatus: IGame = { ...game };
    newGameStatus.status = "INGAME";
    newGameStatus.mode = "SINGLE";
    newGameStatus.difficulty = difficulty;
    setGame(newGameStatus);
  };

  const prepareNewGame = () => {
    setPlayers([]);
    setGame({ ...initialGame });
  };

  return (
    <div className="App">
      {game.status === "PREPARE" ? (
        <div className="table-prepare-end">
          <p>Wybierz tryb rozgrywki</p>

          <div>
            <h4>
              Zagraj w oczko sam na sam z komputerem
              <br />
              EASY: komputer mając 18 punktów pasuje
              <br />
              HARD: komputer widzi nasze karty :-)
            </h4>
          </div>

          <div>
            <button onClick={() => createOnePlayer("EASY")}>
              EASY: komputer nie oszukuje
            </button>
            <button onClick={() => createOnePlayer("HARD")}>
              HARD: komputer oszukuje
            </button>
          </div>

          <div>
            <h4>Zagraj z kolegami:</h4>
          </div>

          <div>
            {[...Array(7)].map((x: any, i: number) => (
              <button key={i} onClick={() => createMultiPlayers(i + 2)}>
                {i + 2} graczy
              </button>
            ))}
          </div>

          <br />

          <div>
            <h4>Zobacz inne projekty:</h4>
          </div>

          <div>
            <a href="https://pet-finder-jarekit.netlify.app">
              <button>Pet Adoption (React)</button>
            </a>
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
            <br />
            <Hand player={players[game.winner]} view={true} />
          </p>

          <p className="scores">
            Tabela wyników:
            <AllScores players={players} />
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
