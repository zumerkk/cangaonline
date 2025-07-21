const mongoose = require('mongoose');
const Employee = require('./models/Employee');
require('dotenv').config();

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga_vardiya');
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// Excel'deki çalışan verileri - TÜM LİSTE
const excelData = [
  { adSoyad: "Ali Şah YÖNCÜLER", tcNo: "17020258240", cepTelefonu: "541 804 13 68", dogumTarihi: "31.05.1972", departman: "İŞL FABRİKA", pozisyon: "İŞL FABRİKA ŞEFİ USTABAŞI", lokasyon: "İŞL", servisTarihi: "21.04.2014", servisGuzergahi: "ETİLER", durak: "ETİLER", durum: "AKTIF" },
  { adSoyad: "Muhammet Said PEHLIVAN", tcNo: "11991549640", cepTelefonu: "554 331 66 40", dogumTarihi: "23.12.2006", departman: "MERKEZ FABRİKA", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "24.06.2024", servisGuzergahi: "KALETEPİ", durak: "KALETEPİ", durum: "AKTIF" },
  { adSoyad: "Muzaffer BAŞTUĞ", tcNo: "10320118900", cepTelefonu: "545 552 60 11", dogumTarihi: "04.08.2006", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "09.09.2024", servisGuzergahi: "BAĞDAT KÖPRÜ BENZİNLİK", durak: "BAĞDAT KÖPRÜ BENZİNLİK", durum: "AKTIF" },
  { adSoyad: "Abbas Can ÖNGER", tcNo: "10470177948", cepTelefonu: "543 964 02 29", dogumTarihi: "14.07.2006", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "05.05.2025", servisGuzergahi: "BAĞDAT KÖPRÜ BENZİNLİK", durak: "BAĞDAT KÖPRÜ BENZİNLİK", durum: "AKTIF" },
  { adSoyad: "Ali OKÇUÇ", tcNo: "11747767642", cepTelefonu: "544 638 84 81", dogumTarihi: "08.07.2006", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "24.06.2024", servisGuzergahi: "VAYLAÇIK", durak: "VAYLAÇIK", durum: "AKTIF" },
  { adSoyad: "Ali İMAM", tcNo: "36376864961", cepTelefonu: "544 743 77 41", dogumTarihi: "13.01.1956", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "13.07.2024", servisGuzergahi: "KALETEPLİ", durak: "KALETEPLİ", durum: "AKTIF" },
  { adSoyad: "Ilyas ÇUFTAN", tcNo: "11118950950", cepTelefonu: "544 558 86 33", dogumTarihi: "25.03.2006", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "24.06.2024", servisGuzergahi: "KAŞIYAMA", durak: "KAŞIYAMA", durum: "AKTIF" },
  { adSoyad: "Yasin KÖKSAL", tcNo: "11232193561", cepTelefonu: "552 296 00 21", dogumTarihi: "06.09.2006", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "10.09.2024", servisGuzergahi: "REKTÖRLİK", durak: "REKTÖRLİK", durum: "AKTIF" },
  { adSoyad: "Sinan AKTAŞ", tcNo: "11196995564", cepTelefonu: "553 066 65 76", dogumTarihi: "02.03.2006", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "11.09.2024", servisGuzergahi: "NOKTA A101", durak: "NOKTA A101", durum: "AKTIF" },
  { adSoyad: "Ahmet SÖĞÜT", tcNo: "11319888253", cepTelefonu: "531 703 53 60", dogumTarihi: "23.11.2005", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "09.09.2024", servisGuzergahi: "BAĞDAT KÖPRÜ", durak: "BAĞDAT KÖPRÜ", durum: "AKTIF" },
  { adSoyad: "Burkan ŞEKİR", tcNo: "10958602572", cepTelefonu: "553 065 65 40", dogumTarihi: "03.10.2005", departman: "MERKEZ FABRİKA", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "27.05.2024", servisGuzergahi: "SOL BENZİNLİK", durak: "SOL BENZİNLİK", durum: "AKTIF" },
  { adSoyad: "Halim ERSOY", tcNo: "10594180600", cepTelefonu: "500 070 56 18", dogumTarihi: "07.09.2005", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "20.05.2024", servisGuzergahi: "VALİLİK", durak: "VALİLİK", durum: "AKTIF" },
  { adSoyad: "Berat SÜVAR", tcNo: "10860207772", cepTelefonu: "546 713 97 41", dogumTarihi: "03.08.2005", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "20.05.2024", servisGuzergahi: "VALİLİK", durak: "VALİLİK", durum: "AKTIF" },
  { adSoyad: "Sayyed GÜRSOY", tcNo: "30776680800", cepTelefonu: "506 052 98 77", dogumTarihi: "13.07.2005", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "20.05.2024", servisGuzergahi: "OSMANGAZİ", durak: "OSMANGAZİ", durum: "AKTIF" },
  { adSoyad: "Nevzat GENÇER", tcNo: "12072948506", cepTelefonu: "506 052 98 77", dogumTarihi: "13.07.2005", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "20.05.2024", servisGuzergahi: "YEŞİLMAHALLE ŞEFKAATLİ BENZİNLİK", durak: "YEŞİLMAHALLE ŞEFKAATLİ BENZİNLİK", durum: "AKTIF" },
  { adSoyad: "Emir Kaan BAŞER", tcNo: "10655412396", cepTelefonu: "541 967 68 27", dogumTarihi: "15.06.2005", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "29.07.2024", servisGuzergahi: "OSMANGAZİ", durak: "OSMANGAZİ", durum: "AKTIF" },
  { adSoyad: "Ahmet SAK", tcNo: "47318903200", cepTelefonu: "509 808 01 13", dogumTarihi: "30.06.2004", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "24.06.2024", servisGuzergahi: "VAYLAÇIK", durak: "VAYLAÇIK", durum: "AKTIF" }
];

