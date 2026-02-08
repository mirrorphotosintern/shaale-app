// Self-contained HTML for the Phaser game, loaded via WebView source={{ html }}
// Phaser and all sprites loaded from Supabase Storage URLs.
// Rewritten to use remote assets instead of base64 data URIs.

export const GAME_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #1a1a2e; touch-action: none; }
canvas { display: block; image-rendering: pixelated; image-rendering: crisp-edges; }
</style>
</head>
<body>
<script src="https://ufmwnqllgqrfkdfahptv.supabase.co/storage/v1/object/public/game-assets/lib/phaser.min.js"><\/script>
<script>
// ============================================================
// Bridge: React Native Communication
// ============================================================
window.gameInput = function(data) {
  if (window.gameScene) {
    window.gameScene.handleInput(data);
  }
};

function sendToRN(type, payload) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
  } else {
    console.log('[sendToRN]', type, payload);
  }
}

// ============================================================
// Sprite URLs (Supabase Storage)
// ============================================================
var ASSET_BASE = 'https://ufmwnqllgqrfkdfahptv.supabase.co/storage/v1/object/public/game-assets/';
var SPRITES = {
  playerWalkDown:  ASSET_BASE + 'sprites/characters/player-walk-down.png',
  playerWalkUp:    ASSET_BASE + 'sprites/characters/player-walk-up.png',
  playerWalkSide:  ASSET_BASE + 'sprites/characters/player-walk-side.png',
  playerIdleDown:  ASSET_BASE + 'sprites/characters/player-idle-down.png',
  playerIdleUp:    ASSET_BASE + 'sprites/characters/player-idle-up.png',
  playerIdleSide:  ASSET_BASE + 'sprites/characters/player-idle-side.png',
  knightIdle:      ASSET_BASE + 'sprites/npcs/knight-idle.png',
  wizardIdle:      ASSET_BASE + 'sprites/npcs/wizard-idle.png',
  rogueIdle:       ASSET_BASE + 'sprites/npcs/rogue-idle.png',
  orcIdle:         ASSET_BASE + 'sprites/mobs/orc-idle.png'
};

// ============================================================
// CharSelectScene
// ============================================================
class CharSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'CharSelectScene' }); }

  preload() {
    this.load.spritesheet('player-idle-down', SPRITES.playerIdleDown, { frameWidth: 64, frameHeight: 64 });

    // Loading bar for CharSelect
    var w = this.cameras.main.width;
    var h = this.cameras.main.height;
    var bar = this.add.graphics();
    var box = this.add.graphics();
    box.fillStyle(0x222222, 0.8);
    box.fillRect(w/4, h/2 - 15, w/2, 30);
    this.load.on('progress', function(v) {
      bar.clear(); bar.fillStyle(0x8B5CF6, 1);
      bar.fillRect(w/4+5, h/2-10, (w/2-10)*v, 20);
    });
    this.load.on('complete', function() { bar.destroy(); box.destroy(); });
  }

  create() {
    var w = this.cameras.main.width;
    var h = this.cameras.main.height;
    var cx = w / 2;

    // Dark purple background
    var bg = this.add.graphics();
    bg.fillStyle(0x1a0a2e, 1);
    bg.fillRect(0, 0, w, h);
    bg.fillStyle(0x2d1b69, 0.3);
    bg.fillCircle(cx, h * 0.5, 220);
    bg.fillStyle(0x3d2b79, 0.2);
    bg.fillCircle(cx, h * 0.5, 280);

    // Stars
    for (var s = 0; s < 40; s++) {
      var sx = Math.random() * w;
      var sy = Math.random() * h * 0.4;
      var sr = 1 + Math.random() * 1.5;
      bg.fillStyle(0xffffff, 0.3 + Math.random() * 0.5);
      bg.fillCircle(sx, sy, sr);
    }

    // Title
    var titleKn = this.add.text(cx, 60, '\\u0CB6\\u0CBE\\u0CB2\\u0CC6 \\u0C95\\u0CCD\\u0CB5\\u0CC6\\u0CB8\\u0CCD\\u0C9F\\u0CCD', {
      fontSize: '28px', color: '#FFD700', fontFamily: 'sans-serif',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(cx, 92, 'Shaale Quest', {
      fontSize: '16px', color: '#c9b3ff', fontFamily: 'sans-serif'
    }).setOrigin(0.5);

    this.add.text(cx, 130, '\\u0CA8\\u0CBF\\u0CAE\\u0CCD\\u0CAE \\u0CAA\\u0CBE\\u0CA4\\u0CCD\\u0CB0\\u0CB5\\u0CA8\\u0CCD\\u0CA8\\u0CC1 \\u0C86\\u0CAF\\u0CCD\\u0C95\\u0CC6\\u0CAE\\u0CBE\\u0CA1\\u0CBF', {
      fontSize: '12px', color: '#9988cc', fontFamily: 'sans-serif'
    }).setOrigin(0.5);
    this.add.text(cx, 148, 'Choose Your Character', {
      fontSize: '11px', color: '#8877bb', fontFamily: 'sans-serif'
    }).setOrigin(0.5);

    if (!this.anims.exists('preview-idle')) {
      this.anims.create({
        key: 'preview-idle',
        frames: this.anims.generateFrameNumbers('player-idle-down', { start: 0, end: 3 }),
        frameRate: 4, repeat: -1
      });
    }

    var panelY = h * 0.45;
    var panelW = 160;
    var panelH = 220;

    this.createCharPanel(cx - 90, panelY, panelW, panelH, 'gunda', '\\u0C97\\u0CC1\\u0C82\\u0CA1', 'Gunda', 0x4F46E5, false);
    this.createCharPanel(cx + 90, panelY, panelW, panelH, 'maaya', '\\u0CAE\\u0CBE\\u0CAF\\u0CBE', 'Maaya', 0xEC4899, true);

    this.tweens.add({
      targets: titleKn,
      scaleX: 1.03, scaleY: 1.03,
      yoyo: true, repeat: -1, duration: 1500,
      ease: 'Sine.easeInOut'
    });

    sendToRN('SCENE_READY', { scene: 'CharSelect' });
  }

  createCharPanel(x, y, w, h, charId, nameKn, nameEn, accentColor, flipX) {
    var self = this;

    var glow = this.add.graphics();
    glow.fillStyle(accentColor, 0.15);
    glow.fillRoundedRect(x - w/2 - 6, y - h/2 - 6, w + 12, h + 12, 16);

    // Animate glow pulse
    this.tweens.add({
      targets: glow, alpha: 0.5,
      yoyo: true, repeat: -1, duration: 1800,
      ease: 'Sine.easeInOut'
    });

    var panelBg = this.add.graphics();
    panelBg.fillStyle(0x1e1040, 0.9);
    panelBg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
    panelBg.lineStyle(2, accentColor, 0.7);
    panelBg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);

    var sprite = this.add.sprite(x, y - 20, 'player-idle-down');
    sprite.play('preview-idle');
    sprite.setScale(2);
    sprite.setFlipX(flipX);
    if (flipX) sprite.setTint(0xffccdd);

    this.add.text(x, y + 55, nameKn, {
      fontSize: '16px', color: '#FFD700', fontFamily: 'sans-serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(x, y + 75, '(' + nameEn + ')', {
      fontSize: '12px', color: '#aaa', fontFamily: 'sans-serif'
    }).setOrigin(0.5);

    var hitbox = this.add.rectangle(x, y, w, h).setInteractive({ useHandCursor: true });
    hitbox.setAlpha(0.001);

    var selectBorder = this.add.graphics();
    selectBorder.setAlpha(0);

    hitbox.on('pointerover', function() {
      selectBorder.clear();
      selectBorder.lineStyle(3, 0xFFD700, 1);
      selectBorder.strokeRoundedRect(x - w/2 - 2, y - h/2 - 2, w + 4, h + 4, 13);
      self.tweens.add({ targets: selectBorder, alpha: 1, duration: 200 });
      self.tweens.add({ targets: sprite, scaleX: 2.2, scaleY: 2.2, duration: 200 });
    });

    hitbox.on('pointerout', function() {
      self.tweens.add({ targets: selectBorder, alpha: 0, duration: 200 });
      self.tweens.add({ targets: sprite, scaleX: 2, scaleY: 2, duration: 200 });
    });

    hitbox.on('pointerdown', function() {
      var flash = self.add.graphics();
      flash.fillStyle(0xffffff, 0.5);
      flash.fillRect(0, 0, self.cameras.main.width, self.cameras.main.height);
      flash.setDepth(100);

      sendToRN('CHARACTER_SELECTED', { character: charId });
      window.selectedCharacter = charId;

      self.tweens.add({
        targets: flash, alpha: 0, duration: 400,
        onComplete: function() {
          flash.destroy();
          self.scene.start('HouseScene');
        }
      });
    });

    this.tweens.add({
      targets: sprite, y: sprite.y - 4,
      yoyo: true, repeat: -1, duration: 1200,
      ease: 'Sine.easeInOut'
    });
  }
}

