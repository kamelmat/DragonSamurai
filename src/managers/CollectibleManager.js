import { GAME_SETTINGS, PLATFORM_POSITIONS } from '../config/gameConfig.js';

export class CollectibleManager {
    constructor(scene) {
        this.scene = scene;
        this.rings = scene.physics.add.group({
            gravityY: 300,
            bounceY: 0.2
        });
        
        this.createAnimations();
        this.createRings();
    }

    createAnimations() {
        // Create the coin spinning animation
        const coinFrames = [];
        for (let i = 21; i <= 30; i++) {
            coinFrames.push({ key: `Gold_${i}` });
        }
        
        if (!this.scene.anims.exists('coin-spin')) {
            this.scene.anims.create({
                key: 'coin-spin',
                frames: coinFrames,
                frameRate: 15,
                repeat: -1
            });
        }
    }

    createRings() {
        // Add rings above platforms
        PLATFORM_POSITIONS.forEach(pos => {
            // Add 3 rings above each platform
            for (let i = 0; i < 3; i++) {
                const ring = this.rings.create(
                    pos.x + (i * 40) + 40,  // Spaced out rings
                    pos.y - 50,             // Above platform
                    'Gold_21'               // Initial frame
                );
                this.setupRing(ring);
            }
        });

        // Add some rings floating between platforms
        [
            {x: 200, y: 200},
            {x: 400, y: 150},
            {x: 600, y: 300},
            {x: 300, y: 350},
            {x: 500, y: 250}
        ].forEach(pos => {
            const ring = this.rings.create(pos.x, pos.y, 'Gold_21');
            this.setupRing(ring);
        });
    }

    setupRing(ring) {
        ring.setScale(0.05);
        ring.setBounce(0.2);
        ring.setCollideWorldBounds(true);
        ring.play('coin-spin');
    }

    setupCollisions(platforms, player) {
        this.scene.physics.add.collider(this.rings, platforms);
        this.scene.physics.add.overlap(
            player, 
            this.rings, 
            this.handleCollection, 
            null, 
            this
        );
    }

    handleCollection(player, ring) {
        console.log('Ring collected!');  // Debug log
        ring.destroy();
        player.collectRing();  // Direct call to player's collectRing method
        
        // Check if all rings are collected
        if (this.rings.countActive() === 0) {
            this.scene.doorManager.createDoor();
        }
    }

    reset() {
        this.rings.clear(true, true);  // Destroys all rings
        this.createRings();  // Recreate initial rings
    }
} 