// Tarihi parse et
const parseDate = (dateStr) => {
  if (!dateStr || dateStr === '') return null;
  
  try {
    // DD.MM.YYYY formatını parse et
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS'de ay 0'dan başlar
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    
    // Eğer başka format varsa
    return new Date(dateStr);
  } catch (error) {
    console.log(`⚠️ Tarih parse edilemedi: ${dateStr}`);
    return null;
  }
};

// Departmanı normalize et
const normalizeDepartment = (dept) => {
  if (!dept) return 'MERKEZ FABRİKA';
  
  const deptUpper = dept.toString().toUpperCase();
  
  // Excel'deki departman adlarını model enum'una map et
  if (deptUpper.includes('MERKEZ FAB')) return 'MERKEZ FABRİKA';
  if (deptUpper.includes('İŞL FAB')) return 'İŞL FABRİKA';
  if (deptUpper.includes('TEKNİK') || deptUpper.includes('BAKIM')) return 'TEKNİK OFİS / BAKIM MÜHENDİSİ';
  if (deptUpper.includes('İDARİ')) return 'İDARİ';
  if (deptUpper.includes('CNC') || deptUpper.includes('TORNA')) return 'CNC TORNA İŞLİYATÇISI';
  
  // Varsayılan
  return 'MERKEZ FABRİKA';
};

// Lokasyonu normalize et
const normalizeLocation = (loc) => {
  if (!loc) return 'MERKEZ';
  
  const locUpper = loc.toString().toUpperCase();
  if (locUpper.includes('İŞL') || locUpper.includes('ISIL')) return 'İŞL';
  
  return 'MERKEZ';
};

// Durumu normalize et
const normalizeStatus = (status) => {
  if (!status) return 'AKTIF';
  
  const statusUpper = status.toString().toUpperCase();
  if (statusUpper.includes('AKTIF')) return 'AKTIF';
  if (statusUpper.includes('PASIF')) return 'PASIF';
  if (statusUpper.includes('IZIN')) return 'IZINLI';
  if (statusUpper.includes('AYRIL')) return 'AYRILDI';
  
  return 'AKTIF';
};

// Telefon numarasını temizle
const cleanPhone = (phone) => {
  if (!phone) return '';
  return phone.toString().replace(/[^\d]/g, ''); // Sadece rakamları al
};

// Ana import fonksiyonu
const importEmployees = async () => {
  try {
    console.log('🚀 Çalışan verileri import işlemi başlıyor...');
    
    // Önce mevcut tüm çalışanları sil (temiz başlangıç için)
    console.log('🗑️ Mevcut çalışan verileri temizleniyor...');
    await Employee.deleteMany({});
    
    let importedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      
      try {
        // Veriyi temizle ve normalize et
        const employeeData = {
          adSoyad: row.adSoyad?.trim() || '',
          tcNo: row.tcNo?.toString().replace(/[^\d]/g, '') || '', // Sadece rakamlar
          cepTelefonu: cleanPhone(row.cepTelefonu),
          dogumTarihi: parseDate(row.dogumTarihi),
          departman: normalizeDepartment(row.departman),
          pozisyon: row.pozisyon?.trim() || '',
          lokasyon: normalizeLocation(row.lokasyon),
          servisTarihi: parseDate(row.servisTarihi),
          servisGuzergahi: row.servisGuzergahi?.trim() || '',
          durak: row.durak?.trim() || '',
          durum: normalizeStatus(row.durum)
        };
        
        // Zorunlu alanları kontrol et
        if (!employeeData.adSoyad || !employeeData.pozisyon) {
          console.log(`⚠️ Satır ${i + 1}: Ad-Soyad veya Pozisyon eksik, atlanıyor`);
          errorCount++;
          continue;
        }
        
        // TC No boşsa kaldır (unique constraint hatası olmasın)
        if (!employeeData.tcNo) {
          delete employeeData.tcNo;
        }
        
        // Yeni çalışan oluştur
        const employee = new Employee(employeeData);
        await employee.save();
        
        importedCount++;
        console.log(`✅ ${importedCount}. ${employeeData.adSoyad} - ${employee.employeeId}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Satır ${i + 1} hatası (${row.adSoyad}):`, error.message);
      }
    }
    
    console.log('\n📊 Import Sonucu:');
    console.log(`✅ Başarıyla eklenen: ${importedCount}`);
    console.log(`❌ Hata olan: ${errorCount}`);
    console.log(`📋 Toplam işlenen: ${excelData.length}`);
    
    // Veritabanı istatistikleri
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ durum: 'AKTIF' });
    
    console.log('\n📈 Veritabanı Durumu:');
    console.log(`👥 Toplam çalışan: ${totalEmployees}`);
    console.log(`🟢 Aktif çalışan: ${activeEmployees}`);
    
    // Departman dağılımı
    const deptStats = await Employee.aggregate([
      { $group: { _id: '$departman', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n🏢 Departman Dağılımı:');
    deptStats.forEach(dept => {
      console.log(`  ${dept._id}: ${dept.count} kişi`);
    });
    
  } catch (error) {
    console.error('❌ Import genel hatası:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Veritabanı bağlantısı kapatıldı');
    process.exit(0);
  }
};

// Script'i çalıştır
const main = async () => {
  await connectDB();
  await importEmployees();
};

main().catch(console.error); 