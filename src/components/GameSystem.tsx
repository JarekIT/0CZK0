/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import axios from "axios";

import Hand from "./Hand";
import Score from "./Score";

import { ICard, IGame, IPlayer } from "../types/types";

interface GameSystemProps {
  players: IPlayer[];
  setPlayers: React.Dispatch<React.SetStateAction<IPlayer[]>>;
  game: IGame;
  setGame: React.Dispatch<React.SetStateAction<IGame>>;
}

const GameSystem: React.FC<GameSystemProps> = ({
  players,
  setPlayers,
  game,
  setGame,
}) => {
  const [playerNumber, setPlayerNumber] = useState<number>(-1);
  const [bot, setBot] = useState<boolean>(false);
  const [animation, setAnimation] = useState({
    moveUp: false,
  });

  useEffect(() => {
    getNewDeckFromAPI();
    setPlayerNumber(0);
  }, []);

  useEffect(() => {
    if (game.status === "INGAME" && !bot) {
      console.log("Biore 2 karty");
      draw2CardsAtTheBeginning();
    }
  }, [playerNumber, game]);

  useEffect(() => {
    if (bot) {
      draw2CardsAndKeepDrawingCardsOneByOne();
    }
  }, [bot]);

  // get deck_id for further play
  const getNewDeckFromAPI: () => Promise<void> = async () => {
    axios
      .get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=2")
      .then((res) => {
        console.log(res);
        const newGame: IGame = { ...game };
        newGame.deck_id = res.data.deck_id;
        setGame(newGame);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // pauses the program for the duration of the animation
  const sleep: (ms: number) => Promise<unknown> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // gives two cards to each player at the start of the round
  const draw2CardsAtTheBeginning: () => Promise<void> = async () => {
    await createHandWith2Cards(playerNumber);
    await sleep(500);
  };

  // gets two cards from the Deck API and saves it to the player
  const createHandWith2Cards: (playerNumber: number) => Promise<void> = async (
    playerNumber
  ) => {
    axios
      .get(`https://deckofcardsapi.com/api/deck/${game.deck_id}/draw/?count=2`)
      .then((res) => {
        check2Aces(res.data.cards, playerNumber);

        const newPlayersCards: IPlayer[] = [...players];

        const newCard1: ICard = res.data.cards[0];
        const points1: number = checkCardValue(newCard1);

        const newCard2: ICard = res.data.cards[1];
        const points2: number = checkCardValue(newCard2);

        addPointsAtBegining(points1, points2, playerNumber);

        newPlayersCards[playerNumber].cards = [
          ...newPlayersCards[playerNumber].cards,
          newCard1,
          newCard2,
        ];

        setPlayers(newPlayersCards);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // returns the numerical value of the card drawn
  function checkCardValue(card: ICard): number {
    const cardValueInt: number = parseInt(card.value);

    if (!isNaN(cardValueInt)) {
      return cardValueInt;
    } else {
      switch (card.value) {
        case "JACK":
          return 2;
        case "QUEEN":
          return 3;
        case "KING":
          return 4;
        case "ACE":
          return 11;
        default:
          console.log("Karta spoza tali");
          return 0;
      }
    }
  }

  // sums up two cards during the initial deal and adds them to the player
  const addPointsAtBegining: (
    points1: number,
    points2: number,
    playerNumber: number
  ) => void = (points1, points2, playerNumber) => {
    const newPlayersPoints: IPlayer[] = [...players];
    newPlayersPoints[playerNumber].score = points1 + points2;
    setPlayers(newPlayersPoints);
  };

  // verifies that the two starting cards are Aces
  function check2Aces(cards: ICard[], playerNumber: number): void {
    if (cards[0].value === "ACE" && cards[1].value === "ACE") {
      setWinnerAndCloseGame(playerNumber);
    }
  }

  // sets the winner and changes the game status to END
  const setWinnerAndCloseGame: (playerId: number) => void = (playerId) => {
    const newGameWinner: IGame = { ...game };
    newGameWinner.winner = playerId;
    newGameWinner.status = "END";
    setGame(newGameWinner);
  };

  // checks the winner at the end of the game
  const checkWinner: () => void = () => {
    let maxScore = 0;
    let winnerPlayerNumber = -1;

    players.forEach((player: IPlayer) => {
      if (!player.lose && player.score > maxScore) {
        winnerPlayerNumber = player.id;
        maxScore = player.score;
      }
    });

    console.log("Zwyciezca zostal gracz numer:", winnerPlayerNumber);
    setWinnerAndCloseGame(winnerPlayerNumber);
  };

  // checks if the last player is the only one playing
  function checkIfOthersHaveLost(): boolean {
    let i = 0;
    while (i < players.length - 1) {
      if (!players[i].lose) {
        return false;
      }
      i++;
    }
    return true;
  }

  // switches to the next player
  const switchToNextPlayer: () => void = () => {
    if (playerNumber + 1 < players.length) {
      console.log("Zmiana gracza z ", playerNumber, " na ", playerNumber + 1);

      if (playerNumber + 2 === players.length) {
        console.log("Ostatni gracz");
        if (checkIfOthersHaveLost()) {
          console.log("Wszyscy pozostali przegrali, wygrałeś");
          setWinnerAndCloseGame(players.length - 1);
        }
      }

      setPlayerNumber(playerNumber + 1);
    } else {
      console.log("Sprawdzam zwyciezce");
      checkWinner();
    }
  };

  // checks if 21 points are exceeded
  const checkScore: () => void = () => {
    if (game.mode === "SINGLE" && players[0].score > 21) {
      console.log("Przegrałeś z komputerem");
      setWinnerAndCloseGame(1);
    } else if (players[playerNumber].score > 21) {
      const newPlayersDetails: IPlayer[] = [...players];
      newPlayersDetails[playerNumber].lose = true;
      setPlayers(newPlayersDetails);
      switchToNextPlayer();
    }
  };

  // adds points to the player
  const addPoints: (points: number) => void = (points) => {
    const newPlayersPoints: IPlayer[] = [...players];
    newPlayersPoints[playerNumber].score += points;
    setPlayers(newPlayersPoints);
    checkScore();
  };

  // gets 1 card from the Deck API
  const addOneCard: () => Promise<void> = async () => {
    const newPlayersCards: IPlayer[] = [...players];

    await sleep(500);

    await fetch(
      `https://deckofcardsapi.com/api/deck/${game.deck_id}/draw/?count=1`
    )
      .then((res: Response) => res.json())
      .then((data: any) => {
        const newCard: ICard = data.cards[0];
        newPlayersCards[playerNumber].cards = [
          ...newPlayersCards[playerNumber].cards,
          newCard,
        ];

        const points: number = checkCardValue(newCard);
        addPoints(points);
      })
      .catch((err) => console.log(err));

    setPlayers(newPlayersCards);
  };

  // // // // // // // // // SINGLE

  // sets the game to play against the computer
  const switchToBot: () => void = () => {
    if (players[0].lose) {
      setWinnerAndCloseGame(1);
    } else {
      setPlayerNumber(1);
    }
    setBot(true);
  };

  // takes two cards and waits for them, then starts drawing cards
  const draw2CardsAndKeepDrawingCardsOneByOne: () => Promise<
    void
  > = async () => {
    await draw2CardsAtTheBeginning();
    keepDrawingCardsByComputer();
  };

  // automatically draws cards until the game is won or lost
  const keepDrawingCardsByComputer: () => Promise<void> = async () => {
    game.difficulty === "EASY"
      ? await computerPlayEasy()
      : await computerPlayHard();
    checkWhoWon();
  };

  // EASY: the computer draws cards until it has at least 18 points
  const computerPlayEasy: () => Promise<void> = async () => {
    while (players[1].score <= 17) {
      await sleep(500);
      await addOneCard();
    }
  };

  // HARD: the computer sees the player's points and will draw cards until it has more than the player
  const computerPlayHard: () => Promise<void> = async () => {
    if (players[0].score < players[1].score) {
      await sleep(500);
      setWinnerAndCloseGame(1);
    } else {
      console.log("biore karte");
      while (players[0].score >= players[1].score) {
        await sleep(500);
        await addOneCard();
      }
    }
  };

  // checks to see who has won
  const checkWhoWon: () => Promise<void> = async () => {
    await sleep(1000);
    players[1].score < 22 && players[0].score < players[1].score
      ? setWinnerAndCloseGame(1)
      : setWinnerAndCloseGame(0);
  };

  function checkActiveHumanPlayerInGame(player: IPlayer): boolean {
    return (
      game.status === "INGAME" && playerNumber === player.id && player.human
    );
  }

  return (
    <div>
      {players
        ? players.map((player, index) => {
            const playerId = "player-" + index;
            const scoreId = "score-" + index;
            const handId = "hand-" + index;

            const view = player.id === playerNumber ? true : false;

            return (
              <div className="player" key={playerId}>
                <Score key={scoreId} player={player} view={view} />
                <Hand key={handId} player={player} view={view} />

                {checkActiveHumanPlayerInGame(player) ? (
                  <>
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
                        // className="deck"
                        src="/images/deck.jpg"
                        alt="stos kart"
                        onAnimationEnd={() => setAnimation({ moveUp: false })}
                        className={animation.moveUp ? "deck moveUp" : "deck"}
                      />

                      {game.mode === "SINGLE" ? (
                        <button onClick={() => switchToBot()}>Spasuj</button>
                      ) : (
                        <button onClick={() => switchToNextPlayer()}>
                          Spasuj
                        </button>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })
        : null}
    </div>
  );
};

export default GameSystem;
