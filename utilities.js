export const PLAYFIELD_COLUMNS = 10;
export const PLAYFIELD_ROWS = 20;
export const TETROMINO_NAMES = ['I', 'J', 'L', 'O', 'S', 'Z', 'T', 'Q', 'XUI', 'X', 'R', 'U', 'N', 'PIP', 'BLOCK'];
export const TETROMINOES = {
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  'J': [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'L': [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'O': [
    [1, 1],
    [1, 1],
  ],
  'S': [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  'Z': [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  'T': [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'Q': [
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1]
  ],
  'XUI': [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1]
  ],
  'R': [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
  ],
  'X': [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  'U': [
    [0, 0, 0],
    [1, 0, 1],
    [1, 1, 1],
  ],
  'N': [
    [0, 0, 1],
    [1, 1, 1],
    [0, 1, 0],
  ],
  'PIP': [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ],  
  'BLOCK': [
    [0, 0, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

export function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function rotateMatrix(matrix) {
  const N = matrix.length;
  const rotatedMatrix = [];
  for (let i = 0; i < N; i++) {
    rotatedMatrix[i] = [];
    for (let j = 0; j < N; j++) {
      rotatedMatrix[i][j] = matrix[N - j - 1][i];
    }
  }
  return rotatedMatrix;
}

export function convertPositionToIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}
