const express = require('express');
const router = express.Router();
const { AnalyticsEvent, Report } = require('../models/Analytics');

// 📊 Genel dashboard istatistikleri
router.get('/dashboard', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const stats = await AnalyticsEvent.getDashboardStats(timeRange);
    
    res.json({
      success: true,
      data: stats,
      timeRange
    });
  } catch (error) {
    console.error('Dashboard istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard istatistikleri getirilemedi',
      error: error.message
    });
  }
});

// 📊 Şablon kullanım analizi
router.get('/templates', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const templateUsage = await AnalyticsEvent.getUsageByTemplate(timeRange);
    
    res.json({
      success: true,
      data: templateUsage,
      timeRange
    });
  } catch (error) {
    console.error('Şablon analizi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şablon analizi getirilemedi',
      error: error.message
    });
  }
});

// 📊 Departman bazlı kullanım analizi
router.get('/departments', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const departmentUsage = await AnalyticsEvent.getUsageByDepartment(timeRange);
    
    res.json({
      success: true,
      data: departmentUsage,
      timeRange
    });
  } catch (error) {
    console.error('Departman analizi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Departman analizi getirilemedi',
      error: error.message
    });
  }
});

// 📊 Saatlik kullanım analizi
router.get('/hourly', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const hourlyUsage = await AnalyticsEvent.getHourlyUsage(parseInt(days));
    
    // 24 saatlik veri için eksik saatleri doldur
    const fullHourlyData = Array.from({ length: 24 }, (_, hour) => {
      const existing = hourlyUsage.find(item => item.hour === hour);
      return {
        hour,
        count: existing ? existing.count : 0
      };
    });
    
    res.json({
      success: true,
      data: fullHourlyData,
      days: parseInt(days)
    });
  } catch (error) {
    console.error('Saatlik analiz hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Saatlik analiz getirilemedi',
      error: error.message
    });
  }
});

// 📊 Günlük kullanım analizi
router.get('/daily', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const dailyUsage = await AnalyticsEvent.getDailyUsage(parseInt(days));
    
    res.json({
      success: true,
      data: dailyUsage,
      days: parseInt(days)
    });
  } catch (error) {
    console.error('Günlük analiz hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Günlük analiz getirilemedi',
      error: error.message
    });
  }
});

// 📊 En aktif kullanıcılar
router.get('/top-users', async (req, res) => {
  try {
    const { timeRange = '30d', limit = 10 } = req.query;
    
    const topUsers = await AnalyticsEvent.getTopUsers(timeRange, parseInt(limit));
    
    res.json({
      success: true,
      data: topUsers,
      timeRange,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Top kullanıcılar hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Top kullanıcılar getirilemedi',
      error: error.message
    });
  }
});

// 📊 Performans metrikleri
router.get('/performance', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('d', '')));
    
    const performanceData = await AnalyticsEvent.aggregate([
      { 
        $match: { 
          timestamp: { $gte: startDate },
          eventType: 'list_created',
          'listDetails.generationTime': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgGenerationTime: { $avg: '$listDetails.generationTime' },
          minGenerationTime: { $min: '$listDetails.generationTime' },
          maxGenerationTime: { $max: '$listDetails.generationTime' },
          avgFileSize: { $avg: '$listDetails.fileSize' },
          avgEmployeeCount: { $avg: '$listDetails.employeeCount' },
          totalLists: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          avgGenerationTime: { $round: ['$avgGenerationTime', 0] },
          minGenerationTime: 1,
          maxGenerationTime: 1,
          avgFileSize: { $round: [{ $divide: ['$avgFileSize', 1024] }, 2] }, // KB
          avgEmployeeCount: { $round: ['$avgEmployeeCount', 0] },
          totalLists: 1
        }
      }
    ]);
    
    const result = performanceData[0] || {
      avgGenerationTime: 0,
      minGenerationTime: 0,
      maxGenerationTime: 0,
      avgFileSize: 0,
      avgEmployeeCount: 0,
      totalLists: 0
    };
    
    res.json({
      success: true,
      data: result,
      timeRange
    });
  } catch (error) {
    console.error('Performans analizi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Performans analizi getirilemedi',
      error: error.message
    });
  }
});

