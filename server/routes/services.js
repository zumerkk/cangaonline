const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const ServiceRoute = require('../models/ServiceRoute');
const ExcelJS = require('exceljs');

// Her request'i log'la
router.use((req, res, next) => {
  console.log(`🚌 Services API Request: ${req.method} ${req.url}`);
  console.log(`🔗 Request from: ${req.headers.origin || 'Unknown'}`);
  next();
});

// 🚌 Servis kullanan çalışanları getir
router.get('/', async (req, res) => {
  try {
    const { 
      routeName, 
      location, 
      page = 1, 
      limit = 50 
    } = req.query;

    // Filtre objesi oluştur
    const filter = {
      'serviceInfo.usesService': true,
      status: 'AKTIF'
    };

    if (routeName && routeName !== 'all') {
      filter['serviceInfo.routeName'] = routeName;
    }
    
    if (location && location !== 'all') {
      filter.location = location;
    }

    // Sayfalama hesaplamaları
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Servis kullanan çalışanları getir
    const employees = await Employee
      .find(filter)
      .sort({ 'serviceInfo.routeName': 1, firstName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Toplam sayı
    const total = await Employee.countDocuments(filter);

    res.json({
      success: true,
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Servis çalışanları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Servis çalışanları getirilemedi',
      error: error.message
    });
  }
});

// 📊 Sistem güzergahlarını getir (ServiceRoute modelinden)
router.get('/routes/system', async (req, res) => {
  try {
    const routes = await ServiceRoute.find({ status: 'AKTIF' })
      .sort({ routeName: 1 })
      .select('routeName routeCode stops status createdAt');

    res.json({
      success: true,
      data: routes,
      total: routes.length
    });

  } catch (error) {
    console.error('Sistem güzergahları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sistem güzergahları getirilemedi',
      error: error.message
    });
  }
});

// 🚏 Belirli güzergahın duraklarını getir
router.get('/routes/:routeName/stops', async (req, res) => {
  try {
    const { routeName } = req.params;
    
    const route = await ServiceRoute.findOne({ 
      routeName: routeName,
      status: 'AKTIF' 
    }).select('routeName stops');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Güzergah bulunamadı'
      });
    }

    // Durakları sıralı olarak döndür
    const sortedStops = route.stops
      .sort((a, b) => a.order - b.order)
      .map(stop => ({
        name: stop.name,
        order: stop.order
      }));

    res.json({
      success: true,
      data: {
        routeName: route.routeName,
        stops: sortedStops
      }
    });

  } catch (error) {
    console.error('Güzergah durakları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Güzergah durakları getirilemedi',
      error: error.message
    });
  }
});

// 📋 Tüm güzergah isimlerini basit liste olarak döndür (form için)
router.get('/routes/names', async (req, res) => {
  try {
    const routes = await ServiceRoute.find({ status: 'AKTIF' })
      .sort({ routeName: 1 })
      .select('routeName -_id');

    const routeNames = routes.map(route => route.routeName);

    res.json({
      success: true,
      data: routeNames
    });

  } catch (error) {
    console.error('Güzergah isimleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Güzergah isimleri getirilemedi',
      error: error.message
    });
  }
});

// 📊 Servis güzergahlarını getir (Employee verilerinden - çalışan bazlı)
router.get('/routes', async (req, res) => {
  console.log('🚌🚌🚌 ROUTES ENDPOINT HIT - COMPLETELY NEW! 🚌🚌🚌');
  
  try {
    console.log('🔍 Fetching all routes from ServiceRoute collection...');
    
    // Basit query - tüm kayıtları getir
    const allRoutes = await ServiceRoute.find().lean();
    console.log('📊 Total routes in database:', allRoutes.length);
    
    if (allRoutes.length === 0) {
      console.log('⚠️ No routes found in database!');
      return res.json({
        success: true,
        data: [],
        total: 0,
        message: 'Henüz güzergah eklenmemiş'
      });
    }
    
    console.log('📋 First route:', allRoutes[0].routeName);
    console.log('📋 Status values:', allRoutes.map(r => r.status));
    
    // AKTIF olanları filtrele
    const activeRoutes = allRoutes.filter(route => route.status === 'AKTIF');
    console.log('📊 Active routes:', activeRoutes.length);
    
    // Her güzergah için yolcu sayısını hesapla
    const routesWithPassengers = [];
    
    for (const route of activeRoutes) {
      console.log(`🔍 Processing route: ${route.routeName}`);
      
      try {
        // Bu güzergahı kullanan çalışan sayısını bul - sadece servisGuzergahi field'ını kullan
        const passengerCount = await Employee.countDocuments({
          servisGuzergahi: route.routeName,
          durum: 'AKTIF'
        });
        
        console.log(`👥 Route ${route.routeName} has ${passengerCount} passengers`);
        
        routesWithPassengers.push({
          ...route,
          passengerCount
        });
      } catch (err) {
        console.error(`❌ Error counting passengers for ${route.routeName}:`, err);
        routesWithPassengers.push({
          ...route,
          passengerCount: 0
        });
      }
    }
    
    console.log('✅ Final result:', routesWithPassengers.length, 'routes with passenger data');
    
    res.json({
      success: true,
      data: routesWithPassengers,
      total: routesWithPassengers.length,
      debug: {
        totalInDb: allRoutes.length,
        activeFiltered: activeRoutes.length,
        withPassengers: routesWithPassengers.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Routes endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Güzergahlar getirilemedi',
      error: error.message
    });
  }
});

// 🚏 Belirli güzergahın yolcularını getir
router.get('/routes/:routeId/passengers', async (req, res) => {
  try {
    const { routeId } = req.params;
    
    const route = await ServiceRoute.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Güzergah bulunamadı'
      });
    }

    const passengers = await Employee.find({
      servisGuzergahi: route.routeName,
      durum: 'AKTIF'
    })
    .select('fullName adSoyad department departman location lokasyon serviceInfo servisGuzergahi durak')
    .sort({ 'serviceInfo.orderNumber': 1, fullName: 1, adSoyad: 1 })
    .lean();

    const formattedPassengers = passengers.map(emp => ({
      _id: emp._id,
      fullName: emp.fullName || emp.adSoyad,
      department: emp.department || emp.departman,
      location: emp.location || emp.lokasyon,
      stopName: emp.serviceInfo?.stopName || emp.durak || 'Belirtilmemiş',
      orderNumber: emp.serviceInfo?.orderNumber || 0
    }));

    res.json({
      success: true,
      data: {
        route: route.routeName,
        passengers: formattedPassengers
      }
    });

  } catch (error) {
    console.error('Güzergah yolcuları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Güzergah yolcuları getirilemedi',
      error: error.message
    });
  }
});

