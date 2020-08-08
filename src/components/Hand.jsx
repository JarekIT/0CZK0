import React, { useState } from "react";
import Card from "./Card";

const Hand = ({ player, view }) => {
  return (
    <div className="hand">
      {player
        ? player.cards.map((card, index) => {
            const cardId = "card-" + index;
            return (
              <>
                <Card key={cardId} card={card} view={view} />
              </>
            );
          })
        : null}
    </div>
  );
};

export default Hand;
