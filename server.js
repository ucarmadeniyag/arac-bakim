

const express = require("express");
const cors = require('cors');
const app = express();
app.use(cors());

const port = 3000;

app.use(express.json());

let veriler = {
  "34ABC123": [
    { tarih: "2024-12-01", islem: "Yağ Değişimi" },
    { tarih: "2025-03-10", islem: "Filtre Değişimi" }
  ],
  "06XYZ456": [
    { tarih: "2025-01-20", islem: "Fren Kontrolü" }
  ]
};

// Tüm plakalarla birlikte verileri döner
app.get("/api/bakimlar", (req, res) => {
  res.json(veriler);
});

// Belirli plakaya ait bakım verisi döner
app.get("/api/bakimlar/:plaka", (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  if (veriler[plaka]) {
    res.json(veriler[plaka]);
  } else {
    res.status(404).json({ message: "Kayıt bulunamadı" });
  }
});

// Yeni bakım kaydı ekler
app.post("/api/bakimlar/:plaka", (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  const { tarih, islem } = req.body;
  if (!tarih || !islem) {
    return res.status(400).json({ message: "Eksik veri" });
  }
  if (!veriler[plaka]) veriler[plaka] = [];
  veriler[plaka].push({ tarih, islem });
  res.json({ message: "Bakım kaydı eklendi" });
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});

