var GameClient = (function() {

  var startNewGame = function(canvas){
    var game = Game.newGame(canvas);
    Game.startGame(game);
  };

  return {
    startNewGame: startNewGame
  };

})();

var Game = (function() {

  const BALL_RADIUS = 10;

  const PADDLE_HEIGHT = 10;
  const PADDLE_WIDTH = 75;

  const BRICKS_ROWS_COUNT = 2;
  const BRICKS_COLUMNS_COUNT = 4;
  const BRICKS_PADDING = 6;
  const BRICK_HEIGHT = 35;

  var newGame = function(canvas) {
    // setup key events event listeners
    document.addEventListener('keydown', Control.keyDownHandler, false);
    document.addEventListener('keyup', Control.keyUpHandler, false);

    return {
      canvas: canvas,
      ball: {
        position: {
          x: BALL_RADIUS + Math.floor(Math.random() * (canvas.width - BALL_RADIUS - 1)),
          y: BRICKS_ROWS_COUNT * (BRICK_HEIGHT + BRICKS_PADDING) + 2 * BALL_RADIUS
        },
        speed: {
          dx:(Math.random() + 0.75) * (Math.random() < 0.5 ? (-1) : 1),
          dy: 2
        },
        radius: BALL_RADIUS,
        hasHitBrick: false
      },
      paddle: {
        height: PADDLE_HEIGHT,
        width: PADDLE_WIDTH,
        position: {
          x: (canvas.width - PADDLE_WIDTH) / 2,
          y: canvas.height - PADDLE_HEIGHT
        }
      },
      bricks: _buildBricks(
        canvas.width,
        BRICKS_ROWS_COUNT,
        BRICKS_COLUMNS_COUNT,
        BRICKS_PADDING,
        BRICK_HEIGHT
      ),
      score: 0
    };
  };

  var startGame = function(game) {
    var interval = setInterval(function() {
      if (_isBallMoving(game.ball)) {
        _updateGame(game);
      }
      else {
        document.location.reload();
      }
    }, 10);
  };

  var _buildBricks = function(canvasWidth, rowsCount, columnsCount, padding, brickHeight){

    var bricks = [];
    var brickWidth = (canvasWidth - BRICKS_PADDING * (BRICKS_COLUMNS_COUNT + 1)) / BRICKS_COLUMNS_COUNT;

    for (var i = 0; i < BRICKS_ROWS_COUNT; i++){
      bricks[i] = [];

      for (var j = 0; j < BRICKS_COLUMNS_COUNT; j++){
        bricks[i][j] = {
          position: {
            x: (brickWidth + BRICKS_PADDING) * j + BRICKS_PADDING,
            y: (BRICK_HEIGHT + BRICKS_PADDING) * i + BRICKS_PADDING
          },
          height: BRICK_HEIGHT,
          width: brickWidth,
          color: ColorHelper.getRandomColor()
        };
      }
    }

    return bricks;
  };

  var _isBallMoving = function(ball) {
    return !(ball.speed.dx === 0 && ball.speed.dy === 0);
  };

  var _updateGame = function(game) {
    Draw.draw(game.canvas, game.ball, game.paddle, game.bricks);
    _updatePaddlePosition(game);
    _updateBricksStatus(game);
    _updateScore(game);
    _updateBallPosition(game);
    console.log(game.score);
  };

  var _updateScore = function(game) {
    if (game.ball.hasHitBrick){
      game.score += 1000;
    }
  };

  var _updatePaddlePosition = function(game) {
    if (Control.isRightPressed()
        && game.paddle.position.x < game.canvas.width - game.paddle.width) {
      game.paddle.position.x += 7;
    }

    else if (Control.isLeftPressed() && game.paddle.position.x > 0) {
      game.paddle.position.x -= 7;
    }
  };

  var _updateBricksStatus = function(game) {
    var hitBrick = _findHitBrick(game.bricks, game.ball);
    if (hitBrick !== undefined) {
      game.ball.hasHitBrick = true;

      // remove brick from bricks
      for (var i = 0; i < game.bricks.length; i++){
        var brickIndexInRow = game.bricks[i].indexOf(hitBrick)
        if (brickIndexInRow > -1 ) {
          game.bricks[i].splice(brickIndexInRow, 1);
          break;
        }
      }
    }
  };

  var _updateBallPosition = function(game) {
    _updateBallSpeed(game);
    game.ball.position.x += game.ball.speed.dx;
    game.ball.position.y += game.ball.speed.dy;
  };

  var _updateBallSpeed = function(game) {
    // bounce on the sides
    if (game.ball.position.x < game.ball.radius
        || game.ball.position.x > game.canvas.width - game.ball.radius) {
      game.ball.speed.dx *= -1;
    }

    if (game.ball.hasHitBrick){
      game.ball.speed.dy *= -1.25;
      game.ball.hasHitBrick = false;
    }

    if (game.ball.position.y < game.ball.radius) {
      game.ball.speed.dy *= -1;
    }

    if (game.ball.position.y > game.canvas.height - game.ball.radius) {
      if (game.ball.position.x >= game.paddle.position.x
        && game.ball.position.x <= game.paddle.position.x + game.paddle.width) {
        game.ball.speed.dy *= -1;
      }
      else {
        game.ball.speed.dx = 0;
        game.ball.speed.dy = 0;
      }
    }
  };

  var _findHitBrick = function(bricks, ball) {
    var hitBrick;

    for (var i = 0; i < bricks.length; i++) {
      for (var j = 0; j < bricks[i].length; j++) {
        var brick = bricks[i][j];

        if (ball.position.y < brick.position.y + brick.height + ball.radius) {
          // TODO Handle touching multiple bricks ;)
          if (ball.position.x > brick.position.x - ball.radius
            && ball.position.x - ball.radius < brick.position.x + brick.width + ball.radius) {
              hitBrick = brick;
          }
        }
      }
    }

    return hitBrick;
  };

  return {
    newGame: newGame,
    startGame: startGame
  };

})();

