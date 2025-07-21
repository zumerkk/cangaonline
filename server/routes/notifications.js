const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const SystemLog = require('../models/SystemLog');

// Tüm bildirimleri getir (sayfalama ve filtreleme ile)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      priority,
      status = 'AKTIF',
      targetAudience,
      startDate,
      endDate
    } = req.query;

    // Filtre oluştur
    const filter = {};
    
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (targetAudience) filter.targetAudience = targetAudience;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Bildirimleri getir
    const notifications = await Notification.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedEntity.entityId', 'title name')
      .lean();

    // Toplam sayı
    const total = await Notification.countDocuments(filter);

    // Priority sıralaması için mapping
    const priorityOrder = { 'KRITIK': 4, 'YUKSEK': 3, 'NORMAL': 2, 'DUSUK': 1 };
    
    // Bildirimleri önceliğe göre sırala
    notifications.sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: notifications.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Bildirimler getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler getirilemedi',
      error: error.message
    });
  }
});

// Okunmamış bildirim sayısını getir - timeout koruması ile
router.get('/unread-count', async (req, res) => {
  try {
    const { userId = 'admin' } = req.query;
    
    // MongoDB bağlantısı kontrol et
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: { count: 0 },
        message: 'Veritabanı bağlantısı bekleniyor'
      });
    }

    // Timeout ile count - 5 saniye limit
    const count = await Promise.race([
      Notification.countDocuments({
        status: 'AKTIF',
        'readBy.userId': { $ne: userId }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      )
    ]);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Okunmamış bildirim sayısı hatası:', error);
    
    // Timeout durumunda varsayılan değer döndür
    if (error.message === 'Query timeout' || error.message.includes('buffering timed out')) {
      return res.json({
        success: true,
        data: { count: 0 },
        message: 'Veritabanı sorgusu zaman aşımına uğradı'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Okunmamış bildirim sayısı alınamadı',
      error: error.message,
      data: { count: 0 }
    });
  }
});

// Son bildirimleri getir (dashboard için)
router.get('/recent', async (req, res) => {
  try {
    const { limit = 5, userId = 'admin' } = req.query;

    const notifications = await Notification.find({
      status: 'AKTIF'
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('relatedEntity.entityId', 'title name')
      .lean();

    // Okunma durumunu kontrol et
    const notificationsWithReadStatus = notifications.map(notification => ({
      ...notification,
      isRead: notification.readBy.some(read => read.userId === userId)
    }));

    res.json({
      success: true,
      data: notificationsWithReadStatus
    });
  } catch (error) {
    console.error('Son bildirimler getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Son bildirimler getirilemedi',
      error: error.message
    });
  }
});

// Belirli bir bildirimi getir
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('relatedEntity.entityId')
      .lean();

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Bildirim getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim getirilemedi',
      error: error.message
    });
  }
});

// Yeni bildirim oluştur
router.post('/', async (req, res) => {
  try {
    const notificationData = req.body;
    
    // Oluşturan bilgisini ekle
    notificationData.createdBy = {
      userId: 'admin',
      userName: 'Sistem Yöneticisi'
    };

    const notification = new Notification(notificationData);
    await notification.save();

    // Log kaydı
    await SystemLog.logUserAction(
      'NOTIFICATION_CREATED',
      { id: 'admin', name: 'Sistem Yöneticisi' },
      `Yeni bildirim oluşturuldu: ${notification.title}`,
      {
        entityType: 'NOTIFICATION',
        entityId: notification._id,
        entityName: notification.title
      }
    );

    res.status(201).json({
      success: true,
      message: 'Bildirim başarıyla oluşturuldu',
      data: notification
    });
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim oluşturulamadı',
      error: error.message
    });
  }
});

// Bildirimi okundu olarak işaretle
router.put('/:id/read', async (req, res) => {
  try {
    const { userId = 'admin', userName = 'Kullanıcı' } = req.body;
    
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    // Zaten okunmuş mu kontrol et
    const alreadyRead = notification.readBy.some(read => read.userId === userId);
    
    if (!alreadyRead) {
      notification.readBy.push({
        userId,
        userName,
        readAt: new Date()
      });
      
      await notification.save();

      // Log kaydı
      await SystemLog.logUserAction(
        'NOTIFICATION_READ',
        { id: userId, name: userName },
        `Bildirim okundu: ${notification.title}`,
        {
          entityType: 'NOTIFICATION',
          entityId: notification._id,
          entityName: notification.title
        }
      );
    }

    res.json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi'
    });
  } catch (error) {
    console.error('Bildirim okundu işaretleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim okundu olarak işaretlenemedi',
      error: error.message
    });
  }
});

