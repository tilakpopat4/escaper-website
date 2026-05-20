import { prisma } from '@/lib/prisma';
import HomeClient from './HomeClient';

const DEFAULT_SETTINGS = {
  hero_title: "We Make Your Hospitality Brand",
  hero_highlight: "Unignorable.",
  hero_subtitle: "Escaper Creatives is the premier social media agency for cafes, restaurants, hotels, and resorts. Let us tell your story.",
  hero_cta1_text: "Book Consultation",
  hero_cta1_link: "mailto:escapercreatives@gmail.com",
  hero_cta2_text: "View Our Work",
  hero_cta2_link: "/work",
  services_title: "What We Do",
  service1_title: "Social Media Management",
  service1_desc: "End-to-end management of your Instagram, TikTok, and Facebook to build a cult following.",
  service2_title: "Content Creation",
  service2_desc: "High-end food photography, aesthetic reels, and cinematic videos that make people hungry.",
  service3_title: "Paid Ads",
  service3_desc: "Laser-targeted campaigns to drive foot traffic, reservations, and immediate ROI.",
  about_title: "About Escaper Creatives",
  about_desc: "We are a boutique social media agency exclusively dedicated to the hospitality industry. We understand that aesthetics, vibe, and presentation are everything for a modern cafe, restaurant, or resort. Our mission is to translate your physical atmosphere into a magnetic digital presence.",
  footer_tagline: "The Premier Social Media Agency for Hospitality",
  footer_email: "escapercreatives@gmail.com",
  footer_ig_label: "Instagram (@escaper.creatives)",
  footer_ig_link: "https://instagram.com/escaper.creatives",
  instagram_username: "escaper.creatives",
  instagram_follow_link: "https://instagram.com/escaper.creatives"
};

export const dynamic = 'force-dynamic';

export default async function Home() {
  let latestAds: any[] = [];
  let clients: any[] = [];
  let portfolio: any[] = [];
  let settings: Record<string, string> = { ...DEFAULT_SETTINGS };

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

  try {
    portfolio = await prisma.portfolio.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to fetch portfolio from database:", error);
  }

  try {
    const settingsList = await prisma.settings.findMany();
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });
  } catch (error) {
    console.error("Failed to fetch settings from database:", error);
  }

  const adsToRender = latestAds.length > 0 ? latestAds : [
    {
      id: 'placeholder-1',
      title: 'Our Latest Campaign',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1920&auto=format&fit=crop'
    }
  ];

  return (
    <HomeClient 
      initialAds={adsToRender}
      initialClients={clients}
      initialPortfolio={portfolio}
      initialSettings={settings}
    />
  );
}
