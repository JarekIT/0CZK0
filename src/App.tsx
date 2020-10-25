import React, { Suspense, useState } from "react";

import "./App.css";

import PrepareSystem from "./components/PrepareSystem";
import Footer from "./components/Footer";

import { IGame, IPlayer } from "./types/types";
import { initialGame } from "./constants";

const GameSystem = React.lazy(() => import("./components/GameSystem"));
const EndSystem = React.lazy(() => import("./components/EndSystem"));

function App(): JSX.Element {
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [game, setGame] = useState<IGame>(initialGame);

  return (
    <div className="App">
      {game.status === "PREPARE" && (
        <PrepareSystem setPlayers={setPlayers} setGame={setGame} />
      )}
      {game.status === "INGAME" && (
        <Suspense fallback={null}>
          <GameSystem
            players={players}
            setPlayers={setPlayers}
            game={game}
            setGame={setGame}
          />
        </Suspense>
      )}
      {game.status === "END" && (
        <Suspense fallback={null}>
          <EndSystem
            players={players}
            setPlayers={setPlayers}
            game={game}
            setGame={setGame}
          />
        </Suspense>
      )}
      <Footer />
    </div>
  );
}

export { App as default };
