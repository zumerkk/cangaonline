# 🏭 Canga Vardiya Yönetim Sistemi

**Savunma endüstrisi için özel tasarlanmış kapsamlı vardiya ve personel yönetim sistemi**

## 🎯 Özellikler

### 👥 **Personel Yönetimi**
- **Çalışan Yönetimi** - Kapsamlı personel veri tabanı
- **Stajyer & Çırak Takibi** - Özel kategori yönetimi
- **İşten Ayrılanlar** - Geçmişe dönük kayıtlar
- **Bulk Import/Export** - Excel ile toplu veri işleme

### 📅 **Vardiya Sistemi**
- **Akıllı Vardiya Planlama** - Sürükle-bırak ile kolay düzenleme
- **Takvim Entegrasyonu** - Görsel planlama araçları
- **Otomatik Liste Oluşturma** - Scheduled background jobs
- **Mobil Uyumlu Takvim** - Responsive tasarım

### 🚌 **Servis Yönetimi**
- **Güzergah Planlama** - Detaylı rota yönetimi
- **Yolcu Atama** - Çalışan-güzergah eşleştirme
- **Durak Yönetimi** - GPS koordinatları ile lokasyon takibi

### 📊 **Analytics & Raporlama**
- **Gerçek Zamanlı Dashboard** - KPI ve metrikler
- **Trend Analizi** - Departman bazlı istatistikler
- **Performance Monitoring** - Sistem optimizasyonu
- **🤖 AI Veri Analizi** - Gemini AI ile akıllı öneriler

### 🔧 **Database Management**
- **MongoDB Atlas Cloud** - Ölçeklenebilir veritabanı
- **Real-time Query Performance** - Optimize edilmiş sorgular
- **Backup & Restore** - Otomatik yedekleme sistemi
- **Advanced Indexing** - Hızlı veri erişimi

## 🏗️ Teknoloji Stack

### **Backend**
- **Node.js** + **Express.js** - RESTful API
- **MongoDB Atlas** - Cloud database
- **JWT Authentication** - Güvenli oturum yönetimi
- **Gemini AI** - Veri analizi ve akıllı öneriler
- **ExcelJS** - Excel dosya işleme
- **Multer** - Dosya yükleme

### **Frontend**
- **React 18** - Modern UI framework
- **Material-UI (MUI)** - Professional component library
- **Chart.js** + **Recharts** - Veri görselleştirme
- **React Router** - SPA navigation
- **Axios** - HTTP client
- **React Hot Toast** - Bildirim sistemi

## 🚀 Quick Start

### 1. **Repository Clone**
\`\`\`bash
git clone https://github.com/zumerkk/cangaonline.git
cd cangaonline
\`\`\`

### 2. **Dependencies Installation**
\`\`\`bash
# Root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-deps
\`\`\`

### 3. **Environment Configuration**

**Backend (.env)**
\`\`\`env
MONGODB_URI=your_mongodb_atlas_connection_string
NODE_ENV=development
PORT=5001
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_ai_key
\`\`\`

**Frontend (.env)**
\`\`\`env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_ENV=development
\`\`\`

### 4. **Run Development**
\`\`\`bash
# Start both backend and frontend
npm run dev

# Or separately:
npm run server  # Backend (Port 5001)
npm run client  # Frontend (Port 3000)
\`\`\`

## 📦 Build & Deploy

### **Production Build**
\`\`\`bash
npm run build
\`\`\`

### **Production Start**
\`\`\`bash
npm start
\`\`\`

## 🌐 Live Demo

- **Frontend**: [https://canga-frontend.onrender.com](https://canga-frontend.onrender.com)
- **Backend API**: [https://canga-backend.onrender.com](https://canga-backend.onrender.com)
- **API Health**: [https://canga-backend.onrender.com/api/health](https://canga-backend.onrender.com/api/health)

## 📖 API Documentation

### **Authentication**
- `POST /api/users/login` - Kullanıcı girişi
- `GET /api/users` - Kullanıcı listesi (SUPER_ADMIN)

### **Employees**
- `GET /api/employees` - Çalışan listesi
- `POST /api/employees` - Yeni çalışan
- `PUT /api/employees/:id` - Çalışan güncelle
- `DELETE /api/employees/:id` - Çalışan sil
- `POST /api/employees/bulk` - Toplu çalışan ekleme

### **Shifts**
- `GET /api/shifts` - Vardiya listesi
- `POST /api/shifts` - Yeni vardiya
- `PUT /api/shifts/:id` - Vardiya güncelle

### **Services**
- `GET /api/services/routes` - Servis güzergahları
- `POST /api/services/routes` - Yeni güzergah
- `GET /api/services/stats` - Servis istatistikleri

### **Analytics**
- `GET /api/analytics/dashboard` - Dashboard verileri
- `GET /api/analytics/templates` - Şablon kullanım analizi
- `GET /api/analytics/performance` - Sistem performansı

## 🔐 Authentication

Sistem JWT tabanlı authentication kullanır:
- **Session Süresi**: 1 saat
- **Otomatik Logout**: Session dolduğunda
- **Role-Based Access**: USER, ADMIN, SUPER_ADMIN rolleri

## 🤖 AI Features

**Gemini AI Entegrasyonu:**
- **İsim Benzerlik Analizi** - Duplike kayıt tespiti
- **Veri Tutarlılık Kontrolü** - Otomatik hata bulma
- **Akıllı Öneriler** - Sistem optimizasyon önerileri

## 📊 Performance Monitoring

- **Real-time Metrics** - Canlı sistem metrikleri
- **Database Indexing** - Optimize edilmiş sorgular
- **Cache Layer** - Hızlı veri erişimi
- **Load Balancing** - Ölçeklenebilir mimari

## 🔧 Advanced Features

### **Scheduled Lists (Background Jobs)**
- Otomatik vardiya listeleri oluşturma
- Zamanlanmış Excel export'ları
- E-posta bildirim sistemi

### **Excel Integration**
- Advanced import/export capabilities
- Template-based reporting
- Bulk data processing

### **Mobile Support**
- Responsive design
- Touch-friendly interface
- Mobile calendar view

## 📝 Development Notes

### **Code Standards**
- ES6+ JavaScript
- React Hooks pattern
- Material Design guidelines
- RESTful API conventions

### **Database Design**
- Normalized MongoDB schema
- Optimized indexing strategy
- Flexible document structure

## 🔍 Troubleshooting

### **Common Issues**

1. **MongoDB Connection Error**
   - Check MONGODB_URI environment variable
   - Verify Atlas cluster status
   - Check IP whitelist settings

2. **Authentication Issues**
   - Clear localStorage: `localStorage.clear()`
   - Check JWT_SECRET configuration
   - Verify user credentials

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version (>=16.0.0)
   - Verify all environment variables

## 👨‍💻 Developer

**Çanga Savunma Endüstrisi Ltd. Şti.**
- GitHub: [@zumerkk](https://github.com/zumerkk)
- Website: [canga.com.tr](https://canga.com.tr)

## 📄 License

ISC License - Çanga Savunma Endüstrisi Ltd. Şti.

---

**🎯 Professional Shift Management System for Defense Industry** 