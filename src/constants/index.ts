import { IGame, IPlayer } from "../types/types";

export const initialGame: IGame = {
  deck_id: null,
  status: "PREPARE",
  winner: -1,
  mode: "NOTCHOSEN",
  difficulty: "NOTCHOSEN",
};

export const initialPlayer: IPlayer = {
  id: -1,
  name: "",
  score: 0,
  cards: [],
  lose: false,
  human: false,
};
