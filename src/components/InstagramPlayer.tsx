"use client";

import { useState, useRef, useEffect } from 'react';
import styles from './InstagramPlayer.module.css';

interface InstagramPost {
  id: string;
  type: 'video' | 'image';
  mediaUrl: string;
  location: string;
  likes: number;
  caption: string;
  hashtags: string[];
  thumbnail: string;
}

const FALLBACK_POSTS: InstagramPost[] = [
  {
    id: 'fallback-1',
    type: 'video',
    mediaUrl: '/uploads/1778860596674-708858151-TPF_Reel_1.mp4',
    location: 'Amanbagh, Rajasthan',
    likes: 4852,
    caption: 'Visual storytelling that drives reservations. High-end aesthetic content created for our resort partners.',
    hashtags: ['#resortmarketing', '#contentcreator', '#luxurytravel', '#escapers'],
    thumbnail: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'fallback-2',
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-pouring-into-a-cup-29929-large.mp4',
    location: 'Escaper Café Lab',
    likes: 3124,
    caption: 'Making your café brand unignorable. First, we brew. Then, we capture. ☕️🔥 Contact us to elevate your digital presence.',
    hashtags: ['#cafemarketing', '#aesthetic', '#coffeelover', '#escapers'],
    thumbnail: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'fallback-3',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    location: 'The Escaper Lounge',
    likes: 5912,
    caption: 'Vibe check. Presentation is everything for a modern restaurant. Translate your physical atmosphere into a magnetic presence.',
    hashtags: ['#restaurantdecor', '#interiordesign', '#gastronomy', '#socialagency'],
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop'
  }
];

interface InstagramPlayerProps {
  portfolio: any[];
  username: string;
  followLink: string;
}

