const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const DATA_FILE = 'bakimlar.json';

app.use(express.json());

// Statik dosyaları public klasöründen sun
app.use(express.static(path.join(__dirname, 'public')));

// Bakım kayıtlarını plaka bazında getir
app.get('/api/bakimlar/:plaka', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Sunucu hatası' });
    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: 'Veri okuma hatası' });
    }
    res.json(json[plaka] || []);
  });
});

// Bakım kaydını silmek için API
app.delete('/api/bakimlar/:plaka/:index', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  const index = parseInt(req.params.index);

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Sunucu hatası' });

    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: 'Veri okuma hatası' });
    }

    if (!json[plaka]) return res.status(404).json({ message: 'Plaka bulunamadı' });

    if (isNaN(index) || index < 0 || index >= json[plaka].length) {
      return res.status(400).json({ message: 'Geçersiz kayıt indeksi' });
    }

    json[plaka].splice(index, 1); // Kaydı sil

    fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2), err => {
      if (err) return res.status(500).json({ message: 'Silme işlemi başarısız' });
      res.json({ message: 'Kayıt silindi' });
    });
  });
});

// Yeni bakım kaydı ekleme API
app.post('/api/bakimlar/:plaka', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  const { tarih, islem } = req.body;

  if (!tarih || !islem) {
    return res.status(400).json({ message: 'Eksik bilgi' });
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Sunucu hatası' });

    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: 'Veri okuma hatası' });
    }

    if (!json[plaka]) json[plaka] = [];
    json[plaka].push({ tarih, islem });

    fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Kayıt edilemedi' });
      res.json({ message: 'Kayıt başarılı' });
    });
  });
});

// Tüm araçların bakım kayıtlarını listele
app.get('/api/bakimlar', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Sunucu hatası' });
    const json = JSON.parse(data);
    res.json(json);
  });
});
