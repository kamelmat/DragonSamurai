import { GAME_SETTINGS, PLATFORM_POSITIONS } from '../config/gameConfig.js';

export class PlatformManager {
    constructor(scene) {
        this.scene = scene;
        this.platforms = scene.physics.add.staticGroup();
        this.createPlatforms();
    }

    createPlatforms() {
        // Create ground platform (bottom)
        this.createGroundPlatform();
        
        // Create elevated platforms
        PLATFORM_POSITIONS.forEach(pos => {
            this.createElevatedPlatform(pos);
        });
    }

    createGroundPlatform() {
        let x = 0;
        const platformWidth = 16;
        const groundY = 580;
        const { platformScale, platformCollision } = GAME_SETTINGS;

        // Create left corner
        const groundLeft = this.platforms.create(x, groundY, 'grass_left');
        this.setupPlatformPhysics(groundLeft, platformScale);
        x += platformWidth;

        // Create middle pieces
        for (let i = 0; i < 30; i++) {
            const groundPiece = this.platforms.create(x, groundY, 'grass');
            this.setupPlatformPhysics(groundPiece, platformScale);
            x += platformWidth;
        }

        // Create right corner
        const groundRight = this.platforms.create(x, groundY, 'grass_right');
        this.setupPlatformPhysics(groundRight, platformScale);
    }

    createElevatedPlatform({ x, y, length }) {
        const platformWidth = 16;
        const { platformScale } = GAME_SETTINGS;

        // Create left corner
        const platformLeft = this.platforms.create(x, y, 'left_corner');
        this.setupPlatformPhysics(platformLeft, platformScale);
        x += platformWidth;

        // Create middle pieces
        for (let i = 0; i < length; i++) {
            const platformPiece = this.platforms.create(x, y, 'straight');
            this.setupPlatformPhysics(platformPiece, platformScale);
            x += platformWidth;
        }

        // Create right corner
        const platformRight = this.platforms.create(x, y, 'corner_right');
        this.setupPlatformPhysics(platformRight, platformScale);
    }

    setupPlatformPhysics(platform, scale) {
        const { heightRatio, offset } = GAME_SETTINGS.platformCollision;
        
        platform.setScale(scale);
        platform.refreshBody();
        
        // Set collision box size and position
        platform.body.setSize(platform.width, platform.height * heightRatio);
        platform.body.setOffset(offset.x, offset.y);
        platform.refreshBody();
    }

    reset() {
        this.platforms.clear(true, true);
        this.createPlatforms();
    }
} 