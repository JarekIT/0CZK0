import React, { useState, useEffect } from "react";
import Hand from "./Hand";
import Score from "./Score";
import axios from "axios";

const GameSystem = ({ players, setPlayers, game, setGame }) => {
  const [playerNumber, setPlayerNumber] = useState(null);
  const [bot, setBot] = useState(null);
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

  // gives two cards to each player at the start of the round
  const draw2CardsAtTheBeginning = async () => {
    await createHandWith2Cards(playerNumber);
    await sleep(500);
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

  // // // // // // // // // SINGLE

  // sets the game to play against the computer
  const switchToBot = () => {
    if (players[0].lose) {
      setWinnerAndCloseGame(1);
    } else {
      setPlayerNumber(1);
    }
    setBot(true);
  };

  // takes two cards and waits for them, then starts drawing cards
  const draw2CardsAndKeepDrawingCardsOneByOne = async () => {
    await draw2CardsAtTheBeginning();
    keepDrawingCardsByComputer();
  };

  // automatically draws cards until the game is won or lost
  const keepDrawingCardsByComputer = async () => {
    game.difficulty === "EASY"
      ? await computerPlayEasy()
      : await computerPlayHard();
      checkWhoWon();
  };

  // EASY: the computer draws cards until it has at least 18 points
  const computerPlayEasy = async () => {
    while (players[1].score <= 17) {
      await sleep(500);
      await addOneCard();
    }
  };

  // HARD: the computer sees the player's points and will draw cards until it has more than the player
  const computerPlayHard = async () => {
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
  const checkWhoWon = async () => {
    await sleep(1000);
    players[1].score < 22 && players[0].score < players[1].score
      ? setWinnerAndCloseGame(1)
      : setWinnerAndCloseGame(0);
  };

  function checkActiveHumanPlayerInGame(player) {
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
