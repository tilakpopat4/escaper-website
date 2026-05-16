"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './AdCarousel.module.css';

export default function AdCarousel({ ads }: { ads: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === activeIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [activeIndex]);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
  };

  if (!ads || ads.length === 0) return null;

  return (
    <div className={styles.carouselContainer}>
      {ads.length > 1 && (
        <button className={`${styles.navBtn} ${styles.leftBtn}`} onClick={prevSlide}>
          &#10094;
        </button>
      )}

      <div className={styles.slidesWrapper}>
        {ads.map((ad, index) => {
          const isActive = index === activeIndex;
          return (
            <div 
              key={ad.id} 
              className={`${styles.slide} ${isActive ? styles.active : styles.inactive}`}
              style={{ transform: `translateX(${(index - activeIndex) * 100}%)` }}
              onClick={() => !isActive && setActiveIndex(index)}
            >
              <div className={styles.adWrapper}>
                <div className={styles.adScreen}>
                  <div className={styles.adOverlay}>
                    <h2 className={styles.adTitle}>{ad.title}</h2>
                    <button className={styles.primaryBtn}>Watch Video</button>
                  </div>
                  {ad.imageUrl?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <video 
                      ref={(el) => { videoRefs.current[index] = el; }}
                      src={ad.imageUrl} 
                      autoPlay={isActive} 
                      loop 
                      muted 
                      playsInline 
                      className={styles.adMedia}
                    />
                  ) : (
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title} 
                      className={styles.adMedia}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ads.length > 1 && (
        <button className={`${styles.navBtn} ${styles.rightBtn}`} onClick={nextSlide}>
          &#10095;
        </button>
      )}
    </div>
  );
}
