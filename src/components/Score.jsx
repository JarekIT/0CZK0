import React from "react";

const Score = ({ player, view }) => {
  return (
    <h4 className={player.lose ? "lose" : ""}>
      {player.name}: {view ? player.score : "XX"} punktów
      {player.lose ? "   ----->   odpadł" : ""}
    </h4>
  );
};

export default Score;
