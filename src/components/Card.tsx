import React from "react";
import { ICard } from "../types/types";

interface CardProps {
  card: ICard;
  view: boolean;
}

const Card: React.FC<CardProps> = ({ card, view }) => {
  return <img src={view ? card.image : "/images/deck.jpg"} alt={card.code} />;
};

export default Card;
