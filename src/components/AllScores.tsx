import React, { Fragment } from "react";
import { IPlayer } from "../types/types";
import Score from "./Score";

interface AllScoresProps {
  players: IPlayer[];
}

const AllScores: React.FC<AllScoresProps> = ({ players }) => {
  return (
    <Fragment>
      {players.map((player) => (
        <Score player={player} view={true} />
      ))}
    </Fragment>
  );
};

export default AllScores;
