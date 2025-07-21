const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Shift = require('../models/Shift');
const ServiceSchedule = require('../models/ServiceSchedule');
const Employee = require('../models/Employee');

// Takvim verileri endpoint'i - tüm tarih-temelli verileri getir
router.get('/events', async (req, res) => {
  try {
    const { startDate, endDate, eventTypes } = req.query;
    
    console.log('📅 Calendar API çağrısı:', {
      startDate,
      endDate,
      eventTypes
    });
    
    // Tarih aralığı filtreleri
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    let events = [];
    const types = eventTypes ? eventTypes.split(',') : ['shifts', 'services', 'employees'];
    
    console.log('🔍 Aranacak event tipleri:', types);

    // 📋 Vardiya verileri al
    if (types.includes('shifts')) {
      const shifts = await Shift.find({
        ...(Object.keys(dateFilter).length > 0 && {
          $or: [
            { startDate: dateFilter },
            { endDate: dateFilter },
            {
              startDate: { $lte: dateFilter.$lte || new Date() },
              endDate: { $gte: dateFilter.$gte || new Date('2020-01-01') }
            }
          ]
        })
      }).select('title startDate endDate location status shiftGroups createdBy');

      console.log('📋 Bulunan vardiyalar:', shifts.length);

      // Vardiyaları takvim event formatına çevir
      shifts.forEach(shift => {
        // Sadece ana vardiya eventi oluştur (detaylar dialog'da gösterilecek)
        const totalEmployees = shift.shiftGroups?.reduce((total, group) => {
          return total + (group.shifts?.reduce((groupTotal, s) => {
            return groupTotal + (s.employees?.length || 0);
          }, 0) || 0);
        }, 0) || 0;

        events.push({
          id: shift._id,
          title: shift.title.replace(/^📋\s?/, ''), // Emoji'yi kaldır
          start: shift.startDate,
          end: shift.endDate,
          type: 'shift',
          backgroundColor: getShiftColor(shift.status),
          borderColor: getShiftColor(shift.status),
          textColor: '#ffffff',
          extendedProps: {
            location: shift.location,
            status: shift.status,
            totalGroups: shift.shiftGroups?.length || 0,
            totalEmployees: totalEmployees,
            createdBy: shift.createdBy,
            description: `${shift.location} - ${shift.shiftGroups?.length || 0} grup, ${totalEmployees} çalışan`,
            // Detaylı grup bilgileri (dialog'da gösterilecek)
            groups: shift.shiftGroups?.map(group => ({
              groupName: group.groupName,
              shifts: group.shifts?.map(s => ({
                timeSlot: s.timeSlot,
                employeeCount: s.employees?.length || 0
              })) || []
            })) || []
          }
        });
      });
    }

    // 🚌 Servis programları al
    if (types.includes('services')) {
      const services = await ServiceSchedule.find({
        ...(Object.keys(dateFilter).length > 0 && {
          $or: [
            { startDate: dateFilter },
            { endDate: dateFilter },
            {
              startDate: { $lte: dateFilter.$lte || new Date() },
              endDate: { $gte: dateFilter.$gte || new Date('2020-01-01') }
            }
          ]
        })
      }).select('title startDate endDate status statistics serviceRoutes createdBy');

      console.log('🚌 Bulunan servisler:', services.length);

      services.forEach(service => {
        events.push({
          id: service._id,
          title: service.title.replace(/^🚌\s?/, ''), // Emoji'yi kaldır
          start: service.startDate,
          end: service.endDate,
          type: 'service',
          backgroundColor: getServiceColor(service.status),
          borderColor: getServiceColor(service.status),
          textColor: '#ffffff',
          extendedProps: {
            status: service.status,
            totalPassengers: service.statistics?.totalPassengers || 0,
            totalRoutes: service.statistics?.totalRoutes || 0,
            createdBy: service.createdBy,
            description: `${service.statistics?.totalPassengers || 0} yolcu, ${service.statistics?.totalRoutes || 0} güzergah`
          }
        });
      });
    }

    // 🎯 Özel etkinlikler (CustomEvent modelinden)
    if (types.includes('custom') || types.includes('events')) {
      const customEvents = await CustomEvent.find({
        ...(Object.keys(dateFilter).length > 0 && {
          $or: [
            { start: dateFilter },
            { end: dateFilter },
            {
              start: { $lte: dateFilter.$lte || new Date() },
              end: { $gte: dateFilter.$gte || new Date('2020-01-01') }
            }
          ]
        })
      });

      console.log('🎯 Bulunan özel etkinlikler:', customEvents.length);

      customEvents.forEach(event => {
        events.push({
          id: event._id,
          title: event.title,
          start: event.start,
          end: event.end,
          type: event.type,
          backgroundColor: event.backgroundColor || '#2196f3',
          borderColor: event.borderColor || '#1976d2',
          textColor: event.textColor || '#ffffff',
          extendedProps: {
            description: event.description,
            location: event.location,
            createdBy: event.createdBy,
            type: event.type
          }
        });
      });
    }

    // 👨‍💼 Çalışan işe giriş tarihleri (sadece son 30 gün)
    if (types.includes('employees')) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newEmployees = await Employee.find({
        hireDate: {
          $gte: thirtyDaysAgo,
          ...(Object.keys(dateFilter).length > 0 && dateFilter)
        }
      }).select('fullName hireDate department location');

      console.log('👨‍💼 Bulunan yeni çalışanlar:', newEmployees.length);

      newEmployees.forEach(employee => {
        events.push({
          id: `emp_${employee._id}`,
          title: `${employee.fullName} (İşe Başlama)`,
          start: employee.hireDate,
          end: employee.hireDate,
          type: 'employee',
          backgroundColor: '#4caf50',
          borderColor: '#388e3c',
          textColor: '#ffffff',
          allDay: true,
          extendedProps: {
            employeeName: employee.fullName,
            department: employee.department,
            location: employee.location,
            description: `${employee.department} - ${employee.location}`
          }
        });
      });
    }

    console.log('✅ Toplam event sayısı:', events.length);
    
    res.json({
      success: true,
      data: events,
      total: events.length
    });

  } catch (error) {
    console.error('Takvim verileri alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Takvim verileri alınamadı',
      error: error.message
    });
  }
});

