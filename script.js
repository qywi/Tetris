import { Tetris } from "./tetris.js";
import { PLAYFIELD_COLUMNS, PLAYFIELD_ROWS, convertPositionToIndex } from "./utilities.js";
import { gameState } from "./gameState.js";

let hammer;
let requestId;
let timeoutId;
const tetris = new Tetris();
const cells = document.querySelectorAll('.grid>div');

export const hit =  document.querySelector('.hit');
export const hitTrick =  document.querySelector('.hit-trick');
const audio1 =  document.querySelector('.audio1');
const audio2 =  document.querySelector('.audio2');

export let difficultyMultiplier = 1;
let gameSpeed = 500;

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', playAudioOnInteraction);
  document.addEventListener('keydown', playAudioOnInteraction);
});

function playAudioOnInteraction() {
  document.removeEventListener('click', playAudioOnInteraction);
  document.removeEventListener('keydown', playAudioOnInteraction);
  
  audio1.play().then(() => {
    audio1.loop = true;
  }).catch((error) => {
    console.error('Ошибка при воспроизведении аудио:', error);
  });
}

document.getElementById('vanilla').addEventListener('click', () => chooseMode('vanilla'));
document.getElementById('experimental').addEventListener('click', () => chooseMode('experimental'));

document.getElementById('baby').addEventListener('click', () => startGame('baby'));
document.getElementById('normal').addEventListener('click', () => startGame('normal'));
document.getElementById('nightmares').addEventListener('click', () => startGame('nightmares'));

document.querySelector('.mode-menu').style.display = 'block';

function chooseMode(mode) {
  gameState.gameMode = mode;
  document.querySelector('.mode-menu').style.display = 'none';
  document.querySelector('.difficulty-menu').style.display = 'block';  
}

function initKeydown() {
  document.addEventListener('keydown', onKeydown);
}

function initTouch() {
  document.addEventListener('dblclick', (event) => {
    event.preventDefault();
  });

  hammer = new Hammer(document.querySelector('body'));
  hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
  hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

  const threshold = 30;
  let deltaX = 0;
  let deltaY = 0;

  hammer.on('panstart', () => {
    deltaX = 0;
    deltaY = 0;
  });

  hammer.on('panleft', (event) => {
    if (Math.abs(event.deltaX - deltaX) > threshold) {
      moveLeft()
      deltaX = event.deltaX;
      deltaY = event.deltaY;
    }
  });

  hammer.on('panright', (event) => {
    if (Math.abs(event.deltaX - deltaX) > threshold) {
      moveRight();
      deltaX = event.deltaX;
      deltaY = event.deltaY;
    }
  });

  hammer.on('pandown', (event) => {
    if (Math.abs(event.deltaY - deltaY) > threshold) {
      moveDown();
      deltaX = event.deltaX;
      deltaY = event.deltaY;
    }
  });

  hammer.on('swipedown', (event) => {
    dropDown();
  });

  hammer.on('tap', () => {
    rotate();
  });
};

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
        difficultyMultiplier = 4;
        gameSpeed = 200;
        gameState.difficulty = 'nightmares'

        audio1.pause();
        audio1.currentTime = 0; 
        audio2.play();
        audio2.loop = true; 
      break;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hit.pause();
        hitTrick.pause();
        audio1.pause();
        audio2.pause();
      } else {
        if (gameState.difficulty === 'nightmares') {
          audio2.play(); 
        } else {
          audio1.play(); 
        }
      }
    });

    document.querySelector('.difficulty-menu').style.display = 'none';
    initKeydown();
    initTouch();
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
  hammer.off('panstart panleft panright pandown swipedown tap');
  saveScore(tetris.score);
  gameOverAnimation();
}

function saveScore(score) {
  const storageKey = gameState.gameMode === 'vanilla' ? 'vanillaTetrisHighScores' : 'experimentalTetrisHighScores';
  const scores = JSON.parse(localStorage.getItem(storageKey)) || [];
  scores.push(score);
  scores.sort((a, b) => b - a);
  const topScores = scores.slice(0, 10);
  localStorage.setItem(storageKey, JSON.stringify(topScores));
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

  const highScoresKey = gameState.gameMode === 'experimental' ? 'experimentalTetrisHighScores' : 'vanillaTetrisHighScores';

  const scores = JSON.parse(localStorage.getItem(highScoresKey)) || [];
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