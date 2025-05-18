const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const bodyParser = require('body-parser'); // login için
app.use(bodyParser.urlencoded({ extended: true }));

const DATA_FILE = 'bakimlar.json';

// Statik dosyaları public klasöründen sun
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// -------------------- LOGIN --------------------

const USER = {
  username: 'admin',
  password: '1234'
};

// Login sayfası (ana dizin)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login işlemi
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    // Başarılı giriş: anasayfa.html göster
    res.redirect('/anasayfa.html');
  } else {
    res.send(`
      <h2>Hatalı kullanıcı adı veya şifre!</h2>
      <a href="/">Geri dön</a>
    `);
  }
});

// --------------- API ROUTELARI ------------------

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
app.delete('/api/bakimlar/:plaka/:anasayfa', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  const anasayfa = parseInt(req.params.anasayfa);

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Sunucu hatası' });

    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: 'Veri okuma hatası' });
    }

    if (!json[plaka]) return res.status(404).json({ message: 'Plaka bulunamadı' });

    if (isNaN(anasayfa) || anasayfa < 0 || anasayfa >= json[plaka].length) {
      return res.status(400).json({ message: 'Geçersiz kayıt indeksi' });
    }

    json[plaka].splice(anasayfa, 1); // Kaydı sil

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
    if (err) {
      if (err.code === 'ENOENT') {
        const json = {};
        json[plaka] = [{ tarih, islem }];
        return fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2), (err) => {
          if (err) return res.status(500).json({ message: 'Dosya yazma hatası' });
          res.json({ message: 'Bakım kaydı eklendi' });
        });
      }
      return res.status(500).json({ message: 'Sunucu hatası' });
    }

    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: 'Veri okuma hatası' });
    }

    if (!json[plaka]) {
      json[plaka] = [];
    }

    json[plaka].push({ tarih, islem });

    fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Dosya yazma hatası' });
      res.json({ message: 'Bakım kaydı eklendi' });
    });
  });
});

// Tüm plakaları listeleyen API
app.get('/api/plakalar', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: 'Veri okuma hatası' });
    }
    const plakalar = Object.keys(json);
    res.json(plakalar);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});
