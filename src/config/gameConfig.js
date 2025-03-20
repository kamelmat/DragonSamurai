import { GameScene } from '../scenes/GameScene.js';
import { NextLevelScene } from '../scenes/NextLevelScene.js';
import { TestScene } from '../scenes/TestScene.js';

// Game configuration constants
export const GAME_SETTINGS = {
    // Player settings
    playerHealth: 100,
    playerSpeed: {
        walk: 100,
        run: 200,
        jump: -350
    },
    playerCollision: {
        normalWidth: 40,
        normalHeight: 80,
        attackWidth: 80,
        attackHeight: 80,
        defaultOffset: { x: 44, y: 48 },
        attackOffset: {
            left: { x: 24, y: 48 },
            right: { x: 44, y: 48 }
        }
    },
    playerPhysics: {
        gravity: 300,
        drag: 100,
        bounce: 0
    },

    // Enemy settings
    maxEnemies: 5,
    enemySpawnDelay: 4000,
    enemyTypes: ['warrior', 'spearman', 'archer'],
    enemyHealth: 100,
    enemyDamage: 20,
    enemyBehavior: {
        attackDistance: 100,
        idealAttackDistance: 80,
        detectionRange: 300,
        approachSpeed: 80,
        adjustmentSpeed: 60,
        attackCooldown: 500,
        damagePerHit: 20
    },
    enemyCollision: {
        width: 40,
        height: 80,
        offset: { x: 44, y: 48 }
    },

    // Platform settings
    platformScale: 0.25,
    platformCollision: {
        heightRatio: 0.2,
        offset: { x: 0, y: 0 }
    },

    // Collectible settings
    ringValue: 10,
    ringPhysics: {
        gravity: 300,
        bounce: 0.2,
        scale: 0.05
    },
    ringPositions: [
        {x: 200, y: 200},
        {x: 400, y: 150},
        {x: 600, y: 300},
        {x: 300, y: 350},
        {x: 500, y: 250}
    ],
    enemyKillScore: 50,

    // Update score values
    scoreValues: {
        ring: 10,
        enemyKill: 20
    },

    potions: {
        healAmount: 40,
        scale: 0.5,
        bounce: 0.2
    },

    enemySpawning: {
        maxEnemies: 5,
        initialDelay: 1000,
        respawnDelay: 3000,
    },
};

// Asset configurations
export const ASSET_KEYS = {
    background: 'ground',
    platforms: [
        'grass_left', 'grass', 'grass_right',
        'left_corner', 'straight', 'corner_right',
        'slope_up', 'slope_down', 'pile', 'pile1', 'cliff'
    ],
    animations: {
        player: ['idle', 'walk', 'run', 'attack1', 'attack2', 'protection', 'dead', 'jump'],
        enemy: ['idle', 'walk', 'attack1', 'attack2', 'dead', 'protect', 'hurt']
    },
    rings: Array.from({length: 10}, (_, i) => `Gold_${i + 21}`),
    potion: 'potion'
};

// Sprite configurations
export const SPRITE_CONFIG = {
    player: {
        frameWidth: 128,
        frameHeight: 128,
        basePath: 'assets/images/samurai/'
    },
    enemy: {
        frameWidth: 128,
        frameHeight: 128,
        scale: 1,
        animations: {
            idle: { frameRate: 10, repeat: -1 },
            walk: { frameRate: 10, repeat: -1 },
            attack1: { frameRate: 15, repeat: 0 },
            attack2: { frameRate: 15, repeat: 0 },
            dead: { frameRate: 10, repeat: 0 },
            protect: { frameRate: 10, repeat: 0 },
            hurt: { frameRate: 10, repeat: 0 }
        }
    }
};

// Game configuration
export const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    // Start with TestScene, then can move to GameScene and NextLevelScene
    scene: [TestScene, GameScene, NextLevelScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container'
    },
    pixelArt: true
};

// UI configurations
export const UI_CONFIG = {
    healthBar: {
        x: 650,
        y: 20,
        width: 200,
        height: 20,
        color: 0x00ff00
    },
    scoreText: {
        x: 16,
        y: 16,
        style: {
            fontSize: '32px',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold',
            backgroundColor: '#00000088'
        }
    },
    gameOver: {
        overlay: {
            color: 0x000000,
            alpha: 0.7
        },
        text: {
            main: {
                fontSize: '64px',
                fontStyle: 'bold',
                fill: '#ff0000',
                stroke: '#000',
                strokeThickness: 8
            },
            score: {
                fontSize: '32px',
                fill: '#ffffff',
                stroke: '#000',
                strokeThickness: 4
            },
            restart: {
                fontSize: '24px',
                fill: '#ffffff'
            }
        }
    }
};

// Platform positions configuration
export const PLATFORM_POSITIONS = [
    { x: 500, y: 500, length: 10 },
    { x: 650, y: 420, length: 8 },
    { x: 250, y: 450, length: 8 },
    { x: 50, y: 370, length: 8 },
    { x: 300, y: 300, length: 12 },
    { x: 600, y: 215, length: 9 }
]; 