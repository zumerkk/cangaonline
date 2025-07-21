const mongoose = require('mongoose');

// 🚌 Servis Güzergahı Şeması - Employee modeliyle uyumlu
const serviceRouteSchema = new mongoose.Schema({
  // Güzergah adı
  routeName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  
  // Güzergah kodu  
  routeCode: {
    type: String,
    trim: true
  },
  
  // Güzergah rengi
  color: {
    type: String,
    default: '#1976d2'
  },
  
  // Durak listesi
  stops: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  
  // Saat dilimleri
  schedule: [{
    time: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Durum
  status: {
    type: String,
    default: 'AKTIF',
    enum: ['AKTIF', 'PASIF', 'BAKIM']
  },
  
  // İstatistikler
  statistics: {
    totalEmployees: {
      type: Number,
      default: 0
    },
    activeEmployees: {
      type: Number,
      default: 0
    }
  },
  
  // Notlar
  notes: String,
  
  // Oluşturan
  createdBy: {
    type: String,
    default: 'System'
  },
  
  // Güncelleyen
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

// Middleware
serviceRouteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexler - çakışmaları önlemek için
serviceRouteSchema.index({ routeName: 1 }, { name: 'routeName_idx' });
serviceRouteSchema.index({ status: 1 });

module.exports = mongoose.model('ServiceRoute', serviceRouteSchema); 