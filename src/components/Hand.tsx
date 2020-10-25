import React from "react";
import { IPlayer } from "../types/types";
import Card from "./Card";

interface HandProps {
  player: IPlayer;
  view: boolean;
}

const Hand: React.FC<HandProps> = ({ player, view }) => {
  return (
    <div className="hand">
      {player
        ? player.cards.map((card, index) => {
            const cardId = "card-" + index;
            return <Card key={cardId} card={card} view={view} />;
          })
        : null}
    </div>
  );
};

export default Hand;
