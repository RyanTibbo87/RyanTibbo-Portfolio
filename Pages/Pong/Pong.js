// Global Variables
var DIRECTION = {
  IDLE: 0,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
};

var rounds = [5, 5, 3, 3, 2];
var colours = ["#1abc9c", "#1abc9d", "#1abf9c", "#4abc9c", "#1abc6c"];

// The Ball
var Ball = {
  new: function (incrementedSpeed) {
    return {
      width: 18,
      height: 18,
      x: this.canvas.width / 2 - 9,
      y: this.canvas.height / 2 - 9,
      moveX: DIRECTION.IDLE,
      moveY: DIRECTION.IDLE,
      speed: incrementedSpeed || 7,
      borderRadius: 9,
    };
  },
};

// The Paddles
var Paddle = {
  new: function (side) {
    return {
      width: 18,
      height: 180,
      x: side === "left" ? 150 : this.canvas.width - 150,
      y: this.canvas.height / 2 - 35,
      score: 0,
      move: DIRECTION.IDLE,
      speed: 8,
    };
  },
};

var Game = {
  canvas: null,
  context: null,
  player: null,
  ai: null,
  ball: null,
  running: false,
  over: false,
  turn: null,
  timer: 0,
  round: 0,
  color: "#070707",

  initialize: function () {
    this.canvas = document.querySelector("canvas");
    this.context = this.canvas.getContext("2d");

    this.canvas.width = 1400;
    this.canvas.height = 1000;

    this.canvas.style.width = this.canvas.width / 2 + "px";
    this.canvas.style.height = this.canvas.height / 2 + "px";

    this.player = Paddle.new.call(this, "left");
    this.ai = Paddle.new.call(this, "right");
    this.ball = Ball.new.call(this);

    this.player.speed = 5; // Fixed assignment
    this.running = this.over = false;
    this.turn = this.player;
    this.timer = this.round = 0;
    this.color = "#070707";

    this.menu();
    this.listen();
  },

  endGameMenu: function (text) {
    // Change font colors
    this.context.font = "45px Courier New";
    this.context.fillStyle = this.color;

    // Rectangle behind press any key text
    this.context.fillRect(
      this.canvas.width / 2 - 350,
      this.canvas.height / 2 - 48,
      700,
      100
    );

    // Change BKG colors
    this.context.fillStyle = "#ffffff";

    // End Game Menu
    this.context.fillText(
      text,
      this.canvas.width / 2,
      this.canvas.height / 2 + 15
    );

    setTimeout(() => {
      Game.initialize(); // Changed to Game.initialize() to properly reinitialize the game
    }, 3000);
  },

  menu: function () {
    // Draw all objects
    this.draw();

    // Change font color
    this.context.font = "50px Courier New";
    this.context.fillStyle = this.color; // Changed '-' to '='

    // Draw rectangle
    this.context.fillRect(
      this.canvas.width / 2 - 350,
      this.canvas.height / 2 - 48,
      700,
      100
    );

    // Change BKG color
    this.context.fillStyle = "#ffffff";

    // Press any Key
    this.context.fillText(
      "Press any key to begin",
      this.canvas.width / 2,
      this.canvas.height / 2 + 15
    );

    // Update all objects
    this.update();
  },

  update: function () {
    if (!this.over) {
      // Ball collision with boundaries
      if (this.ball.x <= 0) this._resetTurn(this.ai, this.player);
      if (this.ball.x >= this.canvas.width)
        this._resetTurn(this.player, this.ai);
      if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
      if (this.ball.y >= this.canvas.height - this.ball.height)
        this.ball.moveY = DIRECTION.UP;

      // Move player
      if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
      else if (this.player.move === DIRECTION.DOWN)
        this.player.y += this.player.speed;

      // New Serve
      if (this._turnDelayIsOver() && this.turn) {
        this.ball.moveX =
          this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
        this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][
          Math.round(Math.random())
        ];
        this.ball.y =
          Math.floor(Math.random() * (this.canvas.height - 200)) + 200; // Fixed typo in this.canvas.height
        this.turn = null;
      }

      // Player collision
      if (this.player.y <= 0) this.player.y = 0;
      else if (this.player.y >= this.canvas.height - this.player.height)
        this.player.y = this.canvas.height - this.player.height;

      // Move ball
      if (this.ball.moveY === DIRECTION.UP)
        this.ball.y -= this.ball.speed / 1.5;
      else if (this.ball.moveY === DIRECTION.DOWN)
        this.ball.y += this.ball.speed / 1.5;
      if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
      else if (this.ball.moveX === DIRECTION.RIGHT)
        this.ball.x += this.ball.speed;

      // Define AI Paddle with reduced speed
      var Paddle = {
        new: function (side) {
          return {
            width: 18,
            height: 180,
            x: side === "left" ? 150 : this.canvas.width - 150,
            y: this.canvas.height / 2 - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 5, // Reduced AI speed
          };
        },
      };

      // AI Movement Logic with Reduced Accuracy
      var randomFactor = Math.random(); // Introduce randomness to AI movements

      if (this.ai.y > this.ball.y - this.ai.height / 2 + randomFactor) {
        if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 2;
        else this.ai.y -= this.ai.speed / 4;
      }
      if (this.ai.y < this.ball.y - this.ai.height / 2 + randomFactor) {
        if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 2;
        else this.ai.y += this.ai.speed / 4;
      }

      // AI Collision
      if (this.ai.y >= this.canvas.height - this.ai.height)
        this.ai.y = this.canvas.height - this.ai.height;
      else if (this.ai.y <= 0) this.ai.y = 0;

      // Player-Ball Collision
      if (
        this.ball.x - this.ball.width <= this.player.x &&
        this.ball.x >= this.player.x - this.player.width
      ) {
        if (
          this.ball.y <= this.player.y + this.player.height &&
          this.ball.y + this.ball.height >= this.player.y
        ) {
          this.ball.x = this.player.x + this.ball.width;
          this.ball.moveX = DIRECTION.RIGHT;
        }
      }

      // AI-Ball Collision
      if (
        this.ball.x - this.ball.width <= this.ai.x &&
        this.ball.x >= this.ai.x - this.ai.width
      ) {
        if (
          this.ball.y <= this.ai.y + this.ai.height &&
          this.ball.y + this.ball.height >= this.ai.y
        ) {
          this.ball.x = this.ai.x - this.ball.width;
          this.ball.moveX = DIRECTION.LEFT;
        }
      }
    }

    // End of Round
    // Did Player win?
    if (this.player.score === rounds[this.round]) {
      // Any levels left?
      if (!rounds[this.round + 1]) {
        this.over = true;
        setTimeout(() => {
          this.endGameMenu("Winner!");
        }, 1000);
      } else {
        // More rounds
        this.color = this._generateRoundcolor();
        this.player.score = this.ai.score = 0;
        this.player.speed += 0.5;
        this.ai.speed += 1;
        this.ball.speed += 1;
        this.round += 1;
      }
    }
    // Did AI win?
    else if (this.ai.score === rounds[this.round]) {
      this.over = true;
      setTimeout(() => {
        this.endGameMenu("Game Over!");
      }, 1000);
    }

    this.draw(); // Draw objects after updating
  },

  draw: function () {
    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Fill background color
    this.context.fillStyle = this.color;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw paddles
    this.context.fillStyle = "#ffffff";
    this.context.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );
    this.context.fillRect(this.ai.x, this.ai.y, this.ai.width, this.ai.height);

    // Draw Ball
    if (this._turnDelayIsOver.call(this)) {
      this.context.beginPath();
      this.context.arc(
        this.ball.x + this.ball.borderRadius, // X position
        this.ball.y + this.ball.borderRadius, // Y position
        this.ball.borderRadius,
        0,
        2 * Math.PI
      );
      this.context.fillStyle = "#ffffffss";
      this.context.fill();
      this.context.closePath();
    }

    // Draw the net
    this.context.beginPath();
    this.context.setLineDash([7, 15]);
    this.context.moveTo(this.canvas.width / 2, this.canvas.height - 140);
    this.context.lineTo(this.canvas.width / 2, 140);
    this.context.lineWidth = 10;
    this.context.strokeStyle = "#ffffff";
    this.context.stroke();

    // Set default font
    this.context.font = "100px Courier New";
    this.context.textAlign = "center";

    // Draw player score
    this.context.fillText(
      this.player.score.toString(),
      this.canvas.width / 2 - 300,
      200
    );

    // Draw AI score
    this.context.fillText(
      this.ai.score.toString(),
      this.canvas.width / 2 + 300,
      200
    );

    // Change font size for center score text
    this.context.font = "30px Courier New";

    // Draw center score text
    this.context.fillText(
      "Round " + (this.round + 1),
      this.canvas.width / 2,
      35
    );
    this.context.font = "40px Courier";
    this.context.fillText(
      rounds[this.round] ? rounds[this.round] : rounds[this.round - 1],
      this.canvas.width / 2,
      100
    );
  },

  loop: function () {
    this.update();
    this.draw();

    if (!this.over) requestAnimationFrame(this.loop.bind(this));
  },

  listen: function () {
    document.addEventListener("keydown", (key) => {
      if (!this.running) {
        this.running = true;
        requestAnimationFrame(this.loop.bind(this));
      }

      // W Key
      if (key.keyCode === 87 || key.which === 87)
        this.player.move = DIRECTION.UP;

      // S Key
      if (key.keyCode === 83 || key.which === 83)
        this.player.move = DIRECTION.DOWN;
    });

    document.addEventListener("keyup", (key) => {
      this.player.move = DIRECTION.IDLE;
    });
  },

  _resetTurn: function (victor, loser) {
    this.ball = Ball.new.call(this, this.ball.speed);
    this.turn = loser;
    this.timer = new Date().getTime();

    victor.score++;
  },

  _turnDelayIsOver: function () {
    return new Date().getTime() - this.timer >= 1000;
  },

  _generateRoundcolor: function () {
    var newColor = colours[Math.floor(Math.random() * colours.length)];
    if (newColor === this.color) return this._generateRoundcolor();
    return newColor;
  },
};

window.onload = () => {
  Game.initialize();
};
