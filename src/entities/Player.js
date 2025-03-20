import { GAME_SETTINGS, SPRITE_CONFIG } from '../config/gameConfig.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'idle');
        
        // Add sprite to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Create cursor keys
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys({
            attack1: 'Z',
            attack2: 'X',
            protect: 'C'
        });

        // Player state
        this.health = 100;  // Make sure health starts at 100
        this.isAttacking = false;
        this.isProtecting = false;
        this.isJumping = false;
        this.score = 0;
        this.isDead = false;
        
        this.setupPhysics();
        this.createAnimations();
        this.setupEventListeners();

        // Start with idle animation
        this.play('idle');
    }

    setupPhysics() {
        const { playerCollision } = GAME_SETTINGS;
        
        this.setCollideWorldBounds(true);
        this.setBounce(0);  // No bounce for player
        this.setDrag(100);
        this.setGravityY(300);
        
        // Fixed collision box size
        this.body.setSize(playerCollision.normalWidth, playerCollision.normalHeight);
        this.body.setOffset(playerCollision.defaultOffset.x, playerCollision.defaultOffset.y);
    }

    createAnimations() {
        const anims = [
            { key: 'idle', spriteKey: 'idle', frameRate: 10, repeat: -1 },
            { key: 'walk', spriteKey: 'walk', frameRate: 10, repeat: -1 },
            { key: 'run', spriteKey: 'run', frameRate: 15, repeat: -1 },
            { key: 'jump', spriteKey: 'jump', frameRate: 10, repeat: 0 },
            { key: 'attack1', spriteKey: 'attack1', frameRate: 15, repeat: 0 },
            { key: 'attack2', spriteKey: 'attack2', frameRate: 15, repeat: 0 },
            { key: 'protection', spriteKey: 'protection', frameRate: 10, repeat: 0 },
            { key: 'dead', spriteKey: 'dead', frameRate: 10, repeat: 0 }
        ];

        anims.forEach(anim => {
            if (!this.scene.anims.exists(anim.key)) {
                this.scene.anims.create({
                    key: anim.key,
                    frames: this.scene.anims.generateFrameNumbers(anim.spriteKey),
                    frameRate: anim.frameRate,
                    repeat: anim.repeat
                });
            }
        });
    }

    setupEventListeners() {
        // Recreate cursor keys
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.keys = this.scene.input.keyboard.addKeys({
            attack1: 'Z',
            attack2: 'X',
            protect: 'C'
        });

        this.on('animationcomplete', (animation) => {
            if (animation.key === 'attack1' || animation.key === 'attack2') {
                this.isAttacking = false;
                this.adjustCollisionBox(false);
            } else if (animation.key === 'protection') {
                // Don't automatically reset protection here
                // Let it be controlled by key release instead
            } else if (animation.key === 'jump') {
                this.isJumping = false;
            }
        });
    }

    adjustCollisionBox(isAttacking) {
        if (!this.body) return;

        const { playerCollision } = GAME_SETTINGS;

        if (isAttacking) {
            const offset = this.flipX ? 
                playerCollision.attackOffset.left :
                playerCollision.attackOffset.right;

            this.body.setSize(playerCollision.attackWidth, playerCollision.attackHeight);
            this.body.setOffset(offset.x, offset.y);
        } else {
            this.body.setSize(playerCollision.normalWidth, playerCollision.normalHeight);
            this.body.setOffset(playerCollision.defaultOffset.x, playerCollision.defaultOffset.y);
        }
    }

    takeDamage(amount) {
        if (this.isProtecting || this.isDead) {
            console.log('Damage prevented - protecting or dead');
            return;
        }
        
        console.log('Player taking damage:', amount, 'Current health:', this.health);
        this.health = Math.max(0, this.health - amount);
        console.log('Health after damage:', this.health);
        this.emit('healthChanged', this.health);

        // Visual feedback
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint();
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.body.setVelocity(0, 0);
        this.body.setAllowGravity(false);
        this.play('dead');
        
        // Emit death event after animation completes
        this.once('animationcomplete', () => {
            this.emit('playerDeath');
        });
    }

    update(cursors) {
        if (!this.active || this.isDead) return;

        const keys = this.scene.input.keyboard.addKeys('Z,X,C');

        // Handle protection first
        if (keys.C.isDown && !this.isAttacking && !this.isJumping) {
            if (!this.isProtecting) {
                this.isProtecting = true;
                this.setVelocityX(0);  // Stop movement while protecting
                this.play('protection', true);
            }
            return;  // Exit early if protecting
        }

        // Reset protection when key is released
        if (keys.C.isUp && this.isProtecting) {
            this.isProtecting = false;
            // Only play idle if we're not doing something else
            if (!this.isAttacking && !this.isJumping) {
                this.play('idle', true);
            }
        }

        // Handle movement only if not protecting or attacking
        if (!this.isProtecting && !this.isAttacking) {
            if (cursors.left.isDown) {
                this.setVelocityX(-GAME_SETTINGS.playerSpeed.walk);
                this.setFlipX(true);
                this.adjustCollisionBox(false);
            } else if (cursors.right.isDown) {
                this.setVelocityX(GAME_SETTINGS.playerSpeed.walk);
                this.setFlipX(false);
                this.adjustCollisionBox(false);
            } else {
                this.setVelocityX(0);
            }
        }

        // Handle attacks
        if (!this.isAttacking && !this.isProtecting) {
            if (keys.Z.isDown || keys.X.isDown) {
                this.isAttacking = true;
                this.adjustCollisionBox(true);
                this.play(keys.Z.isDown ? 'attack1' : 'attack2', true);
            }
        }

        // Handle jumping
        if (cursors.up.isDown && this.body.touching.down && !this.isJumping && !this.isProtecting) {
            this.setVelocityY(GAME_SETTINGS.playerSpeed.jump);
            this.isJumping = true;
            if (!this.isAttacking) {
                this.play('jump', true);
            }
        }

        // Handle animations based on state
        if (!this.isAttacking && !this.isProtecting && !this.isJumping) {
            if (this.body.touching.down) {
                if (cursors.left.isDown || cursors.right.isDown) {
                    const isRunning = cursors.shift.isDown;
                    const animation = isRunning ? 'run' : 'walk';
                    const speed = isRunning ? 
                        GAME_SETTINGS.playerSpeed.run : 
                        GAME_SETTINGS.playerSpeed.walk;
                    this.setVelocityX(cursors.left.isDown ? -speed : speed);
                    this.play(animation, true);
                } else {
                    this.play('idle', true);
                }
            }
        }

        // Reset jumping state when landing
        if (this.body.touching.down) {
            this.isJumping = false;
        }

        // Prevent sliding when attacking or protecting
        if (this.isAttacking || this.isProtecting) {
            this.setVelocityX(0);
        }
    }

    collectScore(points) {
        this.score += points;
        this.emit('scoreChanged', this.score);
    }

    collectRing() {
        this.score += 10;
        this.emit('scoreChanged', this.score);
    }

    getScore() {
        return this.score;
    }

    reset() {
        this.health = GAME_SETTINGS.playerHealth;
        this.score = 0;
        this.isDead = false;
        this.isAttacking = false;
        this.isProtecting = false;
        this.isJumping = false;
    }

    increaseHealth(amount) {
        this.health = Math.min(GAME_SETTINGS.playerHealth, this.health + amount);
        this.emit('healthChanged', this.health);
        
        // Visual feedback
        this.setTint(0x00ff00);  // Green tint for healing
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint();
        });
    }

    resetHealth() {
        this.health = 100;
        this.isDead = false;
    }

    resetScore() {
        this.score = 0;
    }
} 