// ➕ Güzergaha yolcu ekle
router.post('/routes/:routeId/passengers', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { employeeId, stopName } = req.body;

    // Güzergahı bul
    const route = await ServiceRoute.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Güzergah bulunamadı'
      });
    }

    // Çalışanı bul ve güncelle
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        'serviceInfo.usesService': true,
        'serviceInfo.routeName': route.routeName,
        'serviceInfo.stopName': stopName || 'FABRİKA'
      },
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
      message: 'Yolcu başarıyla eklendi',
      data: employee
    });

  } catch (error) {
    console.error('Yolcu ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yolcu eklenemedi',
      error: error.message
    });
  }
});

// ➖ Güzergahtan yolcu çıkar
router.delete('/routes/:routeId/passengers/:passengerId', async (req, res) => {
  try {
    const { passengerId } = req.params;

    // Çalışanı bul ve servis bilgilerini temizle
    const employee = await Employee.findByIdAndUpdate(
      passengerId,
      {
        'serviceInfo.usesService': false,
        'serviceInfo.routeName': null,
        'serviceInfo.stopName': null
      },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Yolcu bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Yolcu başarıyla çıkarıldı',
      data: employee
    });

  } catch (error) {
    console.error('Yolcu çıkarma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yolcu çıkarılamadı',
      error: error.message
    });
  }
});

// 👥 Mevcut çalışanları getir
router.get('/employees/available', async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {
      status: 'AKTIF',
      $or: [
        { 'serviceInfo.usesService': { $ne: true } },
        { 'serviceInfo.usesService': null }
      ]
    };

    if (search) {
      filter.$and = [
        { $or: filter.$or },
        { 
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { adSoyad: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete filter.$or;
    }

    const employees = await Employee.find(filter)
      .select('fullName adSoyad department departman location lokasyon')
      .sort({ fullName: 1, adSoyad: 1 })
      .limit(20)
      .lean();

    const formattedEmployees = employees.map(emp => ({
      _id: emp._id,
      fullName: emp.fullName || emp.adSoyad,
      department: emp.department || emp.departman,
      location: emp.location || emp.lokasyon
    }));

    res.json({
      success: true,
      data: formattedEmployees
    });

  } catch (error) {
    console.error('Mevcut çalışanları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Mevcut çalışanları getirilemedi',
      error: error.message
    });
  }
});

