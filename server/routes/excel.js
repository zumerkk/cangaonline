const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const Employee = require('../models/Employee');
const Shift = require('../models/Shift');
const ServiceRoute = require('../models/ServiceRoute');

// 🍽️ Yemek molası hesaplama fonksiyonu - EXCEL İÇİN
const calculateWorkingHours = (timeSlot) => {
  if (!timeSlot || typeof timeSlot !== 'string') return 8; // Varsayılan 8 saat
  
  // Saat aralığından başlangıç ve bitiş saatlerini çıkar
  const [startTime, endTime] = timeSlot.split('-');
  if (!startTime || !endTime) return 8;
  
  // Saat:dakika formatını parse et
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes || 0) / 60;
  };
  
  const startHour = parseTime(startTime);
  let endHour = parseTime(endTime);
  
  // Gece vardiyası için (24:00 veya 00:00 geçen saatler)
  if (endHour <= startHour) {
    endHour += 24;
  }
  
  // Brüt çalışma saati
  const grossHours = endHour - startHour;
  
  // 🍽️ Yemek molası hesaplama kuralları
  // 08:00-18:00 (10 saat) -> 1 saat yemek molası düş = 9 saat
  // Diğer tüm vardiyalar -> 30 dk (0.5 saat) yemek molası düş
  if (timeSlot === '08:00-18:00') {
    return grossHours - 1; // 10 - 1 = 9 saat
  } else {
    // Diğer tüm vardiyalar için 30 dk düş
    return grossHours - 0.5; // Örnek: 8 - 0.5 = 7.5 saat
  }
};

// YENİ: Frontend'ten gelen yolcu listesini Excel'e export et (116 yolcu için)
router.post('/passengers/export', async (req, res) => {
  try {
    console.log('📊 Yolcu listesi Excel export başlatıldı (POST method)');
    
    const { passengers, totalCount, exportDate, exportedBy } = req.body;
    
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Yolcu listesi boş veya geçersiz'
      });
    }
    
    console.log(`📋 İşlenecek yolcu sayısı: ${passengers.length}`);
    console.log(`📊 Toplam kayıt: ${totalCount}`);

    // Excel dosyası oluştur - PROFESYONELCasını
    const exportWorkbook = new ExcelJS.Workbook();
    
    // Workbook metadata
    exportWorkbook.creator = 'Canga Vardiya Sistemi';
    exportWorkbook.lastModifiedBy = exportedBy || 'Sistem';
    exportWorkbook.created = new Date();
    exportWorkbook.modified = new Date();
    
    const exportWorksheet = exportWorkbook.addWorksheet('Yolcu Listesi');

    // Excel başlık bölümü - ŞIRKET LOGOLU VE PROFESYONEl
    let currentRow = 1;
    
    // Ana başlık
    exportWorksheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const mainTitle = exportWorksheet.getCell(`A${currentRow}`);
    mainTitle.value = '🚌 ÇANGA SAVUNMA ENDÜSTRİSİ LTD.ŞTİ.';
    mainTitle.font = { size: 18, bold: true, color: { argb: 'FF1976D2' } };
    mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    mainTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
    exportWorksheet.getRow(currentRow).height = 30;
    currentRow++;
    
    // Alt başlık
    exportWorksheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const subTitle = exportWorksheet.getCell(`A${currentRow}`);
    subTitle.value = 'SERVİS YOLCU LİSTESİ YÖNETİM SİSTEMİ';
    subTitle.font = { size: 14, bold: true, color: { argb: 'FF424242' } };
    subTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    subTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    exportWorksheet.getRow(currentRow).height = 25;
    currentRow++;
    
    // Bilgi satırı
    exportWorksheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const infoRow = exportWorksheet.getCell(`A${currentRow}`);
    const exportDateStr = new Date(exportDate).toLocaleDateString('tr-TR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
    infoRow.value = `📅 Export Tarihi: ${exportDateStr} | 👥 Toplam Yolcu: ${totalCount} | 📍 Aktif Güzergahlar: 6`;
    infoRow.font = { size: 10, color: { argb: 'FF666666' } };
    infoRow.alignment = { horizontal: 'center', vertical: 'middle' };
    exportWorksheet.getRow(currentRow).height = 20;
    currentRow += 2; // Boş satır bırak

    // Tablo başlık satırı - PROFESYONEl RENKLER
    const headerRow = exportWorksheet.addRow([
      'Sıra',
      'Ad Soyad', 
      'Departman',
      'Pozisyon',
      'Vardiya',
      'Güzergah',
      'Durak',
      'Adres',
      'Telefon',
      'Acil Durum Tel.',
      'Notlar'
    ]);

    // Header stilini ayarla - PROFESYONEL
    headerRow.eachCell((cell, index) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1976D2' } // Koyu mavi arka plan
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF424242' } },
        left: { style: 'thin', color: { argb: 'FF424242' } },
        bottom: { style: 'medium', color: { argb: 'FF424242' } },
        right: { style: 'thin', color: { argb: 'FF424242' } }
      };
    });
    exportWorksheet.getRow(currentRow + 1).height = 25;

    // Yolcu verilerini ekle - GÜZERGAH BAZLI SIRALAMA VE RENKLENDIRME
    let rowIndex = 1;
    
    // Güzergahlara göre grupla
    const groupedByRoute = passengers.reduce((acc, passenger) => {
      const route = passenger.route || 'DİĞER';
      if (!acc[route]) acc[route] = [];
      acc[route].push(passenger);
      return acc;
    }, {});
    
    // Güzergah bazlı renklendirme
    const routeColors = {
      'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI': 'FFE8F5E8',    // Açık yeşil
      'ÇARŞI MERKEZ SERVİS GÜZERGAHI': 'FFE3F2FD',          // Açık mavi
      'OSMANGAZI-KARŞIYAKA MAHALLESİ': 'FFFFF3E0',          // Açık turuncu
      'SANAYİ MAHALLESİ SERVİS GÜZERGAHI': 'FFF3E5F5',      // Açık mor
      'DİSPANSER SERVİS GÜZERGAHI': 'FFFCE4EC',             // Açık pembe
      'KENDİ ARACI': 'FFEFEBE9',                            // Açık kahverengi
      'DİĞER': 'FFF5F5F5'                                   // Açık gri
    };
    
    // Güzergah sırasına göre listele
    const routeOrder = [
      'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
      'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
      'OSMANGAZI-KARŞIYAKA MAHALLESİ',
      'SANAYİ MAHALLESİ SERVİS GÜZERGAHI',
      'DİSPANSER SERVİS GÜZERGAHI',
      'KENDİ ARACI',
      'DİĞER'
    ];
    
    routeOrder.forEach(routeName => {
      const routePassengers = groupedByRoute[routeName];
      if (!routePassengers || routePassengers.length === 0) return;
      
      // Güzergah başlığı ekle
      const routeHeaderRow = exportWorksheet.addRow([
        '', `🚌 ${routeName} (${routePassengers.length} kişi)`, '', '', '', '', '', '', '', '', ''
      ]);
      routeHeaderRow.eachCell((cell, index) => {
        if (index === 2) {
          cell.font = { bold: true, size: 12, color: { argb: 'FF1976D2' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: routeColors[routeName] || 'FFF5F5F5'
          };
        }
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
      exportWorksheet.mergeCells(`B${exportWorksheet.lastRow.number}:K${exportWorksheet.lastRow.number}`);
      
      // Bu güzergahtaki yolcuları ekle
      routePassengers.forEach((passenger) => {
        const row = exportWorksheet.addRow([
          rowIndex,
          passenger.name || '',
          passenger.department || '',
          passenger.position || '',
          passenger.shift || '',
          routeName,
          passenger.stop || '',
          passenger.address || '',
          passenger.phone || '',
          passenger.emergencyContact || '',
          passenger.notes || ''
        ]);

        // Satır stilini ayarla
        row.eachCell((cell, index) => {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: index === 1 ? 'center' : 'left' };
          
          // Güzergah rengi
          const bgColor = routeColors[routeName] || 'FFFFFFFF';
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgColor }
          };
          
          // Font ayarları
          cell.font = { size: 10 };
          if (index === 1) cell.font.bold = true; // Sıra numarası bold
        });
        
        rowIndex++;
      });
    });

    // Footer - Özet bilgiler
    exportWorksheet.addRow([]); // Boş satır
    const summaryRow = exportWorksheet.addRow([
      '', 'ÖZET BİLGİLER:', '', '', '', '', '', '', '', '', ''
    ]);
    summaryRow.eachCell((cell, index) => {
      if (index === 2) {
        cell.font = { bold: true, size: 12, color: { argb: 'FF1976D2' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
      }
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    
    // Güzergah bazlı sayılar
    routeOrder.forEach(routeName => {
      const count = groupedByRoute[routeName]?.length || 0;
      if (count > 0) {
        const countRow = exportWorksheet.addRow([
          '', `• ${routeName}:`, `${count} kişi`, '', '', '', '', '', '', '', ''
        ]);
        countRow.eachCell((cell, index) => {
          if (index === 2) cell.font = { bold: true };
          if (index === 3) cell.font = { bold: true, color: { argb: 'FF1976D2' } };
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };
        });
      }
    });

    // Kolon genişliklerini ayarla - PROFESYONEL
    exportWorksheet.columns = [
      { width: 6 },  // Sıra
      { width: 25 }, // Ad Soyad
      { width: 18 }, // Departman
      { width: 20 }, // Pozisyon
      { width: 12 }, // Vardiya
      { width: 30 }, // Güzergah
      { width: 25 }, // Durak
      { width: 20 }, // Adres
      { width: 12 }, // Telefon
      { width: 12 }, // Acil Durum Tel.
      { width: 15 }  // Notlar
    ];

    // Dosya adı oluştur - TARİH SAATLİ
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace(':', '');
    const fileName = `Canga_Yolcu_Listesi_${totalCount}_Kayit_${dateStr}_${timeStr}.xlsx`;

    // Response header'ları ayarla
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('X-Total-Count', totalCount.toString());

    // Excel dosyasını gönder
    await exportWorkbook.xlsx.write(res);
    
    console.log(`✅ Profesyonel yolcu listesi Excel export tamamlandı: ${totalCount} yolcu`);
    console.log(`📁 Dosya adı: ${fileName}`);
    
  } catch (error) {
    console.error('❌ Yolcu listesi Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel dosyası oluşturulamadı',
      error: error.message
    });
  }
});

// ESKİ METHOD - Geriye uyumluluk için
router.get('/passengers', async (req, res) => {
  try {
    console.log('📊 Yolcu listesi Excel export başlatıldı (ESKİ METHOD)');
    
    // Veritabanından gerçek verileri çekmeye çalış
    const employees = await Employee.find({ 
      status: 'AKTIF',
      'serviceInfo.usesService': true 
    }).populate('serviceInfo.routeId');
    
    let passengers = [];
    
    if (employees && employees.length > 0) {
      // Veritabanından veri varsa kullan
      passengers = employees.map(emp => ({
        name: emp.fullName,
        department: emp.department,
        position: emp.position,
        shift: emp.shiftPreferences?.[0]?.shiftType || '08:00-18:00',
        route: emp.serviceInfo?.routeName || emp.serviceInfo?.routeId?.routeName || '',
        stop: emp.serviceInfo?.stopName || '',
        address: emp.address?.fullAddress || '',
        phone: emp.phone || '',
        emergencyContact: emp.phone || ''
      }));
    } else {
      // Veritabanında veri yoksa demo verileri kullan
      passengers = [
        {
          name: 'AHMET ÇANGA',
          department: 'ÇALILIÖZ',
          position: 'İŞÇİ',
          shift: '08:00-18:00',
          route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
          stop: 'NOKTA A-101/DOĞTAŞ',
          address: 'Çalılıöz Mahallesi',
          phone: '555-0001',
          emergencyContact: '555-0002'
        },
        {
          name: 'AHMET ŞAHİN',
          department: 'ÇALILIÖZ', 
          position: 'İŞÇİ',
          shift: '08:00-18:00',
          route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
          stop: 'SAAT KULESİ',
          address: 'Çalılıöz Mahallesi',
          phone: '555-0003',
          emergencyContact: '555-0004'
        },
        {
          name: 'ALİ ÇAVUŞ BAŞTUĞ',
          department: 'ÇALILIÖZ',
          position: 'İŞÇİ',
          shift: '08:00-18:00',
          route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', 
          stop: 'FIRINLI CAMİ',
          address: 'Çalılıöz Mahallesi',
          phone: '555-0005',
          emergencyContact: '555-0006'
        },
        {
          name: 'ALİ ÖKSÜZ',
          department: 'ÇALILIÖZ',
          position: 'İŞÇİ',
          shift: '08:00-18:00',
          route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
          stop: 'SAAT KULESİ',
          address: 'Çalılıöz Mahallesi',
          phone: '555-0007',
          emergencyContact: '555-0008'
        },
        {
          name: 'AYNUR AYTEKİN',
          department: 'ÇALILIÖZ',
          position: 'İŞÇİ',
          shift: '08:00-18:00',
          route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
          stop: 'ÇALILIÖZ KÖPRÜ (ALT YOL)',
          address: 'Çalılıöz Mahallesi',
          phone: '555-0009',
          emergencyContact: '555-0010'
        },
        {
          name: 'BİRKAN ŞEKER',
          department: 'TORNA GRUBU',
          position: 'TORNA TEZGAHÇİSİ',
          shift: '08:00-18:00',
          route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
          stop: 'S-OİL BENZİNLİK',
          address: 'Merkez',
          phone: '555-0011',
          emergencyContact: '555-0012'
        }
      ];
    }
    
    // Excel dosyası oluştur
    const oldWorkbook = new ExcelJS.Workbook();
    const oldWorksheet = oldWorkbook.addWorksheet('Yolcu Listesi');

    // Başlık satırı
    const oldHeaderRow = oldWorksheet.addRow([
      'Ad Soyad',
      'Departman',
      'Pozisyon',
      'Vardiya',
      'Güzergah',
      'Durak',
      'Adres',
      'Telefon',
      'Acil Durum Telefonu'
    ]);

    // Başlık stilini ayarla
    oldHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1976D2' } // Mavi arka plan
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Yolcu verilerini ekle
    passengers.forEach((passenger, index) => {
      const row = oldWorksheet.addRow([
        passenger.name || '',
        passenger.department || '',
        passenger.position || '',
        passenger.shift || '',
        passenger.route || '',
        passenger.stop || '',
        passenger.address || '',
        passenger.phone || '',
        passenger.emergencyContact || ''
      ]);

      // Satır stilini ayarla
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle' };
      });

      // Güzergah bazlı renklendirme
      const routeColors = {
        'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI': 'FFE8F5E8',
        'ÇARŞI MERKEZ SERVİS GÜZERGAHI': 'FFE3F2FD',
        'OSMANGAZI-KARŞIYAKA MAHALLESİ': 'FFFFF3E0',
        'SANAYİ MAHALLESİ SERVİS GÜZERGAHI': 'FFF3E5F5',
        'DİSPANSER SERVİS GÜZERGAHI': 'FFFCE4EC',
        'KENDİ ARACI': 'FFEFEBE9'
      };
      
      const bgColor = routeColors[passenger.route] || 'FFFFFFFF';
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor }
        };
      });
    });

    // Kolon genişliklerini ayarla
    oldWorksheet.columns = [
      { width: 20 }, // Ad Soyad
      { width: 20 }, // Departman
      { width: 25 }, // Pozisyon
      { width: 15 }, // Vardiya
      { width: 35 }, // Güzergah
      { width: 25 }, // Durak
      { width: 25 }, // Adres
      { width: 15 }, // Telefon
      { width: 15 }  // Acil Durum Telefonu
    ];

    // Dosya adı oluştur
    const currentDate = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
    const fileName = `Canga_Yolcu_Listesi_${currentDate}.xlsx`;

    // Response header'ları ayarla
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    // Excel dosyasını gönder
    await oldWorkbook.xlsx.write(res);
    
    console.log(`✅ Yolcu listesi Excel export tamamlandı: ${passengers.length} yolcu`);
    
  } catch (error) {
    console.error('❌ Yolcu listesi Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel dosyası oluşturulamadı',
      error: error.message
    });
  }
});

// Çalışanları Excel'e export et
router.get('/employees', async (req, res) => {
  try {
    console.log('📊 Çalışanlar Excel export başlatıldı');
    
    // Tüm aktif çalışanları getir - hem eski hem yeni field'ları destekle
    const employees = await Employee.find({ 
      $or: [
        { status: 'AKTIF' },
        { durum: 'AKTIF' }
      ]
    }).sort({ 
      departman: 1, 
      department: 1, 
      adSoyad: 1, 
      firstName: 1, 
      lastName: 1 
    });

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Çalışan bulunamadı'
      });
    }

    // Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Çalışanlar');

    // Başlık satırı
    const headerRow = worksheet.addRow([
      'Çalışan ID',
      'Ad Soyad',
      'TC No',
      'Cep Telefonu',
      'Doğum Tarihi',
      'Departman',
      'Pozisyon',
      'Lokasyon',
      'İşe Giriş Tarihi',
      'Durum',
      'Servis Güzergahı',
      'Durak'
    ]);

    // Başlık stilini ayarla
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' } // Yeşil arka plan
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Çalışan verilerini ekle
    employees.forEach((employee) => {
      const row = worksheet.addRow([
        employee.employeeId || '',
        employee.adSoyad || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
        employee.tcNo || '',
        employee.cepTelefonu || employee.phone || '',
        employee.dogumTarihi ? new Date(employee.dogumTarihi).toLocaleDateString('tr-TR') : '',
        employee.departman || employee.department || '',
        employee.pozisyon || employee.position || '',
        employee.lokasyon || employee.location || '',
        employee.iseGirisTarihi ? new Date(employee.iseGirisTarihi).toLocaleDateString('tr-TR') : 
          (employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('tr-TR') : ''),
        employee.durum || employee.status || 'AKTIF',
        employee.servisGuzergahi || employee.serviceInfo?.routeName || '',
        employee.durak || employee.serviceInfo?.stopName || ''
      ]);

      // Satır stilini ayarla
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle' };
      });

      // Departman bazlı renklendirme (Excel'e göre güncellendi)
      const deptColors = {
        'MERKEZ ŞUBE': 'FFE3F2FD',
        'IŞIL ŞUBE': 'FFF3E5F5',
        'TEKNİK OFİS / BAKIM ONARIM': 'FFE8F5E8',
        'İDARİ': 'FFFFF3E0',
        'ARGE': 'FFFCE4EC'
      };
      
      const department = employee.departman || employee.department;
      const bgColor = deptColors[department] || 'FFFFFFFF';
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor }
        };
      });
    });

    // Kolon genişliklerini ayarla
    worksheet.columns = [
      { width: 12 }, // Çalışan ID
      { width: 25 }, // Ad Soyad
      { width: 15 }, // TC No
      { width: 15 }, // Telefon
      { width: 15 }, // Doğum Tarihi
      { width: 25 }, // Departman
      { width: 25 }, // Pozisyon
      { width: 15 }, // Lokasyon
      { width: 15 }, // İşe Giriş
      { width: 10 }, // Durum
      { width: 25 }, // Servis Güzergahı
      { width: 20 }  // Durak
    ];

    // Dosya adı oluştur
    const currentDate = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
    const fileName = `Canga_Calisanlar_${currentDate}.xlsx`;

    // Response header'ları ayarla
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    // Excel dosyasını gönder
    await workbook.xlsx.write(res);
    
    console.log(`✅ Çalışanlar Excel export tamamlandı: ${employees.length} çalışan`);
    
  } catch (error) {
    console.error('❌ Çalışanlar Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel dosyası oluşturulamadı',
      error: error.message
    });
  }
});

// 🎯 FİLTRELENMİŞ Çalışanları Excel'e export et - YENI ÖZELLİK
router.get('/employees/filtered', async (req, res) => {
  try {
    console.log('📊 Filtrelenmiş Çalışanlar Excel export başlatıldı');
    
    // Query parametrelerini al
    const { 
      search = '', 
      departman = '', 
      lokasyon = '',
      durum = 'AKTIF' 
    } = req.query;

    console.log('🔍 Filtre parametreleri:', { search, departman, lokasyon, durum });

    // Filtre objesi oluştur - frontend'teki mantığı backend'e taşıyoruz
    const filter = {};
    
    // Durum filtreleme
    if (durum && durum !== 'all') {
      filter.$or = [
        { durum: durum },
        { status: durum }
      ];
    } else {
      // Varsayılan olarak sadece aktif çalışanlar
      filter.$or = [
        { durum: 'AKTIF' },
        { status: 'AKTIF' }
      ];
    }

    // Departman filtreleme
    if (departman && departman !== '') {
      filter.departman = departman;
    }

    // Lokasyon filtreleme
    if (lokasyon && lokasyon !== '') {
      filter.lokasyon = lokasyon;
    }

    // Arama filtreleme (isim, ID, departman, pozisyon)
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { adSoyad: searchRegex },
            { employeeId: searchRegex },
            { departman: searchRegex },
            { pozisyon: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { tcNo: searchRegex }
          ]
        }
      ];
    }

    console.log('📊 MongoDB filter objesi:', JSON.stringify(filter, null, 2));

    // Filtrelenmiş çalışanları getir
    const employees = await Employee.find(filter).sort({ 
      departman: 1, 
      adSoyad: 1, 
      firstName: 1, 
      lastName: 1 
    });

    console.log(`📋 Filtrelenmiş sonuç: ${employees.length} çalışan bulundu`);

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Filtrelenmiş sonuçta çalışan bulunamadı',
        filterInfo: { search, departman, lokasyon, durum }
      });
    }

    // Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Filtrelenmiş Çalışanlar');

    // 🎨 Excel başlık bölümü - Filtre bilgileri ile
    let currentRow = 1;
    
    // Ana başlık
    worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const mainTitle = worksheet.getCell(`A${currentRow}`);
    mainTitle.value = '🏢 ÇANGA SAVUNMA ENDÜSTRİSİ - FİLTRELENMİŞ ÇALIŞAN LİSTESİ';
    mainTitle.font = { size: 16, bold: true, color: { argb: 'FF1976D2' } };
    mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    mainTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
    worksheet.getRow(currentRow).height = 25;
    currentRow++;

    // Filtre bilgileri
    worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const filterInfo = worksheet.getCell(`A${currentRow}`);
    let filterText = '🔍 Uygulanan Filtreler: ';
    const filters = [];
    if (search) filters.push(`Arama: "${search}"`);
    if (departman) filters.push(`Departman: "${departman}"`);
    if (lokasyon) filters.push(`Lokasyon: "${lokasyon}"`);
    if (durum && durum !== 'AKTIF') filters.push(`Durum: "${durum}"`);
    
    filterText += filters.length > 0 ? filters.join(' | ') : 'Filtre yok (Tüm aktif çalışanlar)';
    filterInfo.value = filterText;
    filterInfo.font = { size: 11, italic: true };
    filterInfo.alignment = { horizontal: 'center' };
    currentRow++;

    // Boş satır
    currentRow++;

    // Başlık satırı
    const headerRow = worksheet.addRow([
      'Çalışan ID',
      'Ad Soyad', 
      'TC No',
      'Cep Telefonu',
      'Doğum Tarihi',
      'Departman',
      'Pozisyon',
      'Lokasyon',
      'İşe Giriş Tarihi',
      'Durum',
      'Servis Güzergahı',
      'Durak'
    ]);

    // Başlık stilini ayarla
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' } // Yeşil arka plan
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Çalışan verilerini ekle
    employees.forEach((employee, index) => {
      const row = worksheet.addRow([
        employee.employeeId || '',
        employee.adSoyad || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
        employee.tcNo || '',
        employee.cepTelefonu || employee.phone || '',
        employee.dogumTarihi ? new Date(employee.dogumTarihi).toLocaleDateString('tr-TR') : '',
        employee.departman || employee.department || '',
        employee.pozisyon || employee.position || '',
        employee.lokasyon || employee.location || '',
        employee.iseGirisTarihi ? new Date(employee.iseGirisTarihi).toLocaleDateString('tr-TR') : 
          (employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('tr-TR') : ''),
        employee.durum || employee.status || 'AKTIF',
        employee.servisGuzergahi || employee.serviceInfo?.routeName || '',
        employee.durak || employee.serviceInfo?.stopName || ''
      ]);

      // Satır stilini ayarla
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle' };
      });

      // 🎨 Departman bazlı renklendirme
      const deptColors = {
        'MERKEZ FABRİKA': 'FFE3F2FD',
        'İŞL FABRİKA': 'FFF3E5F5', 
        'TEKNİK OFİS / BAKIM ONARIM': 'FFE8F5E8',
        'İDARİ': 'FFFFF3E0',
        'ARGE': 'FFFCE4EC',
        'TORNA GRUBU': 'FFEFEBE9',
        'FREZE GRUBU': 'FFF1F8E9',
        'KALİTE KONTROL': 'FFE8EAF6',
        'KAYNAK': 'FFFEF7E0'
      };
      
      const department = employee.departman || employee.department;
      const bgColor = deptColors[department] || 'FFFFFFFF';
      
      // Çift satırlar için hafif farklı renk
      const finalBgColor = index % 2 === 0 ? bgColor : 'FFFAFAFA';
      
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: finalBgColor }
        };
      });
    });

    // Kolon genişliklerini ayarla
    worksheet.columns = [
      { width: 12 }, // Çalışan ID
      { width: 25 }, // Ad Soyad
      { width: 15 }, // TC No  
      { width: 15 }, // Telefon
      { width: 15 }, // Doğum Tarihi
      { width: 25 }, // Departman
      { width: 25 }, // Pozisyon
      { width: 15 }, // Lokasyon
      { width: 15 }, // İşe Giriş
      { width: 10 }, // Durum
      { width: 25 }, // Servis Güzergahı
      { width: 20 }  // Durak
    ];

    // Footer ekleme
    const footerRow = worksheet.rowCount + 2;
    worksheet.mergeCells(`A${footerRow}:L${footerRow}`);
    const footer = worksheet.getCell(`A${footerRow}`);
    footer.value = `📊 Toplam ${employees.length} çalışan • Export: ${new Date().toLocaleString('tr-TR')} • 🏢 Çanga Vardiya Sistemi`;
    footer.font = { size: 10, italic: true };
    footer.alignment = { horizontal: 'center' };

    // Dosya adı oluştur - filtre bilgilerini içerecek şekilde
    const currentDate = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
    let fileName = `Canga_Filtrelenmis_Calisanlar_${currentDate}`;
    
    // Filtre bilgilerini dosya adına ekle
    if (departman) fileName += `_${departman.replace(/\s+/g, '_')}`;
    if (lokasyon) fileName += `_${lokasyon}`;
    if (search) fileName += `_Arama`;
    
    fileName += '.xlsx';

    // Response header'ları ayarla
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    // Excel dosyasını gönder
    await workbook.xlsx.write(res);
    
    console.log(`✅ Filtrelenmiş Çalışanlar Excel export tamamlandı: ${employees.length} çalışan`);
    console.log(`📄 Dosya adı: ${fileName}`);
    
  } catch (error) {
    console.error('❌ Filtrelenmiş Çalışanlar Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Filtrelenmiş Excel dosyası oluşturulamadı',
      error: error.message
    });
  }
});

