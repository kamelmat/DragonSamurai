import { GAME_SETTINGS, PLATFORM_POSITIONS } from '../config/gameConfig.js';

export class PotionManager {
    constructor(scene) {
        this.scene = scene;
        this.potions = scene.physics.add.group();
        this.createPotions();
    }

    createPotions() {
        // Get specific platforms (4th and 6th from PLATFORM_POSITIONS)
        const platformPositions = [
            PLATFORM_POSITIONS[3],  // 4th platform
            PLATFORM_POSITIONS[5]   // 6th platform
        ];
        
        platformPositions.forEach(platform => {
            const potion = this.potions.create(
                platform.x + (platform.length * 16) / 2,  // Center of platform
                platform.y - 25,  // Slightly above platform
                'potion'
            );
            this.setupPotion(potion);
        });
    }

    setupPotion(potion) {
        potion.setScale(0.3);  // Reduced to 1/3 of previous size (was 0.5)
        potion.setBounce(0.2);
        potion.setCollideWorldBounds(true);
    }

    setupCollisions(platforms, player) { 
        this.scene.physics.add.collider(this.potions, platforms);
        this.scene.physics.add.overlap(
            player,
            this.potions,
            this.handleCollection,
            null,
            this
        );
    }

    handleCollection(player, potion) {
        potion.destroy();
        player.increaseHealth(40);
        this.showNotification();
    }

    showNotification() {
        // Create notification container
        const notification = this.scene.add.container(400, 100);
        notification.setDepth(100);  // Ensure it's above other elements

        // Add semi-transparent background
        const bg = this.scene.add.rectangle(0, 0, 400, 60, 0x000000, 0.7);
        bg.setStrokeStyle(2, 0xff0000);  // Red border
        notification.add(bg);

        // Add dragon wing icon
        const icon = this.scene.add.image(130, 0, 'dragon_wing');
        icon.setScale(0.8);  // Adjust scale as needed
        notification.add(icon);

        // Add text
        const text = this.scene.add.text(-60, 0, 'Dragon Wing potion collected,\nhealth increased', {
            fontSize: '20px',
            fill: '#ff0000',
            fontStyle: 'bold',
            align: 'center'
        });
        text.setOrigin(0.5);
        notification.add(text);

        // Start with notification above screen
        notification.setY(-50);

        // Slide in animation
        this.scene.tweens.add({
            targets: notification,
            y: 100,
            duration: 500,
            ease: 'Back.out',
            onComplete: () => {
                // Wait and slide out
                this.scene.time.delayedCall(2000, () => {
                    this.scene.tweens.add({
                        targets: notification,
                        y: -50,
                        duration: 500,
                        ease: 'Back.in',
                        onComplete: () => {
                            notification.destroy();
                        }
                    });
                });
            }
        });
    }

    reset() {
        this.potions.clear(true, true);
        this.createPotions();
    }
} 