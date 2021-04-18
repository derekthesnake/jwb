import Phaser from 'phaser';

class PlayScene extends Phaser.Scene {

  constructor() {
    super('PlayScene');
  }

  create() {
    this.isGameRunning = false;
    this.gameSpeed = 10;
    this.respawnTime = 0;
    this.score = 0;
    const { height, width } = this.game.config;

    this.jumpSound = this.sound.add('jump', { volume: 0.2 });
    this.hitSound = this.sound.add('hit', { volume: 0.2 });
    this.reachSound = this.sound.add('reach', { volume: 0.2 });

    this.startTrigger = this.physics.add.sprite(0, 10).setOrigin(0, 1).setImmovable();

    this.ground = this.add.tileSprite(0, height, 88, 26, 'ground').setOrigin(0, 1);
    this.dino = this.physics.add.sprite(0, height, 'dino-idle')
      .setOrigin(0, 1)
      .setBodySize(44, 92)
      .setDepth(1)
      .setCollideWorldBounds(true)
      .setGravityY(5000);

    this.scoreText = this.add
      .text(width, 0, '00000', { fill: '#535353', font: '900 35px Courier', resolution: 5 })
      .setOrigin(1, 0)
      .setAlpha(0);

    this.highscoreText = this.add
      .text(width, 0, '00000', { fill: '#535353', font: '900 35px Courier', resolution: 5 })
      .setOrigin(1, 0)
      .setAlpha(0);

    this.gameOverScreen = this.add.container(width / 2, height / 2 - 50).setAlpha(0);
    this.gameOverText = this.add.image(0, 0, 'game-over');
    this.restart = this.add.image(0, 80, 'restart').setInteractive();

    this.environment = this.add.group();
    this.environment.addMultiple([
      this.add.image(width / 2, 170, 'cloud'),
      this.add.image(width - 88, 80, 'cloud'),
      this.add.image(width / 1.3, 100, 'cloud'),
    ]);

    this.environment.setAlpha(0);

    this.gameOverScreen.add([
      this.gameOverText, this.restart
    ]);

    this.obstacles = this.physics.add.group();


    this.bullets = new Bullets(this);

    this.initAnims();
    this.initColliders();
    this.initStartTrigger();
    this.handleInputs();
    this.handleScore();
  }

  initColliders() {
    this.physics.add.collider(this.dino, this.obstacles, () => {
      this.highscoreText.x = this.scoreText.x - this.scoreText.width - 20;

      const highScore = this.highscoreText.text.substr(this.highscoreText.text.length - 5);
      console.log(`high: ${highScore}`);
      const newScore = Number(this.scoreText.text) > Number(highScore) ? this.scoreText.text : highScore;

      this.highscoreText.setText('HI ' + newScore);
      this.highscoreText.setAlpha(1);

      this.physics.pause();
      this.isGameRunning = false;
      this.anims.pauseAll();
      this.dino.setTexture('dino-hurt');
      this.respawnTime = 0;
      this.gameSpeed = 10;
      this.gameOverScreen.setAlpha(1);
      this.score = 0;
      this.hitSound.play();
    }, null, this);
  }