// Multer konfigürasyonu - dosya yükleme için
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('sheet')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece Excel dosyaları kabul edilir'), false);
    }
  }
});

// Excel'den çalışan bilgilerini import et
router.post('/import/employees', upload.single('excel'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel dosyası yüklenmedi'
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    
    const worksheet = workbook.getWorksheet(1);
    const employees = [];
    const errors = [];

    // Excel'deki her satırı oku (başlık satırını atla)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Başlık satırını atla

      try {
        const employee = {
          firstName: row.getCell(1).value,
          lastName: row.getCell(2).value,
          employeeId: row.getCell(3).value,
          department: row.getCell(4).value,
          position: row.getCell(5).value,
          location: row.getCell(6).value,
          status: row.getCell(7).value || 'AKTIF'
        };

        if (employee.firstName && employee.lastName) {
          employees.push(employee);
        }
      } catch (error) {
        errors.push(`Satır ${rowNumber}: ${error.message}`);
      }
    });

    // Veritabanına kaydet
    const savedEmployees = [];
    for (const empData of employees) {
      try {
        const employee = new Employee(empData);
        await employee.save();
        savedEmployees.push(employee);
      } catch (error) {
        errors.push(`${empData.firstName} ${empData.lastName}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `${savedEmployees.length} çalışan başarıyla aktarıldı`,
      data: {
        imported: savedEmployees.length,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Excel import hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel dosyası işlenemedi',
      error: error.message
    });
  }
});

// 🔧 GELİŞTİRİLMİŞ ÇALIŞAN İSİM ÇÖZÜMLEME FONKSİYONU
const getEmployeeName = (employee) => {
  // Debug mode için environment variable
  const DEBUG_MODE = process.env.NODE_ENV === 'development';
  
  if (DEBUG_MODE) {
    console.log('🔍 getEmployeeName çağrıldı:', {
      employee: employee,
      directName: employee?.name,
      populatedId: employee?.employeeId?._id,
      populatedAdSoyad: employee?.employeeId?.adSoyad
    });
  }
  
  if (!employee) {
    if (DEBUG_MODE) console.log('❌ Employee objesi null/undefined');
    return 'İsim Bulunamadı';
  }
  
  // 1. Direct name (vardiya oluştururken kaydedilen isim)
  if (employee.name && employee.name.trim() !== '') {
    if (DEBUG_MODE) console.log('✅ Direct name bulundu:', employee.name);
    return employee.name.trim();
  }
  
  // 2. Populated employee data (MongoDB referans)
  if (employee.employeeId) {
    const empData = employee.employeeId;
    if (DEBUG_MODE) console.log('🔍 Populated employee data:', empData);
    
    // Türkçe field öncelik
    if (empData.adSoyad && empData.adSoyad.trim() !== '') {
      if (DEBUG_MODE) console.log('✅ adSoyad bulundu:', empData.adSoyad);
      return empData.adSoyad.trim();
    }
    
    if (empData.fullName && empData.fullName.trim() !== '') {
      if (DEBUG_MODE) console.log('✅ fullName bulundu:', empData.fullName);
      return empData.fullName.trim();
    }
    
    // İngilizce field fallback
    if (empData.firstName || empData.lastName) {
      const combinedName = `${empData.firstName || ''} ${empData.lastName || ''}`.trim();
      if (combinedName !== '') {
        if (DEBUG_MODE) console.log('✅ firstName+lastName bulundu:', combinedName);
        return combinedName;
      }
    }
    
    // Eğer populate edilmiş veri varsa ama isim yoksa
    if (DEBUG_MODE) console.log('⚠️ Populated data var ama isim field\'ları boş');
  }
  
  // 3. Fallback - employee objesinin kendisinde arama
  if (employee.adSoyad && employee.adSoyad.trim() !== '') {
    if (DEBUG_MODE) console.log('✅ Direct adSoyad bulundu:', employee.adSoyad);
    return employee.adSoyad.trim();
  }
  
  if (employee.fullName && employee.fullName.trim() !== '') {
    if (DEBUG_MODE) console.log('✅ Direct fullName bulundu:', employee.fullName);
    return employee.fullName.trim();
  }
  
  if (employee.firstName || employee.lastName) {
    const combinedName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    if (combinedName !== '') {
      if (DEBUG_MODE) console.log('✅ Direct firstName+lastName bulundu:', combinedName);
      return combinedName;
    }
  }
  
  if (DEBUG_MODE) {
    console.log('❌ Hiçbir isim field\'ı bulunamadı, employee:', JSON.stringify(employee, null, 2));
  }
  return 'İsim Bulunamadı';
};

// Vardiya listesi Excel'e export et - RESİMLERDEKİ FORMATLA
router.post('/export/shift', async (req, res) => {
  try {
    const { shiftId } = req.body;
    
    if (!shiftId) {
      return res.status(400).json({
        success: false,
        message: 'Vardiya ID\'si gerekli'
      });
    }

    console.log('🎯 Excel export başlatıldı, shiftId:', shiftId);

    // 🔧 GELİŞTİRİLMİŞ VARDİYA VERİSİ ÇEKİMİ - TÜM EMPLOYEE FIELD'LARINI ÇEK
    const shift = await Shift.findById(shiftId)
      .populate({
        path: 'shiftGroups.shifts.employees.employeeId',
        select: 'adSoyad firstName lastName departman pozisyon lokasyon durum fullName employeeId tcNo'
      })
      .populate({
        path: 'specialGroups.employees.employeeId', 
        select: 'adSoyad firstName lastName departman pozisyon lokasyon durum fullName employeeId tcNo'
      });
    
    console.log('🔍 Shift bulundu:', {
      id: shift._id,
      title: shift.title,
      groupsCount: shift.shiftGroups?.length,
      firstGroupName: shift.shiftGroups?.[0]?.groupName,
      firstShiftEmployeeCount: shift.shiftGroups?.[0]?.shifts?.[0]?.employees?.length
    });
    
    // 🔧 DETAYLI ÇALIŞAN VERİSİ DEBUG
    if (shift.shiftGroups?.[0]?.shifts?.[0]?.employees?.[0]) {
      const firstEmp = shift.shiftGroups[0].shifts[0].employees[0];
      console.log('🧑 İlk çalışan detaylı analizi:', {
        name: firstEmp.name,
        employeeId: firstEmp.employeeId?._id,
        populatedAdSoyad: firstEmp.employeeId?.adSoyad,
        populatedFullName: firstEmp.employeeId?.fullName,
        populatedFirstName: firstEmp.employeeId?.firstName,
        populatedLastName: firstEmp.employeeId?.lastName,
        resolvedName: getEmployeeName(firstEmp)
      });
      
          console.log('🔍 Tüm grup çalışan sayıları:');
    shift.shiftGroups.forEach((group, groupIndex) => {
      group.shifts.forEach((shiftTime, shiftIndex) => {
        const employeeCount = shiftTime.employees?.length || 0;
        const resolvedNames = shiftTime.employees?.map(emp => getEmployeeName(emp)) || [];
        console.log(`   Grup ${groupIndex + 1} (${group.groupName}) - Vardiya ${shiftIndex + 1} (${shiftTime.timeSlot}): ${employeeCount} çalışan`);
        if (employeeCount > 0) {
          console.log(`      İsimler: ${resolvedNames.join(', ')}`);
        }
      });
    });
    
    // 🔧 LOKASYON KONTROL DEBUG
    console.log('🔍 Shift location debug:', {
      shiftLocation: shift.location,
      isMerkezSube: shift.location === 'MERKEZ ŞUBE',
      isMerkez: shift.location === 'MERKEZ',
      totalGroups: shift.shiftGroups?.length || 0,
      groupNames: shift.shiftGroups?.map(g => g.groupName) || []
    });
    }
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Vardiya bulunamadı'
      });
    }

    // Excel dosyası oluştur - ÇOK SAYFALI WORKBOOK
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Çanga Savunma Endüstrisi';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.company = 'Çanga Savunma Endüstrisi Ltd. Şti.';
    
    // 1. ANA SAYFA - Vardiya Listesi (mevcut format korunuyor)
    const worksheet = workbook.addWorksheet('Vardiya Listesi');

    let currentRow = 1;

    // Ana başlık - ÇANGA SAVUNMA ENDÜSTRİ
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = 'ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ. VARDİYA LİSTESİ';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.border = {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thin' },
      right: { style: 'thick' }
    };
    worksheet.getRow(currentRow).height = 25;
    currentRow++;

    // Lokasyon başlığı - (MERKEZ ŞUBE) veya (IŞIL ŞUBE)
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    const locationCell = worksheet.getCell(`A${currentRow}`);
    locationCell.value = `(${shift.location})`;
    locationCell.font = { size: 14, bold: true };
    locationCell.alignment = { horizontal: 'center', vertical: 'middle' };
    locationCell.border = {
      top: { style: 'thin' },
      left: { style: 'thick' },
      bottom: { style: 'thin' },
      right: { style: 'thick' }
    };
    worksheet.getRow(currentRow).height = 20;
    currentRow++;

    // Tarih bilgisi - kırmızı
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    const dateCell = worksheet.getCell(`A${currentRow}`);
    const startDate = new Date(shift.startDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const endDate = new Date(shift.endDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    dateCell.value = `TARİH : ${startDate} - ${endDate}`;
    dateCell.font = { size: 12, bold: true, color: { argb: 'FFFF0000' } };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    dateCell.border = {
      top: { style: 'thin' },
      left: { style: 'thick' },
      bottom: { style: 'thin' },
      right: { style: 'thick' }
    };
    currentRow++;

    // Fabrika Genel Sorumlusu bilgisi - mavi
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    const managerCell = worksheet.getCell(`A${currentRow}`);
    managerCell.value = `FABRİKA GENEL SORUMLUSU : ${shift.generalManager?.name || 'BİLAL CEVİZOĞLU'}`;
    managerCell.font = { size: 11, bold: true, color: { argb: 'FF0066CC' } };
    managerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    managerCell.border = {
      top: { style: 'thin' },
      left: { style: 'thick' },
      bottom: { style: 'thin' },
      right: { style: 'thick' }
    };
    currentRow++;

    // Bölüm Sorumlusu bilgisi (Işıl Şube için) - mavi
    if (shift.location === 'IŞIL ŞUBE' && shift.departmentManager) {
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
      const deptManagerCell = worksheet.getCell(`A${currentRow}`);
      deptManagerCell.value = `BÖLÜM SORUMLUSU: ${shift.departmentManager?.name || 'BATUHAN İLHAN'}`;
      deptManagerCell.font = { size: 11, bold: true, color: { argb: 'FF0066CC' } };
      deptManagerCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptManagerCell.border = {
      top: { style: 'thin' },
      left: { style: 'thick' },
        bottom: { style: 'thin' },
      right: { style: 'thick' }
    };
    currentRow++;
    }

    // Boş satır
    currentRow++;

    // 🔧 IŞIL ŞUBE İÇİN DİNAMİK GRUP MAPPING - HARDCODE GRUP İSİMLERİ KALDIRILDI
    if (shift.location === 'IŞIL ŞUBE') {
      console.log('🔍 IŞIL ŞUBE Excel export düzenleniyor...');
      
      // Ustabaşı bilgisi
      worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
      const supervisorCell = worksheet.getCell(`A${currentRow}`);
      supervisorCell.value = 'USTABAŞI : ALİ ŞİŞ YORULMAZ';
      supervisorCell.font = { size: 11, bold: true, color: { argb: 'FF0066CC' } };
      supervisorCell.alignment = { horizontal: 'center', vertical: 'middle' };
      supervisorCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } };
      
      // Border
      for (let col = 1; col <= 13; col++) {
        const cell = worksheet.getCell(currentRow, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
      currentRow++;
      
      // Vardiya gruplarını dinamik olarak ekle
      shift.shiftGroups.forEach((group, groupIndex) => {
        console.log(`📋 Grup ${groupIndex + 1}: ${group.groupName} (${group.shifts?.length || 0} vardiya)`);
        
        // Grup başlığı
        worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
        const groupHeader = worksheet.getCell(`A${currentRow}`);
        groupHeader.value = group.groupName;
        groupHeader.font = { size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        groupHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        groupHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        
        // Border ekle
        for (let col = 1; col <= 13; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        }
        currentRow++;
        
        // Vardiya saatleri ve çalışanları
        group.shifts.forEach((shift, shiftIndex) => {
          // Saat başlığı
          worksheet.mergeCells(`E${currentRow}:I${currentRow}`);
          const timeCell = worksheet.getCell(`E${currentRow}`);
          timeCell.value = shift.timeSlot;
          timeCell.font = { size: 10, bold: true, color: { argb: 'FFFF0000' } };
          timeCell.alignment = { horizontal: 'center', vertical: 'middle' };
          currentRow++;
          
          // Çalışanları ekle
          const employees = shift.employees || [];
          const employeeNames = employees.map(emp => getEmployeeName(emp));
          
          if (employeeNames.length > 0) {
            // Çalışanları yan yana 3'erli yerleştir
            for (let i = 0; i < employeeNames.length; i += 3) {
              worksheet.getCell(`B${currentRow}`).value = employeeNames[i] || '';
              worksheet.getCell(`F${currentRow}`).value = employeeNames[i + 1] || '';
              worksheet.getCell(`J${currentRow}`).value = employeeNames[i + 2] || '';
              
              for (let col = 1; col <= 13; col++) {
                const cell = worksheet.getCell(currentRow, col);
                cell.border = {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' }
                };
              }
              currentRow++;
            }
          } else {
            // En az 2 boş satır (elle ekleme için)
            for (let i = 0; i < 2; i++) {
              for (let col = 1; col <= 13; col++) {
                const cell = worksheet.getCell(currentRow, col);
                cell.border = {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' }
                };
              }
              currentRow++;
            }
          }
        });
        
        // Gruplar arası boş satır
        currentRow += 1;
      });
      
    } else {
      // 🔧 MERKEZ ŞUBE İÇİN STANDART LAYOUT - GERÇEKLEŞTİRİLMİŞ DEPARTMAN MAPPING
      console.log('🔍 MERKEZ ŞUBE Excel export düzenleniyor...');
      
      // Vardiya gruplarını dinamik olarak ekle
      shift.shiftGroups.forEach((group, groupIndex) => {
        console.log(`📋 Grup ${groupIndex + 1}: ${group.groupName} (${group.shifts?.length || 0} vardiya)`);
        
        // Grup başlığı
        worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
        const groupHeader = worksheet.getCell(`A${currentRow}`);
        groupHeader.value = group.groupName;
        groupHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        groupHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        groupHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        
        // Border ekle
        for (let col = 1; col <= 13; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        }
        currentRow++;
        
        // Vardiya saatleri ve çalışanları
        group.shifts.forEach((shift, shiftIndex) => {
          // Saat başlığı
          worksheet.mergeCells(`B${currentRow}:L${currentRow}`);
          const timeCell = worksheet.getCell(`B${currentRow}`);
          timeCell.value = shift.timeSlot;
          timeCell.font = { size: 10, bold: true, color: { argb: 'FFFF0000' } };
          timeCell.alignment = { horizontal: 'center', vertical: 'middle' };
          currentRow++;
          
          // Çalışanları ekle
          const employees = shift.employees || [];
          employees.forEach((emp, empIndex) => {
            const employeeName = getEmployeeName(emp);
            worksheet.getCell(`B${currentRow}`).value = employeeName;
            
            // Border ekle  
            for (let col = 1; col <= 13; col++) {
              const cell = worksheet.getCell(currentRow, col);
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
            currentRow++;
          });
          
          // En az 2 boş satır (elle ekleme için)
          const minRows = Math.max(2, 5 - employees.length);
          for (let i = 0; i < minRows; i++) {
            for (let col = 1; col <= 13; col++) {
              const cell = worksheet.getCell(currentRow, col);
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
            currentRow++;
          }
        });
        
        // Gruplar arası boş satır
        currentRow += 1;
      });
      
                   // ✅ ESKİ HARDCODED KOD SİLİNDİ
      
      // Artık dinamik sistem kullanıyoruz, eski kod gerekmiyor
      if (false) { // Disabled old hardcoded sections
        // Başlıklar
        if (bakimGroup) {
          worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
          const bakimHeader = worksheet.getCell(`A${currentRow}`);
          bakimHeader.value = 'BAKIM VE ONARIM';
          bakimHeader.font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
          bakimHeader.alignment = { horizontal: 'center', vertical: 'middle' };
          bakimHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        }
        
        if (genelGroup) {
          worksheet.mergeCells(`H${currentRow}:M${currentRow}`);
          const genelHeader = worksheet.getCell(`H${currentRow}`);
          genelHeader.value = 'GENEL ÇALIŞMA GRUBU';
          genelHeader.font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
          genelHeader.alignment = { horizontal: 'center', vertical: 'middle' };
          genelHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        }
        
        // Border'ları ayarla
        for (let col = 1; col <= 13; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        }
         currentRow++;
         
        // Saat başlıkları
        worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
        const bakimTimeCell = worksheet.getCell(`B${currentRow}`);
        bakimTimeCell.value = '08:00-18:00';
        bakimTimeCell.font = { size: 10, bold: true, color: { argb: 'FFFF0000' } };
        bakimTimeCell.alignment = { horizontal: 'center', vertical: 'middle' };
        
        worksheet.mergeCells(`I${currentRow}:L${currentRow}`);
        const genelTimeCell = worksheet.getCell(`I${currentRow}`);
        genelTimeCell.value = '08:00-18:00';
        genelTimeCell.font = { size: 10, bold: true, color: { argb: 'FFFF0000' } };
        genelTimeCell.alignment = { horizontal: 'center', vertical: 'middle' };
        
        currentRow++;
        
        // Çalışanları ekle
        const bakimEmployees = bakimGroup?.shifts[0]?.employees || [];
        const genelEmployees = genelGroup?.shifts[0]?.employees || [];
        const maxRows = Math.max(bakimEmployees.length, genelEmployees.length, 2);
        
        for (let i = 0; i < maxRows; i++) {
          // Sol taraf çalışanı
          const bakimEmp = bakimEmployees[i];
          if (bakimEmp) {
            worksheet.getCell(`B${currentRow}`).value = getEmployeeName(bakimEmp);
          }
          
          // Sağ taraf çalışanı
          const genelEmp = genelEmployees[i];
          if (genelEmp) {
            worksheet.getCell(`I${currentRow}`).value = getEmployeeName(genelEmp);
          }
          
          // Border'ları ayarla
          for (let col = 1; col <= 13; col++) {
               const cell = worksheet.getCell(currentRow, col);
               cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
               };
          }
           currentRow++;
         }
         
        currentRow += 2; // Boş satır
      }
      
      // 2. TORNA GRUBU (tam genişlik, 4 zaman dilimi)
      const tornaGroup = shift.shiftGroups.find(g => g.groupName === 'TORNA GRUBU');
      if (tornaGroup) {
        // Başlık
        worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
        const tornaHeader = worksheet.getCell(`A${currentRow}`);
        tornaHeader.value = 'TORNA GRUBU';
        tornaHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        tornaHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        tornaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        
        for (let col = 1; col <= 13; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        }
        currentRow++;
        
        // Zaman dilimi başlıkları
        const timeSlots = ['08:00 - 18:00', '08:00 - 16:00', '16:00 - 24:00', '24:00 - 08:00'];
        const colRanges = [
          { start: 'A', end: 'C' },
          { start: 'D', end: 'F' },
          { start: 'G', end: 'I' },
          { start: 'J', end: 'M' }
        ];
        
        timeSlots.forEach((time, index) => {
          worksheet.mergeCells(`${colRanges[index].start}${currentRow}:${colRanges[index].end}${currentRow}`);
          const timeCell = worksheet.getCell(`${colRanges[index].start}${currentRow}`);
          timeCell.value = time;
          timeCell.font = { size: 10, bold: true, color: { argb: 'FFFF0000' } };
          timeCell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        
        for (let col = 1; col <= 13; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
        currentRow++;
        
        // Çalışanları ekle
        const maxEmployees = Math.max(...tornaGroup.shifts.map(s => s.employees.length), 4);
        
        for (let empIndex = 0; empIndex < maxEmployees; empIndex++) {
          let colIndex = 1;
          tornaGroup.shifts.forEach((shift, shiftIndex) => {
            const employee = shift.employees[empIndex];
            if (employee) {
              const name = getEmployeeName(employee);
              worksheet.getCell(currentRow, colIndex).value = name;
            }
            colIndex += 3;
          });
          
          for (let col = 1; col <= 13; col++) {
           const cell = worksheet.getCell(currentRow, col);
           cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
           };
          }
          currentRow++;
        }
        
        currentRow += 2; // Boş satır
      }
      
      // 3. FREZE GRUBU (tam genişlik, 3 zaman dilimi)
      const frezeGroup = shift.shiftGroups.find(g => g.groupName === 'FREZE GRUBU');
      if (frezeGroup) {
        // Başlık
        worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
        const frezeHeader = worksheet.getCell(`A${currentRow}`);
        frezeHeader.value = 'FREZE GRUBU';
        frezeHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        frezeHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        frezeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        
        for (let col = 1; col <= 13; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
         }
         currentRow++;
         
        // Zaman dilimi başlıkları (3 zaman dilimi)
        const timeSlots = ['08:00 - 16:00', '16:00 - 24:00', '24:00 - 08:00'];
        const colRanges = [
          { start: 'B', end: 'E' },
          { start: 'F', end: 'I' },
          { start: 'J', end: 'M' }
        ];
        
        timeSlots.forEach((time, index) => {
          worksheet.mergeCells(`${colRanges[index].start}${currentRow}:${colRanges[index].end}${currentRow}`);
          const timeCell = worksheet.getCell(`${colRanges[index].start}${currentRow}`);
          timeCell.value = time;
             timeCell.font = { size: 10, bold: true, color: { argb: 'FFFF0000' } };
             timeCell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
           
        for (let col = 1; col <= 13; col++) {
             const cell = worksheet.getCell(currentRow, col);
             cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
             };
           }
         currentRow++;
         
        // Çalışanları ekle
        const maxEmployees = Math.max(...frezeGroup.shifts.slice(1, 4).map(s => s.employees.length), 2);
         
         for (let empIndex = 0; empIndex < maxEmployees; empIndex++) {
          let colIndex = 2;
          frezeGroup.shifts.slice(1, 4).forEach((shift, shiftIndex) => {
            const employee = shift.employees[empIndex];
            if (employee) {
              const name = getEmployeeName(employee);
              worksheet.getCell(currentRow, colIndex).value = name;
            }
            colIndex += 4;
          });
          
          for (let col = 1; col <= 13; col++) {
            const cell = worksheet.getCell(currentRow, col);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }
          currentRow++;
        }
        
        currentRow += 2; // Boş satır
      }
      
      // 4. TESTERE
      const testereGroup = shift.shiftGroups.find(g => g.groupName === 'TESTERE');
      if (testereGroup) {
        // Başlık
        worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
        const testereHeader = worksheet.getCell(`A${currentRow}`);
        testereHeader.value = 'TESTERE';
        testereHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        testereHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        testereHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        
        for (let col = 1; col <= 13; col++) {
               const cell = worksheet.getCell(currentRow, col);
               cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        }
        currentRow++;
        
        // Saat başlığı
        worksheet.mergeCells(`E${currentRow}:I${currentRow}`);
        const testereTimeCell = worksheet.getCell(`E${currentRow}`);
        testereTimeCell.value = '08:00-18:00';
        testereTimeCell.font = { size: 10, bold: true, color: { argb: 'FFFF0000' } };
        testereTimeCell.alignment = { horizontal: 'center', vertical: 'middle' };
        currentRow++;
        
        // Çalışanları ekle
        const testereEmployees = testereGroup.shifts[0]?.employees || [];
        testereEmployees.forEach((emp, index) => {
          if (index % 2 === 0) {
            worksheet.getCell(`B${currentRow}`).value = getEmployeeName(emp);
            
            if (testereEmployees[index + 1]) {
              worksheet.getCell(`J${currentRow}`).value = getEmployeeName(testereEmployees[index + 1]);
            }
            
            for (let col = 1; col <= 13; col++) {
              const cell = worksheet.getCell(currentRow, col);
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
            currentRow++;
          }
        });
        
        // Bölüm sorumlusu
        worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
        const testereSorumluCell = worksheet.getCell(`A${currentRow}`);
        testereSorumluCell.value = 'BÖLÜM SORUMLUSU : MURAT ÇAVDAR';
        testereSorumluCell.font = { size: 10, bold: true, color: { argb: 'FF0066CC' } };
        testereSorumluCell.alignment = { horizontal: 'center', vertical: 'middle' };
        testereSorumluCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } };
        
        for (let col = 1; col <= 13; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
           currentRow++;
        
        currentRow += 2; // Boş satır
      }
      
      // 5. KALİTE KONTROL
      const kaliteGroup = shift.shiftGroups.find(g => g.groupName === 'KALİTE KONTROL');
      if (kaliteGroup) {
        // Başlık
        worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
        const kaliteHeader = worksheet.getCell(`A${currentRow}`);
        kaliteHeader.value = 'KALİTE KONTROL';
        kaliteHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        kaliteHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        kaliteHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        
        for (let col = 1; col <= 13; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        }
        currentRow++;
        
        // Zaman dilimi başlıkları
        const timeSlots = ['08:00 - 18:00', '08:00 - 16:00', '16:00 - 24:00', '24:00 - 08:00'];
        const colRanges = [
          { start: 'A', end: 'C' },
          { start: 'D', end: 'F' },
          { start: 'G', end: 'I' },
          { start: 'J', end: 'M' }
        ];
        
        timeSlots.forEach((time, index) => {
          worksheet.mergeCells(`${colRanges[index].start}${currentRow}:${colRanges[index].end}${currentRow}`);
          const timeCell = worksheet.getCell(`${colRanges[index].start}${currentRow}`);
          timeCell.value = time;
          timeCell.font = { size: 10, bold: true, color: { argb: 'FFFF0000' } };
          timeCell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        
        for (let col = 1; col <= 13; col++) {
             const cell = worksheet.getCell(currentRow, col);
             cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
             };
           }
           currentRow++;
        
        // Çalışanları ekle
        const maxEmployees = Math.max(...kaliteGroup.shifts.map(s => s.employees.length), 4);
        
        for (let empIndex = 0; empIndex < maxEmployees; empIndex++) {
          let colIndex = 1;
          kaliteGroup.shifts.forEach((shift, shiftIndex) => {
            const employee = shift.employees[empIndex];
            if (employee) {
              const name = getEmployeeName(employee);
              worksheet.getCell(currentRow, colIndex).value = name;
            }
            colIndex += 3;
          });
          
          for (let col = 1; col <= 13; col++) {
            const cell = worksheet.getCell(currentRow, col);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }
          currentRow++;
        }
        
        currentRow += 2; // Boş satır
      }
    }

    // Gece vardiyası notu (sarı arka plan)
    currentRow++;
    if (shift.nightShiftNote || shift.location === 'MERKEZ ŞUBE') {
      worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
      const noteCell = worksheet.getCell(`A${currentRow}`);
      noteCell.value = shift.nightShiftNote || 
        "24:00-08:00 GECE VARDİYASI PAZARTESİYİ SALIYA BAĞLAYAN GECE BAŞLAYACAKTIR.";
      noteCell.font = { bold: true, size: 11 };
      noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Sarı
      noteCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      for (let col = 1; col <= 13; col++) {
        const cell = worksheet.getCell(currentRow, col);
        cell.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      };
      }
      worksheet.getRow(currentRow).height = 25;
    }

    // Sütun genişlikleri - orijinal Excel formatına uygun
    const columnWidths = [];
    for (let i = 0; i < 13; i++) {
      columnWidths.push({ width: 15 }); // Dengeli genişlik
    }
    worksheet.columns = columnWidths;

    // 🚀 2. HER DEPARTMAN İÇİN AYRI SAYFALAR OLUŞTUR
    console.log('📋 Departman sayfaları oluşturuluyor...');
    
    shift.shiftGroups.forEach((group, groupIndex) => {
      // Departman adını temizle (Excel sayfa adı max 31 karakter)
      let departmentName = group.groupName;
      if (departmentName.length > 31) {
        departmentName = departmentName.substring(0, 28) + '...';
      }
      
      console.log(`📄 ${groupIndex + 1}. Departman sayfası: ${departmentName}`);
      
      // Yeni sayfa oluştur
      const deptSheet = workbook.addWorksheet(departmentName);
      let deptRow = 1;
      
      // 📋 Departman sayfası başlığı
      deptSheet.mergeCells(`A${deptRow}:M${deptRow}`);
      const deptTitleCell = deptSheet.getCell(`A${deptRow}`);
      deptTitleCell.value = 'ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ. VARDİYA LİSTESİ';
      deptTitleCell.font = { size: 16, bold: true };
      deptTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptTitleCell.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      deptSheet.getRow(deptRow).height = 25;
      deptRow++;

      // Lokasyon başlığı
      deptSheet.mergeCells(`A${deptRow}:M${deptRow}`);
      const deptLocationCell = deptSheet.getCell(`A${deptRow}`);
      deptLocationCell.value = `(${shift.location})`;
      deptLocationCell.font = { size: 14, bold: true };
      deptLocationCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptLocationCell.border = {
        top: { style: 'thin' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      deptSheet.getRow(deptRow).height = 20;
      deptRow++;

      // Tarih bilgisi
      deptSheet.mergeCells(`A${deptRow}:M${deptRow}`);
      const deptDateCell = deptSheet.getCell(`A${deptRow}`);
      const startDate = new Date(shift.startDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const endDate = new Date(shift.endDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      deptDateCell.value = `TARİH : ${startDate} - ${endDate}`;
      deptDateCell.font = { size: 12, bold: true, color: { argb: 'FFFF0000' } };
      deptDateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptDateCell.border = {
        top: { style: 'thin' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      deptRow++;

      // Fabrika Genel Sorumlusu
      deptSheet.mergeCells(`A${deptRow}:M${deptRow}`);
      const deptManagerCell = deptSheet.getCell(`A${deptRow}`);
      deptManagerCell.value = `FABRİKA GENEL SORUMLUSU : ${shift.generalManager?.name || 'BİLAL CEVİZOĞLU'}`;
      deptManagerCell.font = { size: 11, bold: true, color: { argb: 'FF0066CC' } };
      deptManagerCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptManagerCell.border = {
        top: { style: 'thin' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      deptRow++;

      // Boş satır
      deptRow++;

      // 📋 DEPARTMAN BAŞLIĞI - BÜYÜK VE BELİRGİN
      deptSheet.mergeCells(`A${deptRow}:M${deptRow}`);
      const deptGroupHeader = deptSheet.getCell(`A${deptRow}`);
      deptGroupHeader.value = group.groupName;
      deptGroupHeader.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      deptGroupHeader.alignment = { horizontal: 'center', vertical: 'middle' };
      deptGroupHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
      
      // Border ekle
      for (let col = 1; col <= 13; col++) {
        const cell = deptSheet.getCell(deptRow, col);
        cell.border = {
          top: { style: 'thick' },
          left: { style: 'thick' },
          bottom: { style: 'thick' },
          right: { style: 'thick' }
        };
      }
      deptSheet.getRow(deptRow).height = 30;
      deptRow++;

      // 📋 Vardiya saatleri ve çalışanları
      group.shifts.forEach((shiftTime, shiftIndex) => {
        // Saat başlığı
        deptSheet.mergeCells(`B${deptRow}:L${deptRow}`);
        const timeCell = deptSheet.getCell(`B${deptRow}`);
        timeCell.value = shiftTime.timeSlot;
        timeCell.font = { size: 14, bold: true, color: { argb: 'FFFF0000' } };
        timeCell.alignment = { horizontal: 'center', vertical: 'middle' };
        timeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
        
        // Border ekle
        for (let col = 1; col <= 13; col++) {
          const cell = deptSheet.getCell(deptRow, col);
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        }
        deptSheet.getRow(deptRow).height = 25;
        deptRow++;
        
        // 📋 Çalışanları listele
        const employees = shiftTime.employees || [];
        
        if (employees.length > 0) {
          employees.forEach((emp, empIndex) => {
            const employeeName = getEmployeeName(emp);
            
            // Çalışan adı
            deptSheet.getCell(`B${deptRow}`).value = `${empIndex + 1}. ${employeeName}`;
            deptSheet.getCell(`B${deptRow}`).font = { size: 12, bold: false };
            deptSheet.getCell(`B${deptRow}`).alignment = { horizontal: 'left', vertical: 'middle' };
            
            // İmza alanları
            deptSheet.getCell(`G${deptRow}`).value = 'GİRİŞ SAATİ:';
            deptSheet.getCell(`H${deptRow}`).value = '________';
            deptSheet.getCell(`I${deptRow}`).value = 'İMZA:';
            deptSheet.getCell(`J${deptRow}`).value = '________________';
            
            // Border ekle  
            for (let col = 1; col <= 13; col++) {
              const cell = deptSheet.getCell(deptRow, col);
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
            deptSheet.getRow(deptRow).height = 20;
            deptRow++;
          });
        } else {
          // Boş çalışan satırları (elle ekleme için)
          for (let i = 0; i < 5; i++) {
            deptSheet.getCell(`B${deptRow}`).value = `${i + 1}. _________________________________`;
            deptSheet.getCell(`G${deptRow}`).value = 'GİRİŞ SAATİ:';
            deptSheet.getCell(`H${deptRow}`).value = '________';
            deptSheet.getCell(`I${deptRow}`).value = 'İMZA:';
            deptSheet.getCell(`J${deptRow}`).value = '________________';
            
            for (let col = 1; col <= 13; col++) {
              const cell = deptSheet.getCell(deptRow, col);
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
            deptSheet.getRow(deptRow).height = 20;
            deptRow++;
          }
        }
        
        // Vardiyalar arası boşluk
        deptRow += 1;
      });
      
      // 📋 Departman sorumluları ve notlar
      deptRow += 2;
      
      // Bölüm Sorumlusu
      if (group.sectionManager) {
        deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
        const sectionManagerCell = deptSheet.getCell(`A${deptRow}`);
        sectionManagerCell.value = `BÖLÜM SORUMLUSU: ${group.sectionManager.name || 'BELİRTİLMEMİŞ'}`;
        sectionManagerCell.font = { size: 11, bold: true, color: { argb: 'FF0066CC' } };
        sectionManagerCell.alignment = { horizontal: 'left', vertical: 'middle' };
        deptRow++;
      }
      
      // Ustabaşı
      if (group.sectionSupervisor) {
        deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
        const supervisorCell = deptSheet.getCell(`A${deptRow}`);
        supervisorCell.value = `USTABAŞI: ${group.sectionSupervisor.name || 'BELİRTİLMEMİŞ'}`;
        supervisorCell.font = { size: 11, bold: true, color: { argb: 'FF0066CC' } };
        supervisorCell.alignment = { horizontal: 'left', vertical: 'middle' };
        deptRow++;
      }
      
      // 📋 Alt bilgi
      deptRow += 3;
      deptSheet.mergeCells(`A${deptRow}:M${deptRow}`);
      const footerCell = deptSheet.getCell(`A${deptRow}`);
      footerCell.value = `${group.groupName} Departmanı • Toplam ${group.shifts.reduce((total, shift) => total + (shift.employees?.length || 0), 0)} Çalışan • Oluşturma: ${new Date().toLocaleString('tr-TR')}`;
      footerCell.font = { size: 9, italic: true, color: { argb: 'FF666666' } };
      footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
      footerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      
      // 📋 Sütun genişlikleri - departman sayfası için optimize
      deptSheet.columns = [
        { width: 3 },   // A - Boşluk
        { width: 35 },  // B - Çalışan adı
        { width: 8 },   // C - Boşluk
        { width: 8 },   // D - Boşluk
        { width: 8 },   // E - Boşluk
        { width: 8 },   // F - Boşluk
        { width: 12 },  // G - Giriş saati
        { width: 10 },  // H - Saat
        { width: 8 },   // I - İmza
        { width: 18 },  // J - İmza alanı
        { width: 8 },   // K - Boşluk
        { width: 8 },   // L - Boşluk
        { width: 8 }    // M - Boşluk
      ];
      
      // 📋 Yazdırma ayarları
      deptSheet.pageSetup = {
        paperSize: 9, // A4
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.5, right: 0.5,
          top: 0.5, bottom: 0.5,
          header: 0.3, footer: 0.3
        }
      };
      
      console.log(`✅ ${departmentName} sayfası tamamlandı (${group.shifts.reduce((total, shift) => total + (shift.employees?.length || 0), 0)} çalışan)`);
    });
    
    console.log(`🎯 Toplam ${shift.shiftGroups.length + 1} sayfa oluşturuldu (1 ana + ${shift.shiftGroups.length} departman)`);

    // Dosyayı buffer olarak al
    const buffer = await workbook.xlsx.writeBuffer();

    // HTTP response headers - ÇOK SAYFALI DOSYA ADI
    const safeLocation = shift.location.replace(/[^\w\-]/g, '_');
    const dateStr = shift.startDate.toISOString().split('T')[0];
    const departmentCount = shift.shiftGroups.length;
    const safeFilename = `Canga_Vardiya_Listesi_${safeLocation}_${dateStr}_${departmentCount}Departman_Detayli.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeFilename}"`
    });

    res.send(buffer);

  } catch (error) {
    console.error('Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel dosyası oluşturulamadı',
      error: error.message
    });
  }
});

