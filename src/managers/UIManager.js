import { GAME_SETTINGS, UI_CONFIG } from '../config/gameConfig.js';

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.isGameOver = false;
        
        this.createHealthBar();
        this.createScoreText();
    }

    createHealthBar() {
        const { healthBar } = UI_CONFIG;
        
        this.healthBar = this.scene.add.rectangle(
            healthBar.x,
            healthBar.y,
            healthBar.width,
            healthBar.height,
            healthBar.color
        );
        this.healthBar.setScrollFactor(0);
        this.healthBar.setOrigin(0, 0);
        
        this.healthText = this.scene.add.text(
            healthBar.x,
            healthBar.y + 25,
            `Health: ${GAME_SETTINGS.playerHealth}`,
            {
                fontSize: '20px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.healthText.setScrollFactor(0);
    }

    createScoreText() {
        const { scoreText } = UI_CONFIG;
        
        this.scoreText = this.scene.add.text(
            scoreText.x,
            scoreText.y,
            'Score: 0',
            scoreText.style
        );
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(100);
    }

    updateHealth(health) {
        const percentage = Math.max(0, health) / GAME_SETTINGS.playerHealth;
        this.healthBar.width = UI_CONFIG.healthBar.width * percentage;
        this.healthText.setText(`Health: ${Math.max(0, health)}`);

        if (health <= 0) {
            this.showGameOver();
        }
    }

    updateScore(score) {
        this.score = score;
        this.scoreText.setText('Score: ' + score);
    }

    showGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.scene.time.delayedCall(3000, () => {
            // Create dark overlay
            const overlay = this.scene.add.rectangle(
                0, 0, 
                this.scene.game.config.width,
                this.scene.game.config.height,
                0x000000, 0.7
            );
            overlay.setOrigin(0);
            overlay.setScrollFactor(0);
            overlay.setDepth(99);

            // Game Over text
            const gameOverText = this.scene.add.text(400, 250, 'GAME OVER', {
                fontSize: '64px',
                fontStyle: 'bold',
                fill: '#ff0000',
                stroke: '#000',
                strokeThickness: 8
            });
            gameOverText.setOrigin(0.5);
            gameOverText.setScrollFactor(0);
            gameOverText.setDepth(100);

            // Final score text
            const finalScoreText = this.scene.add.text(400, 350, 
                `Final Score: ${this.scene.player.getScore()}`, {
                fontSize: '32px',
                fill: '#ffffff'
            });
            finalScoreText.setOrigin(0.5);
            finalScoreText.setScrollFactor(0);
            finalScoreText.setDepth(100);

            // Restart text
            const restartText = this.scene.add.text(400, 420, 'Press SPACE to restart', {
                fontSize: '24px',
                fill: '#ffffff'
            });
            restartText.setOrigin(0.5);
            restartText.setScrollFactor(0);
            restartText.setDepth(100);

            this.scene.input.keyboard.once('keydown-SPACE', () => {
                // Completely restart the game
                window.location.reload();
            });
        });
    }

    reset() {
        this.score = 0;
        this.isGameOver = false;
        this.updateScore(0);
        this.updateHealth(GAME_SETTINGS.playerHealth);
    }

    getScore() {
        return this.score;
    }
} 