// 📈 Trend analizi
router.get('/trends', async (req, res) => {
  try {
    const { metric = 'lists_created', period = 'daily', days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    let groupBy;
    switch (period) {
      case 'hourly':
        groupBy = { year: '$year', month: '$month', day: '$dayOfMonth', hour: '$hour' };
        break;
      case 'daily':
        groupBy = { year: '$year', month: '$month', day: '$dayOfMonth' };
        break;
      case 'weekly':
        groupBy = { year: '$year', week: { $week: '$timestamp' } };
        break;
      case 'monthly':
        groupBy = { year: '$year', month: '$month' };
        break;
      default:
        groupBy = { year: '$year', month: '$month', day: '$dayOfMonth' };
    }
    
    const matchCondition = {
      timestamp: { $gte: startDate }
    };
    
    if (metric === 'lists_created') {
      matchCondition.eventType = 'list_created';
    } else if (metric === 'lists_downloaded') {
      matchCondition.eventType = 'list_downloaded';
    }
    
    const trendData = await AnalyticsEvent.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          period: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          _id: 0
        }
      },
      { $sort: { period: 1 } }
    ]);
    
    res.json({
      success: true,
      data: trendData,
      metric,
      period,
      days: parseInt(days)
    });
  } catch (error) {
    console.error('Trend analizi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Trend analizi getirilemedi',
      error: error.message
    });
  }
});

// 📊 Analytics event kaydet
router.post('/events', async (req, res) => {
  try {
    const {
      eventType,
      listDetails,
      userInfo,
      sessionId,
      deviceInfo,
      performance,
      metadata
    } = req.body;
    
    const userId = req.user?.id || null;
    
    const analyticsEvent = new AnalyticsEvent({
      eventType,
      listDetails,
      userId,
      userInfo,
      sessionId,
      deviceInfo,
      performance,
      metadata
    });
    
    await analyticsEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Analytics event kaydedildi',
      data: { eventId: analyticsEvent._id }
    });
  } catch (error) {
    console.error('Analytics event kaydetme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Analytics event kaydedilemedi',
      error: error.message
    });
  }
});

// 📋 Raporlar

// 📊 Tüm raporları getir
router.get('/reports', async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (type) filter.type = type;
    
    const reports = await Report.find(filter)
      .populate('generatedBy', 'firstName lastName email')
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Report.countDocuments(filter);
    
    res.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Raporlar getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Raporlar getirilemedi',
      error: error.message
    });
  }
});

// 📊 Rapor oluştur
router.post('/reports', async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      config
    } = req.body;
    
    const userId = req.user?.id || '507f1f77bcf86cd799439011';
    
    // Rapor verilerini oluştur
    let reportData;
    
    switch (type) {
      case 'usage':
        reportData = await AnalyticsEvent.getDashboardStats(config.timeRange);
        break;
      case 'template_analytics':
        reportData = await AnalyticsEvent.getUsageByTemplate(config.timeRange);
        break;
      case 'user_activity':
        reportData = await AnalyticsEvent.getTopUsers(config.timeRange, 20);
        break;
      default:
        reportData = { message: 'Özel rapor verisi' };
    }
    
    const report = new Report({
      name,
      description,
      type,
      data: reportData,
      config,
      generatedBy: userId,
      recordCount: Array.isArray(reportData) ? reportData.length : 1,
      fileSize: JSON.stringify(reportData).length
    });
    
    await report.save();
    await report.populate('generatedBy', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Rapor başarıyla oluşturuldu',
      data: report
    });
  } catch (error) {
    console.error('Rapor oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor oluşturulamadı',
      error: error.message
    });
  }
});

// 📊 Rapor detayını getir
router.get('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'firstName lastName email')
      .populate('sharedWith.userId', 'firstName lastName email');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Rapor getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor getirilemedi',
      error: error.message
    });
  }
});

// 🗑️ Rapor sil
router.delete('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }
    
    await Report.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Rapor başarıyla silindi'
    });
  } catch (error) {
    console.error('Rapor silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor silinemedi',
      error: error.message
    });
  }
});

module.exports = router; 