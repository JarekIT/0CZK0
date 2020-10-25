import React, { useState } from "react";

import "./App.css";

import PrepareSystem from "./components/PrepareSystem";
import GameSystem from "./components/GameSystem";
import EndSystem from "./components/EndSystem";
import Footer from "./components/Footer";

import { IGame, IPlayer } from "./types/types";
import { initialGame } from "./constants";

function App(): JSX.Element {
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [game, setGame] = useState<IGame>(initialGame);

  return (
    <div className="App">
      {game.status === "PREPARE" ? (
        <PrepareSystem setPlayers={setPlayers} setGame={setGame} />
      ) : null}

      {game.status === "INGAME" ? (
        <GameSystem
          players={players}
          setPlayers={setPlayers}
          game={game}
          setGame={setGame}
        />
      ) : null}

      {game.status === "END" ? (
        <EndSystem
          players={players}
          setPlayers={setPlayers}
          game={game}
          setGame={setGame}
        />
      ) : null}

      <Footer />
    </div>
  );
}

export { App as default };
