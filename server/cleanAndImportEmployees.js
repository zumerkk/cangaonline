const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Employee = require('./models/Employee');
const path = require('path');
require('dotenv').config();

// 🚀 MongoDB'ye bağlan
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 🎯 Ana import fonksiyonu
async function cleanAndImportEmployees(excelPath) {
  try {
    console.log('🧹 TÜM ÇALIŞAN VERİLERİ TEMİZLENİYOR...');
    
    // 1️⃣ Önce TÜM çalışan verilerini temizle
    const deleteResult = await Employee.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} çalışan kaydı silindi!`);
    
    // 2️⃣ Excel dosyasını oku
    console.log(`📊 Excel dosyası okunuyor: ${excelPath}`);
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Excel'i JSON'a çevir
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { 
      raw: false,
      dateNF: 'DD.MM.YYYY' 
    });
    
    console.log(`📋 Toplam ${jsonData.length} kayıt bulundu`);
    
    // 3️⃣ Her bir satırı işle ve kaydet
    let basarili = 0;
    let hatali = 0;
    const hatalar = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Görseldeki başlıklara göre birebir eşleştiriyoruz
        const employeeData = {
          adSoyad: row['AD - SOYAD'] || '', // Zorunlu
          tcNo: row['TC KİMLİK NO'] || '', // Zorunlu
          cepTelefonu: row['CEP NO'] || '',
          dogumTarihi: parseDate(row['DOĞUM TARİHİ']),
          iseGirisTarihi: parseDate(row['İŞE GİRİŞ TARİHİ']),
          pozisyon: row['GÖREV'] || '', // Zorunlu
          servisGuzergahi: row['SERVİS BİNİŞ NOKTASI'] || '',
          // Eksik olanlar için varsayılanlar:
          departman: '', // Görselde yok, istersen ekleyebilirsin
          iseFabrika: '', // Görselde yok, istersen ekleyebilirsin
          lokasyon: 'MERKEZ', // Görselde yok, istersen ekleyebilirsin
          durak: '', // Görselde yok, istersen ekleyebilirsin
          durum: 'AKTIF' // Görselde yok, istersen ekleyebilirsin
        };
        
        // Boş string'leri kontrol et
        if (!employeeData.adSoyad || employeeData.adSoyad.trim() === '') {
          throw new Error(`Satır ${i + 2}: Ad Soyad boş olamaz`);
        }
        
        // TC No benzersizliğini kontrol et
        if (employeeData.tcNo && employeeData.tcNo.trim() !== '') {
          const mevcutTC = await Employee.findOne({ tcNo: employeeData.tcNo });
          if (mevcutTC) {
            throw new Error(`Satır ${i + 2}: TC No (${employeeData.tcNo}) zaten kayıtlı`);
          }
        }
        
        // Yeni çalışan oluştur ve kaydet
        const newEmployee = new Employee(employeeData);
        await newEmployee.save();
        
        basarili++;
        
        // Her 50 kayıtta bir durum bilgisi ver
        if (basarili % 50 === 0) {
          console.log(`⏳ ${basarili} kayıt başarıyla eklendi...`);
        }
        
      } catch (error) {
        hatali++;
        hatalar.push({
          satir: i + 2, // Excel'de başlık satırı 1, veri 2'den başlar
          adSoyad: row['AD - SOYAD'] || 'Bilinmiyor',
          hata: error.message
        });
      }
    }
    
    // 4️⃣ Sonuçları göster
    console.log('\n🎯 İŞLEM TAMAMLANDI!\n');
    console.log(`✅ Başarılı: ${basarili} kayıt`);
    console.log(`❌ Hatalı: ${hatali} kayıt`);
    
    if (hatalar.length > 0) {
      console.log('\n❗ HATALI KAYITLAR:');
      hatalar.forEach(h => {
        console.log(`  - Satır ${h.satir} (${h.adSoyad}): ${h.hata}`);
      });
    }
    
    // Toplam kayıt sayısını göster
    const toplamKayit = await Employee.countDocuments();
    console.log(`\n📊 Veritabanında toplam ${toplamKayit} çalışan kaydı var.`);
    
  } catch (error) {
    console.error('❌ HATA:', error.message);
    throw error;
  }
}

// 📅 Tarih parse fonksiyonu
function parseDate(dateValue) {
  if (!dateValue) return null;
  
  // Eğer zaten Date object ise
  if (dateValue instanceof Date) return dateValue;
  
  // String ise parse et
  const dateStr = dateValue.toString();
  
  // DD.MM.YYYY formatı
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  
  // DD/MM/YYYY formatı
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  
  // Standart Date parse
  const parsed = new Date(dateStr);
  return isNaN(parsed) ? null : parsed;
}

// 📍 Lokasyon normalizasyonu
function normalizeLokasyon(lokasyon) {
  if (!lokasyon) return 'MERKEZ';
  
  const lok = lokasyon.toString().toUpperCase().trim();
  
  if (lok === 'MERKEZ' || lok.includes('MERKEZ')) return 'MERKEZ';
  if (lok === 'İŞL' || lok === 'ISL' || lok.includes('İŞL')) return 'İŞL';
  if (lok === 'OSB' || lok.includes('OSB')) return 'OSB';
  
  return 'MERKEZ'; // Varsayılan
}

// 📊 Durum normalizasyonu  
function normalizeDurum(durum) {
  if (!durum) return 'AKTIF';
  
  const d = durum.toString().toUpperCase().trim();
  
  if (d === 'AKTIF' || d === 'AKTİF' || d.includes('AKT')) return 'AKTIF';
  if (d === 'PASIF' || d === 'PASİF' || d.includes('PAS')) return 'PASIF';
  if (d === 'İZİNLİ' || d === 'IZINLI' || d.includes('İZİN')) return 'İZİNLİ';
  if (d === 'AYRILDI' || d.includes('AYRIL')) return 'AYRILDI';
  
  return 'AKTIF'; // Varsayılan
}

// 🚀 Script'i çalıştır
if (require.main === module) {
  // Komut satırından dosya yolu al
  const excelPath = process.argv[2];
  
  if (!excelPath) {
    console.error('❌ Kullanım: node cleanAndImportEmployees.js <excel-dosya-yolu>');
    console.error('Örnek: node cleanAndImportEmployees.js uploads/calisanlar.xlsx');
    process.exit(1);
  }
  
  cleanAndImportEmployees(excelPath)
    .then(() => {
      console.log('✅ İşlem başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ İşlem başarısız:', error);
      process.exit(1);
    });
}

module.exports = cleanAndImportEmployees; 