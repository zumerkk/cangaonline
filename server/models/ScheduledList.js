const mongoose = require('mongoose');

// 📅 Zamanlanmış Liste Modeli
const scheduledListSchema = new mongoose.Schema({
  // 📋 Temel Bilgiler
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // 🎯 Liste Konfigürasyonu
  listConfig: {
    type: {
      type: String,
      enum: ['attendance', 'overtime', 'meeting', 'training', 'project', 'custom'],
      default: 'attendance'
    },
    template: {
      type: String,
      enum: ['corporate', 'premium', 'executive'],
      default: 'corporate'
    },
    location: {
      type: String,
      required: true
    },
    timeSlot: {
      type: String,
      default: '08:00-18:00'
    },
    title: String,
    includeFields: {
      showDepartment: { type: Boolean, default: true },
      showPosition: { type: Boolean, default: true },
      showSignature: { type: Boolean, default: true },
      showTime: { type: Boolean, default: true }
    }
  },
  
  // 🔍 Filtre Kriterleri
  filterCriteria: {
    departments: [String],
    locations: [String],
    positions: [String],
    status: {
      type: String,
      enum: ['AKTIF', 'PASİF', 'İZİNDE'],
      default: 'AKTIF'
    },
    excludeTrainees: {
      type: Boolean,
      default: true
    }
  },
  
  // ⏰ Zamanlama Ayarları
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      required: true
    },
    // Günlük için
    time: {
      type: String, // "09:00" formatında
      default: '09:00'
    },
    // Haftalık için
    dayOfWeek: {
      type: Number, // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
      min: 0,
      max: 6
    },
    // Aylık için
    dayOfMonth: {
      type: Number, // 1-31 arası
      min: 1,
      max: 31
    },
    // Custom cron expression
    cronExpression: String,
    
    // Timezone
    timezone: {
      type: String,
      default: 'Europe/Istanbul'
    }
  },
  
  // 📧 Bildirim Ayarları
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    recipients: [{
      email: String,
      name: String,
      role: String
    }],
    emailTemplate: {
      subject: String,
      message: String
    },
    sendOnCreate: {
      type: Boolean,
      default: true
    },
    sendOnError: {
      type: Boolean,
      default: true
    }
  },
  
  // 📊 Durum Bilgileri
  status: {
    type: String,
    enum: ['active', 'paused', 'error', 'disabled'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // 📈 İstatistikler
  stats: {
    totalRuns: {
      type: Number,
      default: 0
    },
    successfulRuns: {
      type: Number,
      default: 0
    },
    failedRuns: {
      type: Number,
      default: 0
    },
    lastRun: Date,
    nextRun: Date,
    averageEmployeeCount: Number,
    lastGeneratedFileSize: Number
  },
  
  // 👤 Oluşturan Bilgileri
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // 🕒 Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 📊 Virtual Fields
scheduledListSchema.virtual('successRate').get(function() {
  if (this.stats.totalRuns === 0) return 0;
  return ((this.stats.successfulRuns / this.stats.totalRuns) * 100).toFixed(2);
});

scheduledListSchema.virtual('isOverdue').get(function() {
  if (!this.stats.nextRun) return false;
  return new Date() > this.stats.nextRun;
});

// 🔍 Indexes
scheduledListSchema.index({ status: 1 });
scheduledListSchema.index({ 'schedule.frequency': 1 });
scheduledListSchema.index({ createdBy: 1 });
scheduledListSchema.index({ 'stats.nextRun': 1 });
scheduledListSchema.index({ isActive: 1 });

// 🔧 Middleware
scheduledListSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 📊 Static Methods
scheduledListSchema.statics.getActiveSchedules = function() {
  return this.find({ 
    isActive: true, 
    status: 'active',
    'stats.nextRun': { $lte: new Date() }
  }).populate('createdBy', 'firstName lastName email');
};

scheduledListSchema.statics.getStatistics = async function() {
  const [stats] = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSchedules: { $sum: 1 },
        activeSchedules: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        totalRuns: { $sum: '$stats.totalRuns' },
        successfulRuns: { $sum: '$stats.successfulRuns' },
        avgEmployeeCount: { $avg: '$stats.averageEmployeeCount' }
      }
    }
  ]);
  
  return stats || {
    totalSchedules: 0,
    activeSchedules: 0,
    totalRuns: 0,
    successfulRuns: 0,
    avgEmployeeCount: 0
  };
};

// 📋 Instance Methods
scheduledListSchema.methods.calculateNextRun = function() {
  const now = new Date();
  const { frequency, time, dayOfWeek, dayOfMonth } = this.schedule;
  
  let nextRun = new Date(now);
  
  switch (frequency) {
    case 'daily':
      const [hours, minutes] = time.split(':');
      nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
      
    case 'weekly':
      const [weekHours, weekMinutes] = time.split(':');
      nextRun.setHours(parseInt(weekHours), parseInt(weekMinutes), 0, 0);
      const currentDay = nextRun.getDay();
      const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
      if (daysUntilTarget === 0 && nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7);
      } else {
        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
      }
      break;
      
    case 'monthly':
      const [monthHours, monthMinutes] = time.split(':');
      nextRun.setDate(dayOfMonth);
      nextRun.setHours(parseInt(monthHours), parseInt(monthMinutes), 0, 0);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;
  }
  
  this.stats.nextRun = nextRun;
  return nextRun;
};

module.exports = mongoose.model('ScheduledList', scheduledListSchema); 