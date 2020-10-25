import React from "react";

import AllScores from "./AllScores";
import Hand from "./Hand";

import { IGame, IPlayer } from "../types/types";
import { initialGame } from "../constants";

interface EndSystemProps {
  players: IPlayer[];
  setPlayers: React.Dispatch<React.SetStateAction<IPlayer[]>>;
  game: IGame;
  setGame: React.Dispatch<React.SetStateAction<IGame>>;
}

const EndSystem: React.FC<EndSystemProps> = ({
  players,
  setPlayers,
  game,
  setGame,
}) => {
  const prepareNewGame = () => {
    setPlayers([]);
    setGame({ ...initialGame });
  };

  return (
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
        <button onClick={() => prepareNewGame()}>Rozpocznij grę na nowo</button>
      </div>
    </div>
  );
};

export default EndSystem;
