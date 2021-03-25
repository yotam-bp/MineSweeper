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
    initGame();
}

function initGame() {
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
    console.table(board)
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
    if (gBoard[i][j].isMarked || gBoard[i][j].isShown) return
    if (gGame.shownCount === 0) {
        startTimer()
    }
    gGame.shownCount++
    elCell.classList.add('clicked');
    var currCell = gBoard[i][j];
    currCell.isShown = true
    if (currCell.isMine) {
        mineClicked()
        console.log('empty')
    }
    console.log(gBoard)
    elCell.innerText = returnCellContent(i, j)
    if (gBoard[i][j].minesAroundCount === EMPTY) {
        expandShown(i, j, gBoard)
    };
}

function cellMarked(elCell, i, j) {
    window.addEventListener('contextmenu', function (elCell) {
        elCell.preventDefault(); 
    }, false);
    var currCell = gBoard[i][j];
    currCell.isMarked = !currCell.isMarked;
    elCell.classList.toggle('marked');
    gGame.markedCount = currCell.isMarked ? ++gGame.markedCount : --gGame.markedCount;
    elCell.innerText = currCell.isMarked ? MARK : EMPTY;
}

function mineClicked(elCell, i, j) {
console.log('mine')
checkGameOver(false)
}
function startTimer() {
    gStartTime = Date.now();
    gIntervalTimer = setInterval(setTimer, 100)
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
            var cell = gBoard[i][j];
            if (!cell.isShown && !cell.isMine ||
                cell.isMine && !cell.isMarked) return;
        }
    }
    gameOver(true)
}

function gameOver(isWin) {
    clearInterval(gIntervalTimer);
    console.log(gIntervalTimer);
    var elSmiley = document.querySelector('.smiley')
    if (!isWin) {
        elSmiley.innerText = '🤯';
    } else if (isWin) {
        elSmiley.innerText = '😎';
    }

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


// function renderMineCell(i, j) {
//     var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
//     elCell.classList.add('mine');
// }