// Çalışan listesi Excel'e export et
router.get('/export/employees', async (req, res) => {
  try {
    const { location, department } = req.query;
    
    // Filtre oluştur
    const filter = {};
    if (location) filter.location = location;
    if (department) filter.department = department;

    const employees = await Employee.find(filter).sort({ department: 1, lastName: 1 });

    // Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Çalışan Listesi');

    // Başlık satırı
    worksheet.addRow([
      'Adı',
      'Soyadı',
      'Personel No',
      'Departman',
      'Pozisyon',
      'Lokasyon',
      'Durum',
      'İşe Giriş Tarihi',
      'Telefon',
      'E-posta'
    ]);

    // Başlık stilini ayarla
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    // Çalışan verilerini ekle
    employees.forEach(emp => {
      worksheet.addRow([
        emp.firstName,
        emp.lastName,
        emp.employeeId,
        emp.department,
        emp.position,
        emp.location,
        emp.status,
        emp.hireDate ? emp.hireDate.toLocaleDateString('tr-TR') : '',
        emp.phone || '',
        emp.email || ''
      ]);
    });

    // Sütun genişlikleri
    worksheet.columns = [
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 20 },
      { width: 20 }, { width: 15 }, { width: 12 }, { width: 15 },
      { width: 15 }, { width: 25 }
    ];

    // Dosyayı buffer olarak al
    const buffer = await workbook.xlsx.writeBuffer();

    // HTTP response headers - Türkçe karakterleri temizle
    const safeFilename = `calisan-listesi-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeFilename}"`
    });

    res.send(buffer);

  } catch (error) {
    console.error('Çalışan Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel dosyası oluşturulamadı',
      error: error.message
    });
  }
});

