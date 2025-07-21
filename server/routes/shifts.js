const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const Employee = require('../models/Employee');

// Tüm vardiyaları getir
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, location } = req.query;
    
    // Filtre oluştur
    const filter = {};
    if (status) filter.status = status;
    if (location) filter.location = location;
    
    const shifts = await Shift.find(filter)
      .populate('shiftGroups.shifts.employees.employeeId', 'adSoyad departman pozisyon lokasyon durum')
      .populate('specialGroups.employees.employeeId', 'adSoyad departman pozisyon lokasyon durum')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Shift.countDocuments(filter);

    res.json({
      success: true,
      data: shifts,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: shifts.length,
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Vardiya listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Vardiyalar getirilemedi',
      error: error.message
    });
  }
});

// Tek vardiya getir
router.get('/:id', async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate('shiftGroups.shifts.employees.employeeId', 'adSoyad departman pozisyon lokasyon durum')
      .populate('specialGroups.employees.employeeId', 'adSoyad departman pozisyon lokasyon durum');

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Vardiya bulunamadı'
      });
    }

    res.json({
      success: true,
      data: shift
    });
  } catch (error) {
    console.error('Vardiya getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Vardiya getirilemedi',
      error: error.message
    });
  }
});

// Yeni vardiya oluştur
router.post('/', async (req, res) => {
  try {
    console.log('Yeni vardiya oluşturuluyor:', req.body);
    
    const shift = new Shift(req.body);
    await shift.save();

    // Populate ederek geri dön
    await shift.populate('shiftGroups.shifts.employees.employeeId', 'adSoyad departman pozisyon lokasyon durum');

    res.status(201).json({
      success: true,
      message: 'Vardiya başarıyla oluşturuldu',
      data: shift
    });
  } catch (error) {
    console.error('Vardiya oluşturma hatası:', error);
    res.status(400).json({
      success: false,
      message: 'Vardiya oluşturulamadı',
      error: error.message
    });
  }
});

// Vardiya güncelle
router.put('/:id', async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.body.updatedBy || 'System' },
      { new: true, runValidators: true }
    ).populate('shiftGroups.shifts.employees.employeeId', 'firstName lastName department position');

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Vardiya bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Vardiya başarıyla güncellendi',
      data: shift
    });
  } catch (error) {
    console.error('Vardiya güncelleme hatası:', error);
    res.status(400).json({
      success: false,
      message: 'Vardiya güncellenemedi',
      error: error.message
    });
  }
});

// Vardiya sil
router.delete('/:id', async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Vardiya bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Vardiya başarıyla silindi'
    });
  } catch (error) {
    console.error('Vardiya silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Vardiya silinemedi',
      error: error.message
    });
  }
});

// Vardiya kopyalama - YENİ ÖZELLİK
router.post('/:id/copy', async (req, res) => {
  try {
    const { id } = req.params;
    const { newStartDate, newEndDate, title } = req.body;
    
    // Orijinal vardiyayı bul
    const originalShift = await Shift.findById(id);
    
    if (!originalShift) {
      return res.status(404).json({
        success: false,
        message: 'Kopyalanacak vardiya bulunamadı'
      });
    }
    
    console.log(`🔄 "${originalShift.title}" vardiyası kopyalanıyor...`);
    
    // Vardiya verilerini kopyala ve yeni tarih/başlık bilgilerini güncelle
    const newShiftData = originalShift.toObject();
    
    // MongoDB özel alanlarını temizle
    delete newShiftData._id;
    delete newShiftData.__v;
    delete newShiftData.createdAt;
    delete newShiftData.updatedAt;
    
    // Yeni bilgileri güncelle
    newShiftData.startDate = newStartDate || new Date();
    newShiftData.endDate = newEndDate || new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // Varsayılan 1 hafta
    newShiftData.title = title || `${originalShift.title} (Kopya)`;
    newShiftData.status = 'TASLAK';
    newShiftData.createdBy = req.body.createdBy || 'System';
    
    // Yeni vardiyayı oluştur
    const newShift = new Shift(newShiftData);
    await newShift.save();
    
    // Populate ederek geri dön
    await newShift.populate('shiftGroups.shifts.employees.employeeId', 'adSoyad departman pozisyon lokasyon durum');
    
    console.log(`✅ Yeni vardiya oluşturuldu: "${newShift.title}"`);
    
    res.status(201).json({
      success: true,
      message: 'Vardiya başarıyla kopyalandı',
      data: newShift
    });
  } catch (error) {
    console.error('Vardiya kopyalama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Vardiya kopyalanamadı',
      error: error.message
    });
  }
});

