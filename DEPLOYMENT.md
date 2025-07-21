# 🚀 Çanga Vardiya Sistemi - Deployment Rehberi

Bu rehber, Çanga Vardiya Sistemini ücretsiz hosting platformlarında test etmek için hazırlanmıştır.

## 🎯 **DEPLOYMENT SEÇENEKLERI**

### ✅ **Önerilen Seçenek: Railway + Vercel**
- **Backend:** Railway.app (Node.js hosting)
- **Frontend:** Vercel (React hosting) 
- **Database:** MongoDB Atlas (Zaten yapılandırılmış)

### 🔄 **Alternatif Seçenekler**
1. **Render.com** (Full-stack)
2. **Netlify + Railway** 
3. **Heroku** (Artık ücretsiz değil)

---

## 📋 **1. RAILWAY.APP BACKEND DEPLOYMENT**

### 🔧 **Adım 1: Railway Hesabı Oluşturma**
1. [Railway.app](https://railway.app) adresine git
2. GitHub ile giriş yap
3. "New Project" butonuna tıkla
4. "Deploy from GitHub repo" seçeneğini seç

### ⚙️ **Adım 2: Repository Bağlama**
1. Bu projeyi GitHub'a push et
2. Railway'de repository'yi seç
3. "server" klasörünü root olarak ayarla
4. Deploy butonuna tıkla

### 🌍 **Adım 3: Environment Variables**
Railway dashboard'da şu değişkenleri ekle:

```env
MONGODB_URI=mongodb+srv://thebestkekilli:Z56uhyL13kQlOERM@canga.rgadvdl.mongodb.net/canga?retryWrites=true&w=majority
NODE_ENV=production
PORT=5001
CLIENT_URL=https://your-frontend-url.vercel.app
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 📡 **Adım 4: Domain Alama**
- Railway otomatik olarak bir URL verecek: `https://your-project-name.railway.app`
- Bu URL'i not et, frontend'de kullanacağız

---

## 🎨 **2. VERCEL FRONTEND DEPLOYMENT**

### 🔧 **Adım 1: Vercel Hesabı**
1. [Vercel.com](https://vercel.com) adresine git
2. GitHub ile giriş yap
3. "New Project" butonuna tıkla

### 📁 **Adım 2: Client Klasörü Deploy**
1. Repository'yi seç
2. "Framework Preset" olarak "Create React App" seç
3. "Root Directory" olarak "client" klasörünü seç
4. Deploy butonuna tıkla

### 🌍 **Adım 3: Environment Variables**
Vercel dashboard'da şu değişkenleri ekle:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_NAME=Çanga Vardiya Sistemi
REACT_APP_VERSION=1.0.0
```

---

## 🛠️ **3. HIZLI DEPLOY KOMUTLARİ**

### 📦 **Railway CLI ile Deploy** (Opsiyonel)
```bash
# Railway CLI kurulumu
npm install -g @railway/cli

# Login
railway login

# Backend deploy 
cd server
railway deploy

# Environment variables ayarla
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set NODE_ENV=production
```

### 🎨 **Vercel CLI ile Deploy** (Opsiyonel)
```bash
# Vercel CLI kurulumu
npm install -g vercel

# Frontend deploy
cd client
vercel

# Environment variables ayarla
vercel env add REACT_APP_API_URL
```

---

## 🔗 **4. URL BAĞLAMA**

### 🔄 **CORS Ayarı**
Backend deploy edildikten sonra, `server/index.js` dosyasında:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-url.vercel.app', // Vercel URL'ini ekle
  'https://canga-vardiya-sistemi.vercel.app' // Örnek
];
```

### 📡 **Frontend API URL**
Client deploy edildikten sonra, environment variables'ı güncelle:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

---

## ✅ **5. TEST KULLANICI BİLGİLERİ**

### 🔐 **Ana Admin Hesabı**
- **Şifre:** `28150503`
- **Rol:** SUPER_ADMIN
- **Yetkiler:** Tüm sistem erişimi

### 👥 **Demo Kullanıcı Hesapları**
Test kullanıcıların sisteme giriş yapabilmesi için admin panelinden yeni kullanıcılar oluşturabilirsin.

---

## 🚨 **6. DEPLOYMENT SONRASI KONTROLLER**

### ✔️ **Backend Kontrolü**
- [ ] `https://your-backend-url.railway.app` açılıyor mu?
- [ ] `/api/employees` endpoint çalışıyor mu?
- [ ] MongoDB bağlantısı başarılı mı?

### ✔️ **Frontend Kontrolü**  
- [ ] `https://your-frontend-url.vercel.app` açılıyor mu?
- [ ] Login sayfası görünüyor mu?
- [ ] `28150503` şifresi ile giriş yapabiliyor musun?

### ✔️ **Integration Kontrolü**
- [ ] Dashboard verileri yükleniyor mu?
- [ ] Çalışanlar listesi görünüyor mu?  
- [ ] Excel export çalışıyor mu?

---

## 🆘 **SORUN GİDERME**

### ❌ **CORS Hatası**
```
Access to fetch at 'backend-url' from origin 'frontend-url' has been blocked by CORS policy
```
**Çözüm:** Backend'de `allowedOrigins` listesine frontend URL'ini ekle

### ❌ **Database Bağlantı Hatası**
```
MongoDB connection error
```
**Çözüm:** MONGODB_URI environment variable'ını kontrol et

### ❌ **Build Hatası**
```
Module not found: Can't resolve...
```
**Çözüm:** `npm install` komutunu çalıştır, dependencies'leri kontrol et

---

## 📞 **DESTEK**

Deployment sırasında sorun yaşarsan:
1. Railway/Vercel logs'larını kontrol et
2. Browser developer tools'dan network tab'ını incele  
3. GitHub Issues'a sorun bildir

---

## 🎉 **DEPLOYMENT TAMAMLANDI!**

Başarılı deployment sonrası elimizde şunlar olacak:

- ✅ **Backend URL:** `https://your-project.railway.app`
- ✅ **Frontend URL:** `https://your-project.vercel.app`  
- ✅ **Admin Panel:** Login: `28150503`
- ✅ **Test Kullanıcıları için linkler**

Bu URL'leri test kullanıcılarına paylaşabilirsin! 🚀 