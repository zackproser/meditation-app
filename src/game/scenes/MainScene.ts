import * as Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    private trees: Phaser.GameObjects.Graphics[] = [];
    private leaves: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private buddha: Phaser.GameObjects.Graphics | null = null;
    private bgMusic: Phaser.Sound.BaseSound | null = null;
    private background: Phaser.GameObjects.Image | null = null;
    private windStreaks: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private sunbeams: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Load background image
        this.load.image('background', '/assets/buddha.webp');
        
        // Load audio assets
        this.load.audio('meditation-music', '/assets/meditation-music.mp3');
        this.load.audio('chime', '/assets/chime.mp3');
    }

    create() {
        // Add background image
        this.background = this.add.image(400, 300, 'background');
        
        // Fit background to game size while maintaining aspect ratio
        this.background.setDisplaySize(800, 600);
        
        // Create other elements on top of background
        this.createPond();
        this.createTrees();
        this.createLeaves();
        this.createWindStreaks();
        this.createSunbeams();

        // Initialize background music (if you have it)
        // this.bgMusic = this.sound.add('meditation-music', {
        //     loop: true,
        //     volume: 0.5
        // });
    }

    private createSky() {
        const sky = this.add.graphics();
        
        // Create gradient effect manually by drawing rectangles with decreasing alpha
        const totalHeight = 600;
        const steps = 20;
        const stepHeight = totalHeight / steps;
        
        // Top color (darker)
        const topColor = 0x1a1a2e;
        // Bottom color (lighter)
        const bottomColor = 0x4a546b;
        
        for (let i = 0; i < steps; i++) {
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(topColor),
                Phaser.Display.Color.ValueToColor(bottomColor),
                steps,
                i
            );
            
            sky.fillStyle(color.color, 1);
            sky.fillRect(0, i * stepHeight, 800, stepHeight + 1);
        }
    }

    private createGround() {
        const ground = this.add.graphics();
        ground.fillStyle(0x2d3436);
        ground.beginPath();
        ground.moveTo(0, 500);
        
        // Create gentle curves for the ground
        let x = 0;
        while (x < 800) {
            ground.lineTo(x, 500 + Math.sin(x/200) * 20);
            x += 10;
        }
        ground.lineTo(800, 600);
        ground.lineTo(0, 600);
        ground.closePath();
        ground.fill();
    }

    private createPond() {
        const pond = this.add.graphics();
        pond.fillStyle(0x34495e, 0.5);
        pond.fillEllipse(400, 500, 200, 60);

        // Add shimmer animation
        this.tweens.add({
            targets: pond,
            alpha: 0.3,
            duration: 2000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    private createBuddha() {
        const buddha = this.add.graphics();
        
        // Simple buddha silhouette
        buddha.fillStyle(0x2c3e50);
        
        // Head
        buddha.fillCircle(400, 250, 20);
        
        // Body
        buddha.fillRoundedRect(370, 270, 60, 80, 20);
        
        // Base
        buddha.fillEllipse(400, 370, 100, 30);

        this.buddha = buddha;
    }

    private createTrees() {
        const positions = [[200, 450], [600, 450], [150, 500], [650, 500]];
        
        positions.forEach(([x, y]) => {
            const tree = this.add.graphics();
            
            // Tree trunk
            tree.fillStyle(0x2d3436);
            tree.fillRect(x - 5, y - 60, 10, 60);
            
            // Tree foliage
            tree.fillStyle(0x2d3436);
            tree.fillCircle(x, y - 70, 25);
            
            this.tweens.add({
                targets: tree,
                angle: 2,
                duration: 2000 + Math.random() * 1000,
                ease: 'Sine.inOut',
                yoyo: true,
                repeat: -1
            });
            
            this.trees.push(tree);
        });
    }

    private createLeaves() {
        const leafColors = [
            0x2d5a27,  // Dark green
            0x3a7a40,  // Medium green
            0x4d8b31,  // Forest green
            0x68a357,  // Sage green
            0x8ab77d   // Light green
        ];
        
        leafColors.forEach((color, index) => {
            const leaf = this.add.graphics();
            leaf.clear();
            
            // Draw a more leaf-like shape
            leaf.fillStyle(color, 0.9);
            leaf.lineStyle(1, color, 0.9);
            
            // Use proper curve commands
            leaf.beginPath();
            leaf.moveTo(9, 0);
            // Use proper curve method here - need to verify exact method name
            // from Phaser.GameObjects.Graphics documentation
            
            leaf.closePath();
            leaf.fill();
            leaf.stroke();
            
            // Add a stem
            leaf.fillStyle(0x2d3436, 0.9);  // Dark color for stem
            leaf.fillRect(8, 16, 2, 4);
            
            leaf.generateTexture(`leaf${index}`, 18, 22);
            leaf.destroy();
        });

        // Create particle emitter
        this.leaves = this.add.particles(400, 300, 'leaf0', {
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(-50, 50, 900, 350),
                quantity: 1,
                stepRate: 0,
                yoyo: false
            },
            quantity: 2,
            frequency: 500,
            lifespan: 6000,
            gravityY: 2,
            scale: { start: 1.5, end: 0.75 },
            alpha: { start: 1, end: 0.4 },
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            speed: { min: 40, max: 60 },
            accelerationX: { min: 10, max: 20 },
            frame: { frames: [0, 1, 2, 3, 4], cycle: true },
            particleClass: Phaser.GameObjects.Particles.Particle
        });
    }

    private createWindStreaks() {
        const streak = this.add.graphics();
        streak.lineStyle(2, 0xffffff, 0.3);  // Thicker, more visible lines
        streak.lineBetween(0, 0, 20, 0);     // Longer streaks
        
        streak.generateTexture('windStreak', 22, 4);  // Larger texture
        streak.destroy();

        this.windStreaks = this.add.particles(0, 0, 'windStreak', {
            x: { min: -50, max: 850 },    // Spawn across entire width
            y: { min: 50, max: 400 },     // Higher up in the scene
            quantity: 3,                   // More streaks per emission
            frequency: 200,                // More frequent emission
            lifespan: 3000,
            alpha: { start: 0.3, end: 0 }, // More visible
            scale: { start: 1, end: 1.5 },
            rotate: { min: -2, max: 2 },   // Less rotation
            speed: { min: 150, max: 200 }, // Faster movement
            accelerationX: { min: 20, max: 30 }
        });
    }

    private createSunbeams() {
        const beam = this.add.graphics();
        beam.lineStyle(2, 0xffffff, 0.3);  // Keep thin line
        beam.lineBetween(0, 0, 0, 400);    // Keep long length
        
        beam.generateTexture('sunbeam', 4, 400);
        beam.destroy();

        this.sunbeams = this.add.particles(400, 0, 'sunbeam', {
            x: { min: -100, max: 900 },
            y: -50,
            quantity: 3,                    // Increased quantity
            frequency: 1000,                // More frequent
            lifespan: 4000,
            alpha: { start: 0.6, end: 0 },  // Increased alpha significantly
            scale: { start: 2, end: 2.5 },  // Increased scale
            rotate: { min: 30, max: 60 },
            speed: { min: 100, max: 150 },
            accelerationY: 30,
            tint: 0xffffff,                 // Pure white for maximum visibility
            blendMode: 'SCREEN'             // Changed blend mode for better visibility
        });
    }

    update() {
        // Add any continuous updates here
    }

    public toggleMusic(play: boolean) {
        if (play && this.bgMusic && !this.bgMusic.isPlaying) {
            this.bgMusic.play();
        } else if (!play && this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
    }

    public playChime() {
        this.sound.play('chime');
    }
} 