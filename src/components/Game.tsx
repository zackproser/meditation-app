'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type Phaser from 'phaser';

const Game = () => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<any>(null);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initPhaser = async () => {
            const Phaser = await import('phaser');
            const { default: MainScene } = await import('@/game/scenes/MainScene');

            const config = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { x: 0, y: 0 },
                        debug: false
                    }
                },
                scene: MainScene,
                parent: 'game-container'
            };

            if (!gameRef.current) {
                gameRef.current = new Phaser.Game(config);
                sceneRef.current = gameRef.current.scene.scenes[0];
            }
        };

        initPhaser();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    const startTimer = (minutes: number) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        const endTime = Date.now() + minutes * 60 * 1000;
        setTimeRemaining(minutes * 60);

        timerRef.current = setInterval(() => {
            const remaining = Math.ceil((endTime - Date.now()) / 1000);
            if (remaining <= 0) {
                clearInterval(timerRef.current!);
                setTimeRemaining(null);
                sceneRef.current?.playChime();
            } else {
                setTimeRemaining(remaining);
            }
        }, 1000);
    };

    const toggleMusic = () => {
        const newState = !isMusicPlaying;
        setIsMusicPlaying(newState);
        sceneRef.current?.toggleMusic(newState);
    };

    return (
        <div className="flex flex-col items-center">
            <div id="game-container" />
            
            <div className="mt-4 space-x-4">
                {[5, 10, 15, 30, 60].map((minutes) => (
                    <button
                        key={minutes}
                        onClick={() => startTimer(minutes)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        {minutes} min
                    </button>
                ))}
            </div>

            <div className="mt-4 flex items-center space-x-4">
                <button
                    onClick={toggleMusic}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    {isMusicPlaying ? 'Pause Music' : 'Play Music'}
                </button>
                
                {timeRemaining && (
                    <div className="text-2xl">
                        {Math.floor(timeRemaining / 60)}:
                        {(timeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(Game), {
    ssr: false
}); 