// Vardiya durumu güncelle
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.body.updatedBy || 'System' },
      { new: true }
    );

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Vardiya bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Vardiya durumu güncellendi',
      data: shift
    });
  } catch (error) {
    console.error('Vardiya durum güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Vardiya durumu güncellenemedi',
      error: error.message
    });
  }
});

// Çalışan çakışma kontrolü - YENİ ÖZELLİK
router.post('/check-conflicts', async (req, res) => {
  try {
    const { employeeId, timeSlot, date, excludeShiftId } = req.body;
    
    if (!employeeId || !timeSlot || !date) {
      return res.status(400).json({
        success: false,
        message: 'Çalışan ID, vardiya saati ve tarih gereklidir'
      });
    }
    
    // Tarih formatını düzenle (YYYY-MM-DD)
    const checkDate = new Date(date);
    const startOfDay = new Date(checkDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`🔍 ${employeeId} ID'li çalışanın ${timeSlot} saatinde çakışma kontrolü yapılıyor...`);
    
    // Vardiya saatlerini parçala
    const [startTime, endTime] = timeSlot.split('-');
    
    // Aynı tarihte, aynı çalışanın olduğu vardiyaları bul
    const conflictingShifts = await Shift.find({
      $and: [
        // Tarih aralığında olan vardiyalar
        {
          $or: [
            { startDate: { $lte: endOfDay }, endDate: { $gte: startOfDay } },
            { startDate: { $gte: startOfDay, $lte: endOfDay } }
          ]
        },
        // Belirli bir vardiya hariç tutulabilir (güncelleme durumunda)
        ...(excludeShiftId ? [{ _id: { $ne: excludeShiftId } }] : []),
        // Çalışanın bulunduğu vardiyalar
        {
          $or: [
            { 'shiftGroups.shifts.employees.employeeId': employeeId },
            { 'specialGroups.employees.employeeId': employeeId }
          ]
        }
      ]
    }).select('title startDate endDate shiftGroups.shifts.timeSlot shiftGroups.shifts.employees specialGroups');
    
    // Çakışma kontrolü
    const conflicts = [];
    
    for (const shift of conflictingShifts) {
      // Normal vardiya grupları içinde kontrol
      for (const group of shift.shiftGroups) {
        for (const shiftItem of group.shifts) {
          // Bu vardiyada çalışan var mı?
          const hasEmployee = shiftItem.employees.some(emp => 
            emp.employeeId.toString() === employeeId.toString()
          );
          
          if (hasEmployee) {
            // Saat çakışması var mı kontrol et
            const [existingStartTime, existingEndTime] = shiftItem.timeSlot.split('-');
            
            // Basit çakışma kontrolü - aynı saat aralığı veya kesişen saatler
            if (
              (startTime <= existingEndTime && endTime >= existingStartTime) ||
              shiftItem.timeSlot === timeSlot
            ) {
              conflicts.push({
                shiftId: shift._id,
                shiftTitle: shift.title,
                date: shift.startDate,
                timeSlot: shiftItem.timeSlot
              });
              break; // Bu vardiya için çakışma bulundu
            }
          }
        }
      }
      
      // Özel gruplar içinde kontrol
      for (const specialGroup of shift.specialGroups) {
        const hasEmployee = specialGroup.employees.some(emp => 
          emp.employeeId.toString() === employeeId.toString()
        );
        
        if (hasEmployee) {
          const [existingStartTime, existingEndTime] = specialGroup.timeSlot.split('-');
          
          // Saat çakışması kontrolü
          if (
            (startTime <= existingEndTime && endTime >= existingStartTime) ||
            specialGroup.timeSlot === timeSlot
          ) {
            conflicts.push({
              shiftId: shift._id,
              shiftTitle: shift.title,
              date: shift.startDate,
              timeSlot: specialGroup.timeSlot,
              isSpecialGroup: true,
              specialGroupType: specialGroup.groupType
            });
          }
        }
      }
    }
    
    res.json({
      success: true,
      hasConflicts: conflicts.length > 0,
      conflicts,
      message: conflicts.length > 0 
        ? `${conflicts.length} vardiya çakışması bulundu` 
        : 'Çakışma bulunamadı'
    });
    
  } catch (error) {
    console.error('Çakışma kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Çakışma kontrolü yapılamadı',
      error: error.message
    });
  }
});

