export class TestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TestScene' });
    }

    preload() {
        this.load.image('cover', 'assets/images/cover.jpg');
    }

    create() {
        // Add cover background
        const cover = this.add.image(400, 300, 'cover');
        cover.setDisplaySize(800, 600);

        // Add semi-transparent overlay for better text readability
        const overlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.4);
        overlay.setOrigin(0);

        // Title text with shadow
        const title = this.add.text(400, 100, 'DRAGON SAMURAI', {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(400, 200, 'Help Onimusha defeat the army of the dead\nand claim the dragon\'s treasure', {
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000',
            strokeThickness: 4
        });
        subtitle.setOrigin(0.5);

        // Controls section title
        const controlsTitle = this.add.text(400, 300, 'CONTROLS', {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: '#ffd700',
            stroke: '#000',
            strokeThickness: 4
        });
        controlsTitle.setOrigin(0.5);

        // Left column - Movement controls
        const movementControls = this.add.text(300, 350, [
            '← → : Move left/right',
            '↑ : Jump',
            'Z : Quick Attack'
        ], {
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000',
            strokeThickness: 3,
            lineSpacing: 10
        });
        movementControls.setOrigin(0.5, 0);

        // Right column - Combat controls
        const combatControls = this.add.text(500, 350, [
            'X : Strong Attack',
            'C : Block/Protect',
            'Collect rings for door'
        ], {
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000',
            strokeThickness: 3,
            lineSpacing: 10
        });
        combatControls.setOrigin(0.5, 0);

        // Objective text at the bottom with padding
        const objectiveText = this.add.text(400, 470, 'Defeat enemies to earn points', {
            fontSize: '20px',
            fill: '#ffd700',
            align: 'center',
            stroke: '#000',
            strokeThickness: 3
        });
        objectiveText.setOrigin(0.5);

        // Start game text with animation
        const startText = this.add.text(400, 520, 'Press SPACE to start', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        });
        startText.setOrigin(0.5);

        // Animate the start text
        this.tweens.add({
            targets: startText,
            alpha: 0.2,
            yoyo: true,
            repeat: -1,
            duration: 1000,
            ease: 'Sine.inOut'
        });

        // Handle game start
        const spaceKey = this.input.keyboard.addKey('SPACE');
        spaceKey.once('down', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });
    }
} 