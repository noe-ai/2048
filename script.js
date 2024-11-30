let board;
let score = 0;
const gridSize = 4;

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function initializeBoard() {
    console.log('Initializing board...');
    const gameBoard = document.querySelector('.game-board');
    if (!gameBoard) {
        console.error('Game board element not found!');
        return;
    }
    gameBoard.innerHTML = '';
    
    // Create grid cells
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        gameBoard.appendChild(cell);
    }

    // 添加触摸事件监听器
    gameBoard.addEventListener('touchstart', handleTouchStart, false);
    gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameBoard.addEventListener('touchend', handleTouchEnd, false);

    console.log('Board initialized');
}

function updateDisplay() {
    const cells = document.querySelectorAll('.grid-cell');
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const index = i * gridSize + j;
            const cell = cells[index];
            cell.innerHTML = ''; // Clear existing content
            
            if (board[i][j] !== 0) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${board[i][j]}`;
                tile.textContent = board[i][j];
                cell.appendChild(tile);
            }
        }
    }
}

function newGame() {
    console.log('Starting new game...');
    initializeBoard();
    board = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    score = 0;
    document.getElementById('score').textContent = score;
    addNewTile();
    addNewTile();
    updateDisplay();
    console.log('New game started');
}

function addNewTile() {
    const emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({x: i, y: j});
            }
        }
    }
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
    }
}

function move(direction) {
    let moved = false;
    const oldBoard = board.map(row => [...row]);

    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < gridSize; i++) {
            let row = board[i];
            if (direction === 'left') {
                row = mergeTiles(row);
            } else {
                row = mergeTiles(row.reverse()).reverse();
            }
            board[i] = row;
        }
    } else {
        for (let j = 0; j < gridSize; j++) {
            let column = board.map(row => row[j]);
            if (direction === 'up') {
                column = mergeTiles(column);
            } else {
                column = mergeTiles(column.reverse()).reverse();
            }
            for (let i = 0; i < gridSize; i++) {
                board[i][j] = column[i];
            }
        }
    }

    moved = !board.every((row, i) => 
        row.every((cell, j) => cell === oldBoard[i][j])
    );

    if (moved) {
        addNewTile();
        updateDisplay();
    }

    if (isGameOver()) {
        alert('Game Over!');
    }
}

function mergeTiles(line) {
    // Remove zeros
    line = line.filter(cell => cell !== 0);
    
    // Merge
    for (let i = 0; i < line.length - 1; i++) {
        if (line[i] === line[i + 1]) {
            line[i] *= 2;
            score += line[i];
            document.getElementById('score').textContent = score;
            line.splice(i + 1, 1);
        }
    }
    
    // Add zeros back
    while (line.length < gridSize) {
        line.push(0);
    }
    
    return line;
}

function isGameOver() {
    // 检查是否达到2048
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 2048) {
                setTimeout(() => alert('Congratulations! You won!'), 100);
                return true;
            }
        }
    }
    
    // 检查空格子
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 0) return false;
        }
    }
    
    // 检查可能的合并
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (j < gridSize - 1 && board[i][j] === board[i][j + 1]) return false;
            if (i < gridSize - 1 && board[i][j] === board[i + 1][j]) return false;
        }
    }
    
    setTimeout(() => alert('Game Over!'), 100);
    return true;
}

function handleTouchStart(event) {
    event.preventDefault();
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault();
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                move('right');
            } else {
                move('left');
            }
        }
    } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                move('down');
            } else {
                move('up');
            }
        }
    }
}

// 初始化游戏
function initGame() {
    // 添加键盘事件监听
    document.addEventListener('keydown', event => {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                move('left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                move('right');
                break;
            case 'ArrowUp':
                event.preventDefault();
                move('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                move('down');
                break;
        }
    });

    // 绑定新游戏按钮
    const newGameButton = document.querySelector('.new-game');
    if (newGameButton) {
        newGameButton.addEventListener('click', newGame);
    }

    // 开始新游戏
    newGame();
}

// 当DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);
 