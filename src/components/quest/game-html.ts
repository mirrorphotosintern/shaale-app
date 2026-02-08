// Self-contained HTML for the Phaser game, loaded via WebView source={{ html }}
// Phaser is loaded from CDN. Game logic is inlined.
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
<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
<script>
// Bridge: receive input from React Native
window.gameInput = function(data) {
  if (window.gameScene) {
    window.gameScene.handleInput(data);
  }
};

// Bridge: send events to React Native
function sendToRN(type, payload) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
  }
}

// ============================================================
// Boot Scene
// ============================================================
class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    var w = this.cameras.main.width;
    var h = this.cameras.main.height;
    var bar = this.add.graphics();
    var box = this.add.graphics();
    box.fillStyle(0x222222, 0.8);
    box.fillRect(w/4, h/2 - 15, w/2, 30);

    this.load.on('progress', function(v) {
      bar.clear();
      bar.fillStyle(0x8B5CF6, 1);
      bar.fillRect(w/4 + 5, h/2 - 10, (w/2 - 10) * v, 20);
    });

    this.load.on('complete', function() {
      bar.destroy();
      box.destroy();
    });

    sendToRN('LOADING', { progress: 0 });
  }

  create() {
    sendToRN('LOADED', {});
    this.scene.start('Area1Scene');
  }
}

// ============================================================
// Area 1 Scene - Home Courtyard
// ============================================================
class Area1Scene extends Phaser.Scene {
  constructor() { super({ key: 'Area1Scene' }); }

