import React from "react";
import Score from "./Score";

const AllScores = ({ players }) => {
  return players.map((player) => <Score player={player} view={true} />);
};

export default AllScores;