// ============================================================
// HouseScene - Indoor cozy Indian home
// ============================================================
class HouseScene extends Phaser.Scene {
  constructor() { super({ key: 'HouseScene' }); }

  preload() {
    this.load.spritesheet('player-walk-down', SPRITES.playerWalkDown, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('player-walk-up', SPRITES.playerWalkUp, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('player-walk-side', SPRITES.playerWalkSide, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('player-idle-down', SPRITES.playerIdleDown, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('player-idle-up', SPRITES.playerIdleUp, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('player-idle-side', SPRITES.playerIdleSide, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('knight-idle', SPRITES.knightIdle, { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('wizard-idle', SPRITES.wizardIdle, { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('rogue-idle', SPRITES.rogueIdle, { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('orc-idle', SPRITES.orcIdle, { frameWidth: 32, frameHeight: 32 });

    var w = this.cameras.main.width;
    var h = this.cameras.main.height;
    var bar = this.add.graphics();
    var box = this.add.graphics();
    box.fillStyle(0x222222, 0.8);
    box.fillRect(w/4, h/2 - 15, w/2, 30);
    this.load.on('progress', function(v) {
      bar.clear(); bar.fillStyle(0x8B5CF6, 1);
      bar.fillRect(w/4+5, h/2-10, (w/2-10)*v, 20);
    });
    this.load.on('complete', function() { bar.destroy(); box.destroy(); });
    sendToRN('LOADING', { progress: 0 });
  }

  create() {
    window.gameScene = this;
    this.moveDir = { x: 0, y: 0 };
    this.playerSpeed = 90;
    this.canInteract = true;
    this.npcs = [];
    this.currentFacing = 'down';

    var TILE = 16;
    var MAP_COLS = 20;
    var MAP_ROWS = 15;
    var MAP_W = MAP_COLS * TILE;
    var MAP_H = MAP_ROWS * TILE;

    this.createAnimations();

    var g = this.add.graphics();

    // === Wooden floor ===
    for (var fy = 0; fy < MAP_ROWS; fy++) {
      for (var fx = 0; fx < MAP_COLS; fx++) {
        var shade = ((fx + fy) % 2 === 0) ? 0xC4A265 : 0xB89555;
        if ((fx * 3 + fy * 7) % 5 === 0) shade = 0xD4B275;
        if ((fx * 11 + fy * 3) % 7 === 0) shade = 0xBE9E58;
        g.fillStyle(shade, 1);
        g.fillRect(fx * TILE, fy * TILE, TILE, TILE);
        // Wood grain lines
        g.lineStyle(1, 0x9E8245, 0.15);
        g.lineBetween(fx * TILE, fy * TILE + 4, fx * TILE + TILE, fy * TILE + 4);
        g.lineBetween(fx * TILE, fy * TILE + 10, fx * TILE + TILE, fy * TILE + 10);
      }
    }

    // === Top wall (thick, brick pattern) ===
    for (var wx = 0; wx < MAP_COLS; wx++) {
      g.fillStyle(0x6B4226, 1);
      g.fillRect(wx * TILE, 0, TILE, TILE * 2);
      // Brick pattern
      g.lineStyle(1, 0x5a3520, 0.5);
      g.strokeRect(wx * TILE, 0, TILE, TILE);
      g.strokeRect(wx * TILE + (wx % 2 === 0 ? 0 : TILE/2), TILE, TILE, TILE);
    }
    // Wall trim
    g.fillStyle(0x8B6914, 1);
    g.fillRect(0, TILE * 2 - 2, MAP_W, 4);

    // === Left wall ===
    for (var ly = 0; ly < MAP_ROWS; ly++) {
      g.fillStyle(0x6B4226, 1);
      g.fillRect(0, ly * TILE, TILE, TILE);
      g.lineStyle(1, 0x5a3520, 0.3);
      g.strokeRect(0, ly * TILE, TILE, TILE);
    }

    // === Right wall ===
    for (var ry = 0; ry < MAP_ROWS; ry++) {
      g.fillStyle(0x6B4226, 1);
      g.fillRect((MAP_COLS-1) * TILE, ry * TILE, TILE, TILE);
      g.lineStyle(1, 0x5a3520, 0.3);
      g.strokeRect((MAP_COLS-1) * TILE, ry * TILE, TILE, TILE);
    }

    // === Bottom wall with door gap ===
    var doorCol = Math.floor(MAP_COLS / 2);
    for (var bx = 0; bx < MAP_COLS; bx++) {
      if (bx === doorCol - 1 || bx === doorCol) continue;
      g.fillStyle(0x6B4226, 1);
      g.fillRect(bx * TILE, (MAP_ROWS-1) * TILE, TILE, TILE);
      g.lineStyle(1, 0x5a3520, 0.3);
      g.strokeRect(bx * TILE, (MAP_ROWS-1) * TILE, TILE, TILE);
    }

    // Door frame
    var doorX = (doorCol - 1) * TILE;
    var doorY = (MAP_ROWS - 1) * TILE;
    g.fillStyle(0x8B4513, 1);
    g.fillRect(doorX - 3, doorY - 4, 3, TILE + 4);
    g.fillRect(doorX + TILE * 2, doorY - 4, 3, TILE + 4);
    g.fillStyle(0xA0522D, 1);
    g.fillRect(doorX - 3, doorY - 7, TILE * 2 + 6, 5);
    // Door mat (colorful rangoli mat)
    g.fillStyle(0xCC3333, 0.6);
    g.fillRect(doorX + 2, doorY + 2, TILE * 2 - 4, TILE - 4);
    g.fillStyle(0xFFD700, 0.5);
    g.fillRect(doorX + 6, doorY + 4, TILE * 2 - 12, TILE - 8);

    // Arrow hint at door
    this.add.text(doorX + TILE, doorY + TILE + 2, '\\u25BC', {
      fontSize: '8px', color: '#FFD700', fontFamily: 'sans-serif'
    }).setOrigin(0.5).setDepth(2);

    // === Kitchen area (top-left) ===
    // Counter
    g.fillStyle(0x8B7355, 1);
    g.fillRect(TILE * 1, TILE * 2, TILE * 5, TILE * 1.5);
    // Counter top (dark stone)
    g.fillStyle(0x555555, 1);
    g.fillRect(TILE * 1, TILE * 2, TILE * 5, 3);
    // Stove
    g.fillStyle(0x444444, 1);
    g.fillRect(TILE * 2 - 4, TILE * 2.2, 12, 12);
    g.lineStyle(1, 0x666666, 1);
    g.strokeCircle(TILE * 2.2, TILE * 2.6, 4);
    g.strokeCircle(TILE * 4, TILE * 2.6, 4);
    // Flame
    g.fillStyle(0xFF6600, 0.8);
    g.fillCircle(TILE * 2.2, TILE * 2.6, 2);
    g.fillStyle(0xFFAA00, 0.6);
    g.fillCircle(TILE * 2.2, TILE * 2.4, 1.5);
    // Pot on stove
    g.fillStyle(0xB87333, 1);
    g.fillCircle(TILE * 4, TILE * 2.6, 3.5);
    g.fillStyle(0x995522, 1);
    g.fillCircle(TILE * 4, TILE * 2.4, 2);
    // Shelf above
    g.fillStyle(0x8B6914, 1);
    g.fillRect(TILE * 1, TILE * 0.8, TILE * 5, 3);
    // Vessels on shelf
    g.fillStyle(0xB87333, 1);
    g.fillRoundedRect(TILE * 1.3, TILE * 0.2, 6, 10, 2);
    g.fillStyle(0xC0C0C0, 1);
    g.fillRoundedRect(TILE * 2.5, TILE * 0.3, 5, 8, 2);
    g.fillStyle(0xDAA520, 1);
    g.fillRoundedRect(TILE * 3.7, TILE * 0.2, 7, 10, 2);
    g.fillStyle(0xFF6347, 1);
    g.fillCircle(TILE * 5, TILE * 0.6, 3);
    // Cutting board
    g.fillStyle(0xDEB887, 1);
    g.fillRect(TILE * 1.5, TILE * 3.8, 12, 8);
    g.fillStyle(0x228B22, 1);
    g.fillCircle(TILE * 2, TILE * 4, 2);
    g.fillCircle(TILE * 2.5, TILE * 4.2, 2);

    // === Central dining table ===
    g.fillStyle(0x8B6914, 1);
    g.fillRect(TILE * 8 - 2, TILE * 6 - 2, TILE * 4 + 4, TILE * 3 + 4);
    g.fillStyle(0xA0824A, 1);
    g.fillRect(TILE * 8, TILE * 6, TILE * 4, TILE * 3);
    // Table cloth pattern
    g.fillStyle(0xCC3333, 0.15);
    g.fillRect(TILE * 8 + 2, TILE * 6 + 2, TILE * 4 - 4, 2);
    g.fillRect(TILE * 8 + 2, TILE * 8.5, TILE * 4 - 4, 2);
    // Items on table
    g.fillStyle(0xFFFFFF, 0.8);
    g.fillCircle(TILE * 9, TILE * 7, 5);
    g.fillStyle(0xFF6347, 0.7);
    g.fillCircle(TILE * 9, TILE * 7, 3);
    g.fillStyle(0xF5DEB3, 0.9);
    g.fillCircle(TILE * 10.5, TILE * 7.5, 4);
    g.fillStyle(0x4682B4, 0.8);
    g.fillRect(TILE * 11, TILE * 6.5, 4, 7);

    // === Pooja corner (top-right) ===
    // Raised platform
    g.fillStyle(0xDAA520, 0.4);
    g.fillRect(TILE * 15, TILE * 2, TILE * 3.5, TILE * 3.5);
    g.lineStyle(1, 0xDAA520, 0.6);
    g.strokeRect(TILE * 15, TILE * 2, TILE * 3.5, TILE * 3.5);
    // Mandala pattern
    g.fillStyle(0xFFD700, 0.3);
    g.fillCircle(TILE * 16.75, TILE * 3.75, 12);
    g.fillStyle(0xFF8C00, 0.3);
    g.fillCircle(TILE * 16.75, TILE * 3.75, 8);
    // Deepa (lamp)
    g.fillStyle(0xDAA520, 1);
    g.fillRect(TILE * 16.5, TILE * 2.8, 4, 6);
    g.fillStyle(0xFF8C00, 1);
    g.fillCircle(TILE * 16.7, TILE * 2.6, 3);
    g.fillStyle(0xFFFF00, 0.9);
    g.fillCircle(TILE * 16.7, TILE * 2.3, 2);
    // Idol
    g.fillStyle(0xB8860B, 1);
    g.fillRect(TILE * 15.8, TILE * 3.2, 6, 10);
    g.fillCircle(TILE * 15.8 + 3, TILE * 3, 3);
    // Flowers
    g.fillStyle(0xFF1493, 0.9);
    g.fillCircle(TILE * 15.3, TILE * 4.5, 2.5);
    g.fillCircle(TILE * 17.5, TILE * 4.5, 2.5);
    g.fillStyle(0xFFA500, 0.9);
    g.fillCircle(TILE * 16, TILE * 5, 2);
    g.fillCircle(TILE * 17, TILE * 5, 2);
    // Agarbatti smoke
    g.fillStyle(0xaaaaaa, 0.2);
    g.fillCircle(TILE * 18, TILE * 2.5, 3);
    g.fillCircle(TILE * 18.2, TILE * 2, 2);

    // === Sleeping area (right side) ===
    // Green mat/chatai
    g.fillStyle(0x228B22, 0.35);
    g.fillRect(TILE * 15, TILE * 7, TILE * 3.5, TILE * 5.5);
    // Mat pattern (woven look)
    g.lineStyle(1, 0x32CD32, 0.2);
    for (var mi = 0; mi < 8; mi++) {
      g.lineBetween(TILE * 15, TILE * 7 + mi * 11, TILE * 18.5, TILE * 7 + mi * 11);
    }
    // Pillow
    g.fillStyle(0xE0E0E0, 0.8);
    g.fillRoundedRect(TILE * 15.5, TILE * 7.2, TILE * 2.5, TILE * 0.8, 4);
    g.fillStyle(0xCC3333, 0.3);
    g.fillRoundedRect(TILE * 15.8, TILE * 7.3, TILE * 2, TILE * 0.5, 3);
    // Blanket fold
    g.fillStyle(0x4169E1, 0.3);
    g.fillRect(TILE * 15.2, TILE * 10, TILE * 3, TILE * 2);

    // === Kolam at entrance ===
    g.fillStyle(0xffffff, 0.45);
    var kolX = doorX + TILE;
    var kolY = doorY - TILE * 1.5;
    for (var ki = 0; ki < 5; ki++) {
      for (var kj = 0; kj < 5; kj++) {
        if ((ki + kj) % 2 === 0) g.fillCircle(kolX - 12 + ki * 6, kolY + kj * 6, 1.5);
      }
    }

    // === Play area (bottom-right) ===
    g.fillStyle(0xFF4444, 1);
    g.fillCircle(TILE * 14, TILE * 12, 4);
    g.fillStyle(0xFFFF00, 0.8);
    g.fillCircle(TILE * 14 + 2, TILE * 12 - 1, 1.5);
    g.fillStyle(0x4444FF, 1);
    g.fillRect(TILE * 13, TILE * 13, 5, 5);
    g.fillStyle(0x00CC00, 1);
    g.fillRect(TILE * 12, TILE * 12.5, 4, 4);

    // === Windows ===
    // Left window
    g.fillStyle(0x87CEEB, 0.6);
    g.fillRect(0, TILE * 5, TILE, TILE * 2);
    g.lineStyle(2, 0x8B6914, 1);
    g.strokeRect(0, TILE * 5, TILE, TILE * 2);
    g.lineStyle(1, 0x8B6914, 0.8);
    g.lineBetween(TILE * 0.5, TILE * 5, TILE * 0.5, TILE * 7);
    g.lineBetween(0, TILE * 6, TILE, TILE * 6);
    // Right window
    g.fillStyle(0x87CEEB, 0.6);
    g.fillRect((MAP_COLS-1) * TILE, TILE * 5, TILE, TILE * 2);
    g.lineStyle(2, 0x8B6914, 1);
    g.strokeRect((MAP_COLS-1) * TILE, TILE * 5, TILE, TILE * 2);
    g.lineStyle(1, 0x8B6914, 0.8);
    g.lineBetween((MAP_COLS-1) * TILE + TILE * 0.5, TILE * 5, (MAP_COLS-1) * TILE + TILE * 0.5, TILE * 7);

    // === Photo frame on top wall ===
    g.fillStyle(0x8B6914, 1);
    g.fillRect(TILE * 7.5, TILE * 0.3, TILE * 2.5, TILE * 1.4);
    g.fillStyle(0xF5DEB3, 1);
    g.fillRect(TILE * 7.5 + 3, TILE * 0.3 + 3, TILE * 2.5 - 6, TILE * 1.4 - 6);
    g.fillStyle(0x8B4513, 0.4);
    g.fillRect(TILE * 7.5 + 6, TILE * 0.3 + 6, TILE * 2.5 - 12, TILE * 1.4 - 12);

    // Another photo frame
    g.fillStyle(0x8B6914, 1);
    g.fillRect(TILE * 11, TILE * 0.3, TILE * 1.5, TILE * 1.2);
    g.fillStyle(0xF0E68C, 1);
    g.fillRect(TILE * 11 + 2, TILE * 0.3 + 2, TILE * 1.5 - 4, TILE * 1.2 - 4);

    // === Labels ===
    this.add.text(TILE * 2, TILE * 1.5, '\\u0C85\\u0CA1\\u0CBF\\u0C97\\u0CC6', {
      fontSize: '6px', color: '#FFD700', fontFamily: 'sans-serif'
    });
    this.add.text(TILE * 15.2, TILE * 1.5, '\\u0CAA\\u0CC2\\u0C9C\\u0CC6', {
      fontSize: '6px', color: '#FFD700', fontFamily: 'sans-serif'
    });

    // === Collision bodies ===
    this.obstacles = this.physics.add.staticGroup();

    var topWall = this.add.rectangle(MAP_W/2, TILE, MAP_W, TILE*2).setAlpha(0);
    this.physics.add.existing(topWall, true); this.obstacles.add(topWall);
    var leftWall = this.add.rectangle(TILE*0.5, MAP_H/2, TILE, MAP_H).setAlpha(0);
    this.physics.add.existing(leftWall, true); this.obstacles.add(leftWall);
    var rightWall = this.add.rectangle(MAP_W - TILE*0.5, MAP_H/2, TILE, MAP_H).setAlpha(0);
    this.physics.add.existing(rightWall, true); this.obstacles.add(rightWall);
    var bwLeft = this.add.rectangle(doorX/2, (MAP_ROWS-0.5)*TILE, doorX, TILE).setAlpha(0);
    this.physics.add.existing(bwLeft, true); this.obstacles.add(bwLeft);
    var rightDoorEdge = doorX + TILE * 2;
    var bwRight = this.add.rectangle((rightDoorEdge+MAP_W)/2, (MAP_ROWS-0.5)*TILE, MAP_W-rightDoorEdge, TILE).setAlpha(0);
    this.physics.add.existing(bwRight, true); this.obstacles.add(bwRight);
    var kitchenCol = this.add.rectangle(TILE*3.5, TILE*2.75, TILE*5, TILE*1.5).setAlpha(0);
    this.physics.add.existing(kitchenCol, true); this.obstacles.add(kitchenCol);
    var tableCol = this.add.rectangle(TILE*10, TILE*7.5, TILE*4+4, TILE*3+4).setAlpha(0);
    this.physics.add.existing(tableCol, true); this.obstacles.add(tableCol);
    var poojaCol = this.add.rectangle(TILE*16.75, TILE*3.75, TILE*3.5, TILE*3.5).setAlpha(0);
    this.physics.add.existing(poojaCol, true); this.obstacles.add(poojaCol);
    var bedCol = this.add.rectangle(TILE*16.75, TILE*9.75, TILE*3.5, TILE*5.5).setAlpha(0);
    this.physics.add.existing(bedCol, true); this.obstacles.add(bedCol);

    // === NPCs ===
    this.createNPC(TILE*3, TILE*5.5, 'wizard-idle', 'amma-idle', '\\u0C85\\u0CAE\\u0CCD\\u0CAE', 'Amma', 0xFFAACC, [
      { kannada: '\\u0CAC\\u0CBE! \\u0C87\\u0CB2\\u0CCD\\u0CB2\\u0CBF \\u0CAC\\u0CBE \\u0CAE\\u0C97!', english: 'Come! Come here child!', words: ['\\u0CAC\\u0CBE', '\\u0C87\\u0CB2\\u0CCD\\u0CB2\\u0CBF'] },
      { kannada: '\\u0CA8\\u0CCB\\u0CA1\\u0CC1, \\u0C85\\u0CA1\\u0CBF\\u0C97\\u0CC6 \\u0CAE\\u0CBE\\u0CA1\\u0CCD\\u0CA4\\u0CBF\\u0CA6\\u0CCD\\u0CA6\\u0CC0\\u0CA8\\u0CBF', english: 'Look, I am cooking', words: ['\\u0CA8\\u0CCB\\u0CA1\\u0CC1', '\\u0C85\\u0CA1\\u0CBF\\u0C97\\u0CC6'] },
      { kannada: '\\u0C87\\u0CA6\\u0CA8\\u0CCD\\u0CA8 \\u0C85\\u0CAA\\u0CCD\\u0CAA\\u0CA8\\u0CBF\\u0C97\\u0CC6 \\u0C95\\u0CCA\\u0CA1\\u0CC1', english: 'Give this to father', words: ['\\u0C95\\u0CCA\\u0CA1\\u0CC1', '\\u0C85\\u0CAA\\u0CCD\\u0CAA'] }
    ]);
    this.createNPC(TILE*7, TILE*7.5, 'knight-idle', 'appa-idle', '\\u0C85\\u0CAA\\u0CCD\\u0CAA', 'Appa', null, [
      { kannada: '\\u0CAC\\u0CBE \\u0CAE\\u0C97, \\u0C8A\\u0C9F \\u0CAE\\u0CBE\\u0CA1\\u0CCB\\u0CA3', english: 'Come child, let us eat', words: ['\\u0CAE\\u0C97', '\\u0C8A\\u0C9F'] },
      { kannada: '\\u0C92\\u0CB3\\u0CCD\\u0CB3\\u0CC6\\u0CAF \\u0CAE\\u0C97\\u0CC1 \\u0CA8\\u0CC0\\u0CA8\\u0CC1!', english: 'You are a good child!', words: ['\\u0C92\\u0CB3\\u0CCD\\u0CB3\\u0CC6\\u0CAF', '\\u0CAE\\u0C97\\u0CC1'] },
      { kannada: '\\u0C93\\u0CA6\\u0CC1, \\u0CAA\\u0CC1\\u0CB8\\u0CCD\\u0CA4\\u0C95 \\u0CA4\\u0CC6\\u0C97\\u0CC6', english: 'Read, take the book', words: ['\\u0C93\\u0CA6\\u0CC1', '\\u0CAA\\u0CC1\\u0CB8\\u0CCD\\u0CA4\\u0C95'] }
    ]);
    this.createNPC(TILE*13, TILE*12, 'rogue-idle', 'putta-idle', '\\u0CAA\\u0CC1\\u0C9F\\u0CCD\\u0C9F', 'Putta', null, [
      { kannada: '\\u0C86\\u0C9F \\u0C86\\u0CA1\\u0CCB\\u0CA3 \\u0CAC\\u0CBE!', english: 'Let us play, come!', words: ['\\u0C86\\u0C9F', '\\u0C86\\u0CA1\\u0CC1'] },
      { kannada: '\\u0CA8\\u0CA8\\u0C97\\u0CC6 \\u0C9A\\u0CC6\\u0C82\\u0CA1\\u0CC1 \\u0CAC\\u0CC7\\u0C95\\u0CC1!', english: 'I want the ball!', words: ['\\u0CAC\\u0CC7\\u0C95\\u0CC1', '\\u0C9A\\u0CC6\\u0C82\\u0CA1\\u0CC1'] },
      { kannada: '\\u0C85\\u0CAE\\u0CCD\\u0CAE, \\u0CB9\\u0CB8\\u0CBF\\u0CB5\\u0CC1!', english: 'Mother, I am hungry!', words: ['\\u0CB9\\u0CB8\\u0CBF\\u0CB5\\u0CC1'] }
    ]);

    // === Player ===
    this.player = this.add.sprite(TILE * 10, TILE * 11, 'player-idle-down');
    this.player.play('player-idle-down-anim');
    this.player.setDepth(10);
    this.physics.add.existing(this.player);
    this.player.body.setSize(16, 16);
    this.player.body.setOffset(24, 40);
    this.player.body.setCollideWorldBounds(true);
    if (window.selectedCharacter === 'maaya') this.player.setTint(0xffccdd);

    this.physics.add.collider(this.player, this.obstacles);

    // Interaction prompt
    this.interactPrompt = this.add.text(0, 0, '\\uD83D\\uDCAC', {
      fontSize: '12px'
    }).setOrigin(0.5).setVisible(false).setDepth(50);

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);
    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);

    this.MAP_ROWS = MAP_ROWS;
    this.TILE = TILE;
    this.doorX = doorX;

    sendToRN('SCENE_READY', { scene: 'House', area: 'house' });

    // Area title toast
    var title = this.add.text(this.cameras.main.width/2, this.cameras.main.height/2,
      '\\u0CAE\\u0CA8\\u0CC6\\nHome', {
      fontSize: '16px', color: '#FFD700', fontFamily: 'sans-serif',
      align: 'center', backgroundColor: '#000000cc', padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: title, alpha: 0, delay: 2000, duration: 600, onComplete: function() { title.destroy(); } });
  }

  createAnimations() {
    if (this.anims.exists('player-walk-down-anim')) return;
    this.anims.create({ key: 'player-walk-down-anim', frames: this.anims.generateFrameNumbers('player-walk-down', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'player-walk-up-anim', frames: this.anims.generateFrameNumbers('player-walk-up', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'player-walk-side-anim', frames: this.anims.generateFrameNumbers('player-walk-side', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'player-idle-down-anim', frames: this.anims.generateFrameNumbers('player-idle-down', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'player-idle-up-anim', frames: this.anims.generateFrameNumbers('player-idle-up', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'player-idle-side-anim', frames: this.anims.generateFrameNumbers('player-idle-side', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'amma-idle', frames: this.anims.generateFrameNumbers('wizard-idle', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'appa-idle', frames: this.anims.generateFrameNumbers('knight-idle', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'putta-idle', frames: this.anims.generateFrameNumbers('rogue-idle', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'moti-idle', frames: this.anims.generateFrameNumbers('orc-idle', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
  }

  createNPC(x, y, spriteKey, animKey, nameKn, nameEn, tint, dialogs) {
    var npcSprite = this.add.sprite(x, y, spriteKey);
    npcSprite.play(animKey);
    npcSprite.setDepth(5);
    if (tint) npcSprite.setTint(tint);
    this.physics.add.existing(npcSprite, true);
    npcSprite.body.setSize(16, 16);
    npcSprite.body.setOffset(8, 12);
    var label = this.add.text(x, y - 20, nameKn, {
      fontSize: '7px', color: '#ffffff', fontFamily: 'sans-serif',
      backgroundColor: '#00000088', padding: { x: 2, y: 1 }
    }).setOrigin(0.5).setDepth(15);
    npcSprite.npcData = { kannadaName: nameKn, englishName: nameEn, dialogs: dialogs, currentDialog: 0, label: label };
    this.npcs.push(npcSprite);
    this.physics.add.collider(this.player, npcSprite);
    return npcSprite;
  }

  handleInput(data) {
    switch(data.type) {
      case 'MOVE':
        this.moveDir = { x: 0, y: 0 };
        var d = data.direction;
        if (d === 'up') { this.moveDir.y = -1; this.currentFacing = 'up'; }
        else if (d === 'down') { this.moveDir.y = 1; this.currentFacing = 'down'; }
        else if (d === 'left') { this.moveDir.x = -1; this.currentFacing = 'left'; }
        else if (d === 'right') { this.moveDir.x = 1; this.currentFacing = 'right'; }
        else if (d === 'up-left') { this.moveDir.x = -0.707; this.moveDir.y = -0.707; this.currentFacing = 'left'; }
        else if (d === 'up-right') { this.moveDir.x = 0.707; this.moveDir.y = -0.707; this.currentFacing = 'right'; }
        else if (d === 'down-left') { this.moveDir.x = -0.707; this.moveDir.y = 0.707; this.currentFacing = 'left'; }
        else if (d === 'down-right') { this.moveDir.x = 0.707; this.moveDir.y = 0.707; this.currentFacing = 'right'; }
        break;
      case 'STOP': this.moveDir = { x: 0, y: 0 }; break;
      case 'ACTION': this.tryInteract(); break;
    }
  }

  tryInteract() {
    if (!this.canInteract) return;
    var px = this.player.x, py = this.player.y;
    var closest = null, closestDist = 40;
    for (var i = 0; i < this.npcs.length; i++) {
      var dist = Phaser.Math.Distance.Between(px, py, this.npcs[i].x, this.npcs[i].y);
      if (dist < closestDist) { closest = this.npcs[i]; closestDist = dist; }
    }
    if (closest && closest.npcData) {
      var dd = closest.npcData;
      var dialog = dd.dialogs[dd.currentDialog];
      sendToRN('DIALOG', { npc: dd.englishName, npcKannada: dd.kannadaName, kannada: dialog.kannada, english: dialog.english, words: dialog.words });
      for (var ww = 0; ww < dialog.words.length; ww++) sendToRN('WORD_LEARNED', { kannada: dialog.words[ww], source: dd.englishName });
      dd.currentDialog = (dd.currentDialog + 1) % dd.dialogs.length;
      this.canInteract = false;
      var self = this;
      this.time.delayedCall(800, function() { self.canInteract = true; });
    }
  }

  update() {
    if (!this.player || !this.player.body) return;
    var vx = this.moveDir.x * this.playerSpeed;
    var vy = this.moveDir.y * this.playerSpeed;
    this.player.body.setVelocity(vx, vy);

    var moving = (vx !== 0 || vy !== 0);
    if (moving) {
      if (this.currentFacing === 'down') { this.player.play('player-walk-down-anim', true); this.player.setFlipX(false); }
      else if (this.currentFacing === 'up') { this.player.play('player-walk-up-anim', true); this.player.setFlipX(false); }
      else if (this.currentFacing === 'left') { this.player.play('player-walk-side-anim', true); this.player.setFlipX(true); }
      else if (this.currentFacing === 'right') { this.player.play('player-walk-side-anim', true); this.player.setFlipX(false); }
    } else {
      if (this.currentFacing === 'down') { this.player.play('player-idle-down-anim', true); this.player.setFlipX(false); }
      else if (this.currentFacing === 'up') { this.player.play('player-idle-up-anim', true); this.player.setFlipX(false); }
      else if (this.currentFacing === 'left') { this.player.play('player-idle-side-anim', true); this.player.setFlipX(true); }
      else if (this.currentFacing === 'right') { this.player.play('player-idle-side-anim', true); this.player.setFlipX(false); }
    }

    // NPC proximity check
    var px = this.player.x, py = this.player.y;
    var nearNPC = false;
    for (var i = 0; i < this.npcs.length; i++) {
      var dist = Phaser.Math.Distance.Between(px, py, this.npcs[i].x, this.npcs[i].y);
      if (dist < 40) { nearNPC = true; this.interactPrompt.setPosition(this.npcs[i].x, this.npcs[i].y - 24); this.interactPrompt.setVisible(true); break; }
    }
    if (!nearNPC) this.interactPrompt.setVisible(false);

    // Door transition to courtyard
    if (py > (this.MAP_ROWS - 1) * this.TILE - 4) {
      var doorCenterX = this.doorX + this.TILE;
      if (Math.abs(px - doorCenterX) < this.TILE * 1.5) {
        sendToRN('AREA_CHANGE', { from: 'house', to: 'courtyard' });
        this.scene.start('CourtyardScene');
      }
    }
  }
}

// ============================================================
// CourtyardScene - Outdoor courtyard
// ============================================================
class CourtyardScene extends Phaser.Scene {
  constructor() { super({ key: 'CourtyardScene' }); }

  preload() {
    if (!this.textures.exists('player-walk-down')) {
      this.load.spritesheet('player-walk-down', SPRITES.playerWalkDown, { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player-walk-up', SPRITES.playerWalkUp, { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player-walk-side', SPRITES.playerWalkSide, { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player-idle-down', SPRITES.playerIdleDown, { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player-idle-up', SPRITES.playerIdleUp, { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player-idle-side', SPRITES.playerIdleSide, { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('orc-idle', SPRITES.orcIdle, { frameWidth: 32, frameHeight: 32 });
    }
  }

  create() {
    window.gameScene = this;
    this.moveDir = { x: 0, y: 0 };
    this.playerSpeed = 90;
    this.canInteract = true;
    this.npcs = [];
    this.currentFacing = 'down';

    var TILE = 16;
    var MAP_COLS = 30;
    var MAP_ROWS = 22;
    var MAP_W = MAP_COLS * TILE;
    var MAP_H = MAP_ROWS * TILE;

    if (!this.anims.exists('player-walk-down-anim')) this.createAnimations();

    var g = this.add.graphics();

    // === Grass floor with natural variation ===
    for (var fy = 0; fy < MAP_ROWS; fy++) {
      for (var fx = 0; fx < MAP_COLS; fx++) {
        var noise = (fx * 7 + fy * 13) % 5;
        var gs = noise === 0 ? 0x4a8c49 : noise === 1 ? 0x3d7a3d : noise === 2 ? 0x52994f : noise === 3 ? 0x458745 : 0x4a8c49;
        g.fillStyle(gs, 1);
        g.fillRect(fx * TILE, fy * TILE, TILE, TILE);
        // Grass detail
        if ((fx + fy * 3) % 7 === 0) {
          g.fillStyle(0x5aaa55, 0.4);
          g.fillRect(fx * TILE + 3, fy * TILE + 2, 2, 5);
          g.fillRect(fx * TILE + 8, fy * TILE + 6, 2, 4);
        }
      }
    }

    // === Dirt paths ===
    g.fillStyle(0xC4A265, 1);
    g.fillRect(TILE * 13, 0, TILE * 4, MAP_H);
    g.fillStyle(0xB89555, 1);
    g.fillRect(TILE * 13 + 3, 0, TILE * 4 - 6, MAP_H);
    // Path edges (darker dirt)
    g.fillStyle(0xA08040, 0.5);
    g.fillRect(TILE * 13, 0, 3, MAP_H);
    g.fillRect(TILE * 17 - 3, 0, 3, MAP_H);

    g.fillStyle(0xC4A265, 1);
    g.fillRect(0, TILE * 10, MAP_W, TILE * 3);
    g.fillStyle(0xB89555, 1);
    g.fillRect(0, TILE * 10 + 3, MAP_W, TILE * 3 - 6);

    // === House at top ===
    var houseX = TILE * 11;
    var houseY = TILE * 0.5;
    var houseW = TILE * 8;
    var houseH = TILE * 5;
    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(houseX + 4, houseY + houseH, houseW, 6);
    // Walls
    g.fillStyle(0xD2691E, 1);
    g.fillRect(houseX, houseY, houseW, houseH);
    g.fillStyle(0xF5DEB3, 1);
    g.fillRect(houseX + 4, houseY + 4, houseW - 8, houseH - 4);
    // Roof
    g.fillStyle(0xCC3333, 1);
    g.fillRect(houseX - 6, houseY - 4, houseW + 12, 10);
    g.fillStyle(0xAA2222, 1);
    g.fillRect(houseX - 3, houseY - 8, houseW + 6, 6);
    g.fillStyle(0x991111, 1);
    g.fillRect(houseX, houseY - 10, houseW, 4);
    // Windows
    g.fillStyle(0x87CEEB, 0.7);
    g.fillRect(houseX + 10, houseY + 16, 14, 14);
    g.fillRect(houseX + houseW - 24, houseY + 16, 14, 14);
    g.lineStyle(2, 0x8B6914, 1);
    g.strokeRect(houseX + 10, houseY + 16, 14, 14);
    g.strokeRect(houseX + houseW - 24, houseY + 16, 14, 14);
    g.lineStyle(1, 0x8B6914, 0.7);
    g.lineBetween(houseX + 17, houseY + 16, houseX + 17, houseY + 30);
    g.lineBetween(houseX + houseW - 17, houseY + 16, houseX + houseW - 17, houseY + 30);
    // Door
    var doorBackX = houseX + houseW / 2 - TILE;
    var doorBackY = houseY + houseH - 2;
    g.fillStyle(0x654321, 1);
    g.fillRect(doorBackX, doorBackY, TILE * 2, 5);
    g.fillStyle(0x8B4513, 1);
    g.fillRect(doorBackX + 2, doorBackY, TILE * 2 - 4, 3);
    // Door step
    g.fillStyle(0x999999, 1);
    g.fillRect(doorBackX - 2, doorBackY + 4, TILE * 2 + 4, 3);
    // Arrow hint
    this.add.text(doorBackX + TILE, doorBackY - 6, '\\u25B2', {
      fontSize: '8px', color: '#FFD700', fontFamily: 'sans-serif'
    }).setOrigin(0.5).setDepth(2);

    // === Tulasi Katte ===
    var tulasiX = TILE * 22;
    var tulasiY = TILE * 4;
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(tulasiX + TILE * 1.5, tulasiY + TILE * 3 + 4, TILE * 4, 8);
    g.fillStyle(0x8B4513, 1);
    g.fillRect(tulasiX, tulasiY, TILE * 3, TILE * 3);
    g.fillStyle(0xA0522D, 1);
    g.fillRect(tulasiX + 3, tulasiY + 3, TILE * 3 - 6, TILE * 3 - 6);
    g.fillStyle(0xC4A265, 0.4);
    g.fillRect(tulasiX + 6, tulasiY + 6, TILE * 3 - 12, TILE * 3 - 12);
    g.fillStyle(0x228B22, 1);
    g.fillCircle(tulasiX + TILE * 1.5, tulasiY - 4, 14);
    g.fillStyle(0x32CD32, 1);
    g.fillCircle(tulasiX + TILE * 1.5 - 5, tulasiY - 8, 9);
    g.fillCircle(tulasiX + TILE * 1.5 + 5, tulasiY - 6, 9);
    g.fillStyle(0x44DD44, 1);
    g.fillCircle(tulasiX + TILE * 1.5, tulasiY - 12, 7);
    // Stem
    g.fillStyle(0x556B2F, 1);
    g.fillRect(tulasiX + TILE * 1.5 - 1, tulasiY - 2, 2, 8);

    // === Well ===
    var wellX = TILE * 5;
    var wellY = TILE * 8;
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(wellX, wellY + 18, 36, 8);
    g.fillStyle(0x696969, 1);
    g.fillCircle(wellX, wellY, 16);
    g.fillStyle(0x555555, 1);
    g.fillCircle(wellX, wellY, 13);
    g.fillStyle(0x1a1a4e, 0.8);
    g.fillCircle(wellX, wellY, 10);
    // Well frame
    g.fillStyle(0x666666, 1);
    g.fillRect(wellX - 2, wellY - 22, 4, 16);
    g.fillRect(wellX - 12, wellY - 24, 24, 3);
    // Bucket
    g.fillStyle(0x8B4513, 0.8);
    g.fillRect(wellX + 1, wellY - 16, 5, 6);

    // === Garden patches ===
    var gardenX = TILE * 22;
    var gardenY = TILE * 14;
    g.fillStyle(0x5a3a1a, 1);
    g.fillRect(gardenX, gardenY, TILE * 6, TILE * 4);
    // Raised bed borders
    g.lineStyle(1, 0x8B6914, 0.6);
    g.strokeRect(gardenX, gardenY, TILE * 6, TILE * 4);
    // Furrows
    g.fillStyle(0x4a2a10, 0.5);
    for (var gr = 0; gr < 3; gr++) {
      g.fillRect(gardenX + 4, gardenY + 4 + gr * TILE * 1.3, TILE * 6 - 8, 3);
    }
    // Plants
    g.fillStyle(0x228B22, 0.9);
    for (var gx = 0; gx < 5; gx++) {
      for (var gy = 0; gy < 3; gy++) {
        g.fillCircle(gardenX + 10 + gx * TILE * 1.2, gardenY + 10 + gy * TILE * 1.3, 5);
      }
    }
    // Flowers
    g.fillStyle(0xFF69B4, 0.9);
    g.fillCircle(gardenX + 12, gardenY + 12, 2);
    g.fillCircle(gardenX + 55, gardenY + 32, 2);
    g.fillStyle(0xFFFF00, 0.9);
    g.fillCircle(gardenX + 35, gardenY + 48, 2.5);
    g.fillCircle(gardenX + 75, gardenY + 18, 2);
    g.fillStyle(0xFF4500, 0.8);
    g.fillCircle(gardenX + 48, gardenY + 10, 2);

    // === Fence ===
    g.fillStyle(0x8B6914, 1);
    for (var ff = 0; ff < MAP_COLS; ff++) {
      g.fillRect(ff * TILE + 4, MAP_H - 10, 3, 10);
      if (ff < MAP_COLS - 1) {
        g.fillRect(ff * TILE + 4, MAP_H - 7, TILE, 2);
        g.fillRect(ff * TILE + 4, MAP_H - 3, TILE, 2);
      }
    }

    // === Trees ===
    var treePositions = [
      [TILE*2,TILE*3],[TILE*6,TILE*2],[TILE*2,TILE*15],[TILE*8,TILE*16],
      [TILE*27,TILE*3],[TILE*27,TILE*9],[TILE*4,TILE*19],[TILE*10,TILE*19],
      [TILE*20,TILE*19],[TILE*26,TILE*19]
    ];
    this.obstacles = this.physics.add.staticGroup();

    for (var ti = 0; ti < treePositions.length; ti++) {
      var tpx = treePositions[ti][0], tpy = treePositions[ti][1];
      // Shadow
      g.fillStyle(0x000000, 0.12);
      g.fillEllipse(tpx, tpy + 18, 24, 8);
      // Trunk
      g.fillStyle(0x8B4513, 1);
      g.fillRect(tpx - 3, tpy + 2, 6, 14);
      g.fillStyle(0x6B3410, 1);
      g.fillRect(tpx - 1, tpy + 4, 2, 10);
      // Crown
      g.fillStyle(0x2d5a27, 1);
      g.fillCircle(tpx, tpy - 2, 15);
      g.fillStyle(0x3a7a33, 1);
      g.fillCircle(tpx - 5, tpy - 6, 11);
      g.fillCircle(tpx + 6, tpy - 4, 11);
      g.fillStyle(0x4a8a43, 1);
      g.fillCircle(tpx, tpy - 10, 9);
      g.fillCircle(tpx - 3, tpy - 12, 6);
      // Collision
      var tc = this.add.rectangle(tpx, tpy + 8, 12, 16).setAlpha(0);
      this.physics.add.existing(tc, true); this.obstacles.add(tc);
    }

    // === Kolam near entrance ===
    g.fillStyle(0xffffff, 0.5);
    var kx = doorBackX + TILE, ky = doorBackY + TILE * 2;
    for (var ki2 = 0; ki2 < 7; ki2++) for (var kj2 = 0; kj2 < 7; kj2++) {
      if ((ki2 + kj2) % 2 === 0) g.fillCircle(kx - 18 + ki2 * 6, ky + kj2 * 6, 1.5);
    }

    // === Collisions ===
    var hc = this.add.rectangle(houseX + houseW/2, houseY + houseH/2, houseW, houseH).setAlpha(0);
    this.physics.add.existing(hc, true); this.obstacles.add(hc);
    var tulc = this.add.rectangle(tulasiX + TILE*1.5, tulasiY + TILE*1.5, TILE*3, TILE*3).setAlpha(0);
    this.physics.add.existing(tulc, true); this.obstacles.add(tulc);
    var wc = this.add.circle(wellX, wellY, 18).setAlpha(0);
    this.physics.add.existing(wc, true); this.obstacles.add(wc);
    var gc2 = this.add.rectangle(gardenX + TILE*3, gardenY + TILE*2, TILE*6, TILE*4).setAlpha(0);
    this.physics.add.existing(gc2, true); this.obstacles.add(gc2);
    var fc = this.add.rectangle(MAP_W/2, MAP_H - 5, MAP_W, 10).setAlpha(0);
    this.physics.add.existing(fc, true); this.obstacles.add(fc);

    // === Labels ===
    this.add.text(tulasiX + TILE*0.5, tulasiY + TILE*3 + 6, '\\u0CA4\\u0CC1\\u0CB3\\u0CB8\\u0CBF', { fontSize: '6px', color: '#90EE90', fontFamily: 'sans-serif' });
    this.add.text(wellX - 12, wellY + 22, '\\u0CAC\\u0CBE\\u0CB5\\u0CBF', { fontSize: '6px', color: '#aaa', fontFamily: 'sans-serif' });
    this.add.text(gardenX + TILE, gardenY + TILE*4 + 6, '\\u0CA4\\u0CCB\\u0C9F', { fontSize: '6px', color: '#90EE90', fontFamily: 'sans-serif' });

    // === NPCs ===
    var moti = this.createNPC(TILE*18, TILE*12, 'orc-idle', 'moti-idle', '\\u0CAE\\u0CCB\\u0CA4\\u0CBF \\uD83D\\uDC15', 'Moti', 0xDAA520, [
      { kannada: '\\u0CAC\\u0CCC \\u0CAC\\u0CCC! \\u0CA8\\u0CBE\\u0CA8\\u0CC1 \\u0CAE\\u0CCB\\u0CA4\\u0CBF!', english: 'Bow bow! I am Moti!', words: ['\\u0CA8\\u0CBE\\u0CA8\\u0CC1', '\\u0CA8\\u0CBE\\u0CAF\\u0CBF'] },
      { kannada: '\\u0C86\\u0C9F \\u0C86\\u0CA1\\u0CCB\\u0CA3 \\u0CAC\\u0CBE!', english: 'Come let us play!', words: ['\\u0C86\\u0C9F', '\\u0CAC\\u0CBE'] }
    ]);
    this.motiWander(moti);

    // Gubbi (sparrow)
    var gubbiX = TILE * 7, gubbiY = TILE * 2.5;
    var gubbiGfx = this.add.graphics();
    gubbiGfx.fillStyle(0xFFD700, 1); gubbiGfx.fillCircle(0, 0, 3);
    gubbiGfx.fillStyle(0xDAA520, 1); gubbiGfx.fillCircle(-2, 1, 2.5);
    gubbiGfx.fillStyle(0xFF8C00, 1); gubbiGfx.fillCircle(3, 0, 1.5);
    gubbiGfx.fillStyle(0x333333, 1); gubbiGfx.fillCircle(-0.5, -1, 0.8);
    // Wing
    gubbiGfx.fillStyle(0xB8860B, 0.8);
    gubbiGfx.fillCircle(-3, 1, 2);
    gubbiGfx.setPosition(gubbiX, gubbiY); gubbiGfx.setDepth(5);

    var gubbiHit = this.add.circle(gubbiX, gubbiY, 8).setAlpha(0.001).setInteractive();
    gubbiHit.setDepth(6);
    this.physics.add.existing(gubbiHit, true);
    gubbiHit.npcData = {
      kannadaName: '\\u0C97\\u0CC1\\u0CAC\\u0CCD\\u0CAC\\u0CBF \\uD83D\\uDC26', englishName: 'Gubbi',
      dialogs: [
        { kannada: '\\u0C9A\\u0CBF\\u0CB2\\u0CBF \\u0C9A\\u0CBF\\u0CB2\\u0CBF! \\u0CA8\\u0CBE\\u0CA8\\u0CC1 \\u0C97\\u0CC1\\u0CAC\\u0CCD\\u0CAC\\u0CBF!', english: 'Chirp chirp! I am Gubbi!', words: ['\\u0CA8\\u0CBE\\u0CA8\\u0CC1', '\\u0C97\\u0CC1\\u0CAC\\u0CCD\\u0CAC\\u0CBF'] },
        { kannada: '\\u0CAE\\u0CB0\\u0CA6 \\u0CAE\\u0CC7\\u0CB2\\u0CC6 \\u0CA8\\u0CA8\\u0CCD\\u0CA8 \\u0CAE\\u0CA8\\u0CC6!', english: 'My home is on the tree!', words: ['\\u0CAE\\u0CB0', '\\u0CAE\\u0CC7\\u0CB2\\u0CC6', '\\u0CAE\\u0CA8\\u0CC6'] }
      ], currentDialog: 0
    };
    var gubbiLabel = this.add.text(gubbiX, gubbiY - 10, '\\u0C97\\u0CC1\\u0CAC\\u0CCD\\u0CAC\\u0CBF', {
      fontSize: '6px', color: '#FFD700', fontFamily: 'sans-serif',
      backgroundColor: '#00000088', padding: { x: 2, y: 1 }
    }).setOrigin(0.5).setDepth(15);
    this.npcs.push(gubbiHit);
    this.tweens.add({ targets: [gubbiGfx, gubbiHit, gubbiLabel], y: '-=3', yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut' });

    // Bekku (cat)
    this.createNPC(TILE*24, TILE*16, 'orc-idle', 'moti-idle', '\\u0CAC\\u0CC6\\u0C95\\u0CCD\\u0C95\\u0CC1 \\uD83D\\uDC31', 'Bekku', 0x888899, [
      { kannada: '\\u0CAE\\u0CBF\\u0CAF\\u0CBE\\u0CB5\\u0CCD! \\u0CA8\\u0CBE\\u0CA8\\u0CC1 \\u0CAC\\u0CC6\\u0C95\\u0CCD\\u0C95\\u0CC1!', english: 'Meow! I am a cat!', words: ['\\u0CAC\\u0CC6\\u0C95\\u0CCD\\u0C95\\u0CC1'] },
      { kannada: '\\u0CB9\\u0CBE\\u0CB2\\u0CC1 \\u0CAC\\u0CC7\\u0C95\\u0CC1!', english: 'I want milk!', words: ['\\u0CB9\\u0CBE\\u0CB2\\u0CC1', '\\u0CAC\\u0CC7\\u0C95\\u0CC1'] }
    ]);

    // === Player ===
    this.player = this.add.sprite(doorBackX + TILE, doorBackY + TILE * 3, 'player-idle-down');
    this.player.play('player-idle-down-anim');
    this.player.setDepth(10);
    this.physics.add.existing(this.player);
    this.player.body.setSize(16, 16);
    this.player.body.setOffset(24, 40);
    this.player.body.setCollideWorldBounds(true);
    if (window.selectedCharacter === 'maaya') this.player.setTint(0xffccdd);

    this.physics.add.collider(this.player, this.obstacles);

    this.interactPrompt = this.add.text(0, 0, '\\uD83D\\uDCAC', { fontSize: '12px' }).setOrigin(0.5).setVisible(false).setDepth(50);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);
    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);

    this.TILE = TILE;
    this.doorBackX = doorBackX;
    this.doorBackY = doorBackY;

    sendToRN('SCENE_READY', { scene: 'Courtyard', area: 'courtyard' });

    var title2 = this.add.text(this.cameras.main.width/2, this.cameras.main.height/2,
      '\\u0CAE\\u0CA8\\u0CC6\\u0CAF \\u0C85\\u0C82\\u0C97\\u0CB3\\nCourtyard', {
      fontSize: '16px', color: '#FFD700', fontFamily: 'sans-serif',
      align: 'center', backgroundColor: '#000000cc', padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: title2, alpha: 0, delay: 2000, duration: 600, onComplete: function() { title2.destroy(); } });
  }

  createAnimations() {
    if (this.anims.exists('player-walk-down-anim')) return;
    this.anims.create({ key: 'player-walk-down-anim', frames: this.anims.generateFrameNumbers('player-walk-down', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'player-walk-up-anim', frames: this.anims.generateFrameNumbers('player-walk-up', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'player-walk-side-anim', frames: this.anims.generateFrameNumbers('player-walk-side', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'player-idle-down-anim', frames: this.anims.generateFrameNumbers('player-idle-down', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'player-idle-up-anim', frames: this.anims.generateFrameNumbers('player-idle-up', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'player-idle-side-anim', frames: this.anims.generateFrameNumbers('player-idle-side', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'moti-idle', frames: this.anims.generateFrameNumbers('orc-idle', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
  }

  createNPC(x, y, spriteKey, animKey, nameKn, nameEn, tint, dialogs) {
    var npcSprite = this.add.sprite(x, y, spriteKey);
    npcSprite.play(animKey); npcSprite.setDepth(5);
    if (tint) npcSprite.setTint(tint);
    this.physics.add.existing(npcSprite, true);
    npcSprite.body.setSize(16, 16); npcSprite.body.setOffset(8, 12);
    var label = this.add.text(x, y - 20, nameKn, {
      fontSize: '6px', color: '#ffffff', fontFamily: 'sans-serif',
      backgroundColor: '#00000088', padding: { x: 2, y: 1 }
    }).setOrigin(0.5).setDepth(15);
    npcSprite.npcData = { kannadaName: nameKn, englishName: nameEn, dialogs: dialogs, currentDialog: 0, label: label };
    this.npcs.push(npcSprite);
    this.physics.add.collider(this.player, npcSprite);
    return npcSprite;
  }

  motiWander(moti) {
    var self = this;
    var TILE = this.TILE || 16;
    var wanderTo = function() {
      var nx = TILE*8 + Math.random()*TILE*14;
      var ny = TILE*8 + Math.random()*TILE*10;
      self.tweens.add({
        targets: moti, x: nx, y: ny,
        duration: 2000 + Math.random()*2000, ease: 'Linear',
        onUpdate: function() {
          if (moti.npcData && moti.npcData.label) moti.npcData.label.setPosition(moti.x, moti.y - 20);
          if (moti.body) moti.body.updateFromGameObject();
        },
        onComplete: function() { self.time.delayedCall(1000 + Math.random()*2000, wanderTo); }
      });
    };
    self.time.delayedCall(1000, wanderTo);
  }

  handleInput(data) {
    switch(data.type) {
      case 'MOVE':
        this.moveDir = { x: 0, y: 0 };
        var d = data.direction;
        if (d === 'up') { this.moveDir.y = -1; this.currentFacing = 'up'; }
        else if (d === 'down') { this.moveDir.y = 1; this.currentFacing = 'down'; }
        else if (d === 'left') { this.moveDir.x = -1; this.currentFacing = 'left'; }
        else if (d === 'right') { this.moveDir.x = 1; this.currentFacing = 'right'; }
        else if (d === 'up-left') { this.moveDir.x = -0.707; this.moveDir.y = -0.707; this.currentFacing = 'left'; }
        else if (d === 'up-right') { this.moveDir.x = 0.707; this.moveDir.y = -0.707; this.currentFacing = 'right'; }
        else if (d === 'down-left') { this.moveDir.x = -0.707; this.moveDir.y = 0.707; this.currentFacing = 'left'; }
        else if (d === 'down-right') { this.moveDir.x = 0.707; this.moveDir.y = 0.707; this.currentFacing = 'right'; }
        break;
      case 'STOP': this.moveDir = { x: 0, y: 0 }; break;
      case 'ACTION': this.tryInteract(); break;
    }
  }

  tryInteract() {
    if (!this.canInteract) return;
    var px = this.player.x, py = this.player.y;
    var closest = null, closestDist = 40;
    for (var i = 0; i < this.npcs.length; i++) {
      var dist = Phaser.Math.Distance.Between(px, py, this.npcs[i].x, this.npcs[i].y);
      if (dist < closestDist) { closest = this.npcs[i]; closestDist = dist; }
    }
    if (closest && closest.npcData) {
      var dd = closest.npcData;
      var dialog = dd.dialogs[dd.currentDialog];
      sendToRN('DIALOG', { npc: dd.englishName, npcKannada: dd.kannadaName, kannada: dialog.kannada, english: dialog.english, words: dialog.words });
      for (var ww = 0; ww < dialog.words.length; ww++) sendToRN('WORD_LEARNED', { kannada: dialog.words[ww], source: dd.englishName });
      dd.currentDialog = (dd.currentDialog + 1) % dd.dialogs.length;
      this.canInteract = false;
      var self = this;
      this.time.delayedCall(800, function() { self.canInteract = true; });
    }
  }

  update() {
    if (!this.player || !this.player.body) return;
    var vx = this.moveDir.x * this.playerSpeed;
    var vy = this.moveDir.y * this.playerSpeed;
    this.player.body.setVelocity(vx, vy);

    var moving = (vx !== 0 || vy !== 0);
    if (moving) {
      if (this.currentFacing === 'down') { this.player.play('player-walk-down-anim', true); this.player.setFlipX(false); }
      else if (this.currentFacing === 'up') { this.player.play('player-walk-up-anim', true); this.player.setFlipX(false); }
      else if (this.currentFacing === 'left') { this.player.play('player-walk-side-anim', true); this.player.setFlipX(true); }
      else if (this.currentFacing === 'right') { this.player.play('player-walk-side-anim', true); this.player.setFlipX(false); }
    } else {
      if (this.currentFacing === 'down') { this.player.play('player-idle-down-anim', true); this.player.setFlipX(false); }
      else if (this.currentFacing === 'up') { this.player.play('player-idle-up-anim', true); this.player.setFlipX(false); }
      else if (this.currentFacing === 'left') { this.player.play('player-idle-side-anim', true); this.player.setFlipX(true); }
      else if (this.currentFacing === 'right') { this.player.play('player-idle-side-anim', true); this.player.setFlipX(false); }
    }

    var px = this.player.x, py = this.player.y;
    var nearNPC = false;
    for (var i = 0; i < this.npcs.length; i++) {
      var dist = Phaser.Math.Distance.Between(px, py, this.npcs[i].x, this.npcs[i].y);
      if (dist < 40) { nearNPC = true; this.interactPrompt.setPosition(this.npcs[i].x, this.npcs[i].y - 24); this.interactPrompt.setVisible(true); break; }
    }
    if (!nearNPC) this.interactPrompt.setVisible(false);

    // Check house door
    if (py < this.doorBackY + this.TILE * 2.5 && py > this.doorBackY + this.TILE) {
      var doorCenter = this.doorBackX + this.TILE;
      if (Math.abs(px - doorCenter) < this.TILE * 1.5 && this.currentFacing === 'up') {
        sendToRN('AREA_CHANGE', { from: 'courtyard', to: 'house' });
        this.scene.start('HouseScene');
      }
    }
  }
}

// ============================================================
// Game Config
// ============================================================
var config = {
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  parent: document.body,
  pixelArt: true,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [CharSelectScene, HouseScene, CourtyardScene],
  input: { activePointers: 3 },
  banner: false
};

var game = new Phaser.Game(config);
<\/script>
</body>
</html>`;
