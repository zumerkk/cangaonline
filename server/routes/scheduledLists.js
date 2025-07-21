const express = require('express');
const router = express.Router();
const ScheduledList = require('../models/ScheduledList');
const Employee = require('../models/Employee');
const { AnalyticsEvent } = require('../models/Analytics');
const ExcelJS = require('exceljs');

// 📋 Tüm zamanlanmış listeleri getir
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, frequency } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status) filter.status = status;
    if (frequency) filter['schedule.frequency'] = frequency;
    
    const scheduledLists = await ScheduledList.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await ScheduledList.countDocuments(filter);
    
    res.json({
      success: true,
      data: scheduledLists,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Zamanlanmış listeler getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Zamanlanmış listeler getirilemedi',
      error: error.message
    });
  }
});

// 📋 Tek zamanlanmış liste getir
router.get('/:id', async (req, res) => {
  try {
    const scheduledList = await ScheduledList.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!scheduledList) {
      return res.status(404).json({
        success: false,
        message: 'Zamanlanmış liste bulunamadı'
      });
    }
    
    res.json({
      success: true,
      data: scheduledList
    });
  } catch (error) {
    console.error('Zamanlanmış liste getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Zamanlanmış liste getirilemedi',
      error: error.message
    });
  }
});

// ➕ Yeni zamanlanmış liste oluştur
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      listConfig,
      filterCriteria,
      schedule,
      notifications
    } = req.body;
    
    // Kullanıcı ID'si - gerçek auth sisteminden gelecek
    const userId = req.user?.id || '507f1f77bcf86cd799439011'; // Temporary fallback
    
    const scheduledList = new ScheduledList({
      name,
      description,
      listConfig,
      filterCriteria,
      schedule,
      notifications,
      createdBy: userId
    });
    
    // İlk çalışma zamanını hesapla
    scheduledList.calculateNextRun();
    
    await scheduledList.save();
    
    // Analytics event kaydet
    const analyticsEvent = new AnalyticsEvent({
      eventType: 'schedule_created',
      userId: userId,
      metadata: {
        scheduleId: scheduledList._id,
        frequency: schedule.frequency,
        listType: listConfig.type
      }
    });
    await analyticsEvent.save();
    
    await scheduledList.populate('createdBy', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Zamanlanmış liste başarıyla oluşturuldu',
      data: scheduledList
    });
  } catch (error) {
    console.error('Zamanlanmış liste oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Zamanlanmış liste oluşturulamadı',
      error: error.message
    });
  }
});

// ✏️ Zamanlanmış liste güncelle
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || '507f1f77bcf86cd799439011';
    
    const scheduledList = await ScheduledList.findById(req.params.id);
    
    if (!scheduledList) {
      return res.status(404).json({
        success: false,
        message: 'Zamanlanmış liste bulunamadı'
      });
    }
    
    // Güncellemeleri uygula
    Object.assign(scheduledList, req.body);
    scheduledList.updatedBy = userId;
    
    // Zamanlama değiştiyse yeniden hesapla
    if (req.body.schedule) {
      scheduledList.calculateNextRun();
    }
    
    await scheduledList.save();
    await scheduledList.populate(['createdBy', 'updatedBy'], 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Zamanlanmış liste başarıyla güncellendi',
      data: scheduledList
    });
  } catch (error) {
    console.error('Zamanlanmış liste güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Zamanlanmış liste güncellenemedi',
      error: error.message
    });
  }
});

// 🗑️ Zamanlanmış liste sil
router.delete('/:id', async (req, res) => {
  try {
    const scheduledList = await ScheduledList.findById(req.params.id);
    
    if (!scheduledList) {
      return res.status(404).json({
        success: false,
        message: 'Zamanlanmış liste bulunamadı'
      });
    }
    
    await ScheduledList.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Zamanlanmış liste başarıyla silindi'
    });
  } catch (error) {
    console.error('Zamanlanmış liste silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Zamanlanmış liste silinemedi',
      error: error.message
    });
  }
});

// ⏸️ Zamanlanmış liste duraklat/aktifleştir
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const scheduledList = await ScheduledList.findById(req.params.id);
    
    if (!scheduledList) {
      return res.status(404).json({
        success: false,
        message: 'Zamanlanmış liste bulunamadı'
      });
    }
    
    scheduledList.isActive = isActive;
    scheduledList.status = isActive ? 'active' : 'paused';
    
    if (isActive) {
      scheduledList.calculateNextRun();
    }
    
    await scheduledList.save();
    
    res.json({
      success: true,
      message: `Zamanlanmış liste ${isActive ? 'aktifleştirildi' : 'duraklatıldı'}`,
      data: scheduledList
    });
  } catch (error) {
    console.error('Zamanlanmış liste toggle hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İşlem tamamlanamadı',
      error: error.message
    });
  }
});

