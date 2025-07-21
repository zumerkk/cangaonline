const mongoose = require('mongoose');

// 🍽️ Yemek molası hesaplama fonksiyonu
const calculateWorkingHours = (timeSlot) => {
  if (!timeSlot || typeof timeSlot !== 'string') return 8; // Varsayılan 8 saat
  
  // Saat aralığından başlangıç ve bitiş saatlerini çıkar
  const [startTime, endTime] = timeSlot.split('-');
  if (!startTime || !endTime) return 8;
  
  // Saat:dakika formatını parse et
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes || 0) / 60;
  };
  
  const startHour = parseTime(startTime);
  let endHour = parseTime(endTime);
  
  // Gece vardiyası için (24:00 veya 00:00 geçen saatler)
  if (endHour <= startHour) {
    endHour += 24;
  }
  
  // Brüt çalışma saati
  const grossHours = endHour - startHour;
  
  // 🍽️ Yemek molası hesaplama kuralları
  // 08:00-18:00 (10 saat) -> 1 saat yemek molası düş = 9 saat
  // Diğer tüm vardiyalar -> 30 dk (0.5 saat) yemek molası düş
  if (timeSlot === '08:00-18:00') {
    return grossHours - 1; // 10 - 1 = 9 saat
  } else {
    // Diğer tüm vardiyalar için 30 dk düş
    return grossHours - 0.5; // Örnek: 8 - 0.5 = 7.5 saat
  }
};