export default function InstagramPlayer({ portfolio, username, followLink }: InstagramPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [posts, setPosts] = useState<InstagramPost[]>(FALLBACK_POSTS);
  const [likes, setLikes] = useState<number[]>(FALLBACK_POSTS.map(p => p.likes));
  const [hasLiked, setHasLiked] = useState<boolean[]>(FALLBACK_POSTS.map(() => false));
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [mounted, setMounted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Map portfolio records from database and merge with fallbacks
  useEffect(() => {
    const dbPosts: InstagramPost[] = (portfolio || []).map((item, idx) => {
      const isVideo = !!item.videoUrl;
      const media = item.videoUrl || item.imageUrl || '';
      return {
        id: item.id,
        type: isVideo ? 'video' : 'image',
        mediaUrl: media,
        location: `${item.clientName} • ${item.category}`,
        likes: 2450 + (idx * 342) + (item.title.length * 12),
        caption: item.title,
        hashtags: ['#hospitality', '#escapers', '#' + (item.category || 'content').toLowerCase().replace(/[^a-z0-9]/g, '')],
        thumbnail: item.imageUrl || (isVideo ? 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=400&auto=format&fit=crop' : media)
      };
    });

    // If the database has portfolio items, show ONLY those dynamic items.
    // Otherwise, show our premium defaults so the landing page is never empty.
    const finalPosts = dbPosts.length > 0 ? dbPosts : FALLBACK_POSTS;

    setPosts(finalPosts.slice(0, 6));
    setLikes(finalPosts.slice(0, 6).map(p => p.likes));
    setHasLiked(finalPosts.slice(0, 6).map(() => false));
    setMounted(true);
  }, [portfolio]);

  const activePost = posts[activeIndex] || FALLBACK_POSTS[0];

  // Update video playback state when active post changes
  useEffect(() => {
    if (activePost && activePost.type === 'video' && videoRef.current) {
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.log("Playback auto-play blocked: ", err);
          setIsPlaying(false);
        });
      }
    }
  }, [activeIndex, activePost]);

  const handlePlayPause = () => {
    if (!activePost || activePost.type !== 'video' || !videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => console.log(e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteUnmute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDoubleTap = () => {
    if (hasLiked[activeIndex]) return;
    
    // Trigger double tap heart popping animation
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 800);
    
    handleLikeToggle();
  };

  const handleLikeToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const newHasLiked = [...hasLiked];
    const newLikes = [...likes];
    
    if (newHasLiked[activeIndex]) {
      newLikes[activeIndex] -= 1;
      newHasLiked[activeIndex] = false;
    } else {
      newLikes[activeIndex] += 1;
      newHasLiked[activeIndex] = true;
    }
    
    setLikes(newLikes);
    setHasLiked(newHasLiked);
  };

  if (!mounted || !activePost) return null;

  return (
    <div className={styles.instagramSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.igBadge}>INSTAGRAM WORK</div>
        <h2 className={styles.sectionTitle}>Escaper on the Feed</h2>
        <p className={styles.sectionSubtitle}>
          We craft magnetic micro-content that commands attention and drives foot traffic. Tap the player to interact!
        </p>
      </div>

      <div className={styles.playerContainer}>
        {/* Smartphone mockup */}
        <div className={styles.phoneMockup}>
          <div className={styles.phoneBezel}>
            <div className={styles.dynamicIsland} />
            <div className={styles.phoneScreen}>
              
              {/* Instagram App Shell */}
              <div className={styles.instagramApp}>
                
                {/* Header */}
                <div className={styles.appHeader}>
                  <div className={styles.headerProfile}>
                    <div className={styles.avatarWrapper}>
                      <img src="/logo.png" alt="Profile" className={styles.avatarImg} />
                    </div>
                    <div className={styles.headerInfo}>
                      <div className={styles.usernameRow}>
                        <span className={styles.username}>{username}</span>
                        <svg className={styles.verifiedBadge} viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#0095f6"/>
                        </svg>
                      </div>
                      <span className={styles.location}>{activePost.location}</span>
                    </div>
                  </div>
                  <button className={styles.moreButton}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="6" cy="12" r="1.5" />
                      <circle cx="18" cy="12" r="1.5" />
                    </svg>
                  </button>
                </div>

                {/* Media Area */}
                <div className={styles.mediaContainer} onClick={handlePlayPause} onDoubleClick={handleDoubleTap}>
                  {activePost.type === 'video' ? (
                    <>
                      <video
                        ref={videoRef}
                        className={styles.mediaContent}
                        src={activePost.mediaUrl}
                        loop
                        muted={isMuted}
                        autoPlay
                        playsInline
                      />
                      {/* Play/Pause indicator overlay */}
                      {!isPlaying && (
                        <div className={styles.playOverlay}>
                          <svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                      {/* Sound Control Button */}
                      <button className={styles.volumeBtn} onClick={handleMuteUnmute}>
                        {isMuted ? (
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                          </svg>
                        )}
                      </button>
                    </>
                  ) : (
                    <img src={activePost.mediaUrl} alt={activePost.caption} className={styles.mediaContent} />
                  )}

                  {/* Heart Pop Overlay */}
                  {showHeartOverlay && (
                    <div className={styles.heartPop}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Engagement Bar */}
                <div className={styles.engagementBar}>
                  <div className={styles.leftActions}>
                    <button className={`${styles.actionBtn} ${hasLiked[activeIndex] ? styles.likedBtn : ''}`} onClick={handleLikeToggle}>
                      {hasLiked[activeIndex] ? (
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      )}
                    </button>
                    <button className={styles.actionBtn}>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    </button>
                    <button className={styles.actionBtn}>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                  <button className={styles.actionBtn}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>

                {/* Caption / Comments */}
                <div className={styles.commentsSection}>
                  <div className={styles.likesCount}>{(likes[activeIndex] || 0).toLocaleString()} likes</div>
                  <div className={styles.captionText}>
                    <span className={styles.captionUser}>{username}</span>{' '}
                    {activePost.caption}
                  </div>
                  <div className={styles.hashtagsRow}>
                    {(activePost.hashtags || []).map((h, i) => (
                      <span key={i} className={styles.hashtag}>{h}</span>
                    ))}
                  </div>
                  <div className={styles.postTime}>2 DAYS AGO</div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Thumbnail Selector Feed */}
        <div className={styles.feedSidebar}>
          <h3 className={styles.sidebarTitle}>Select Content Reel</h3>
          <div className={styles.thumbnailsGrid}>
            {posts.map((post, idx) => (
              <div
                key={post.id}
                className={`${styles.thumbnailCard} ${activeIndex === idx ? styles.activeThumbnail : ''}`}
                onClick={() => {
                  setActiveIndex(idx);
                  setIsPlaying(true);
                }}
              >
                <div className={styles.thumbnailWrapper}>
                  <img src={post.thumbnail} alt={post.location} className={styles.thumbnailImg} />
                  {post.type === 'video' && (
                    <div className={styles.videoBadge}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className={styles.thumbnailInfo}>
                  <span className={styles.thumbLocation}>{post.location}</span>
                  <span className={styles.thumbLikes}>{post.type === 'video' ? 'Reel' : 'Post'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.followCTA}>
            <p>Loved our presentation? Follow us for daily aesthetic inspiration.</p>
            <a 
              href={followLink} 
              target="_blank" 
              rel="noreferrer" 
              className={styles.followBtn}
            >
              Follow @{username}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
