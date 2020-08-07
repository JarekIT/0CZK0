import React from "react";

const Card = ({ card }) => {
  return <img src={card.image} alt={card.code} />;
};

export default Card;