// Otomatik vardiya oluşturma - çalışan tercihlerine göre
router.post('/generate', async (req, res) => {
  try {
    const { startDate, endDate, location, departments } = req.body;
    
    console.log('Otomatik vardiya oluşturuluyor:', { startDate, endDate, location, departments });

    // Belirtilen kriterlere göre çalışanları getir
    const filter = { durum: 'AKTIF' }; // Sadece aktif çalışanlar
    
    // Işıl Şube için lokasyon filtresi uygulanmayacak
    if (location !== 'IŞIL ŞUBE') {
      const dbLocation = location === 'MERKEZ ŞUBE' ? 'MERKEZ' : 
                        location === 'OSB ŞUBE' ? 'OSB' : location;
      filter.lokasyon = dbLocation;
    }

    console.log('🔍 Çalışan filtresi:', filter);

    const employees = await Employee.find(filter);
    console.log(`${employees.length} çalışan bulundu`);
    
    // Debug: Çalışan örnekleri
    if (employees.length > 0) {
      console.log('🔍 Bulunan çalışan örnekleri:', employees.slice(0, 3).map(e => ({
        name: e.adSoyad,
        department: e.departman,
        location: e.lokasyon,
        status: e.durum
      })));
    } else {
      console.log('⚠️ Hiç çalışan bulunamadı! Filter:', filter);
    }

    // Lokasyona göre varsayılan yöneticiler
    const managersByLocation = {
      'MERKEZ ŞUBE': {
        generalManager: { name: 'BİLAL CEVİZOĞLU', title: 'FABRİKA GENEL SORUMLUSU' },
        departmentManager: { name: 'MURAT ÇAVDAR', title: 'BÖLÜM SORUMLUSU' },
        supervisor: { name: 'MURAT SEPETÇİ', title: 'USTABAŞI' }
      },
      'IŞIL ŞUBE': {
        generalManager: { name: 'BATUHAN İLHAN', title: 'FABRİKA GENEL SORUMLUSU' },
        departmentManager: { name: 'BATUHAN İLHAN', title: 'BÖLÜM SORUMLUSU' },
        supervisor: { name: 'ALİ ŞİŞ YORULMAZ', title: 'USTABAŞI' }
      },
      'OSB ŞUBE': {
        generalManager: { name: 'BİLAL CEVİZOĞLU', title: 'FABRİKA GENEL SORUMLUSU' },
        departmentManager: { name: 'MURAT ÇAVDAR', title: 'BÖLÜM SORUMLUSU' },
        supervisor: { name: 'MURAT SEPETÇİ', title: 'USTABAŞI' }
      }
    };

    const managers = managersByLocation[location] || managersByLocation['MERKEZ ŞUBE'];

    // Vardiya gruplarını oluştur
    const shiftGroups = [];
    const processedEmployees = new Set();

    // Departmanlara göre grupla ve otomatik atama yap
    departments.forEach(deptName => {
      // Flexible departman eşleştirme
      let deptEmployees = employees.filter(e => {
        const empDept = e.departman || '';
        return empDept === deptName || empDept.includes(deptName) || deptName.includes(empDept);
      });
      
      // Eğer departmanda kimse yoksa, genel havuzdan çalışan al
      if (deptEmployees.length === 0) {
        console.log(`⚠️ ${deptName} departmanında çalışan bulunamadı, genel havuzdan atanıyor...`);
        // Genel çalışanları al (hala atanmamış olanlar)
        const unassignedEmployees = employees.filter(emp => 
          !processedEmployees.has(emp._id.toString())
        );
        deptEmployees = unassignedEmployees.slice(0, 3); // En fazla 3 kişi al
      }
      
      // Atanacak çalışanları işaretle
      deptEmployees.forEach(emp => processedEmployees.add(emp._id.toString()));
      
      console.log(`🔧 ${deptName}: ${deptEmployees.length} çalışan atanıyor`);
      
      // Vardiya oluştur ve çalışanları dağıt
      const shifts = [];
      
      if (dbLocation === 'İŞL' || location === 'IŞIL ŞUBE') {
        // Işıl Şube - tek vardiya
        shifts.push({
          timeSlot: '08:00-18:00',
          employees: deptEmployees.slice(0, 6).map(emp => {
            // 🔧 GELİŞTİRİLMİŞ İSİM ÇÖZÜMLEME  
            let employeeName = '';
            if (emp.adSoyad && emp.adSoyad.trim() !== '') {
              employeeName = emp.adSoyad.trim();
            } else if (emp.fullName && emp.fullName.trim() !== '') {
              employeeName = emp.fullName.trim();
            } else if (emp.firstName || emp.lastName) {
              employeeName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
            } else {
              employeeName = `Çalışan_${emp._id.toString().slice(-4)}`;
            }
            
            console.log(`🔧 İŞİL çalışanı atanıyor: ${employeeName} (${emp._id})`);
            
            return {
              employeeId: emp._id,
              name: employeeName,
              status: 'PLANLANDI'
            };
          })
        });
      } else {
        // Merkez Şube - departmana göre vardiya saatleri
        let timeSlots = ['08:00-18:00'];
        
        if (deptName === 'TORNA GRUBU' || deptName === 'KALİTE KONTROL') {
          timeSlots = ['08:00-18:00', '08:00-16:00', '16:00-24:00', '24:00-08:00'];
        } else if (deptName === 'FREZE GRUBU') {
          timeSlots = ['08:00-16:00', '16:00-24:00', '24:00-08:00'];
        }
        
        // Çalışanları vardiyalara dağıt
        const employeesPerShift = Math.ceil(deptEmployees.length / timeSlots.length);
        let employeeIndex = 0;
        
        timeSlots.forEach(timeSlot => {
          const shiftEmployees = [];
          for (let i = 0; i < employeesPerShift && employeeIndex < deptEmployees.length; i++) {
            const emp = deptEmployees[employeeIndex];
            
            // 🔧 GELİŞTİRİLMİŞ İSİM ÇÖZÜMLEME
            let employeeName = '';
            if (emp.adSoyad && emp.adSoyad.trim() !== '') {
              employeeName = emp.adSoyad.trim();
            } else if (emp.fullName && emp.fullName.trim() !== '') {
              employeeName = emp.fullName.trim();
            } else if (emp.firstName || emp.lastName) {
              employeeName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
            } else {
              employeeName = `Çalışan_${emp._id.toString().slice(-4)}`;
            }
            
            console.log(`🔧 Çalışan atanıyor: ${employeeName} (${emp._id})`);
            
            shiftEmployees.push({
              employeeId: emp._id,
              name: employeeName,
              status: 'PLANLANDI'
            });
            employeeIndex++;
          }
          
          shifts.push({ timeSlot, employees: shiftEmployees });
        });
      }
      
      if (shifts.length > 0) {
        shiftGroups.push({ groupName: deptName, shifts });
      }
    });

    // Yeni vardiya oluştur
    const newShift = new Shift({
      title: `${location} - ${new Date(startDate).toLocaleDateString('tr-TR')} Haftalık Vardiya`,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      generalManager: managers.generalManager,
      departmentManager: managers.departmentManager,
      supervisor: managers.supervisor,
      shiftGroups,
      nightShiftNote: location === 'MERKEZ ŞUBE' ? 
        "24:00-08:00 GECE VARDİYASI PAZARTESİYİ SALIYA BAĞLAYAN GECE BAŞLAYACAKTIR." : "",
      createdBy: 'System',
      status: 'TASLAK'
    });

    await newShift.save();
    await newShift.populate('shiftGroups.shifts.employees.employeeId', 'adSoyad departman pozisyon lokasyon durum');

    // Debug: Response'un son hali
    console.log('🔍 Response gönderiliyor:', {
      location: newShift.location,
      shiftGroupsCount: newShift.shiftGroups?.length,
      firstGroup: newShift.shiftGroups?.[0] ? {
        groupName: newShift.shiftGroups[0].groupName,
        shiftsCount: newShift.shiftGroups[0].shifts?.length,
        firstShiftEmployees: newShift.shiftGroups[0].shifts?.[0]?.employees?.length
      } : null
    });

    res.status(201).json({
      success: true,
      message: 'Otomatik vardiya başarıyla oluşturuldu',
      data: newShift
    });

  } catch (error) {
    console.error('Otomatik vardiya oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Otomatik vardiya oluşturulamadı',
      error: error.message
    });
  }
});

