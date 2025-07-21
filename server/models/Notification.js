const mongoose = require('mongoose');

// Bildirim Şeması - Profesyonel bildirim sistemi
const notificationSchema = new mongoose.Schema({
  // Bildirim Temel Bilgileri
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Bildirim Türü
  type: {
    type: String,
    required: true,
    enum: [
      'VARDIYA_DEGISIKLIGI',    // Vardiya değişikliği
      'SERVIS_GUNCELLEME',      // Servis programı güncelleme
      'CALISAN_EKLENDI',        // Yeni çalışan eklendi
      'CALISAN_AYRILDI',        // Çalışan ayrıldı
      'SISTEM_BAKIMI',          // Sistem bakımı
      'GENEL_DUYURU',          // Genel duyuru
      'ACIL_DURUM',            // Acil durum
      'IZIN_ONAY',             // İzin onayı
      'VARDIYA_HATIRLATICI',   // Vardiya hatırlatıcısı
      'RAPOR_HAZIR',           // Rapor hazır
      'EXCEL_IMPORT',          // Excel import sonucu
      'BACKUP_TAMAMLANDI'      // Yedekleme tamamlandı
    ]
  },
  
  // Öncelik Seviyesi
  priority: {
    type: String,
    default: 'NORMAL',
    enum: ['DUSUK', 'NORMAL', 'YUKSEK', 'KRITIK']
  },
  
  // Durum
  status: {
    type: String,
    default: 'AKTIF',
    enum: ['AKTIF', 'OKUNDU', 'ARSIVLENDI', 'SILINDI']
  },
  
  // Hedef Kitle
  targetAudience: {
    type: String,
    default: 'GENEL',
    enum: [
      'GENEL',              // Tüm kullanıcılar
      'YONETICILER',        // Sadece yöneticiler
      'DEPARTMAN',          // Belirli departman
      'LOKASYON',           // Belirli lokasyon
      'VARDIYA_GRUBU',      // Belirli vardiya grubu
      'SERVIS_KULLANICILARI' // Servis kullananlar
    ]
  },
  
  // Hedef Filtreler
  targetFilters: {
    departments: [String],  // Hedef departmanlar
    locations: [String],    // Hedef lokasyonlar
    employeeIds: [{         // Belirli çalışanlar
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }]
  },
  
  // İlgili Kayıt
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['SHIFT', 'EMPLOYEE', 'SERVICE_SCHEDULE', 'SERVICE_ROUTE', 'REPORT']
    },
    entityId: mongoose.Schema.Types.ObjectId,
    entityName: String
  },
  
  // Aksiyon Gerektiriyor mu?
  requiresAction: {
    type: Boolean,
    default: false
  },
  
  // Aksiyon Bilgileri
  actionInfo: {
    actionType: {
      type: String,
      enum: ['ONAY_BEKLIYOR', 'GORUNTULE', 'INDIR', 'GUNCELLE', 'NONE']
    },
    actionUrl: String,
    actionText: String,
    deadline: Date
  },
  
  // Okunma Bilgileri
  readBy: [{
    userId: String,
    userName: String,
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Otomatik Silme
  autoDelete: {
    enabled: {
      type: Boolean,
      default: false
    },
    deleteAfterDays: {
      type: Number,
      default: 30
    }
  },
  
  // Bildirim Ayarları
  settings: {
    showInDashboard: {
      type: Boolean,
      default: true
    },
    sendEmail: {
      type: Boolean,
      default: false
    },
    sendSMS: {
      type: Boolean,
      default: false
    },
    persistent: {
      type: Boolean,
      default: false  // Kalıcı bildirim mi?
    }
  },
  
  // Oluşturan
  createdBy: {
    userId: String,
    userName: String
  },
  
  // Tarihler
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,  // Bildirim sona erme tarihi
  
  // Metadata
  metadata: {
    icon: String,     // Bildirim ikonu
    color: String,    // Bildirim rengi
    sound: String,    // Bildirim sesi
    image: String     // Bildirim resmi
  }
});

// Index'ler - performans için
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ targetAudience: 1, createdAt: -1 });
notificationSchema.index({ 'targetFilters.departments': 1 });
notificationSchema.index({ 'targetFilters.locations': 1 });
notificationSchema.index({ 'targetFilters.employeeIds': 1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual - okunma oranı
notificationSchema.virtual('readPercentage').get(function() {
  if (this.readBy.length === 0) return 0;
  // Bu basit hesaplama, gerçekte hedef kitle sayısına göre hesaplanmalı
  return Math.min(100, (this.readBy.length / 10) * 100);
});

// Static methods - bildirim oluşturma yardımcıları
notificationSchema.statics.createShiftNotification = function(shiftData, changeType) {
  return this.create({
    title: `Vardiya ${changeType}`,
    message: `${shiftData.title} vardiyasında değişiklik yapıldı.`,
    type: 'VARDIYA_DEGISIKLIGI',
    priority: 'YUKSEK',
    targetAudience: 'DEPARTMAN',
    targetFilters: {
      departments: shiftData.departments || [],
      locations: [shiftData.location]
    },
    relatedEntity: {
      entityType: 'SHIFT',
      entityId: shiftData._id,
      entityName: shiftData.title
    },
    requiresAction: true,
    actionInfo: {
      actionType: 'GORUNTULE',
      actionUrl: `/shifts/${shiftData._id}`,
      actionText: 'Vardiyayı Görüntüle'
    },
    createdBy: {
      userId: 'system',
      userName: 'Sistem'
    },
    metadata: {
      icon: 'schedule',
      color: '#1976d2'
    }
  });
};

notificationSchema.statics.createServiceNotification = function(serviceData, changeType) {
  return this.create({
    title: `Servis ${changeType}`,
    message: `${serviceData.title} servis programında güncelleme yapıldı.`,
    type: 'SERVIS_GUNCELLEME',
    priority: 'NORMAL',
    targetAudience: 'SERVIS_KULLANICILARI',
    relatedEntity: {
      entityType: 'SERVICE_SCHEDULE',
      entityId: serviceData._id,
      entityName: serviceData.title
    },
    requiresAction: true,
    actionInfo: {
      actionType: 'GORUNTULE',
      actionUrl: `/services`,
      actionText: 'Servis Yönetimini Görüntüle'
    },
    createdBy: {
      userId: 'system',
      userName: 'Sistem'
    },
    metadata: {
      icon: 'directions_bus',
      color: '#4caf50'
    }
  });
};

notificationSchema.statics.createSystemNotification = function(title, message, priority = 'NORMAL') {
  return this.create({
    title,
    message,
    type: 'GENEL_DUYURU',
    priority,
    targetAudience: 'GENEL',
    requiresAction: false,
    createdBy: {
      userId: 'system',
      userName: 'Sistem'
    },
    settings: {
      showInDashboard: true,
      persistent: priority === 'KRITIK'
    },
    metadata: {
      icon: 'info',
      color: priority === 'KRITIK' ? '#f44336' : '#2196f3'
    }
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 