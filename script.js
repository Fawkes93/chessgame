'use strict';

// HTML Elements

const chessTable = document.querySelector('.chess-table');
const tableCells = chessTable.getElementsByTagName('td');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const messageBoard = document.querySelector('.message-board');

const data = {
  wBishop: {
    name: 'wbishop',
    alive: true,
    type: 'bishop',
    color: 'white',
  },
  wKnight: {
    name: 'wknight',
    alive: true,
    type: 'knight',
    color: 'white',
  },
  wQueen: {
    name: 'wqueen',
    alive: true,
    type: 'queen',
    color: 'white',
  },
  bBishop: {
    name: 'bbishop',
    alive: true,
    type: 'bishop',
    color: 'black',
  },
  bKnight: {
    name: 'bknight',
    alive: true,
    type: 'knight',
    color: 'black',
  },
  bQueen: {
    name: 'bqueen',
    alive: true,
    type: 'queen',
    color: 'black',
  },
};

const pieces = [
  data.wQueen,
  data.wBishop,
  data.wKnight,
  data.bQueen,
  data.bBishop,
  data.bKnight,
];

let wTeamTurn = true;
let currentPlayer = '';
let isGameOver = false;

for (const td of tableCells) {
  td.setAttribute('id', td.textContent);
  td.textContent = '';
}

const generateRndmTableAddress = function () {
  let moveStr = '';
  const chars = 'ABCDEFGH';
  const nbrs = '12345678';
  moveStr += chars.charAt(Math.random() * chars.length);
  moveStr += nbrs.charAt(Math.random() * nbrs.length);

  const move = [+moveStr[0].charCodeAt(), +moveStr[1]];
  return { move: move, moveStr: moveStr };
};

const findCommonElements = function (arr1, arr2) {
  return arr1.some(item => arr2.includes(item));
};

const generatePath = function (position, nextMove) {
  let path = [];
  let pathStr = [];
  nextMove = [+nextMove[0].charCodeAt(), +nextMove[1]];
  const pathType =
    position[0] === nextMove[0] || position[1] === nextMove[1] ? 'straight' : 'diagonal';

  const [c1, r1] = position;
  const [c2, r2] = nextMove;

  if (pathType === 'straight' && c1 > c2) {
    for (let i = 1; i < c1 - c2; i++) {
      path.push([c2 + i, r2]);
    }
  }
  if (pathType === 'straight' && c1 < c2) {
    for (let i = 1; i < c2 - c1; i++) {
      path.push([c2 - i, r2]);
    }
  }
  if (pathType === 'straight' && r1 < r2) {
    for (let i = 1; i < r2 - r1; i++) {
      path.push([c2, r2 - i]);
    }
  }
  if (pathType === 'straight' && r1 > r2) {
    for (let i = 1; i < r1 - r2; i++) {
      path.push([c2, r2 + i]);
    }
  }
  if (pathType === 'diagonal' && c1 > c2 && r1 > r2) {
    for (let i = 1; i < c1 - c2; i++) {
      path.push([c2 + i, r2 + i]);
    }
  }
  if (pathType === 'diagonal' && c2 > c1 && r2 > r1) {
    for (let i = 1; i < c2 - c1; i++) {
      path.push([c1 + i, r1 + i]);
    }
  }
  if (pathType === 'diagonal' && c2 > c1 && r2 < r1) {
    for (let i = 1; i < c2 - c1; i++) {
      path.push([c1 + i, r1 - i]);
    }
  }
  if (pathType === 'diagonal' && c1 > c2 && r1 < r2) {
    for (let i = 1; i < c1 - c2; i++) {
      path.push([c1 - i, r1 + i]);
    }
  }
  for (const [c, r] of path) {
    pathStr.push(String.fromCharCode(c) + r);
  }
  return pathStr;
};

const generateKnightMoves = function (position) {
  const [c, r] = position;
  let isValid = false;

  while (!isValid) {
    const { moveStr: randNbrs, move: randNbrsArr } = generateRndmTableAddress();
    const positionToStr = String.fromCharCode(position[0]) + position[1];
    isValid =
      ((Math.abs(c - randNbrsArr[0]) === 1 && Math.abs(r - randNbrsArr[1]) === 2) ||
        (Math.abs(c - randNbrsArr[0]) === 2 && Math.abs(r - randNbrsArr[1]) === 1)) &&
      positionToStr !== randNbrs;
    randNbrsArr.equals !== position;

    if (isValid) return String.fromCharCode(randNbrsArr[0]) + randNbrsArr[1];
  }
};

const generateBishopMoves = function (position) {
  const [c, r] = position;
  let isValid = false;

  while (!isValid) {
    const { moveStr: randNbrs, move: randNbrsArr } = generateRndmTableAddress();
    const positionToStr = String.fromCharCode(position[0]) + position[1];

    isValid =
      Math.abs(c - randNbrsArr[0]) === Math.abs(r - randNbrsArr[1]) &&
      positionToStr !== randNbrs;
    randNbrsArr.equals !== position;

    if (isValid) return String.fromCharCode(randNbrsArr[0]) + randNbrsArr[1];
  }
};

const generateQueenMoves = function (position) {
  const [c, r] = position;
  let isValid = false;
  let isValidPath = false;

  while (!isValid) {
    const { moveStr: randNbrs, move: randNbrsArr } = generateRndmTableAddress();
    const positionToStr = String.fromCharCode(position[0]) + position[1];
    isValid =
      (c - randNbrsArr[0] === 0 ||
        r - randNbrsArr[1] === 0 ||
        Math.abs(c - randNbrsArr[0]) === Math.abs(r - randNbrsArr[1])) &&
      positionToStr !== randNbrs;
    randNbrsArr.equals !== position;

    if (isValid) return String.fromCharCode(randNbrsArr[0]) + randNbrsArr[1];
  }
};

