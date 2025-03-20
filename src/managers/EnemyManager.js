import { GAME_SETTINGS, SPRITE_CONFIG } from '../config/gameConfig.js';
import { Enemy } from '../entities/Enemy.js';

export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.physics.add.group();
        this.activeEnemies = new Set();
        this.isGameOver = false;
        this.isSpawning = false;
        
        // Start initial spawn cycle
        this.scene.time.delayedCall(1000, () => this.startSpawnCycle(), [], this);
    }

    preload() {
        // We'll handle enemy loading in GameScene
    }

    startSpawnCycle() {
        if (!this.isSpawning) {
            this.isSpawning = true;
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        if (this.isGameOver || this.activeEnemies.size >= GAME_SETTINGS.maxEnemies) {
            this.isSpawning = false;
            return;
        }

        const x = Phaser.Math.Between(100, 700);
        const y = 0;
        const type = GAME_SETTINGS.enemyTypes[Math.floor(Math.random() * GAME_SETTINGS.enemyTypes.length)];
        
        const enemy = new Enemy(this.scene, x, y, type);
        this.enemies.add(enemy);
        this.activeEnemies.add(enemy);

        enemy.setCollideWorldBounds(true);
        enemy.setBounce(0.2);
        enemy.setGravityY(300);
        enemy.setDragX(100);

        enemy.on('enemyDeath', (enemy) => {
            this.handleEnemyDeath(enemy);
            this.scene.events.emit('scoreChanged', GAME_SETTINGS.enemyKillScore);
        });

        // Schedule next spawn if not at max
        if (this.activeEnemies.size < GAME_SETTINGS.maxEnemies) {
            this.scene.time.delayedCall(2000, () => {
                if (!this.isGameOver) {
                    this.spawnEnemy();
                }
            });
        } else {
            this.isSpawning = false;
        }
    }

    handleCollision(player, enemy) {
        if (enemy.isDying) return;

        if (player.isAttacking) {
            const isEnemyInFront = player.flipX ? 
                (enemy.x < player.x) : 
                (enemy.x > player.x);

            if (isEnemyInFront) {
                enemy.takeDamage(50);
                if (enemy.health <= 0) {
                    player.collectScore(20);
                }
            }
        } 
        // Enemy attack check
        else if (enemy.isAttacking) {
            // Check if enemy can deal damage
            if (enemy.anims.currentAnim?.key.includes('attack') && 
                enemy.anims.currentFrame?.index >= 2 && 
                enemy.anims.currentFrame?.index <= 6 && 
                !player.isProtecting && 
                !enemy.hasDealtDamage) {  // Add check for hasDealtDamage
                
                player.takeDamage(20);
                enemy.hasDealtDamage = true;  // Set flag after dealing damage

                // Reset hasDealtDamage after a short delay
                enemy.scene.time.delayedCall(300, () => {
                    enemy.hasDealtDamage = false;
                });
            }
        }
    }

    handleEnemyDeath(enemy) {
        this.activeEnemies.delete(enemy);
        
        // If we're not currently in a spawn cycle and below max, start a new spawn after delay
        if (!this.isSpawning && this.activeEnemies.size < GAME_SETTINGS.maxEnemies) {
            this.scene.time.delayedCall(3000, () => {
                if (!this.isGameOver) {
                    this.startSpawnCycle();
                }
            });
        }
    }

    update(player) {
        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.active) {
                enemy.update(player);
            }
        });
    }

    setupCollisions(platforms, player) {
        // Add collision with platforms
        this.scene.physics.add.collider(this.enemies, platforms);

        // Check overlap every frame
        this.scene.physics.add.overlap(
            player,
            this.enemies,
            (player, enemy) => this.handleCollision(player, enemy),
            null,
            this
        );
    }

    reset() {
        this.enemies.clear(true, true);  // Destroys all enemies
        this.isSpawning = false;
        this.startSpawnCycle();  // Restart enemy spawning
    }

    setGameOver(value) {
        this.isGameOver = value;
        if (value) {
            this.enemies.children.iterate(enemy => {
                if (enemy && enemy.body) {
                    enemy.body.setVelocity(0, 0);
                    enemy.body.setAllowGravity(false);
                }
            });
        }
    }
} 