// 📋 Excel export (Excel formatında) - YENİDEN YAZILDI
router.get('/routes/:routeId/export-excel', async (req, res) => {
  try {
    const { routeId } = req.params;
    
    // Güzergahı bul
    const route = await ServiceRoute.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Güzergah bulunamadı'
      });
    }

    // Bu güzergahı kullanan çalışanları getir - hem eski hem yeni field'ları kontrol et
    const passengers = await Employee.find({
      $and: [
        {
          $or: [
            { status: 'AKTIF' },
            { durum: 'AKTIF' }
          ]
        },
        {
          $or: [
            // Yeni format
            {
              'serviceInfo.usesService': true,
              'serviceInfo.routeName': route.routeName
            },
            // Eski format (backward compatibility)
            {
              servisGuzergahi: route.routeName
            }
          ]
        }
      ]
    })
    .select('fullName adSoyad department departman serviceInfo servisGuzergahi durak cepTelefonu phone employeeId')
    .sort({ 'serviceInfo.orderNumber': 1, fullName: 1, adSoyad: 1 })
    .lean();

    console.log(`📋 Excel export için ${passengers.length} yolcu bulundu`);

    // Excel workbook oluştur - PROFESYONEl TASARIM
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Çanga Savunma Endüstrisi';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.company = 'Çanga Savunma Endüstrisi Ltd. Şti.';
    workbook.manager = 'Vardiya Yönetim Sistemi';
    
    // Worksheet adını kısalt (max 31 karakter)
    let worksheetName = route.routeName;
    if (worksheetName.length > 31) {
      worksheetName = worksheetName.substring(0, 28) + '...';
    }
    const worksheet = workbook.addWorksheet(worksheetName);

    // 📄 Sayfa ayarları
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToHeight: 1,
      fitToWidth: 1,
      margins: {
        left: 0.5, right: 0.5, top: 0.7, bottom: 0.7,
        header: 0.3, footer: 0.3
      },
      printTitlesRow: '1:1',
      showGridLines: false
    };

    // 📊 Excel güvenlik ayarları
    worksheet.protect('CangaYolcuListesi2025', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false
    });

    let currentRow = 1;

    // 🏢 HEADER - Kurumsal Logo ve Bilgiler
    worksheet.mergeCells(`A${currentRow}:E${currentRow + 1}`);
    const headerCell = worksheet.getCell(`A${currentRow}`);
    headerCell.value = '🏢 ÇANGA SAVUNMA ENDÜSTRİSİ LTD.ŞTİ.';
    headerCell.font = { 
      name: 'Calibri', 
      size: 18, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    headerCell.fill = { 
      type: 'gradient',
      gradient: 'angle',
      degree: 0,
      stops: [
        { position: 0, color: { argb: 'FF1976D2' } },
        { position: 1, color: { argb: 'FF42A5F5' } }
      ]
    };
    headerCell.border = {
      top: { style: 'thick', color: { argb: 'FF1976D2' } },
      left: { style: 'thick', color: { argb: 'FF1976D2' } },
      bottom: { style: 'thick', color: { argb: 'FF1976D2' } },
      right: { style: 'thick', color: { argb: 'FF1976D2' } }
    };
    worksheet.getRow(currentRow).height = 40;
    currentRow += 2;

    // 🚌 Güzergah başlığı
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    const routeHeaderCell = worksheet.getCell(`A${currentRow}`);
    routeHeaderCell.value = `🚌 ${route.routeName.toUpperCase()}`;
    routeHeaderCell.font = { 
      name: 'Calibri', 
      size: 14, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    routeHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    routeHeaderCell.fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'FF4CAF50' } 
    };
    routeHeaderCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
    worksheet.getRow(currentRow).height = 25;
    currentRow++;

    // 📅 Tarih ve bilgi satırı
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    const dateCell = worksheet.getCell(`A${currentRow}`);
    dateCell.value = `📅 Tarih: ${new Date().toLocaleDateString('tr-TR')} | 👥 Toplam Yolcu: ${passengers.length}`;
    dateCell.font = { 
      name: 'Calibri', 
      size: 11, 
      bold: true,
      color: { argb: 'FF666666' }
    };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    dateCell.fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'FFF5F5F5' } 
    };
    currentRow++;

    // Boş satır
    currentRow++;

    // 🚏 DURAKLAR BÖLÜMü
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    const stopsHeaderCell = worksheet.getCell(`A${currentRow}`);
    stopsHeaderCell.value = '🚏 GÜZERGAH DURAKLARI';
    stopsHeaderCell.font = { 
      name: 'Calibri', 
      size: 12, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    stopsHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    stopsHeaderCell.fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'FFFF9800' } 
    };
    stopsHeaderCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
    currentRow++;

    // Durakları listele - 2 sütunlu layout
    const stopsPerRow = 2;
    for (let i = 0; i < route.stops.length; i += stopsPerRow) {
      const leftStop = route.stops[i];
      const rightStop = route.stops[i + 1];
      
      // Sol durak
      const leftCell = worksheet.getCell(`A${currentRow}`);
      leftCell.value = `${i + 1}. ${leftStop.name}`;
      leftCell.font = { name: 'Calibri', size: 10 };
      leftCell.alignment = { horizontal: 'left', vertical: 'middle' };
      leftCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Sağ durak (varsa)
      if (rightStop) {
        const rightCell = worksheet.getCell(`C${currentRow}`);
        rightCell.value = `${i + 2}. ${rightStop.name}`;
        rightCell.font = { name: 'Calibri', size: 10 };
        rightCell.alignment = { horizontal: 'left', vertical: 'middle' };
        rightCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
      
      currentRow++;
    }

    // Boş satırlar
    currentRow += 2;

    // 👥 YOLCU LİSTESİ BAŞLIĞI
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    const passengersHeaderCell = worksheet.getCell(`A${currentRow}`);
    passengersHeaderCell.value = `👥 YOLCU LİSTESİ (${passengers.length} KİŞİ)`;
    passengersHeaderCell.font = { 
      name: 'Calibri', 
      size: 12, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    passengersHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    passengersHeaderCell.fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'FF2196F3' } 
    };
    passengersHeaderCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
    worksheet.getRow(currentRow).height = 25;
    currentRow++;

    // Tablo başlıkları - Profesyonel
    const headers = ['#', 'AD SOYAD', 'DEPARTMAN', 'DURAK', 'TELEFON'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.font = { 
        name: 'Calibri', 
        size: 11, 
        bold: true, 
        color: { argb: 'FFFFFFFF' } 
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'FF424242' } 
      };
      cell.border = {
        top: { style: 'medium' },
        left: { style: 'medium' },
        bottom: { style: 'medium' },
        right: { style: 'medium' }
      };
    });
    worksheet.getRow(currentRow).height = 20;
    currentRow++;

    // Yolcu verilerini ekle - Renkli ve profesyonel
    passengers.forEach((passenger, index) => {
      const rowData = [
        index + 1,
        passenger.adSoyad || `${passenger.fullName || ''}`.trim(),
        passenger.departman || passenger.department || '',
        passenger.durak || passenger.serviceInfo?.stopName || '',
        passenger.cepTelefonu || passenger.phone || ''
      ];

      rowData.forEach((data, colIndex) => {
        const cell = worksheet.getCell(currentRow, colIndex + 1);
        cell.value = data;
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = { 
          horizontal: colIndex === 0 ? 'center' : 'left', 
          vertical: 'middle' 
        };
        
        // Departman bazlı renklendirme
        const department = passenger.departman || passenger.department || '';
        let bgColor = 'FFFFFFFF'; // Varsayılan beyaz
        
        if (department.includes('MERKEZ FABRİKA')) {
          bgColor = index % 2 === 0 ? 'FFE3F2FD' : 'FFF3F8FF';
        } else if (department.includes('İŞL FABRİKA')) {
          bgColor = index % 2 === 0 ? 'FFF3E5F5' : 'FFFAF7FA';
        } else if (department.includes('TEKNİK')) {
          bgColor = index % 2 === 0 ? 'FFE8F5E8' : 'FFF1F8F1';
        } else if (department.includes('İDARİ')) {
          bgColor = index % 2 === 0 ? 'FFFFF3E0' : 'FFFFFAF5';
        } else {
          bgColor = index % 2 === 0 ? 'FFFAFAFA' : 'FFFFFFFF';
        }
        
        cell.fill = { 
          type: 'pattern', 
          pattern: 'solid', 
          fgColor: { argb: bgColor } 
        };
        
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };

        // Telefon numarası formatı
        if (colIndex === 4 && data) {
          cell.numFmt = '0" "000" "000" "00" "00';
        }
      });
      
      worksheet.getRow(currentRow).height = 20;
      currentRow++;
    });

    // Boş satır
    currentRow++;

    // 📊 FOOTER - İstatistikler
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    const footerCell = worksheet.getCell(`A${currentRow}`);
    footerCell.value = `📊 Rapor Özeti: ${passengers.length} yolcu • ${route.stops.length} durak • Oluşturma: ${new Date().toLocaleString('tr-TR')} • Çanga Vardiya Sistemi v2.0`;
    footerCell.font = { 
      name: 'Calibri', 
      size: 9, 
      italic: true,
      color: { argb: 'FF666666' }
    };
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    footerCell.fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'FFF8F9FA' } 
    };
    footerCell.border = {
      top: { style: 'medium', color: { argb: 'FFE0E0E0' } },
      left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
    };

    // Sütun genişliklerini ayarla
    worksheet.columns = [
      { width: 6 },   // #
      { width: 25 },  // AD SOYAD
      { width: 20 },  // DEPARTMAN
      { width: 25 },  // DURAK
      { width: 15 }   // TELEFON
    ];

    // Dosyayı buffer olarak al
    const buffer = await workbook.xlsx.writeBuffer();

    // Response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Güzergah adındaki özel karakterleri temizle ve güzel dosya adı oluştur
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('tr-TR').replace(/\./g, '-');
    const timeStr = currentDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '');
    
    const safeRouteName = route.routeName
      .replace(/[^\w\s-]/g, '') // Özel karakterleri kaldır
      .replace(/\s+/g, '_')     // Boşlukları _ ile değiştir
      .replace(/-+/g, '-')      // Çoklu - işaretlerini tek - yap
      .substring(0, 20);        // Max 20 karakter
    
    const safeFileName = `Canga_${safeRouteName}_${passengers.length}Yolcu_${dateStr}_${timeStr}.xlsx`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Excel dosyasını gönder
    res.send(buffer);
    
    console.log(`✅ Excel export tamamlandı: ${passengers.length} yolcu, ${route.stops.length} durak`);
    
  } catch (error) {
    console.error('❌ Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel dosyası oluşturulamadı',
      error: error.message
    });
  }
});