// Vardiya listesi PDF'e export et - ALTERNATIF
router.post('/export/shift/pdf', async (req, res) => {
  try {
    const { shiftId } = req.body;
    
    if (!shiftId) {
      return res.status(400).json({
        success: false,
        message: 'Vardiya ID\'si gerekli'
      });
    }

    // Vardiya bilgilerini getir
    const shift = await Shift.findById(shiftId)
      .populate('shiftGroups.shifts.employees.employeeId')
      .populate('specialGroups.employees.employeeId');
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Vardiya bulunamadı'
      });
    }

    // PDF oluştur
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    
    // Response headers
    const safeFilename = `vardiya-listesi-${shift.location.replace(/[^\w\-]/g, '_')}-${shift.startDate.toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    
    // PDF'yi response'a pipe et
    doc.pipe(res);

    // Ana başlık
    doc.fontSize(16).font('Helvetica-Bold')
       .text('ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ.', { align: 'center' });
    
    doc.fontSize(14).font('Helvetica-Bold')
       .text('VARDİYA LİSTESİ', { align: 'center' });
    
    doc.fontSize(12).font('Helvetica')
       .text(`(${shift.location})`, { align: 'center' });
    
    doc.moveDown();
    
    // Tarih ve yönetici bilgileri
    doc.fontSize(10)
       .text(`TARİH: ${shift.startDate.toLocaleDateString('tr-TR')} - ${shift.endDate.toLocaleDateString('tr-TR')}`, { align: 'center' })
       .text(`FABRİKA GENEL SORUMLUSU: ${shift.generalManager?.name || 'BİLAL CEVİZOĞLU'}`, { align: 'center' })
       .text(`USTABAŞI: ${shift.supervisor?.name || 'MURAT SEPETÇİ'}`, { align: 'center' });
    
    doc.moveDown(2);

    // Her departman için tablo
    shift.shiftGroups.forEach((group, groupIndex) => {
      // Sayfa kontrolü
      if (doc.y > 650) {
        doc.addPage();
      }

      // Departman başlığı
      doc.fontSize(12).font('Helvetica-Bold')
         .text(group.groupName, { underline: true });
      
      doc.moveDown(0.5);

      // Saat başlıkları
      const timeSlots = ['08:00-18:00', '08:00-16:00', '16:00-24:00', '24:00-08:00'];
      doc.fontSize(9).font('Helvetica-Bold');
      
      let xPosition = 50;
      timeSlots.forEach(timeSlot => {
        doc.text(timeSlot, xPosition, doc.y, { width: 120, align: 'center' });
        xPosition += 120;
      });

      doc.moveDown();

      // Çalışan listesi
      const maxEmployees = Math.max(...group.shifts.map(shift => shift.employees.length), 3);
      
      for (let i = 0; i < maxEmployees; i++) {
        doc.fontSize(8).font('Helvetica');
        xPosition = 50;
        
        timeSlots.forEach(timeSlot => {
          const shiftData = group.shifts.find(s => s.timeSlot === timeSlot);
          const employee = shiftData?.employees[i];
          const empName = employee ? 
            (employee.name || `${employee.employeeId?.firstName || ''} ${employee.employeeId?.lastName || ''}`.trim()) : '';
          
          doc.text(empName, xPosition, doc.y, { width: 120, align: 'left' });
          xPosition += 120;
        });
        
        doc.moveDown(0.3);
      }

      doc.moveDown(1);
    });

    // Gece vardiyası notu
    if (shift.nightShiftNote) {
      doc.fontSize(10).font('Helvetica-Bold')
         .text(shift.nightShiftNote, { align: 'center', 
               width: 500, 
               lineGap: 5 });
    }

    // PDF'yi sonlandır
    doc.end();

  } catch (error) {
    console.error('PDF export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'PDF dosyası oluşturulamadı',
      error: error.message
    });
  }
});

// Departman bazlı detaylı rapor
router.get('/export/department-report', async (req, res) => {
  try {
    const { department } = req.query;
    
    console.log('📊 Departman raporu oluşturuluyor:', department);
    
    // Filtre oluştur
    const filter = {};
    if (department && department !== 'ALL') {
      filter.department = department;
    }
    
    // Çalışanları departman bazlı getir
    const employees = await Employee.find(filter)
      .sort({ department: 1, lastName: 1, firstName: 1 });

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bu kriterlere uygun çalışan bulunamadı'
      });
    }

    // Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Çanga Savunma Endüstrisi';
    workbook.created = new Date();

    // Ana sayfa - Departman Özeti
    const summarySheet = workbook.addWorksheet('Departman Özeti');
    
    // Departman istatistikleri hesapla
    const departmentStats = {};
    const locationStats = {};
    
    employees.forEach(emp => {
      // Departman sayıları
      departmentStats[emp.department] = (departmentStats[emp.department] || 0) + 1;
      // Lokasyon sayıları
      locationStats[emp.location] = (locationStats[emp.location] || 0) + 1;
    });

    // Başlık
    summarySheet.mergeCells('A1:F1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'ÇANGA SAVUNMA ENDÜSTRİSİ - DEPARTMAN RAPORU';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Tarih
    summarySheet.mergeCells('A2:F2');
    const dateCell = summarySheet.getCell('A2');
    dateCell.value = `Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`;
    dateCell.font = { size: 12, bold: true };
    dateCell.alignment = { horizontal: 'center' };

    let currentRow = 4;

    // Departman istatistikleri tablosu
    summarySheet.getCell(`A${currentRow}`).value = 'DEPARTMAN';
    summarySheet.getCell(`B${currentRow}`).value = 'ÇALIŞAN SAYISI';
    summarySheet.getCell(`C${currentRow}`).value = 'ORAN (%)';
    
    // Başlık stilini ayarla
    ['A', 'B', 'C'].forEach(col => {
      const cell = summarySheet.getCell(`${col}${currentRow}`);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    currentRow++;

    // Departman verilerini ekle
    Object.entries(departmentStats).forEach(([dept, count]) => {
      const percentage = Math.round((count / employees.length) * 100);
      
      summarySheet.getCell(`A${currentRow}`).value = dept;
      summarySheet.getCell(`B${currentRow}`).value = count;
      summarySheet.getCell(`C${currentRow}`).value = percentage;
      
      // Satır stilini ayarla
      ['A', 'B', 'C'].forEach(col => {
        const cell = summarySheet.getCell(`${col}${currentRow}`);
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { horizontal: col === 'A' ? 'left' : 'center', vertical: 'middle' };
      });
      
      currentRow++;
    });

    // Toplam satırı
    summarySheet.getCell(`A${currentRow}`).value = 'TOPLAM';
    summarySheet.getCell(`B${currentRow}`).value = employees.length;
    summarySheet.getCell(`C${currentRow}`).value = '100%';
    
    ['A', 'B', 'C'].forEach(col => {
      const cell = summarySheet.getCell(`${col}${currentRow}`);
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      cell.border = {
        top: { style: 'thick' }, left: { style: 'thin' },
        bottom: { style: 'thick' }, right: { style: 'thin' }
      };
      cell.alignment = { horizontal: col === 'A' ? 'left' : 'center', vertical: 'middle' };
    });

    // Sütun genişlikleri
    summarySheet.columns = [
      { width: 25 }, // Departman
      { width: 15 }, // Sayı
      { width: 12 }  // Oran
    ];

    // Detaylı çalışan listesi sayfası
    const detailSheet = workbook.addWorksheet('Detaylı Liste');
    
    // Başlık satırı
    const headers = [
      'Departman', 'Ad', 'Soyad', 'Personel No', 'Pozisyon', 
      'Lokasyon', 'Telefon', 'E-posta', 'İşe Giriş', 'Durum'
    ];
    
    const headerRow = detailSheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // Çalışan verilerini ekle
    employees.forEach((employee) => {
      const row = detailSheet.addRow([
        employee.department || '',
        employee.firstName || '',
        employee.lastName || '',
        employee.employeeId || '',
        employee.position || '',
        employee.location || '',
        employee.phone || '',
        employee.email || '',
        employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('tr-TR') : '',
        employee.status || 'AKTIF'
      ]);

      // Satır stilini ayarla
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle' };
      });

      // Departman bazlı renklendirme (Excel'e göre güncellendi)
      const deptColors = {
        'MERKEZ ŞUBE': 'FFE3F2FD',
        'IŞIL ŞUBE': 'FFF3E5F5',
        'TEKNİK OFİS / BAKIM ONARIM': 'FFE8F5E8',
        'İDARİ': 'FFFFF3E0',
        'ARGE': 'FFFCE4EC'
      };
      
      const bgColor = deptColors[employee.department] || 'FFFFFFFF';
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      });
    });

    // Sütun genişlikleri
    detailSheet.columns = [
      { width: 20 }, // Departman
      { width: 15 }, // Ad
      { width: 15 }, // Soyad
      { width: 12 }, // Personel No
      { width: 25 }, // Pozisyon
      { width: 15 }, // Lokasyon
      { width: 15 }, // Telefon
      { width: 25 }, // E-posta
      { width: 12 }, // İşe Giriş
      { width: 10 }  // Durum
    ];

    // Dosya adı oluştur
    const currentDate = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
    const deptName = department && department !== 'ALL' ? `_${department.replace(/\s+/g, '_')}` : '_Tum_Departmanlar';
    const fileName = `Canga_Departman_Raporu${deptName}_${currentDate}.xlsx`;

    // Response header'ları ayarla
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    // Excel dosyasını gönder
    await workbook.xlsx.write(res);
    
    console.log(`✅ Departman raporu tamamlandı: ${employees.length} çalışan, ${Object.keys(departmentStats).length} departman`);
    
  } catch (error) {
    console.error('❌ Departman raporu hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Departman raporu oluşturulamadı',
      error: error.message
    });
  }
});

// Özet rapor - Tüm sistem istatistikleri
router.get('/export/summary-report', async (req, res) => {
  try {
    console.log('📊 Özet rapor oluşturuluyor...');
    
    // Paralel veri çekme
    const [employees, shifts] = await Promise.all([
      Employee.find({}).sort({ department: 1, lastName: 1 }),
      Shift.find({}).sort({ createdAt: -1 }).limit(50) // Son 50 vardiya
    ]);

    // Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Çanga Savunma Endüstrisi';
    workbook.created = new Date();

    // 1. Genel Özet Sayfası
    const summarySheet = workbook.addWorksheet('Genel Özet');
    
    // Başlık
    summarySheet.mergeCells('A1:D1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'ÇANGA SAVUNMA ENDÜSTRİSİ - SİSTEM ÖZETİ';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Tarih ve saat
    summarySheet.mergeCells('A2:D2');
    const dateCell = summarySheet.getCell('A2');
    dateCell.value = `Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}`;
    dateCell.font = { size: 12 };
    dateCell.alignment = { horizontal: 'center' };

    let currentRow = 4;

    // Ana istatistikler
    const stats = [
      ['Toplam Çalışan Sayısı', employees.length],
      ['Aktif Çalışan Sayısı', employees.filter(e => e.status === 'AKTIF').length],
      ['Toplam Departman Sayısı', new Set(employees.map(e => e.department)).size],
      ['Toplam Lokasyon Sayısı', new Set(employees.map(e => e.location)).size],
      ['Toplam Vardiya Listesi', shifts.length],
      ['Onaylanmış Vardiya', shifts.filter(s => s.status === 'ONAYLANDI').length]
    ];

    stats.forEach(([label, value]) => {
      summarySheet.getCell(`A${currentRow}`).value = label;
      summarySheet.getCell(`B${currentRow}`).value = value;
      
      // Stil
      summarySheet.getCell(`A${currentRow}`).font = { bold: true };
      summarySheet.getCell(`B${currentRow}`).font = { bold: true, color: { argb: 'FF1976D2' } };
      summarySheet.getCell(`B${currentRow}`).alignment = { horizontal: 'center' };
      
      currentRow++;
    });

    // Sütun genişlikleri
    summarySheet.columns = [
      { width: 30 }, // Label
      { width: 15 }  // Value
    ];

    // 2. Departman Dağılımı Sayfası
    const deptSheet = workbook.addWorksheet('Departman Dağılımı');
    
    const departmentStats = {};
    employees.forEach(emp => {
      departmentStats[emp.department] = (departmentStats[emp.department] || 0) + 1;
    });

    // Başlık
    deptSheet.addRow(['Departman', 'Çalışan Sayısı', 'Oran (%)']).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
      cell.alignment = { horizontal: 'center' };
    });

    Object.entries(departmentStats)
      .sort(([,a], [,b]) => b - a) // Sayıya göre sırala
      .forEach(([dept, count]) => {
        const percentage = Math.round((count / employees.length) * 100);
        deptSheet.addRow([dept, count, percentage]);
      });

    deptSheet.columns = [{ width: 25 }, { width: 15 }, { width: 12 }];

    // 3. Lokasyon Dağılımı Sayfası
    const locationSheet = workbook.addWorksheet('Lokasyon Dağılımı');
    
    const locationStats = {};
    employees.forEach(emp => {
      locationStats[emp.location] = (locationStats[emp.location] || 0) + 1;
    });

    locationSheet.addRow(['Lokasyon', 'Çalışan Sayısı', 'Oran (%)']).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF9800' } };
      cell.alignment = { horizontal: 'center' };
    });

    Object.entries(locationStats).forEach(([location, count]) => {
      const percentage = Math.round((count / employees.length) * 100);
      locationSheet.addRow([location, count, percentage]);
    });

    locationSheet.columns = [{ width: 20 }, { width: 15 }, { width: 12 }];

    // Dosya adı
    const currentDate = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
    const fileName = `Canga_Ozet_Raporu_${currentDate}.xlsx`;

    // Response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    await workbook.xlsx.write(res);
    
    console.log(`✅ Özet rapor tamamlandı: ${employees.length} çalışan, ${shifts.length} vardiya`);
    
  } catch (error) {
    console.error('❌ Özet rapor hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Özet rapor oluşturulamadı',
      error: error.message
    });
  }
});

// İmza listesi Excel'e export et - PUANTAJ TABLOSU FORMATI
router.post('/export/shift/signature', async (req, res) => {
  try {
    const { shiftId } = req.body;
    
    if (!shiftId) {
      return res.status(400).json({
        success: false,
        message: 'Vardiya ID\'si gerekli'
      });
    }

    // 🔧 GELİŞTİRİLMİŞ VARDİYA VERİSİ ÇEKİMİ - İMZA LİSTESİ İÇİN
    const shift = await Shift.findById(shiftId)
      .populate({
        path: 'shiftGroups.shifts.employees.employeeId',
        select: 'adSoyad firstName lastName departman pozisyon lokasyon durum fullName employeeId tcNo'
      })
      .populate({
        path: 'specialGroups.employees.employeeId', 
        select: 'adSoyad firstName lastName departman pozisyon lokasyon durum fullName employeeId tcNo'
      });
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Vardiya bulunamadı'
      });
    }

    // Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('İmza Listesi');

    let currentRow = 1;

    // Ana başlık
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = `ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ. /${shift.location}`;
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.border = {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thin' },
      right: { style: 'thick' }
    };
    worksheet.getRow(currentRow).height = 25;
    currentRow++;

    // Alt başlık
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const subTitleCell = worksheet.getCell(`A${currentRow}`);
    subTitleCell.value = 'VARDİYA LİSTESİ';
    subTitleCell.font = { size: 12, bold: true };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    subTitleCell.border = {
      top: { style: 'thin' },
      left: { style: 'thick' },
      bottom: { style: 'thin' },
      right: { style: 'thick' }
    };
    currentRow++;

    // Tarih bilgisi
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const dateCell = worksheet.getCell(`A${currentRow}`);
    const startDate = new Date(shift.startDate).toLocaleDateString('tr-TR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
    });
    dateCell.value = `TARİH : ${startDate}`;
    dateCell.font = { size: 11, bold: true };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    dateCell.border = {
      top: { style: 'thin' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    };
    currentRow++;

    // Boş satır
    currentRow++;

    // 🔧 GELİŞTİRİLMİŞ ÇALIŞAN TOPLAMA VE SIRALAMA
    const allEmployees = [];
    shift.shiftGroups.forEach(group => {
      group.shifts.forEach(shiftTime => {
        shiftTime.employees.forEach(emp => {
          const employeeName = getEmployeeName(emp);
          
          if (employeeName && employeeName !== 'İsim Bulunamadı') {
            allEmployees.push({
              name: employeeName,
              timeSlot: shiftTime.timeSlot,
              department: group.groupName
            });
          }
        });
      });
    });

    // Çalışanları alfabetik sırala
    allEmployees.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    // Vardiya saatlerini grupla
    const timeSlotGroups = {};
    allEmployees.forEach(emp => {
      if (!timeSlotGroups[emp.timeSlot]) {
        timeSlotGroups[emp.timeSlot] = [];
      }
      timeSlotGroups[emp.timeSlot].push(emp);
    });

    // Her vardiya saati için ayrı tablo
    Object.keys(timeSlotGroups).forEach((timeSlot, groupIndex) => {
      const employees = timeSlotGroups[timeSlot];
      
      if (groupIndex > 0) {
        currentRow += 2; // Vardiyalar arası boşluk
      }

      // Vardiya başlığı
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const timeHeader = worksheet.getCell(`A${currentRow}`);
      const workHours = calculateWorkingHours(timeSlot);
      timeHeader.value = `${timeSlot}                                                    ${workHours}`;
      timeHeader.font = { size: 11, bold: true };
      timeHeader.alignment = { horizontal: 'left', vertical: 'middle' };
      timeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      
      // Border
      for (let col = 1; col <= 6; col++) {
        const cell = worksheet.getCell(currentRow, col);
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };
    }
      currentRow++;

      // Tablo başlığı
      const headers = ['S.NU.', 'ADI VE SOY ADI', 'GİRİŞ SAATİ', 'İMZA', 'ÇIKIŞ SAATİ', 'İMZA'];
      headers.forEach((header, index) => {
        const cell = worksheet.getCell(currentRow, index + 1);
        cell.value = header;
        cell.font = { size: 10, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };
      });
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      // Çalışanları ekle
      employees.forEach((emp, index) => {
        // Sıra numarası
        worksheet.getCell(currentRow, 1).value = index + 1;
        
        // Ad soyad
        worksheet.getCell(currentRow, 2).value = emp.name.toUpperCase();
        
        // Giriş saati, imza, çıkış saati, imza kolonları boş bırak
        // (Çalışanlar elle dolduracak)
        
        // Satır stilini ayarla
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { 
            horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
            vertical: 'middle' 
          };
          cell.font = { size: 10 };
        }
        worksheet.getRow(currentRow).height = 25; // Yeterli yükseklik
        currentRow++;
      });

      // Boş satırlar ekle (elle ekleme için)
      for (let i = 0; i < Math.max(3, 17 - employees.length); i++) {
        worksheet.getCell(currentRow, 1).value = employees.length + i + 1;
        
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { 
            horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
            vertical: 'middle' 
          };
        }
        worksheet.getRow(currentRow).height = 25;
        currentRow++;
      }
    });

    // Sütun genişlikleri
    worksheet.columns = [
      { width: 8 },   // S.NU.
      { width: 25 },  // ADI VE SOY ADI
      { width: 15 },  // GİRİŞ SAATİ
      { width: 15 },  // İMZA
      { width: 15 },  // ÇIKIŞ SAATİ
      { width: 15 }   // İMZA
    ];

    // 🚀 2. HER DEPARTMAN İÇİN AYRI İMZA SAYFALAR OLUŞTUR
    console.log('📋 Departman imza sayfaları oluşturuluyor...');
    
    // Çalışanları departmana göre grupla
    const employeesByDept = {};
    allEmployees.forEach(emp => {
      if (!employeesByDept[emp.department]) {
        employeesByDept[emp.department] = [];
      }
      employeesByDept[emp.department].push(emp);
    });
    
    Object.keys(employeesByDept).sort().forEach((department, deptIndex) => {
      const deptEmployees = employeesByDept[department];
      
      // Departman adını temizle (Excel sayfa adı max 31 karakter)
      let departmentName = department;
      if (departmentName.length > 31) {
        departmentName = departmentName.substring(0, 28) + '...';
      }
      
      console.log(`📄 ${deptIndex + 1}. Departman imza sayfası: ${departmentName}`);
      
      // Yeni sayfa oluştur
      const deptSheet = workbook.addWorksheet(departmentName);
      let deptRow = 1;
      
      // 📋 Departman sayfası başlığı
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const deptTitleCell = deptSheet.getCell(`A${deptRow}`);
      deptTitleCell.value = `ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ. /${shift.location}`;
      deptTitleCell.font = { size: 14, bold: true };
      deptTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptTitleCell.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      deptSheet.getRow(deptRow).height = 25;
      deptRow++;

      // Alt başlık
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const deptSubTitleCell = deptSheet.getCell(`A${deptRow}`);
      deptSubTitleCell.value = 'VARDİYA İMZA LİSTESİ';
      deptSubTitleCell.font = { size: 12, bold: true };
      deptSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptSubTitleCell.border = {
        top: { style: 'thin' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      deptRow++;

      // Tarih bilgisi
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const deptDateCell = deptSheet.getCell(`A${deptRow}`);
      const startDate = new Date(shift.startDate).toLocaleDateString('tr-TR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
      });
      deptDateCell.value = `TARİH : ${startDate}`;
      deptDateCell.font = { size: 11, bold: true };
      deptDateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptDateCell.border = {
        top: { style: 'thin' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      };
      deptRow++;

      // Boş satır
      deptRow++;

      // 📋 Departman başlığı - BÜYÜK VE BELIRGIN
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const deptHeader = deptSheet.getCell(`A${deptRow}`);
      deptHeader.value = `${department} (${deptEmployees.length} kişi)`;
      deptHeader.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      deptHeader.alignment = { horizontal: 'center', vertical: 'middle' };
      deptHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
      
      // Border
      for (let col = 1; col <= 6; col++) {
        const cell = deptSheet.getCell(deptRow, col);
        cell.border = {
          top: { style: 'thick' },
          left: { style: 'thick' },
          bottom: { style: 'thick' },
          right: { style: 'thick' }
        };
      }
      deptSheet.getRow(deptRow).height = 35;
      deptRow++;

      // 📋 Departman çalışanlarını vardiya saatine göre grupla
      const deptTimeSlotGroups = {};
      deptEmployees.forEach(emp => {
        if (!deptTimeSlotGroups[emp.timeSlot]) {
          deptTimeSlotGroups[emp.timeSlot] = [];
        }
        deptTimeSlotGroups[emp.timeSlot].push(emp);
      });

      // Her vardiya saati için ayrı tablo
      Object.keys(deptTimeSlotGroups).forEach((timeSlot, groupIndex) => {
        const timeSlotEmployees = deptTimeSlotGroups[timeSlot];
        
        if (groupIndex > 0) {
          deptRow += 2; // Vardiyalar arası boşluk
        }

        // Vardiya başlığı
        deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
        const timeHeader = deptSheet.getCell(`A${deptRow}`);
        const workHours = calculateWorkingHours(timeSlot);
        timeHeader.value = `${timeSlot}                                                    ${workHours}`;
        timeHeader.font = { size: 14, bold: true, color: { argb: 'FFFF0000' } };
        timeHeader.alignment = { horizontal: 'left', vertical: 'middle' };
        timeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
        
        // Border
        for (let col = 1; col <= 6; col++) {
          const cell = deptSheet.getCell(deptRow, col);
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        }
        deptSheet.getRow(deptRow).height = 25;
        deptRow++;

        // Tablo başlığı
        const headers = ['S.NU.', 'ADI VE SOY ADI', 'GİRİŞ SAATİ', 'İMZA', 'ÇIKIŞ SAATİ', 'İMZA'];
        headers.forEach((header, index) => {
          const cell = deptSheet.getCell(deptRow, index + 1);
          cell.value = header;
          cell.font = { size: 10, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        });
        deptSheet.getRow(deptRow).height = 20;
        deptRow++;

        // Çalışanları alfabetik sırala ve ekle
        timeSlotEmployees.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

        timeSlotEmployees.forEach((emp, index) => {
          // Sıra numarası
          deptSheet.getCell(deptRow, 1).value = index + 1;
          
          // Ad soyad
          deptSheet.getCell(deptRow, 2).value = emp.name.toUpperCase();
          
          // Giriş saati, imza alanları
          deptSheet.getCell(deptRow, 3).value = 'GİRİŞ SAATİ:';
          deptSheet.getCell(deptRow, 4).value = '________________';
          deptSheet.getCell(deptRow, 5).value = 'ÇIKIŞ SAATİ:';
          deptSheet.getCell(deptRow, 6).value = '________________';
          
          // Satır stilini ayarla
          for (let col = 1; col <= 6; col++) {
            const cell = deptSheet.getCell(deptRow, col);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            cell.alignment = { 
              horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
              vertical: 'middle' 
            };
            cell.font = { size: 10 };
          }
          deptSheet.getRow(deptRow).height = 30; // İmza için yeterli yükseklik
          deptRow++;
        });

        // Her vardiya için minimum 3 boş satır ekle (elle ekleme için)
        const emptyRows = Math.max(3, 10 - timeSlotEmployees.length);
        for (let i = 0; i < emptyRows; i++) {
          deptSheet.getCell(deptRow, 1).value = timeSlotEmployees.length + i + 1;
          deptSheet.getCell(deptRow, 2).value = `${i + 1}. _________________________________`;
          deptSheet.getCell(deptRow, 3).value = 'GİRİŞ SAATİ:';
          deptSheet.getCell(deptRow, 4).value = '________________';
          deptSheet.getCell(deptRow, 5).value = 'ÇIKIŞ SAATİ:';
          deptSheet.getCell(deptRow, 6).value = '________________';
          
          for (let col = 1; col <= 6; col++) {
            const cell = deptSheet.getCell(deptRow, col);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            cell.alignment = { 
              horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
              vertical: 'middle' 
            };
            cell.font = { size: 10 };
          }
          deptSheet.getRow(deptRow).height = 30;
          deptRow++;
        }
      });

      // 📋 Departman sorumluları ve notlar
      deptRow += 2;
      
      // Departman sorumlusu bilgisi
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const managerCell = deptSheet.getCell(`A${deptRow}`);
      managerCell.value = `DEPARTMAN SORUMLUSU: _________________________`;
      managerCell.font = { size: 11, bold: true, color: { argb: 'FF0066CC' } };
      managerCell.alignment = { horizontal: 'left', vertical: 'middle' };
      deptRow++;

      // İmza alanları
      deptRow += 2;
      deptSheet.mergeCells(`A${deptRow}:B${deptRow}`);
      const signatureCell1 = deptSheet.getCell(`A${deptRow}`);
      signatureCell1.value = 'HAZIRLAYAN: ________________';
      signatureCell1.font = { size: 10, bold: true };
      signatureCell1.alignment = { horizontal: 'left', vertical: 'middle' };
      
      deptSheet.mergeCells(`D${deptRow}:F${deptRow}`);
      const signatureCell2 = deptSheet.getCell(`D${deptRow}`);
      signatureCell2.value = 'ONAYLAYAN: ________________';
      signatureCell2.font = { size: 10, bold: true };
      signatureCell2.alignment = { horizontal: 'left', vertical: 'middle' };
      
      // 📋 Alt bilgi
      deptRow += 3;
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const footerCell = deptSheet.getCell(`A${deptRow}`);
      footerCell.value = `${department} • ${deptEmployees.length} Çalışan • Oluşturma: ${new Date().toLocaleString('tr-TR')}`;
      footerCell.font = { size: 9, italic: true, color: { argb: 'FF666666' } };
      footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
      footerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      
      // 📋 Sütun genişlikleri - departman sayfası için optimize
      deptSheet.columns = [
        { width: 8 },   // S.NU.
        { width: 30 },  // ADI VE SOY ADI
        { width: 15 },  // GİRİŞ SAATİ
        { width: 20 },  // İMZA
        { width: 15 },  // ÇIKIŞ SAATİ
        { width: 20 }   // İMZA
      ];
      
      // 📋 Yazdırma ayarları
      deptSheet.pageSetup = {
        paperSize: 9, // A4
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.5, right: 0.5,
          top: 0.5, bottom: 0.5,
          header: 0.3, footer: 0.3
        }
      };
      
      console.log(`✅ ${departmentName} imza sayfası tamamlandı (${deptEmployees.length} çalışan)`);
    });
    
    console.log(`🎯 Toplam ${Object.keys(employeesByDept).length + 1} sayfa oluşturuldu (1 ana + ${Object.keys(employeesByDept).length} departman)`);

    // Dosyayı buffer olarak al
    const buffer = await workbook.xlsx.writeBuffer();

    // HTTP response headers - ÇOK SAYFALI VARDİYA İMZA LİSTESİ DOSYA ADI
    const safeLocation = shift.location.replace(/[^\w\-]/g, '_');
    const safeDate = shift.startDate.toISOString().split('T')[0];
    const departmentCount = Object.keys(employeesByDept).length;
    const safeFilename = `Canga_Vardiya_Imza_Listesi_${safeLocation}_${safeDate}_${departmentCount}Departman_Detayli.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeFilename}"`
    });

    res.send(buffer);

    console.log(`✅ Çok sayfalı vardiya imza listesi oluşturuldu: ${allEmployees.length} çalışan, ${Object.keys(employeesByDept).length} departman`);

  } catch (error) {
    console.error('❌ İmza listesi export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İmza listesi oluşturulamadı',
      error: error.message
    });
  }
});

