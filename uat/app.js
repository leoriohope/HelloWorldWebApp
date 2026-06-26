(function () {
  var config = window.APP_CONFIG || {};
  var environment = config.environment || "local";
  var environmentLabel = document.getElementById("environment-label");
  var canvas = document.getElementById("board");
  var context = canvas.getContext("2d");
  var statusMessage = document.getElementById("status-message");
  var turnLabel = document.getElementById("turn-label");
  var undoButton = document.getElementById("undo-button");
  var resetButton = document.getElementById("reset-button");
  var humanModeButton = document.getElementById("human-mode-button");
  var computerModeButton = document.getElementById("computer-mode-button");
  var blackScore = document.getElementById("black-score");
  var whiteScore = document.getElementById("white-score");
  var size = 15;
  var board = [];
  var moves = [];
  var currentPlayer = "black";
  var winner = null;
  var mode = "computer";
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

  function getBoardMetrics() {
    var rect = canvas.getBoundingClientRect();
    var pixelRatio = window.devicePixelRatio || 1;
    var side = Math.max(320, Math.floor(rect.width));
    canvas.width = side * pixelRatio;
    canvas.height = side * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    var padding = side * 0.06;
    var playable = side - padding * 2;
    return {
      side: side,
      padding: padding,
      gap: playable / (size - 1)
    };
  }

  function drawStone(row, col, player, metrics) {
    var x = metrics.padding + col * metrics.gap;
    var y = metrics.padding + row * metrics.gap;
    var radius = metrics.gap * 0.39;
    var gradient = context.createRadialGradient(
      x - radius * 0.35,
      y - radius * 0.45,
      radius * 0.12,
      x,
      y,
      radius
    );

    if (player === "black") {
      gradient.addColorStop(0, "#545b66");
      gradient.addColorStop(1, "#10141b");
    } else {
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#d9e0e8");
    }

    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();
    context.strokeStyle = player === "black" ? "#080a0d" : "#aeb8c4";
    context.lineWidth = 1.5;
    context.stroke();
  }

  function drawBoard() {
    var metrics = getBoardMetrics();
    context.clearRect(0, 0, metrics.side, metrics.side);
    context.fillStyle = "#d8ad70";
    context.fillRect(0, 0, metrics.side, metrics.side);

    context.strokeStyle = "#6f4a24";
    context.lineWidth = 1.25;
    for (var i = 0; i < size; i += 1) {
      var position = metrics.padding + i * metrics.gap;
      context.beginPath();
      context.moveTo(metrics.padding, position);
      context.lineTo(metrics.side - metrics.padding, position);
      context.stroke();

      context.beginPath();
      context.moveTo(position, metrics.padding);
      context.lineTo(position, metrics.side - metrics.padding);
      context.stroke();
    }

    [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]].forEach(function (point) {
      context.beginPath();
      context.arc(
        metrics.padding + point[1] * metrics.gap,
        metrics.padding + point[0] * metrics.gap,
        Math.max(3, metrics.gap * 0.1),
        0,
        Math.PI * 2
      );
      context.fillStyle = "#6f4a24";
      context.fill();
    });

    for (var row = 0; row < size; row += 1) {
      for (var col = 0; col < size; col += 1) {
        if (board[row][col]) {
          drawStone(row, col, board[row][col], metrics);
        }
      }
    }
  }

  function updateStatus() {
    var playerName = currentPlayer === "black" ? "Black" : "White";
    turnLabel.innerHTML = '<span class="stone-preview ' + currentPlayer + '"></span>' + playerName;
    blackScore.textContent = scores.black;
    whiteScore.textContent = scores.white;
    undoButton.disabled = moves.length === 0 || Boolean(winner);
    humanModeButton.classList.toggle("active", mode === "human");
    computerModeButton.classList.toggle("active", mode === "computer");

    if (winner) {
      statusMessage.textContent = (winner === "black" ? "Black" : "White") + " wins. Start a new game to play again.";
    } else if (moves.length === size * size) {
      statusMessage.textContent = "The board is full. Start a new game.";
    } else if (mode === "computer" && currentPlayer === "white") {
      statusMessage.textContent = "Computer is thinking.";
    } else {
      statusMessage.textContent = playerName + " to move.";
    }
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
    return [[0, 1], [1, 0], [1, 1], [1, -1]].some(function (direction) {
      return 1 +
        countDirection(row, col, direction[0], direction[1], player) +
        countDirection(row, col, -direction[0], -direction[1], player) >= 5;
    });
  }

  function getCellFromPointer(event) {
    var rect = canvas.getBoundingClientRect();
    var metrics = getBoardMetrics();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var col = Math.round((x - metrics.padding) / metrics.gap);
    var row = Math.round((y - metrics.padding) / metrics.gap);

    if (row < 0 || row >= size || col < 0 || col >= size) {
      return null;
    }

    return { row: row, col: col };
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === "black" ? "white" : "black";
  }

  function placeStone(row, col, player) {
    if (winner || board[row][col]) {
      return false;
    }

    board[row][col] = player;
    moves.push({ row: row, col: col, player: player });

    if (hasFive(row, col, player)) {
      winner = player;
      scores[player] += 1;
    } else {
      switchPlayer();
    }

    drawBoard();
    updateStatus();
    return true;
  }

  function scoreMove(row, col, player) {
    var opponent = player === "black" ? "white" : "black";
    var score = 0;
    board[row][col] = player;
    if (hasFive(row, col, player)) {
      score += 100000;
    }
    board[row][col] = opponent;
    if (hasFive(row, col, opponent)) {
      score += 90000;
    }
    board[row][col] = "";

    [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(function (direction) {
      var own = countDirection(row, col, direction[0], direction[1], player) +
        countDirection(row, col, -direction[0], -direction[1], player);
      var enemy = countDirection(row, col, direction[0], direction[1], opponent) +
        countDirection(row, col, -direction[0], -direction[1], opponent);
      score += own * own * 12;
      score += enemy * enemy * 10;
    });

    score -= Math.abs(7 - row) + Math.abs(7 - col);
    return score;
  }

  function chooseComputerMove() {
    var bestMove = null;
    var bestScore = -Infinity;

    for (var row = 0; row < size; row += 1) {
      for (var col = 0; col < size; col += 1) {
        if (!board[row][col]) {
          var score = scoreMove(row, col, "white");
          if (score > bestScore) {
            bestScore = score;
            bestMove = { row: row, col: col };
          }
        }
      }
    }

    return bestMove || { row: 7, col: 7 };
  }

  function playComputerMove() {
    if (mode !== "computer" || winner || currentPlayer !== "white") {
      return;
    }

    window.setTimeout(function () {
      var move = chooseComputerMove();
      placeStone(move.row, move.col, "white");
    }, 250);
  }

  function handleBoardClick(event) {
    if (mode === "computer" && currentPlayer === "white") {
      return;
    }

    var cell = getCellFromPointer(event);
    if (!cell) {
      return;
    }

    if (placeStone(cell.row, cell.col, currentPlayer)) {
      playComputerMove();
    }
  }

  function undoMove() {
    if (!moves.length || winner) {
      return;
    }

    var undoCount = mode === "computer" ? Math.min(2, moves.length) : 1;
    for (var i = 0; i < undoCount; i += 1) {
      var move = moves.pop();
      board[move.row][move.col] = "";
      currentPlayer = move.player;
    }

    drawBoard();
    updateStatus();
  }

  function resetGame() {
    createEmptyBoard();
    moves = [];
    currentPlayer = "black";
    winner = null;
    drawBoard();
    updateStatus();
  }

  function setMode(nextMode) {
    mode = nextMode;
    resetGame();
  }

  canvas.addEventListener("click", handleBoardClick);
  undoButton.addEventListener("click", undoMove);
  resetButton.addEventListener("click", resetGame);
  humanModeButton.addEventListener("click", function () {
    setMode("human");
  });
  computerModeButton.addEventListener("click", function () {
    setMode("computer");
  });
  window.addEventListener("resize", drawBoard);

  resetGame();
})();
