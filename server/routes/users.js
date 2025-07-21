const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Auth middleware - Basit şifre kontrolü (geçici)
const authenticateAdmin = async (req, res, next) => {
  try {
    const { adminpassword } = req.headers; // Express headers'ları lowercase yapar!
    
    // Ana admin şifresi kontrolü veya kullanıcı token kontrolü
    if (adminpassword === '28150503') {
      req.user = { role: 'SUPER_ADMIN', password: '28150503' };
      return next();
    }
    
    // Diğer kullanıcılar için şifre ile kontrol
    if (adminpassword) {
      const user = await User.findByPassword(adminpassword);
      if (user) {
        req.user = user;
        return next();
      }
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Yetkisiz erişim. Geçerli şifre gerekli.' 
    });
  } catch (error) {
    console.error('❌ Auth middleware hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Yetki kontrolü sırasında hata oluştu' 
    });
  }
};

// Sadece SUPER_ADMIN kontrolü
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Bu işlem için süper admin yetkisi gerekli' 
    });
  }
  next();
};

// Test endpoint'leri kaldırıldı - production ready

// 🔐 LOGİN - Şifre ile giriş yapma
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Şifre gerekli' 
      });
    }
    
    // Ana admin kontrolü (28150503)
    if (password === '28150503') {
      const adminUser = {
        id: 'super-admin',
        name: 'Çanga Ana Yöneticisi',
        email: 'admin@canga.com.tr',
        phone: '+90 (332) 123 45 67',
        department: 'İDARİ BİRİM',
        position: 'Sistem Yöneticisi',
        location: 'MERKEZ ŞUBE',
        employeeId: 'ADMIN-001',
        role: 'SUPER_ADMIN',
        isActive: true,
        lastLogin: new Date(),
        loginTime: new Date().toISOString()
      };
      
      return res.json({
        success: true,
        message: 'Giriş başarılı! Ana admin olarak giriş yaptınız.',
        user: adminUser
      });
    }
    
    // Normal kullanıcı kontrolü
    const user = await User.findByPassword(password);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Geçersiz şifre' 
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Hesabınız deaktif durumda. Lütfen yöneticinize başvurun.' 
      });
    }
    
    // Giriş kaydını güncelle
    await user.recordLogin();
    
    // Başarılı giriş
    res.json({
      success: true,
      message: 'Giriş başarılı!',
      user: {
        ...user.toJSON(),
        loginTime: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Giriş sırasında hata oluştu' 
    });
  }
});

// 👥 TÜM KULLANICILARI GETİR - Sadece süper admin görebilir
router.get('/', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('-password'); // Şifreleri gizle
    
    res.json({
      success: true,
      message: 'Kullanıcılar başarıyla getirildi',
      users: users,
      count: users.length
    });
    
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kullanıcılar getirilirken hata oluştu' 
    });
  }
});

// Otomatik çalışan ID üretici fonksiyonu
const generateEmployeeId = async () => {
  try {
    // Mevcut kullanıcı sayısını al (sadece aktif kullanıcılar)
    const userCount = await User.countDocuments({ isActive: true });
    
    // Yeni sıra numarası = mevcut kullanıcı sayısı + 1
    const nextNumber = userCount + 1;
    
    // USR-001, USR-002 formatında ID oluştur
    const employeeId = `USR-${nextNumber.toString().padStart(3, '0')}`;
    
    // Eğer bu ID zaten varsa (nadir durumda), bir sonrakini dene
    const existingUser = await User.findOne({ employeeId });
    if (existingUser) {
      // Rekürsif olarak bir sonraki ID'yi dene
      return await generateEmployeeId();
    }
    
    return employeeId;
  } catch (error) {
    console.error('Employee ID oluşturma hatası:', error);
    // Fallback: timestamp kullan
    const timestamp = Date.now().toString().slice(-6);
    return `USR-${timestamp}`;
  }
};

// ➕ YENİ KULLANICI OLUŞTUR - Sadece süper admin oluşturabilir
router.post('/', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { 
      password, 
      name, 
      email, 
      phone, 
      department, 
      position, 
      location
    } = req.body;
    
    // Zorunlu alanları kontrol et (employeeId artık gerekli değil, otomatik oluşturuluyor)
    if (!password || !name || !email || !department || !position || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gerekli alanlar: şifre, ad, email, departman, pozisyon, lokasyon' 
      });
    }
    
    // Şifre benzersizlik kontrolü
    const existingPasswordUser = await User.findOne({ password });
    if (existingPasswordUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu şifre zaten kullanılıyor. Farklı bir şifre seçin.' 
      });
    }
    
    // Otomatik çalışan ID oluştur
    const employeeId = await generateEmployeeId();
    
    // Yeni kullanıcı oluştur
    const newUser = new User({
      password,
      name,
      email,
      phone,
      department,
      position,
      location,
      employeeId, // Otomatik oluşturulan ID
      role: 'USER', // Normal kullanıcı
      isActive: true,
      createdBy: req.user.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : req.user._id
    });
    
    await newUser.save();
    
    res.status(201).json({
      success: true,
      message: `Kullanıcı başarıyla oluşturuldu! Çalışan ID: ${employeeId}`,
      user: newUser.toJSON()
    });
    
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field} zaten kullanılıyor` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Kullanıcı oluşturulurken hata oluştu' 
    });
  }
});

// ✏️ KULLANICI GÜNCELLE - Kendi profilini güncelleyebilir veya süper admin herkesi güncelleyebilir
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Güvenlik: Normal kullanıcı sadece kendi profilini güncelleyebilir
    if (req.user.role !== 'SUPER_ADMIN' && req.user._id.toString() !== id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Sadece kendi profilinizi güncelleyebilirsiniz' 
      });
    }
    
    // Hassas alanları koruma
    const allowedUpdates = ['name', 'email', 'phone', 'position'];
    
    // Süper admin daha fazla alan güncelleyebilir
    if (req.user.role === 'SUPER_ADMIN') {
      allowedUpdates.push('department', 'location', 'employeeId', 'isActive');
    }
    
    // Güncelleme verilerini filtrele
    const filteredUpdates = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      id, 
      filteredUpdates, 
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi!',
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Güncelleme sırasında hata oluştu' 
    });
  }
});

// 🗑️ KULLANICI SİL - Sadece süper admin silebilir
router.delete('/:id', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id, 
      { isActive: false }, // Soft delete - veriyi silmek yerine deaktif et
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    res.json({
      success: true,
      message: 'Kullanıcı başarıyla deaktif edildi',
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Silme sırasında hata oluştu' 
    });
  }
});

// 🔄 KULLANICI AKTİF ET - Sadece süper admin aktif edebilir
router.patch('/:id/activate', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id, 
      { isActive: true }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    res.json({
      success: true,
      message: 'Kullanıcı başarıyla aktif edildi',
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Kullanıcı aktif etme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Aktivasyon sırasında hata oluştu' 
    });
  }
});

// 📊 KULLANICI İSTATİSTİKLERİ - Sadece süper admin görebilir
router.get('/stats', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const activeUsers = await User.countDocuments({ isActive: true, lastLogin: { $exists: true } });
    const departmentStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        departmentStats
      }
    });
    
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'İstatistikler alınırken hata oluştu' 
    });
  }
});

module.exports = router; 