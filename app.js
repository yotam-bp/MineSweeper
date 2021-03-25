'use strict';

const MINE = '💣';
const MARK = '🚩';
const EMPTY = ' ';

var gStartTime
var gIntervalTimer;
var gBoard;

var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

function changeDifficulty(num) {
    switch (num) {
        case 4:
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            break;
        case 8:
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break;
        case 12:
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break;
    }
    restart()
}

function restart() {
    document.querySelector('.smiley').innerText = '😀';
    document.querySelector('.game-over').innerText = '';
    document.querySelector('.timer').innerText = `Timer 0:0`;
    initGame()
}

function initGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    clearInterval(gIntervalTimer);
    gBoard = buildBoard(gBoard);
    placeMines(gBoard)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard);
}

function buildBoard() {
    var SIZE = gLevel.SIZE;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board.push([]);
        for (var j = 0; j < SIZE; j++) {
            var cell = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }
    return board;
}

function renderBoard(board) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine) {
                cell.minesAroundCount = MINE
            }
            strHTML += `<td class= "cell${i}-${j}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML;
}

function placeMines(board) {
    var minesNum = gLevel.MINES;
    for (var i = 0; i < minesNum; i++) {
        var randRow = getRandomInt(0, gLevel.SIZE);
        var randCol = getRandomInt(0, gLevel.SIZE);
        var cell = board[randRow][randCol];
        if (cell.isMine) minesNum++;
        cell.isMine = true;
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var neighborsNum = findNeighbors(i, j, board);
            var cell = board[i][j];
            cell.minesAroundCount = (neighborsNum === 0) ? EMPTY : neighborsNum;
        }
    }
    return board;
}

function findNeighbors(cellI, cellJ, board) {
    var countMines = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[0].length) continue;
            if (board[i][j].isMine) {
                countMines++;
            }
        }
    }
    return countMines;
}

function returnCellContent(i, j) {
    var currCell = gBoard[i][j];
    if (currCell.isMine) return MINE;
    else if (currCell.minesAroundCount > 0) return currCell.minesAroundCount;
    else return '';
}

function cellClicked(elCell, i, j) {
    var currCell = gBoard[i][j];
    if (currCell.isMarked || currCell.isShown) return
    if (gGame.shownCount === 0 && currCell.isMine) restart()
    else {
        (gGame.shownCount === 0) ? startTimer() : null
        gGame.shownCount++
        elCell.classList.add('clicked');
        currCell.isShown = true
        if (currCell.isMine) {
            clearInterval(gIntervalTimer);
            revealMines(i, j, gBoard)
            gameOver(false)
        }
        elCell.innerText = returnCellContent(i, j)
        if (gBoard[i][j].minesAroundCount === EMPTY) {
            expandShown(i, j, gBoard)
        };
    }
    checkGameOver()
}

function cellMarked(elCell, i, j) {
    window.addEventListener('contextmenu', function (elCell) {
    elCell.preventDefault();
    }, false);
    var currCell = gBoard[i][j];
    currCell.isMarked = !currCell.isMarked;
    elCell.classList.toggle('marked');
    gGame.markedCount = currCell.isMarked ? gGame.markedCount++ : gGame.markedCount--;
    elCell.innerText = currCell.isMarked ? MARK : EMPTY;
    checkGameOver()
}

function startTimer() {
    gStartTime = Date.now();
    gIntervalTimer = setInterval(setTimer, 1000)
}

function setTimer() {
    var currTime = Date.now()
    var diffTime = new Date(currTime - gStartTime)
    var printedTime = `${diffTime.getMinutes()}:${diffTime.getSeconds()}`;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = `Timer ${printedTime}`;
}
function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isShown && !cell.isMine ||
                cell.isMine && !cell.isMarked) return {
                }
        }
    }
    gameOver(true)
}

function gameOver(isWin) {
    clearInterval(gIntervalTimer);
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = (isWin) ? '😎' : '🤯';
    var elGameOver = document.querySelector('.game-over')
    elGameOver.innerText = (isWin) ? `Game-Over you won!` : `Game-Over you lose!`;
}

function expandShown(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine === false) {
                board[i][j].isShown = true;
                var elCell = document.querySelector(`.cell${i}-${j}`)
                elCell.classList.add('clicked')
                cellClicked(elCell, i, j);
            }
        }
    }
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var elCell = document.querySelector(`.cell${i}-${j}`)
                elCell.classList.add('clicked')
                cellClicked(elCell, i, j);
        }
    }
}