// Vardiya Şeması - Excel'deki yapıya göre tasarlandı
const shiftSchema = new mongoose.Schema({
  // Vardiya Temel Bilgileri
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Tarih Bilgileri
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Lokasyon - Excel'e göre güncellendi + Dinamik lokasyon desteği
  location: {
    type: String,
    required: true,
    trim: true
    // enum kaldırıldı - yeni lokasyonların dinamik olarak eklenmesini sağlar
  },
  
  // Fabrika Genel Sorumlusu - Excel'de görülen bilgi
  generalManager: {
    name: {
      type: String,
      default: function() {
        // Lokasyona göre varsayılan sorumlu
        if (this.location === 'İŞL') return 'BATUHAN İLHAN';
        return 'BİLAL CEVİZOĞLU';
      }
    },
    title: {
      type: String,
      default: 'FABRİKA GENEL SORUMLUSU'
    }
  },
  
  // Bölüm Sorumlusu - Excel'de görülen ikinci sorumlu
  departmentManager: {
    name: {
      type: String,
      default: function() {
        // Lokasyona göre varsayılan bölüm sorumlusu
        if (this.location === 'İŞL') return 'BATUHAN İLHAN';
        return 'MURAT ÇAVDAR';
      }
    },
    title: {
      type: String,
      default: 'BÖLÜM SORUMLUSU'
    }
  },
  
  // Ustabaşı bilgisi - Excel'de görülen
  supervisor: {
    name: {
      type: String,
      default: function() {
        // Lokasyona göre varsayılan ustabaşı
        if (this.location === 'İŞL') {
          return 'ALİ ŞİŞ YORULMAZ'; // İŞL için
        }
        return 'MURAT SEPETÇİ'; // MERKEZ için
      }
    },
    title: {
      type: String,
      default: 'USTABAŞI'
    }
  },

  // Vardiya Grupları - resimlerden çıkardığım yapı
  shiftGroups: [{
    // Grup Bilgileri - Excel'e göre basitleştirildi + Dinamik grup adları
    groupName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100
      // Enum kaldırıldı - dinamik departman isimlerini desteklemek için
    },
    
    // Bölüm Sorumlusu (opsiyonel - bazı bölümlerin kendi sorumlusu var)
    sectionManager: {
      name: String,
      title: {
        type: String,
        default: 'BÖLÜM SORUMLUSU'
      }
    },
    
    // Ustabaşı (opsiyonel - bazı bölümlerin kendi ustabaşısı var)
    sectionSupervisor: {
      name: String,
      title: {
        type: String,
        default: 'USTABAŞI'
      }
    },
    
    // Vardiya Saatleri
    shifts: [{
      // Saat Aralığı - Dinamik saat aralıkları desteklenir
      timeSlot: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: function(v) {
            // Saat formatı kontrolü: HH:MM-HH:MM (24:00 gece vardiyası için geçerli)
            const timeSlotRegex = /^([01]?[0-9]|2[0-4]):[0-5][0-9]-([01]?[0-9]|2[0-4]):[0-5][0-9]$/;
            
            if (!timeSlotRegex.test(v)) return false;
            
            // 24:XX sadece 24:00 olabilir (gece vardiyası bitiş saati)
            const [startTime, endTime] = v.split('-');
            if (startTime.startsWith('24:') && startTime !== '24:00') return false;
            if (endTime.startsWith('24:') && endTime !== '24:00') return false;
            
            return true;
          },
          message: 'Saat aralığı formatı HH:MM-HH:MM şeklinde olmalıdır (örn: 08:00-18:00, 16:00-24:00)'
        }
        // enum kaldırıldı - kullanıcılar özel saat aralıkları girebilir
      },
      
      // Bu saatte çalışacak personeller
      employees: [{
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
          required: true
        },
        name: String, // Hızlı erişim için
        
        // Giriş-Çıkış Saatleri (Excel'de görülen yapı)
        entryTime: String,  // Giriş saati
        exitTime: String,   // Çıkış saati
        signature: String,  // İmza alanı
        
        // Durum bilgileri
        status: {
          type: String,
          default: 'PLANLANDI',
          enum: ['PLANLANDI', 'GELDİ', 'GİTTİ', 'DEVAMSIZ', 'İZİNLİ']
        }
      }],
      
      // Vardiya toplam saat - YENİ HESAPLAMA İLE
      totalHours: {
        type: Number,
        default: function() {
          // Yemek molası düşerek hesapla
          return calculateWorkingHours(this.timeSlot);
        }
      }
    }]
  }],
  
  // Özel Çalışma Grupları - Örneklerdeki gruplar
  specialGroups: [{
    groupType: {
      type: String,
      enum: [
        'STAJYER ÖĞRENCİ LİSE',
        'ÇIRAK LİSE', 
        'FAZLA ÇALIŞMA LİSTESİ',
        'İDARİ KISIM',
        'ÖZEL GÜVENLİK',
        'TEKNİK OFİS / BAKIM ONARIM'
      ]
    },
    timeSlot: String,
    employees: [{
      employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      },
      name: String,
      entryTime: String,
      exitTime: String,
      signature: String,
      status: {
        type: String,
        default: 'PLANLANDI',
        enum: ['PLANLANDI', 'GELDİ', 'GİTTİ', 'DEVAMSIZ', 'İZİNLİ']
      }
    }]
  }],
  
  // Vardiya Durumu
  status: {
    type: String,
    default: 'TASLAK',
    enum: ['TASLAK', 'ONAYLANDI', 'YAYINLANDI', 'TAMAMLANDI', 'İPTAL']
  },
  
  // Onay Bilgileri
  approvals: [{
    approver: String, // Onaylayan kişi
    role: String,     // Rolü (Fabrika Sorumlusu, İK vs.)
    approvedAt: Date,
    notes: String
  }],
  
  // Gece Vardiyası Bilgisi (Excel'de sarı ile işaretli alanlar)
  nightShiftNote: {
    type: String,
    default: "24:00-08:00 GECE VARDİYASI PAZARTESI'Yİ SALIYA BAĞLAYAN GECE BAŞLAYACAKTIR"
  },
  
  // Vardiya açıklaması
  description: {
    type: String,
    trim: true
  },
  
  // Oluşturan ve Son Güncelleyen
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: String,
  
  // Tarihler
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware - güncelleme tarihi
shiftSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual - toplam çalışan sayısı
shiftSchema.virtual('totalEmployees').get(function() {
  let total = 0;
  this.shiftGroups.forEach(group => {
    group.shifts.forEach(shift => {
      total += shift.employees.length;
    });
  });
  this.specialGroups.forEach(group => {
    total += group.employees.length;
  });
  return total;
});

// Index'ler
shiftSchema.index({ startDate: 1, endDate: 1 });
shiftSchema.index({ location: 1, status: 1 });
shiftSchema.index({ 'shiftGroups.groupName': 1 });

module.exports = mongoose.model('Shift', shiftSchema); 