import React from "react";

const Score = ({ player }) => {
  return (
    <h4 className={player.lose ? "lose" : ""}>
      {player.name} ----- {player.score} punktów
      {player.lose ? "   -----   odpadł" : ""}
    </h4>
  );
};

export default Score;