// Hızlı İmza Listesi Export - YENI ÖZELLİK 🚀
router.post('/export/quick-list', async (req, res) => {
  try {
    const { employees, listInfo } = req.body;
    
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Çalışan listesi gerekli'
      });
    }

    console.log(`📋 Hızlı imza listesi oluşturuluyor: ${employees.length} çalışan`);

    // Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hızlı İmza Listesi');

    let currentRow = 1;

    // Ana başlık
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = `ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ. / ${listInfo.location || 'MERKEZ ŞUBE'}`;
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.border = {
      top: { style: 'thick' },
      left: { style: 'thick' },
      bottom: { style: 'thin' },
      right: { style: 'thick' }
    };
    worksheet.getRow(currentRow).height = 25;
    currentRow++;

    // Alt başlık
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const subTitleCell = worksheet.getCell(`A${currentRow}`);
    subTitleCell.value = listInfo.title || 'HIZLI İMZA LİSTESİ';
    subTitleCell.font = { size: 12, bold: true };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    subTitleCell.border = {
      top: { style: 'thin' },
      left: { style: 'thick' },
      bottom: { style: 'thin' },
      right: { style: 'thick' }
    };
    currentRow++;

    // Tarih ve saat bilgisi
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const dateCell = worksheet.getCell(`A${currentRow}`);
    const listDate = listInfo.date ? new Date(listInfo.date).toLocaleDateString('tr-TR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
    }) : new Date().toLocaleDateString('tr-TR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
    });
    dateCell.value = `TARİH : ${listDate} - ${listInfo.timeSlot || '08:00-18:00'}`;
    dateCell.font = { size: 11, bold: true };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    dateCell.border = {
      top: { style: 'thin' },
      left: { style: 'thick' },
      bottom: { style: 'thick' },
      right: { style: 'thick' }
    };
    currentRow++;

    // Boş satır
    currentRow++;

    // Çalışanları departmana göre grupla ve sırala
    const employeesByDept = {};
    employees.forEach(emp => {
      if (!employeesByDept[emp.department]) {
        employeesByDept[emp.department] = [];
      }
      employeesByDept[emp.department].push(emp);
    });

    // Her departman için ayrı tablo
    Object.keys(employeesByDept).sort().forEach((department, deptIndex) => {
      const deptEmployees = employeesByDept[department];
      
      if (deptIndex > 0) {
        currentRow += 2; // Departmanlar arası boşluk
      }

      // Departman başlığı
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const deptHeader = worksheet.getCell(`A${currentRow}`);
      deptHeader.value = `${department} (${deptEmployees.length} kişi)`;
      deptHeader.font = { size: 11, bold: true };
      deptHeader.alignment = { horizontal: 'center', vertical: 'middle' };
      deptHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      
      // Border
      for (let col = 1; col <= 6; col++) {
        const cell = worksheet.getCell(currentRow, col);
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };
      }
      currentRow++;

      // Tablo başlığı
      const headers = ['S.NU.', 'ADI VE SOY ADI', 'GİRİŞ SAATİ', 'İMZA', 'ÇIKIŞ SAATİ', 'İMZA'];
      headers.forEach((header, index) => {
        const cell = worksheet.getCell(currentRow, index + 1);
        cell.value = header;
        cell.font = { size: 10, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };
      });
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      // Çalışanları alfabetik sırala ve ekle
      deptEmployees.sort((a, b) => 
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr')
      );

      deptEmployees.forEach((emp, index) => {
        // Sıra numarası
        worksheet.getCell(currentRow, 1).value = index + 1;
        
        // Ad soyad
        worksheet.getCell(currentRow, 2).value = `${emp.firstName} ${emp.lastName}`.toUpperCase();
        
        // Giriş saati, imza, çıkış saati, imza kolonları boş bırak
        // (Çalışanlar elle dolduracak)
        
        // Satır stilini ayarla
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { 
            horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
            vertical: 'middle' 
          };
          cell.font = { size: 10 };
        }
        worksheet.getRow(currentRow).height = 25; // İmza için yeterli yükseklik
        currentRow++;
      });

      // Her departman için minimum 3 boş satır ekle (elle ekleme için)
      const emptyRows = Math.max(3, 15 - deptEmployees.length);
      for (let i = 0; i < emptyRows; i++) {
        worksheet.getCell(currentRow, 1).value = deptEmployees.length + i + 1;
        
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { 
            horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
            vertical: 'middle' 
          };
        }
        worksheet.getRow(currentRow).height = 25;
        currentRow++;
      }
    });

    // Alt bilgi
    currentRow += 2;
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const footerCell = worksheet.getCell(`A${currentRow}`);
    footerCell.value = `Toplam ${employees.length} çalışan • Oluşturma: ${new Date().toLocaleString('tr-TR')}`;
    footerCell.font = { size: 9, italic: true };
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    footerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };

    // Sütun genişlikleri
    worksheet.columns = [
      { width: 8 },   // S.NU.
      { width: 25 },  // ADI VE SOY ADI
      { width: 15 },  // GİRİŞ SAATİ
      { width: 15 },  // İMZA
      { width: 15 },  // ÇIKIŞ SAATİ
      { width: 15 }   // İMZA
    ];

    // 🚀 2. HER DEPARTMAN İÇİN AYRI SAYFALAR OLUŞTUR
    console.log('📋 Departman imza sayfaları oluşturuluyor...');
    
    Object.keys(employeesByDept).sort().forEach((department, deptIndex) => {
      const deptEmployees = employeesByDept[department];
      
      // Departman adını temizle (Excel sayfa adı max 31 karakter)
      let departmentName = department;
      if (departmentName.length > 31) {
        departmentName = departmentName.substring(0, 28) + '...';
      }
      
      console.log(`📄 ${deptIndex + 1}. Departman imza sayfası: ${departmentName}`);
      
      // Yeni sayfa oluştur
      const deptSheet = workbook.addWorksheet(departmentName);
      let deptRow = 1;
      
      // 📋 Departman sayfası başlığı
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const deptTitleCell = deptSheet.getCell(`A${deptRow}`);
      deptTitleCell.value = `ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ. /${listInfo.location || 'MERKEZ ŞUBE'}`;
      deptTitleCell.font = { size: 14, bold: true };
      deptTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptTitleCell.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      deptSheet.getRow(deptRow).height = 25;
      deptRow++;

      // Alt başlık
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const deptSubTitleCell = deptSheet.getCell(`A${deptRow}`);
      deptSubTitleCell.value = 'İMZA LİSTESİ';
      deptSubTitleCell.font = { size: 12, bold: true };
      deptSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptSubTitleCell.border = {
        top: { style: 'thin' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      deptRow++;

      // Tarih bilgisi
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const deptDateCell = deptSheet.getCell(`A${deptRow}`);
      const listDate = listInfo.date ? new Date(listInfo.date).toLocaleDateString('tr-TR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
      }) : new Date().toLocaleDateString('tr-TR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
      });
      deptDateCell.value = `TARİH : ${listDate} - ${listInfo.timeSlot || '08:00-18:00'}`;
      deptDateCell.font = { size: 11, bold: true };
      deptDateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      deptDateCell.border = {
        top: { style: 'thin' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      };
      deptRow++;

      // Boş satır
      deptRow++;

      // 📋 Departman başlığı - BÜYÜK VE BELIRGIN
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const deptHeader = deptSheet.getCell(`A${deptRow}`);
      deptHeader.value = `${department} (${deptEmployees.length} kişi)`;
      deptHeader.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      deptHeader.alignment = { horizontal: 'center', vertical: 'middle' };
      deptHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
      
      // Border
      for (let col = 1; col <= 6; col++) {
        const cell = deptSheet.getCell(deptRow, col);
        cell.border = {
          top: { style: 'thick' },
          left: { style: 'thick' },
          bottom: { style: 'thick' },
          right: { style: 'thick' }
        };
      }
      deptSheet.getRow(deptRow).height = 35;
      deptRow++;

      // 📋 Vardiya saati başlığı
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const timeHeader = deptSheet.getCell(`A${deptRow}`);
      const workHours = calculateWorkingHours(listInfo.timeSlot);
      timeHeader.value = `${listInfo.timeSlot || '08:00-18:00'}                                                    ${workHours}`;
      timeHeader.font = { size: 14, bold: true, color: { argb: 'FFFF0000' } };
      timeHeader.alignment = { horizontal: 'left', vertical: 'middle' };
      timeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
      
      // Border
      for (let col = 1; col <= 6; col++) {
        const cell = deptSheet.getCell(deptRow, col);
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };
      }
      deptSheet.getRow(deptRow).height = 25;
      deptRow++;

      // Tablo başlığı
      const headers = ['S.NU.', 'ADI VE SOY ADI', 'GİRİŞ SAATİ', 'İMZA', 'ÇIKIŞ SAATİ', 'İMZA'];
      headers.forEach((header, index) => {
        const cell = deptSheet.getCell(deptRow, index + 1);
        cell.value = header;
        cell.font = { size: 10, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };
      });
      deptSheet.getRow(deptRow).height = 20;
      deptRow++;

      // 📋 Çalışanları alfabetik sırala ve ekle
      deptEmployees.sort((a, b) => 
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr')
      );

      deptEmployees.forEach((emp, index) => {
        // Sıra numarası
        deptSheet.getCell(deptRow, 1).value = index + 1;
        
        // Ad soyad
        deptSheet.getCell(deptRow, 2).value = `${emp.firstName} ${emp.lastName}`.toUpperCase();
        
        // Giriş saati, imza alanları
        deptSheet.getCell(deptRow, 3).value = 'GİRİŞ SAATİ:';
        deptSheet.getCell(deptRow, 4).value = '________________';
        deptSheet.getCell(deptRow, 5).value = 'ÇIKIŞ SAATİ:';
        deptSheet.getCell(deptRow, 6).value = '________________';
        
        // Satır stilini ayarla
        for (let col = 1; col <= 6; col++) {
          const cell = deptSheet.getCell(deptRow, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { 
            horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
            vertical: 'middle' 
          };
          cell.font = { size: 10 };
        }
        deptSheet.getRow(deptRow).height = 30; // İmza için yeterli yükseklik
        deptRow++;
      });

      // Her departman için minimum 5 boş satır ekle (elle ekleme için)
      const emptyRows = Math.max(5, 20 - deptEmployees.length);
      for (let i = 0; i < emptyRows; i++) {
        deptSheet.getCell(deptRow, 1).value = deptEmployees.length + i + 1;
        deptSheet.getCell(deptRow, 2).value = `${i + 1}. _________________________________`;
        deptSheet.getCell(deptRow, 3).value = 'GİRİŞ SAATİ:';
        deptSheet.getCell(deptRow, 4).value = '________________';
        deptSheet.getCell(deptRow, 5).value = 'ÇIKIŞ SAATİ:';
        deptSheet.getCell(deptRow, 6).value = '________________';
        
        for (let col = 1; col <= 6; col++) {
          const cell = deptSheet.getCell(deptRow, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { 
            horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
            vertical: 'middle' 
          };
          cell.font = { size: 10 };
        }
        deptSheet.getRow(deptRow).height = 30;
        deptRow++;
      }

      // 📋 Departman sorumluları ve notlar
      deptRow += 2;
      
      // Departman sorumlusu bilgisi
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const managerCell = deptSheet.getCell(`A${deptRow}`);
      managerCell.value = `DEPARTMAN SORUMLUSU: _________________________`;
      managerCell.font = { size: 11, bold: true, color: { argb: 'FF0066CC' } };
      managerCell.alignment = { horizontal: 'left', vertical: 'middle' };
      deptRow++;

      // İmza alanları
      deptRow += 2;
      deptSheet.mergeCells(`A${deptRow}:B${deptRow}`);
      const signatureCell1 = deptSheet.getCell(`A${deptRow}`);
      signatureCell1.value = 'HAZIRLAYAN: ________________';
      signatureCell1.font = { size: 10, bold: true };
      signatureCell1.alignment = { horizontal: 'left', vertical: 'middle' };
      
      deptSheet.mergeCells(`D${deptRow}:F${deptRow}`);
      const signatureCell2 = deptSheet.getCell(`D${deptRow}`);
      signatureCell2.value = 'ONAYLAYAN: ________________';
      signatureCell2.font = { size: 10, bold: true };
      signatureCell2.alignment = { horizontal: 'left', vertical: 'middle' };
      
      // 📋 Alt bilgi
      deptRow += 3;
      deptSheet.mergeCells(`A${deptRow}:F${deptRow}`);
      const footerCell = deptSheet.getCell(`A${deptRow}`);
      footerCell.value = `${department} • ${deptEmployees.length} Çalışan • Oluşturma: ${new Date().toLocaleString('tr-TR')}`;
      footerCell.font = { size: 9, italic: true, color: { argb: 'FF666666' } };
      footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
      footerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      
      // 📋 Sütun genişlikleri - departman sayfası için optimize
      deptSheet.columns = [
        { width: 8 },   // S.NU.
        { width: 30 },  // ADI VE SOY ADI
        { width: 15 },  // GİRİŞ SAATİ
        { width: 20 },  // İMZA
        { width: 15 },  // ÇIKIŞ SAATİ
        { width: 20 }   // İMZA
      ];
      
      // 📋 Yazdırma ayarları
      deptSheet.pageSetup = {
        paperSize: 9, // A4
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.5, right: 0.5,
          top: 0.5, bottom: 0.5,
          header: 0.3, footer: 0.3
        }
      };
      
      console.log(`✅ ${departmentName} imza sayfası tamamlandı (${deptEmployees.length} çalışan)`);
    });
    
    console.log(`🎯 Toplam ${Object.keys(employeesByDept).length + 1} sayfa oluşturuldu (1 ana + ${Object.keys(employeesByDept).length} departman)`);

    // Dosyayı buffer olarak al
    const buffer = await workbook.xlsx.writeBuffer();

    // HTTP response headers - ÇOK SAYFALI İMZA LİSTESİ DOSYA ADI
    // Güvenli dosya adı oluştur - Türkçe karakterleri temizle
    const createSafeFileName = (text) => {
      if (!text) return 'liste';
      return text.toString()
        .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i')
        .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    };
    
    const safeLocation = createSafeFileName(listInfo.location || 'MERKEZ_SUBE');
    const safeDate = (listInfo.date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const departmentCount = Object.keys(employeesByDept).length;
    const safeFilename = `Canga_Imza_Listesi_${safeLocation}_${safeDate}_${departmentCount}Departman.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeFilename}"`
    });

    res.send(buffer);

    console.log(`✅ Çok sayfalı imza listesi oluşturuldu: ${employees.length} çalışan, ${Object.keys(employeesByDept).length} departman`);

  } catch (error) {
    console.error('❌ Hızlı imza listesi export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Hızlı imza listesi oluşturulamadı',
      error: error.message
    });
  }
});

// Fazla Mesai Listesi Export - RESME UYGUN FORMAT 🚀
router.post('/export/overtime-list', async (req, res) => {
  try {
    const { employees, listInfo } = req.body;
    
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Çalışan listesi gerekli'
      });
    }

    console.log(`⏰ Fazla mesai listesi oluşturuluyor: ${employees.length} çalışan`);

    // Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    
    // Lokasyona göre farklı şablon seç
    if (listInfo.location === 'IŞIL ŞUBE') {
      // IŞIL ŞUBE - İkinci resimde gösterilen format
      const worksheet = workbook.addWorksheet('Fazla Mesai Listesi');
      
      let currentRow = 1;

      // Ana başlık
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const titleCell = worksheet.getCell(`A${currentRow}`);
      titleCell.value = `ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ. IŞIL ŞUBE`;
      titleCell.font = { size: 14, bold: true };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      worksheet.getRow(currentRow).height = 25;
      currentRow++;

      // Alt başlık
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const subTitleCell = worksheet.getCell(`A${currentRow}`);
      subTitleCell.value = 'VARDİYA LİSTESİ (FAZLA MESAİ)';
      subTitleCell.font = { size: 12, bold: true };
      subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      subTitleCell.border = {
        top: { style: 'thin' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      currentRow++;

      // Tarih bilgisi
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const dateCell = worksheet.getCell(`A${currentRow}`);
      const listDate = listInfo.date ? new Date(listInfo.date).toLocaleDateString('tr-TR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
      }) : new Date().toLocaleDateString('tr-TR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
      });
      dateCell.value = `TARİH : ${listDate.toUpperCase()}`;
      dateCell.font = { size: 11, bold: true, color: { argb: 'FFFF0000' } };
      dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      dateCell.border = {
        top: { style: 'thin' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      };
      currentRow++;

      // Boş satır
      currentRow++;

      // Vardiya başlığı
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const shiftHeader = worksheet.getCell(`A${currentRow}`);
      shiftHeader.value = listInfo.timeSlot || '08:00-16:00';
      shiftHeader.font = { size: 12, bold: true };
      shiftHeader.alignment = { horizontal: 'center', vertical: 'middle' };
      shiftHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      
      // Border
      for (let col = 1; col <= 7; col++) {
        const cell = worksheet.getCell(currentRow, col);
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };
      }
      currentRow++;

      // Tablo başlığı
      const headers = ['S.NU.', 'ADI VE SOYADI', 'GİRİŞ SAATİ', 'İMZA', 'ÇIKIŞ SAATİ', 'İMZA', 'FAZLA MESAİ NEDENİ'];
      headers.forEach((header, index) => {
        const cell = worksheet.getCell(currentRow, index + 1);
        cell.value = header;
        cell.font = { size: 10, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };
      });
      worksheet.getRow(currentRow).height = 20;
      currentRow++;

      // Çalışanları alfabetik sırala ve ekle
      employees.sort((a, b) => 
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr')
      );

      employees.forEach((emp, index) => {
        // Sıra numarası
        worksheet.getCell(currentRow, 1).value = index + 1;
        
        // Ad soyad
        worksheet.getCell(currentRow, 2).value = `${emp.firstName} ${emp.lastName}`.toUpperCase();
        
        // Giriş ve çıkış saatleri otomatik doldur
        const [startTime, endTime] = (listInfo.timeSlot || '08:00-16:00').split('-');
        worksheet.getCell(currentRow, 3).value = startTime;
        worksheet.getCell(currentRow, 5).value = endTime;
        
        // Fazla mesai nedeni
        worksheet.getCell(currentRow, 7).value = listInfo.overtimeReason || '';
        
        // Satır stilini ayarla
        for (let col = 1; col <= 7; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { 
            horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
            vertical: 'middle' 
          };
          cell.font = { size: 10 };
        }
        worksheet.getRow(currentRow).height = 30; // İmza için yükseklik
        currentRow++;
      });

      // Minimum 5 boş satır ekle
      for (let i = 0; i < 5; i++) {
        worksheet.getCell(currentRow, 1).value = employees.length + i + 1;
        
        // Giriş ve çıkış saatleri otomatik doldur
        const [startTime, endTime] = (listInfo.timeSlot || '08:00-16:00').split('-');
        worksheet.getCell(currentRow, 3).value = startTime;
        worksheet.getCell(currentRow, 5).value = endTime;
        worksheet.getCell(currentRow, 7).value = listInfo.overtimeReason || '';
        
        for (let col = 1; col <= 7; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { 
            horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
            vertical: 'middle' 
          };
        }
        worksheet.getRow(currentRow).height = 30;
        currentRow++;
      }

      // Sütun genişlikleri
      worksheet.columns = [
        { width: 8 },   // S.NU.
        { width: 25 },  // ADI VE SOYADI
        { width: 12 },  // GİRİŞ SAATİ
        { width: 15 },  // İMZA
        { width: 12 },  // ÇIKIŞ SAATİ
        { width: 15 },  // İMZA
        { width: 20 }   // FAZLA MESAİ NEDENİ
      ];
      
    } else {
      // MERKEZ ŞUBE / OSB ŞUBE - Birinci resimde gösterilen format
      const worksheet = workbook.addWorksheet('Fazla Çalışma Listesi');
      
      let currentRow = 1;

      // Ana başlık
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const titleCell = worksheet.getCell(`A${currentRow}`);
      titleCell.value = 'ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ. FAZLA ÇALIŞMA LİSTESİ';
      titleCell.font = { size: 14, bold: true };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thin' },
        right: { style: 'thick' }
      };
      worksheet.getRow(currentRow).height = 25;
      currentRow++;

      // Boş satır
      currentRow++;

      // Tarih bilgisi
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const dateCell = worksheet.getCell(`A${currentRow}`);
      const listDate = listInfo.date ? new Date(listInfo.date).toLocaleDateString('tr-TR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
      }) : new Date().toLocaleDateString('tr-TR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
      });
      dateCell.value = `TARİH : ${listDate.toUpperCase()}`;
      dateCell.font = { size: 12, bold: true };
      dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      dateCell.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      };
      currentRow++;

      // Boş satır
      currentRow++;

      // Zaman dilimlerine göre çalışanları grupla
      const timeSlots = {};
      employees.forEach(emp => {
        const slot = listInfo.timeSlot || '16:00-22:00';
        if (!timeSlots[slot]) {
          timeSlots[slot] = [];
        }
        timeSlots[slot].push(emp);
      });

      // Her zaman dilimi için tablo oluştur
      Object.keys(timeSlots).forEach((timeSlot, index) => {
        const slotEmployees = timeSlots[timeSlot];
        
        if (index > 0) {
          currentRow += 2; // Tablolar arası boşluk
        }

        // Zaman dilimi başlığı
        worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
        const timeHeader = worksheet.getCell(`A${currentRow}`);
        timeHeader.value = timeSlot;
        timeHeader.font = { size: 12, bold: true };
        timeHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        timeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        
        // Border
        for (let col = 1; col <= 6; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        }
        currentRow++;

        // Tablo başlığı
        const headers = ['S.NU.', 'ADI VE SOY ADI', 'GİRİŞ SAATİ', 'İMZA', 'ÇIKIŞ SAATİ', 'İMZA'];
        headers.forEach((header, headerIndex) => {
          const cell = worksheet.getCell(currentRow, headerIndex + 1);
          cell.value = header;
          cell.font = { size: 10, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        });
        worksheet.getRow(currentRow).height = 20;
        currentRow++;

        // Çalışanları alfabetik sırala ve ekle
        slotEmployees.sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr')
        );

        slotEmployees.forEach((emp, empIndex) => {
          // Sıra numarası
          worksheet.getCell(currentRow, 1).value = empIndex + 1;
          
          // Ad soyad
          worksheet.getCell(currentRow, 2).value = `${emp.firstName} ${emp.lastName}`.toUpperCase();
          
          // Satır stilini ayarla
          for (let col = 1; col <= 6; col++) {
            const cell = worksheet.getCell(currentRow, col);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            cell.alignment = { 
              horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
              vertical: 'middle' 
            };
            cell.font = { size: 10 };
          }
          worksheet.getRow(currentRow).height = 35; // İmza için yükseklik
          currentRow++;
        });

        // Her zaman dilimi için minimum 5 boş satır
        for (let i = 0; i < 8; i++) {
          worksheet.getCell(currentRow, 1).value = slotEmployees.length + i + 1;
          
          for (let col = 1; col <= 6; col++) {
            const cell = worksheet.getCell(currentRow, col);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            cell.alignment = { 
              horizontal: col === 1 ? 'center' : col === 2 ? 'left' : 'center', 
              vertical: 'middle' 
            };
          }
          worksheet.getRow(currentRow).height = 35;
          currentRow++;
        }
      });

      // Sütun genişlikleri
      worksheet.columns = [
        { width: 8 },   // S.NU.
        { width: 25 },  // ADI VE SOY ADI
        { width: 15 },  // GİRİŞ SAATİ
        { width: 15 },  // İMZA
        { width: 15 },  // ÇIKIŞ SAATİ
        { width: 15 }   // İMZA
      ];
    }

    // Dosyayı buffer olarak al
    const buffer = await workbook.xlsx.writeBuffer();

    // HTTP response headers
    const safeLocation = (listInfo.location || 'MERKEZ_SUBE').replace(/[^\w\-]/g, '_');
    const safeDate = (listInfo.date || new Date().toISOString().split('T')[0]);
    const safeFilename = `fazla-mesai-listesi-${safeLocation}-${safeDate}.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeFilename}"`
    });

    res.send(buffer);

    console.log(`✅ Fazla mesai listesi oluşturuldu: ${employees.length} çalışan, lokasyon: ${listInfo.location}`);

  } catch (error) {
    console.error('❌ Fazla mesai listesi export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Fazla mesai listesi oluşturulamadı',
      error: error.message
    });
  }
});

