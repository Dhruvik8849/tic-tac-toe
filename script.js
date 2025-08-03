document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const boxes = document.querySelectorAll(".box");
    const info = document.querySelector(".info");
    const resetBtn = document.getElementById("reset");
    const newGameBtn = document.getElementById("new-game");
    const musicToggleBtn = document.getElementById("music-toggle");
    const line = document.querySelector(".line");
    
    // Popup Elements
    const resultPopup = document.getElementById("result-popup");
    const resultMessage = document.getElementById("result-message");
    const celebrationImg = document.querySelector('.imgbox img');
    const playAgainBtn = document.getElementById("play-again");

    // Score Elements
    const scoreXElem = document.getElementById("score-x");
    const scoreOElem = document.getElementById("score-o");

    // Audio Elements
    const bgMusic = document.getElementById("bg-music");
    // Turn sound is no longer needed but we keep the gameover sound
    const gameoverSound = document.getElementById("gameover-sound");
    bgMusic.volume = 0.1;

    // --- Game State ---
    let turn = "X";
    let isGameOver = false;
    let moveCount = 0;
    let scores = { X: 0, O: 0 };
    let isMusicPlaying = false;
    let firstMoveMade = false;

    const winConditions = [
        [0, 1, 2, 5, 5, 0],
        [3, 4, 5, 5, 15, 0],
        [6, 7, 8, 5, 25, 0],
        [0, 3, 6, -5, 15, 90],
        [1, 4, 7, 5, 15, 90],
        [2, 5, 8, 15, 15, 90],
        [0, 4, 8, 5, 15, 45],
        [2, 4, 6, 5, 15, 135],
    ];

    // --- Functions ---
    const changeTurn = () => {
        return turn === "X" ? "O" : "X";
    };

    const showPopup = (message, isWin) => {
        resultMessage.innerText = message;
        
        // Vibrate the phone on game over
        if ("vibrate" in navigator) {
            navigator.vibrate(500); // Vibrate for 500 milliseconds
        }

        if (isWin) {
            celebrationImg.style.width = "150px";
            gameoverSound.play();
        } else {
            celebrationImg.style.width = "0px";
        }
        resultPopup.classList.remove("hidden");
    };

    const checkWin = () => {
        const boxtexts = document.getElementsByClassName('boxtext');
        for (let e of winConditions) {
            if (
                boxtexts[e[0]].innerText === boxtexts[e[1]].innerText &&
                boxtexts[e[2]].innerText === boxtexts[e[1]].innerText &&
                boxtexts[e[0]].innerText !== ""
            ) {
                const winner = boxtexts[e[0]].innerText;
                showPopup(`${winner} Won! 🎉`, true);
                isGameOver = true;
                
                const containerWidth = document.querySelector('.container').offsetWidth;
                const scaleFactor = containerWidth / (30 * 3.77); 
                line.style.width = "28vmin";
                line.style.transform = `translate(${e[3] * scaleFactor}vmin, ${e[4] * scaleFactor}vmin) rotate(${e[5]}deg)`;
                
                scores[winner]++;
                updateScoreboard();
                return;
            }
        }
    };
    
    const checkDraw = () => {
        if (moveCount === 9 && !isGameOver) {
            isGameOver = true;
            showPopup("It's a Draw! 🤝", false);
        }
    };

    const updateScoreboard = () => {
        scoreXElem.innerText = scores.X;
        scoreOElem.innerText = scores.O;
    };

    const resetBoard = () => {
        let boxtexts = document.querySelectorAll('.boxtext');
        boxtexts.forEach(element => { element.innerText = "" });
        turn = "X";
        isGameOver = false;
        moveCount = 0;
        line.style.width = "0";
        info.innerText = "Turn for " + turn;
        resultPopup.classList.add("hidden");
        celebrationImg.style.width = "0px";
    };

    // --- Event Listeners ---
    boxes.forEach(element => {
        element.addEventListener('click', () => {
            if (!firstMoveMade && !isMusicPlaying) {
                bgMusic.play();
                isMusicPlaying = true;
                musicToggleBtn.innerText = "🔇";
                firstMoveMade = true;
            }

            const boxtext = element.querySelector('.boxtext');
            if (boxtext.innerText === '' && !isGameOver) {
                
                // All turn sound logic has been removed from here.

                boxtext.innerText = turn;
                moveCount++;
                checkWin();
                if (!isGameOver) {
                    checkDraw();
                }
                if (!isGameOver) {
                    turn = changeTurn();
                    info.innerText = "Turn for " + turn;
                }
            }
        });
    });
    
    resetBtn.addEventListener('click', resetBoard);
    playAgainBtn.addEventListener('click', resetBoard);

    newGameBtn.addEventListener('click', () => {
        scores = { X: 0, O: 0 };
        updateScoreboard();
        resetBoard();
    });

    musicToggleBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggleBtn.innerText = "🎵";
        } else {
            bgMusic.play();
            musicToggleBtn.innerText = "🔇";
        }
        isMusicPlaying = !isMusicPlaying;
        firstMoveMade = true;
    });
});