const onboardPieces = function () {
  let takenSquares = [];
  pieces.forEach(piece => {
    let { moveStr: positionStr, move: asciiPosition } = generateRndmTableAddress();
    while (takenSquares.includes(positionStr)) {
      ({ moveStr: positionStr } = generateRndmTableAddress());
    }
    piece.position = positionStr;
    piece.asciiPosition = asciiPosition;
    takenSquares.push(positionStr);
    const cell = document.getElementById(positionStr);
    const img = document.createElement('img');
    img.src = `img/${piece.name}.png`;
    cell.appendChild(img);
  });
};

const validatetMove = function ({ asciiPosition: position, type: playerType, color }) {
  console.log('validating move');
  let moveStr = '';
  let path = [];
  let isValid = false;
  let looser = null;
  let isValidLooser = false;
  let isWinner = false;
  const takenPositions = [];

  pieces.forEach(piece => {
    if (piece.alive) {
      takenPositions.push(piece.position);
    }
  });

  console.log(`taken positions ${takenPositions}`);

  while (!isValid) {
    console.log(`entering while loop with ${playerType} at position ${position}`);
    console.log(position);
    switch (playerType) {
      case 'knight':
        moveStr = generateKnightMoves(position);
        console.log(`generating move ${moveStr} `);
        break;
      case 'bishop':
        moveStr = generateBishopMoves(position);
        path = generatePath(position, moveStr);
        console.log(`generating move ${moveStr} and path ${path}`);
        break;
      case 'queen':
        moveStr = generateQueenMoves(position);
        path = generatePath(position, moveStr);
        console.log(`generating move ${moveStr} and path ${path}`);

        break;
      default:
        console.log('no such player type');
    }

    const checkLooser = function () {
      const loser = pieces.find(piece => piece.position === moveStr);
      console.log(`lOser found is ${loser?.name}`);
      if (loser && loser.color !== color) {
        console.log(
          `valid looser is ${loser.name} with color ${loser.color} at position ${moveStr}. current color ${color}`
        );
        isValidLooser = true;
      }
      looser = loser;
      loser && console.log(`looser is from same team ${color}`);
    };
    checkLooser();

    if (playerType === 'knight' && isValidLooser) {
      if (takenPositions.includes(moveStr)) {
        isWinner = true;
        console.log(`${playerType} WOOONN!!!!! over piece at position ${moveStr}`);
      }
      console.log(`valid ${playerType} move. Returning...`);
      return { moveStr, path, isWinner };
    }

    for (const pos of takenPositions) {
      console.log(`entering for loop to check if next move has obstacles`);
      if (playerType !== 'knight' && pos === moveStr && isValidLooser) {
        console.log(`winner move from ${position} to ${moveStr}`);
        console.log(moveStr);
        isWinner = !findCommonElements(path, takenPositions);
        if (isWinner) {
          console.log(`${playerType} has WOOON!!!!!! over piece at ${moveStr}. Returning...`);
          return { moveStr, path, isWinner };
        }
      }
      console.log(`no obstacles found`);
    }

    isValid = !findCommonElements(path, takenPositions) && !looser;
    if (isValid) {
      console.log(`move ${moveStr} is valid ${isValid}. Returning...`);
      return { moveStr, path, isWinner };
    } else {
      console.log(`${moveStr} is NOT valid. Going for new iteration`);
    }
  }
};

const updateUI = function ({ name, position }, move, isWinner) {
  if (isGameOver) return;
  if (isWinner) {
    const loserCell = document.getElementById(move);
    console.log(`loser cell is ${loserCell}`);
    loserCell.removeChild(loserCell.firstChild);
  }

  const oldCell = document.getElementById(position);
  oldCell.removeChild(oldCell.firstChild);

  const newCell = document.getElementById(move);
  const img = document.createElement('img');
  img.src = `img/${name}.png`;
  newCell.appendChild(img);
};

const getNextPlayer = function () {
  const wTeam = [];
  const bTeam = [];

  pieces.forEach(piece => {
    piece.alive && piece.color === 'black' && bTeam.push(piece);
    piece.alive && piece.color === 'white' && wTeam.push(piece);
  });

  isGameOver = wTeam.length === 0 || bTeam.length === 0;
  console.log(`GAME OOOOVERRR!!! is over ${isGameOver}`);
  return wTeamTurn
    ? wTeam[Math.floor(Math.random() * wTeam.length)]
    : bTeam[Math.floor(Math.random() * bTeam.length)];
};

const makeMove = function (run) {
  if (isGameOver) {
    messageBoard.textContent = 'GAME OVER';
    clearInterval(run);
    return;
  }
  startBtn.disabled = true;
  currentPlayer = getNextPlayer();
  const { isWinner, moveStr } = validatetMove(currentPlayer);
  updateUI(currentPlayer, moveStr, isWinner);
  if (isWinner) {
    const looser = pieces.find(piece => piece.position === moveStr);
    looser.alive = false;
  } else {
    wTeamTurn = !wTeamTurn;
  }
  currentPlayer.position = moveStr;
  currentPlayer.asciiPosition = [+moveStr[0].charCodeAt(), +moveStr[1]];
};
const startGame = function () {
  const run = setInterval(() => makeMove(run), 100);
};

const resetGame = function () {
  location.reload();
};

const init = function () {
  onboardPieces();

  startBtn.addEventListener('click', () => startGame());
  resetBtn.addEventListener('click', () => resetGame());
};
init();
