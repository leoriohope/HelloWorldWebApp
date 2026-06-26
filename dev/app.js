(function () {
  var config = window.APP_CONFIG || {};
  var environment = config.environment || "local";
  var environmentLabel = document.getElementById("environment-label");
  var boardElement = document.getElementById("board");
  var statusMessage = document.getElementById("status-message");
  var turnLabel = document.getElementById("turn-label");
  var undoButton = document.getElementById("undo-button");
  var resetButton = document.getElementById("reset-button");
  var blackScore = document.getElementById("black-score");
  var whiteScore = document.getElementById("white-score");
  var size = 15;
  var board = [];
  var moves = [];
  var currentPlayer = "black";
  var winner = null;
  var scores = {
    black: 0,
    white: 0
  };

  if (environmentLabel) {
    environmentLabel.textContent = "Environment: " + environment;
  }

  function createEmptyBoard() {
    board = [];
    for (var row = 0; row < size; row += 1) {
      board[row] = [];
      for (var col = 0; col < size; col += 1) {
        board[row][col] = "";
      }
    }
  }

  function renderBoard() {
    boardElement.innerHTML = "";

    for (var row = 0; row < size; row += 1) {
      for (var col = 0; col < size; col += 1) {
        var cell = document.createElement("button");
        var value = board[row][col];
        cell.className = "cell" + (value ? " occupied " + value : "");
        cell.type = "button";
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-label", "Row " + (row + 1) + ", column " + (col + 1));
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.disabled = Boolean(value || winner);

        if (value) {
          var stone = document.createElement("span");
          stone.className = "stone " + value;
          cell.appendChild(stone);
        }

        boardElement.appendChild(cell);
      }
    }
  }

  function updateStatus() {
    var playerName = currentPlayer === "black" ? "Black" : "White";
    var preview = currentPlayer === "black" ? "black" : "white";
    turnLabel.innerHTML = '<span class="stone-preview ' + preview + '"></span>' + playerName;
    blackScore.textContent = scores.black;
    whiteScore.textContent = scores.white;
    undoButton.disabled = moves.length === 0 || Boolean(winner);

    if (winner) {
      statusMessage.textContent = (winner === "black" ? "Black" : "White") + " wins with five in a row.";
      return;
    }

    if (moves.length === size * size) {
      statusMessage.textContent = "The board is full. Start a new game.";
      return;
    }

    statusMessage.textContent = playerName + " to move.";
  }

  function countDirection(row, col, rowStep, colStep, player) {
    var total = 0;
    var nextRow = row + rowStep;
    var nextCol = col + colStep;

    while (
      nextRow >= 0 &&
      nextRow < size &&
      nextCol >= 0 &&
      nextCol < size &&
      board[nextRow][nextCol] === player
    ) {
      total += 1;
      nextRow += rowStep;
      nextCol += colStep;
    }

    return total;
  }

  function hasFive(row, col, player) {
    var directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1]
    ];

    return directions.some(function (direction) {
      var rowStep = direction[0];
      var colStep = direction[1];
      var total = 1;
      total += countDirection(row, col, rowStep, colStep, player);
      total += countDirection(row, col, -rowStep, -colStep, player);
      return total >= 5;
    });
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === "black" ? "white" : "black";
  }

  function handleMove(event) {
    var cell = event.target.closest(".cell");
    if (!cell || winner) {
      return;
    }

    var row = Number(cell.dataset.row);
    var col = Number(cell.dataset.col);
    if (board[row][col]) {
      return;
    }

    board[row][col] = currentPlayer;
    moves.push({ row: row, col: col, player: currentPlayer });

    if (hasFive(row, col, currentPlayer)) {
      winner = currentPlayer;
      scores[currentPlayer] += 1;
    } else {
      switchPlayer();
    }

    renderBoard();
    updateStatus();
  }

  function undoMove() {
    if (!moves.length || winner) {
      return;
    }

    var move = moves.pop();
    board[move.row][move.col] = "";
    currentPlayer = move.player;
    renderBoard();
    updateStatus();
  }

  function resetGame() {
    createEmptyBoard();
    moves = [];
    currentPlayer = "black";
    winner = null;
    renderBoard();
    updateStatus();
  }

  boardElement.addEventListener("click", handleMove);
  undoButton.addEventListener("click", undoMove);
  resetButton.addEventListener("click", resetGame);

  resetGame();
})();
