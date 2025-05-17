const express = require('express');
const app = express();

app.use(express.json());  // JSON body okumak için

// Hafıza içi veritabanı (örnek)
const bakimlarDB = {};

// GET ile plakaya göre bakım kayıtlarını getir
app.get('/api/bakimlar/:plaka', (req, res) => {
  const plaka = req.params.plaka;

  // Eğer plaka yoksa boş dizi döndür
  if (!bakimlarDB[plaka]) {
    bakimlarDB[plaka] = [];
  }

  res.json(bakimlarDB[plaka]);
});

// POST ile yeni bakım kaydı ekle
app.post('/api/bakimlar/:plaka', (req, res) => {
  const plaka = req.params.plaka;
  const { tarih, islem } = req.body;

  if (!tarih || !islem) {
    return res.status(400).json({ message: "Tarih ve işlem gereklidir" });
  }

  if (!veri[plaka]) {
    veri[plaka] = [];
  }

  veri[plaka].push({ tarih, islem });

  fs.writeFileSync('bakimlar.json', JSON.stringify(veri, null, 2));

  res.status(201).json({ message: "Bakım kaydı eklendi" });
});

// Sunucu başlat
const port = 3000;
app.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor...`);
});