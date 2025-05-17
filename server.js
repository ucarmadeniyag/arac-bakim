const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const DATA_FILE = 'bakimlar.json';
app.use(express.json());

// 📁 Statik dosyaları sunmak için bu satır çok önemli!
app.use(express.static(path.join(__dirname, 'public')));

// ✅ API - bakım kayıtlarını çek
app.get('/api/bakimlar/:plaka', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Sunucu hatası' });
    const json = JSON.parse(data);
    res.json(json[plaka] || []);
  });
});

// ✅ API - bakım kaydı ekle
app.post('/api/bakimlar/:plaka', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  const { tarih, islem } = req.body;

  if (!tarih || !islem) {
    return res.status(400).json({ message: 'Eksik bilgi' });
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Sunucu hatası' });
    const json = JSON.parse(data);
    if (!json[plaka]) json[plaka] = [];
    json[plaka].push({ tarih, islem });

    fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2), err => {
      if (err) return res.status(500).json({ message: 'Kayıt edilemedi' });
      res.json({ message: 'Kayıt başarılı' });
    });
  });
});

// ✅ Ana sayfa: index.html (kök dizin isteği için)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🔊 Sunucu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
