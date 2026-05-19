"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { useUploadThing } from '@/utils/uploadthing';

export default function AdminPortal() {
  const { startUpload } = useUploadThing("mediaUploader");
  const [ads, setAds] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  const [adForm, setAdForm] = useState({ title: '', imageUrl: '' });
  const [adFile, setAdFile] = useState<File | null>(null);
  const [isUploadingAd, setIsUploadingAd] = useState(false);
  
  const [clientForm, setClientForm] = useState({ name: '', logoUrl: '', instagramUrl: '', websiteUrl: '' });
  const [clientFile, setClientFile] = useState<File | null>(null);
  const [isUploadingClient, setIsUploadingClient] = useState(false);

  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [portfolioForm, setPortfolioForm] = useState({ title: '', clientName: '', category: '', isVideo: false });
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);

  const [activeTab, setActiveTab] = useState<'hero' | 'services' | 'about' | 'footer'>('hero');
  const [settings, setSettings] = useState<Record<string, string>>({
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
    footer_ig_link: "https://instagram.com/escaper.creatives"
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchAds();
    fetchClients();
    fetchPortfolio();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch('/api/settings', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setSettings(prev => ({ ...prev, ...data }));
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Website customized successfully!");
      } else {
        alert("Failed to save customization.");
      }
    } catch (err: any) {
      alert("Error saving customization: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchAds = async () => {
    const res = await fetch('/api/ads', { cache: 'no-store' });
    if (res.ok) setAds(await res.json());
  };

  const fetchClients = async () => {
    const res = await fetch('/api/clients', { cache: 'no-store' });
    if (res.ok) setClients(await res.json());
  };

  const fetchPortfolio = async () => {
    const res = await fetch('/api/portfolio', { cache: 'no-store' });
    if (res.ok) setPortfolio(await res.json());
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingAd(true);

    let finalImageUrl = adForm.imageUrl;

    if (!adFile && !finalImageUrl) {
      alert("Please upload a file OR paste a manual URL!");
      setIsUploadingAd(false);
      return;
    }

    if (adFile) {
      try {
        let fileName = adFile.name;
        if (adFile.type.startsWith('video/') && !fileName.match(/\.(mp4|webm|ogg|mov)$/i)) {
          fileName += '.mp4';
        }
        const renamedFile = new File([adFile], fileName, { type: adFile.type });
        const res = await startUpload([renamedFile]);
        if (res && res[0]) {
          finalImageUrl = res[0].url;
          if (adFile.type.startsWith('video/')) {
            finalImageUrl += '?video=true';
          }
        } else {
          throw new Error("Upload returned no URL");
        }
      } catch (err: any) {
        alert("Image upload failed! " + err.message);
        setIsUploadingAd(false);
        return;
      }
    }

    try {
      await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...adForm, imageUrl: finalImageUrl })
      });
    } catch (e) {
      console.error(e);
    }
    setAdForm({ title: '', imageUrl: '' });
    setAdFile(null);
    setIsUploadingAd(false);
    fetchAds();
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingClient(true);

    let finalLogoUrl = clientForm.logoUrl;

    if (clientFile) {
      try {
        const res = await startUpload([clientFile]);
        if (res && res[0]) {
          finalLogoUrl = res[0].url;
        } else {
          throw new Error("Upload returned no URL");
        }
      } catch (err: any) {
        alert("Logo upload failed! " + err.message);
        setIsUploadingClient(false);
        return;
      }
    }

    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clientForm, logoUrl: finalLogoUrl })
      });
    } catch(e) {
      console.error(e);
    }
    setClientForm({ name: '', logoUrl: '', instagramUrl: '', websiteUrl: '' });
    setClientFile(null);
    setIsUploadingClient(false);
    fetchClients();
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Ad?')) return;
    await fetch(`/api/ads?id=${id}`, { method: 'DELETE' });
    fetchAds();
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Client?')) return;
    await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
    fetchClients();
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingPortfolio(true);

    let mediaUrl = '';
    let isVideo = portfolioForm.isVideo;

    if (portfolioFile) {
      if (portfolioFile.type.startsWith('video/')) isVideo = true;
      try {
        const res = await startUpload([portfolioFile]);
        if (res && res[0]) {
          mediaUrl = res[0].url;
        } else {
          throw new Error("Upload returned no URL");
        }
      } catch (err: any) {
        alert("Media upload failed! " + err.message);
        setIsUploadingPortfolio(false);
        return;
      }
    }

    const payload = {
      ...portfolioForm,
      imageUrl: isVideo ? null : mediaUrl,
      videoUrl: isVideo ? mediaUrl : null,
    };

    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch(e) {
      console.error(e);
    }
    
    setPortfolioForm({ title: '', clientName: '', category: '', isVideo: false });
    setPortfolioFile(null);
    setIsUploadingPortfolio(false);
    fetchPortfolio();
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Work item?')) return;
    await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
    fetchPortfolio();
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Portal</h1>
          <Link href="/">
            <button className={styles.backBtn}>Back to Site</button>
          </Link>
        </div>

        <div className={styles.dashboardGrid}>
          {/* Ad Management */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Manage Featured Ad</h2>
            <form onSubmit={handleAdSubmit}>
              <div className={styles.formGroup}>
                <label>Ad Campaign Title</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={adForm.title}
                  onChange={(e) => setAdForm({...adForm, title: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ad Media (Choose File OR Paste URL)</label>
                <input 
                  type="file" 
                  className={styles.input} 
                  onChange={(e) => {
                    setAdFile(e.target.files ? e.target.files[0] : null);
                    if (e.target.files && e.target.files[0]) {
                      setAdForm({ ...adForm, imageUrl: '' });
                    }
                  }}
                  accept="image/*,video/*"
                />
                <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>— OR —</div>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Paste manual image/video URL (e.g. https://utfs.io/f/...)"
                  value={adForm.imageUrl}
                  onChange={(e) => {
                    setAdForm({...adForm, imageUrl: e.target.value});
                    setAdFile(null);
                  }}
                />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  💡 Tip: If you paste a manual video link, make sure to add <strong>?video=true</strong> at the very end of the URL!
                </p>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={isUploadingAd}>
                {isUploadingAd ? 'Uploading... Please Wait' : 'Update Featured Ad'}
              </button>
            </form>

            <div className={styles.list}>
              {ads.slice(0, 10).map(ad => (
                <div key={ad.id} className={styles.listItem}>
                  <div>
                    <div className={styles.itemTitle}>{ad.title}</div>
                    <div className={styles.itemSub}>{new Date(ad.createdAt).toLocaleDateString()}</div>
                    <button onClick={() => handleDeleteAd(ad.id)} className={styles.deleteBtn} style={{ marginTop: 10 }}>Delete</button>
                  </div>
                  <img src={ad.imageUrl} alt="Ad media" className={styles.itemMedia} />
                </div>
              ))}
            </div>
          </div>

          {/* Client Management */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Manage Clients</h2>
            <form onSubmit={handleClientSubmit}>
              <div className={styles.formGroup}>
                <label>Client Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={clientForm.name}
                  onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Client Logo File</label>
                <input 
                  type="file" 
                  className={styles.input} 
                  onChange={(e) => setClientFile(e.target.files ? e.target.files[0] : null)}
                  accept="image/*"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Instagram URL (Optional)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={clientForm.instagramUrl}
                  onChange={(e) => setClientForm({...clientForm, instagramUrl: e.target.value})}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className={styles.formGroup}>
                <label>Website URL (Optional)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={clientForm.websiteUrl}
                  onChange={(e) => setClientForm({...clientForm, websiteUrl: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={isUploadingClient}>
                {isUploadingClient ? 'Uploading... Please Wait' : 'Add Client'}
              </button>
            </form>

            <div className={styles.list}>
              {clients.map(client => (
                <div key={client.id} className={styles.listItem}>
                  <div>
                    <div className={styles.itemTitle}>{client.name}</div>
                    <div className={styles.itemSub}>
                      {client.instagramUrl && <a href={client.instagramUrl} target="_blank" style={{color: 'var(--accent)', marginRight: 10}}>IG</a>}
                      {client.websiteUrl && <a href={client.websiteUrl} target="_blank" style={{color: '#fff'}}>Web</a>}
                    </div>
                    <button onClick={() => handleDeleteClient(client.id)} className={styles.deleteBtn} style={{ marginTop: 10 }}>Delete</button>
                  </div>
                  {client.logoUrl && <img src={client.logoUrl} alt="logo" className={styles.itemMedia} />}
                </div>
              ))}
            </div>
          </div>
          {/* Portfolio Management */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Manage Portfolio (Work)</h2>
            <form onSubmit={handlePortfolioSubmit}>
              <div className={styles.formGroup}>
                <label>Title / Caption</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Client Name (Optional)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={portfolioForm.clientName}
                  onChange={(e) => setPortfolioForm({...portfolioForm, clientName: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Media File (Image or Video)</label>
                <input 
                  type="file" 
                  className={styles.input} 
                  onChange={(e) => setPortfolioFile(e.target.files ? e.target.files[0] : null)}
                  accept="image/*,video/*"
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={isUploadingPortfolio}>
                {isUploadingPortfolio ? 'Uploading... Please Wait' : 'Add to Portfolio'}
              </button>
            </form>

            <div className={styles.list}>
              {portfolio.map(item => (
                <div key={item.id} className={styles.listItem}>
                  <div>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemSub}>{item.clientName}</div>
                    <button onClick={() => handleDeletePortfolio(item.id)} className={styles.deleteBtn} style={{ marginTop: 10 }}>Delete</button>
                  </div>
                  {item.imageUrl && <img src={item.imageUrl} alt="portfolio" className={styles.itemMedia} />}
                  {item.videoUrl && <video src={item.videoUrl} className={styles.itemMedia} style={{ objectFit: 'contain' }} muted />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Website Customizer Card */}
        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <h2 className={styles.cardTitle}>Website Content Customizer (Live Editor)</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Customize all the text, headings, buttons, and links visible on the main page. Changes apply instantly.
          </p>
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
            {(['hero', 'services', 'about', 'footer'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.5rem 1rem',
                  background: activeTab === tab ? 'var(--accent)' : 'transparent',
                  color: activeTab === tab ? '#000' : '#fff',
                  border: '1px solid ' + (activeTab === tab ? 'var(--accent)' : 'var(--border-color)'),
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab} Section
              </button>
            ))}
          </div>

          <form onSubmit={handleSettingsSubmit}>
            {activeTab === 'hero' && (
              <div>
                <div className={styles.formGroup}>
                  <label>Hero Title (Main Heading Line)</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.hero_title}
                    onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Hero Highlighted Word (Gold Highlight text at the end)</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.hero_highlight}
                    onChange={(e) => setSettings({ ...settings, hero_highlight: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Hero Subtitle / Description</label>
                  <textarea 
                    className={styles.input} 
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    value={settings.hero_subtitle}
                    onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label>CTA Button 1 Text (Primary Button)</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.hero_cta1_text}
                      onChange={(e) => setSettings({ ...settings, hero_cta1_text: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>CTA Button 1 Link (e.g. mailto:email@domain.com)</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.hero_cta1_link}
                      onChange={(e) => setSettings({ ...settings, hero_cta1_link: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label>CTA Button 2 Text (Secondary Button)</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.hero_cta2_text}
                      onChange={(e) => setSettings({ ...settings, hero_cta2_text: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>CTA Button 2 Link (e.g. /work)</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.hero_cta2_link}
                      onChange={(e) => setSettings({ ...settings, hero_cta2_link: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div className={styles.formGroup}>
                  <label>Services Heading</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.services_title}
                    onChange={(e) => setSettings({ ...settings, services_title: e.target.value })}
                    required
                  />
                </div>
                
                {/* Service 1 */}
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.1)' }}>
                  <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Service Card 1</h4>
                  <div className={styles.formGroup}>
                    <label>Title</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.service1_title}
                      onChange={(e) => setSettings({ ...settings, service1_title: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label>Description</label>
                    <textarea 
                      className={styles.input} 
                      style={{ minHeight: '60px', resize: 'vertical' }}
                      value={settings.service1_desc}
                      onChange={(e) => setSettings({ ...settings, service1_desc: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Service 2 */}
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.1)' }}>
                  <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Service Card 2</h4>
                  <div className={styles.formGroup}>
                    <label>Title</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.service2_title}
                      onChange={(e) => setSettings({ ...settings, service2_title: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label>Description</label>
                    <textarea 
                      className={styles.input} 
                      style={{ minHeight: '60px', resize: 'vertical' }}
                      value={settings.service2_desc}
                      onChange={(e) => setSettings({ ...settings, service2_desc: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Service 3 */}
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.1)' }}>
                  <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Service Card 3</h4>
                  <div className={styles.formGroup}>
                    <label>Title</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.service3_title}
                      onChange={(e) => setSettings({ ...settings, service3_title: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label>Description</label>
                    <textarea 
                      className={styles.input} 
                      style={{ minHeight: '60px', resize: 'vertical' }}
                      value={settings.service3_desc}
                      onChange={(e) => setSettings({ ...settings, service3_desc: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div>
                <div className={styles.formGroup}>
                  <label>About Heading Title</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.about_title}
                    onChange={(e) => setSettings({ ...settings, about_title: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>About Paragraph Text</label>
                  <textarea 
                    className={styles.input} 
                    style={{ minHeight: '150px', resize: 'vertical' }}
                    value={settings.about_desc}
                    onChange={(e) => setSettings({ ...settings, about_desc: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === 'footer' && (
              <div>
                <div className={styles.formGroup}>
                  <label>Footer Tagline / Short Description</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.footer_tagline}
                    onChange={(e) => setSettings({ ...settings, footer_tagline: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Footer Email</label>
                  <input 
                    type="email" 
                    className={styles.input} 
                    value={settings.footer_email}
                    onChange={(e) => setSettings({ ...settings, footer_email: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label>Instagram Label / Username Text</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.footer_ig_label}
                      onChange={(e) => setSettings({ ...settings, footer_ig_label: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Instagram Link URL</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.footer_ig_link}
                      onChange={(e) => setSettings({ ...settings, footer_ig_link: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} style={{ marginTop: '1.5rem' }} disabled={isSavingSettings}>
              {isSavingSettings ? 'Saving Changes... Please Wait' : 'Save Customized Changes'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
