import styles from './page.module.css';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import AdCarousel from '@/components/AdCarousel';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let latestAds: any[] = [];
  let clients: any[] = [];

  try {
    latestAds = await prisma.ad.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to fetch ads from database:", error);
  }

  try {
    clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to fetch clients from database:", error);
  }

  const adsToRender = latestAds.length > 0 ? latestAds : [
    {
      id: 'placeholder-1',
      title: 'Our Latest Campaign',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1920&auto=format&fit=crop'
    }
  ];

  return (
    <main className={styles.main}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>Escaper Creatives.</div>
          <div className={styles.navLinks}>
            <Link href="#work" className={styles.navLink}>Work</Link>
            <Link href="#services" className={styles.navLink}>Services</Link>
            <Link href="#about" className={styles.navLink}>About</Link>
            <Link href="#clients" className={styles.navLink}>Current Clients</Link>
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
            <div className={styles.heroLogoContainer}>
              <img src="/logo.png" alt="Escaper Creatives" className={styles.heroLogo} />
            </div>
            <h1 className={styles.title}>
              We Make Your Hospitality Brand <span className={styles.highlight}>Unignorable.</span>
            </h1>
            <p className={styles.subtitle}>
              Escaper Creatives is the premier social media agency for cafes, restaurants, hotels, and resorts. Let us tell your story.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="mailto:escapercreatives@gmail.com">
                <button className={styles.primaryBtn}>Book Consultation</button>
              </Link>
              <Link href="/work">
                <button className={styles.secondaryBtn}>View Our Work</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ad / Poster Section */}
      <section id="work" className={styles.adSection}>
        <AdCarousel ads={adsToRender} />
      </section>

      {/* Current Clients Section */}
      <section id="clients" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Hospitality Partners</h2>
          <div className={styles.clientsGrid}>
            {clients.length > 0 ? clients.map((client) => (
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
          <h2 className={styles.sectionTitle}>What We Do</h2>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <h3>Social Media Management</h3>
              <p>End-to-end management of your Instagram, TikTok, and Facebook to build a cult following.</p>
            </div>
            <div className={styles.serviceCard}>
              <h3>Content Creation</h3>
              <p>High-end food photography, aesthetic reels, and cinematic videos that make people hungry.</p>
            </div>
            <div className={styles.serviceCard}>
              <h3>Paid Ads</h3>
              <p>Laser-targeted campaigns to drive foot traffic, reservations, and immediate ROI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.aboutContent}>
            <h2 className={styles.sectionTitle}>About Escaper Creatives</h2>
            <p className={styles.aboutText}>
              We are a boutique social media agency exclusively dedicated to the hospitality industry. 
              We understand that aesthetics, vibe, and presentation are everything for a modern cafe, restaurant, or resort. 
              Our mission is to translate your physical atmosphere into a magnetic digital presence.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <h2 className={styles.footerBrand}>Escaper Creatives</h2>
            <p className={styles.footerTagline}>The Premier Social Media Agency for Hospitality</p>
            <div className={styles.footerLinks}>
              <a href="mailto:escapercreatives@gmail.com" className={styles.footerLink}>escapercreatives@gmail.com</a>
              <a href="https://instagram.com/escaper.creatives" target="_blank" rel="noreferrer" className={styles.footerLink}>Instagram (@escaper.creatives)</a>
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