// ▶️ Zamanlanmış listeyi manuel çalıştır
router.post('/:id/execute', async (req, res) => {
  try {
    const scheduledList = await ScheduledList.findById(req.params.id);
    
    if (!scheduledList) {
      return res.status(404).json({
        success: false,
        message: 'Zamanlanmış liste bulunamadı'
      });
    }
    
    const startTime = Date.now();
    
    // Çalışanları filtrele
    const filter = { status: scheduledList.filterCriteria.status };
    
    if (scheduledList.filterCriteria.departments?.length > 0) {
      filter.department = { $in: scheduledList.filterCriteria.departments };
    }
    
    if (scheduledList.filterCriteria.locations?.length > 0) {
      filter.location = { $in: scheduledList.filterCriteria.locations };
    }
    
    if (scheduledList.filterCriteria.excludeTrainees) {
      filter.department = { 
        ...filter.department,
        $nin: ['STAJYERLİK', 'ÇIRAK LİSE']
      };
    }
    
    const employees = await Employee.find(filter);
    
    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Filtrelere uygun çalışan bulunamadı'
      });
    }
    
    // Excel oluştur
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Liste');
    
    // Basit Excel yapısı
    worksheet.columns = [
      { header: 'Sıra', key: 'sira', width: 6 },
      { header: 'Sicil No', key: 'employeeId', width: 12 },
      { header: 'Ad Soyad', key: 'fullName', width: 25 },
      { header: 'Departman', key: 'department', width: 20 },
      { header: 'Pozisyon', key: 'position', width: 18 },
      { header: 'İmza', key: 'signature', width: 15 }
    ];
    
    employees.forEach((emp, index) => {
      worksheet.addRow({
        sira: index + 1,
        employeeId: emp.employeeId,
        fullName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        position: emp.position,
        signature: ''
      });
    });
    
    const buffer = await workbook.xlsx.writeBuffer();
    const generationTime = Date.now() - startTime;
    
    // İstatistikleri güncelle
    scheduledList.stats.totalRuns += 1;
    scheduledList.stats.successfulRuns += 1;
    scheduledList.stats.lastRun = new Date();
    scheduledList.stats.averageEmployeeCount = employees.length;
    scheduledList.stats.lastGeneratedFileSize = buffer.length;
    scheduledList.calculateNextRun();
    
    await scheduledList.save();
    
    // Analytics event
    const analyticsEvent = new AnalyticsEvent({
      eventType: 'schedule_executed',
      listDetails: {
        type: scheduledList.listConfig.type,
        template: scheduledList.listConfig.template,
        employeeCount: employees.length,
        location: scheduledList.listConfig.location,
        departments: [...new Set(employees.map(emp => emp.department))],
        fileSize: buffer.length,
        generationTime
      },
      metadata: {
        scheduleId: scheduledList._id,
        manual: true
      }
    });
    await analyticsEvent.save();
    
    // Dosyayı gönder
    const fileName = `${scheduledList.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
    
  } catch (error) {
    console.error('Zamanlanmış liste çalıştırma hatası:', error);
    
    // Hata istatistiği
    if (scheduledList) {
      scheduledList.stats.totalRuns += 1;
      scheduledList.stats.failedRuns += 1;
      scheduledList.status = 'error';
      await scheduledList.save();
    }
    
    res.status(500).json({
      success: false,
      message: 'Liste çalıştırılamadı',
      error: error.message
    });
  }
});

// 📊 Zamanlanmış liste istatistikleri
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await ScheduledList.getStatistics();
    
    // Yaklaşan çalışmalar
    const upcomingRuns = await ScheduledList.find({
      isActive: true,
      'stats.nextRun': { $gte: new Date() }
    })
    .sort({ 'stats.nextRun': 1 })
    .limit(5)
    .populate('createdBy', 'firstName lastName');
    
    // Son çalışmalar
    const recentRuns = await ScheduledList.find({
      'stats.lastRun': { $exists: true }
    })
    .sort({ 'stats.lastRun': -1 })
    .limit(5)
    .populate('createdBy', 'firstName lastName');
    
    res.json({
      success: true,
      data: {
        ...stats,
        upcomingRuns,
        recentRuns
      }
    });
  } catch (error) {
    console.error('İstatistik getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler getirilemedi',
      error: error.message
    });
  }
});

module.exports = router; 