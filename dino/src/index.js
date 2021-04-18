
import Phaser from 'phaser';

import PlayScene from './PlayScene';
import PreloadScene from './PreloadScene';
import queue from './asl';
import css from "../static/style.css";

const config = {
  type: Phaser.CANVAS,
  width: 1000,
  height: 340,
  pixelArt: true,
  transparent: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  },
  scene: [PreloadScene, PlayScene],
  canvas: document.getElementById("phaser-canvas"),
};
new Phaser.Game(config);