  create() {
    window.gameScene = this;
    this.moveDir = { x: 0, y: 0 };
    this.playerSpeed = 80;
    this.canInteract = true;

    var MAP_W = 480;
    var MAP_H = 720;

    // Draw the world
    var g = this.add.graphics();

    // Grass background
    g.fillStyle(0x4a7c59, 1);
    g.fillRect(0, 0, MAP_W, MAP_H);

    // Dirt paths
    g.fillStyle(0xc4a265, 1);
    g.fillRect(210, 0, 60, MAP_H);      // vertical main path
    g.fillRect(0, 300, MAP_W, 50);       // horizontal path

    // === House (top area) ===
    // Walls
    g.fillStyle(0xD2691E, 1);
    g.fillRect(40, 40, 150, 120);
    // Roof
    g.fillStyle(0xCC3333, 1);
    g.fillRect(30, 25, 170, 22);
    // Inner wall
    g.fillStyle(0xF5DEB3, 1);
    g.fillRect(48, 48, 134, 104);
    // Door
    g.fillStyle(0x654321, 1);
    g.fillRect(105, 128, 30, 32);
    // Window
    g.fillStyle(0x87CEEB, 0.6);
    g.fillRect(65, 70, 20, 20);
    g.fillRect(145, 70, 20, 20);

    // === Tulasi katte (sacred basil platform) ===
    g.fillStyle(0x8B4513, 1);
    g.fillRect(310, 60, 50, 50);
    g.fillStyle(0xA0522D, 1);
    g.fillRect(315, 65, 40, 40);
    // Tulasi leaves
    g.fillStyle(0x228B22, 1);
    g.fillCircle(335, 55, 18);
    g.fillStyle(0x32CD32, 1);
    g.fillCircle(335, 50, 12);

    // === Kolam (rangoli) near entrance ===
    g.fillStyle(0xffffff, 0.5);
    for (var i = 0; i < 7; i++) {
      for (var j = 0; j < 7; j++) {
        if ((i + j) % 2 === 0) {
          g.fillCircle(200 + i * 12, 180 + j * 12, 2);
        }
      }
    }

    // === Well ===
    g.fillStyle(0x696969, 1);
    g.fillCircle(400, 320, 22);
    g.fillStyle(0x1a1a4e, 1);
    g.fillCircle(400, 320, 16);

    // === Fence sections ===
    g.fillStyle(0x8B6914, 1);
    for (var f = 0; f < 10; f++) {
      g.fillRect(10 + f * 46, MAP_H - 20, 4, 20);
      g.fillRect(10 + f * 46, MAP_H - 16, 40, 3);
    }

    // === Garden patches ===
    g.fillStyle(0x5a3a1a, 1);
    g.fillRect(340, 420, 100, 60);
    g.fillStyle(0x228B22, 0.7);
    for (var gx = 0; gx < 4; gx++) {
      for (var gy = 0; gy < 2; gy++) {
        g.fillCircle(355 + gx * 25, 435 + gy * 25, 8);
      }
    }

    // Labels
    this.add.text(75, 10, 'ಮನೆ (Home)', { fontSize: '10px', color: '#FFD700', fontFamily: 'sans-serif' });
    this.add.text(308, 112, 'ತುಳಸಿ', { fontSize: '9px', color: '#90EE90', fontFamily: 'sans-serif' });
    this.add.text(380, 345, 'ಬಾವಿ', { fontSize: '8px', color: '#aaa', fontFamily: 'sans-serif' });
    this.add.text(350, 490, 'ತೋಟ (Garden)', { fontSize: '8px', color: '#90EE90', fontFamily: 'sans-serif' });

    // Trees (visual only, but with collision)
    this.obstacles = this.physics.add.staticGroup();
    var treeSpots = [
      [25, 250], [460, 250], [25, 500], [460, 500],
      [80, 550], [440, 400], [25, 650], [460, 650],
      [150, 600], [300, 600]
    ];
    for (var t = 0; t < treeSpots.length; t++) {
      var tx = treeSpots[t][0], ty = treeSpots[t][1];
      // Trunk
      g.fillStyle(0x8B4513, 1);
      g.fillRect(tx - 4, ty, 8, 16);
      // Crown
      g.fillStyle(0x2d5a27, 1);
      g.fillCircle(tx, ty - 4, 16);
      g.fillStyle(0x3a7a33, 1);
      g.fillCircle(tx, ty - 8, 12);
      // Collision body
      var treeBody = this.add.rectangle(tx, ty, 16, 16);
      treeBody.setAlpha(0);
      this.physics.add.existing(treeBody, true);
      this.obstacles.add(treeBody);
    }

    // House collision body
    var houseBody = this.add.rectangle(115, 90, 160, 130);
    houseBody.setAlpha(0);
    this.physics.add.existing(houseBody, true);
    this.obstacles.add(houseBody);

    // Tulasi collision
    var tulasiBody = this.add.rectangle(335, 75, 55, 55);
    tulasiBody.setAlpha(0);
    this.physics.add.existing(tulasiBody, true);
    this.obstacles.add(tulasiBody);

    // Well collision
    var wellBody = this.add.circle(400, 320, 24);
    wellBody.setAlpha(0);
    this.physics.add.existing(wellBody, true);
    this.obstacles.add(wellBody);

    // === Create Player ===
    this.player = this.add.container(240, 400);
    // Body circle
    var body = this.add.circle(0, 4, 8, 0x4F46E5);
    // Head
    var head = this.add.circle(0, -6, 6, 0xFFDBAC);
    // Hair
    var hair = this.add.circle(0, -10, 5, 0x333333);
    this.player.add([body, head, hair]);
    this.physics.add.existing(this.player);
    this.player.body.setSize(16, 16);
    this.player.body.setOffset(-8, -4);
    this.player.body.setCollideWorldBounds(true);

    // Collisions
    this.physics.add.collider(this.player, this.obstacles);

    // === Create NPCs ===
    this.npcs = [];
    this.createNPC(120, 175, 'ಅಮ್ಮ', 'Amma', 0xFF69B4, 0xFFDBAC, [
      { kannada: 'ಬಾ! ಇಲ್ಲಿ ಬಾ!', english: 'Come! Come here!', words: ['ಬಾ', 'ಇಲ್ಲಿ'] },
      { kannada: 'ನೋಡು, ಇದು ನಮ್ಮ ಮನೆ', english: 'Look, this is our home', words: ['ನೋಡು', 'ಇದು', 'ನಮ್ಮ', 'ಮನೆ'] },
      { kannada: 'ನನಗೆ ಕೊಡು', english: 'Give it to me', words: ['ನನಗೆ', 'ಕೊಡು'] }
    ]);

    this.createNPC(350, 240, 'ಅಪ್ಪ', 'Appa', 0x4169E1, 0xD2B48C, [
      { kannada: 'ಬಾ ಮಗ, ಇಲ್ಲಿ ಬಾ', english: 'Come child, come here', words: ['ಮಗ'] },
      { kannada: 'ಒಳ್ಳೆಯ ಮಗು', english: 'Good child', words: ['ಒಳ್ಳೆಯ', 'ಮಗು'] }
    ]);

    // Moti the dog
    this.createNPC(300, 380, 'ಮೋತಿ 🐕', 'Moti', 0xDAA520, null, [
      { kannada: 'ಬೌ ಬೌ! ನಾಯಿ ಇಲ್ಲಿ!', english: 'Bow bow! Dog is here!', words: ['ನಾಯಿ'] }
    ]);

    // Gubbi (near tulasi)
    this.createNPC(370, 70, 'ಗುಬ್ಬಿ 🐦', 'Gubbi', 0xFFD700, null, [
      { kannada: 'ಚಿಲಿ ಚಿಲಿ! ನಾನು ಗುಬ್ಬಿ!', english: 'Chirp chirp! I am Gubbi!', words: ['ನಾನು', 'ಗುಬ್ಬಿ'] },
      { kannada: 'ನಿನ್ನ ಜೊತೆ ಬರುತ್ತೇನೆ!', english: 'I will come with you!', words: ['ನಿನ್ನ', 'ಜೊತೆ'] }
    ]);

    // Bekku the cat (wandering near garden)
    this.createNPC(380, 450, 'ಬೆಕ್ಕು 🐱', 'Bekku', 0x808080, null, [
      { kannada: 'ಮಿಯಾವ್! ನಾನು ಬೆಕ್ಕು!', english: 'Meow! I am a cat!', words: ['ಬೆಕ್ಕು'] }
    ]);

    // Interaction prompt
    this.interactPrompt = this.add.text(0, 0, '💬', {
      fontSize: '14px'
    }).setOrigin(0.5).setVisible(false).setDepth(50);

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.8);
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);
    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);

    // Notify RN
    sendToRN('SCENE_READY', { area: 1, name: 'Home Courtyard' });

    // Area title
    var title = this.add.text(this.cameras.main.width/2, this.cameras.main.height/2,
      'ಮನೆಯ ಅಂಗಳ\\nHome Courtyard', {
      fontSize: '16px', color: '#FFD700', fontFamily: 'sans-serif',
      align: 'center', backgroundColor: '#000000cc', padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.tweens.add({
      targets: title, alpha: 0, delay: 2500, duration: 800,
      onComplete: function() { title.destroy(); }
    });
  }

  createNPC(x, y, name, englishName, bodyColor, skinColor, dialogs) {
    var container = this.add.container(x, y);
    // NPC body
    var npcBody = this.add.circle(0, 2, 7, bodyColor);
    container.add(npcBody);
    if (skinColor) {
      var npcHead = this.add.circle(0, -6, 5, skinColor);
      container.add(npcHead);
    }
    // Name label
    var label = this.add.text(0, -18, name, {
      fontSize: '8px', color: '#ffffff', fontFamily: 'sans-serif',
      backgroundColor: '#00000088', padding: { x: 3, y: 1 }
    }).setOrigin(0.5);
    container.add(label);

    this.physics.add.existing(container, true);
    container.body.setSize(18, 18);
    container.body.setOffset(-9, -7);

    container.npcData = {
      kannadaName: name,
      englishName: englishName,
      dialogs: dialogs,
      currentDialog: 0
    };
    this.npcs.push(container);
    this.physics.add.collider(this.player, container);
    return container;
  }

  handleInput(data) {
    switch(data.type) {
      case 'MOVE':
        this.moveDir = { x: 0, y: 0 };
        var d = data.direction;
        if (d === 'up') this.moveDir.y = -1;
        else if (d === 'down') this.moveDir.y = 1;
        else if (d === 'left') this.moveDir.x = -1;
        else if (d === 'right') this.moveDir.x = 1;
        else if (d === 'up-left') { this.moveDir.x = -0.707; this.moveDir.y = -0.707; }
        else if (d === 'up-right') { this.moveDir.x = 0.707; this.moveDir.y = -0.707; }
        else if (d === 'down-left') { this.moveDir.x = -0.707; this.moveDir.y = 0.707; }
        else if (d === 'down-right') { this.moveDir.x = 0.707; this.moveDir.y = 0.707; }
        break;
      case 'STOP':
        this.moveDir = { x: 0, y: 0 };
        break;
      case 'ACTION':
        this.tryInteract();
        break;
    }
  }

  tryInteract() {
    if (!this.canInteract) return;
    var px = this.player.x;
    var py = this.player.y;
    var closest = null;
    var closestDist = 50;

    for (var i = 0; i < this.npcs.length; i++) {
      var npc = this.npcs[i];
      var dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
      if (dist < closestDist) {
        closest = npc;
        closestDist = dist;
      }
    }

    if (closest && closest.npcData) {
      var d = closest.npcData;
      var dialog = d.dialogs[d.currentDialog];
      sendToRN('DIALOG', {
        npc: d.englishName,
        npcKannada: d.kannadaName,
        kannada: dialog.kannada,
        english: dialog.english,
        words: dialog.words
      });
      for (var w = 0; w < dialog.words.length; w++) {
        sendToRN('WORD_LEARNED', { kannada: dialog.words[w], source: d.englishName });
      }
      d.currentDialog = (d.currentDialog + 1) % d.dialogs.length;
      this.canInteract = false;
      var self = this;
      this.time.delayedCall(800, function() { self.canInteract = true; });
    }
  }

  update() {
    if (this.player.body) {
      this.player.body.setVelocity(
        this.moveDir.x * this.playerSpeed,
        this.moveDir.y * this.playerSpeed
      );
    }

    // Check nearby NPCs
    var px = this.player.x;
    var py = this.player.y;
    var nearNPC = false;
    for (var i = 0; i < this.npcs.length; i++) {
      var dist = Phaser.Math.Distance.Between(px, py, this.npcs[i].x, this.npcs[i].y);
      if (dist < 50) {
        nearNPC = true;
        this.interactPrompt.setPosition(this.npcs[i].x, this.npcs[i].y - 30);
        this.interactPrompt.setVisible(true);
        break;
      }
    }
    if (!nearNPC) {
      this.interactPrompt.setVisible(false);
    }
  }
}

// ============================================================
// Battle Scene (stub)
// ============================================================
class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }); }
  create() {
    this.add.text(180, 270, 'ಯುದ್ಧ!', { fontSize: '24px', color: '#ff4444', fontFamily: 'sans-serif' });
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
  scene: [BootScene, Area1Scene, BattleScene],
  input: { activePointers: 0 },
  banner: false
};

var game = new Phaser.Game(config);
</script>
</body>
</html>`;