// Özel etkinlikler için basit model
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  type: { type: String, default: 'custom' },
  description: String,
  location: String,
  createdBy: String,
  backgroundColor: String,
  borderColor: String,
  textColor: String,
  createdAt: { type: Date, default: Date.now }
});

// Eğer model zaten varsa kullan, yoksa oluştur
let CustomEvent;
try {
  CustomEvent = mongoose.model('CustomEvent');
} catch (e) {
  CustomEvent = mongoose.model('CustomEvent', EventSchema);
}

// Yeni etkinlik oluştur
router.post('/events', async (req, res) => {
  try {
    const { title, start, end, type, description, location } = req.body;

    console.log('📝 Yeni etkinlik oluşturuluyor:', { title, start, end, type, description, location });

    // Yeni etkinlik oluştur
    const newEvent = new CustomEvent({
      title,
      start: new Date(start),
      end: new Date(end),
      type: type || 'custom',
      description,
      location,
      createdBy: req.user?.name || 'Kullanıcı',
      backgroundColor: type === 'meeting' ? '#ff9800' : 
                     type === 'training' ? '#9c27b0' : 
                     type === 'maintenance' ? '#f44336' : '#2196f3',
      borderColor: type === 'meeting' ? '#f57c00' : 
                   type === 'training' ? '#7b1fa2' : 
                   type === 'maintenance' ? '#d32f2f' : '#1976d2',
      textColor: '#ffffff'
    });

    // Veritabanına kaydet
    const savedEvent = await newEvent.save();
    
    console.log('✅ Etkinlik kaydedildi:', savedEvent);

    res.json({
      success: true,
      message: 'Etkinlik başarıyla oluşturuldu',
      data: savedEvent
    });

  } catch (error) {
    console.error('❌ Etkinlik oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Etkinlik oluşturulamadı',
      error: error.message
    });
  }
});

// Vardiya renkleri
function getShiftColor(status) {
  switch (status) {
    case 'TASLAK': return '#ff9800';     // Turuncu
    case 'ONAYLANDI': return '#2196f3';  // Mavi  
    case 'YAYINLANDI': return '#4caf50'; // Yeşil
    case 'TAMAMLANDI': return '#9e9e9e'; // Gri
    case 'İPTAL': return '#f44336';      // Kırmızı
    default: return '#1976d2';           // Varsayılan mavi
  }
}

