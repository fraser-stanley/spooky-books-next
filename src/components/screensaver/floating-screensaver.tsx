'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './floating-screensaver.module.css';

interface FloatingGif {
  id: number;
  src: string;
  left: number;
}

const SPOOKY_GIFS = [
  '/images/screensaver/ghost.gif',
  '/images/screensaver/skeleton.gif', 
  '/images/screensaver/skull.gif'
];

const IDLE_TIMEOUT = 40000; // 40 seconds for production
const FADE_STEP = 0.02;
const FRAME_RATE = 16; // ~60fps
const SPAWN_INTERVAL = 3000; // 3 seconds between GIF spawns
const MAX_GIFS = 20; // Performance limit
const SPAWN_OPACITY_THRESHOLD = 0.4;

const FloatingScreensaver = () => {
  const [gifs, setGifs] = useState<FloatingGif[]>([]);
  const [active, setActive] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);

  useEffect(() => {
    const handleActivity = () => {
      setActive(false);
      setGifs([]);
      setOverlayOpacity(0);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setActive(true);
      }, IDLE_TIMEOUT);
    };

    let timeoutId = setTimeout(() => {
      setActive(true);
    }, IDLE_TIMEOUT);

    const events = ['mousemove', 'keydown', 'touchstart', 'touchmove', 'click'] as const;
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (active) {
      const fadeInterval = setInterval(() => {
        setOverlayOpacity((prev) => {
          const newOpacity = Math.min(prev + FADE_STEP, 1.0);
          if (newOpacity >= 1.0) {
            clearInterval(fadeInterval);
          }
          return newOpacity;
        });
      }, FRAME_RATE);

      const spawnDelay = (SPAWN_OPACITY_THRESHOLD / FADE_STEP) * FRAME_RATE;
      const spawnTimer = setTimeout(() => {
        const intervalId = setInterval(() => {
          setGifs((prevGifs) => [
            ...prevGifs,
            {
              id: Date.now() + Math.random(),
              src: SPOOKY_GIFS[Math.floor(Math.random() * SPOOKY_GIFS.length)],
              left: Math.random() * 90 + 5
            },
          ]);
        }, SPAWN_INTERVAL);

        return () => {
          clearInterval(intervalId);
        };
      }, spawnDelay);

      return () => {
        clearInterval(fadeInterval);
        clearTimeout(spawnTimer);
      };
    } else {
      setOverlayOpacity(0);
    }
  }, [active]);

  useEffect(() => {
    if (gifs.length > MAX_GIFS) {
      setGifs(prev => prev.slice(-15));
    }
  }, [gifs.length]);

  if (!active) {
    return null;
  }

  return (
    <div
      className={styles.container}
      style={{ 
        backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`
      }}
    >
      {gifs.map((gif, index) => (
        <div
          key={gif.id}
          className={styles.floatingGif}
          style={{
            '--gif-index': index > 9 ? index - 10 : 0,
            left: index > 9 ? `${gif.left}%` : undefined
          } as React.CSSProperties}
        >
          <Image
            src={gif.src}
            alt="Floating spooky animation"
            width={0}
            height={0}
            sizes="100vw"
            unoptimized
            style={{
              width: 'auto',
              height: 'auto',
              pointerEvents: 'none',
              border: 'none',
              borderRadius: '0',
              boxShadow: 'none',
              background: 'transparent'
            }}
          />
        </div>
      ))}
    </div>
  );
};

FloatingScreensaver.displayName = "FloatingScreensaver";

export default FloatingScreensaver;