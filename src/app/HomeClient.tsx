"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import AdCarousel from '@/components/AdCarousel';
import InstagramPlayer from '@/components/InstagramPlayer';

interface HomeClientProps {
  initialAds: any[];
  initialClients: any[];
  initialPortfolio: any[];
  initialSettings: Record<string, string>;
}

export default function HomeClient({ initialAds, initialClients, initialPortfolio, initialSettings }: HomeClientProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on client side mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('escaper-theme') as 'dark' | 'light' | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Fallback/Default is dark
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('escaper-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <main className={styles.main}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>Escaper Creatives.</div>
          <div className={styles.navActions}>
            <div className={styles.navLinks}>
              <Link href="#work" className={styles.navLink}>Work</Link>
              <Link href="#services" className={styles.navLink}>Services</Link>
              <Link href="#about" className={styles.navLink}>About</Link>
              <Link href="#clients" className={styles.navLink}>Current Clients</Link>
            </div>
            {mounted && (
              <button 
                className={styles.themeToggle} 
                onClick={toggleTheme} 
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  // Sun Icon (switching to light)
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  // Moon Icon (switching to dark)
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Animated Gradient Background */}
        <div className={styles.heroBg}>
          <div className={styles.noiseOverlay} />
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
          <div className={styles.gradientOrb3} />
          {[...Array(15)].map((_, i) => (
            <div key={i} className={styles.goldDust} style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }} />
          ))}
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            {/* Smoothly crossfading Hero Logo */}
            <div className={styles.heroLogoContainer} style={{ position: 'relative', height: '420px', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <img 
                src="/logo.png" 
                alt="Escaper Creatives" 
                className={styles.heroLogo} 
                style={{ 
                  opacity: (!mounted || theme === 'dark') ? 1 : 0,
                  position: (!mounted || theme === 'dark') ? 'relative' : 'absolute',
                  pointerEvents: (!mounted || theme === 'dark') ? 'auto' : 'none',
                  transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }} 
              />
              <img 
                src="/logo-light.png" 
                alt="Escaper Creatives" 
                className={styles.heroLogo} 
                style={{ 
                  opacity: (mounted && theme === 'light') ? 1 : 0,
                  position: (mounted && theme === 'light') ? 'relative' : 'absolute',
                  pointerEvents: (mounted && theme === 'light') ? 'auto' : 'none',
                  transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }} 
              />
            </div>
            <h1 className={styles.title}>
              {initialSettings.hero_title} <span className={styles.highlight}>{initialSettings.hero_highlight}</span>
            </h1>
            <p className={styles.subtitle}>
              {initialSettings.hero_subtitle}
            </p>
            <div className={styles.ctaGroup}>
              <Link href={initialSettings.hero_cta1_link}>
                <button className={styles.primaryBtn}>{initialSettings.hero_cta1_text}</button>
              </Link>
              <Link href={initialSettings.hero_cta2_link}>
                <button className={styles.secondaryBtn}>{initialSettings.hero_cta2_text}</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ad / Poster Section */}
      <section id="work" className={styles.adSection}>
        <AdCarousel ads={initialAds} />
      </section>

      {/* Miniature Instagram Feed Player */}
      <InstagramPlayer 
        portfolio={initialPortfolio}
        username={initialSettings.instagram_username || 'escaper.creatives'}
        followLink={initialSettings.instagram_follow_link || 'https://instagram.com/escaper.creatives'}
      />

      {/* Current Clients Section */}
      <section id="clients" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Hospitality Partners</h2>
          <div className={styles.clientsGrid}>
            {initialClients.length > 0 ? initialClients.map((client) => (
              <div key={client.id} className={styles.clientCard}>
                <div className={styles.clientLogoWrapper}>
                  <img src={client.logoUrl} alt={client.name} className={styles.clientLogo} />
                </div>
                <h3 className={styles.clientName}>{client.name}</h3>
                <div className={styles.clientLinks}>
                  {client.instagramUrl && <a href={client.instagramUrl} target="_blank" rel="noreferrer" className={styles.clientLink}>Instagram</a>}
                  {client.websiteUrl && <a href={client.websiteUrl} target="_blank" rel="noreferrer" className={styles.clientLink}>Website</a>}
                </div>
              </div>
            )) : (
              <p className={styles.placeholderText}>New partners coming soon...</p>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{initialSettings.services_title}</h2>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <h3>{initialSettings.service1_title}</h3>
              <p>{initialSettings.service1_desc}</p>
            </div>
            <div className={styles.serviceCard}>
              <h3>{initialSettings.service2_title}</h3>
              <p>{initialSettings.service2_desc}</p>
            </div>
            <div className={styles.serviceCard}>
              <h3>{initialSettings.service3_title}</h3>
              <p>{initialSettings.service3_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.aboutContent}>
            <h2 className={styles.sectionTitle}>{initialSettings.about_title}</h2>
            <p className={styles.aboutText}>
              {initialSettings.about_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <h2 className={styles.footerBrand}>Escaper Creatives</h2>
            <p className={styles.footerTagline}>{initialSettings.footer_tagline}</p>
            <div className={styles.footerLinks}>
              <a href={`mailto:${initialSettings.footer_email}`} className={styles.footerLink}>{initialSettings.footer_email}</a>
              <a href={initialSettings.footer_ig_link} target="_blank" rel="noreferrer" className={styles.footerLink}>{initialSettings.footer_ig_label}</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} Escaper Creatives. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
