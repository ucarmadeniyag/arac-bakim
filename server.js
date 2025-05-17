const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const DATA_FILE = 'bakimlar.json';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const USERS = {
  'admin': '12345',
  'user1': 'password1'
};

// Statik dosyaları public klasöründen sun
app.use(express.static(path.join(__dirname, 'public')));

// GET / — ana sayfa olarak login sayfasını göster
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// GET /login — login sayfasını göster (opsiyonel, aynı işlev)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// POST /login — giriş işlemini yap
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (USERS[username] && USERS[username] === password) {
    // Başarılı giriş, yönlendir
    res.redirect('/dashboard.html');
  } else {
    res.send('Kullanıcı adı veya şifre yanlış.');
  }
});

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

// Diğer API route'lar burada devam eder...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});
