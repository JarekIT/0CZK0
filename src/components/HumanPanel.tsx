import React, { Dispatch, SetStateAction } from "react";
import { IGame } from "../types/types";

interface HumanPanelProps {
  animation: { moveUp: boolean };
  setAnimation: Dispatch<SetStateAction<{ moveUp: boolean }>>;
  addOneCard: () => Promise<void>;
  switchToBot: () => void;
  switchToNextPlayer: () => void;
  game: IGame;
}

const HumanPanel: React.FC<HumanPanelProps> = ({
  animation,
  setAnimation,
  addOneCard,
  switchToBot,
  switchToNextPlayer,
  game,
}) => {
  return (
    <div className="hand">
      <button
        onClick={() => {
          setAnimation({ moveUp: true });
          addOneCard();
        }}
      >
        Dobierz karte
      </button>

      <img
        src="/images/deck.jpg"
        alt="stos kart"
        onAnimationEnd={() => setAnimation({ moveUp: false })}
        className={animation.moveUp ? "deck moveUp" : "deck"}
      />

      <button
        onClick={() =>
          game.mode === "SINGLE" ? switchToBot() : switchToNextPlayer()
        }
      >
        Spasuj
      </button>
    </div>
  );
};

export default HumanPanel;
