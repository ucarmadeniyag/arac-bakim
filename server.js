const express = require('express');
const app = express();
const path = require('path');
const QRCode = require('qrcode');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');

const db = new Database('veritabani.db');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Kullanıcı girişi için sabit kullanıcı
const USER = {
  username: 'admin',
  password: '1234'
};

// Veritabanı tablosunu oluştur
db.prepare(`
  CREATE TABLE IF NOT EXISTS bakimlar (
    plaka TEXT,
    tarih TEXT,
    islem TEXT,
    detay TEXT
  )
`).run();

// -------------------- GİRİŞ --------------------

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    res.redirect('/anasayfa.html');
  } else {
    res.send('<h2>Hatalı kullanıcı adı veya şifre!</h2><a href="/">Geri dön</a>');
  }
});

// -------------------- API --------------------

// Belirli plakaya ait bakım kayıtlarını getir
app.get('/api/bakimlar/:plaka', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  const stmt = db.prepare('SELECT tarih, islem, detay FROM bakimlar WHERE plaka = ?');
  const bakimlar = stmt.all(plaka);
  res.json(bakimlar);
});

// Yeni bakım kaydı ekle
app.post('/api/bakimlar/:plaka', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  const { tarih, islem, detay } = req.body;

  if (!tarih || !islem) {
    return res.status(400).json({ message: 'Eksik bilgi' });
  }

  const stmt = db.prepare('INSERT INTO bakimlar (plaka, tarih, islem, detay) VALUES (?, ?, ?, ?)');
  stmt.run(plaka, tarih, islem, detay);
  res.json({ message: 'Bakım kaydı eklendi' });
});

// Tüm plakaları listele (distinct)
app.get('/api/plakalar', (req, res) => {
  const stmt = db.prepare('SELECT DISTINCT plaka FROM bakimlar');
  const plakalar = stmt.all().map(row => row.plaka);
  res.json(plakalar);
});

// Belirli plakaya ait tüm kayıtları sil
app.delete('/api/bakimlar/:plaka', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  const stmt = db.prepare('DELETE FROM bakimlar WHERE plaka = ?');
  const result = stmt.run(plaka);
  res.json({ message: `${result.changes} kayıt silindi.` });
});

// QR Kod üret
app.get('/api/qrcode/:plaka', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  const url = `http://localhost:${PORT}/api/bakimlar/${plaka}`;
  QRCode.toDataURL(url, (err, qrCodeDataUrl) => {
    if (err) return res.status(500).json({ message: 'QR kod oluşturulamadı' });
    res.json({ qrCode: qrCodeDataUrl });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portunda çalışıyor...`);
});
