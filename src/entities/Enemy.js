import { GAME_SETTINGS, SPRITE_CONFIG } from '../config/gameConfig.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, `${type}-idle`);
        
        // Add sprite to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Enemy properties
        this.type = type.toLowerCase();
        this.health = 100;
        this.isAttacking = false;
        this.isHurt = false;
        this.isDying = false;
        this.lastDamageTime = 0;
        this.attackCooldown = false;
        this.lastAttackTime = 0;
        this.hasDealtDamage = false;
        this.attackTimer = null;

        this.setupPhysics();
        this.createAnimations();
        
        // Start with idle animation
        this.play(`${this.type}-idle`);
    }

    setupPhysics() {
        this.setCollideWorldBounds(true);
        this.setBounce(0);
        this.setGravityY(300);
        
        // Set collision box size
        this.body.setSize(40, 80);
        this.body.setOffset(44, 48);
        this.body.setDrag(100, 0);
    }

    createAnimations() {
        const animations = ['idle', 'walk', 'attack1', 'attack2', 'dead', 'protect', 'hurt'];
        const { frameWidth, frameHeight } = SPRITE_CONFIG.enemy;

        animations.forEach(anim => {
            if (!this.scene.anims.exists(`${this.type}-${anim}`)) {
                this.scene.anims.create({
                    key: `${this.type}-${anim}`,
                    frames: this.scene.anims.generateFrameNumbers(
                        `${this.type}-${anim}`,
                        { frameWidth, frameHeight }
                    ),
                    frameRate: anim.includes('attack') ? 15 : 10,
                    repeat: anim === 'idle' || anim === 'walk' ? -1 : 0
                });
            }
        });
    }

    update(player) {
        if (this.isDying || !this.active) return;

        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y,
            player.x, player.y
        );

        // Always face the player
        this.setFlipX(this.x > player.x);

        // Adjust attack distance based on enemy type
        let attackDistance = GAME_SETTINGS.enemyBehavior.attackDistance;
        if (this.type === 'archer') {
            attackDistance *= 1.5; // Archers attack from further away
        }

        if (distanceToPlayer < GAME_SETTINGS.enemyBehavior.detectionRange) {
            if (distanceToPlayer < attackDistance && 
                !this.isAttacking && !this.isHurt && this.body.touching.down && 
                !this.attackCooldown) {
                
                console.log(`${this.type} starts attack`);
                this.isAttacking = true;
                this.attackCooldown = true;
                this.hasDealtDamage = false;  // Reset at start of attack

                // Attack animation
                this.play(`${this.type}-attack1`, true);

                // Reset attack state after animation
                this.once('animationcomplete', () => {
                    console.log(`${this.type} attack complete`);
                    this.isAttacking = false;
                    this.hasDealtDamage = false;
                    
                    // Add cooldown before next attack
                    this.scene.time.delayedCall(500, () => {
                        this.attackCooldown = false;
                    });
                });
            } else if (!this.isAttacking && !this.isHurt && this.body.touching.down) {
                const approachSpeed = GAME_SETTINGS.enemyBehavior.approachSpeed;
                const direction = player.x < this.x ? -1 : 1;
                
                this.setFlipX(direction === -1);

                // More aggressive following behavior
                if (distanceToPlayer > 100) {  // Reduced distance threshold
                    // Faster approach
                    this.setVelocityX(approachSpeed * 1.2 * direction);  // 20% faster
                    this.play(`${this.type}-walk`, true);
                } else if (distanceToPlayer < 50) {  // Closer engagement range
                    this.setVelocityX(-approachSpeed * direction);
                    this.play(`${this.type}-walk`, true);
                } else {
                    this.setVelocityX(0);
                    this.play(`${this.type}-idle`, true);
                }
            }
        } else {
            // More aggressive chase when player is far
            const direction = player.x < this.x ? -1 : 1;
            this.setVelocityX(GAME_SETTINGS.enemyBehavior.approachSpeed * direction);
            this.play(`${this.type}-walk`, true);
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
        // Log attack frames
        if (this.isAttacking && this.anims.currentAnim?.key.includes('attack')) {
            console.log('Attack frame:', this.anims.currentFrame?.index);
        }
    }

    takeDamage(amount) {
        if (this.isDying || this.isHurt) return;

        this.isHurt = true;
        this.health -= amount;

        if (this.health <= 0) {
            this.die();
        } else {
            this.playDamageAnimation();
        }
    }

    die() {
        this.isDying = true;
        this.setVelocity(0, 0);
        this.play(`${this.type}-dead`);
        
        this.once('animationcomplete', () => {
            this.emit('enemyDeath', this);
            this.destroy();
        });
    }

    playDamageAnimation() {
        this.play(`${this.type}-hurt`);
        this.setTint(0xff0000);
        
        this.scene.time.delayedCall(500, () => {
            if (this.active) {
                this.clearTint();
                this.isHurt = false;
            }
        });
    }

    canDealDamage() {
        // Simplified damage check
        return this.isAttacking && 
               this.anims.currentAnim &&
               this.anims.currentAnim.key.includes('attack') &&
               this.anims.currentFrame &&
               this.anims.currentFrame.index >= 2 && 
               this.anims.currentFrame.index <= 6;
    }
} 