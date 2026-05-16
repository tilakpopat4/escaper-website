"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

export default function AdminPortal() {
  const [ads, setAds] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  const [adForm, setAdForm] = useState({ title: '', imageUrl: '' });
  const [adFile, setAdFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [clientForm, setClientForm] = useState({ name: '', logoUrl: '', instagramUrl: '', websiteUrl: '' });
  const [clientFile, setClientFile] = useState<File | null>(null);

  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [portfolioForm, setPortfolioForm] = useState({ title: '', clientName: '', category: '', isVideo: false });
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAds();
    fetchClients();
    fetchPortfolio();
  }, []);

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
    setIsUploading(true);

    let finalImageUrl = adForm.imageUrl;

    if (adFile) {
      const formData = new FormData();
      formData.append('file', adFile);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        finalImageUrl = url;
      } else {
        alert("Image upload failed! Is Vercel Blob connected?");
        setIsUploading(false);
        return;
      }
    }

    await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...adForm, imageUrl: finalImageUrl })
    });
    setAdForm({ title: '', imageUrl: '' });
    setAdFile(null);
    setIsUploading(false);
    fetchAds();
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let finalLogoUrl = clientForm.logoUrl;

    if (clientFile) {
      const formData = new FormData();
      formData.append('file', clientFile);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        finalLogoUrl = url;
      } else {
        alert("Logo upload failed! Is Vercel Blob connected?");
        setIsUploading(false);
        return;
      }
    }

    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...clientForm, logoUrl: finalLogoUrl })
    });
    setClientForm({ name: '', logoUrl: '', instagramUrl: '', websiteUrl: '' });
    setClientFile(null);
    setIsUploading(false);
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
    setIsUploading(true);

    let mediaUrl = '';
    let isVideo = portfolioForm.isVideo;

    if (portfolioFile) {
      if (portfolioFile.type.startsWith('video/')) isVideo = true;
      const formData = new FormData();
      formData.append('file', portfolioFile);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        mediaUrl = url;
      } else {
        alert("Media upload failed! Is Vercel Blob connected?");
        setIsUploading(false);
        return;
      }
    }

    const payload = {
      ...portfolioForm,
      imageUrl: isVideo ? null : mediaUrl,
      videoUrl: isVideo ? mediaUrl : null,
    };

    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    setPortfolioForm({ title: '', clientName: '', category: '', isVideo: false });
    setPortfolioFile(null);
    setIsUploading(false);
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
                <label>Ad Media File (Upload Image/Video)</label>
                <input 
                  type="file" 
                  className={styles.input} 
                  onChange={(e) => setAdFile(e.target.files ? e.target.files[0] : null)}
                  accept="image/*,video/*"
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Update Featured Ad'}
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
              <button type="submit" className={styles.submitBtn} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Add Client'}
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
              <button type="submit" className={styles.submitBtn} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Add to Portfolio'}
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
      </div>
    </main>
  );
}
