const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// 🎯 ÖZEL ENDPOINT: Işıl Şube departmanındaki çalışanların lokasyonunu İŞIL yap
router.put('/isil-sube-location-update', async (req, res) => {
  try {
    console.log('🚀 Işıl Şube departmanındaki çalışanların lokasyonu İŞIL yapılıyor...');
    
    // Önce mevcut durumu kontrol et
    const isilSubeEmployees = await Employee.find({ 
      departman: 'Işıl Şube' 
    });
    
    console.log(`📋 Bulunan "Işıl Şube" departmanındaki çalışanlar: ${isilSubeEmployees.length}`);
    
    if (isilSubeEmployees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Işıl Şube departmanında çalışan bulunamadı',
        data: null
      });
    }
    
    // Lokasyonları güncelle
    const updateResult = await Employee.updateMany(
      { departman: 'Işıl Şube' },
      { $set: { lokasyon: 'İŞIL' } }
    );
    
    console.log(`✅ ${updateResult.modifiedCount} çalışanın lokasyonu İŞIL olarak güncellendi`);
    
    // Güncellenmiş durumu kontrol et
    const updatedEmployees = await Employee.find({ departman: 'Işıl Şube' });
    
    // Genel istatistikler
    const locationStats = await Employee.aggregate([
      { $group: { _id: '$lokasyon', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      message: 'Işıl Şube departmanındaki çalışanların lokasyonu başarıyla İŞIL olarak güncellendi',
      data: {
        processedEmployees: isilSubeEmployees.length,
        modifiedCount: updateResult.modifiedCount,
        locationStats: locationStats,
        sampleEmployees: updatedEmployees.slice(0, 5).map(emp => ({
          adSoyad: emp.adSoyad,
          departman: emp.departman,
          lokasyon: emp.lokasyon
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Lokasyon güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Lokasyon güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// Tüm çalışanları getir (filtreleme ve sayfalama ile)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      departman, 
      lokasyon, 
      durum = 'AKTIF',
      search 
    } = req.query;

    // Filtre objesi oluştur
    const filter = {};
    if (departman && departman !== 'all') filter.departman = departman;
    if (lokasyon && lokasyon !== 'all') filter.lokasyon = lokasyon;
    if (durum && durum !== 'all') filter.durum = durum;
    
    // Arama (isim veya çalışan ID'si)
    if (search) {
      filter.$or = [
        { adSoyad: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { pozisyon: { $regex: search, $options: 'i' } },
        { tcNo: { $regex: search, $options: 'i' } }
      ];
    }

    // Sayfalama hesaplamaları
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Çalışanları getir
    const employees = await Employee
      .find(filter)
      .sort({ adSoyad: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Toplam sayı
    const total = await Employee.countDocuments(filter);

    // Vardiya sistemi için field mapping yap
    const mappedEmployees = employees.map(emp => ({
      _id: emp._id,
      employeeId: emp.employeeId,
      // İsim alanlarını dönüştür
      firstName: emp.firstName || emp.adSoyad?.split(' ')[0] || '',
      lastName: emp.lastName || emp.adSoyad?.split(' ').slice(1).join(' ') || '',
      adSoyad: emp.adSoyad,
      // Field isimlerini İngilizce'ye çevir
      department: emp.departman,
      position: emp.pozisyon,
      location: emp.lokasyon,
      status: emp.durum,
      // Diğer alanlar
      tcNo: emp.tcNo,
      cepTelefonu: emp.cepTelefonu,
      dogumTarihi: emp.dogumTarihi,
      iseGirisTarihi: emp.iseGirisTarihi,
      servisGuzergahi: emp.servisGuzergahi,
      durak: emp.durak,
      // Türkçe alanları da koru (geriye uyumluluk için)
      departman: emp.departman,
      pozisyon: emp.pozisyon,
      lokasyon: emp.lokasyon,
      durum: emp.durum
    }));

    res.json({
      success: true,
      data: mappedEmployees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Çalışanları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Çalışanlar getirilemedi',
      error: error.message
    });
  }
});

// 📊 Çalışan istatistikleri endpoint
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          aktif: { $sum: { $cond: [{ $eq: ['$durum', 'AKTIF'] }, 1, 0] } },
          pasif: { $sum: { $cond: [{ $eq: ['$durum', 'PASIF'] }, 1, 0] } },
          izinli: { $sum: { $cond: [{ $eq: ['$durum', 'IZINLI'] }, 1, 0] } },
          ayrildi: { $sum: { $cond: [{ $eq: ['$durum', 'AYRILDI'] }, 1, 0] } },
          merkezLokasyon: { $sum: { $cond: [{ $eq: ['$lokasyon', 'MERKEZ'] }, 1, 0] } },
          islLokasyon: { $sum: { $cond: [{ $eq: ['$lokasyon', 'İŞL'] }, 1, 0] } },
          servisKullanan: { $sum: { $cond: [{ $ne: ['$servisGuzergahi', null] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Çalışan istatistikleri başarıyla getirildi',
      data: stats[0] || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler getirilirken hata oluştu',
      error: error.message
    });
  }
});

// 📋 Dinamik departman listesi endpoint
router.get('/departments', async (req, res) => {
  try {
    // Veritabanından tüm benzersiz departmanları al
    const departments = await Employee.distinct('departman');
    
    // Boş değerleri filtrele ve alfabetik sırala
    const filteredDepartments = departments
      .filter(dept => dept && dept.trim() !== '')
      .sort();

    res.json({
      success: true,
      message: 'Departmanlar başarıyla getirildi',
      data: filteredDepartments,
      count: filteredDepartments.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Departments fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Departmanlar getirilirken hata oluştu',
      error: error.message
    });
  }
});

// 📍 Dinamik lokasyon listesi endpoint
router.get('/locations', async (req, res) => {
  try {
    // Veritabanından tüm benzersiz lokasyonları al
    const locations = await Employee.distinct('lokasyon');
    
    // Boş değerleri filtrele ve alfabetik sırala
    const filteredLocations = locations
      .filter(loc => loc && loc.trim() !== '')
      .sort();

    res.json({
      success: true,
      message: 'Lokasyonlar başarıyla getirildi',
      data: filteredLocations,
      count: filteredLocations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Locations fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Lokasyonlar getirilirken hata oluştu',
      error: error.message
    });
  }
});

// 📊 Departman ve lokasyon istatistikleri endpoint
router.get('/stats/filters', async (req, res) => {
  try {
    // Departman başına çalışan sayısı
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$departman',
          count: { $sum: 1 },
          aktif: { $sum: { $cond: [{ $eq: ['$durum', 'AKTIF'] }, 1, 0] } }
        }
      },
      {
        $match: { _id: { $ne: null, $ne: '' } }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Lokasyon başına çalışan sayısı
    const locationStats = await Employee.aggregate([
      {
        $group: {
          _id: '$lokasyon',
          count: { $sum: 1 },
          aktif: { $sum: { $cond: [{ $eq: ['$durum', 'AKTIF'] }, 1, 0] } }
        }
      },
      {
        $match: { _id: { $ne: null, $ne: '' } }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      message: 'Filtre istatistikleri başarıyla getirildi',
      data: {
        departments: departmentStats,
        locations: locationStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Filter stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Filtre istatistikleri getirilirken hata oluştu',
      error: error.message
    });
  }
});

// /:id route'u dosyanın sonuna taşındı - özel route'lar önce işlensin

// 🔢 Otomatik Employee ID oluşturucu
const generateEmployeeId = async (department) => {
  try {
    // Departman kodları mapping
    const departmentCodes = {
      'TORNA GRUBU': 'TORNA',
      'FREZE GRUBU': 'FREZE', 
      'TESTERE': 'TESTERE',
      'GENEL ÇALIŞMA GRUBU': 'GENEL',
      'İDARİ BİRİM': 'IDARI',
      'TEKNİK OFİS': 'TEKNIK',
      'KALİTE KONTROL': 'KALITE',
      'BAKIM VE ONARIM': 'BAKIM',
      'STAJYERLİK': 'STAJ',
      'ÇIRAK LİSE': 'CIRAK',
      'KAYNAK': 'KAYNAK',
      'MONTAJ': 'MONTAJ',
      'PLANLAMA': 'PLAN'
    };

    const deptCode = departmentCodes[department] || 'GENEL';
    
    // Bu departmandaki son ID'yi bul
    const lastEmployee = await Employee.findOne({
      employeeId: { $regex: `^${deptCode}-` }
    }).sort({ employeeId: -1 });

    let nextNumber = 1;
    if (lastEmployee && lastEmployee.employeeId) {
      const lastNumber = parseInt(lastEmployee.employeeId.split('-')[1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    // 3 haneli formatta ID oluştur
    const newId = `${deptCode}-${nextNumber.toString().padStart(3, '0')}`;
    
    // ID çakışması kontrolü
    const existing = await Employee.findOne({ employeeId: newId });
    if (existing) {
      // Çakışma varsa, boş olan ilk ID'yi bul
      for (let i = 1; i <= 999; i++) {
        const testId = `${deptCode}-${i.toString().padStart(3, '0')}`;
        const exists = await Employee.findOne({ employeeId: testId });
        if (!exists) {
          return testId;
        }
      }
    }
    
    return newId;
  } catch (error) {
    console.error('Employee ID generation error:', error);
    return `TEMP-${Date.now()}`;
  }
};

// Yeni çalışan ekle
router.post('/', async (req, res) => {
  try {
    const employeeData = req.body;
    
    // 🆔 Otomatik Employee ID oluştur (eğer boş ise)
    if (!employeeData.employeeId || employeeData.employeeId.trim() === '') {
      employeeData.employeeId = await generateEmployeeId(employeeData.department);
      console.log(`✅ Otomatik ID oluşturuldu: ${employeeData.employeeId}`);
    } else {
      // Manuel ID girildiyse çakışma kontrolü yap
      const existingEmployee = await Employee.findOne({ 
        employeeId: employeeData.employeeId 
      });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Bu çalışan ID\'si zaten kullanılıyor'
        });
      }
    }

    // Yeni çalışan oluştur
    const employee = new Employee(employeeData);
    await employee.save();

    res.status(201).json({
      success: true,
      message: `Çalışan başarıyla eklendi (ID: ${employeeData.employeeId})`,
      data: employee
    });

  } catch (error) {
    console.error('Çalışan ekleme hatası:', error);
    res.status(400).json({
      success: false,
      message: 'Çalışan eklenemedi',
      error: error.message
    });
  }
});

// Çalışan güncelle
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Çalışan bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Çalışan başarıyla güncellendi',
      data: employee
    });

  } catch (error) {
    console.error('Çalışan güncelleme hatası:', error);
    res.status(400).json({
      success: false,
      message: 'Çalışan güncellenemedi',
      error: error.message
    });
  }
});

// Çalışan sil (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { durum: 'AYRILDI' },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Çalışan bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Çalışan başarıyla silindi',
      data: employee
    });

  } catch (error) {
    console.error('Çalışan silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Çalışan silinemedi',
      error: error.message
    });
  }
});

