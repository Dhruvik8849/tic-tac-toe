document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const setupPopup = document.getElementById('setup-popup');
    const optionBtns = document.querySelectorAll('.option-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const difficultyGroup = document.getElementById('difficulty-group');
    const gridSizeLabel = document.getElementById('grid-size-label');
    const gameArea = document.querySelector('.game-area');
    const container = document.querySelector('.container');
    const info = document.querySelector('.info');
    const newGameBtn = document.getElementById('new-game-btn');
    const musicToggleBtn = document.getElementById('music-toggle');
    const resultPopup = document.getElementById('result-popup');
    const resultMessage = document.getElementById('result-message');
    const celebrationImg = document.querySelector('.imgbox img');
    const playAgainBtn = document.getElementById('play-again-btn');
    const changeSettingsBtn = document.getElementById('change-settings-btn');
    const scoreXElem = document.getElementById('score-x');
    const scoreOElem = document.getElementById('score-o');
    const playerXLabel = document.getElementById('player-x-label');
    const playerOLabel = document.getElementById('player-o-label');
    const winningLineSvg = document.getElementById('winning-line-svg');

    // --- Audio Elements ---
    const bgMusic = document.getElementById('bg-music');
    const gameoverSound = document.getElementById('gameover-sound');
    bgMusic.volume = 0.1;

    // --- Game State ---
    let board = [];
    let turn = 'X';
    let isGameOver = false;
    let scores = { X: 0, O: 0 };
    let gameMode = '', difficulty = '', gridSize = 0, winStreak = 0;
    let isMusicPlaying = false;
    const humanPlayer = 'X', aiPlayer = 'O';

    // ================== SETUP LOGIC ==================
    let setupChoices = { mode: null, difficulty: null, grid: null };

    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const { type, value } = btn.dataset;
            setupChoices[type] = value;
            document.querySelectorAll(`.option-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show/hide difficulty options
            if (type === 'mode') {
                if (value === '1-player') {
                    difficultyGroup.classList.remove('hidden');
                    gridSizeLabel.innerText = "3. Choose Grid Size";
                } else {
                    difficultyGroup.classList.add('hidden');
                    setupChoices.difficulty = null; // Reset difficulty if switching to 2-player
                    gridSizeLabel.innerText = "2. Choose Grid Size";
                }
            }

            // Enable start button logic
            const isReady = setupChoices.grid && (setupChoices.mode === '2-player' || (setupChoices.mode === '1-player' && setupChoices.difficulty));
            startGameBtn.disabled = !isReady;
        });
    });

    startGameBtn.addEventListener('click', () => {
        gameMode = setupChoices.mode;
        difficulty = setupChoices.difficulty;
        gridSize = parseInt(setupChoices.grid);
        winStreak = gridSize === 3 ? 3 : (gridSize === 5 ? 4 : 5);
        
        setupPopup.classList.add('hidden');
        gameArea.classList.remove('hidden');
        
        if (gameMode === '1-player') {
            playerXLabel.innerText = "You (X)";
            playerOLabel.innerText = `Dhruvik (${difficulty})`;
        } else {
            playerXLabel.innerText = "Player X";
            playerOLabel.innerText = "Player O";
        }
        
        // --- CHANGE 1: START MUSIC ON GAME START ---
        if (!isMusicPlaying) {
             bgMusic.play().then(() => {
                isMusicPlaying = true;
                musicToggleBtn.innerText = "🔇";
             }).catch(() => {
                isMusicPlaying = false;
                musicToggleBtn.innerText = "🎵";
             });
        }

        createBoard();
    });

    // ================== BOARD & GAME LOGIC ==================
    function createBoard() {
        container.innerHTML = '';
        container.style.setProperty('--grid-size', gridSize);
        for (let i = 0; i < gridSize * gridSize; i++) {
            const box = document.createElement('div');
            box.classList.add('box');
            box.dataset.index = i;
            box.addEventListener('click', () => handleTurn(i));
            container.appendChild(box);
        }
        resetBoard();
    }

    function handleTurn(index) {
        if (board[index] !== '' || isGameOver) return;
        
        updateCell(index, turn);
        if (isGameOver) return;
        
        if (gameMode === '1-player') {
            switchTurn();
            info.innerText = 'Dhruvik is thinking...';
            container.style.pointerEvents = 'none';
            setTimeout(computerMove, 800);
        } else {
            switchTurn();
        }
    }
    
    function updateCell(index, player) {
        board[index] = player;
        const box = document.querySelector(`.box[data-index='${index}']`);
        box.innerText = player;

        // --- CHANGE 2: APPLY PLAYER COLOR CLASS ---
        box.classList.remove('player-x-color', 'player-o-color'); // clean up first
        if (player === 'X') {
            box.classList.add('player-x-color');
        } else if (player === 'O') {
            box.classList.add('player-o-color');
        }
        
        const winInfo = checkWinner(player);
        if (winInfo.isWin) {
            endGame(player, winInfo.line);
        } else if (board.every(cell => cell !== '')) {
            endGame('draw');
        }
    }
    
    function switchTurn() {
        turn = (turn === 'X') ? 'O' : 'X';
        info.innerText = `Turn for ${turn}`;
        updateActivePlayerUI();
    }
    
    function endGame(winner, winningLine) {
        isGameOver = true;
        let message = (winner === 'draw') ? "It's a Draw! 🤝" : `${winner === 'X' ? playerXLabel.innerText.split(' ')[0] : playerOLabel.innerText.split(' ')[0]} Won! 🎉`;
        
        if (winner !== 'draw') {
            scores[winner]++;
            updateScoreboard();
            drawWinningLine(winningLine);
        }
        setTimeout(() => {
            resultMessage.innerText = message;
            if (winner !== 'draw') {
                celebrationImg.style.width = "150px";
                gameoverSound.play();
            }
            resultPopup.classList.remove('hidden');
            if ("vibrate" in navigator) navigator.vibrate(200);
        }, 500);
    }
    
    function resetBoard() {
        board = Array(gridSize * gridSize).fill('');
        isGameOver = false;
        turn = 'X';
        document.querySelectorAll('.box').forEach(box => {
            box.innerText = "";
            // --- CHANGE 3: REMOVE COLOR CLASSES ON RESET ---
            box.classList.remove('player-x-color', 'player-o-color');
        });
        info.innerText = `Turn for ${turn}`;
        resultPopup.classList.add('hidden');
        celebrationImg.style.width = "0px";
        winningLineSvg.innerHTML = ''; // Clear winning line
        container.style.pointerEvents = 'auto';
        updateActivePlayerUI();
    }
    
    // ================== WINNER CHECKING & LINE DRAWING ==================
    function checkWinner(player) {
        for (let i = 0; i < board.length; i++) {
            const r = Math.floor(i / gridSize);
            const c = i % gridSize;
            
            // Directions: Horizontal, Vertical, Diag Down-Right, Diag Down-Left
            const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
            for (const [dr, dc] of directions) {
                const line = getLine(r, c, dr, dc, player);
                if (line.length === winStreak) {
                    return { isWin: true, line: line };
                }
            }
        }
        return { isWin: false };
    }
    
    function getLine(r, c, dr, dc, player) {
        const line = [];
        for (let i = 0; i < winStreak; i++) {
            const newR = r + i * dr;
            const newC = c + i * dc;
            if (newR >= gridSize || newC >= gridSize || newC < 0 || board[newR * gridSize + newC] !== player) {
                return [];
            }
            line.push(newR * gridSize + newC);
        }
        return line;
    }

    function drawWinningLine(indices) {
        const firstBox = document.querySelector(`.box[data-index='${indices[0]}']`);
        const lastBox = document.querySelector(`.box[data-index='${indices[indices.length-1]}']`);
        const containerRect = container.getBoundingClientRect();
        
        const start = {
            x: firstBox.offsetLeft + firstBox.offsetWidth / 2,
            y: firstBox.offsetTop + firstBox.offsetHeight / 2
        };
        const end = {
            x: lastBox.offsetLeft + lastBox.offsetWidth / 2,
            y: lastBox.offsetTop + lastBox.offsetHeight / 2
        };

        winningLineSvg.innerHTML = `<line id="winning-line" x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" />`;
    }

    // ================== AI LOGIC ==================
    function computerMove() {
        let move = -1;
        if (difficulty === 'easy') {
             move = findBestMove_Heuristic(board, true); // Force random for easy
        } else if (gridSize === 3 && difficulty === 'hard') {
            move = findBestMove_3x3(board);
        } else {
            // Use heuristics for hard on large boards, or for any non-easy/non-3x3hard game
            move = findBestMove_Heuristic(board, false);
        }

        if (move !== -1) {
            updateCell(move, aiPlayer);
        }
        
        if (!isGameOver) {
            switchTurn();
            container.style.pointerEvents = 'auto';
        }
    }
    
    function findBestMove_Heuristic(currentBoard, forceRandom = false) {
        if (!forceRandom) {
            // 1. Check for AI winning move
            for (let i = 0; i < currentBoard.length; i++) {
                if (currentBoard[i] === '') {
                    currentBoard[i] = aiPlayer;
                    if (checkWinner(aiPlayer).isWin) { currentBoard[i] = ''; return i; }
                    currentBoard[i] = '';
                }
            }
            // 2. Block opponent's winning move
            for (let i = 0; i < currentBoard.length; i++) {
                if (currentBoard[i] === '') {
                    currentBoard[i] = humanPlayer;
                    if (checkWinner(humanPlayer).isWin) { currentBoard[i] = ''; return i; }
                    currentBoard[i] = '';
                }
            }
        }
        // 3. Play a random available move (or if forced random)
        let availableMoves = currentBoard.map((val, idx) => val === '' ? idx : -1).filter(val => val !== -1);
        return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }

    function findBestMove_3x3(board) { /* Minimax logic */
        let bestScore = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = aiPlayer;
                let score = minimax(board, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }
    
    let minimaxScores = { [aiPlayer]: 10, [humanPlayer]: -10, 'draw': 0 };
    function minimax(board, isMaximizing) {
        const winInfoX = checkWinner(humanPlayer);
        if (winInfoX.isWin) return minimaxScores[humanPlayer];
        
        const winInfoO = checkWinner(aiPlayer);
        if (winInfoO.isWin) return minimaxScores[aiPlayer];

        if (board.every(cell => cell !== '')) return minimaxScores['draw'];
        
        let bestScore = isMaximizing ? -Infinity : Infinity;
        for(let i=0; i<9; i++) {
            if(board[i] === '') {
                board[i] = isMaximizing ? aiPlayer : humanPlayer;
                let score = minimax(board, !isMaximizing);
                board[i] = '';
                bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
            }
        }
        return bestScore;
    }

    // ================== UI & EVENT LISTENERS ==================
    function updateActivePlayerUI() {
        document.querySelector('.player-x').classList.toggle('active', turn === 'X' && !isGameOver);
        document.querySelector('.player-o').classList.toggle('active', turn === 'O' && !isGameOver);
    }
    
    function updateScoreboard() {
        scoreXElem.innerText = scores.X;
        scoreOElem.innerText = scores.O;
    }

    playAgainBtn.addEventListener('click', resetBoard);
    changeSettingsBtn.addEventListener('click', () => location.reload());
    newGameBtn.addEventListener('click', () => location.reload());

    musicToggleBtn.addEventListener('click', () => {
        isMusicPlaying = !isMusicPlaying;
        if (isMusicPlaying) {
            bgMusic.play().catch(() => { isMusicPlaying = false; });
            musicToggleBtn.innerText = "🔇";
        } else {
            bgMusic.pause();
            musicToggleBtn.innerText = "🎵";
        }
    });
});
