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
      give2CardsAtBeginingToEachPlayer();
    }
  }, [game]);

  useEffect(() => {
    if (bot) {
      keepDrawingCardsByComputer();
    }
  }, [bot]);

  // pobiera deck_id do dalszej gry
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

  // wstrzymuje działanie programu na czas animacji
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // rozdaje kazdemu graczowi dwie karty na początku gry
  const give2CardsAtBeginingToEachPlayer = async () => {
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

  // pobiera dwie karty z Deck API i zapisuje u gracza
  // -> sprawdza czy są to 2 Asy
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

  // zwraca wartość liczbową pobranej karty
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

  // sumuje dwie karty podczas początkowego rozdania
  const addPointsAtBegining = (points1, points2, p) => {
    const newPlayersPoints = [...players];
    newPlayersPoints[p].score = points1 + points2;
    setPlayers(newPlayersPoints);
  };

  // weryfikuje czy dwie początkowe karty to są ASY
  function check2Aces(cards, p) {
    if (cards[0].value === "ACE" && cards[1].value === "ACE") {
      setWinnerAndCloseGame(p);
    }
  }

  // ustawia zwycięzce i zmienia status gry na KONIEC
  const setWinnerAndCloseGame = (playerId) => {
    const newGameWinner = { ...game };
    newGameWinner.winner = playerId;
    newGameWinner.status = "END";
    setGame(newGameWinner);
  };

  // sprawdza zwycięzce po zakończeniu rozgrywki
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

  // sprawdza czy ostatni gracz jest jedynym grającym
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

  // przełącza na następnego gracza
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

  // sprawdza czy przekroczono 21 punktów
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

  // dodaje punkty graczowi
  const addPoints = (points) => {
    const newPlayersPoints = [...players];
    newPlayersPoints[playerNumber].score += points;
    setPlayers(newPlayersPoints);
    checkScore();
  };

  // pobiera kartę z Deck API
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

  const switchToBot = () => {
    if (players[0].lose || players[0].score < players[1].score) {
      setWinnerAndCloseGame(1);
    } else {
      setPlayerNumber(1);
    }
    setBot(true);
  };

  const keepDrawingCardsByComputer = async () => {
    while (players[0].score >= players[1].score) {
      setAnimation({ moveDeck: true });
      await sleep(500);
      await addOneCard();
    }

    chekIfTheComputerWon();
  };

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
