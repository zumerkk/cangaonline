const mongoose = require('mongoose');

// 👥 Çalışan Modeli - Excel dosyasındaki kolonlara göre tasarlandı
const employeeSchema = new mongoose.Schema({
  // 🆔 Sistem Bilgileri - Otomatik oluşturulan ID
  employeeId: {
    type: String,
    unique: true,
    required: false // Middleware'de oluşturulacağı için false
  },
  
  // 👤 AD_SOYAD - Excel'deki ilk kolon
  adSoyad: {
    type: String,
    required: true,
    trim: true
  },
  
  // Ad ve soyadı ayrık olarak da tutuyoruz (sistem içi kullanım için)
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  
  // 🆔 TC_NO - Excel'deki ikinci kolon
  tcNo: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Boş değerlerde unique constraint uygulanmaz
  },
  
  // 📱 CEP_TELEFONU - Excel'deki üçüncü kolon
  cepTelefonu: {
    type: String,
    trim: true
  },
  
  // 📅 DOGUM_TARIHI - Excel'deki dördüncü kolon
  dogumTarihi: {
    type: Date
  },
  
  // 🏢 DEPARTMAN - Excel'deki beşinci kolon (Excel'den alınan tüm departmanlar)
  departman: {
    type: String,
    required: false, // Bazı kayıtlarda departman boş olabilir
    trim: true
  },
  
  // 🏭 İŞE_FABRİKA - Excel'deki altıncı kolon
  iseFabrika: {
    type: String,
    trim: true
  },
  
  // 💼 POZISYON - Excel'deki yedinci kolon
  pozisyon: {
    type: String,
    required: true,
    trim: true
  },
  
  // 📍 LOKASYON - Excel'deki sekizinci kolon
  lokasyon: {
    type: String,
    required: true,
    enum: ['MERKEZ', 'İŞL', 'OSB', 'İŞIL']
  },
  
  // 📅 İŞE_GİRİŞ_TARİHİ - Excel'deki dokuzuncu kolon
  iseGirisTarihi: {
    type: Date
  },

  // 📅 İŞTEN_AYRILMA_TARİHİ - İşten ayrılma tarihi (AYRILDI durumunda)
  ayrilmaTarihi: {
    type: Date,
    required: false // Sadece işten ayrılanlar için
  },

  // 📝 AYRILMA_SEBEBİ - İşten ayrılma sebebi (AYRILDI durumunda)
  ayrilmaSebebi: {
    type: String,
    trim: true,
    required: false // İsteğe bağlı
  },
  
  // 🚌 SERVIS_GUZERGAHI - Excel'deki onuncu kolon
  servisGuzergahi: {
    type: String,
    trim: true
  },
  
  // 🚏 DURAK - Excel'deki on birinci kolon
  durak: {
    type: String,
    trim: true
  },
  
  // 📊 DURUM - Excel'deki on ikinci kolon
  durum: {
    type: String,
    required: true,
    enum: ['AKTIF', 'PASIF', 'İZİNLİ', 'AYRILDI'],
    default: 'AKTIF'
  },
  
  // ⏰ Sistem Tarihleri
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 🔧 Middleware - Kayıt öncesi işlemler
employeeSchema.pre('save', async function(next) {
  try {
    // Ad soyadı ayrıştır
    if (this.adSoyad && !this.firstName && !this.lastName) {
      const nameParts = this.adSoyad.trim().split(' ');
      this.firstName = nameParts[0] || '';
      this.lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Çalışan ID otomatik oluştur (eğer yoksa)
    if (!this.employeeId) {
      const firstInitial = this.firstName?.charAt(0)?.toUpperCase() || 'C';
      const lastInitial = this.lastName?.charAt(0)?.toUpperCase() || 'W';
      
      // Son kullanılan ID'yi bul
      const lastEmployee = await this.constructor.findOne(
        { employeeId: { $regex: `^${firstInitial}${lastInitial}` } },
        {},
        { sort: { createdAt: -1 } }
      );
      
      let nextNumber = 1;
      if (lastEmployee && lastEmployee.employeeId) {
        const match = lastEmployee.employeeId.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      // 4 haneli numara ile ID oluştur
      const paddedNumber = nextNumber.toString().padStart(4, '0');
      this.employeeId = `${firstInitial}${lastInitial}${paddedNumber}`;
    }
    
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// 🔍 Index'ler - hızlı arama için (çakışmaları önlemek için tek index)
employeeSchema.index({ 
  adSoyad: 'text',
  employeeId: 1
}, { 
  name: 'fullName_text_employeeId_1'
});
employeeSchema.index({ departman: 1, lokasyon: 1 });
employeeSchema.index({ servisGuzergahi: 1 });
employeeSchema.index({ durum: 1 });

// 🎯 Static Methods - Filtreleme yardımcıları
employeeSchema.statics.findByFilters = function(filters = {}) {
  const query = {};
  
  // Temel filtreler
  if (filters.departman) query.departman = filters.departman;
  if (filters.lokasyon) query.lokasyon = filters.lokasyon;
  if (filters.durum) query.durum = filters.durum;
  if (filters.servisGuzergahi) query.servisGuzergahi = filters.servisGuzergahi;
  
  // Arama
  if (filters.search) {
    query.$or = [
      { adSoyad: { $regex: filters.search, $options: 'i' } },
      { employeeId: { $regex: filters.search, $options: 'i' } },
      { tcNo: { $regex: filters.search, $options: 'i' } },
      { pozisyon: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  return this.find(query);
};

// 📈 Virtual - Yaş hesaplama
employeeSchema.virtual('yas').get(function() {
  if (!this.dogumTarihi) return null;
  const today = new Date();
  const birthDate = new Date(this.dogumTarihi);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// 📈 Virtual - Servis kullanıyor mu
employeeSchema.virtual('servisKullaniyor').get(function() {
  return !!(this.servisGuzergahi && this.servisGuzergahi !== '');
});

// JSON çıktısında virtual field'ları dahil et
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema); 