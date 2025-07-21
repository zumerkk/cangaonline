const mongoose = require('mongoose');

// Sistem Log Şeması - Tüm sistem aktivitelerini takip eder
const systemLogSchema = new mongoose.Schema({
  // Log Temel Bilgileri
  action: {
    type: String,
    required: true,
    enum: [
      // Çalışan İşlemleri
      'EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DELETED',
      'EMPLOYEE_IMPORTED', 'EMPLOYEE_EXPORTED',
      
      // Vardiya İşlemleri
      'SHIFT_CREATED', 'SHIFT_UPDATED', 'SHIFT_DELETED',
      'SHIFT_PUBLISHED', 'SHIFT_APPROVED', 'SHIFT_CANCELLED',
      
      // Servis İşlemleri
      'SERVICE_ROUTE_CREATED', 'SERVICE_ROUTE_UPDATED', 'SERVICE_ROUTE_DELETED',
      'SERVICE_SCHEDULE_CREATED', 'SERVICE_SCHEDULE_UPDATED', 'SERVICE_SCHEDULE_DELETED',
      
      // Sistem İşlemleri
      'USER_LOGIN', 'USER_LOGOUT', 'USER_SESSION_EXPIRED',
      'SYSTEM_BACKUP', 'SYSTEM_RESTORE', 'SYSTEM_MAINTENANCE',
      'DATABASE_MIGRATION', 'SYSTEM_UPDATE',
      
      // Rapor İşlemleri
      'REPORT_GENERATED', 'REPORT_EXPORTED', 'REPORT_DOWNLOADED',
      
      // Excel İşlemleri
      'EXCEL_IMPORTED', 'EXCEL_EXPORTED', 'EXCEL_TEMPLATE_DOWNLOADED',
      
      // Bildirim İşlemleri
      'NOTIFICATION_CREATED', 'NOTIFICATION_READ', 'NOTIFICATION_DELETED',
      
      // Hata ve Uyarılar
      'ERROR_OCCURRED', 'WARNING_ISSUED', 'SECURITY_ALERT',
      
      // API İşlemleri
      'API_REQUEST', 'API_ERROR', 'API_RATE_LIMIT'
    ]
  },
  
  // Log Seviyesi
  level: {
    type: String,
    default: 'INFO',
    enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']
  },
  
  // Log Mesajı
  message: {
    type: String,
    required: true
  },
  
  // Detaylı Açıklama
  description: String,
  
  // Kullanıcı Bilgileri
  user: {
    userId: String,
    userName: String,
    userRole: String,
    ipAddress: String,
    userAgent: String
  },
  
  // İlgili Kayıt
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['EMPLOYEE', 'SHIFT', 'SERVICE_ROUTE', 'SERVICE_SCHEDULE', 'NOTIFICATION', 'REPORT']
    },
    entityId: mongoose.Schema.Types.ObjectId,
    entityName: String
  },
  
  // Değişiklik Detayları (Audit Trail için)
  changes: {
    before: mongoose.Schema.Types.Mixed,  // Önceki değer
    after: mongoose.Schema.Types.Mixed,   // Sonraki değer
    fields: [String]                      // Değişen alanlar
  },
  
  // HTTP Request Bilgileri
  request: {
    method: String,     // GET, POST, PUT, DELETE
    url: String,        // Request URL
    params: mongoose.Schema.Types.Mixed,    // URL parametreleri
    query: mongoose.Schema.Types.Mixed,     // Query parametreleri
    body: mongoose.Schema.Types.Mixed,      // Request body (hassas bilgiler filtrelenir)
    headers: mongoose.Schema.Types.Mixed    // Request headers (hassas bilgiler filtrelenir)
  },
  
  // Response Bilgileri
  response: {
    statusCode: Number,
    responseTime: Number, // ms cinsinden
    size: Number         // byte cinsinden
  },
  
  // Hata Bilgileri
  error: {
    code: String,
    message: String,
    stack: String,
    details: mongoose.Schema.Types.Mixed
  },
  
  // Performans Metrikleri
  performance: {
    executionTime: Number,    // ms cinsinden
    memoryUsage: Number,      // MB cinsinden
    cpuUsage: Number,         // % cinsinden
    databaseQueries: Number   // Yapılan sorgu sayısı
  },
  
  // Güvenlik Bilgileri
  security: {
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    attemptCount: Number,     // Başarısız deneme sayısı
    blocked: Boolean,         // Bloklandı mı?
    reason: String           // Bloklanma nedeni
  },
  
  // Sistem Bilgileri
  system: {
    serverName: String,
    environment: {
      type: String,
      enum: ['development', 'staging', 'production']
    },
    version: String,
    nodeVersion: String,
    platform: String,
    memory: {
      used: Number,
      total: Number
    }
  },
  
  // Metadata
  metadata: {
    tags: [String],           // Log etiketleri
    category: String,         // Log kategorisi
    source: String,           // Log kaynağı
    sessionId: String,        // Session ID
    requestId: String,        // Request ID
    correlationId: String     // Correlation ID
  },
  
  // Tarih ve Saat
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Otomatik silme için (Log retention)
  expiresAt: {
    type: Date,
    default: function() {
      // 90 gün sonra otomatik sil
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
  }
});