// 📊 Özel Excel export - Database Management için
router.post('/export/custom', async (req, res) => {
  try {
    const { data, filename, sheetName, collection, filter } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Export edilecek veri bulunamadı'
      });
    }

    // Yeni workbook oluştur
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName || 'Veri');

    // Başlık bilgileri ekle
    const headerRow = worksheet.addRow(['ÇANGA SAVUNMA ENDÜSTRİSİ LTD. ŞTİ.']);
    headerRow.font = { bold: true, size: 16 };
    headerRow.alignment = { horizontal: 'center' };
    worksheet.mergeCells('A1:' + String.fromCharCode(65 + Object.keys(data[0]).length - 1) + '1');

    const infoRow = worksheet.addRow([`${collection.toUpperCase()} LİSTESİ`]);
    infoRow.font = { bold: true, size: 14 };
    infoRow.alignment = { horizontal: 'center' };
    worksheet.mergeCells('A2:' + String.fromCharCode(65 + Object.keys(data[0]).length - 1) + '2');

    if (filter && filter !== 'Özel Filtre') {
      const filterRow = worksheet.addRow([`Filtre: ${filter}`]);
      filterRow.font = { bold: true, size: 12, color: { argb: 'FF0066CC' } };
      filterRow.alignment = { horizontal: 'center' };
      worksheet.mergeCells('A3:' + String.fromCharCode(65 + Object.keys(data[0]).length - 1) + '3');
    }

    const dateRow = worksheet.addRow([`Tarih: ${new Date().toLocaleDateString('tr-TR')}`]);
    dateRow.font = { size: 10 };
    dateRow.alignment = { horizontal: 'right' };
    worksheet.mergeCells('A4:' + String.fromCharCode(65 + Object.keys(data[0]).length - 1) + '4');

    // Boş satır
    worksheet.addRow([]);

    // Alan adlarını Türkçeleştir
    const fieldNameMap = {
      firstName: 'Ad',
      lastName: 'Soyad',
      employeeId: 'Sicil No',
      department: 'Departman',
      location: 'Lokasyon',
      position: 'Pozisyon',
      status: 'Durum',
      phone: 'Telefon',
      email: 'E-posta',
      title: 'Başlık',
      startDate: 'Başlangıç Tarihi',
      endDate: 'Bitiş Tarihi',
      'serviceInfo.routeName': 'Servis Güzergahı',
      'serviceInfo.stopName': 'Durak Adı',
      'address.fullAddress': 'Adres',
      shiftPreferences: 'Vardiya Tercihleri',
      canWorkNightShift: 'Gece Vardiyası Uygunluğu',
      shiftGroups: 'Vardiya Grupları'
    };

    // Sütun başlıkları
    const headers = Object.keys(data[0]).map(key => fieldNameMap[key] || key);
    const headerRowIndex = worksheet.addRow(headers);
    headerRowIndex.font = { bold: true };
    headerRowIndex.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Verileri ekle
    data.forEach(item => {
      const row = Object.values(item).map(value => {
        // Tarih formatı düzelt
        if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
          try {
            return new Date(value).toLocaleDateString('tr-TR');
          } catch (e) {
            return value;
          }
        }
        
        // Object ve array'leri string'e çevir
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            return value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(', ');
          }
          return JSON.stringify(value);
        }
        
        // Boolean değerleri Türkçe yap
        if (typeof value === 'boolean') {
          return value ? 'Evet' : 'Hayır';
        }
        
        return value || '';
      });
      worksheet.addRow(row);
    });

    // Sütun genişliklerini ayarla
    worksheet.columns.forEach((column, index) => {
      const maxLength = Math.max(
        headers[index]?.length || 10,
        ...data.map(row => String(Object.values(row)[index] || '').length)
      );
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Kenarlık ekle
    const range = worksheet.getCell('A6').address + ':' + 
                 worksheet.getCell(String.fromCharCode(65 + headers.length - 1) + (data.length + 6)).address;
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 6) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });

    // Excel dosyasını oluştur
    const buffer = await workbook.xlsx.writeBuffer();

    // Response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.setHeader('Content-Length', buffer.length);

    // Dosyayı gönder
    res.send(buffer);

  } catch (error) {
    console.error('Custom Excel export error:', error);
    res.status(500).json({
      success: false,
      message: 'Excel dosyası oluşturulurken hata oluştu',
      error: error.message
    });
  }
});

// 📋 Profesyonel Hızlı Liste Export - Kurumsal Şablon
router.post('/export/quick-list-professional', async (req, res) => {
  try {
    const { employees, listInfo, template = 'corporate' } = req.body;
    
    if (!employees || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Çalışan listesi gerekli'
      });
    }

    const workbook = new ExcelJS.Workbook();
    
    // 🎨 Kurumsal Şablon Ayarları
    const templateConfigs = {
      corporate: {
        name: 'Kurumsal Şablon',
        headerColor: '1976d2',
        accentColor: 'f5f5f5',
        fontFamily: 'Calibri',
        logoText: 'ÇANGA SAVUNMA ENDÜSTRİSİ'
      },
      premium: {
        name: 'Premium Şablon',
        headerColor: '2e7d32',
        accentColor: 'e8f5e8',
        fontFamily: 'Arial',
        logoText: 'ÇANGA SAVUNMA ENDÜSTRİSİ'
      },
      executive: {
        name: 'Yönetici Şablonu',
        headerColor: '7b1fa2',
        accentColor: 'f3e5f5',
        fontFamily: 'Times New Roman',
        logoText: 'ÇANGA SAVUNMA ENDÜSTRİSİ'
      }
    };

    const config = templateConfigs[template] || templateConfigs.corporate;
    const worksheet = workbook.addWorksheet('İmza Listesi');

    // 📄 Sayfa Ayarları - 6 kolon için optimize edildi
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToHeight: 0,
      fitToWidth: 1,
      margins: {
        left: 0.7, right: 0.7, top: 0.7, bottom: 0.7,
        header: 0.3, footer: 0.3
      }
    };

    // 🏢 HEADER - Sadeleştirilmiş Format (6 kolon)
    worksheet.mergeCells('A1:F2');
    const headerCell = worksheet.getCell('A1');
    headerCell.value = `ÇANGA SAVUNMA ENDÜSTRİSİ\n${listInfo.location} ${listInfo.title}`;
    headerCell.font = { 
      name: config.fontFamily, 
      size: 14, 
      bold: true, 
      color: { argb: 'FF000000' } 
    };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerCell.border = {
      top: { style: 'thick' }, left: { style: 'thick' },
      bottom: { style: 'thin' }, right: { style: 'thick' }
    };
    worksheet.getRow(1).height = 25;
    worksheet.getRow(2).height = 25;

    // 📅 Tarih
    worksheet.mergeCells('A3:F3');
    const dateCell = worksheet.getCell('A3');
    const formattedDate = new Date(listInfo.date).toLocaleDateString('tr-TR');
    const dayName = new Date(listInfo.date).toLocaleDateString('tr-TR', { weekday: 'long' }).toUpperCase();
    dateCell.value = `${formattedDate} ${dayName}`;
    dateCell.font = { 
      name: config.fontFamily, 
      size: 12, 
      bold: true, 
      color: { argb: 'FF000000' } 
    };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    dateCell.border = {
      top: { style: 'thin' }, left: { style: 'thick' },
      bottom: { style: 'thin' }, right: { style: 'thick' }
    };
    worksheet.getRow(3).height = 20;

    // ⏰ Vardiya Saati - Kırmızı arka plan
    worksheet.mergeCells('A4:F4');
    const timeCell = worksheet.getCell('A4');
    timeCell.value = listInfo.timeSlot;
    timeCell.font = { 
      name: config.fontFamily, 
      size: 14, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    timeCell.alignment = { horizontal: 'center', vertical: 'middle' };
    timeCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC3545' }
    };
    timeCell.border = {
      top: { style: 'thin' }, left: { style: 'thick' },
      bottom: { style: 'thick' }, right: { style: 'thick' }
    };
    worksheet.getRow(4).height = 25;

    // 📊 Tablo Başlıkları - Sadeleştirilmiş (6 kolon)
    const headerRow = 6;
    const headers = [
      { text: 'SIRA', width: 8 },
      { text: 'AD SOYAD', width: 30 },
      { text: 'GİRİŞ SAATİ', width: 15 },
      { text: 'GİRİŞ İMZASI', width: 20 },
      { text: 'ÇIKIŞ SAATİ', width: 15 },
      { text: 'ÇIKIŞ İMZASI', width: 20 }
    ];

    headers.forEach((header, index) => {
      const col = String.fromCharCode(65 + index); // A, B, C, ...
      const cell = worksheet.getCell(`${col}${headerRow}`);
      cell.value = header.text;
      cell.font = { name: config.fontFamily, size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: config.headerColor }
      };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      
      // Kolon genişliği ayarla
      worksheet.getColumn(col).width = header.width;
    });

    // 👥 Çalışan Verileri - Sadeleştirilmiş (6 kolon)
    employees.forEach((employee, index) => {
      const rowNum = headerRow + 1 + index;
      const rowData = [
        index + 1,
        `${employee.firstName} ${employee.lastName}`,
        '', // Giriş saati - boş bırakılacak
        '', // Giriş imzası - boş bırakılacak
        '', // Çıkış saati - boş bırakılacak  
        ''  // Çıkış imzası - boş bırakılacak
      ];

      rowData.forEach((value, colIndex) => {
        const col = String.fromCharCode(65 + colIndex);
        const cell = worksheet.getCell(`${col}${rowNum}`);
        cell.value = value;
        cell.font = { name: config.fontFamily, size: 10 };
        cell.alignment = { 
          horizontal: colIndex === 0 ? 'center' : 'left', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        
        // Zebra striping
        if (index % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'f9f9f9' }
          };
        }
      });
      
      // Satır yüksekliği ayarla
      worksheet.getRow(rowNum).height = 25;
    });

    // 📝 Footer - İmza Alanları
    const footerStartRow = headerRow + employees.length + 3;
    
    // İmza alanları
    const signatures = [
      { title: 'HAZIRLAYAN', name: '', position: 'İK Uzmanı' },
      { title: 'KONTROL EDEN', name: '', position: 'İK Müdürü' },
      { title: 'ONAYLAYAN', name: '', position: 'Genel Müdür' }
    ];

    signatures.forEach((sig, index) => {
      // İmza alanlarını 6 kolona göre yeniden düzenle: A-B, C-D, E-F
      const colPositions = [
        { start: 1, end: 2 }, // A-B (HAZIRLAYAN)
        { start: 3, end: 4 }, // C-D (KONTROL EDEN)
        { start: 5, end: 6 }  // E-F (ONAYLAYAN)
      ];
      const colStart = colPositions[index].start;
      const colEnd = colPositions[index].end;
      
      // Başlık
      worksheet.mergeCells(`${String.fromCharCode(64 + colStart)}${footerStartRow}:${String.fromCharCode(64 + colEnd)}${footerStartRow}`);
      const titleCell = worksheet.getCell(`${String.fromCharCode(64 + colStart)}${footerStartRow}`);
      titleCell.value = sig.title;
      titleCell.font = { name: config.fontFamily, size: 10, bold: true };
      titleCell.alignment = { horizontal: 'center' };
      
      // İsim alanı
      worksheet.mergeCells(`${String.fromCharCode(64 + colStart)}${footerStartRow + 1}:${String.fromCharCode(64 + colEnd)}${footerStartRow + 1}`);
      const nameCell = worksheet.getCell(`${String.fromCharCode(64 + colStart)}${footerStartRow + 1}`);
      nameCell.value = sig.name;
      nameCell.border = { bottom: { style: 'thin' } };
      
      // Pozisyon
      worksheet.mergeCells(`${String.fromCharCode(64 + colStart)}${footerStartRow + 2}:${String.fromCharCode(64 + colEnd)}${footerStartRow + 2}`);
      const posCell = worksheet.getCell(`${String.fromCharCode(64 + colStart)}${footerStartRow + 2}`);
      posCell.value = sig.position;
      posCell.font = { name: config.fontFamily, size: 9, italic: true };
      posCell.alignment = { horizontal: 'center' };
      
      // Tarih
      worksheet.mergeCells(`${String.fromCharCode(64 + colStart)}${footerStartRow + 3}:${String.fromCharCode(64 + colEnd)}${footerStartRow + 3}`);
      const dateCell = worksheet.getCell(`${String.fromCharCode(64 + colStart)}${footerStartRow + 3}`);
      dateCell.value = `Tarih: ___/___/______`;
      dateCell.font = { name: config.fontFamily, size: 9 };
      dateCell.alignment = { horizontal: 'center' };
    });

    // 🏷️ Sayfa Altbilgisi (6 kolon için güncellendi)
    const lastRow = footerStartRow + 6;
    worksheet.mergeCells(`A${lastRow}:F${lastRow}`);
    const footerCell = worksheet.getCell(`A${lastRow}`);
    footerCell.value = `Bu belge ${new Date().toLocaleDateString('tr-TR')} tarihinde Çanga Vardiya Sistemi tarafından oluşturulmuştur. | Sayfa 1/1`;
    footerCell.font = { name: config.fontFamily, size: 8, italic: true, color: { argb: '666666' } };
    footerCell.alignment = { horizontal: 'center' };

    // 📊 Yazdırma Ayarları
    worksheet.getRow(headerRow).height = 30;
    worksheet.views = [{ showGridLines: false }];

    // 📁 Dosya hazırlama - Tamamen güvenli dosya adı
    const createSafeFileName = (text) => {
      if (!text) return 'liste';
      return text
        .toString()
        .replace(/[çÇ]/g, 'c')    // Türkçe karakterleri normalize et
        .replace(/[ğĞ]/g, 'g')
        .replace(/[ıİ]/g, 'i')
        .replace(/[öÖ]/g, 'o')
        .replace(/[şŞ]/g, 's')
        .replace(/[üÜ]/g, 'u')
        .replace(/[^\w\s-]/g, '') // Tüm özel karakterleri kaldır
        .replace(/\s+/g, '_')     // Boşlukları underscore ile değiştir
        .replace(/_+/g, '_')      // Çoklu underscoreları tek yap
        .substring(0, 30)         // Max 30 karakter
        .replace(/^_|_$/g, '');   // Başta ve sondaki underscoreları kaldır
    };
    
    const safeTitle = createSafeFileName(listInfo.title) || 'liste';
    const safeLocation = createSafeFileName(listInfo.location) || 'merkez';
    const safeDate = listInfo.date ? listInfo.date.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    const fileName = `${safeTitle}_${safeLocation}_${safeDate}.xlsx`;
    
    console.log('📁 Oluşturulan dosya adı:', fileName);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Profesyonel hızlı liste export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel dosyası oluşturulamadı',
      error: error.message
    });
  }
});