// 📊 İstatistikler endpoint'i
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Stats endpoint hit');
    
    // Toplam servis kullanan çalışan sayısı - hem eski hem yeni field'ları kontrol et
    const totalServiceUsers = await Employee.countDocuments({
      $and: [
        {
          $or: [
            { status: 'AKTIF' },
            { durum: 'AKTIF' }
          ]
        },
        {
          $or: [
            // Yeni format
            { 'serviceInfo.usesService': true },
            // Eski format (backward compatibility)
            { servisGuzergahi: { $exists: true, $ne: '', $ne: null } }
          ]
        }
      ]
    });
    
    // Toplam güzergah sayısı
    const totalRoutes = await ServiceRoute.countDocuments({ status: 'AKTIF' });
    
    // Toplam durak sayısı
    const routes = await ServiceRoute.find({ status: 'AKTIF' });
    const totalStops = routes.reduce((sum, route) => sum + (route.stops?.length || 0), 0);
    
    // Aktif güzergah sayısı
    const activeRoutes = await ServiceRoute.countDocuments({ status: 'AKTIF' });
    
    const stats = {
      totalServiceUsers,
      totalRoutes,
      totalStops,
      activeRoutes,
      lastUpdated: new Date()
    };
    
    console.log('📊 Stats calculated:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('📊 Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı',
      error: error.message
    });
  }
});

