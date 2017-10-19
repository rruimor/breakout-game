var Draw = (function() {

  var _drawBall = function(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  };

  var _drawPaddle = function(ctx, x, y, width, height) {
    ctx.beginPath;
    ctx.rect(x, y, width, height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath;
  };

  var draw = function(canvas, ball, paddle) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _drawBall(ctx, ball.position.x, ball.position.y, ball.radius);
    _drawPaddle(ctx, paddle.position.x, paddle.position.y, paddle.width, paddle.height);
  };

  return {
    draw: draw
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

var Game = (function() {

  const BALL_RADIUS = 10;
  const PADDLE_HEIGHT = 10;
  const PADDLE_WIDTH = 75;

  var newGame = function(canvas) {
    // setup key events event listeners
    document.addEventListener('keydown', Control.keyDownHandler, false);
    document.addEventListener('keyup', Control.keyUpHandler, false);

    return {
      canvas: canvas,
      ball: {
        position: {
          x: canvas.width / 2,
          y: canvas.height - 300
        },
        speed: {
          dx: 0,
          dy: 2
        },
        radius: BALL_RADIUS,
      },
      paddle: {
        height: PADDLE_HEIGHT,
        width: PADDLE_WIDTH,
        position: {
          x: (canvas.width - PADDLE_WIDTH) / 2,
          y: canvas.height - PADDLE_HEIGHT
        }
      },
      status: "IN_PROGRESS"
    };
  };

  var startGame = function(game) {
    var interval = setInterval(function() {
      if (_isBallMoving(game)) {
        _updateGame(game);
      }
      else {
        clearInterval(interval);
      }
    }, 10);
  };

  var _isBallMoving = function(game) {
    return !(game.ball.speed.dx === 0 && game.ball.speed.dy === 0);
  };

  var _updateGame = function(game) {
    Draw.draw(game.canvas, game.ball, game.paddle);
    _updatePaddlePosition(game);
    _updateBallPosition(game);
  };

  var _updatePaddlePosition = function(game) {
    // Update the position of the paddle/bar
    if(Control.isRightPressed()
        && game.paddle.position.x < game.canvas.width - game.paddle.width) {
      game.paddle.position.x += 7;
    }

    else if(Control.isLeftPressed() && game.paddle.position.x > 0) {
      game.paddle.position.x -= 7;
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

  return {
    newGame: newGame,
    startGame: startGame
  };

})();

var GameClient = (function() {

  var startNewGame = function(canvas){
    var game = Game.newGame(canvas);
    Game.startGame(game);
  };

  return {
    startNewGame: startNewGame
  };

})();

var canvas = document.getElementById('myCanvas');
GameClient.startNewGame(canvas);