// 📋 PDF + Excel Kombo Export
router.post('/export/quick-list-combo', async (req, res) => {
  try {
    const { employees, listInfo, format = 'both' } = req.body; // 'excel', 'pdf', 'both'
    
    // Excel dosyası oluştur
    const excelBuffer = await createProfessionalExcel(employees, listInfo);
    
    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="liste.xlsx"`);
      return res.send(excelBuffer);
    }
    
    // TODO: PDF oluşturma eklenebilir
    
    res.json({
      success: true,
      message: 'Dosyalar hazırlandı',
      files: ['excel'] // gelecekte ['excel', 'pdf']
    });

  } catch (error) {
    console.error('Combo export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya oluşturulamadı',
      error: error.message
    });
  }
});

// 📥 Excel'den Çalışan İçe Aktarma - Toplu Import
router.post('/import-employees', upload.single('excelFile'), async (req, res) => {
  try {
    console.log('📥 Excel import işlemi başlatıldı');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel dosyası bulunamadı'
      });
    }

    // Excel dosyasını oku
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1); // İlk sayfa

    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message: 'Excel dosyasında sayfa bulunamadı'
      });
    }

    console.log(`📊 Excel dosyası okundu, ${worksheet.rowCount} satır bulundu`);

    // Excel verilerini işle
    const importedEmployees = [];
    const skippedEmployees = [];
    const errors = [];

    // Departman normalizasyonu - Excel'e göre güncellendi
    const departmentMapping = {
      'MERKEZ FABRİKA': 'MERKEZ FABRİKA',
      'İŞL FABRİKA': 'İŞL FABRİKA',
      'TEKNİK OFİS': 'TEKNİK OFİS / BAKIM MÜHENDİSİ',
      'BAKIM': 'TEKNİK OFİS / BAKIM MÜHENDİSİ',
      'İDARİ': 'İDARİ',
      'CNC': 'CNC TORNA İŞLİYATÇISI',
      'TORNA': 'CNC TORNA İŞLİYATÇISI'
    };

         // Lokasyon belirleme - Excel'e göre güncellendi (sadece 2 lokasyon)
     const getLocationFromService = (serviceRoute) => {
       if (!serviceRoute) return 'MERKEZ';
       
       const route = serviceRoute.toString().toUpperCase();
       
       // İŞL lokasyonu servis güzergahları
       if (route.includes('SANAYİ') || 
           route.includes('OSMANGAZI') || 
           route.includes('KARŞIYAKA') ||
           route.includes('ÇALILIÖZ')) {
         return 'İŞL';
       }
       
       // Varsayılan olarak MERKEZ
       return 'MERKEZ';
     };

    // Çalışan ID oluşturma
    const generateEmployeeId = (firstName, lastName) => {
      const firstInitial = firstName?.charAt(0)?.toUpperCase() || 'X';
      const lastInitial = lastName?.charAt(0)?.toUpperCase() || 'X';
      
      // Son 4 haneli numara
      const timestamp = Date.now().toString().slice(-4);
      return `${firstInitial}${lastInitial}${timestamp}`;
    };

    // Tarihi parse et (DD.MM.YYYY formatı)
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      try {
        // Excel'den gelen tarih farklı formatlarda olabilir
        if (dateStr instanceof Date) {
          return dateStr;
        }
        
        const str = dateStr.toString().trim();
        
        // DD.MM.YYYY formatı
        if (str.includes('.')) {
          const parts = str.split('.');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // JS ay 0'dan başlar
            const year = parseInt(parts[2]);
            return new Date(year, month, day);
          }
        }
        
        // ISO formatı veya diğer formatlar
        return new Date(str);
      } catch (error) {
        console.log(`⚠️ Tarih parse hatası: ${dateStr}`);
        return null;
      }
    };

    // Excel satırlarını işle (başlık satırını atla)
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      // Boş satırları atla
      if (!row.values || row.values.length <= 1 || !row.getCell(1).value) {
        continue;
      }

      try {
        // Excel kolonları - Görsel'deki sıraya göre
        const rawData = {
          fullName: row.getCell(1).value?.toString()?.trim(),      // Ad-Soyad
          tcNo: row.getCell(2).value?.toString()?.trim(),          // TC NO
          phone: row.getCell(3).value?.toString()?.trim(),         // Cep Telefonu
          birthDate: row.getCell(4).value,                         // Doğum Tarihi
          hireDate: row.getCell(5).value,                          // İşe Giriş Tarihi
          position: row.getCell(6).value?.toString()?.trim(),      // Görev/Pozisyon
          serviceRoute: row.getCell(7).value?.toString()?.trim(),  // Servis Güzergahı
          serviceStop: row.getCell(8).value?.toString()?.trim(),   // Servis Biniş Noktası
          department: row.getCell(9).value?.toString()?.trim(),    // Departman
          location: row.getCell(10).value?.toString()?.trim(),     // Lokasyon
          status: row.getCell(11).value?.toString()?.trim()        // Durum
        };

        // Zorunlu alanları kontrol et
        if (!rawData.fullName || !rawData.position) {
          errors.push(`Satır ${rowNumber}: Ad-Soyad ve Pozisyon zorunludur`);
          continue;
        }

        // Ad ve soyadı ayır
        const nameParts = rawData.fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        if (!firstName || !lastName) {
          errors.push(`Satır ${rowNumber}: Ad ve Soyad ayrı olarak belirlenmeli`);
          continue;
        }

        // Departmanı normalize et
        let normalizedDepartment = 'DİĞER';
        if (rawData.department) {
          const depKey = Object.keys(departmentMapping).find(key => 
            rawData.department.toUpperCase().includes(key)
          );
          normalizedDepartment = departmentMapping[depKey] || rawData.department;
        }

        // Lokasyonu belirle
        const finalLocation = rawData.location || getLocationFromService(rawData.serviceRoute);

        // Çalışan verisini hazırla
        const employeeData = {
          firstName,
          lastName,
          employeeId: generateEmployeeId(firstName, lastName),
          tcNo: rawData.tcNo?.replace(/\D/g, '') || undefined, // Sadece rakamlar
          phone: rawData.phone || undefined,
          birthDate: parseDate(rawData.birthDate),
          hireDate: parseDate(rawData.hireDate) || new Date(), // Zorunlu alan
          position: rawData.position,
          department: normalizedDepartment,
          location: finalLocation,
          status: rawData.status?.toUpperCase() || 'AKTIF',
          serviceInfo: {
            routeName: rawData.serviceRoute || undefined,
            stopName: rawData.serviceStop || undefined,
            usesService: !!rawData.serviceRoute
          }
        };

        console.log(`📝 İşlenen çalışan: ${firstName} ${lastName} (${employeeData.employeeId})`);

        // TC No ile duplicates kontrolü (eğer TC No varsa)
        if (employeeData.tcNo) {
          const existingEmployee = await Employee.findOne({ tcNo: employeeData.tcNo });
          if (existingEmployee) {
            skippedEmployees.push({
              name: `${firstName} ${lastName}`,
              reason: 'TC No zaten kayıtlı',
              tcNo: employeeData.tcNo
            });
            continue;
          }
        }

        // Çalışanı veritabanına kaydet
        const newEmployee = new Employee(employeeData);
        await newEmployee.save();
        
        importedEmployees.push({
          name: `${firstName} ${lastName}`,
          employeeId: employeeData.employeeId,
          department: normalizedDepartment
        });

      } catch (error) {
        console.error(`❌ Satır ${rowNumber} hatası:`, error);
        errors.push(`Satır ${rowNumber}: ${error.message}`);
      }
    }

    // Sonuçları logla
    console.log(`✅ Import tamamlandı:`);
    console.log(`📊 İçe aktarılan: ${importedEmployees.length}`);
    console.log(`⚠️ Atlanan: ${skippedEmployees.length}`);
    console.log(`❌ Hata: ${errors.length}`);

    // Response döndür
    res.json({
      success: true,
      message: `${importedEmployees.length} çalışan başarıyla içe aktarıldı`,
      data: {
        imported: importedEmployees.length,
        skipped: skippedEmployees.length,
        errors: errors.length,
        details: {
          importedEmployees: importedEmployees.slice(0, 10), // İlk 10'unu göster
          skippedEmployees,
          errors
        }
      }
    });

  } catch (error) {
    console.error('❌ Excel import genel hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel import işlemi başarısız',
      error: error.message
    });
  }
});

// 🚌 Hızlı Liste Servis Programı Export - YENİ ÖZELLİK!
router.post('/export/quick-list-service', async (req, res) => {
  try {
    const { employees, listInfo, template = 'corporate' } = req.body;
    
    if (!employees || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Çalışan listesi gerekli'
      });
    }

    console.log(`🚌 Hızlı liste servis programı oluşturuluyor: ${employees.length} çalışan`);

    // 🚌 Tüm çalışanları topla ve servis kullanıp kullanmadıklarını kontrol et
    const serviceUsers = {};
    const nonServiceUsers = [];

    employees.forEach(employee => {
      const employeeData = {
        name: employee.firstName ? `${employee.firstName} ${employee.lastName}` : employee.fullName || employee.adSoyad,
        department: employee.department || employee.departman,
        position: employee.position || employee.pozisyon,
        location: employee.location || employee.lokasyon,
        phone: employee.phone || employee.cepTelefonu,
        timeSlot: listInfo.timeSlot || '08:00-18:00',
        serviceRoute: employee.serviceInfo?.routeName || employee.servisGuzergahi,
        stopName: employee.serviceInfo?.stopName || employee.durak
      };

      if (employeeData.serviceRoute && employeeData.serviceRoute.trim() !== '') {
        if (!serviceUsers[employeeData.serviceRoute]) {
          serviceUsers[employeeData.serviceRoute] = [];
        }
        serviceUsers[employeeData.serviceRoute].push(employeeData);
      } else {
        nonServiceUsers.push(employeeData);
      }
    });

    console.log(`📊 Toplam ${employees.length} çalışan, ${Object.keys(serviceUsers).length} farklı güzergah, ${nonServiceUsers.length} kendi aracı`);

    // 📊 Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Çanga Savunma Endüstrisi';
    workbook.created = new Date();

    // 📋 Ana Sayfa - Servis Özeti
    const summarySheet = workbook.addWorksheet('Servis Özeti');
    let currentRow = 1;

    // 🏢 HEADER - Kurumsal Logo ve Bilgiler
    summarySheet.mergeCells('A1:G3');
    const headerCell = summarySheet.getCell('A1');
    headerCell.value = 'SERVİS PROGRAMI';
    headerCell.font = { 
      name: 'Arial', 
      size: 16, 
      bold: true, 
      color: { argb: 'FFFFFFFF' }
    };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    headerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' }
    };
    summarySheet.getRow(1).height = 25;
    summarySheet.getRow(2).height = 25;
    summarySheet.getRow(3).height = 25;
    currentRow = 4;

    // Tarih bilgisi
    summarySheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const dateInfoCell = summarySheet.getCell(`A${currentRow}`);
    const exportDateStr = new Date(listInfo.date).toLocaleDateString('tr-TR');
    dateInfoCell.value = `📅 ${exportDateStr} Pazartesi - test (${employees.length} yolcu)`;
    dateInfoCell.font = { size: 11, color: { argb: 'FF666666' } };
    dateInfoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(currentRow).height = 20;
    currentRow += 2;

    // Özet istatistikleri başlığı
    summarySheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const statsHeaderCell = summarySheet.getCell(`A${currentRow}`);
    statsHeaderCell.value = '📊 Güzergah Özeti';
    statsHeaderCell.font = { bold: true, size: 14, color: { argb: 'FF1976D2' } };
    statsHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
    currentRow++;

    // Güzergah özet tablosu başlıkları
    const routeSummaryHeaderRow = summarySheet.addRow([
      'Güzergah', 'Çalışan Sayısı', 'Departmanlar', 'Duraklar', 'Notlar', '', ''
    ]);
    routeSummaryHeaderRow.eachCell((cell, index) => {
      if (index <= 5) {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2E7D32' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'medium' }, left: { style: 'thin' },
          bottom: { style: 'medium' }, right: { style: 'thin' }
        };
      }
    });
    summarySheet.getRow(currentRow).height = 25;
    currentRow++;

    // Güzergah özet bilgileri
    Object.keys(serviceUsers).forEach(routeName => {
      const routeEmployees = serviceUsers[routeName];
      const departments = [...new Set(routeEmployees.map(emp => emp.department))];
      const stops = [...new Set(routeEmployees.map(emp => emp.stopName).filter(stop => stop))];
      
      const routeRow = summarySheet.addRow([
        routeName,
        routeEmployees.length,
        departments.join(', '),
        stops.join(', '),
        `${routeEmployees.length} çalışan`,
        '',
        ''
      ]);
      
      routeRow.eachCell((cell, index) => {
        if (index <= 5) {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: index === 2 ? 'center' : 'left' };
          if (index === 2) cell.font = { bold: true, color: { argb: 'FF2E7D32' } };
        }
      });
      
      currentRow++;
    });

    // Kendi aracı özet
    if (nonServiceUsers.length > 0) {
      const ownCarRow = summarySheet.addRow([
        'KENDİ ARACI',
        nonServiceUsers.length,
        [...new Set(nonServiceUsers.map(emp => emp.department))].join(', '),
        'Kendi aracı ile geliyor',
        `${nonServiceUsers.length} çalışan`,
        '',
        ''
      ]);
      
      ownCarRow.eachCell((cell, index) => {
        if (index <= 5) {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: index === 2 ? 'center' : 'left' };
          if (index === 2) cell.font = { bold: true, color: { argb: 'FFFF6B00' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEAA7' }
          };
        }
      });
      currentRow++;
    }

    currentRow += 2;

    // 📋 TOPLU LİSTE BAŞLIĞI
    summarySheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const listHeaderCell = summarySheet.getCell(`A${currentRow}`);
    listHeaderCell.value = '📋 Tüm Çalışanlar Listesi';
    listHeaderCell.font = { bold: true, size: 14, color: { argb: 'FF1976D2' } };
    listHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
    currentRow++;

    // Toplu liste tablo başlıkları
    const allListHeaderRow = summarySheet.addRow([
      'Sıra', 'Ad Soyad', 'Departman', 'Pozisyon', 'Vardiya Saati', 'Güzergah', 'Durak'
    ]);
    allListHeaderRow.eachCell((cell, index) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1976D2' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'medium' }, left: { style: 'thin' },
        bottom: { style: 'medium' }, right: { style: 'thin' }
      };
    });
    summarySheet.getRow(currentRow).height = 25;
    currentRow++;

    // Tüm çalışanları toplu listede göster
    let allEmployeeIndex = 1;
    
    // Önce servis kullananlar
    Object.keys(serviceUsers).forEach(routeName => {
      const routeEmployees = serviceUsers[routeName];
      routeEmployees.forEach(employee => {
        const empRow = summarySheet.addRow([
          allEmployeeIndex,
          employee.name,
          employee.department,
          employee.position,
          listInfo.timeSlot,
          routeName,
          employee.stopName || ''
        ]);
        
        empRow.eachCell((cell, index) => {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { 
            vertical: 'middle', 
            horizontal: index === 1 ? 'center' : 'left' 
          };
          if (index === 2) cell.font = { bold: true };
        });
        
        summarySheet.getRow(currentRow).height = 20;
        currentRow++;
        allEmployeeIndex++;
      });
    });

    // Sonra kendi aracı kullananlar
    nonServiceUsers.forEach(employee => {
      const empRow = summarySheet.addRow([
        allEmployeeIndex,
        employee.name,
        employee.department,
        employee.position,
        listInfo.timeSlot,
        'KENDİ ARACI',
        'Bilinmiyor'
      ]);
      
      empRow.eachCell((cell, index) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: index === 1 ? 'center' : 'left' 
        };
        if (index === 2) cell.font = { bold: true };
        if (index === 6) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEAA7' }
          };
        }
      });
      
      summarySheet.getRow(currentRow).height = 20;
      currentRow++;
      allEmployeeIndex++;
    });

    // Kolon genişlikleri
    summarySheet.columns = [
      { width: 6 },  // Sıra
      { width: 20 }, // Ad Soyad
      { width: 18 }, // Departman
      { width: 20 }, // Pozisyon
      { width: 15 }, // Vardiya Saati
      { width: 35 }, // Güzergah
      { width: 25 }  // Durak
    ];

    // 📋 Detay Sayfaları - Her güzergah için ayrı sayfa
    Object.keys(serviceUsers).forEach(routeName => {
      const routeEmployees = serviceUsers[routeName];
      const safeSheetName = routeName.replace(/[^\w\s-]/g, '').substring(0, 30);
      const detailSheet = workbook.addWorksheet(safeSheetName);
      
      let detailRow = 1;
      
      // Güzergah başlığı - Resimdeki gibi
      detailSheet.mergeCells(`A${detailRow}:G${detailRow + 2}`);
      const routeTitleCell = detailSheet.getCell(`A${detailRow}`);
      routeTitleCell.value = `${routeName} SERVİS PROGRAMI`;
      routeTitleCell.font = { 
        name: 'Arial', 
        size: 14, 
        bold: true, 
        color: { argb: 'FFFFFFFF' }
      };
      routeTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      routeTitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1976D2' }
      };
      detailSheet.getRow(detailRow).height = 25;
      detailSheet.getRow(detailRow + 1).height = 25;
      detailSheet.getRow(detailRow + 2).height = 25;
      detailRow += 3;

      // Tarih bilgileri - Resimdeki format
      detailSheet.mergeCells(`A${detailRow}:G${detailRow}`);
      const routeInfoCell = detailSheet.getCell(`A${detailRow}`);
      routeInfoCell.value = `📅 ${exportDateStr} Pazartesi - test (${routeEmployees.length} yolcu)`;
      routeInfoCell.font = { size: 11, color: { argb: 'FF666666' } };
      routeInfoCell.alignment = { horizontal: 'center', vertical: 'middle' };
      detailSheet.getRow(detailRow).height = 20;
      detailRow += 2;

      // Tablo başlığı - Giriş/Çıkış saati ve İmza kaldırıldı
      const headerRow = detailSheet.addRow([
        'Sıra', 'Ad Soyad', 'Departman', 'Pozisyon', 'Vardiya Saati', 'Durak', 'Telefon'
      ]);
      headerRow.eachCell((cell, index) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2E7D32' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'medium' }, left: { style: 'thin' },
          bottom: { style: 'medium' }, right: { style: 'thin' }
        };
      });
      detailSheet.getRow(detailRow).height = 25;
      detailRow++;

      // Çalışan verileri - Resimdeki format
      routeEmployees.forEach((employee, index) => {
        const empRow = detailSheet.addRow([
          index + 1,
          employee.name,
          employee.department,
          employee.position,
          listInfo.timeSlot,
          employee.stopName || '',
          employee.phone || ''
        ]);
        
        empRow.eachCell((cell, cellIndex) => {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { 
            vertical: 'middle', 
            horizontal: cellIndex === 1 ? 'center' : 'left' 
          };
          if (cellIndex === 2) cell.font = { bold: true };
        });
        
        detailSheet.getRow(detailRow).height = 20;
        detailRow++;
      });

      // Kolon genişlikleri - Güncellenmiş
      detailSheet.columns = [
        { width: 6 },  // Sıra
        { width: 20 }, // Ad Soyad
        { width: 18 }, // Departman
        { width: 20 }, // Pozisyon
        { width: 15 }, // Vardiya Saati
        { width: 25 }, // Durak
        { width: 15 }  // Telefon
      ];
    });

    // 📋 Kendi Aracı Kullananlar Sayfası
    if (nonServiceUsers.length > 0) {
      const ownCarSheet = workbook.addWorksheet('Kendi Aracı');
      
      let ownCarRow = 1;
      
      // Başlık - Resimdeki format
      ownCarSheet.mergeCells(`A${ownCarRow}:G${ownCarRow + 2}`);
      const ownCarTitleCell = ownCarSheet.getCell(`A${ownCarRow}`);
      ownCarTitleCell.value = `Kendi Aracı ile SERVİS PROGRAMI`;
      ownCarTitleCell.font = { 
        name: 'Arial', 
        size: 14, 
        bold: true, 
        color: { argb: 'FFFFFFFF' }
      };
      ownCarTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ownCarTitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF6B00' }
      };
      ownCarSheet.getRow(ownCarRow).height = 25;
      ownCarSheet.getRow(ownCarRow + 1).height = 25;
      ownCarSheet.getRow(ownCarRow + 2).height = 25;
      ownCarRow += 3;

      // Tarih bilgisi - Resimdeki format
      ownCarSheet.mergeCells(`A${ownCarRow}:G${ownCarRow}`);
      const ownCarInfoCell = ownCarSheet.getCell(`A${ownCarRow}`);
      ownCarInfoCell.value = `📅 ${exportDateStr} Pazartesi - test (${nonServiceUsers.length} yolcu)`;
      ownCarInfoCell.font = { size: 11, color: { argb: 'FF666666' } };
      ownCarInfoCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ownCarSheet.getRow(ownCarRow).height = 20;
      ownCarRow += 2;

      // Tablo başlığı - Giriş/Çıkış saati ve İmza kaldırıldı
      const ownCarHeaderRow = ownCarSheet.addRow([
        'Sıra', 'Ad Soyad', 'Departman', 'Pozisyon', 'Vardiya Saati', 'Durak', 'Telefon'
      ]);
      ownCarHeaderRow.eachCell((cell, index) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF6B00' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'medium' }, left: { style: 'thin' },
          bottom: { style: 'medium' }, right: { style: 'thin' }
        };
      });
      ownCarSheet.getRow(ownCarRow).height = 25;
      ownCarRow++;

      // Kendi aracı kullananlar - Resimdeki format
      nonServiceUsers.forEach((employee, index) => {
        const empRow = ownCarSheet.addRow([
          index + 1,
          employee.name,
          employee.department,
          employee.position,
          listInfo.timeSlot,
          'Bilinmiyor',
          employee.phone || ''
        ]);
        
        empRow.eachCell((cell, cellIndex) => {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { 
            vertical: 'middle', 
            horizontal: cellIndex === 1 ? 'center' : 'left' 
          };
          if (cellIndex === 2) cell.font = { bold: true };
        });
        
        ownCarSheet.getRow(ownCarRow).height = 20;
        ownCarRow++;
      });

      // Kolon genişlikleri - Güncellenmiş
      ownCarSheet.columns = [
        { width: 6 },  // Sıra
        { width: 20 }, // Ad Soyad
        { width: 18 }, // Departman
        { width: 20 }, // Pozisyon
        { width: 15 }, // Vardiya Saati
        { width: 25 }, // Durak
        { width: 15 }  // Telefon
      ];
    }

    // Dosyayı buffer olarak al
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Güvenli dosya adı oluştur
    const createSafeFileName = (text) => {
      if (!text) return 'servis';
      return text.toString()
        .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i')
        .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    };
    
    const safeLocation = createSafeFileName(listInfo.location || 'MERKEZ_SUBE');
    const safeDate = (listInfo.date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const totalRoutes = Object.keys(serviceUsers).length;
    const safeFilename = `Canga_Servis_Programi_${safeLocation}_${safeDate}_${totalRoutes}Guzergah.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeFilename}"`
    });

    res.send(buffer);

    console.log(`✅ Hızlı liste servis programı oluşturuldu: ${employees.length} çalışan, ${totalRoutes} güzergah, ${nonServiceUsers.length} kendi aracı`);

  } catch (error) {
    console.error('❌ Hızlı liste servis programı export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Hızlı liste servis programı oluşturulamadı',
      error: error.message
    });
  }
});

// 🧪 EXCEL EXPORT TEST ENDPOINT
router.post('/test-export', async (req, res) => {
  try {
    console.log('🧪 Excel export test başlatılıyor...');
    
    // En son oluşturulan vardiyayı bul
    const latestShift = await Shift.findOne()
      .sort({ createdAt: -1 })
      .populate({
        path: 'shiftGroups.shifts.employees.employeeId',
        select: 'adSoyad firstName lastName departman pozisyon lokasyon durum fullName employeeId tcNo'
      });
    
    if (!latestShift) {
      return res.status(404).json({
        success: false,
        message: 'Test için vardiya bulunamadı'
      });
    }
    
    console.log('🔍 Test için kullanılacak vardiya:', {
      id: latestShift._id,
      title: latestShift.title,
      groups: latestShift.shiftGroups?.length || 0
    });
    
    // Test için çalışan isimlerini kontrol et
    const employeeTestResults = [];
    latestShift.shiftGroups?.forEach((group, groupIndex) => {
      group.shifts?.forEach((shift, shiftIndex) => {
        shift.employees?.forEach((emp, empIndex) => {
          const resolvedName = getEmployeeName(emp);
          employeeTestResults.push({
            groupIndex,
            groupName: group.groupName,
            shiftIndex,
            timeSlot: shift.timeSlot,
            empIndex,
            directName: emp.name,
            populatedName: emp.employeeId?.adSoyad,
            resolvedName,
            isResolved: resolvedName !== 'İsim Bulunamadı'
          });
        });
      });
    });
    
    const successfulResolves = employeeTestResults.filter(r => r.isResolved).length;
    const totalEmployees = employeeTestResults.length;
    
    res.json({
      success: true,
      message: 'Excel export test tamamlandı',
      testResults: {
        shiftId: latestShift._id,
        shiftTitle: latestShift.title,
        totalEmployees,
        successfulResolves,
        failedResolves: totalEmployees - successfulResolves,
        successRate: totalEmployees > 0 ? Math.round((successfulResolves / totalEmployees) * 100) : 0,
        employeeDetails: employeeTestResults
      },
      recommendations: [
        totalEmployees === 0 ? '⚠️ Vardiyada çalışan bulunamadı' : null,
        successfulResolves < totalEmployees ? '⚠️ Bazı çalışan isimleri çözümlenemedi' : null,
        successfulResolves === totalEmployees ? '✅ Tüm çalışan isimleri başarıyla çözümlendi' : null
      ].filter(Boolean)
    });
    
  } catch (error) {
    console.error('❌ Excel export test hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel export test başarısız',
      error: error.message
    });
  }
});

// 🚌 Vardiya Tabanlı Otomatik Servis Listesi - YENİ ÖZELLİK!
router.post('/export/shift-service-schedule', async (req, res) => {
  try {
    const { shiftId } = req.body;
    
    if (!shiftId) {
      return res.status(400).json({
        success: false,
        message: 'Vardiya ID\'si gerekli'
      });
    }

    console.log('🚌 Vardiya tabanlı servis listesi oluşturuluyor, shiftId:', shiftId);

    // 🔧 Vardiya bilgilerini çek
    const shift = await Shift.findById(shiftId)
      .populate({
        path: 'shiftGroups.shifts.employees.employeeId',
        select: 'adSoyad firstName lastName departman pozisyon lokasyon durum servisGuzergahi durak cepTelefonu'
      })
      .populate({
        path: 'specialGroups.employees.employeeId', 
        select: 'adSoyad firstName lastName departman pozisyon lokasyon durum servisGuzergahi durak cepTelefonu'
      });
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Vardiya bulunamadı'
      });
    }

    console.log('🔍 Vardiya bulundu:', shift.title);

    // 🚌 Tüm çalışanları topla ve servis kullanıp kullanmadıklarını kontrol et
    const allEmployees = [];
    const serviceUsers = {};
    const nonServiceUsers = [];

    // Normal gruplardan çalışanları topla
    shift.shiftGroups.forEach(group => {
      group.shifts.forEach(shiftTime => {
        shiftTime.employees.forEach(emp => {
          const employee = emp.employeeId;
          if (employee) {
            const employeeName = employee.adSoyad || `${employee.firstName} ${employee.lastName}`;
            const employeeData = {
              name: employeeName,
              department: employee.departman,
              position: employee.pozisyon,
              location: employee.lokasyon,
              phone: employee.cepTelefonu,
              timeSlot: shiftTime.timeSlot,
              groupName: group.groupName,
              serviceRoute: employee.servisGuzergahi,
              stopName: employee.durak
            };

            allEmployees.push(employeeData);

            // Servis kullanıyor mu kontrol et
            if (employee.servisGuzergahi && employee.servisGuzergahi.trim() !== '') {
              if (!serviceUsers[employee.servisGuzergahi]) {
                serviceUsers[employee.servisGuzergahi] = [];
              }
              serviceUsers[employee.servisGuzergahi].push(employeeData);
            } else {
              nonServiceUsers.push(employeeData);
            }
          }
        });
      });
    });

    // Özel gruplardan çalışanları topla
    shift.specialGroups?.forEach(group => {
      group.employees?.forEach(emp => {
        const employee = emp.employeeId;
        if (employee) {
          const employeeName = employee.adSoyad || `${employee.firstName} ${employee.lastName}`;
          const employeeData = {
            name: employeeName,
            department: employee.departman,
            position: employee.pozisyon,
            location: employee.lokasyon,
            phone: employee.cepTelefonu,
            timeSlot: 'Özel Grup',
            groupName: group.groupName,
            serviceRoute: employee.servisGuzergahi,
            stopName: employee.durak
          };

          allEmployees.push(employeeData);

          if (employee.servisGuzergahi && employee.servisGuzergahi.trim() !== '') {
            if (!serviceUsers[employee.servisGuzergahi]) {
              serviceUsers[employee.servisGuzergahi] = [];
            }
            serviceUsers[employee.servisGuzergahi].push(employeeData);
          } else {
            nonServiceUsers.push(employeeData);
          }
        }
      });
    });

    console.log(`📊 Toplam ${allEmployees.length} çalışan, ${Object.keys(serviceUsers).length} farklı güzergah, ${nonServiceUsers.length} kendi aracı`);

    // 🚌 Güzergah bilgilerini ServiceRoute'tan çek
    const routeDetails = {};
    for (const routeName of Object.keys(serviceUsers)) {
      const route = await ServiceRoute.findOne({ 
        routeName: routeName,
        status: 'AKTIF' 
      }).select('routeName stops routeCode color');
      
      if (route) {
        routeDetails[routeName] = route;
      }
    }

    // 📊 Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Çanga Savunma Endüstrisi';
    workbook.created = new Date();

    // 📋 Ana Sayfa - Genel Bakış
    const summarySheet = workbook.addWorksheet('Servis Özeti');
    let currentRow = 1;

    // Başlık
    summarySheet.mergeCells(`A${currentRow}:H${currentRow}`);
    const titleCell = summarySheet.getCell(`A${currentRow}`);
    titleCell.value = 'ÇANGA SAVUNMA ENDÜSTRİSİ - VARDİYA SERVİS PROGRAMI';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
    titleCell.border = {
      top: { style: 'thick' }, left: { style: 'thick' },
      bottom: { style: 'thick' }, right: { style: 'thick' }
    };
    summarySheet.getRow(currentRow).height = 30;
    currentRow++;

    // Vardiya bilgileri
    summarySheet.mergeCells(`A${currentRow}:H${currentRow}`);
    const shiftInfoCell = summarySheet.getCell(`A${currentRow}`);
    const shiftDate = new Date(shift.startDate).toLocaleDateString('tr-TR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
    });
    shiftInfoCell.value = `📅 ${shift.title} - ${shiftDate} (${shift.location})`;
    shiftInfoCell.font = { size: 12, bold: true };
    shiftInfoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    shiftInfoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
    currentRow += 2;

    // İstatistikler tablosu
    const statsHeaders = ['Kategori', 'Adet', 'Yüzde'];
    statsHeaders.forEach((header, index) => {
      const cell = summarySheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    currentRow++;

    // İstatistik verileri
    const totalServiceUsers = Object.values(serviceUsers).flat().length;
    const stats = [
      ['Toplam Çalışan', allEmployees.length, '100%'],
      ['Servis Kullanan', totalServiceUsers, `${Math.round((totalServiceUsers / allEmployees.length) * 100)}%`],
      ['Kendi Aracı', nonServiceUsers.length, `${Math.round((nonServiceUsers.length / allEmployees.length) * 100)}%`],
      ['Güzergah Sayısı', Object.keys(serviceUsers).length, '-']
    ];

    stats.forEach(([category, count, percentage]) => {
      summarySheet.getCell(currentRow, 1).value = category;
      summarySheet.getCell(currentRow, 2).value = count;
      summarySheet.getCell(currentRow, 3).value = percentage;
      
      for (let col = 1; col <= 3; col++) {
        const cell = summarySheet.getCell(currentRow, col);
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' };
      }
      currentRow++;
    });

    currentRow += 2;

    // Güzergah listesi
    summarySheet.getCell(currentRow, 1).value = 'GÜZERGAHLAR:';
    summarySheet.getCell(currentRow, 1).font = { bold: true, size: 12 };
    currentRow++;

    Object.keys(serviceUsers).sort().forEach((routeName, index) => {
      const routeEmployees = serviceUsers[routeName];
      summarySheet.getCell(currentRow, 1).value = `${index + 1}. ${routeName}`;
      summarySheet.getCell(currentRow, 2).value = `${routeEmployees.length} çalışan`;
      summarySheet.getCell(currentRow, 1).font = { bold: true };
      summarySheet.getCell(currentRow, 2).font = { color: { argb: 'FF1976D2' } };
      currentRow++;
    });

    // Sütun genişlikleri
    summarySheet.columns = [
      { width: 30 }, { width: 15 }, { width: 15 }
    ];

    // 🚌 Her güzergah için ayrı sayfa oluştur
    Object.keys(serviceUsers).sort().forEach((routeName, routeIndex) => {
      const routeEmployees = serviceUsers[routeName];
      const route = routeDetails[routeName];
      
      // Güzergah adını temizle (Excel sayfa adı max 31 karakter)
      let sheetName = routeName;
      if (sheetName.length > 31) {
        sheetName = sheetName.substring(0, 28) + '...';
      }
      
      console.log(`📄 ${routeIndex + 1}. Güzergah sayfası: ${sheetName}`);
      
      const routeSheet = workbook.addWorksheet(sheetName);
      let routeRow = 1;
      
      // Güzergah başlığı
      routeSheet.mergeCells(`A${routeRow}:G${routeRow}`);
      const routeTitleCell = routeSheet.getCell(`A${routeRow}`);
      routeTitleCell.value = `🚌 ${routeName} SERVİS PROGRAMI`;
      routeTitleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      routeTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      routeTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
      routeTitleCell.border = {
        top: { style: 'thick' }, left: { style: 'thick' },
        bottom: { style: 'thick' }, right: { style: 'thick' }
      };
      routeSheet.getRow(routeRow).height = 25;
      routeRow++;

      // Tarih ve vardiya bilgisi
      routeSheet.mergeCells(`A${routeRow}:G${routeRow}`);
      const routeDateCell = routeSheet.getCell(`A${routeRow}`);
      routeDateCell.value = `📅 ${shiftDate} - ${shift.title} (${routeEmployees.length} yolcu)`;
      routeDateCell.font = { size: 11, bold: true };
      routeDateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      routeDateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
      routeRow += 2;

      // Duraklar (varsa)
      if (route && route.stops && route.stops.length > 0) {
        routeSheet.getCell(routeRow, 1).value = 'DURAKLAR:';
        routeSheet.getCell(routeRow, 1).font = { bold: true, size: 11 };
        routeRow++;

        const sortedStops = route.stops.sort((a, b) => a.order - b.order);
        sortedStops.forEach((stop, index) => {
          routeSheet.getCell(routeRow, 1).value = `${index + 1}. ${stop.name}`;
          routeSheet.getCell(routeRow, 1).font = { size: 10 };
          routeRow++;
        });
        routeRow++;
      }

      // Yolcu listesi başlığı
      const headers = ['Sıra', 'Ad Soyad', 'Departman', 'Pozisyon', 'Vardiya Saati', 'Durak', 'Telefon'];
      headers.forEach((header, index) => {
        const cell = routeSheet.getCell(routeRow, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
      routeSheet.getRow(routeRow).height = 25;
      routeRow++;

      // Yolcuları vardiya saatine göre grupla
      const employeesByTime = {};
      routeEmployees.forEach(emp => {
        if (!employeesByTime[emp.timeSlot]) {
          employeesByTime[emp.timeSlot] = [];
        }
        employeesByTime[emp.timeSlot].push(emp);
      });

      // Her vardiya saati için yolcuları listele
      Object.keys(employeesByTime).sort().forEach(timeSlot => {
        const timeEmployees = employeesByTime[timeSlot];
        
        // Vardiya saati başlığı
        routeSheet.mergeCells(`A${routeRow}:G${routeRow}`);
        const timeHeader = routeSheet.getCell(`A${routeRow}`);
        const workHours = calculateWorkingHours(timeSlot);
        timeHeader.value = `⏰ ${timeSlot} (${timeEmployees.length} kişi)                                                    ${workHours}`;
        timeHeader.font = { bold: true, color: { argb: 'FFFF6B00' } };
        timeHeader.alignment = { horizontal: 'left', vertical: 'middle' };
        timeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } };
        routeRow++;

        // Çalışanları alfabetik sırala ve ekle
        timeEmployees.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        
        timeEmployees.forEach((employee, index) => {
          const rowData = [
            index + 1,
            employee.name,
            employee.department || '-',
            employee.position || '-',
            employee.timeSlot,
            employee.stopName || 'Belirtilmemiş',
            employee.phone || '-'
          ];

          rowData.forEach((data, colIndex) => {
            const cell = routeSheet.getCell(routeRow, colIndex + 1);
            cell.value = data;
            cell.font = { size: 10 };
            cell.alignment = { 
              horizontal: colIndex === 0 ? 'center' : 'left', 
              vertical: 'middle' 
            };
            cell.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' }
            };
            
            // Zebra striping
            if (index % 2 === 1) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            }
          });
          routeSheet.getRow(routeRow).height = 20;
          routeRow++;
        });
        
        routeRow++; // Vardiya grupları arası boşluk
      });

      // Sütun genişlikleri
      routeSheet.columns = [
        { width: 8 },  // Sıra
        { width: 25 }, // Ad Soyad
        { width: 20 }, // Departman
        { width: 25 }, // Pozisyon
        { width: 15 }, // Vardiya Saati
        { width: 20 }, // Durak
        { width: 15 }  // Telefon
      ];

      console.log(`✅ ${sheetName} güzergah sayfası tamamlandı (${routeEmployees.length} yolcu)`);
    });

    // 🚗 Kendi Aracı Sayfası (varsa)
    if (nonServiceUsers.length > 0) {
      console.log('📄 Kendi aracı sayfası oluşturuluyor...');
      
      const ownCarSheet = workbook.addWorksheet('Kendi Aracı');
      let ownCarRow = 1;

      // Başlık
      ownCarSheet.mergeCells(`A${ownCarRow}:F${ownCarRow}`);
      const ownCarTitleCell = ownCarSheet.getCell(`A${ownCarRow}`);
      ownCarTitleCell.value = `🚗 KENDİ ARACI İLE GELENLER (${nonServiceUsers.length} kişi)`;
      ownCarTitleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      ownCarTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ownCarTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B00' } };
      ownCarSheet.getRow(ownCarRow).height = 25;
      ownCarRow++;

      // Tarih bilgisi
      ownCarSheet.mergeCells(`A${ownCarRow}:F${ownCarRow}`);
      const ownCarDateCell = ownCarSheet.getCell(`A${ownCarRow}`);
      ownCarDateCell.value = `📅 ${shiftDate} - ${shift.title}`;
      ownCarDateCell.font = { size: 11, bold: true };
      ownCarDateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ownCarDateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } };
      ownCarRow += 2;

      // Tablo başlığı
      const ownCarHeaders = ['Sıra', 'Ad Soyad', 'Departman', 'Pozisyon', 'Vardiya Saati', 'Telefon'];
      ownCarHeaders.forEach((header, index) => {
        const cell = ownCarSheet.getCell(ownCarRow, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B00' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
      ownCarSheet.getRow(ownCarRow).height = 25;
      ownCarRow++;

      // Kendi aracı kullananları vardiya saatine göre grupla
      const ownCarByTime = {};
      nonServiceUsers.forEach(emp => {
        if (!ownCarByTime[emp.timeSlot]) {
          ownCarByTime[emp.timeSlot] = [];
        }
        ownCarByTime[emp.timeSlot].push(emp);
      });

      // Her vardiya saati için listele
      Object.keys(ownCarByTime).sort().forEach(timeSlot => {
        const timeEmployees = ownCarByTime[timeSlot];
        
        // Vardiya saati başlığı
        ownCarSheet.mergeCells(`A${ownCarRow}:F${ownCarRow}`);
        const timeHeader = ownCarSheet.getCell(`A${ownCarRow}`);
        const workHours = calculateWorkingHours(timeSlot);
        timeHeader.value = `⏰ ${timeSlot} (${timeEmployees.length} kişi)                                                    ${workHours}`;
        timeHeader.font = { bold: true, color: { argb: 'FFFF6B00' } };
        timeHeader.alignment = { horizontal: 'left', vertical: 'middle' };
        timeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } };
        ownCarRow++;

        // Çalışanları alfabetik sırala ve ekle
        timeEmployees.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        
        timeEmployees.forEach((employee, index) => {
          const rowData = [
            index + 1,
            employee.name,
            employee.department || '-',
            employee.position || '-',
            employee.timeSlot,
            employee.phone || '-'
          ];

          rowData.forEach((data, colIndex) => {
            const cell = ownCarSheet.getCell(ownCarRow, colIndex + 1);
            cell.value = data;
            cell.font = { size: 10 };
            cell.alignment = { 
              horizontal: colIndex === 0 ? 'center' : 'left', 
              vertical: 'middle' 
            };
            cell.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' }
            };
            
            // Zebra striping
            if (index % 2 === 1) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
            }
          });
          ownCarSheet.getRow(ownCarRow).height = 20;
          ownCarRow++;
        });
        
        ownCarRow++; // Vardiya grupları arası boşluk
      });

      // Sütun genişlikleri
      ownCarSheet.columns = [
        { width: 8 },  // Sıra
        { width: 25 }, // Ad Soyad
        { width: 20 }, // Departman
        { width: 25 }, // Pozisyon
        { width: 15 }, // Vardiya Saati
        { width: 15 }  // Telefon
      ];

      console.log(`✅ Kendi aracı sayfası tamamlandı (${nonServiceUsers.length} çalışan)`);
    }

    // Dosyayı buffer olarak al
    const buffer = await workbook.xlsx.writeBuffer();

    // HTTP response headers
    const safeLocation = shift.location.replace(/[^\w\-]/g, '_');
    const safeDate = shift.startDate.toISOString().split('T')[0];
    const totalRoutes = Object.keys(serviceUsers).length;
    const safeFilename = `Canga_Vardiya_Servis_Programi_${safeLocation}_${safeDate}_${totalRoutes}Guzergah_${allEmployees.length}Calisan.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeFilename}"`
    });

    res.send(buffer);

    console.log(`✅ Vardiya tabanlı servis programı oluşturuldu: ${allEmployees.length} çalışan, ${totalRoutes} güzergah, ${nonServiceUsers.length} kendi aracı`);

  } catch (error) {
    console.error('❌ Vardiya servis programı export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Vardiya servis programı oluşturulamadı',
      error: error.message
    });
  }
});

