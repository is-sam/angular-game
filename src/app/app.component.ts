import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  // CONSTANTS
  readonly MAP_WIDTH = 17;
  readonly MAP_HEIGHT = 13;
  readonly MAX_ENEMIES = 5;
  readonly ENEMY_GEN_FREQ = 1000;
  readonly ENEMY_MOV_FREQ = 300;
  readonly MAP = {
    GRASS: 0,
    STONE: 1,
    BRICK: 2,
    PLAYER: 3,
    BOMB: 4,
    ENEMY: 5,
    DEAD: 6,
    GIFT: 7,
    MEGABOMB: 8
  }

  // VARIABLES
  mute: boolean = false;
  map: Array<Array<number>> = [];
  bombPlaced: boolean = false;
  playerPos = {
    x: 5,
    y: 7
  }
  playerDead: boolean = false;
  enemies: Array<any> = [];
  enemyKilled: number = 0;
  megaBomb: boolean = false;

  // AUDIO
  audio = new Audio('../assets/audio/soundtrack.ogg');
  deathSound = new Audio('../assets/audio/death.wav');
  explosionSound = new Audio('../assets/audio/explosion.ogg');
  roarSound = new Audio('../assets/audio/roar.wav');
  zombieDeathSound = new Audio('../assets/audio/zombie_death.wav');

  ngOnInit() {
    this.init();
  }

  ngAfterViewInit() {
    this.audio.play();
  }

  init() {
    for (let i = 0; i < this.MAP_HEIGHT; i++) {
      this.map.push([]);
      for (let j = 0; j < this.MAP_WIDTH; j++) {
        if (i == 0 || j == 0 || i == this.MAP_HEIGHT - 1 || j == this.MAP_WIDTH - 1 || (i % 2 === 0 && j % 2 === 0)) {
          this.map[i].push(this.MAP.STONE);
        } else {
          this.map[i].push(this.MAP.GRASS);
        }
      }
    }
    // brick
    this.map[5][9] = this.MAP.BRICK;
    this.map[5][8] = this.MAP.BRICK;
    this.map[6][9] = this.MAP.BRICK;
    this.map[7][9] = this.MAP.BRICK;
    // bomb
    // this.map[1][1] = this.MAP.BOMB;
    // enemy
    // this.map[1][1] = this.MAP.ENEMY;
    this.enemyAI();
    this.spawnBonus();
  }

  spawnBonus() {
    const timer = Math.floor(Math.random() * 20) + 5;
    setTimeout(() => {
      let spawnX: any, spawnY: any;
      do {
        spawnX = Math.floor(Math.random() * (this.MAP_HEIGHT - 1));
        spawnY = Math.floor(Math.random() * (this.MAP_WIDTH - 1));
      } while(!this.canGoTo(spawnX, spawnY));
      this.map[spawnX][spawnY] = this.MAP.GIFT;
      setTimeout(() => {
        this.map[spawnX][spawnY] = this.MAP.GRASS;
      }, 5000);
      this.spawnBonus();
    }, timer * 1000);
  }

  enemyAI() {
    this.enemySpawnAI();
    this.enemyMovementAI();
  }

  enemySpawnAI() {
    const generateEnemyInterval = setInterval(() => {
      let spawnX, spawnY;
      do {
        spawnY = Math.floor(Math.random() * (this.MAP_WIDTH - 1));
        spawnX = Math.floor(Math.random() * (this.MAP_HEIGHT - 1));
      } while(!this.canGoTo(spawnX, spawnY));
      this.enemies.push({x: spawnX, y: spawnY});
      if (this.enemies.length === this.MAX_ENEMIES) {
        clearInterval(generateEnemyInterval);
      }
    }, this.ENEMY_GEN_FREQ);
  }

  enemyMovementAI() {
    const enemyMoveInterval = setInterval(() => {
      for (let enemy of this.enemies) {
        let offsetX = 0, offsetY = 0;
        const direction = Math.floor(Math.random() * 4);
        switch(direction) {
          case 0:
            offsetX = 0;
            offsetY = 1;
            break;
          case 1:
            offsetX = -1;
            offsetY = 0;
            break;
          case 2:
            offsetX = 0;
            offsetY = -1;
            break;
          case 3:
            offsetX = 1;
            offsetY = 0;
            break;
        }
        if (this.canGoTo(enemy.x + offsetX, enemy.y + offsetY)) {
          enemy.x += offsetX;
          enemy.y += offsetY;
        }
        if (this.isEnemyOnPlayer(enemy)) {
          this.killPlayer();
        }
        if (Math.floor(Math.random() * 100) === 0) {
          if (!this.mute) {
            this.roarSound.play();
          }
        }
      }
    }, this.ENEMY_MOV_FREQ);
  }

  isPlayerPos(x: number, y: number) {
    return x === this.playerPos.x && y === this.playerPos.y
  }

  isEnemyPos(x: number, y: number) {
    // TODO: improve
    for (let enemy of this.enemies) {
      if (x === enemy.x && y === enemy.y) {
        return true;
      }
    }
    return false;
  }

  isEnemyOnPlayer(enemy: any) {
    return this.playerPos.x == enemy.x && this.playerPos.y == enemy.y;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.playerDead) {
      return;
    }
    if (event.key === "ArrowDown") {
      this.goDown();
    }

    if (event.key === "ArrowUp") {
      this.goUp();
    }

    if (event.key === "ArrowLeft") {
      this.goLeft();
    }

    if (event.key === "ArrowRight") {
      this.goRight();
    }

    if (event.code === "Space") {
      this.placeBomb();
    }
  }

  goUp() {
    if (this.canGoTo(this.playerPos.x - 1, this.playerPos.y)) {
      this.playerPos.x -= 1;
      this.checkBonus();
    }
  }

  goDown() {
    if (this.canGoTo(this.playerPos.x + 1, this.playerPos.y)) {
      this.playerPos.x += 1;
      this.checkBonus();
    }
  }

  goLeft() {
    if (this.canGoTo(this.playerPos.x, this.playerPos.y - 1)) {
      this.playerPos.y -= 1;
      this.checkBonus();
    }
  }

  goRight() {
    if (this.canGoTo(this.playerPos.x, this.playerPos.y + 1)) {
      this.playerPos.y += 1;
      this.checkBonus();
    }
  }

  checkBonus() {
    if (this.map[this.playerPos.x][this.playerPos.y] == this.MAP.GIFT) {
      this.megaBomb = true;
      this.map[this.playerPos.x][this.playerPos.y] = this.MAP.GRASS;
    }
  }

  canGoTo(x: number, y: number) {
    return this.map[x][y] === this.MAP.GRASS || this.map[x][y] === this.MAP.GIFT;
  }

  isSoft(x: number, y: number) {
    return this.map[x][y] === this.MAP.BRICK;
  }

  placeBomb() {
    // TODO: placer plusieurs bombes
    if (this.bombPlaced) {
      return;
    }
    this.bombPlaced = true;
    const posX = this.playerPos.x;
    const posY = this.playerPos.y;
    this.map[posX][posY] = this.megaBomb ? this.MAP.MEGABOMB : this.MAP.BOMB;
    setTimeout(() => {
      if (!this.mute) {
        this.explosionSound.play();
      }
      this.explodeWalls(posX, posY);
      this.killPlayers(posX, posY);
    }, 1000);

    setTimeout(() => {
      this.map[posX][posY] = this.MAP.GRASS;
      this.bombPlaced = false;
    }, 1500);
  }

  explodeWalls(posX: number, posY: number) {
    if (this.isSoft(posX - 1, posY)) {
      this.map[posX - 1][posY] = this.MAP.GRASS;
    }
    if (this.isSoft(posX, posY - 1)) {
      this.map[posX][posY - 1] = this.MAP.GRASS;
    }
    if (this.isSoft(posX + 1, posY)) {
      this.map[posX + 1][posY] = this.MAP.GRASS;
    }
    if (this.isSoft(posX, posY + 1)) {
      this.map[posX][posY + 1] = this.MAP.GRASS;
    }
  }

  killPlayers(posX: number, posY: number) {
    if (
      this.isPlayerPos(posX, posY)
      || this.isPlayerPos(posX - 1, posY)
      || this.isPlayerPos(posX, posY - 1)
      || this.isPlayerPos(posX + 1, posY)
      || this.isPlayerPos(posX, posY + 1)
    ) {
      this.killPlayer();
    }

    this.isEnemyPos(posX, posY) && this.killEnemy({x: posY, y: posY});
    this.isEnemyPos(posX - 1, posY) && this.killEnemy({x: posX - 1, y: posY});
    this.isEnemyPos(posX, posY - 1) && this.killEnemy({x: posX, y: posY - 1});
    this.isEnemyPos(posX + 1, posY) && this.killEnemy({x: posX + 1, y: posY});
    this.isEnemyPos(posX, posY + 1) && this.killEnemy({x: posX, y: posY + 1});
  }

  killPlayer() {
    // clearInterval(this.interval);
    this.map[this.playerPos.x][this.playerPos.y] = this.MAP.DEAD;
    this.playerDead = true;
    this.playerPos = {
      x: -1,
      y: -1
    }
    if (!this.mute) {
      this.deathSound.play();
    }
  }

  killEnemy(enemy: any) {
    // clearInterval(this.interval);
    this.map[enemy.x][enemy.y] = this.MAP.GRASS;
    this.enemies = this.enemies.filter(e => !(enemy.x === e.x && enemy.y === e.y));
    this.enemyKilled++;
    // clearInterval(this.interval);
    if (!this.mute) {
      this.zombieDeathSound.play();
    }
  }

  muteAudio() {
    this.mute = !this.mute;
    this.audio.muted = !this.audio.muted;
  }
}
