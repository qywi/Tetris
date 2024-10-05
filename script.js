import { Tetris } from "./tetris.js";
import { PLAYFIELD_COLUMNS, PLAYFIELD_ROWS, convertPositionToIndex } from "./utilities.js"

let requestId;
let timeoutId;
const tetris = new Tetris();
const cells = document.querySelectorAll('.grid>div');

export let difficultyMultiplier = 1;
let gameSpeed = 500;

document.getElementById('baby').addEventListener('click', () => startGame('baby'));
document.getElementById('normal').addEventListener('click', () => startGame('normal'));
document.getElementById('nightmares').addEventListener('click', () => startGame('nightmares'));
document.querySelector('.difficulty-menu').style.display = 'block';

function initKeydown() {
  document.addEventListener('keydown', onKeydown);
}

function startGame(difficulty) {
    switch (difficulty) {
      case 'baby':
        difficultyMultiplier = 0.5;
        gameSpeed = 1000;
        break;
      case 'normal':
        difficultyMultiplier = 1;
        gameSpeed = 500;
        break;
      case 'nightmares':
        difficultyMultiplier = 5;
        gameSpeed = 200;
        break;
    }
    
    document.querySelector('.difficulty-menu').style.display = 'none';
    initKeydown();
    moveDown();
  }

function onKeydown(event) {
  switch (event.key) {
    case 'ArrowUp':
      rotate();
      break;
    case 'ArrowDown':
      moveDown()
      break;
    case 'ArrowLeft':
      moveLeft()
      break;
    case 'ArrowRight':
      moveRight();
      break;
    case ' ':
      dropDown();
      break;
    default:
      return;
  }
}

function moveDown() {
  tetris.moveTetrominoDown();
  draw();
  stopLoop();
  startLoop();

  if (tetris.isGameOver) {
    gameOver();
  }
}

function moveLeft() {
  tetris.moveTetrominoLeft();
  draw();
}

function moveRight() {
  tetris.moveTetrominoRight();
  draw();
}

function rotate() {
  tetris.rotateTetromino();
  draw();
}

function dropDown() {
  tetris.dropTetrominoDown();
  draw();
  stopLoop();
  startLoop();

  if (tetris.isGameOver) {
    gameOver();
  }
}

function startLoop() {
    timeoutId = setTimeout(() => requestId = requestAnimationFrame(moveDown), gameSpeed);
  }

function stopLoop() {
  cancelAnimationFrame(requestId);
  clearTimeout(timeoutId);
}

function draw() {
  cells.forEach(cell => cell.removeAttribute('class'));
  drawPlayfield();
  drawTetromino();
  drawGhostTetromino();
}

function drawPlayfield() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (!tetris.playfield[row][column]) continue;
      const name = tetris.playfield[row][column];
      const cellIndex = convertPositionToIndex(row, column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawTetromino() {
  const name = tetris.tetromino.name;
  const tetrominoMatrixSize = tetris.tetromino.matrix.length;
  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!tetris.tetromino.matrix[row][column]) continue;
      if (tetris.tetromino.row + row < 0) continue;
      const cellIndex = convertPositionToIndex(tetris.tetromino.row + row, tetris.tetromino.column + column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawGhostTetromino() {
  const tetrominoMatrixSize = tetris.tetromino.matrix.length;
  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!tetris.tetromino.matrix[row][column]) continue;
      if (tetris.tetromino.ghostRow + row < 0) continue;
      const cellIndex = convertPositionToIndex(tetris.tetromino.ghostRow + row, tetris.tetromino.ghostColumn + column);
      cells[cellIndex].classList.add('ghost');
    }
  }
}

function gameOver() {
  stopLoop();
  document.removeEventListener('keydown', onKeydown);
  saveScore(tetris.score);
  gameOverAnimation();
}

function saveScore(score) {
    const scores = JSON.parse(localStorage.getItem('tetrisHighScores')) || [];
    scores.push(score);
    scores.sort((a, b) => b - a);
    const topScores = scores.slice(0, 10);
    localStorage.setItem('tetrisHighScores', JSON.stringify(topScores));
  }

function gameOverAnimation() {
  const filledCells = [...cells].filter(cell => cell.classList.length > 0);
  filledCells.forEach((cell, i) => {
    setTimeout(() => cell.classList.add('hide'), i * 10);
    setTimeout(() => cell.removeAttribute('class'), i * 10 + 500);
  });

  setTimeout(showGameOverMenu, filledCells.length * 10 + 500);
}

function showGameOverMenu() {
    const gameOverMenu = document.getElementById('game-over-menu');
    gameOverMenu.classList.remove('hidden');
    
    document.getElementById('restart-button').removeEventListener('click', reloadPage);
    document.getElementById('restart-button').addEventListener('click', reloadPage);
    
    document.getElementById('other-button').removeEventListener('click', showLeaderboard);
    document.getElementById('other-button').addEventListener('click', showLeaderboard);
}

function reloadPage() {
    location.reload();
}

function showLeaderboard() {
  const leaderboard = document.getElementById('leaderboard');
  const gameOverMenu = document.getElementById('game-over-menu');

  gameOverMenu.classList.add('hidden');

  leaderboard.classList.remove('hidden');

  const scores = JSON.parse(localStorage.getItem('tetrisHighScores')) || [];
  const scoreTableBody = document.querySelector('#score-table tbody');
  scoreTableBody.innerHTML = '';

  scores.slice(0, 10).forEach((score, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${index + 1}</td><td>${score}</td>`;
      scoreTableBody.appendChild(row);
  });

  setTimeout(() => {
      window.addEventListener('click', closeLeaderboardOnClickOutside);
  }, 100);

  leaderboard.addEventListener('click', function(event) {
      event.stopPropagation(); 
  });
}

function closeLeaderboardOnClickOutside(event) {
  const leaderboard = document.getElementById('leaderboard-container');
  
  if (!leaderboard.contains(event.target)) {
      hideLeaderboard();
  }
}

function hideLeaderboard() {
  const leaderboard = document.getElementById('leaderboard');
  const gameOverMenu = document.getElementById('game-over-menu');

  leaderboard.classList.add('hidden');
  gameOverMenu.classList.remove('hidden');
  window.removeEventListener('click', closeLeaderboardOnClickOutside);
}