// Index'ler - hızlı sorgulama için
systemLogSchema.index({ action: 1, timestamp: -1 });
systemLogSchema.index({ level: 1, timestamp: -1 });
systemLogSchema.index({ 'user.userId': 1, timestamp: -1 });
systemLogSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });
systemLogSchema.index({ 'metadata.tags': 1 });
systemLogSchema.index({ 'metadata.category': 1 });
systemLogSchema.index({ timestamp: -1 });
systemLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static methods - log oluşturma yardımcıları
systemLogSchema.statics.logUserAction = function(action, user, message, relatedEntity = null) {
  return this.create({
    action,
    level: 'INFO',
    message,
    user: {
      userId: user.id || user.userId,
      userName: user.name || user.userName,
      userRole: user.role || user.userRole,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent
    },
    relatedEntity,
    metadata: {
      tags: ['user-action'],
      category: 'USER_ACTIVITY',
      source: 'web-app'
    }
  });
};

systemLogSchema.statics.logSystemEvent = function(action, message, level = 'INFO', details = null) {
  return this.create({
    action,
    level,
    message,
    description: details?.description,
    system: {
      serverName: process.env.SERVER_NAME || 'canga-server',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      nodeVersion: process.version,
      platform: process.platform
    },
    metadata: {
      tags: ['system-event'],
      category: 'SYSTEM',
      source: 'server'
    },
    ...(details && { metadata: { ...details } })
  });
};

systemLogSchema.statics.logError = function(error, user = null, request = null) {
  return this.create({
    action: 'ERROR_OCCURRED',
    level: 'ERROR',
    message: error.message || 'Bilinmeyen hata',
    user,
    error: {
      code: error.code,
      message: error.message,
      stack: error.stack,
      details: error.details
    },
    request,
    metadata: {
      tags: ['error'],
      category: 'ERROR',
      source: 'server'
    }
  });
};

systemLogSchema.statics.logAPIRequest = function(req, res, executionTime) {
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  
  // Hassas bilgileri filtrele
  const filterSensitive = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const filtered = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        filtered[key] = '[FILTERED]';
      } else {
        filtered[key] = value;
      }
    }
    return filtered;
  };
  
  return this.create({
    action: 'API_REQUEST',
    level: 'DEBUG',
    message: `${req.method} ${req.originalUrl}`,
    user: req.user ? {
      userId: req.user.id,
      userName: req.user.name,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    } : null,
    request: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: filterSensitive(req.query),
      body: filterSensitive(req.body),
      headers: filterSensitive(req.headers)
    },
    response: {
      statusCode: res.statusCode,
      responseTime: executionTime
    },
    performance: {
      executionTime
    },
    metadata: {
      tags: ['api-request'],
      category: 'API',
      source: 'web-api'
    }
  });
};

// Middleware - log retention kontrolü
systemLogSchema.pre('save', function(next) {
  // Kritik loglar için daha uzun saklama süresi
  if (this.level === 'ERROR' || this.level === 'FATAL' || this.security?.riskLevel === 'CRITICAL') {
    this.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 yıl
  }
  next();
});

module.exports = mongoose.model('SystemLog', systemLogSchema); 