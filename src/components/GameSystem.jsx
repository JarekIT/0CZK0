import React, { useState, useEffect } from "react";
import Hand from "./Hand";
import Score from "./Score";
import axios from "axios";

const GameSystem = ({ players, setPlayers, game, setGame }) => {
  const [playerNumber, setPlayerNumber] = useState(0);
  const [bot, setBot] = useState(null);
  const [animation, setAnimation] = useState({
    moveUp: false,
  });

  useEffect(() => {
    getNewDeckFromAPI();
  }, []);

  useEffect(() => {
    if (game.status === "DEALING") {
      deal2CardsToEachPlayerAtTheBeginning();
    }
  }, [game]);

  useEffect(() => {
    if (bot) {
      keepDrawingCardsByComputer();
    }
  }, [bot]);

  // get deck_id for further play
  const getNewDeckFromAPI = async () => {
    axios
      .get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=2")
      .then((res) => {
        console.log(res);
        const newGame = { ...game };
        newGame.deck_id = res.data.deck_id;
        setGame(newGame);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // pauses the program for the duration of the animation
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // gives two cards to each player at the start of the game
  const deal2CardsToEachPlayerAtTheBeginning = async () => {
    let p = 0;
    while (p < players.length) {
      await createHandWith2Cards(p);
      await sleep(500);
      p++;
    }
    const newGame = { ...game };
    newGame.status = "INGAME";
    setGame(newGame);
  };

  // gets two cards from the Deck API and saves it to the player
  const createHandWith2Cards = async (p) => {
    axios
      .get(`https://deckofcardsapi.com/api/deck/${game.deck_id}/draw/?count=2`)
      .then((res) => {
        check2Aces(res.data.cards);

        const newPlayersCards = [...players];

        const newCard1 = res.data.cards[0];
        const points1 = checkCardValue(newCard1);

        const newCard2 = res.data.cards[1];
        const points2 = checkCardValue(newCard2);

        addPointsAtBegining(points1, points2, p);

        newPlayersCards[p].cards = [
          ...newPlayersCards[p].cards,
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
  function checkCardValue(card) {
    if (!isNaN(card.value)) {
      return parseInt(card.value);
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
      }
    }
  }

  // sums up two cards during the initial deal and adds them to the player
  const addPointsAtBegining = (points1, points2, p) => {
    const newPlayersPoints = [...players];
    newPlayersPoints[p].score = points1 + points2;
    setPlayers(newPlayersPoints);
  };

  // verifies that the two starting cards are Aces
  function check2Aces(cards, p) {
    if (cards[0].value === "ACE" && cards[1].value === "ACE") {
      setWinnerAndCloseGame(p);
    }
  }

  // sets the winner and changes the game status to END
  const setWinnerAndCloseGame = (playerId) => {
    const newGameWinner = { ...game };
    newGameWinner.winner = playerId;
    newGameWinner.status = "END";
    setGame(newGameWinner);
  };

  // checks the winner at the end of the game
  const checkWinner = () => {
    let maxScore = 0;
    let winnerPlayerNumber = -1;

    players.forEach((player) => {
      if (!player.lose && player.score > maxScore) {
        winnerPlayerNumber = player.id;
        maxScore = player.score;
      }
    });

    console.log("Zwyciezca zostal gracz numer:", winnerPlayerNumber);
    setWinnerAndCloseGame(winnerPlayerNumber);
  };

  // checks if the last player is the only one playing
  function checkIfOthersHaveLost() {
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
  const switchToNextPlayer = () => {
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
  const checkScore = () => {
    if (game.mode === "SINGLE" && players[0].score > 21) {
      console.log("Przegrałeś z komputerem");
      setWinnerAndCloseGame(1);
    } else if (players[playerNumber].score > 21) {
      const newPlayersDetails = [...players];
      newPlayersDetails[playerNumber].lose = true;
      setPlayers(newPlayersDetails);
      switchToNextPlayer();
    }
  };

  // adds points to the player
  const addPoints = (points) => {
    const newPlayersPoints = [...players];
    newPlayersPoints[playerNumber].score += points;
    setPlayers(newPlayersPoints);
    checkScore();
  };

  // gets 1 card from the Deck API
  const addOneCard = async () => {
    const newPlayersCards = [...players];

    await sleep(500);

    await fetch(
      `https://deckofcardsapi.com/api/deck/${game.deck_id}/draw/?count=1`
    )
      .then((res) => res.json())
      .then((data) => {
        const newCard = data.cards[0];
        newPlayersCards[playerNumber].cards = [
          ...newPlayersCards[playerNumber].cards,
          newCard,
        ];

        const points = checkCardValue(newCard);
        addPoints(points);
      })
      .catch((err) => console.log(err));

    setPlayers(newPlayersCards);
  };

  // // // // // // // // //

  // sets the game to play against the computer
  const switchToBot = () => {
    if (players[0].lose || players[0].score < players[1].score) {
      setWinnerAndCloseGame(1);
    } else {
      setPlayerNumber(1);
    }
    setBot(true);
  };

  // automatically draws cards until the game is won or lost
  const keepDrawingCardsByComputer = async () => {
    while (players[0].score >= players[1].score) {
      setAnimation({ moveDeck: true });
      await sleep(500);
      await addOneCard();
    }

    chekIfTheComputerWon();
  };

  // checks to see if the computer has won
  const chekIfTheComputerWon = async () => {
    await sleep(1000);

    players[1].score < 22 && players[0].score < players[1].score
      ? setWinnerAndCloseGame(1)
      : setWinnerAndCloseGame(0);
  };

  return (
    <div>
      {players
        ? players.map((player, index) => {
            const playerId = "player-" + index;
            const scoreId = "score-" + index;
            const handId = "hand-" + index;

            return (
              <div className="player" key={playerId}>
                <Score key={scoreId} player={player} />
                <Hand key={handId} player={player} />

                {game.status === "INGAME" && playerNumber === player.id ? (
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
                        className="deck"
                        src="/images/deck.jpg"
                        alt="stos kart"
                        onAnimationEnd={() => setAnimation({ moveUp: false })}
                        className={animation.moveUp ? "moveUp" : ""}
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
