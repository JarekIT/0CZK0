import React from "react";
import { IPlayer } from "../types/types";

interface ScoreProps {
  player: IPlayer;
  view: boolean;
}

const Score = ({ player, view }) => {
  return (
    <h4 className={player.lose ? "lose" : ""}>
      {player.name}: {view ? player.score : "XX"} punktów
      {player.lose ? "   ----->   odpadł" : ""}
    </h4>
  );
};

export default Score;
