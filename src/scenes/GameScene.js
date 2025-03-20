import { Player } from '../entities/Player.js';
import { EnemyManager } from '../managers/EnemyManager.js';
import { CollectibleManager } from '../managers/CollectibleManager.js';
import { UIManager } from '../managers/UIManager.js';
import { PlatformManager } from '../managers/PlatformManager.js';
import { ASSET_KEYS, SPRITE_CONFIG } from '../config/gameConfig.js';
import { PotionManager } from '../managers/PotionManager.js';
import { DoorManager } from '../managers/DoorManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        console.log('GameScene init');
        this.isLoaded = false;
        this.isGameOver = false;
        
        // Clear any existing keyboard events
        if (this.input && this.input.keyboard) {
            this.input.keyboard.removeAllKeys(true);
        }
        
        // Reset all managers
        this.enemyManager = null;
        this.collectibleManager = null;
        this.platformManager = null;
        this.player = null;
        this.uiManager = null;
    }

    preload() {
        console.log('GameScene preload started');

        // Show loading progress
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        // Loading text
        const loadingText = this.add.text(400, 250, 'Loading...', {
            font: '20px monospace',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);

        // Progress bar
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        // Load background
        this.load.image('ground', 'assets/images/pagoda.jpg');
        
        // Load platform assets
        const platformAssets = [
            'grass_left', 'grass', 'grass_right',
            'left_corner', 'straight', 'corner_right',
            'slope_up', 'slope_down', 'pile', 'pile1', 'cliff'
        ];

        platformAssets.forEach(asset => {
            this.load.image(asset, `assets/objects/${asset}.png`);
        });

        // Load character sprites - FIXED with correct paths and names
        this.load.spritesheet('idle', 'assets/images/samurai/Idle.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('walk', 'assets/images/samurai/Walk.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('run', 'assets/images/samurai/Run.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('attack1', 'assets/images/samurai/Attack_1.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('attack2', 'assets/images/samurai/Attack_2.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('protection', 'assets/images/samurai/Protection.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('dead', 'assets/images/samurai/Dead.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('jump', 'assets/images/samurai/Jump.png', {
            frameWidth: 128,
            frameHeight: 128
        });

        // Load coin sprites with correct naming
        for (let i = 21; i <= 30; i++) {
            this.load.image(`Gold_${i}`, `assets/Gold/Gold_${i}.png`);
        }

        // Load enemy spritesheets with correct capitalization
        const enemyTypes = ['Warrior', 'spearman', 'archer'];
        enemyTypes.forEach(type => {
            const basePath = `assets/Skeleton_${type}/`;
            
            // Load all animations with correct capitalization
            this.load.spritesheet(`${type.toLowerCase()}-idle`, `${basePath}Idle.png`, {
                frameWidth: 128,
                frameHeight: 128
            });
            this.load.spritesheet(`${type.toLowerCase()}-walk`, `${basePath}Walk.png`, {
                frameWidth: 128,
                frameHeight: 128
            });
            this.load.spritesheet(`${type.toLowerCase()}-attack1`, `${basePath}Attack_1.png`, {
                frameWidth: 128,
                frameHeight: 128
            });
            this.load.spritesheet(`${type.toLowerCase()}-attack2`, `${basePath}Attack_2.png`, {
                frameWidth: 128,
                frameHeight: 128
            });
            this.load.spritesheet(`${type.toLowerCase()}-dead`, `${basePath}Dead.png`, {
                frameWidth: 128,
                frameHeight: 128
            });
            this.load.spritesheet(`${type.toLowerCase()}-hurt`, `${basePath}Hurt.png`, {
                frameWidth: 128,
                frameHeight: 128
            });
            
            // Special case for archer using Evasion.png instead of Protect.png
            const protectFile = type.toLowerCase() === 'archer' ? 'Evasion.png' : 'Protect.png';
            this.load.spritesheet(`${type.toLowerCase()}-protect`, `${basePath}${protectFile}`, {
                frameWidth: 128,
                frameHeight: 128
            });
        });

        // Load potion and notification assets
        this.load.image('potion', 'assets/images/Bottle.png');
        this.load.image('dragon_wing', 'assets/images/dragon_wing.png');

        // Add load error handler
        this.load.on('loaderror', (file) => {
            console.error('Error loading asset:', file.key);
            console.error('File URL:', file.url);
            console.error('File type:', file.type);
        });

        // Add complete handler
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.isLoaded = true;
            console.log('All assets loaded successfully');
        });

        this.load.image('door', 'assets/images/Wide_Door_02.png');
    }

    create() {
        console.log('GameScene create started');

        // Ensure physics is active
        this.physics.world.resume();

        // Background
        const background = this.add.image(400, 300, 'ground');
        background.setDisplaySize(800, 600);
        console.log('Background created');

        try {
            // Create platform manager first
            this.platformManager = new PlatformManager(this);
            console.log('Platforms created');

            // Create player after platforms
            this.player = new Player(this, 400, 300);
            console.log('Player created');

            // Setup collisions
            this.physics.add.collider(this.player, this.platformManager.platforms);
            console.log('Basic collisions set up');

            // Create other managers
            this.enemyManager = new EnemyManager(this);
            this.collectibleManager = new CollectibleManager(this);
            this.collectibleManager.setupCollisions(
                this.platformManager.platforms,
                this.player
            );
            this.uiManager = new UIManager(this);
            console.log('All managers created');

            // Setup keyboard controls
            this.cursors = this.input.keyboard.createCursorKeys();
            console.log('Controls set up');

            // Add this to the create method
            this.input.keyboard.on('keydown-D', () => {
                console.log('Debug info:');
                console.log('Loaded textures:', this.textures.list);
                console.log('Player:', this.player);
                console.log('Platforms:', this.platformManager?.platforms);
                console.log('Enemies:', this.enemyManager?.enemies);
            });

            // Debug key
            this.input.keyboard.on('keydown-P', () => {
                console.log('Player position:', this.player.x, this.player.y);
                console.log('Player velocity:', this.player.body.velocity.x, this.player.body.velocity.y);
                console.log('Player state:', {
                    isAttacking: this.player.isAttacking,
                    isProtecting: this.player.isProtecting,
                    isJumping: this.player.isJumping
                });
            });

            // Setup proper event chain for score and health
            this.player.on('scoreChanged', (score) => {
                this.uiManager.updateScore(score);
            });

            this.player.on('healthChanged', (health) => {
                this.uiManager.updateHealth(health);
            });

            this.player.on('playerDeath', () => {
                if (this.isGameOver) return;
                this.isGameOver = true;
                this.physics.pause();
                this.uiManager.showGameOver();
            });

            // Setup enemy manager after platforms are created
            this.enemyManager.setupCollisions(this.platformManager.platforms, this.player);

            // Add enemy kill score handler
            this.events.on('enemyKilled', () => {
                this.player.collectScore(20); // Use existing method with different amount
            });

            // Create potion manager after platforms but before UI
            this.potionManager = new PotionManager(this);
            this.potionManager.setupCollisions(
                this.platformManager.platforms,
                this.player
            );

            // Create door manager after other managers
            this.doorManager = new DoorManager(this);

            // Make sure input is properly initialized
            this.cursors = this.input.keyboard.createCursorKeys();
            
            // Ensure player input is set up
            if (this.player) {
                this.player.setupEventListeners();
            }

        } catch (error) {
            console.error('Error in create:', error);
            console.error(error.stack);
        }
    }

    update() {
        if (!this.isLoaded || this.isGameOver) return;

        try {
            if (this.player && !this.player.isDead) {
                this.player.update(this.cursors);
            }
            if (this.enemyManager) {
                this.enemyManager.update(this.player);
            }
        } catch (error) {
            console.error('Error in update:', error);
        }
    }

    resetGame() {
        // Reset game state
        this.isGameOver = false;
        
        // Reset player
        this.player.setPosition(100, 450);  // Initial spawn position
        this.player.resetHealth();
        this.player.resetScore();
        
        // Clear all enemies
        this.enemyManager.reset();
        
        // Reset collectibles
        this.collectibleManager.reset();
        
        // Reset door if it exists
        if (this.doorManager.door) {
            this.doorManager.door.destroy();
            this.doorManager.isActive = false;
        }
    }
} 