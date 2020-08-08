import React from "react";

const Card = ({ card, view }) => {
  return <img src={view ? card.image : "/images/deck.jpg"} alt={card.code} />;
};

export default Card;
