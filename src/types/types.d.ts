export interface IPlayer {
  id: number;
  name: string;
  score: number;
  cards: ICard[];
  lose: boolean;
  human: boolean;
}

export interface IGame {
  deck_id: string | null;
  status: Status;
  winner: number;
  mode: Mode;
  difficulty: Difficulty;
}

export interface ICard {
  image: string;
  code: string;
  value: Value;
}

export type Value =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "JACK"
  | "QUEEN"
  | "KING"
  | "ACE";

export type Difficulty = "EASY" | "HARD" | "NOTCHOSEN";

export type Status = "PREPARE" | "DEALING" | "INGAME" | "END";

export type Mode = "SINGLE" | "MULTI" | "NOTCHOSEN";