// ✏️ Güzergah güncelle
router.put('/routes/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { routeName, routeCode, color, status, stops } = req.body;

    // Güzergahı bul ve güncelle
    const updatedRoute = await ServiceRoute.findByIdAndUpdate(
      routeId,
      {
        routeName: routeName?.trim(),
        routeCode: routeCode?.trim(),
        color: color || '#1976d2',
        status: status || 'AKTIF',
        stops: stops || [],
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedRoute) {
      return res.status(404).json({
        success: false,
        message: 'Güzergah bulunamadı'
      });
    }

    console.log(`✅ Güzergah güncellendi: ${updatedRoute.routeName}`);

    res.json({
      success: true,
      message: 'Güzergah başarıyla güncellendi',
      data: updatedRoute
    });

  } catch (error) {
    console.error('❌ Güzergah güncelleme hatası:', error);
    res.status(400).json({
      success: false,
      message: 'Güzergah güncellenemedi',
      error: error.message
    });
  }
});

// ✏️ Çalışan servis bilgilerini güncelle
router.put('/:employeeId/service', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { routeName, stopName, usesService } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        'serviceInfo.routeName': routeName,
        'serviceInfo.stopName': stopName,
        'serviceInfo.usesService': usesService
      },
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
      message: 'Servis bilgileri başarıyla güncellendi',
      data: employee
    });

  } catch (error) {
    console.error('Servis bilgisi güncelleme hatası:', error);
    res.status(400).json({
      success: false,
      message: 'Servis bilgileri güncellenemedi',
      error: error.message
    });
  }
});

