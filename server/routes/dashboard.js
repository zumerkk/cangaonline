const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Shift = require('../models/Shift');

// Dashboard istatistikleri
router.get('/stats', async (req, res) => {
  try {
    // Temel sayılar - paralel sorgular ile hızlandırma
    const [
      totalEmployees,
      activeShifts,
      pendingApprovals,
      allShifts,
      departmentStats,
      locationStats
    ] = await Promise.all([
      Employee.countDocuments({ durum: 'AKTIF' }), // Türkçe field adı
      Shift.countDocuments({ status: { $in: ['ONAYLANDI', 'YAYINLANDI'] } }),
      Shift.countDocuments({ status: 'TASLAK' }),
      Shift.countDocuments(),
      // Departman istatistikleri - Türkçe field adları
      Employee.aggregate([
        { $match: { durum: 'AKTIF' } }, // durum field'ı
        {
          $group: {
            _id: '$departman', // departman field'ı
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      // Lokasyon istatistikleri - Türkçe field adları
      Employee.aggregate([
        { $match: { durum: 'AKTIF' } }, // durum field'ı
        {
          $group: {
            _id: '$lokasyon', // lokasyon field'ı
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    // Tamamlanma oranı hesapla
    const completionRate = allShifts > 0 ? Math.round((activeShifts / allShifts) * 100) : 0;

    // Ek istatistikler
    const totalShifts = allShifts;
    const cancelledShifts = await Shift.countDocuments({ status: 'İPTAL' });
    
    console.log('📊 Dashboard İstatistikleri:', {
      totalEmployees,
      activeShifts,
      pendingApprovals,
      totalShifts,
      completionRate,
      departmentCount: departmentStats.length,
      locationCount: locationStats.length
    });

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeShifts,
        pendingApprovals,
        totalShifts,
        cancelledShifts,
        completionRate,
        departmentStats,
        locationStats,
        // Ek bilgiler
        stats: {
          departmentCount: departmentStats.length,
          locationCount: locationStats.length,
          lastUpdated: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Dashboard istatistik hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler getirilemedi',
      error: error.message
    });
  }
});

module.exports = router; 