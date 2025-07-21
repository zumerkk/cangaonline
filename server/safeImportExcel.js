const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Tarih formatını düzelt
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Eğer zaten Date objesi ise
  if (dateStr instanceof Date) return dateStr;
  
  // String ise parse et
  if (typeof dateStr === 'string') {
    // DD.MM.YYYY formatı
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
    
    // YYYY-MM-DD formatı
    if (dateStr.includes('-')) {
      return new Date(dateStr);
    }
  }
  
  // Excel tarih sayısı (1900 sisteminden)
  if (typeof dateStr === 'number') {
    // Excel tarihi JavaScript tarihine çevir
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateStr * 24 * 60 * 60 * 1000);
  }
  
  return null;
};

// Telefon numarasını temizle
const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  return String(phone).replace(/\s/g, ' ').trim();
};

// Ana import fonksiyonu
const safeImportExcel = async () => {
  let connection = null;
  
  try {
    console.log('🔄 MongoDB bağlantısı kuruluyor...');
    connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga_vardiya');
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // Excel dosyasını bul
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    
    if (files.length === 0) {
      throw new Error('uploads klasöründe Excel dosyası bulunamadı!');
    }
    
    const excelFile = files[0]; // İlk dosyayı al
    const filePath = path.join(uploadsDir, excelFile);
    
    console.log(`📄 Excel dosyası bulundu: ${excelFile}`);
    
    // Excel dosyasını oku
    console.log('📖 Excel dosyası okunuyor...');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Excel verisini JSON'a çevir
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: false
    });
    
    if (jsonData.length === 0) {
      throw new Error('Excel dosyası boş!');
    }
    
    console.log(`📊 ${jsonData.length - 1} satır veri bulundu (başlık hariç)\n`);
    
    // Başlık satırını al ve kolon indexlerini belirle
    const headers = jsonData[0];
    const columnIndexes = {};
    
    // Başlıkları olduğu gibi sakla (büyük/küçük harf ve boşluklar dahil)
    headers.forEach((header, index) => {
      if (header) {
        columnIndexes[header.toString()] = index;
      }
    });
    
    console.log('📋 Bulunan kolonlar:', Object.keys(columnIndexes).join(', '));
    
    // ÖNEMLİ: Veritabanını temizleme onayı
    console.log('\n⚠️  DİKKAT: Bu işlem mevcut TÜM çalışan verilerini SİLECEK!');
    console.log('⏰ 5 saniye içinde başlayacak... (İptal etmek için Ctrl+C)\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Veritabanını temizle
    console.log('🗑️  Mevcut çalışan verileri temizleniyor...');
    const deleteResult = await Employee.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} çalışan kaydı silindi\n`);
    
    // Import işlemi
    console.log('💾 Yeni veriler import ediliyor...\n');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Her satırı işle (başlık satırını atla)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Veriyi hazırla - Excel'deki gerçek başlık isimlerini kullan
        const employeeData = {
          adSoyad: row[columnIndexes['AD - SOYAD']] || '',
          tcNo: row[columnIndexes['TC NO']] ? row[columnIndexes['TC NO']].toString() : '',
          cepTelefonu: cleanPhoneNumber(row[columnIndexes['CEP TELEFONU']] || ''),
          dogumTarihi: parseDate(row[columnIndexes['DOĞUM TARİHİ']]),
          departman: row[columnIndexes['DEPARTMAN']] || '',
          iseFabrika: row[columnIndexes['İŞE FABRİKA']] || '',
          pozisyon: row[columnIndexes['POZİSYON']] || 'ÇALIŞAN',
          lokasyon: row[columnIndexes['LOKASYON']] || 'MERKEZ',
          iseGirisTarihi: parseDate(row[columnIndexes['İŞE GİRİŞ TARİHİ']]),
          servisGuzergahi: row[columnIndexes['SERVİS GÜZERGAHI']] || '',
          durak: row[columnIndexes['DURAK']] || '',
          durum: row[columnIndexes['DURUM']] || 'AKTIF'
        };
        
        // Boş ad soyad kontrolü
        if (!employeeData.adSoyad || employeeData.adSoyad.trim() === '') {
          console.log(`⏭️  Satır ${i + 1}: Boş satır, atlanıyor`);
          continue;
        }
        
        // Lokasyon kontrolü ve düzeltme
        if (employeeData.lokasyon) {
          const lokasyonUpper = employeeData.lokasyon.toUpperCase();
          if (lokasyonUpper.includes('MERKEZ')) {
            employeeData.lokasyon = 'MERKEZ';
          } else if (lokasyonUpper.includes('IŞIL') || lokasyonUpper.includes('İŞİL') || lokasyonUpper.includes('İŞL') || lokasyonUpper.includes('ISL')) {
            employeeData.lokasyon = 'İŞL';
          } else if (lokasyonUpper.includes('OSB')) {
            employeeData.lokasyon = 'OSB';
          }
        }
        
        // Durum kontrolü
        if (employeeData.durum) {
          const durumUpper = employeeData.durum.toUpperCase();
          if (!['AKTIF', 'PASIF', 'İZİNLİ', 'AYRILDI'].includes(durumUpper)) {
            employeeData.durum = 'AKTIF';
          } else {
            employeeData.durum = durumUpper;
          }
        }
        
        // Çalışanı kaydet
        const employee = new Employee(employeeData);
        await employee.save();
        
        successCount++;
        console.log(`✅ ${successCount}. ${employeeData.adSoyad} - başarıyla eklendi`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = `Satır ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
    
    // Özet rapor
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT ÖZET RAPORU');
    console.log('='.repeat(60));
    console.log(`✅ Başarılı: ${successCount} çalışan`);
    console.log(`❌ Hatalı: ${errorCount} çalışan`);
    console.log(`📋 Toplam işlenen satır: ${jsonData.length - 1}`);
    
    // Hata detayları
    if (errors.length > 0) {
      console.log('\n❌ HATA DETAYLARI:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
    // Veritabanı kontrolü
    const totalEmployees = await Employee.countDocuments();
    console.log(`\n💾 Veritabanındaki toplam çalışan sayısı: ${totalEmployees}`);
    
    if (totalEmployees === successCount) {
      console.log('\n🎉 TÜM VERİLER BAŞARIYLA AKTARILDI!');
    } else {
      console.log('\n⚠️  DİKKAT: Bazı kayıtlar aktarılamadı. Lütfen hataları kontrol edin.');
    }
    
  } catch (error) {
    console.error('\n❌ KRITIK HATA:', error.message);
    console.error(error.stack);
  } finally {
    // Bağlantıyı kapat
    if (connection) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB bağlantısı kapatıldı');
    }
  }
};

// Script'i başlat
console.log('🚀 GÜVENLİ EXCEL IMPORT İŞLEMİ BAŞLIYOR...\n');
console.log('📌 Not: Bu script veritabanını temizleyip Excel\'deki verileri import edecek.\n');

safeImportExcel()
  .then(() => {
    console.log('\n✅ İşlem tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ İşlem başarısız:', error);
    process.exit(1);
  }); 