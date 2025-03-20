export class DoorManager {
    constructor(scene) {
        this.scene = scene;
        this.door = null;
        this.isActive = false;
    }

    createDoor() {
        // Create door at the top-right platform position
        this.door = this.scene.physics.add.sprite(
            700,  // Right side of screen
            140,  // Top area
            'door'
        );
        
        // Set door properties
        this.door.setScale(0.5);
        this.isActive = true;
        
        // Make door static so it doesn't fall
        this.door.setImmovable(true);
        this.door.body.allowGravity = false;
        
        // Adjust collision box if needed
        this.door.body.setSize(
            this.door.width * 0.7,
            this.door.height * 0.9
        );

        // Show notification
        this.showDoorNotification();

        // Setup overlap with player
        this.scene.physics.add.overlap(
            this.scene.player,
            this.door,
            () => this.handleVictory(),
            null,
            this
        );
    }

    showDoorNotification() {
        const notification = this.scene.add.container(400, 100);
        notification.setDepth(100);

        const bg = this.scene.add.rectangle(0, 0, 300, 50, 0x000000, 0.7);
        bg.setStrokeStyle(2, 0xffd700);  // Gold border
        notification.add(bg);

        const text = this.scene.add.text(0, 0, 'Hurry! Reach the door', {
            fontSize: '24px',
            fill: '#ffd700',  // Gold text
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        notification.add(text);

        notification.setY(-50);

        // Slide in animation
        this.scene.tweens.add({
            targets: notification,
            y: 100,
            duration: 500,
            ease: 'Back.out',
            onComplete: () => {
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

    handleVictory() {
        if (!this.isActive) return;
        this.isActive = false;
        this.showVictoryScreen();
    }

    showVictoryScreen() {
        // Stop all game actions
        this.scene.isGameOver = true;
        this.scene.player.setVelocity(0, 0);
        this.scene.player.play('idle');

        // Create victory screen with delay for better flow
        this.scene.time.delayedCall(500, () => {
            // Dark overlay
            const overlay = this.scene.add.rectangle(0, 0, 800, 600, 0x000000, 0.7);
            overlay.setOrigin(0);
            overlay.setScrollFactor(0);
            overlay.setDepth(99);

            // Victory text
            const victoryText = this.scene.add.text(400, 250, 'VICTORY!', {
                fontSize: '64px',
                fontStyle: 'bold',
                fill: '#ffd700',  // Gold color
                stroke: '#000',
                strokeThickness: 8
            });
            victoryText.setOrigin(0.5);
            victoryText.setScrollFactor(0);
            victoryText.setDepth(100);
            victoryText.setAlpha(0);

            // Final score
            const finalScoreText = this.scene.add.text(400, 350, 
                `Final Score: ${this.scene.player.getScore()}`, {
                fontSize: '32px',
                fill: '#ffffff',
                stroke: '#000',
                strokeThickness: 4
            });
            finalScoreText.setOrigin(0.5);
            finalScoreText.setScrollFactor(0);
            finalScoreText.setDepth(100);
            finalScoreText.setAlpha(0);

            // Next round text
            const nextText = this.scene.add.text(400, 420, 'Ready for the next round?\nPress SPACE to continue', {
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center'
            });
            nextText.setOrigin(0.5);
            nextText.setScrollFactor(0);
            nextText.setDepth(100);
            nextText.setAlpha(0);

            // Fade in all texts
            this.scene.tweens.add({
                targets: [victoryText, finalScoreText, nextText],
                alpha: 1,
                duration: 1000,
                ease: 'Power1'
            });

            // Handle space bar for next round
            this.scene.input.keyboard.once('keydown-SPACE', () => {
                // Transition to next scene
                this.scene.scene.start('NextLevelScene');  // You'll need to create this scene
            });
        });
    }
} 