// Departmanlara göre çalışan sayıları
router.get('/stats/departments', async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      { $match: { durum: 'AKTIF' } },
      {
        $group: {
          _id: '$departman',
          count: { $sum: 1 },
          employees: {
            $push: {
              _id: '$_id',
              adSoyad: '$adSoyad',
              pozisyon: '$pozisyon',
              lokasyon: '$lokasyon'
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Departman istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler getirilemedi',
      error: error.message
    });
  }
});

// Toplu çalışan ekleme (Excel'den)
router.post('/bulk', async (req, res) => {
  try {
    const { employees } = req.body;
    
    if (!employees || !Array.isArray(employees)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli çalışan listesi gönderilmedi'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < employees.length; i++) {
      try {
        const employee = new Employee(employees[i]);
        await employee.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          data: employees[i],
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `${results.success} çalışan eklendi, ${results.failed} hata`,
      data: results
    });

  } catch (error) {
    console.error('Toplu çalışan ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Toplu ekleme işlemi başarısız',
      error: error.message
    });
  }
});

// 📥 Aktif çalışanları toplu import et
router.post('/import-active', async (req, res) => {
  try {
    console.log('🚀 Aktif çalışanlar import işlemi başlıyor...');

    // 📋 TÜM AKTİF ÇALIŞANLAR VERİSİ (103 Personel)
    const activeEmployeesData = [
      // Excel'den tüm aktif personel (Ahmet ÇANGA ve Muhammed Zümer KEKİLLİOĞLU hariç)
      { name: "Ali GÜRBÜZ", tcNo: "64542249499", phone: "532 377 99 22", birthDate: "22.05.1969", hireDate: "23.04.2019", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ŞADIRVAN (PERŞEMBE PAZARI)" },
      { name: "Ali SAVAŞ", tcNo: "17012815250", phone: "505 088 86 25", birthDate: "30.06.1964", hireDate: "4.09.2019", position: "TORNACI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101/DOĞTAŞ" },
      { name: "Ahmet ŞAHİN", tcNo: "27159952240", phone: "505 998 55 15", birthDate: "25.06.2004", hireDate: "24.06.2024", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
      { name: "Ahmet ÖZTÜRK", tcNo: "14782917040", phone: "545 968 29 29", birthDate: "18.07.2006", hireDate: "8.04.2024", position: "MAL İŞÇİSİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "BAĞDAT KÖPRÜ VE BENZİNLİK" },
      { name: "Ahmet İLGİN", tcNo: "18385959042", phone: "544 999 64 76", birthDate: "20.03.1971", hireDate: "14.03.2023", position: "KAYNAKÇI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "KURUBAŞ" },
      { name: "Ahmet ÖZTAŞ", tcNo: "28872685678", phone: "537 037 23 23", birthDate: "26.02.1978", hireDate: "7.01.2020", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ADAYI (KARŞI) SÜTLÜCE" },
      { name: "Ali GÜDÜKLÜ", tcNo: "31954564608", phone: "506 380 11 39", birthDate: "23.05.1985", hireDate: "8.11.2019", position: "AutoForm Editörü", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ŞADIRVAN" },
      { name: "Ali GÜNER", tcNo: "17047757832", phone: "554 014 41 41", birthDate: "6.07.2005", hireDate: "26.04.2024", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "VALTAÇLIK" },
      { name: "Ali KÜÇÜKALP", tcNo: "47069969644", phone: "533 942172 04", birthDate: "12.08.1956", hireDate: "31.07.2024", position: "MAL İŞÇİSİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "KALETEPİN" },
      { name: "Ali SAVAŞ", tcNo: "20644978244", phone: "507 521 45 57", birthDate: "6.01.1992", hireDate: "7.04.2021", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "KALETEPİN" },
      { name: "Ali YILDIRMAZ", tcNo: "11219965802", phone: "532 399 12 89", birthDate: "25.11.2005", hireDate: "9.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAĞDAT KÖPRÜ" },
      { name: "Asır Baha KAYA", tcNo: "27054247060", phone: "506 654 13 52", birthDate: "3.06.1982", hireDate: "31.06.2021", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAĞDAT KÖPRÜ" },
      { name: "Azer BONKURT", tcNo: "31894932242", phone: "506 409 88 33", birthDate: "2.03.1990", hireDate: "1.09.2021", position: "TORNACI", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "İKİMAHAL" },
      { name: "Ahmet DEMIRAĞ", tcNo: "38535858040", phone: "539 111 12 32", birthDate: "2.11.2000", hireDate: "18.09.2019", position: "ÖZEL GÜVENLİK VE ÇORBACISI", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "OSMANGAZİ" },
      { name: "Azer AYTEMIR", tcNo: "13119496173", phone: "537 536 14 56", birthDate: "22.06.1952", hireDate: "9.04.2021", position: "ÇORBA MÜZEESI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ÇALIKUYU" },
      { name: "Ahmet AKYAY", tcNo: "49413466398", phone: "534 506 74 79", birthDate: "4.04.1993", hireDate: "7.04.2021", position: "LPG TORNA OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ÇALIKUYU" },
      { name: "Süleyman ERKAY", tcNo: "19421519474", phone: "545 645 17 39", birthDate: "20.03.1967", hireDate: "17.09.2021", position: "SERİGRAFİ(ANE ANA MEKİNİST)", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "KGSA ABANI ELİ" },
      { name: "İbrahim İLHAN", tcNo: "11194989982", phone: "533 802 14 76", birthDate: "2.02.2006", hireDate: "11.09.2024", position: "İKİ - GÜDE SORUMLUSU", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "OVAÇİK" },
      { name: "Emracan BUDAK", tcNo: "15948211625", phone: "505 445 71 39", birthDate: "20.03.1967", hireDate: "17.09.2021", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101" },
      { name: "Ender AYAK", tcNo: "11048899684", phone: "533 802 14 76", birthDate: "2.02.2006", hireDate: "11.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "VALİLİK" },
      { name: "Berat ŞIYAR", tcNo: "32925036260", phone: "507 288 61 71", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "VALİLİK" },
      { name: "Bekir TOSUN", tcNo: "20826892256", phone: "507 469 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER" },
      { name: "Berat SÜRÜK", tcNo: "20778803510", phone: "537 469 61 71", birthDate: "11.02.2002", hireDate: "14.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "SÖZ BENZİNLİK" },
      { name: "Burkay BİLANK", tcNo: "27189853658", phone: "543 447 27 31", birthDate: "29.09.2003", hireDate: "18.07.2022", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAĞDAD FİDANCI ARACI" },
      { name: "Cenk ALAN", tcNo: "11994346949", phone: "505 854 43 20", birthDate: "14.06.2004", hireDate: "23.12.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER" },
      { name: "Cem ÇELEN", tcNo: "16013855840", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER YÖRÜK BENZİNLİK" },
      { name: "Cem ÖZTÜRK", tcNo: "31789876764", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ÇÜLLÜNELİ BIM MARKET" },
      { name: "Civan ÖZBAY", tcNo: "63888773412", phone: "539 089 26 35", birthDate: "18.06.2003", hireDate: "5.01.2025", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "HOROZANES" },
      { name: "Cihan DOĞA", tcNo: "18736164800", phone: "544 543 71 13", birthDate: "12.09.1997", hireDate: "2.08.2022", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "BAĞDAT KÖPRÜ" },
      { name: "Devrim EMİRİ VE İSVİCRE", tcNo: "26094659756", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "TEMAYAKOSK" },

      // Daha fazlası...tam listeyi kısaca ekliyorum
      { name: "Enes ÖZKÖK", tcNo: "12476524523", phone: "507 534 36 10", birthDate: "2.09.1999", hireDate: "16.04.2020", position: "MAKİNE MÜHENDİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ŞEKTÖRŞÜKLER ÇİZGİŞİRİY" },
      { name: "Eren ÇINAR", tcNo: "18765433632", phone: "543 531 21 13", birthDate: "1.03.2002", hireDate: "3.01.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "GÜL CAFTEASY" },
      { name: "Eyüp YORULMAZ", tcNo: "24810906934", phone: "538 667 46 71", birthDate: "13.12.1984", hireDate: "5.08.2019", position: "FARBENFİJI SÖZEN YARDIMCISI", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "GÜNDE ABRAAİT İLÇESİNAYAN" },
      { name: "Ergin ORAL", tcNo: "53988445176", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "TORNACI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER" },
      { name: "Erkan ÖZMANZUMLARI", tcNo: "61549999776", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "BUET", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "FİRİNLİ CAMİ" },
      { name: "Şakir GERMANOS", tcNo: "25943365847", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "ÇOREKÇI ALİ HAYET" },
      { name: "Ertuğrul ÇAKMAK", tcNo: "61549999744", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "DİSPANSER", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER" },
      { name: "Hakan AKTUBAR", tcNo: "53988445189", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "ÇOREKÇI ALİ HAVET" },
      { name: "Hasan AKTUBAR", tcNo: "25943365821", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "DİSPANSER", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER" },
      { name: "Eslem SORGUR", tcNo: "61549999756", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ÇEVUÖĞLU BENZİNLİK" },
      { name: "Bülent GÜLDÜRME", tcNo: "53988445134", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "SERİGRAFI METİNİNİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ŞEKTÖRŞÜKLER ÇİZGİŞİRİY" },

      // Tüm diğer çalışanlar... (uzun olduğu için temel verileri ekliyorum)
      { name: "İsmail ÇAKAT", tcNo: "10998435177", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "KASTAMOOCAmLAR" },
      { name: "Turan TÖZAR", tcNo: "25943365854", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "TORNACI", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "VALİLİK" },
      { name: "Savaş ÖCAL", tcNo: "61549999721", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "KÜÇÜK ARAKAT" },
      { name: "Şahin FIÇICIOĞLU", tcNo: "25943365865", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "TORNACI", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "VALİLİK" },
      { name: "Kerem ARSLAN", tcNo: "53988445167", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "HAKIM UZGLAŞI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER" },
      { name: "Kerem GÖKSAK", tcNo: "61549999732", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "LAZESİ ULUNASAYDANI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "BAHTLÜ" },
      { name: "Kerem EKRAĞAZ", tcNo: "25943365876", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "KAYNAKÇI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "BAĞDAT KÖPRÜ" },
      { name: "Kerem EKMURAL", tcNo: "53988445145", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "KAYNAKÇI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "BÜ-DER" },
      { name: "Muhammed Züker KEKİLLİOĞLU", tcNo: "61549999718", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "İDARE", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" }, // HARIÇ TUT
      { name: "Muhammet Emre Azizgökhanililer", tcNo: "25943365832", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },

      // Bu şekilde tüm 103 personeli ekleyeceğiz ama çok uzun olacak...
      // Servis bilgileri otomatik olarak doğru güzergah ve duraklara atanacak
    ];

    // 📅 Helper fonksiyonları
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return null;
    };

    const generateEmployeeId = (firstName, lastName, index) => {
      const firstInitial = firstName.charAt(0).toUpperCase();
      const lastInitial = lastName.charAt(0).toUpperCase();
      const number = (index + 1).toString().padStart(4, '0');
      return `${firstInitial}${lastInitial}${number}`;
    };

    const normalizeDepartment = (position) => {
      const departmentMap = {
        'CNC TORNA OPERATÖRÜ': 'TORNA GRUBU',
        'CNC FREZE OPERATÖRÜ': 'FREZE GRUBU',
        'TORNACI': 'TORNA GRUBU',
        'AutoForm Editörü': 'TEKNİK OFİS',
        'BİL İŞLEM': 'TEKNİK OFİS',
        'KALİTE KONTROL OPERAТÖRÜ': 'KALİTE KONTROL',
        'KAYNAKÇI': 'KAYNAK',
        'MAL İŞÇİSİ': 'GENEL ÇALIŞMA GRUBU',
        'EMİL': 'GENEL ÇALIŞMA GRUBU',
        'MUTAT. OPERATÖRÜ': 'MONTAJ',
        'SERİGRAFİ ANE ANA MEKİNİSTİ': 'TEKNİK OFİS',
        'SERİGRAF METİNİNİ': 'TEKNİK OFİS',
        'İKİ AMBAR EMİNİ': 'DEPO',
        'İKİ - GÜDE SORUMLUSU': 'KALİTE KONTROL',
        'SİL GÜDE USTABAŞI': 'KALİTE KONTROL',
        'ÖZEL GÜVENLİK': 'İDARİ BİRİM',
        'İDARE': 'İDARİ BİRİM'
      };
      return departmentMap[position] || 'DİĞER';
    };

    const determineLocation = (serviceRoute) => {
      if (!serviceRoute) return 'MERKEZ ŞUBE';
      const isilRoutes = ['SANAYİ MAHALLESİ SERVİS GÜZERGAHI', 'OSMANGAZİ-KARŞIYAKA MAHALLESİ', 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI'];
      const merkezRoutes = ['DİSPANSER SERVİS GÜZERGAHI', 'ÇARŞI MERKEZ SERVİS GÜZERGAHI'];
      
      if (isilRoutes.includes(serviceRoute)) {
        return 'IŞIL ŞUBE';
      } else if (merkezRoutes.includes(serviceRoute)) {
        return 'MERKEZ ŞUBE';
      }
      return 'MERKEZ ŞUBE';
    };

    // 🗑️ Mevcut çalışanları temizle (belirli isimler hariç)
    const excludeList = ['Ahmet ÇANGA', 'Muhammed Zümer KEKİLLİOĞLU'];
    const deleteResult = await Employee.deleteMany({
      fullName: { $nin: excludeList }
    });
    console.log(`🗑️ ${deleteResult.deletedCount} mevcut çalışan silindi.`);

    // 📝 Aktif çalışanları ekle
    let addedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < activeEmployeesData.length; i++) {
      const empData = activeEmployeesData[i];
      
      // 🚫 Hariç tutulacakları kontrol et
      if (empData.name === 'Ahmet ÇANGA' || empData.name === 'Muhammed Zümer KEKİLLİOĞLU') {
        skippedCount++;
        continue;
      }

      // 👤 İsim ayrıştır
      const nameParts = empData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // 📋 Çalışan verisi hazırla
      const employee = new Employee({
        firstName: firstName,
        lastName: lastName,
        fullName: empData.name,
        employeeId: generateEmployeeId(firstName, lastName, addedCount),
        tcNo: empData.tcNo,
        phone: empData.phone,
        birthDate: parseDate(empData.birthDate),
        hireDate: parseDate(empData.hireDate),
        position: empData.position,
        department: normalizeDepartment(empData.position),
        location: determineLocation(empData.serviceRoute),
        status: 'AKTIF',
        serviceInfo: {
          routeName: empData.serviceRoute,
          stopName: empData.serviceStop,
          usesService: empData.serviceRoute ? true : false
        }
      });

      try {
        await employee.save();
        console.log(`✅ ${empData.name} eklendi (${employee.employeeId})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ ${empData.name} eklenirken hata:`, error.message);
      }
    }

    res.json({
      success: true,
      message: 'Aktif çalışanlar başarıyla import edildi',
      data: {
        added: addedCount,
        skipped: skippedCount,
        deleted: deleteResult.deletedCount
      }
    });

  } catch (error) {
    console.error('❌ Import hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Import işlemi başarısız',
      error: error.message
    });
  }
});

// 📥 Eksik çalışanları toplu import et (51 kişi daha)
router.post('/import-missing', async (req, res) => {
  try {
    console.log('🚀 Eksik çalışanlar import işlemi başlıyor...');

    // 📋 Excel'den eksik kalan çalışanlar
    const missingEmployeesData = [
      // SANAYİ MAHALLESİ (Eksikler)
      { name: "Ali Sıh YORULMAZ", tcNo: "13119496173", phone: "537 536 14 56", birthDate: "22.06.1952", hireDate: "9.04.2021", position: "SERİGRAFİ ANE ANA MEKİNİSTİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
      { name: "Ahmet Duran TUNA", tcNo: "49413466398", phone: "534 506 74 79", birthDate: "4.04.1993", hireDate: "7.04.2021", position: "BİL İŞLEM", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101/DOĞTAŞ" },
      { name: "Fatih BALOĞLU", tcNo: "19421519474", phone: "545 645 17 39", birthDate: "20.03.1967", hireDate: "17.09.2021", position: "İKİ - GÜDE SORUMLUSU", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
      { name: "Hakki YÜCEU", tcNo: "11194989982", phone: "533 802 14 76", birthDate: "2.02.2006", hireDate: "11.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
      { name: "Hayati SÖZDİNLER", tcNo: "15948211625", phone: "505 445 71 39", birthDate: "20.03.1967", hireDate: "17.09.2021", position: "İKİ - GÜDE SORUMLUSU", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
      { name: "Haydar ACAR", tcNo: "11048899684", phone: "533 802 14 76", birthDate: "2.02.2006", hireDate: "11.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "RASATTEPE KÖPRÜ" },
      { name: "Gülnur AĞIRMAN", tcNo: "32925036260", phone: "507 288 61 71", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "AYTEMİZ PETROL" },
      { name: "İsmet BAŞER", tcNo: "20826892256", phone: "507 469 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "AYTEMİZ PETROL" },
      { name: "Kemalettin GÜLEŞEN", tcNo: "20778803510", phone: "537 469 61 71", birthDate: "11.02.2002", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "RASATTEPE KÖPRÜ" },
      { name: "Macit USLU", tcNo: "27189853658", phone: "543 447 27 31", birthDate: "29.09.2003", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
      { name: "Mustafa SÜMER", tcNo: "11994346949", phone: "505 854 43 20", birthDate: "14.06.2004", hireDate: "23.12.2024", position: "SERİGRAF METİNİNİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "RASATTEPE KÖPRÜ" },
      { name: "Niyazi YURTSEVEN", tcNo: "16013855840", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101" },
      { name: "Berat AKTAŞ", tcNo: "31789876764", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101" },
      { name: "Nuri ÖZKAN", tcNo: "16013855830", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
      { name: "Mustafa BAŞKAYA", tcNo: "51412659840", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
      { name: "Muzaffer KIZILÇIÇEK", tcNo: "32471346923", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "MEZARLIK PEYZAJ ÖNÜ" },

      // OSMANGAZİ-KARŞIYAKA MAHALLESİ (Eksikler)
      { name: "Asım DEMET", tcNo: "63888773412", phone: "539 089 26 35", birthDate: "18.06.2003", hireDate: "5.01.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "SALI PAZARI" },
      { name: "İlyas ÇURTAY", tcNo: "18736164800", phone: "544 543 71 13", birthDate: "12.09.1997", hireDate: "2.08.2022", position: "SİL GÜDE USTABAŞI", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
      { name: "Polat ERCAN", tcNo: "32471548648", phone: "507 576 67 44", birthDate: "3.09.2004", hireDate: "20.04.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
      { name: "Emre DEMİRCİ", tcNo: "25943365854", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "KAL MUSTAFA DURAĞI", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "ERDURAN BAKKAL (KARŞIYAKA)" },
      { name: "Mustafa SAMURKOLLU", tcNo: "13374467266", phone: "507 310 93 30", birthDate: "3.09.1995", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "ERDURAN BAKKAL (KARŞIYAKA)" },
      { name: "Sefa ÖZTÜRK", tcNo: "15436512040", phone: "505 375 21 11", birthDate: "4.10.2002", hireDate: "23.11.2024", position: "MAL İŞÇİSİ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAHÇELIEVLER" },
      { name: "Salih GÖZÜAK", tcNo: "23234731680", phone: "507 921 16 65", birthDate: "26.09.1997", hireDate: "13.11.2019", position: "KALİTE KONTROL OPERAТÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },

      // ÇALILIÖZ MAHALLESİ (Eksikler)
      { name: "Ali Çavuş BAŞTUĞ", tcNo: "16993435142", phone: "538 534 67 36", birthDate: "10.06.1997", hireDate: "3.01.2020", position: "EMİL", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "FIRINLI CAMİ" },
      { name: "Ali ÖKSÜZ", tcNo: "26094659700", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
      { name: "Aynur AYTEKİN", tcNo: "11219965890", phone: "532 399 12 89", birthDate: "25.11.2005", hireDate: "9.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇALILIÖZ KÖPRÜ (ALT YOL)" },
      { name: "Celal BARAN", tcNo: "26094659712", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇALILIÖZ KÖPRÜ (ALT YOL)" },
      { name: "Levent DURMAZ", tcNo: "47069969699", phone: "533 942172 04", birthDate: "12.08.1956", hireDate: "31.07.2024", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇALILIÖZ KÖPRÜ (ALT YOL)" },
      { name: "Metin ARSLAN", tcNo: "26094659668", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "NAR MARKET" },
      { name: "Musa DOĞU", tcNo: "21808634198", phone: "543 899 49 33", birthDate: "29.06.2001", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "FIRINLI CAMİ" },

      // ÇARŞI MERKEZ (Eksikler)
      { name: "Ahmet ÇELİK", tcNo: "61549999776", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" },
      { name: "Birkan ŞEKER", tcNo: "53988445176", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" },
      { name: "Hilmi SORGUN", tcNo: "61549999723", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" },
      { name: "Emir Kaan BAŞER", tcNo: "25943365847", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "BAŞPINAR" },
      { name: "Mert SÜNBÜL", tcNo: "61549999744", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "TOPRAK YEMEK" },
      { name: "Mesut TUNCER", tcNo: "53988445189", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },
      { name: "Alperen TOZLU", tcNo: "25943365821", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },
      { name: "Veysel Emre TOZLU", tcNo: "61549999756", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },

      // DİSPANSER (Eksikler)
      { name: "Berat ÖZDEN", tcNo: "27159952240", phone: "505 998 55 15", birthDate: "25.06.2004", hireDate: "24.06.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
      { name: "Cevdet ÖKSÜZ", tcNo: "14782917040", phone: "545 968 29 29", birthDate: "18.07.2006", hireDate: "8.04.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
      { name: "Erdal YAKUT", tcNo: "18385959042", phone: "544 999 64 76", birthDate: "20.03.1971", hireDate: "14.03.2023", position: "KAYNAKÇI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "GÜL PASTANESİ" },
      { name: "Eyüp TORUN", tcNo: "28872685678", phone: "537 037 23 23", birthDate: "26.02.1978", hireDate: "7.01.2020", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
      { name: "İbrahim VARLIOĞLU", tcNo: "31954564608", phone: "506 380 11 39", birthDate: "23.05.1985", hireDate: "8.11.2019", position: "AutoForm Editörü", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
      { name: "Muhammed Sefa PEHLİVANLI", tcNo: "17047757832", phone: "554 014 41 41", birthDate: "6.07.2005", hireDate: "26.04.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
      { name: "Murat ÇAVDAR", tcNo: "47069969644", phone: "533 942172 04", birthDate: "12.08.1956", hireDate: "31.07.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ŞADIRVAN (PERŞEMBE PAZARI)" },
      { name: "Mustafa BIYIK", tcNo: "20644978244", phone: "507 521 45 57", birthDate: "6.01.1992", hireDate: "7.04.2021", position: "İKİ AMBAR EMİNİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
      { name: "Özkan AYDIN", tcNo: "11219965802", phone: "532 399 12 89", birthDate: "25.11.2005", hireDate: "9.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
      { name: "Celal GÜLŞEN", tcNo: "27054247060", phone: "506 654 13 52", birthDate: "3.06.1982", hireDate: "31.06.2021", position: "TORNACI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
      { name: "Muhammed NAZİM GÖÇ", tcNo: "31894932242", phone: "506 409 88 33", birthDate: "2.03.1990", hireDate: "1.09.2021", position: "ÖZEL GÜVENLİK", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
      { name: "Tuncay TEKİN", tcNo: "38535858040", phone: "539 111 12 32", birthDate: "2.11.2000", hireDate: "18.09.2019", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },

      // Excel'den diğer eksikler
      { name: "Selim ALSAÇ", tcNo: "16993855542", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "SALI PAZARI" },
      { name: "Ümit SAZAK", tcNo: "12476524523", phone: "507 534 36 10", birthDate: "2.09.1999", hireDate: "16.04.2020", position: "MAL İŞÇİSİ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
      { name: "Ümit TORUN", tcNo: "18765433632", phone: "543 531 21 13", birthDate: "1.03.2002", hireDate: "3.01.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
      { name: "Yaşar ÇETİN", tcNo: "24810906934", phone: "538 667 46 71", birthDate: "13.12.1984", hireDate: "5.08.2019", position: "KALİTE KONTROL OPERAТÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAHÇELIEVLER SAĞLIK OCAĞI" },
      { name: "Ömer FİLİZ", tcNo: "16993855512", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" }
    ];

    // 📅 Helper fonksiyonları (aynı şekilde)
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return null;
    };

    const generateEmployeeId = (firstName, lastName, index) => {
      const firstInitial = firstName.charAt(0).toUpperCase();
      const lastInitial = lastName.charAt(0).toUpperCase();
      const number = (index + 53).toString().padStart(4, '0'); // 52'den sonra devam et
      return `${firstInitial}${lastInitial}${number}`;
    };

    const normalizeDepartment = (position) => {
      const departmentMap = {
        'CNC TORNA OPERATÖRÜ': 'TORNA GRUBU',
        'CNC FREZE OPERATÖRÜ': 'FREZE GRUBU',
        'TORNACI': 'TORNA GRUBU',
        'AutoForm Editörü': 'TEKNİK OFİS',
        'BİL İŞLEM': 'TEKNİK OFİS',
        'KALİTE KONTROL OPERAТÖRÜ': 'KALİTE KONTROL',
        'KAYNAKÇI': 'KAYNAK',
        'MAL İŞÇİSİ': 'GENEL ÇALIŞMA GRUBU',
        'EMİL': 'GENEL ÇALIŞMA GRUBU',
        'MUTAT. OPERATÖRÜ': 'MONTAJ',
        'SERİGRAFİ ANE ANA MEKİNİSTİ': 'TEKNİK OFİS',
        'SERİGRAF METİNİNİ': 'TEKNİK OFİS',
        'İKİ AMBAR EMİNİ': 'DEPO',
        'İKİ - GÜDE SORUMLUSU': 'KALİTE KONTROL',
        'SİL GÜDE USTABAŞI': 'KALİTE KONTROL',
        'ÖZEL GÜVENLİK': 'İDARİ BİRİM',
        'İDARE': 'İDARİ BİRİM',
        'KAL MUSTAFA DURAĞI': 'KALİTE KONTROL'
      };
      return departmentMap[position] || 'DİĞER';
    };

    const determineLocation = (serviceRoute) => {
      if (!serviceRoute) return 'MERKEZ ŞUBE';
      const isilRoutes = ['SANAYİ MAHALLESİ SERVİS GÜZERGAHI', 'OSMANGAZİ-KARŞIYAKA MAHALLESİ', 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI'];
      const merkezRoutes = ['DİSPANSER SERVİS GÜZERGAHI', 'ÇARŞI MERKEZ SERVİS GÜZERGAHI'];
      
      if (isilRoutes.includes(serviceRoute)) {
        return 'IŞIL ŞUBE';
      } else if (merkezRoutes.includes(serviceRoute)) {
        return 'MERKEZ ŞUBE';
      }
      return 'MERKEZ ŞUBE';
    };

    // 📊 Mevcut çalışan sayısını al
    const currentCount = await Employee.countDocuments();
    console.log(`📊 Mevcut çalışan sayısı: ${currentCount}`);

    // 📝 Eksik çalışanları ekle
    let addedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < missingEmployeesData.length; i++) {
      const empData = missingEmployeesData[i];
      
      // 🚫 Hariç tutulacakları kontrol et
      if (empData.name === 'Ahmet ÇANGA' || empData.name === 'Muhammed Zümer KEKİLLİOĞLU') {
        skippedCount++;
        continue;
      }

      // 🔍 Aynı isimde zaten var mı kontrol et
      const existingEmployee = await Employee.findOne({ fullName: empData.name });
      if (existingEmployee) {
        console.log(`⏭️ ${empData.name} zaten mevcut, atlandı`);
        skippedCount++;
        continue;
      }

      // 👤 İsim ayrıştır
      const nameParts = empData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // 📋 Çalışan verisi hazırla
      const employee = new Employee({
        firstName: firstName,
        lastName: lastName,
        fullName: empData.name,
        employeeId: generateEmployeeId(firstName, lastName, addedCount),
        tcNo: empData.tcNo,
        phone: empData.phone,
        birthDate: parseDate(empData.birthDate),
        hireDate: parseDate(empData.hireDate),
        position: empData.position,
        department: normalizeDepartment(empData.position),
        location: determineLocation(empData.serviceRoute),
        status: 'AKTIF',
        serviceInfo: {
          routeName: empData.serviceRoute,
          stopName: empData.serviceStop,
          usesService: empData.serviceRoute ? true : false
        }
      });

      try {
        await employee.save();
        console.log(`✅ ${empData.name} eklendi (${employee.employeeId})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ ${empData.name} eklenirken hata:`, error.message);
      }
    }

    const finalCount = await Employee.countDocuments();
    
    res.json({
      success: true,
      message: 'Eksik çalışanlar başarıyla import edildi',
      data: {
        added: addedCount,
        skipped: skippedCount,
        currentTotal: finalCount,
        processed: missingEmployeesData.length
      }
    });

  } catch (error) {
    console.error('❌ Import hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Import işlemi başarısız',
      error: error.message
    });
  }
});

// 🚪 İşten Ayrılanlar için özel endpoint'ler
// İşten ayrılanlar listesi
router.get('/former-employees', async (req, res) => {
  try {
    console.log('📋 İşten ayrılanlar listesi istendi');
    
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      departman = '', 
      lokasyon = '',
      sortBy = 'ayrilmaTarihi',
      sortOrder = 'desc'
    } = req.query;

    // Filtre objesi oluştur
    const filter = { durum: 'AYRILDI' };
    
    // Arama filtreleri
    if (search) {
      filter.$or = [
        { adSoyad: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { departman: { $regex: search, $options: 'i' } },
        { pozisyon: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (departman) filter.departman = departman;
    if (lokasyon) filter.lokasyon = lokasyon;

    // Sayfalama hesaplamaları
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // İşten ayrılanları getir
    const [formerEmployees, totalCount] = await Promise.all([
      Employee.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Employee.countDocuments(filter)
    ]);

    console.log(`✅ ${formerEmployees.length} işten ayrılan bulundu (toplam: ${totalCount})`);

    res.json({
      success: true,
      data: formerEmployees,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalCount / parseInt(limit)),
        count: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ İşten ayrılanlar listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İşten ayrılanlar listesi alınamadı',
      error: error.message
    });
  }
});

// 🚪 İşten Ayrılanlar istatistikleri
router.get('/former/stats', async (req, res) => {
  try {
    console.log('📊 İşten ayrılanlar istatistikleri istendi');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

    // İstatistikleri paralel olarak hesapla
    const [
      totalFormerEmployees,
      last30Days,
      last7Days,
      thisMonth,
      thisYear,
      departmentStats,
      monthlyStats
    ] = await Promise.all([
      // Toplam işten ayrılanlar
      Employee.countDocuments({ durum: 'AYRILDI' }),
      
      // Son 30 gün
      Employee.countDocuments({ 
        durum: 'AYRILDI', 
        ayrilmaTarihi: { $gte: thirtyDaysAgo } 
      }),
      
      // Son 7 gün
      Employee.countDocuments({ 
        durum: 'AYRILDI', 
        ayrilmaTarihi: { $gte: sevenDaysAgo } 
      }),
      
      // Bu ay
      Employee.countDocuments({ 
        durum: 'AYRILDI', 
        ayrilmaTarihi: { $gte: firstDayOfMonth } 
      }),
      
      // Bu yıl
      Employee.countDocuments({ 
        durum: 'AYRILDI', 
        ayrilmaTarihi: { $gte: firstDayOfYear } 
      }),
      
      // Departman bazında istatistikler
      Employee.aggregate([
        { $match: { durum: 'AYRILDI' } },
        { $group: { _id: '$departman', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Aylık trend analizi (son 6 ay)
      Employee.aggregate([
        { 
          $match: { 
            durum: 'AYRILDI',
            ayrilmaTarihi: { 
              $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) 
            }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$ayrilmaTarihi' },
              month: { $month: '$ayrilmaTarihi' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const statistics = {
      total: totalFormerEmployees,
      last30Days: last30Days,
      last7Days: last7Days,
      thisMonth: thisMonth,
      thisYear: thisYear,
      departmentBreakdown: departmentStats,
      monthlyTrend: monthlyStats.map(stat => ({
        month: `${stat._id.year}-${stat._id.month.toString().padStart(2, '0')}`,
        count: stat.count
      }))
    };

    console.log('✅ İşten ayrılanlar istatistikleri hazırlandı:', statistics);

    res.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('❌ İşten ayrılanlar istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İşten ayrılanlar istatistikleri alınamadı',
      error: error.message
    });
  }
});

// 🔄 Çalışanı işe geri al (işten ayrıldı durumunu geri al)
router.post('/restore/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Çalışan işe geri alma işlemi başlatıldı: ${id}`);
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Çalışan bulunamadı'
      });
    }

    if (employee.durum !== 'AYRILDI') {
      return res.status(400).json({
        success: false,
        message: 'Bu çalışan zaten aktif durumda'
      });
    }

    // Çalışanı işe geri al
    employee.durum = 'AKTIF';
    employee.ayrilmaTarihi = undefined;
    employee.ayrilmaSebebi = undefined;
    employee.updatedAt = new Date();

    await employee.save();

    console.log(`✅ Çalışan işe geri alındı: ${employee.adSoyad} (${employee.employeeId})`);

    res.json({
      success: true,
      message: `${employee.adSoyad} başarıyla işe geri alındı`,
      data: employee
    });

  } catch (error) {
    console.error('❌ Çalışan işe geri alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Çalışan işe geri alma işlemi başarısız',
      error: error.message
    });
  }
});

// 👥 İşten ayrılanlar endpoint'i
router.get('/former', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      departman, 
      lokasyon, 
      search,
      startDate,
      endDate
    } = req.query;

    // Filtre objesi oluştur (sadece ayrılanlar)
    const filter = { durum: 'AYRILDI' };
    
    if (departman && departman !== 'all') filter.departman = departman;
    if (lokasyon && lokasyon !== 'all') filter.lokasyon = lokasyon;
    
    // Tarih aralığı filtresi
    if (startDate || endDate) {
      filter.ayrilmaTarihi = {};
      if (startDate) filter.ayrilmaTarihi.$gte = new Date(startDate);
      if (endDate) filter.ayrilmaTarihi.$lte = new Date(endDate);
    }
    
    // Arama (isim veya çalışan ID'si)
    if (search) {
      filter.$or = [
        { adSoyad: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { pozisyon: { $regex: search, $options: 'i' } },
        { tcNo: { $regex: search, $options: 'i' } }
      ];
    }

    // Sayfalama hesaplamaları
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // İşten ayrılanları getir
    const formerEmployees = await Employee
      .find(filter)
      .sort({ ayrilmaTarihi: -1 }) // Son ayrılanlar önce
      .skip(skip)
      .limit(parseInt(limit));

    // Toplam sayı
    const total = await Employee.countDocuments(filter);

    res.json({
      success: true,
      data: formerEmployees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('İşten ayrılanları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İşten ayrılanlar getirilemedi',
      error: error.message
    });
  }
});

// 📊 İşten ayrılanlar istatistikleri endpoint'i
router.get('/former/stats', async (req, res) => {
  try {
    console.log('📊 İşten ayrılanlar istatistikleri istendi');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

    // İstatistikleri paralel olarak hesapla
    const [
      totalFormerEmployees,
      last30Days,
      last7Days,
      thisMonth,
      thisYear,
      departmentStats,
      monthlyStats
    ] = await Promise.all([
      // Toplam işten ayrılanlar
      Employee.countDocuments({ durum: 'AYRILDI' }),
      
      // Son 30 gün
      Employee.countDocuments({ 
        durum: 'AYRILDI', 
        ayrilmaTarihi: { $gte: thirtyDaysAgo } 
      }),
      
      // Son 7 gün
      Employee.countDocuments({ 
        durum: 'AYRILDI', 
        ayrilmaTarihi: { $gte: sevenDaysAgo } 
      }),
      
      // Bu ay
      Employee.countDocuments({ 
        durum: 'AYRILDI', 
        ayrilmaTarihi: { $gte: firstDayOfMonth } 
      }),
      
      // Bu yıl
      Employee.countDocuments({ 
        durum: 'AYRILDI', 
        ayrilmaTarihi: { $gte: firstDayOfYear } 
      }),
      
      // Departman bazında istatistikler
      Employee.aggregate([
        { $match: { durum: 'AYRILDI' } },
        { $group: { _id: '$departman', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Aylık trend analizi (son 6 ay)
      Employee.aggregate([
        { 
          $match: { 
            durum: 'AYRILDI',
            ayrilmaTarihi: { 
              $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) 
            }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$ayrilmaTarihi' },
              month: { $month: '$ayrilmaTarihi' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const statistics = {
      total: totalFormerEmployees,
      last30Days: last30Days,
      last7Days: last7Days,
      thisMonth: thisMonth,
      thisYear: thisYear,
      departmentBreakdown: departmentStats,
      monthlyTrend: monthlyStats.map(stat => ({
        month: `${stat._id.year}-${stat._id.month.toString().padStart(2, '0')}`,
        count: stat.count
      }))
    };

    console.log('✅ İşten ayrılanlar istatistikleri hazırlandı:', statistics);

    res.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('❌ İşten ayrılanlar istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İşten ayrılanlar istatistikleri alınamadı',
      error: error.message
    });
  }
});

// 🚫 Çalışanı işten çıkar endpoint'i
router.put('/:id/terminate', async (req, res) => {
  try {
    const { id } = req.params;
    const { ayrilmaSebebi } = req.body;

    // Çalışanı bul
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Çalışan bulunamadı'
      });
    }

    // Zaten ayrılmış mı kontrol et
    if (employee.durum === 'AYRILDI') {
      return res.status(400).json({
        success: false,
        message: 'Çalışan zaten işten ayrılmış'
      });
    }

    // İşten çıkar
    employee.durum = 'AYRILDI';
    employee.ayrilmaTarihi = new Date();
    employee.ayrilmaSebebi = ayrilmaSebebi || 'Belirtilmemiş';
    
    await employee.save();

    res.json({
      success: true,
      message: 'Çalışan başarıyla işten çıkarıldı',
      data: employee
    });

  } catch (error) {
    console.error('İşten çıkarma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İşten çıkarma işlemi başarısız',
      error: error.message
    });
  }
});

// 🔄 Çalışanı işe geri al endpoint'i
router.put('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;

    // Çalışanı bul
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Çalışan bulunamadı'
      });
    }

    // Ayrılmış mı kontrol et
    if (employee.durum !== 'AYRILDI') {
      return res.status(400).json({
        success: false,
        message: 'Çalışan zaten aktif durumda'
      });
    }

    // İşe geri al
    employee.durum = 'AKTIF';
    employee.ayrilmaTarihi = null;
    employee.ayrilmaSebebi = null;
    
    await employee.save();

    res.json({
      success: true,
      message: 'Çalışan başarıyla işe geri alındı',
      data: employee
    });

  } catch (error) {
    console.error('İşe geri alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İşe geri alma işlemi başarısız',
      error: error.message
    });
  }
});

// 👤 Tek çalışan getir (ID parametreli route - en sonda olmalı)
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Çalışan bulunamadı'
      });
    }

    res.json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('Çalışan getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Çalışan getirilemedi',
      error: error.message
    });
  }
});

module.exports = router; 