// 🔍 DEBUG endpoint
router.get('/debug', async (req, res) => {
  try {
    console.log('🔍 DEBUG endpoint hit');
    
    const totalCount = await ServiceRoute.countDocuments();
    const activeCount = await ServiceRoute.countDocuments({ status: 'AKTIF' });
    const sampleRoutes = await ServiceRoute.find().limit(3).lean();
    const totalEmployees = await Employee.countDocuments();
    
    console.log('📊 Debug info:', { totalCount, activeCount, totalEmployees });
    
    res.json({
      success: true,
      debug: {
        totalServiceRoutes: totalCount,
        activeServiceRoutes: activeCount,
        sampleRoutes: sampleRoutes,
        totalEmployees: totalEmployees
      }
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔍 DEBUG endpoint - database bağlantısı ve veri kontrolü
router.get('/debug-full', async (req, res) => {
  try {
    console.log('🔍 DEBUG FULL endpoint hit');
    
    // MongoDB bağlantı durumu
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    console.log('📡 MongoDB connection state:', connectionState); // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    
    // ServiceRoute model test
    console.log('🔗 ServiceRoute model exists:', !!ServiceRoute);
    
    // Raw query test
    const rawQuery = await ServiceRoute.find().lean().exec();
    console.log('📊 Raw query result count:', rawQuery.length);
    
    if (rawQuery.length > 0) {
      console.log('📋 First raw route:', JSON.stringify(rawQuery[0], null, 2));
    }
    
    // Collection'ı direkt kontrol et
    const collection = mongoose.connection.db.collection('serviceroutes');
    const directCount = await collection.countDocuments();
    console.log('📊 Direct collection count:', directCount);
    
    const directDocs = await collection.find().limit(1).toArray();
    console.log('📋 Direct collection sample:', JSON.stringify(directDocs[0], null, 2));
    
    res.json({
      success: true,
      debug: {
        connectionState,
        modelExists: !!ServiceRoute,
        rawQueryCount: rawQuery.length,
        directCollectionCount: directCount,
        sampleRawRoute: rawQuery[0] || null,
        sampleDirectRoute: directDocs[0] || null,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Debug full error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// 🔥 TEST endpoint - basit test
router.get('/test', (req, res) => {
  console.log('🔥 TEST ENDPOINT HIT!');
  res.json({
    success: true,
    message: 'Services test endpoint working!',
    timestamp: new Date().toISOString()
  });
});

// 📊 Test güzergahları (gerçek yolcu sayıları ile)
router.get('/routes/test', async (req, res) => {
  try {
    console.log('🧪 TEST ROUTES ENDPOINT - Gerçek yolcu sayıları ile...');
    
    // 🚌 5 AKTİF SERVİS GÜZERGAHI - Excel dosyalarından alınan gerçek yolcu sayıları
    const testRoutes = [
      {
        _id: '507f1f77bcf86cd799439011',
        routeName: 'DISPANSER SERVİS GÜZERGAHI',
        routeCode: 'DSG-01',
        color: '#2196F3',
        status: 'AKTIF',
        passengerCount: 14,
        stops: [
          { name: 'ŞADIRVAN (PERŞEMBE PAZARI)', order: 1 },
          { name: 'NOKTA A-101/DOKTAŞ', order: 2 },
          { name: 'DISPANSER ÜST GEÇİT', order: 3 },
          { name: 'GÜL PASTANESİ', order: 4 }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: '507f1f77bcf86cd799439012',
        routeName: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI',
        routeCode: 'SMG-02',
        color: '#4CAF50',
        status: 'AKTIF',
        passengerCount: 16,
        stops: [
          { name: 'RASATTEPE KÖPRÜ', order: 1 },
          { name: 'ÇORBACI ALI DAYI', order: 2 },
          { name: 'NOKTA A-101', order: 3 },
          { name: 'AYTEMİZ PETROL', order: 4 },
          { name: 'MEZARLIK PEYZAJ ÖNÜ', order: 5 }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: '507f1f77bcf86cd799439013',
        routeName: 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI',
        routeCode: 'OKM-03',
        color: '#FF9800',
        status: 'AKTIF',
        passengerCount: 18,
        stops: [
          { name: 'BAHÇELİEVLER ESKİ TERMİNAL GİRİŞİ', order: 1 },
          { name: 'AYBIMAŞ', order: 2 },
          { name: 'BAHÇELİEVLER SAĞLIK OCAĞI', order: 3 },
          { name: 'SALI PAZARI', order: 4 },
          { name: 'KAHVELER (KARŞIYAKA)', order: 5 }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: '507f1f77bcf86cd799439014',
        routeName: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
        routeCode: 'CMG-04',
        color: '#F44336',
        status: 'AKTIF',
        passengerCount: 17,
        stops: [
          { name: 'ÇOCUK ŞUBE (ESKİ BÖLGE TRAFİK) ALTI NAR MARKET', order: 1 },
          { name: 'TAÇ MAHAL DÜĞÜN SALONU', order: 2 },
          { name: 'SÜMEZE PİDE', order: 3 },
          { name: 'SAAT KULESİ', order: 4 },
          { name: 'FIRINLI CAMİ', order: 5 }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: '507f1f77bcf86cd799439015',
        routeName: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
        routeCode: 'CMG-05',
        color: '#9C27B0',
        status: 'AKTIF',
        passengerCount: 19,
        stops: [
          { name: 'S-OIL BENZİNLİK', order: 1 },
          { name: 'BAŞPINAR', order: 2 },
          { name: 'TOPRAK YEMEK', order: 3 },
          { name: 'HALI SAHA', order: 4 },
          { name: 'ESKİ REKTÖRLÜK', order: 5 }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    console.log('✅ Test güzergahları hazırlandı:', testRoutes.length);
    
    res.json({
      success: true,
      data: testRoutes,
      total: testRoutes.length,
      message: 'Test verileri - gerçek yolcu sayıları ile',
      debug: {
        isTestData: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Test routes endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test güzergahları getirilemedi',
      error: error.message
    });
  }
});

// 🧪 Test güzergahı yolcuları
router.get('/routes/test/:routeId/passengers', async (req, res) => {
  try {
    const { routeId } = req.params;
    
    console.log('🧪 TEST PASSENGERS ENDPOINT için routeId:', routeId);
    
    // Excel dosyalarındaki test yolcu verileri
    const testPassengersData = {
      '507f1f77bcf86cd799439011': [ // DISPANSER SERVIS GÜZERGAHI
        { name: 'ALI GÜRBÜZ', department: 'DISPANSER', location: 'MERKEZ', stopName: 'ŞADIRVAN (PERŞEMBE PAZARI)', orderNumber: 1 },
        { name: 'ALI SAVAŞ', department: 'DISPANSER', location: 'MERKEZ', stopName: 'NOKTA A-101/DOKTAŞ', orderNumber: 2 },
        { name: 'BERAT ÖZDEN', department: 'DISPANSER', location: 'MERKEZ', stopName: 'DISPANSER ÜST GEÇİT', orderNumber: 3 },
        { name: 'CEVCET ÖKSÜZ', department: 'DISPANSER', location: 'MERKEZ', stopName: 'DISPANSER ÜST GEÇİT', orderNumber: 4 },
        { name: 'ERDAL YAKUT', department: 'DISPANSER', location: 'MERKEZ', stopName: 'GÜL PASTANESİ', orderNumber: 5 },
        { name: 'EYÜP TORUN', department: 'DISPANSER', location: 'MERKEZ', stopName: 'DISPANSER ÜST GEÇİT', orderNumber: 6 },
        { name: 'İBRAHİM VARLIOĞLU', department: 'DISPANSER', location: 'MERKEZ', stopName: 'DISPANSER ÜST GEÇİT', orderNumber: 7 },
        { name: 'MUHAMMED SEFA PEHLİVANLI', department: 'DISPANSER', location: 'MERKEZ', stopName: 'DISPANSER ÜST GEÇİT', orderNumber: 8 },
        { name: 'MURAT ÇAVDAR', department: 'DISPANSER', location: 'MERKEZ', stopName: 'ŞADIRVAN (PERŞEMBE PAZARI)', orderNumber: 9 },
        { name: 'MUSTAFA BIYIK', department: 'DISPANSER', location: 'MERKEZ', stopName: 'DISPANSER ÜST GEÇİT', orderNumber: 10 },
        { name: 'ÖZKAN AYDIN', department: 'DISPANSER', location: 'MERKEZ', stopName: 'DISPANSER ÜST GEÇİT', orderNumber: 11 },
        { name: 'CELAL GÜLŞEN', department: 'DISPANSER', location: 'MERKEZ', stopName: 'DISPANSER ÜST GEÇİT', orderNumber: 12 },
        { name: 'MUHAMMED NAZİM GÖÇ', department: 'DISPANSER', location: 'MERKEZ', stopName: 'DISPANSER ÜST GEÇİT', orderNumber: 13 },
        { name: 'TUNCAY TEKİN', department: 'DISPANSER', location: 'MERKEZ', stopName: 'DISPANSER ÜST GEÇİT', orderNumber: 14 }
      ],
      '507f1f77bcf86cd799439012': [ // SANAYI MAHALLESİ SERVIS GÜZERGAHI
        { name: 'ALI ŞIH YORULMAZ', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'ÇORBACI ALI DAYI', orderNumber: 1 },
        { name: 'AHMET DURAN TUNA', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'NOKTA A-101/DOKTAŞ', orderNumber: 2 },
        { name: 'FATİH BALOĞLU', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'ÇORBACI ALI DAYI', orderNumber: 3 },
        { name: 'HAKKİ YÜCEL', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'ÇORBACI ALI DAYI', orderNumber: 4 },
        { name: 'HAYATİ SÖZDİNLER', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'ÇORBACI ALI DAYI', orderNumber: 5 },
        { name: 'HAYDAR ACAR', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'RASATTEPE KÖPRÜ', orderNumber: 6 },
        { name: 'GÜLNUR AĞIRMAN', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'AYTEMİZ PETROL', orderNumber: 7 },
        { name: 'İSMET BAŞER', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'AYTEMİZ PETROL', orderNumber: 8 },
        { name: 'KEMALETTİN GÜLEŞEN', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'RASATTEPE KÖPRÜ', orderNumber: 9 },
        { name: 'MACİT USLU', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'ÇORBACI ALI DAYI', orderNumber: 10 },
        { name: 'MUSTAFA SÜMER', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'RASATTEPE KÖPRÜ', orderNumber: 11 },
        { name: 'NİVAZI YURTSEVEN', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'NOKTA A-101', orderNumber: 12 },
        { name: 'BERAT AKTAŞ', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'NOKTA A-101', orderNumber: 13 },
        { name: 'NURİ ÖZKAN', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'ÇORBACI ALI DAYI', orderNumber: 14 },
        { name: 'MUSTAFA BAŞKAYA', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'ÇORBACI ALI DAYI', orderNumber: 15 },
        { name: 'MUZAFFER KIZILÇIÇEK', department: 'SANAYI MAHALLESİ', location: 'İŞL', stopName: 'MEZARLIK PEYZAJ ÖNÜ', orderNumber: 16 }
      ],
      '507f1f77bcf86cd799439013': [ // OSMANGAZI-KARŞIYAKA MAHALLESİ
        { name: 'ASIM DEMET', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'SALI PAZARI', orderNumber: 1 },
        { name: 'İLYAS CURTAY', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'KAHVELER (KARŞIYAKA)', orderNumber: 2 },
        { name: 'POLAT ERCAN', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'KAHVELER (KARŞIYAKA)', orderNumber: 3 },
        { name: 'EMRE DEMİRCİ', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'KEL MUSTAFA DURAGII', orderNumber: 4 },
        { name: 'MUSTAFA SAMURKOLLU', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'ERDURAN BAKKAL (KARŞIYAKA)', orderNumber: 5 },
        { name: 'SEFA ÖZTÜRK', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'BAHÇELİEVLER', orderNumber: 6 },
        { name: 'SALİH GÖZÜAK', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'KAHVELER (KARŞIYAKA)', orderNumber: 7 },
        { name: 'SELİM ALSAÇ', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'SALI PAZARI', orderNumber: 8 },
        { name: 'ÜMİT SAZAK', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'KAHVELER (KARŞIYAKA)', orderNumber: 9 },
        { name: 'ÜMİT TORUN', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'KAHVELER (KARŞIYAKA)', orderNumber: 10 },
        { name: 'KEMAL KARACA', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'BAHÇELİEVLER', orderNumber: 11 },
        { name: 'YAŞAR ÇETİN', department: 'OSMANGAZI-KARŞIYAKA', location: 'OSB', stopName: 'BAHÇELİEVLER SAĞLIK OCAĞI', orderNumber: 12 }
      ],
      '507f1f77bcf86cd799439014': [ // ÇALILIÖZ MAHALLESİ
        { name: 'AHMET CANGA', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'NOKTA A-101/DOKTAŞ', orderNumber: 1 },
        { name: 'AHMET ŞAHİN', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'SAAT KULESİ', orderNumber: 2 },
        { name: 'ALI ÇAVUŞ BAŞTUĞ', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'FIRINLI CAMİ', orderNumber: 3 },
        { name: 'ALİ ÖKSÜZ', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'SAAT KULESİ', orderNumber: 4 },
        { name: 'AYNUR AYTEKİN', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'ÇALLIOĞZ KÖPRÜ (ALT YOL)', orderNumber: 5 },
        { name: 'CELAL BARAN', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'ÇALLIOĞZ KÖPRÜ (ALT YOL)', orderNumber: 6 },
        { name: 'LEVENT DURMAZ', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'ÇALLIOĞZ KÖPRÜ (ALT YOL)', orderNumber: 7 },
        { name: 'METİN ARSLAN', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'NAR MARKET', orderNumber: 8 },
        { name: 'MUSA DOĞU', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'FIRINLI CAMİ', orderNumber: 9 },
        { name: 'ÖMER FİLİZ', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'SAAT KULESİ', orderNumber: 10 },
        { name: 'SADULLAH AKBAYIR', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'SAAT KULESİ', orderNumber: 11 },
        { name: 'UĞUR ALBAYRAK', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'SAAT KULESİ', orderNumber: 12 },
        { name: 'BERAT SUSAR', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'VALILIK', orderNumber: 13 },
        { name: 'HULUSİ EREN CAN', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'VALILIK ARKASI', orderNumber: 14 },
        { name: 'İBRAHİM ÜÇER', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'ES BENZİNLİK', orderNumber: 15 },
        { name: 'SONER ÇETİN GÜRSOY', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'VALILIK ARKASI', orderNumber: 16 },
        { name: 'MEHMET ALİ ÖZÇELİK', department: 'ÇALILIÖZ MAHALLESİ', location: 'MERKEZ', stopName: 'SAAT KULESİ', orderNumber: 17 }
      ],
      '507f1f77bcf86cd799439015': [ // ÇARŞI MERKEZ
        { name: 'AHMET ÇELİK', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'S-OIL BENZİNLİK', orderNumber: 1 },
        { name: 'BİRKAN ŞEKER', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'S-OIL BENZİNLİK', orderNumber: 2 },
        { name: 'HİLMİ SORGUN', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'S-OIL BENZİNLİK', orderNumber: 3 },
        { name: 'EMİR KAAN BAŞER', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'BAŞPINAR', orderNumber: 4 },
        { name: 'MERT SÜNBÜL', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'TOPRAK YEMEK', orderNumber: 5 },
        { name: 'MESUT TUNÇER', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'HALI SAHA', orderNumber: 6 },
        { name: 'ALPEREN TOZLU', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'HALI SAHA', orderNumber: 7 },
        { name: 'VEYSEL EMRE TOZLU', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'HALI SAHA', orderNumber: 8 },
        { name: 'HAKAN AKPINAR', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'HALI SAHA', orderNumber: 9 },
        { name: 'MUHAMMED ZÜMER KEKİLLİOĞLU', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'HALI SAHA', orderNumber: 10 },
        { name: 'MİNE KARAOĞLU', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'ESKİ REKTÖRLÜK', orderNumber: 11 },
        { name: 'FURKAN KADİR EDEN', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'REKTÖRLÜK', orderNumber: 12 },
        { name: 'YUSUF GÜRBÜZ', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'ES BENZİNLİK', orderNumber: 13 },
        { name: 'MEHMET EKTAŞ', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'ESKİ REKTÖRLÜK', orderNumber: 14 },
        { name: 'HÜDAGÜL DEĞİRMENCİ', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'ESKİ REKTÖRLÜK', orderNumber: 15 },
        { name: 'YASİN SAYGILI', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'ESKİ REKTÖRLÜK/ GÜNDOĞDU OSMANGAZİ', orderNumber: 16 },
        { name: 'ÇAĞRI YILDIZ', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'BAĞDAT KÖPRÜ', orderNumber: 17 },
        { name: 'CEMAL ERAKSOY', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'YENİ MAHALLE GO BENZİNLİK', orderNumber: 18 },
        { name: 'AZİZ BUĞRA KARA', department: 'ÇARŞI MERKEZ', location: 'MERKEZ', stopName: 'BAĞDAT KÖPRÜ VE ÜZERİ', orderNumber: 19 }
      ]
    };

    const passengers = testPassengersData[routeId] || [];
    
    // Güzergah adını bul
    const routeNames = {
      '507f1f77bcf86cd799439011': 'DISPANSER SERVİS GÜZERGAHI',
      '507f1f77bcf86cd799439012': 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI',
      '507f1f77bcf86cd799439013': 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI',
      '507f1f77bcf86cd799439014': 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
      '507f1f77bcf86cd799439015': 'ÇARŞI MERKEZ SERVİS GÜZERGAHI'
    };

    const formattedPassengers = passengers.map(passenger => ({
      _id: `test_${passenger.name.replace(/\s+/g, '_')}`,
      fullName: passenger.name,
      department: passenger.department,
      location: passenger.location,
      stopName: passenger.stopName,
      orderNumber: passenger.orderNumber
    }));

    res.json({
      success: true,
      data: {
        route: routeNames[routeId] || 'Bilinmeyen Güzergah',
        passengers: formattedPassengers
      },
      message: 'Test yolcu verileri - Excel dosyalarından alınmış'
    });

  } catch (error) {
    console.error('Test yolcu verileri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Test yolcu verileri getirilemedi',
      error: error.message
    });
  }
});

module.exports = router; 