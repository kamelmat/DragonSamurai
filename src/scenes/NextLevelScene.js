export class NextLevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'NextLevelScene' });
    }

    create() {
        // Create dark overlay
        const overlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.7);
        overlay.setOrigin(0);
        overlay.setScrollFactor(0);
        overlay.setDepth(99);

        // Victory text
        const victoryText = this.add.text(400, 200, 'VICTORY!', {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#ffd700',  // Gold color
            stroke: '#000',
            strokeThickness: 8
        });
        victoryText.setOrigin(0.5);
        victoryText.setScrollFactor(0);
        victoryText.setDepth(100);

        // Level complete text
        const completeText = this.add.text(400, 300, 'Level Complete!', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        });
        completeText.setOrigin(0.5);

        // Next level text
        const nextText = this.add.text(400, 400, 'Press SPACE to play again', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        });
        nextText.setOrigin(0.5);

        // Animate the space text
        this.tweens.add({
            targets: nextText,
            alpha: 0.2,
            yoyo: true,
            repeat: -1,
            duration: 1000,
            ease: 'Sine.inOut'
        });

        // Use the same reload approach as game over
        this.input.keyboard.once('keydown-SPACE', () => {
            window.location.reload();
        });
    }
} 