// 🚌 Vardiya Tabanlı Otomatik Servis Listesi - YENİ ÖZELLİK!
router.post('/export/shift-service-schedule', async (req, res) => {
  try {
    const { shiftId } = req.body;
    
    if (!shiftId) {
      return res.status(400).json({
        success: false,
        message: 'Vardiya ID\'si gerekli'
      });
    }

    console.log('🚌 Vardiya tabanlı servis listesi oluşturuluyor, shiftId:', shiftId);

    // 🔧 Vardiya bilgilerini çek
    const shift = await Shift.findById(shiftId)
      .populate({
        path: 'shiftGroups.shifts.employees.employeeId',
        select: 'adSoyad firstName lastName departman pozisyon lokasyon durum servisGuzergahi durak cepTelefonu'
      })
      .populate({
        path: 'specialGroups.employees.employeeId', 
        select: 'adSoyad firstName lastName departman pozisyon lokasyon durum servisGuzergahi durak cepTelefonu'
      });
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Vardiya bulunamadı'
      });
    }

    console.log('🔍 Vardiya bulundu:', shift.title);

    // 🚌 Tüm çalışanları topla ve servis kullanıp kullanmadıklarını kontrol et
    const allEmployees = [];
    const serviceUsers = {};
    const nonServiceUsers = [];

    // Normal gruplardan çalışanları topla
    shift.shiftGroups.forEach(group => {
      group.shifts.forEach(shiftTime => {
        shiftTime.employees.forEach(emp => {
          const employee = emp.employeeId;
          if (employee) {
            const employeeName = employee.adSoyad || `${employee.firstName} ${employee.lastName}`;
            const employeeData = {
              name: employeeName,
              department: employee.departman,
              position: employee.pozisyon,
              location: employee.lokasyon,
              phone: employee.cepTelefonu,
              timeSlot: shiftTime.timeSlot,
              groupName: group.groupName,
              serviceRoute: employee.servisGuzergahi,
              stopName: employee.durak
            };

            allEmployees.push(employeeData);

            // Servis kullanıyor mu kontrol et
            if (employee.servisGuzergahi && employee.servisGuzergahi.trim() !== '') {
              if (!serviceUsers[employee.servisGuzergahi]) {
                serviceUsers[employee.servisGuzergahi] = [];
              }
              serviceUsers[employee.servisGuzergahi].push(employeeData);
            } else {
              nonServiceUsers.push(employeeData);
            }
          }
        });
      });
    });

    // Özel gruplardan çalışanları topla
    shift.specialGroups?.forEach(group => {
      group.employees?.forEach(emp => {
        const employee = emp.employeeId;
        if (employee) {
          const employeeName = employee.adSoyad || `${employee.firstName} ${employee.lastName}`;
          const employeeData = {
            name: employeeName,
            department: employee.departman,
            position: employee.pozisyon,
            location: employee.lokasyon,
            phone: employee.cepTelefonu,
            timeSlot: 'Özel Grup',
            groupName: group.groupName,
            serviceRoute: employee.servisGuzergahi,
            stopName: employee.durak
          };

          allEmployees.push(employeeData);

          if (employee.servisGuzergahi && employee.servisGuzergahi.trim() !== '') {
            if (!serviceUsers[employee.servisGuzergahi]) {
              serviceUsers[employee.servisGuzergahi] = [];
            }
            serviceUsers[employee.servisGuzergahi].push(employeeData);
          } else {
            nonServiceUsers.push(employeeData);
          }
        }
      });
    });

    console.log(`📊 Toplam ${allEmployees.length} çalışan, ${Object.keys(serviceUsers).length} farklı güzergah, ${nonServiceUsers.length} kendi aracı`);

    // 🚌 Güzergah bilgilerini ServiceRoute'tan çek
    const routeDetails = {};
    for (const routeName of Object.keys(serviceUsers)) {
      const route = await ServiceRoute.findOne({ 
        routeName: routeName,
        status: 'AKTIF' 
      }).select('routeName stops routeCode color');
      
      if (route) {
        routeDetails[routeName] = route;
      }
    }

    // 📊 Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Çanga Savunma Endüstrisi';
    workbook.created = new Date();

    // 📋 Ana Sayfa - Genel Bakış
    const summarySheet = workbook.addWorksheet('Servis Özeti');
    let currentRow = 1;

    // Başlık
    summarySheet.mergeCells(`A${currentRow}:H${currentRow}`);
    const titleCell = summarySheet.getCell(`A${currentRow}`);
    titleCell.value = 'ÇANGA SAVUNMA ENDÜSTRİSİ - VARDİYA SERVİS PROGRAMI';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
    titleCell.border = {
      top: { style: 'thick' }, left: { style: 'thick' },
      bottom: { style: 'thick' }, right: { style: 'thick' }
    };
    summarySheet.getRow(currentRow).height = 30;
    currentRow++;

    // Vardiya bilgileri
    summarySheet.mergeCells(`A${currentRow}:H${currentRow}`);
    const shiftInfoCell = summarySheet.getCell(`A${currentRow}`);
    const shiftDate = new Date(shift.startDate).toLocaleDateString('tr-TR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' 
    });
    shiftInfoCell.value = `📅 ${shift.title} - ${shiftDate} (${shift.location})`;
    shiftInfoCell.font = { size: 12, bold: true };
    shiftInfoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    shiftInfoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
    currentRow += 2;

    // İstatistikler tablosu
    const statsHeaders = ['Kategori', 'Adet', 'Yüzde'];
    statsHeaders.forEach((header, index) => {
      const cell = summarySheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    currentRow++;

    // İstatistik verileri
    const totalServiceUsers = Object.values(serviceUsers).flat().length;
    const stats = [
      ['Toplam Çalışan', allEmployees.length, '100%'],
      ['Servis Kullanan', totalServiceUsers, `${Math.round((totalServiceUsers / allEmployees.length) * 100)}%`],
      ['Kendi Aracı', nonServiceUsers.length, `${Math.round((nonServiceUsers.length / allEmployees.length) * 100)}%`],
      ['Güzergah Sayısı', Object.keys(serviceUsers).length, '-']
    ];

    stats.forEach(([category, count, percentage]) => {
      summarySheet.getCell(currentRow, 1).value = category;
      summarySheet.getCell(currentRow, 2).value = count;
      summarySheet.getCell(currentRow, 3).value = percentage;
      
      for (let col = 1; col <= 3; col++) {
        const cell = summarySheet.getCell(currentRow, col);
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' };
      }
      currentRow++;
    });

    currentRow += 2;

    // Güzergah listesi
    summarySheet.getCell(currentRow, 1).value = 'GÜZERGAHLAR:';
    summarySheet.getCell(currentRow, 1).font = { bold: true, size: 12 };
    currentRow++;

    Object.keys(serviceUsers).sort().forEach((routeName, index) => {
      const routeEmployees = serviceUsers[routeName];
      summarySheet.getCell(currentRow, 1).value = `${index + 1}. ${routeName}`;
      summarySheet.getCell(currentRow, 2).value = `${routeEmployees.length} çalışan`;
      summarySheet.getCell(currentRow, 1).font = { bold: true };
      summarySheet.getCell(currentRow, 2).font = { color: { argb: 'FF1976D2' } };
      currentRow++;
    });

    // Sütun genişlikleri
    summarySheet.columns = [
      { width: 30 }, { width: 15 }, { width: 15 }
    ];

    // 🚌 Her güzergah için ayrı sayfa oluştur
    Object.keys(serviceUsers).sort().forEach((routeName, routeIndex) => {
      const routeEmployees = serviceUsers[routeName];
      const route = routeDetails[routeName];
      
      // Güzergah adını temizle (Excel sayfa adı max 31 karakter)
      let sheetName = routeName;
      if (sheetName.length > 31) {
        sheetName = sheetName.substring(0, 28) + '...';
      }
      
      console.log(`📄 ${routeIndex + 1}. Güzergah sayfası: ${sheetName}`);
      
      const routeSheet = workbook.addWorksheet(sheetName);
      let routeRow = 1;
      
      // Güzergah başlığı
      routeSheet.mergeCells(`A${routeRow}:G${routeRow}`);
      const routeTitleCell = routeSheet.getCell(`A${routeRow}`);
      routeTitleCell.value = `🚌 ${routeName} SERVİS PROGRAMI`;
      routeTitleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      routeTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      routeTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
      routeTitleCell.border = {
        top: { style: 'thick' }, left: { style: 'thick' },
        bottom: { style: 'thick' }, right: { style: 'thick' }
      };
      routeSheet.getRow(routeRow).height = 25;
      routeRow++;

      // Tarih ve vardiya bilgisi
      routeSheet.mergeCells(`A${routeRow}:G${routeRow}`);
      const routeDateCell = routeSheet.getCell(`A${routeRow}`);
      routeDateCell.value = `📅 ${shiftDate} - ${shift.title} (${routeEmployees.length} yolcu)`;
      routeDateCell.font = { size: 11, bold: true };
      routeDateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      routeDateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
      routeRow += 2;

      // Duraklar (varsa)
      if (route && route.stops && route.stops.length > 0) {
        routeSheet.getCell(routeRow, 1).value = 'DURAKLAR:';
        routeSheet.getCell(routeRow, 1).font = { bold: true, size: 11 };
        routeRow++;

        const sortedStops = route.stops.sort((a, b) => a.order - b.order);
        sortedStops.forEach((stop, index) => {
          routeSheet.getCell(routeRow, 1).value = `${index + 1}. ${stop.name}`;
          routeSheet.getCell(routeRow, 1).font = { size: 10 };
          routeRow++;
        });
        routeRow++;
      }

      // Yolcu listesi başlığı
      const headers = ['Sıra', 'Ad Soyad', 'Departman', 'Pozisyon', 'Vardiya Saati', 'Durak', 'Telefon'];
      headers.forEach((header, index) => {
        const cell = routeSheet.getCell(routeRow, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
      routeSheet.getRow(routeRow).height = 25;
      routeRow++;

      // Yolcuları vardiya saatine göre grupla
      const employeesByTime = {};
      routeEmployees.forEach(emp => {
        if (!employeesByTime[emp.timeSlot]) {
          employeesByTime[emp.timeSlot] = [];
        }
        employeesByTime[emp.timeSlot].push(emp);
      });

      // Her vardiya saati için yolcuları listele
      Object.keys(employeesByTime).sort().forEach(timeSlot => {
        const timeEmployees = employeesByTime[timeSlot];
        
        // Vardiya saati başlığı
        routeSheet.mergeCells(`A${routeRow}:G${routeRow}`);
        const timeHeader = routeSheet.getCell(`A${routeRow}`);
        const workHours = calculateWorkingHours(timeSlot);
        timeHeader.value = `⏰ ${timeSlot} (${timeEmployees.length} kişi)                                                    ${workHours}`;
        timeHeader.font = { bold: true, color: { argb: 'FFFF6B00' } };
        timeHeader.alignment = { horizontal: 'left', vertical: 'middle' };
        timeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } };
        routeRow++;

        // Çalışanları alfabetik sırala ve ekle
        timeEmployees.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        
        timeEmployees.forEach((employee, index) => {
          const rowData = [
            index + 1,
            employee.name,
            employee.department || '-',
            employee.position || '-',
            employee.timeSlot,
            employee.stopName || 'Belirtilmemiş',
            employee.phone || '-'
          ];

          rowData.forEach((data, colIndex) => {
            const cell = routeSheet.getCell(routeRow, colIndex + 1);
            cell.value = data;
            cell.font = { size: 10 };
            cell.alignment = { 
              horizontal: colIndex === 0 ? 'center' : 'left', 
              vertical: 'middle' 
            };
            cell.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' }
            };
            
            // Zebra striping
            if (index % 2 === 1) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            }
          });
          routeSheet.getRow(routeRow).height = 20;
          routeRow++;
        });
        
        routeRow++; // Vardiya grupları arası boşluk
      });

      // Sütun genişlikleri
      routeSheet.columns = [
        { width: 8 },  // Sıra
        { width: 25 }, // Ad Soyad
        { width: 20 }, // Departman
        { width: 25 }, // Pozisyon
        { width: 15 }, // Vardiya Saati
        { width: 20 }, // Durak
        { width: 15 }  // Telefon
      ];

      console.log(`✅ ${sheetName} güzergah sayfası tamamlandı (${routeEmployees.length} yolcu)`);
    });

    // 🚗 Kendi Aracı Sayfası (varsa)
    if (nonServiceUsers.length > 0) {
      console.log('📄 Kendi aracı sayfası oluşturuluyor...');
      
      const ownCarSheet = workbook.addWorksheet('Kendi Aracı');
      let ownCarRow = 1;

      // Başlık
      ownCarSheet.mergeCells(`A${ownCarRow}:F${ownCarRow}`);
      const ownCarTitleCell = ownCarSheet.getCell(`A${ownCarRow}`);
      ownCarTitleCell.value = `🚗 KENDİ ARACI İLE GELENLER (${nonServiceUsers.length} kişi)`;
      ownCarTitleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      ownCarTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ownCarTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B00' } };
      ownCarSheet.getRow(ownCarRow).height = 25;
      ownCarRow++;

      // Tarih bilgisi
      ownCarSheet.mergeCells(`A${ownCarRow}:F${ownCarRow}`);
      const ownCarDateCell = ownCarSheet.getCell(`A${ownCarRow}`);
      ownCarDateCell.value = `📅 ${shiftDate} - ${shift.title}`;
      ownCarDateCell.font = { size: 11, bold: true };
      ownCarDateCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ownCarDateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } };
      ownCarRow += 2;

      // Tablo başlığı
      const ownCarHeaders = ['Sıra', 'Ad Soyad', 'Departman', 'Pozisyon', 'Vardiya Saati', 'Telefon'];
      ownCarHeaders.forEach((header, index) => {
        const cell = ownCarSheet.getCell(ownCarRow, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B00' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
      ownCarSheet.getRow(ownCarRow).height = 25;
      ownCarRow++;

      // Kendi aracı kullananları vardiya saatine göre grupla
      const ownCarByTime = {};
      nonServiceUsers.forEach(emp => {
        if (!ownCarByTime[emp.timeSlot]) {
          ownCarByTime[emp.timeSlot] = [];
        }
        ownCarByTime[emp.timeSlot].push(emp);
      });

      // Her vardiya saati için listele
      Object.keys(ownCarByTime).sort().forEach(timeSlot => {
        const timeEmployees = ownCarByTime[timeSlot];
        
        // Vardiya saati başlığı
        ownCarSheet.mergeCells(`A${ownCarRow}:F${ownCarRow}`);
        const timeHeader = ownCarSheet.getCell(`A${ownCarRow}`);
        const workHours = calculateWorkingHours(timeSlot);
        timeHeader.value = `⏰ ${timeSlot} (${timeEmployees.length} kişi)                                                    ${workHours}`;
        timeHeader.font = { bold: true, color: { argb: 'FFFF6B00' } };
        timeHeader.alignment = { horizontal: 'left', vertical: 'middle' };
        timeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } };
        ownCarRow++;

        // Çalışanları alfabetik sırala ve ekle
        timeEmployees.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        
        timeEmployees.forEach((employee, index) => {
          const rowData = [
            index + 1,
            employee.name,
            employee.department || '-',
            employee.position || '-',
            employee.timeSlot,
            employee.phone || '-'
          ];

          rowData.forEach((data, colIndex) => {
            const cell = ownCarSheet.getCell(ownCarRow, colIndex + 1);
            cell.value = data;
            cell.font = { size: 10 };
            cell.alignment = { 
              horizontal: colIndex === 0 ? 'center' : 'left', 
              vertical: 'middle' 
            };
            cell.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' }
            };
            
            // Zebra striping
            if (index % 2 === 1) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
            }
          });
          ownCarSheet.getRow(ownCarRow).height = 20;
          ownCarRow++;
        });
        
        ownCarRow++; // Vardiya grupları arası boşluk
      });

      // Sütun genişlikleri
      ownCarSheet.columns = [
        { width: 8 },  // Sıra
        { width: 25 }, // Ad Soyad
        { width: 20 }, // Departman
        { width: 25 }, // Pozisyon
        { width: 15 }, // Vardiya Saati
        { width: 15 }  // Telefon
      ];

      console.log(`✅ Kendi aracı sayfası tamamlandı (${nonServiceUsers.length} çalışan)`);
    }

    // Dosyayı buffer olarak al
    const buffer = await workbook.xlsx.writeBuffer();

    // HTTP response headers
    const safeLocation = shift.location.replace(/[^\w\-]/g, '_');
    const safeDate = shift.startDate.toISOString().split('T')[0];
    const totalRoutes = Object.keys(serviceUsers).length;
    const safeFilename = `Canga_Vardiya_Servis_Programi_${safeLocation}_${safeDate}_${totalRoutes}Guzergah_${allEmployees.length}Calisan.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeFilename}"`
    });

    res.send(buffer);

    console.log(`✅ Vardiya tabanlı servis programı oluşturuldu: ${allEmployees.length} çalışan, ${totalRoutes} güzergah, ${nonServiceUsers.length} kendi aracı`);

  } catch (error) {
    console.error('❌ Vardiya servis programı export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Vardiya servis programı oluşturulamadı',
      error: error.message
    });
  }
});

module.exports = router; 