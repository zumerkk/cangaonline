const mongoose = require('mongoose');

// 📅 Servis Programı Şeması - Employee modeliyle uyumlu
const serviceScheduleSchema = new mongoose.Schema({
  // Program başlığı
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Tarih aralığı
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Durum
  status: {
    type: String,
    default: 'AKTIF',
    enum: ['AKTIF', 'PASIF', 'TAMAMLANDI', 'İPTAL', 'PLANLANDI']
  },
  
  // Servis güzergahları
  serviceRoutes: [{
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRoute'
    },
    routeName: String,
    
    // Zaman dilimleri
    timeSlots: [{
      timeSlot: String,
      direction: {
        type: String,
        enum: ['FABRİKAYA', 'FABRİKADAN']
      },
      
      // Bu saatte binen çalışanlar
      passengers: [{
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee'
        },
        employeeName: String,
        stopName: String,
        stopOrder: Number,
        
        boardingStatus: {
          type: String,
          default: 'BEKLEMEDE',
          enum: ['BEKLEMEDE', 'BİNDİ', 'BİNMEDİ', 'İPTAL']
        },
        
        expectedTime: Date,
        actualTime: Date,
        notes: String
      }],
      
      // Araç bilgileri
      vehicle: {
        plateNumber: String,
        driverName: String,
        driverPhone: String,
        capacity: Number,
        currentLoad: {
          type: Number,
          default: 0
        }
      },
      
      isActive: {
        type: Boolean,
        default: true
      },
      isCompleted: {
        type: Boolean,
        default: false
      }
    }]
  }],
  
  // İstatistikler
  statistics: {
    totalPassengers: {
      type: Number,
      default: 0
    },
    totalRoutes: {
      type: Number,
      default: 0
    },
    totalTrips: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    shifts: {
      sabah: { gelis: { type: Number, default: 0 }, gidis: { type: Number, default: 0 } },
      aksam: { gelis: { type: Number, default: 0 }, gidis: { type: Number, default: 0 } },
      oniki_yirmidort: { gelis: { type: Number, default: 0 }, gidis: { type: Number, default: 0 } },
      yirmidort_sekiz: { gelis: { type: Number, default: 0 }, gidis: { type: Number, default: 0 } }
    }
  },
  
  // Özel listeler
  specialLists: [{
    listType: {
      type: String,
      enum: ['KENDİ ARACI İLE GELENLER', 'ÇAĞRI YILDIZ', 'EMRE ÇİÇEK', 'FARUK YEŞİLYURT']
    },
    employees: [{
      employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      },
      employeeName: String,
      notes: String
    }]
  }],
  
  // Notlar
  notes: String,
  
  // Oluşturan ve güncelleyen
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

// Middleware - güncelleme tarihi ve istatistikleri hesapla
serviceScheduleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // İstatistikleri hesapla
  let totalPassengers = 0;
  let totalRoutes = this.serviceRoutes.length;
  let totalTrips = 0;
  let completedTrips = 0;

  this.serviceRoutes.forEach(route => {
    route.timeSlots.forEach(slot => {
      totalTrips++;
      totalPassengers += slot.passengers.length;
      if (slot.isCompleted) completedTrips++;
      
      // Araç yükünü güncelle
      slot.vehicle.currentLoad = slot.passengers.filter(p => p.boardingStatus === 'BİNDİ').length;
    });
  });

  this.statistics.totalPassengers = totalPassengers;
  this.statistics.totalRoutes = totalRoutes;
  this.statistics.totalTrips = totalTrips;
  this.statistics.completionRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;

  next();
});

// Virtual - aktif yolcu sayısı
serviceScheduleSchema.virtual('activePassengerCount').get(function() {
  let count = 0;
  this.serviceRoutes.forEach(route => {
    route.timeSlots.forEach(slot => {
      count += slot.passengers.filter(p => p.boardingStatus !== 'İPTAL').length;
    });
  });
  return count;
});

// Virtual - program süresi
serviceScheduleSchema.virtual('duration').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Index'ler
serviceScheduleSchema.index({ status: 1 });
serviceScheduleSchema.index({ startDate: 1, endDate: 1 });
serviceScheduleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ServiceSchedule', serviceScheduleSchema); 