var Control = (function(){

  const LEFT_CURSOR_KEYCODE = 37;
  const RIGHT_CURSOR_KEYCODE = 39;

  var leftPressed = false;
  var rightPressed = false;

  var keyDownHandler = function(e) {
    if (e.keyCode === RIGHT_CURSOR_KEYCODE) {
      rightPressed = true;
    }

    else if (e.keyCode === LEFT_CURSOR_KEYCODE) {
      leftPressed = true;
    }
  };

  var keyUpHandler = function(e) {
    if (e.keyCode === RIGHT_CURSOR_KEYCODE) {
      rightPressed = false;
    }

    else if (e.keyCode === LEFT_CURSOR_KEYCODE) {
      leftPressed = false;
    }
  };

  var isLeftPressed = function(){
    return leftPressed;
  };

  var isRightPressed = function(){
    return rightPressed;
  };

  return {
    keyDownHandler: keyDownHandler,
    keyUpHandler: keyUpHandler,
    isLeftPressed: isLeftPressed,
    isRightPressed: isRightPressed
  };

})();

var Draw = (function() {

  var draw = function(canvas, ball, paddle, bricks) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    _drawBall(context, ball.position.x, ball.position.y, ball.radius);
    _drawPaddle(context, paddle.position.x, paddle.position.y, paddle.width, paddle.height);
    _drawBricks(context, bricks);
  };

  var _drawBall = function(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI*2);
    context.fillStyle = '#0095DD';
    context.fill();
    context.closePath();
  };

  var _drawPaddle = function(context, x, y, width, height) {
    context.beginPath();
    context.rect(x, y, width, height);
    context.fillStyle = '#0095DD';
    context.fill();
    context.closePath();
  };

  var _drawBricks = function(context, bricks) {
    for(var i = 0; i < bricks.length; i++){
      for(var j = 0; j < bricks[i].length; j++){
        var brick = bricks[i][j];
        context.beginPath();
        context.rect(brick.position.x, brick.position.y, brick.width, brick.height);
        context.fillStyle = brick.color;
        context.fill();
        context.closePath();
      }
    }
  };

  return {
    draw: draw
  };

})();

var ColorHelper = (function() {

  var getRandomColor = function(){
    var r = _getRandomIntValue(255);
    var g = _getRandomIntValue(255);
    var b = _getRandomIntValue(255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };

  var _getRandomIntValue = function(max) {
    return Math.floor((Math.random() * (max + 1)) + 0);
  };

  return {
    getRandomColor: getRandomColor
  };

})();

GameClient.startNewGame(document.getElementById('myCanvas'));
