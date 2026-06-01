import styles from './page.module.css';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function WorkPage() {
  let portfolioItems: any[] = [];
  try {
    portfolioItems = await prisma.portfolio.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  } catch (error) {
    console.error("Failed to fetch portfolio items from database:", error);
  }

  return (
    <main className={styles.main}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>Escaper Creatives.</Link>
          <div className={styles.navLinks}>
            <Link href="/#work" className={styles.navLink}>Work</Link>
            <Link href="/#services" className={styles.navLink}>Services</Link>
            <Link href="/#about" className={styles.navLink}>About</Link>
            <Link href="/#clients" className={styles.navLink}>Current Clients</Link>
          </div>
        </div>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>Our Work</h1>
        <p className={styles.subtitle}>A curated collection of our best posts, reels, and campaigns.</p>
      </div>

      <div className={styles.grid}>
        {portfolioItems.length > 0 ? portfolioItems.map(item => (
          <div key={item.id} className={styles.card}>
            <div className={styles.mediaContainer}>
              {item.videoUrl ? (
                <video 
                  src={item.videoUrl} 
                  className={styles.media} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                />
              ) : (
                <img 
                  src={item.imageUrl || ''} 
                  alt={item.title} 
                  className={styles.media} 
                />
              )}
            </div>
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              {item.clientName && <p className={styles.cardClient}>{item.clientName}</p>}
            </div>
          </div>
        )) : (
          <p className={styles.emptyText}>More work coming soon...</p>
        )}
      </div>
    </main>
  );
}
