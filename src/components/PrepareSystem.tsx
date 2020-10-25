import React from "react";

import { Difficulty, IGame, IPlayer } from "../types/types";
import { initialGame, initialPlayer } from "../constants";

interface PrepareSystemProps {
  setPlayers: React.Dispatch<React.SetStateAction<IPlayer[]>>;
  setGame: React.Dispatch<React.SetStateAction<IGame>>;
}

const PrepareSystem: React.FC<PrepareSystemProps> = ({
  setPlayers,
  setGame,
}) => {
  const createMultiPlayers: (numberOfPlayers: number) => void = (
    numberOfPlayers
  ) => {
    const newPlayers: IPlayer[] = [];
    let i = 0;

    while (i < numberOfPlayers) {
      const newPlayer: IPlayer = { ...initialPlayer };
      newPlayer.name = "Gracz nr: " + i;
      newPlayer.id = i;
      newPlayer.human = true;
      newPlayers.push(newPlayer);
      i++;
    }
    setPlayers(newPlayers);

    const newGameStatus: IGame = { ...initialGame };
    newGameStatus.status = "INGAME";
    newGameStatus.mode = "MULTI";
    setGame(newGameStatus);
  };

  const createOnePlayer: (difficulty: Difficulty) => void = (difficulty) => {
    const newPlayer: IPlayer = { ...initialPlayer };
    newPlayer.id = 0;
    newPlayer.name = "GRACZ";
    newPlayer.human = true;

    const newBot: IPlayer = { ...initialPlayer };
    newBot.id = 1;
    newBot.name = "KOMPUTER";

    const newPlayers: IPlayer[] = [newPlayer, newBot];

    setPlayers(newPlayers);

    const newGameStatus: IGame = { ...initialGame };
    newGameStatus.status = "INGAME";
    newGameStatus.mode = "SINGLE";
    newGameStatus.difficulty = difficulty;
    setGame(newGameStatus);
  };

  return (
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
  );
};

export default PrepareSystem;