// Servis renkleri
function getServiceColor(status) {
  switch (status) {
    case 'AKTIF': return '#4caf50';      // Yeşil
    case 'PLANLANDI': return '#ff9800';  // Turuncu
    case 'TAMAMLANDI': return '#9e9e9e'; // Gri
    case 'İPTAL': return '#f44336';      // Kırmızı
    case 'PASIF': return '#757575';      // Koyu gri
    default: return '#673ab7';           // Mor
  }
}

// Takvim istatistikleri
router.get('/stats', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const currentDate = new Date();
    const startDate = new Date(year || currentDate.getFullYear(), (month - 1) || currentDate.getMonth(), 1);
    const endDate = new Date(year || currentDate.getFullYear(), month || (currentDate.getMonth() + 1), 0);

    console.log('📊 İstatistik aralığı:', {
      month: month || (currentDate.getMonth() + 1),
      year: year || currentDate.getFullYear(),
      startDate,
      endDate
    });

    // Bu aydaki istatistikler
    const [shiftCount, serviceCount, newEmployeeCount] = await Promise.all([
      Shift.countDocuments({
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } },
          { 
            startDate: { $lte: startDate },
            endDate: { $gte: endDate }
          }
        ]
      }),
      ServiceSchedule.countDocuments({
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } },
          { 
            startDate: { $lte: startDate },
            endDate: { $gte: endDate }
          }
        ]
      }),
      Employee.countDocuments({
        hireDate: { $gte: startDate, $lte: endDate }
      })
    ]);

    console.log('📊 Bulunan istatistikler:', {
      shifts: shiftCount,
      services: serviceCount,
      newEmployees: newEmployeeCount
    });

    res.json({
      success: true,
      data: {
        shifts: shiftCount,
        services: serviceCount,
        newEmployees: newEmployeeCount,
        month: month || (currentDate.getMonth() + 1),
        year: year || currentDate.getFullYear()
      }
    });

  } catch (error) {
    console.error('Takvim istatistikleri alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı',
      error: error.message
    });
  }
});

// Test endpoint'i - Manuel veri ekleme
router.post('/test-event', async (req, res) => {
  try {
    console.log('🧪 Test etkinliği oluşturuluyor...');
    
    const testEvent = new CustomEvent({
      title: 'Test Etkinliği',
      start: new Date(),
      end: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 saat sonra
      type: 'test',
      description: 'Bu bir test etkinliğidir',
      location: 'Test Lokasyonu',
      createdBy: 'Test Kullanıcı',
      backgroundColor: '#ff5722',
      borderColor: '#e64a19',
      textColor: '#ffffff'
    });

    const saved = await testEvent.save();
    console.log('✅ Test etkinliği kaydedildi:', saved);

    res.json({
      success: true,
      message: 'Test etkinliği oluşturuldu',
      data: saved
    });
  } catch (error) {
    console.error('❌ Test etkinliği hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Test etkinliği oluşturulamadı',
      error: error.message
    });
  }
});

// Etkinlik güncelle
router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start, end, type, description, location } = req.body;
    
    console.log('✏️ Etkinlik güncelleniyor:', { id, title, start, end });

    // Etkinliği bul ve güncelle
    const updatedEvent = await CustomEvent.findByIdAndUpdate(
      id,
      {
        title,
        start: new Date(start),
        end: new Date(end),
        type: type || 'custom',
        description,
        location,
        updatedAt: new Date()
      },
      { new: true } // Güncellenmiş halini döndür
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    console.log('✅ Etkinlik güncellendi:', updatedEvent);

    res.json({
      success: true,
      message: 'Etkinlik başarıyla güncellendi',
      data: updatedEvent
    });

  } catch (error) {
    console.error('❌ Etkinlik güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Etkinlik güncellenemedi',
      error: error.message
    });
  }
});

// Etkinlik sil
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Etkinlik siliniyor:', id);

    // Etkinliği bul ve sil
    const deletedEvent = await CustomEvent.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    console.log('✅ Etkinlik silindi:', deletedEvent.title);

    res.json({
      success: true,
      message: 'Etkinlik başarıyla silindi',
      data: deletedEvent
    });

  } catch (error) {
    console.error('❌ Etkinlik silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Etkinlik silinemedi',
      error: error.message
    });
  }
});

// Tek etkinlik getir
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await CustomEvent.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Tüm özel etkinlikleri listele (debug için)
router.get('/debug/events', async (req, res) => {
  try {
    const allEvents = await CustomEvent.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: allEvents.length,
      data: allEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 