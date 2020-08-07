import React from "react";
import Card from "./Card";

const Hand = ({ player }) => {
  return (
    <div className="hand">
      {player
        ? player.cards.map((card, index) => {
            const cardId = "card-" + index;
            return (
              <>
                <Card key={cardId} card={card} />
              </>
            );
          })
        : null}
    </div>
  );
};

export default Hand;