// 🔧 TEST VARDİYASI OLUŞTURMA ENDPOINT
router.post('/create-test-shift', async (req, res) => {
  try {
    console.log('🧪 Test vardiyası oluşturuluyor...');
    
    // Test çalışanları oluştur/getir
    const testEmployees = await Employee.find({ durum: 'AKTIF' }).limit(10);
    
    if (testEmployees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Test için yeterli çalışan bulunamadı'
      });
    }
    
    console.log(`🔍 Test için ${testEmployees.length} çalışan bulundu`);
    
    // Test vardiyası oluştur
    const testShift = new Shift({
      title: 'TEST VARDİYASİ - Excel Test',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
      location: 'MERKEZ ŞUBE',
      description: 'Excel export test için oluşturulan test vardiyası',
      generalManager: { name: 'BİLAL CEVİZOĞLU', title: 'FABRİKA GENEL SORUMLUSU' },
      departmentManager: { name: 'MURAT ÇAVDAR', title: 'BÖLÜM SORUMLUSU' },
      supervisor: { name: 'MURAT SEPETÇİ', title: 'USTABAŞI' },
      shiftGroups: [
        {
          groupName: 'MERKEZ FABRİKA',
          shifts: [
            {
              timeSlot: '08:00-18:00',
              employees: testEmployees.slice(0, 3).map(emp => {
                let employeeName = '';
                if (emp.adSoyad && emp.adSoyad.trim() !== '') {
                  employeeName = emp.adSoyad.trim();
                } else if (emp.fullName && emp.fullName.trim() !== '') {
                  employeeName = emp.fullName.trim();
                } else if (emp.firstName || emp.lastName) {
                  employeeName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                } else {
                  employeeName = `Test_Çalışan_${emp._id.toString().slice(-4)}`;
                }
                
                console.log(`🧪 Test çalışanı ekleniyor: ${employeeName} (${emp._id})`);
                
                return {
                  employeeId: emp._id,
                  name: employeeName,
                  status: 'PLANLANDI'
                };
              })
            },
            {
              timeSlot: '08:00-16:00',
              employees: testEmployees.slice(3, 5).map(emp => {
                let employeeName = '';
                if (emp.adSoyad && emp.adSoyad.trim() !== '') {
                  employeeName = emp.adSoyad.trim();
                } else if (emp.fullName && emp.fullName.trim() !== '') {
                  employeeName = emp.fullName.trim();
                } else if (emp.firstName || emp.lastName) {
                  employeeName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                } else {
                  employeeName = `Test_Çalışan_${emp._id.toString().slice(-4)}`;
                }
                
                return {
                  employeeId: emp._id,
                  name: employeeName,
                  status: 'PLANLANDI'
                };
              })
            }
          ]
        },
        {
          groupName: 'İDARİ BİRİM',
          shifts: [
            {
              timeSlot: '08:00-18:00',
              employees: testEmployees.slice(5, 8).map(emp => {
                let employeeName = '';
                if (emp.adSoyad && emp.adSoyad.trim() !== '') {
                  employeeName = emp.adSoyad.trim();
                } else if (emp.fullName && emp.fullName.trim() !== '') {
                  employeeName = emp.fullName.trim();
                } else if (emp.firstName || emp.lastName) {
                  employeeName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                } else {
                  employeeName = `Test_Çalışan_${emp._id.toString().slice(-4)}`;
                }
                
                return {
                  employeeId: emp._id,
                  name: employeeName,
                  status: 'PLANLANDI'
                };
              })
            }
          ]
        }
      ],
      status: 'TASLAK',
      createdBy: 'Test System'
    });
    
    await testShift.save();
    
    // Populate ederek geri dön
    await testShift.populate({
      path: 'shiftGroups.shifts.employees.employeeId',
      select: 'adSoyad firstName lastName departman pozisyon lokasyon durum fullName employeeId tcNo'
    });
    
    console.log('✅ Test vardiyası oluşturuldu:', testShift._id);
    
    res.status(201).json({
      success: true,
      message: 'Test vardiyası başarıyla oluşturuldu',
      data: testShift,
      testInfo: {
        totalEmployees: testShift.shiftGroups.reduce((total, group) => {
          return total + group.shifts.reduce((groupTotal, shift) => {
            return groupTotal + (shift.employees?.length || 0);
          }, 0);
        }, 0),
        groups: testShift.shiftGroups.map(group => ({
          name: group.groupName,
          shiftsCount: group.shifts.length,
          employeesCount: group.shifts.reduce((total, shift) => total + (shift.employees?.length || 0), 0)
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Test vardiyası oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Test vardiyası oluşturulamadı',
      error: error.message
    });
  }
});

// Çalışan ismi alma fonksiyonu
const getEmployeeName = (emp) => {
  // Önce employeeId'den kontrol et
  if (emp.employeeId) {
    if (emp.employeeId.adSoyad) return emp.employeeId.adSoyad;
    if (emp.employeeId.fullName) return emp.employeeId.fullName;
    if (emp.employeeId.firstName && emp.employeeId.lastName) {
      return `${emp.employeeId.firstName} ${emp.employeeId.lastName}`.trim();
    }
  }
  
  // Direkt emp objesinden kontrol et
  if (emp.adSoyad) return emp.adSoyad;
  if (emp.fullName) return emp.fullName;
  if (emp.firstName && emp.lastName) {
    return `${emp.firstName} ${emp.lastName}`.trim();
  }
  
  return 'İsim Bulunamadı';
};

// Excel export fonksiyonu
router.post('/export/shift', async (req, res) => {
  try {
    // ... existing code ...
    
    // Kolon genişliklerini ayarla - PROFESYONEL
    worksheet.columns = [
      { width: 6 },   // Sıra
      { width: 35 },  // Ad Soyad - Genişletildi
      { width: 25 },  // Departman
      { width: 25 },  // Pozisyon
      { width: 15 },  // Vardiya
      { width: 35 },  // Güzergah
      { width: 25 },  // Durak
      { width: 25 },  // Adres
      { width: 15 },  // Telefon
      { width: 15 },  // Acil Durum Tel.
      { width: 20 }   // Notlar
    ];

    // Her hücre için yazı tipi ve hizalama ayarları
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 11 };
        cell.alignment = { 
          vertical: 'middle',
          horizontal: cell.col === 1 ? 'center' : 'left',
          wrapText: true // Uzun metinleri alt satıra geçir
        };
      });
    });

    // ... existing code ...

    // Departman sayfaları için kolon genişlikleri ve formatlamalar
    shift.shiftGroups.forEach((group, groupIndex) => {
      const departmentName = group.groupName;
      const deptSheet = workbook.addWorksheet(departmentName);
      
      // Kolon genişlikleri
      deptSheet.columns = [
        { width: 6 },   // Sıra
        { width: 35 },  // Ad Soyad - Genişletildi
        { width: 25 },  // Departman
        { width: 25 },  // Pozisyon
        { width: 15 },  // Vardiya
        { width: 35 },  // Güzergah
        { width: 25 },  // Durak
        { width: 25 },  // Adres
        { width: 15 },  // Telefon
        { width: 15 },  // Acil Durum Tel.
        { width: 20 }   // Notlar
      ];
      
      // Her hücre için yazı tipi ve hizalama ayarları
      deptSheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.font = { name: 'Calibri', size: 11 };
          cell.alignment = { 
            vertical: 'middle',
            horizontal: cell.col === 1 ? 'center' : 'left',
            wrapText: true // Uzun metinleri alt satıra geçir
          };
        });
      });
      
      // Çalışan isimlerini formatla
      group.shifts.forEach(shift => {
        shift.employees.forEach(emp => {
          const employeeName = getEmployeeName(emp);
          // İsim hücresini güncelle
          const nameCell = deptSheet.getCell(`B${currentRow}`);
          nameCell.value = employeeName;
          nameCell.font = { name: 'Calibri', size: 11, bold: true };
          nameCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        });
      });
    });

    // ... existing code ...
  } catch (error) {
    console.error('Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel export işlemi başarısız oldu',
      error: error.message
    });
  }
});

module.exports = router; 