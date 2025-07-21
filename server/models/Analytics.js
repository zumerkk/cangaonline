const mongoose = require('mongoose');

// 📊 Analytics Event Modeli
const analyticsEventSchema = new mongoose.Schema({
  // 🎯 Event Bilgileri
  eventType: {
    type: String,
    enum: [
      'list_created',
      'list_downloaded', 
      'template_selected',
      'list_type_selected',
      'filter_applied',
      'employee_selected',
      'employee_deselected',
      'schedule_created',
      'schedule_executed',
      'user_login',
      'page_view',
      'error_occurred'
    ],
    required: true
  },
  
  // 📋 Liste Detayları
  listDetails: {
    type: {
      type: String,
      enum: ['attendance', 'overtime', 'meeting', 'training', 'project', 'custom']
    },
    template: {
      type: String,
      enum: ['corporate', 'premium', 'executive']
    },
    employeeCount: Number,
    location: String,
    departments: [String],
    fileSize: Number, // bytes
    generationTime: Number // milliseconds
  },
  
  // 👤 User Context
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userInfo: {
    department: String,
    role: String,
    location: String
  },
  
  // 🌐 Session & Device Info
  sessionId: String,
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    isMobile: Boolean,
    screenResolution: String
  },
  
  // 📍 Performance Metrics
  performance: {
    pageLoadTime: Number,
    apiResponseTime: Number,
    renderTime: Number,
    memoryUsage: Number
  },
  
  // 🔍 Additional Data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // 🕒 Timing
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // 📊 Aggregation Helper Fields
  hour: Number,
  dayOfWeek: Number,
  dayOfMonth: Number,
  month: Number,
  year: Number
}, {
  timestamps: true
});

// 🔍 Indexes for Analytics Queries
analyticsEventSchema.index({ eventType: 1 });
analyticsEventSchema.index({ timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ year: 1, month: 1, dayOfMonth: 1 });
analyticsEventSchema.index({ 'listDetails.type': 1 });
analyticsEventSchema.index({ 'listDetails.template': 1 });

// 🔧 Pre-save Middleware
analyticsEventSchema.pre('save', function(next) {
  const date = this.timestamp || new Date();
  this.hour = date.getHours();
  this.dayOfWeek = date.getDay();
  this.dayOfMonth = date.getDate();
  this.month = date.getMonth() + 1;
  this.year = date.getFullYear();
  next();
});

// 📊 Static Analytics Methods
analyticsEventSchema.statics.getDashboardStats = async function(timeRange = '30d') {
  const startDate = new Date();
  
  switch (timeRange) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
  }
  
  const [stats] = await this.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        listsCreated: {
          $sum: { $cond: [{ $eq: ['$eventType', 'list_created'] }, 1, 0] }
        },
        listsDownloaded: {
          $sum: { $cond: [{ $eq: ['$eventType', 'list_downloaded'] }, 1, 0] }
        },
        avgEmployeeCount: { $avg: '$listDetails.employeeCount' },
        totalFileSize: { $sum: '$listDetails.fileSize' },
        avgGenerationTime: { $avg: '$listDetails.generationTime' }
      }
    },
    {
      $project: {
        _id: 0,
        totalEvents: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        listsCreated: 1,
        listsDownloaded: 1,
        avgEmployeeCount: { $round: ['$avgEmployeeCount', 0] },
        totalFileSize: { $round: [{ $divide: ['$totalFileSize', 1048576] }, 2] }, // MB
        avgGenerationTime: { $round: ['$avgGenerationTime', 0] }
      }
    }
  ]);
  
  return stats || {
    totalEvents: 0,
    uniqueUsers: 0,
    listsCreated: 0,
    listsDownloaded: 0,
    avgEmployeeCount: 0,
    totalFileSize: 0,
    avgGenerationTime: 0
  };
};

analyticsEventSchema.statics.getUsageByTemplate = async function(timeRange = '30d') {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('d', '')));
  
  return await this.aggregate([
    { 
      $match: { 
        timestamp: { $gte: startDate },
        eventType: 'list_created',
        'listDetails.template': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$listDetails.template',
        count: { $sum: 1 },
        avgEmployeeCount: { $avg: '$listDetails.employeeCount' },
        avgFileSize: { $avg: '$listDetails.fileSize' }
      }
    },
    {
      $project: {
        template: '$_id',
        count: 1,
        avgEmployeeCount: { $round: ['$avgEmployeeCount', 0] },
        avgFileSize: { $round: [{ $divide: ['$avgFileSize', 1024] }, 2] }, // KB
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);
};

analyticsEventSchema.statics.getUsageByDepartment = async function(timeRange = '30d') {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('d', '')));
  
  return await this.aggregate([
    { 
      $match: { 
        timestamp: { $gte: startDate },
        eventType: 'list_created',
        'userInfo.department': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$userInfo.department',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        avgEmployeeCount: { $avg: '$listDetails.employeeCount' }
      }
    },
    {
      $project: {
        department: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        avgEmployeeCount: { $round: ['$avgEmployeeCount', 0] },
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);
};

analyticsEventSchema.statics.getHourlyUsage = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    { 
      $match: { 
        timestamp: { $gte: startDate },
        eventType: 'list_created'
      }
    },
    {
      $group: {
        _id: '$hour',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        hour: '$_id',
        count: 1,
        _id: 0
      }
    },
    { $sort: { hour: 1 } }
  ]);
};

analyticsEventSchema.statics.getDailyUsage = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    { 
      $match: { 
        timestamp: { $gte: startDate },
        eventType: 'list_created'
      }
    },
    {
      $group: {
        _id: { 
          year: '$year', 
          month: '$month', 
          day: '$dayOfMonth' 
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ]);
};

analyticsEventSchema.statics.getTopUsers = async function(timeRange = '30d', limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('d', '')));
  
  return await this.aggregate([
    { 
      $match: { 
        timestamp: { $gte: startDate },
        userId: { $exists: true }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalEvents: { $sum: 1 },
        listsCreated: {
          $sum: { $cond: [{ $eq: ['$eventType', 'list_created'] }, 1, 0] }
        },
        lastActivity: { $max: '$timestamp' },
        departments: { $addToSet: '$userInfo.department' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        userId: '$_id',
        totalEvents: 1,
        listsCreated: 1,
        lastActivity: 1,
        userName: {
          $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName']
        },
        userEmail: '$userDetails.email',
        _id: 0
      }
    },
    { $sort: { totalEvents: -1 } },
    { $limit: limit }
  ]);
};

// 📊 Report Model
const reportSchema = new mongoose.Schema({
  // 📋 Report Details
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['usage', 'performance', 'user_activity', 'template_analytics', 'custom'],
    required: true
  },
  
  // 📊 Report Data
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // ⚙️ Configuration
  config: {
    timeRange: String,
    filters: mongoose.Schema.Types.Mixed,
    chartType: String,
    groupBy: String
  },
  
  // 📈 Metadata
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileSize: Number,
  recordCount: Number,
  
  // 📧 Sharing
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  }],
  
  // 🕒 Lifecycle
  expiresAt: Date,
  
}, {
  timestamps: true
});

// 🔍 Report Indexes
reportSchema.index({ type: 1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ generatedAt: -1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = {
  AnalyticsEvent: mongoose.model('AnalyticsEvent', analyticsEventSchema),
  Report: mongoose.model('Report', reportSchema)
}; 