// Tüm bildirimleri okundu olarak işaretle
router.put('/mark-all-read', async (req, res) => {
  try {
    const { userId = 'admin', userName = 'Kullanıcı' } = req.body;

    // Okunmamış bildirimleri bul
    const unreadNotifications = await Notification.find({
      status: 'AKTIF',
      'readBy.userId': { $ne: userId }
    });

    // Hepsini okundu olarak işaretle
    for (const notification of unreadNotifications) {
      notification.readBy.push({
        userId,
        userName,
        readAt: new Date()
      });
      await notification.save();
    }

    // Log kaydı
    await SystemLog.logUserAction(
      'NOTIFICATION_READ',
      { id: userId, name: userName },
      `${unreadNotifications.length} bildirim toplu okundu`
    );

    res.json({
      success: true,
      message: `${unreadNotifications.length} bildirim okundu olarak işaretlendi`
    });
  } catch (error) {
    console.error('Toplu okundu işaretleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler okundu olarak işaretlenemedi',
      error: error.message
    });
  }
});

// Bildirimi sil
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    // Soft delete - durumu silindi olarak işaretle
    notification.status = 'SILINDI';
    await notification.save();

    // Log kaydı
    await SystemLog.logUserAction(
      'NOTIFICATION_DELETED',
      { id: 'admin', name: 'Sistem Yöneticisi' },
      `Bildirim silindi: ${notification.title}`,
      {
        entityType: 'NOTIFICATION',
        entityId: notification._id,
        entityName: notification.title
      }
    );

    res.json({
      success: true,
      message: 'Bildirim başarıyla silindi'
    });
  } catch (error) {
    console.error('Bildirim silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim silinemedi',
      error: error.message
    });
  }
});

// Bildirim türleri ve istatistikleri
router.get('/stats/summary', async (req, res) => {
  try {
    // Tür bazlı sayılar
    const typeStats = await Notification.aggregate([
      { $match: { status: 'AKTIF' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Öncelik bazlı sayılar
    const priorityStats = await Notification.aggregate([
      { $match: { status: 'AKTIF' } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Günlük bildirim sayıları (son 7 gün)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await Notification.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Toplam sayılar
    const totalActive = await Notification.countDocuments({ status: 'AKTIF' });
    const totalRead = await Notification.countDocuments({ 'readBy.0': { $exists: true } });
    const totalUnread = totalActive - totalRead;

    res.json({
      success: true,
      data: {
        summary: {
          totalActive,
          totalRead,
          totalUnread,
          readPercentage: totalActive > 0 ? Math.round((totalRead / totalActive) * 100) : 0
        },
        typeStats,
        priorityStats,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Bildirim istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim istatistikleri alınamadı',
      error: error.message
    });
  }
});

// Test bildirimi oluştur (geliştirme için)
router.post('/test/create', async (req, res) => {
  try {
    const testNotifications = [
      {
        title: 'Vardiya Değişikliği',
        message: 'TORNA GRUBU vardiyasında değişiklik yapıldı.',
        type: 'VARDIYA_DEGISIKLIGI',
        priority: 'YUKSEK',
        targetAudience: 'DEPARTMAN',
        targetFilters: { departments: ['TORNA GRUBU'] }
      },
      {
        title: 'Servis Güncelleme',
        message: 'ÇARŞI MERKEZ servis güzergahında güncelleme yapıldı.',
        type: 'SERVIS_GUNCELLEME',
        priority: 'NORMAL',
        targetAudience: 'SERVIS_KULLANICILARI'
      },
      {
        title: 'Sistem Bakımı',
        message: 'Sistem bakımı 23:00-01:00 saatleri arasında yapılacaktır.',
        type: 'SISTEM_BAKIMI',
        priority: 'KRITIK',
        targetAudience: 'GENEL'
      }
    ];

    const createdNotifications = [];
    
    for (const notifData of testNotifications) {
      notifData.createdBy = {
        userId: 'system',
        userName: 'Test Sistemi'
      };
      
      const notification = new Notification(notifData);
      await notification.save();
      createdNotifications.push(notification);
    }

    res.json({
      success: true,
      message: `${createdNotifications.length} test bildirimi oluşturuldu`,
      data: createdNotifications
    });
  } catch (error) {
    console.error('Test bildirimi oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Test bildirimleri oluşturulamadı',
      error: error.message
    });
  }
});

module.exports = router; 