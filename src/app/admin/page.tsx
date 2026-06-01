"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { useUploadThing } from '@/utils/uploadthing';

export default function AdminPortal() {
  const { startUpload } = useUploadThing("mediaUploader");
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  // Panel state
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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);

  const [activeTab, setActiveTab] = useState<'hero' | 'services' | 'about' | 'footer' | 'instagram'>('hero');
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
    footer_ig_link: "https://instagram.com/escaper.creatives",
    instagram_username: "escaper.creatives",
    instagram_follow_link: "https://instagram.com/escaper.creatives"
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Edit states
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<any | null>(null);

  // File states for editing
  const [editAdFile, setEditAdFile] = useState<File | null>(null);
  const [editClientFile, setEditClientFile] = useState<File | null>(null);
  const [editPortfolioFile, setEditPortfolioFile] = useState<File | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);

  const [isSavingAdEdit, setIsSavingAdEdit] = useState(false);
  const [isSavingClientEdit, setIsSavingClientEdit] = useState(false);
  const [isSavingPortfolioEdit, setIsSavingPortfolioEdit] = useState(false);


  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) {
      verifySavedPassword(savedPassword);
    }
  }, []);

  const verifySavedPassword = async (p: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: p })
      });
      if (res.ok) {
        setAdminPassword(p);
        setIsAuthenticated(true);
        // Run all initial loads after auth
        fetchAds();
        fetchClients();
        fetchPortfolio();
        fetchSettings();
      } else {
        sessionStorage.removeItem('admin_password');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      if (res.ok) {
        sessionStorage.setItem('admin_password', passwordInput);
        setAdminPassword(passwordInput);
        setIsAuthenticated(true);
        // Run all initial loads
        fetchAds();
        fetchClients();
        fetchPortfolio();
        fetchSettings();
      } else {
        const data = await res.json();
        setAuthError(data.error || "Incorrect password");
      }
    } catch (err: any) {
      setAuthError("Server communication error: " + err.message);
    }
  };

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
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword || ''
        },
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

  const handleMoveAd = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ads.length) return;

    const newAds = [...ads];
    const temp = newAds[index];
    newAds[index] = newAds[targetIndex];
    newAds[targetIndex] = temp;

    const updatedAds = newAds.map((item, idx) => ({ ...item, order: idx }));
    setAds(updatedAds);

    try {
      await Promise.all([
        fetch('/api/ads', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' },
          body: JSON.stringify({ id: updatedAds[index].id, order: index })
        }),
        fetch('/api/ads', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' },
          body: JSON.stringify({ id: updatedAds[targetIndex].id, order: targetIndex })
        })
      ]);
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveClient = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= clients.length) return;

    const newClients = [...clients];
    const temp = newClients[index];
    newClients[index] = newClients[targetIndex];
    newClients[targetIndex] = temp;

    const updatedClients = newClients.map((item, idx) => ({ ...item, order: idx }));
    setClients(updatedClients);

    try {
      await Promise.all([
        fetch('/api/clients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' },
          body: JSON.stringify({ id: updatedClients[index].id, order: index })
        }),
        fetch('/api/clients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' },
          body: JSON.stringify({ id: updatedClients[targetIndex].id, order: targetIndex })
        })
      ]);
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMovePortfolio = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= portfolio.length) return;

    const newPortfolio = [...portfolio];
    const temp = newPortfolio[index];
    newPortfolio[index] = newPortfolio[targetIndex];
    newPortfolio[targetIndex] = temp;

    const updatedPortfolio = newPortfolio.map((item, idx) => ({ ...item, order: idx }));
    setPortfolio(updatedPortfolio);

    try {
      await Promise.all([
        fetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' },
          body: JSON.stringify({ id: updatedPortfolio[index].id, order: index })
        }),
        fetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' },
          body: JSON.stringify({ id: updatedPortfolio[targetIndex].id, order: targetIndex })
        })
      ]);
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    setIsSavingAdEdit(true);

    let finalImageUrl = editingAd.imageUrl;

    if (editAdFile) {
      try {
        let fileName = editAdFile.name;
        if (editAdFile.type.startsWith('video/') && !fileName.match(/\.(mp4|webm|ogg|mov)$/i)) {
          fileName += '.mp4';
        }
        const renamedFile = new File([editAdFile], fileName, { type: editAdFile.type });
        const res = await startUpload([renamedFile]);
        if (res && res[0]) {
          finalImageUrl = res[0].url;
          if (editAdFile.type.startsWith('video/')) {
            finalImageUrl += '?video=true';
          }
        }
      } catch (err: any) {
        alert("Upload failed: " + err.message);
        setIsSavingAdEdit(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' },
        body: JSON.stringify({ ...editingAd, imageUrl: finalImageUrl })
      });
      if (res.ok) {
        setEditingAd(null);
        setEditAdFile(null);
        fetchAds();
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAdEdit(false);
    }
  };

  const handleClientEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setIsSavingClientEdit(true);

    let finalLogoUrl = editingClient.logoUrl;

    if (editClientFile) {
      try {
        const res = await startUpload([editClientFile]);
        if (res && res[0]) {
          finalLogoUrl = res[0].url;
        }
      } catch (err: any) {
        alert("Upload failed: " + err.message);
        setIsSavingClientEdit(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' },
        body: JSON.stringify({ ...editingClient, logoUrl: finalLogoUrl })
      });
      if (res.ok) {
        setEditingClient(null);
        setEditClientFile(null);
        fetchClients();
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingClientEdit(false);
    }
  };

  const handlePortfolioEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPortfolio) return;
    setIsSavingPortfolioEdit(true);

    let mediaUrl = editingPortfolio.videoUrl || editingPortfolio.imageUrl;
    let coverUrl = editingPortfolio.imageUrl;
    let isVideo = !!editingPortfolio.videoUrl;

    if (editPortfolioFile) {
      if (editPortfolioFile.type.startsWith('video/')) {
        isVideo = true;
      } else {
        isVideo = false;
      }
      try {
        const res = await startUpload([editPortfolioFile]);
        if (res && res[0]) {
          mediaUrl = res[0].url;
        }
      } catch (err: any) {
        alert("Upload failed: " + err.message);
        setIsSavingPortfolioEdit(false);
        return;
      }
    }

    if (editCoverFile) {
      try {
        const res = await startUpload([editCoverFile]);
        if (res && res[0]) {
          coverUrl = res[0].url;
        }
      } catch (err: any) {
        alert("Upload failed: " + err.message);
        setIsSavingPortfolioEdit(false);
        return;
      }
    }

    const payload = {
      ...editingPortfolio,
      imageUrl: isVideo ? (editCoverFile ? coverUrl : editingPortfolio.imageUrl) : mediaUrl,
      videoUrl: isVideo ? mediaUrl : null,
    };

    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword || '' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditingPortfolio(null);
        setEditPortfolioFile(null);
        setEditCoverFile(null);
        fetchPortfolio();
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPortfolioEdit(false);
    }
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
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword || ''
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword || ''
        },
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
    await fetch(`/api/ads?id=${id}`, { 
      method: 'DELETE',
      headers: {
        'x-admin-password': adminPassword || ''
      }
    });
    fetchAds();
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Client?')) return;
    await fetch(`/api/clients?id=${id}`, { 
      method: 'DELETE',
      headers: {
        'x-admin-password': adminPassword || ''
      }
    });
    fetchClients();
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingPortfolio(true);

    let mediaUrl = '';
    let coverUrl = '';
    let isVideo = portfolioForm.isVideo;

    // Upload main file
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

    // Upload optional cover image
    if (coverFile) {
      try {
        const res = await startUpload([coverFile]);
        if (res && res[0]) {
          coverUrl = res[0].url;
        } else {
          throw new Error("Cover upload returned no URL");
        }
      } catch (err: any) {
        alert("Cover image upload failed! " + err.message);
        setIsUploadingPortfolio(false);
        return;
      }
    }

    const payload = {
      ...portfolioForm,
      imageUrl: isVideo ? (coverUrl || null) : mediaUrl,
      videoUrl: isVideo ? mediaUrl : null,
    };

    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword || ''
        },
        body: JSON.stringify(payload)
      });
    } catch(e) {
      console.error(e);
    }
    
    setPortfolioForm({ title: '', clientName: '', category: '', isVideo: false });
    setPortfolioFile(null);
    setCoverFile(null);
    setIsUploadingPortfolio(false);
    fetchPortfolio();
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Work item?')) return;
    await fetch(`/api/portfolio?id=${id}`, { 
      method: 'DELETE',
      headers: {
        'x-admin-password': adminPassword || ''
      }
    });
    fetchPortfolio();
  };

  // Auth Card Render
  if (!isAuthenticated) {
    return (
      <main className={styles.loginContainer}>
        {/* Animated Background */}
        <div className={styles.heroBg}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
          <div className={styles.gradientOrb3}></div>
          <div className={styles.noiseOverlay}></div>
        </div>

        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.loginLogo}>
              <span style={{ color: 'var(--accent)' }}>ESCAPER</span> CREATIVES
            </div>
            <h2 className={styles.loginSubtitle}>Admin Security Lock</h2>
          </div>
          <form onSubmit={handleLoginSubmit}>
            <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'block', textAlign: 'center' }}>
                Enter Admin Security Key
              </label>
              <input 
                type="password" 
                className={styles.input} 
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em' }}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                required 
              />
            </div>
            {authError && (
              <p style={{ color: '#ff4444', fontSize: '0.9rem', margin: '-1rem 0 1.5rem', textAlign: 'center', fontWeight: '500' }}>
                ❌ {authError}
              </p>
            )}
            <button type="submit" className={styles.submitBtn}>
              Unlock Portal
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.9rem' }}>
              ← Return to Main Page
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard Render
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Portal</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className={styles.backBtn}
              onClick={() => {
                sessionStorage.removeItem('admin_password');
                setAdminPassword(null);
                setIsAuthenticated(false);
              }}
              style={{ background: 'rgba(255,50,50,0.15)', borderColor: 'rgba(255,50,50,0.3)', color: '#ff6666' }}
            >
              Log Out
            </button>
            <Link href="/">
              <button className={styles.backBtn}>Back to Site</button>
            </Link>
          </div>
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
              <h3>Active Ads</h3>
              {ads.map((ad, idx) => (
                <div key={ad.id} className={styles.listItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div className={styles.orderControls}>
                      <button 
                        type="button" 
                        className={styles.orderBtn} 
                        onClick={() => handleMoveAd(idx, 'up')}
                        disabled={idx === 0}
                      >
                        ▲
                      </button>
                      <button 
                        type="button" 
                        className={styles.orderBtn} 
                        onClick={() => handleMoveAd(idx, 'down')}
                        disabled={idx === ads.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                    {ad.imageUrl && (
                      ad.imageUrl.match(/\.(mp4|webm|ogg|mov)(\?|$|-|%)/i) || ad.imageUrl.includes('video=true') ? (
                        <span style={{ fontSize: '1.5rem' }}>🎥</span>
                      ) : (
                        <img src={ad.imageUrl} alt={ad.title} className={styles.itemMedia} />
                      )
                    )}
                    <div>
                      <div className={styles.itemTitle}>{ad.title}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.editBtn} onClick={() => setEditingAd(ad)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDeleteAd(ad.id)}>Delete</button>
                  </div>
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
                <label>Instagram URL</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={clientForm.instagramUrl}
                  onChange={(e) => setClientForm({...clientForm, instagramUrl: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Website URL</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={clientForm.websiteUrl}
                  onChange={(e) => setClientForm({...clientForm, websiteUrl: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Client Logo File</label>
                <input 
                  type="file" 
                  className={styles.input} 
                  onChange={(e) => setClientFile(e.target.files ? e.target.files[0] : null)}
                  accept="image/*"
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={isUploadingClient}>
                {isUploadingClient ? 'Uploading Logo... Please Wait' : 'Add Client'}
              </button>
            </form>

            <div className={styles.list}>
              <h3>Current Clients</h3>
              {clients.map((client, idx) => (
                <div key={client.id} className={styles.listItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div className={styles.orderControls}>
                      <button 
                        type="button" 
                        className={styles.orderBtn} 
                        onClick={() => handleMoveClient(idx, 'up')}
                        disabled={idx === 0}
                      >
                        ▲
                      </button>
                      <button 
                        type="button" 
                        className={styles.orderBtn} 
                        onClick={() => handleMoveClient(idx, 'down')}
                        disabled={idx === clients.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                    <img src={client.logoUrl} alt={client.name} className={styles.itemMedia} />
                    <div>
                      <div className={styles.itemTitle}>{client.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.editBtn} onClick={() => setEditingClient(client)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDeleteClient(client.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio / Work Management */}
        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <h2 className={styles.cardTitle}>Manage Work Portfolio</h2>
          <form onSubmit={handlePortfolioSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label>Project Title</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Client Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={portfolioForm.clientName}
                  onChange={(e) => setPortfolioForm({...portfolioForm, clientName: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Category (e.g. Content, Social Media, Ads)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={portfolioForm.category}
                  onChange={(e) => setPortfolioForm({...portfolioForm, category: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Work Media File (Image or Video)</label>
              <input 
                type="file" 
                className={styles.input} 
                onChange={(e) => setPortfolioFile(e.target.files ? e.target.files[0] : null)}
                accept="image/*,video/*"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Cover Image / Thumbnail (Optional for Videos — leave blank to use automatic premium placeholder)</label>
              <input 
                type="file" 
                className={styles.input} 
                onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)}
                accept="image/*"
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={isUploadingPortfolio}>
              {isUploadingPortfolio ? 'Uploading Media... Please Wait' : 'Add Work Item'}
            </button>
          </form>

          <div className={styles.list}>
            <h3>Work Items</h3>
            {portfolio.map((item, idx) => (
              <div key={item.id} className={styles.listItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div className={styles.orderControls}>
                    <button 
                      type="button" 
                      className={styles.orderBtn} 
                      onClick={() => handleMovePortfolio(idx, 'up')}
                      disabled={idx === 0}
                    >
                      ▲
                    </button>
                    <button 
                      type="button" 
                      className={styles.orderBtn} 
                      onClick={() => handleMovePortfolio(idx, 'down')}
                      disabled={idx === portfolio.length - 1}
                    >
                      ▼
                    </button>
                  </div>
                  {item.videoUrl ? (
                    <span style={{ fontSize: '1.5rem' }}>🎥</span>
                  ) : (
                    <img src={item.imageUrl} alt={item.title} className={styles.itemMedia} />
                  )}
                  <div>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemSub}>{item.clientName} | {item.category}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={styles.editBtn} onClick={() => setEditingPortfolio(item)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDeletePortfolio(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Live Customizer */}
        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <h2 className={styles.cardTitle}>Live Website Content Customizer</h2>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            <button 
              className={`${styles.backBtn} ${activeTab === 'hero' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('hero')}
              style={activeTab === 'hero' ? { background: 'var(--accent)', color: '#000' } : {}}
            >
              Hero Section
            </button>
            <button 
              className={`${styles.backBtn} ${activeTab === 'services' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('services')}
              style={activeTab === 'services' ? { background: 'var(--accent)', color: '#000' } : {}}
            >
              Services
            </button>
            <button 
              className={`${styles.backBtn} ${activeTab === 'about' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('about')}
              style={activeTab === 'about' ? { background: 'var(--accent)', color: '#000' } : {}}
            >
              About Us
            </button>
            <button 
              className={`${styles.backBtn} ${activeTab === 'footer' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('footer')}
              style={activeTab === 'footer' ? { background: 'var(--accent)', color: '#000' } : {}}
            >
              Footer & Contact
            </button>
            <button 
              className={`${styles.backBtn} ${activeTab === 'instagram' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('instagram')}
              style={activeTab === 'instagram' ? { background: 'var(--accent)', color: '#000' } : {}}
            >
              Instagram Feed
            </button>
          </div>

          <form onSubmit={handleSettingsSubmit}>
            {activeTab === 'hero' && (
              <div>
                <div className={styles.formGroup}>
                  <label>Hero Bold Title</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.hero_title}
                    onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Hero Highlighted Word</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.hero_highlight}
                    onChange={(e) => setSettings({ ...settings, hero_highlight: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Hero Subtitle Paragraph</label>
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
                    <label>CTA Button 1 Text (Gold)</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.hero_cta1_text}
                      onChange={(e) => setSettings({ ...settings, hero_cta1_text: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>CTA Button 1 Link (e.g. mailto:email or #work)</label>
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
                    <label>CTA Button 2 Text (Transparent)</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.hero_cta2_text}
                      onChange={(e) => setSettings({ ...settings, hero_cta2_text: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>CTA Button 2 Link</label>
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
                  <label>Services Main Title</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.services_title}
                    onChange={(e) => setSettings({ ...settings, services_title: e.target.value })}
                    required
                  />
                </div>
                <div style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Service Card 1</h4>
                  <div className={styles.formGroup}>
                    <label>Service 1 Title</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.service1_title}
                      onChange={(e) => setSettings({ ...settings, service1_title: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Service 1 Description</label>
                    <textarea 
                      className={styles.input} 
                      style={{ minHeight: '80px', resize: 'vertical' }}
                      value={settings.service1_desc}
                      onChange={(e) => setSettings({ ...settings, service1_desc: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Service Card 2</h4>
                  <div className={styles.formGroup}>
                    <label>Service 2 Title</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.service2_title}
                      onChange={(e) => setSettings({ ...settings, service2_title: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Service 2 Description</label>
                    <textarea 
                      className={styles.input} 
                      style={{ minHeight: '80px', resize: 'vertical' }}
                      value={settings.service2_desc}
                      onChange={(e) => setSettings({ ...settings, service2_desc: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Service Card 3</h4>
                  <div className={styles.formGroup}>
                    <label>Service 3 Title</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={settings.service3_title}
                      onChange={(e) => setSettings({ ...settings, service3_title: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Service 3 Description</label>
                    <textarea 
                      className={styles.input} 
                      style={{ minHeight: '80px', resize: 'vertical' }}
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
                  <label>About Us Section Title</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.about_title}
                    onChange={(e) => setSettings({ ...settings, about_title: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>About Us Description Paragraph</label>
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
                  <label>Footer Branding Tagline</label>
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

            {activeTab === 'instagram' && (
              <div>
                <div className={styles.formGroup}>
                  <label>Instagram Username / Handle (without @)</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.instagram_username || ''}
                    onChange={(e) => setSettings({ ...settings, instagram_username: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Instagram Profile URL (Link when follow button is tapped)</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={settings.instagram_follow_link || ''}
                    onChange={(e) => setSettings({ ...settings, instagram_follow_link: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} style={{ marginTop: '1.5rem' }} disabled={isSavingSettings}>
              {isSavingSettings ? 'Saving Changes... Please Wait' : 'Save Customized Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* ================= EDIT AD MODAL ================= */}
      {editingAd && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Edit Featured Ad</h2>
            <form onSubmit={handleAdEditSubmit}>
              <div className={styles.formGroup}>
                <label>Ad Campaign Title</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={editingAd.title}
                  onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Replace Ad Media (Choose File to Upload)</label>
                <input 
                  type="file" 
                  className={styles.input} 
                  onChange={(e) => {
                    setEditAdFile(e.target.files ? e.target.files[0] : null);
                    if (e.target.files && e.target.files[0]) {
                      setEditingAd({ ...editingAd, imageUrl: '' });
                    }
                  }}
                  accept="image/*,video/*"
                />
                <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>— OR —</div>
                <label>Paste Manual URL</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={editingAd.imageUrl}
                  onChange={(e) => {
                    setEditingAd({ ...editingAd, imageUrl: e.target.value });
                    setEditAdFile(null);
                  }}
                  placeholder="Paste manual image/video URL"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => { setEditingAd(null); setEditAdFile(null); }}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} style={{ flex: 1 }} disabled={isSavingAdEdit}>
                  {isSavingAdEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT CLIENT MODAL ================= */}
      {editingClient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Edit Client</h2>
            <form onSubmit={handleClientEditSubmit}>
              <div className={styles.formGroup}>
                <label>Client Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Instagram URL</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={editingClient.instagramUrl || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, instagramUrl: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Website URL</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={editingClient.websiteUrl || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, websiteUrl: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Replace Client Logo Logo File (Optional)</label>
                <input 
                  type="file" 
                  className={styles.input} 
                  onChange={(e) => setEditClientFile(e.target.files ? e.target.files[0] : null)}
                  accept="image/*"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => { setEditingClient(null); setEditClientFile(null); }}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} style={{ flex: 1 }} disabled={isSavingClientEdit}>
                  {isSavingClientEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT PORTFOLIO MODAL ================= */}
      {editingPortfolio && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Edit Portfolio Item</h2>
            <form onSubmit={handlePortfolioEditSubmit}>
              <div className={styles.formGroup}>
                <label>Project Title</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={editingPortfolio.title}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, title: e.target.value })}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Client Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={editingPortfolio.clientName}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, clientName: e.target.value })}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Category</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={editingPortfolio.category}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, category: e.target.value })}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Replace Media File (Optional)</label>
                <input 
                  type="file" 
                  className={styles.input} 
                  onChange={(e) => setEditPortfolioFile(e.target.files ? e.target.files[0] : null)}
                  accept="image/*,video/*"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Replace Cover Image/Thumbnail (Optional for Videos)</label>
                <input 
                  type="file" 
                  className={styles.input} 
                  onChange={(e) => setEditCoverFile(e.target.files ? e.target.files[0] : null)}
                  accept="image/*"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => { setEditingPortfolio(null); setEditPortfolioFile(null); setEditCoverFile(null); }}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} style={{ flex: 1 }} disabled={isSavingPortfolioEdit}>
                  {isSavingPortfolioEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