  initStartTrigger() {
    const { width, height } = this.game.config;

    this.restart.on('pointerdown', () => {
      this.dino.setVelocityY(0);
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;
      this.physics.resume();
      this.obstacles.clear(true, true);
      this.isGameRunning = true;
      this.gameOverScreen.setAlpha(0);
      this.anims.resumeAll();
    });

    this.physics.add.overlap(this.startTrigger, this.dino, () => {
      if (this.startTrigger.y === 10) {
        this.startTrigger.body.reset(0, height);
        return;
      }
      this.startTrigger.disableBody(true, true);

      const startEvent = this.time.addEvent({
        delay: 1000 / 60,
        loop: true,
        callbackScope: this,
        callback: () => {
          this.dino.setVelocityX(80);
          this.dino.play('dino-run', 1);
          if (this.ground.width < width) {
            this.ground.width += 17 * 2;
          }
          if (this.ground.width >= width) {
            this.ground.width = width;
            this.isGameRunning = true;
            this.dino.setVelocity(0);
            this.scoreText.setAlpha(1);
            this.environment.setAlpha(1);
            startEvent.remove();
          }
        }
      })
    }, null, this);

    this.physics.add.overlap(this.bullets, this.obstacles, (bullet, obstacle) => {
      bullet.setActive(false);
      bullet.setVisible(false);
      obstacle.destroy();
    }, null, this);
  }
  handleScore() {
    this.time.addEvent({
      delay: 1000 / 10,
      loop: true,
      callbackScope: this,
      callback: () => {
        if (!this.isGameRunning) { return; }
        this.score++;
        this.gameSpeed += 0.01;

        if (this.score % 100 === 0) {
          this.reachSound.play();

          this.tweens.add({
            targets: this.scoreText,
            duration: 100,
            repeat: 3,
            alpha: 0,
            yoyo: true,
          })
        }
        const scoreText = this.score.toString().padStart(5, '0');
        this.scoreText.setText(scoreText);
      }
    })
  }
  handleInputs() {
    this.input.keyboard.on('keydown_SPACE', () => {
      if (!this.dino.body.onFloor() || this.dino.body.velocity.x > 0) { return; }
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;
      this.jumpSound.play();
      this.dino.setVelocityY(-1600);
      this.dino.setTexture('dino', 0);
    });

    this.input.keyboard.on('keydown_DOWN', () => {
      if (!this.dino.body.onFloor() || !this.isGameRunning) { return; }
      this.dino.body.height = 58;
      this.dino.body.offset.y = 34;
    });
    this.input.keyboard.on('keyup_DOWN', () => {
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;
    });

    this.input.keyboard.on('keydown_' + 'F', (event) => {
      console.log("FIRE!");
      this.bullets.fireBullet(this.dino.body.x, this.dino.body.y + 30);
    });
  }

  initAnims() {
    this.anims.create({
      key: 'dino-run',
      frames: this.anims.generateFrameNumbers('dino', { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'dino-down-anim',
      frames: this.anims.generateFrameNumbers('dino-down', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'enemy-bird-fly',
      frames: this.anims.generateFrameNumbers('enemy-bird', { start: 0, end: 1 }),
      frameRate: 6,
      repeat: -1,
    });
  }

  placeObstacle() {
    const { width, height } = this.game.config;
    const obstacleNum = Math.floor(Math.random() * 7) + 1;
    const distance = Phaser.Math.Between(600, 900);

    let obstacle;
    if (obstacleNum > 6) {
      const enemyHeight = [22, 50];
      obstacle = this.obstacles
        .create(width + distance, height - enemyHeight[Math.floor(Math.random() * 2)], 'enemy-bird');
      obstacle.play('enemy-bird-fly', 1);
      obstacle.body.height = obstacle.body.height / 1.5;
    } else {
      obstacle = this.obstacles.create(width + distance, height, `obsticle-${obstacleNum}`);
      obstacle.body.offset.y = 10;
    }

    obstacle
      .setOrigin(0, 1)
      .setImmovable();
  }

  // 60 fps
  update(time, delta) {
    if (!this.isGameRunning) { return; }
    this.ground.tilePositionX += this.gameSpeed;
    Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);
    Phaser.Actions.IncX(this.environment.getChildren(), -0.5);
    this.respawnTime += delta * this.gameSpeed * 0.08;

    if (this.respawnTime >= 1500) {
      this.placeObstacle();
      this.respawnTime = 0;
    }

    this.obstacles.getChildren().forEach(obstacle => {
      if (obstacle.getBounds().right < 0) {
        console.log('destroying');
        obstacle.destroy();
      }
    })

    this.environment.getChildren().forEach(env => {
      if (env.getBounds().right < 0) {
        console.log('reset clouds');
        env.x = this.game.config.width + 20;
      }
    });

    if (this.dino.body.deltaAbsY() > 0) {
      this.dino.anims.stop();
      this.dino.setTexture('dino');
    } else {

      this.dino.body.height <= 58 ?
        this.dino.play('dino-down-anim', true) :
        this.dino.play('dino-run', true);
    }
  }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');
  }

  fire(x, y) {
    this.body.reset(x, y);
    this.angle = 90;
    this.setActive(true);
    this.setVisible(true);

    this.setVelocityX(1000);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.x >= this.scene.game.config.width) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

class Bullets extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);

    this.createMultiple({
      frameQuantity: 5,
      key: 'bullet',
      active: false,
      visible: false,
      classType: Bullet
    });
  }

  fireBullet(x, y) {
    let bullet = this.getFirstDead(false);

    if (bullet) {
      bullet.fire(x, y);
    }
  }
}



export default PlayScene;
