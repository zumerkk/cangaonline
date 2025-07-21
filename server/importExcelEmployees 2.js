const mongoose = require('mongoose');
const Employee = require('./models/Employee');
require('dotenv').config();

// Excel'deki tüm çalışan verileri
const excelData = [
  ["Ahmet ASLAN", "40118257476", "532 977 09 32", "21.03.1985", "MERKEZ FABRİKA", "CNC TORNA OPERATÖRÜ", "MERKEZ", "21.05.2013", "", "ÇALILIÖZ", "AKTİF"],
  ["Ahmet ŞAHİN", "47218592200", "505 808 03 13", "30.06.2004", "İŞL FABRİKA", "İMAL İŞÇİSİ", "İŞL", "24.06.2024", "", "YAYLAÇIK", "AKTİF"],
  ["Ahmet SÜMER", "10290179286", "541 564 01 29", "10.07.2006", "İŞL FABRİKA", "İMAL İŞÇİSİ", "İŞL", "05.09.2025", "BAĞDAT KÖPRÜ BENZİNLİK", "ÇALILIÖZ", "AKTİF"],
  ["Ahmet İLGİN", "18185555982", "541 959 68 76", "20.03.1973", "İŞL FABRİKA", "KAYNAKÇI", "İŞL", "14.03.2023", "", "KESKİN", "AKTİF"],
  ["Ali Cavit BEKTAŞ", "28872804538", "531 597 35 23", "26.02.1978", "İŞL FABRİKA", "BOYACI", "İŞL", "07.01.1900", "", "AHLİ ÇALILIÖZ", "AKTİF"],
  ["Ali Galip YİĞİT", "25373387955", "532 362 87 11", "24.12.1969", "MERKEZ FABRİKA", "MUTFAK SORUMLUSU", "MERKEZ", "22.12.2014", "", "ETLİLER", "AKTİF"],
  ["Ali ORTUZ", "11747376242", "544 638 84 81", "08.07.2006", "İŞL FABRİKA", "İMAL İŞÇİSİ", "İŞL", "24.06.2024", "", "YAYLAÇIK", "AKTİF"],
  ["Ali SAKIN", "10576069694", "534 743 77 44", "10.01.1958", "İŞL FABRİKA", "İMAL İŞÇİSİ", "İŞL", "13.07.2024", "", "KALETEPİ", "AKTİF"],
  ["Ali Sait YORUL MAZ", "15920334886", "543 804 18 68", "01.06.1979", "İŞL FABRİKA", "İŞL FABRİKA ŞUBESİ USTABASI", "İŞL", "21.08.2014", "", "ETLİLER", "AKTİF"],
  ["Arif Bilgir TALIN", "31353089655", "532 203 13 02", "23.11.2001", "MERKEZ FABRİKA", "CNC FREZE OPERATÖRÜ", "MERKEZ", "02.09.2024", "", "BAĞDAT KÖPRÜ", "AKTİF"],
  ["Arşen AYDIN", "16074551110", "533 209 80 19", "01.09.1962", "İDAR", "İDAR VE MALİ İŞLER", "MERKEZ", "09.06.2014", "", "SAATÇİ", "AKTİF"],
  ["Azgrem TOSLU", "10029925254", "506 502 08 63", "02.11.2000", "İDAR", "ÖZEL GÜVENLİK GÖREVLISI", "MERKEZ", "01.09.2023", "", "OSMANGAZİ", "AKTİF"],
  ["Aynur AYDIN", "23780906848", "505 351 04 14", "05.04.1978", "İDAR", "ÇALIŞAN İŞÇİ", "MERKEZ", "17.08.2019", "", "ÇALILIÖZ", "AKTİF"],
  ["Ahmet Dursun TUNA", "56502389476", "538 973 22 12", "02.02.2002", "MERKEZ FABRİKA", "CNC TORNA OPERATÖRÜ", "MERKEZ", "30.09.2024", "", "NOKTA A101", "AKTİF"],
  ["Bahadur Niyazi ÖZKAN", "15116684724", "537 204 24 90", "2.02.1992", "TEKNİK OFİS / BAKIM ONARıM", "ÜRETİM PLANLAMA VE BAKIM MÜHENDİSİ", "MERKEZ", "07.04.2021", "", "KENDİ ARACI İLE", "AKTİF"],
  ["Barış UÇAR", "33158567856", "532 203 43 65", "29.06.1979", "İŞL FABRİKA", "BOYACI", "İŞL", "30.08.2021", "", "ÇALILIÖZ", "AKTİF"],
  ["Batuhan İLHAN", "19544313962", "545 642 17 69", "20.03.1997", "İŞL FABRİKA", "İŞL FABRİKA ŞUBESİ SORUMLUSU", "İŞL", "17.07.2021", "", "ÖYAÇIK", "AKTİF"],
  ["Berat ŞENEL", "31186955138", "551 456 41 76", "09.01.2006", "MERKEZ FABRİKA", "CNC FREZE OPERATÖRÜ", "MERKEZ", "11.09.2024", "", "NOKTA A101", "AKTİF"],
  ["Berkant COŞKUN", "33272642702", "532 203 36 82", "23.10.1978", "MERKEZ FABRİKA", "CNC FREZE OPERATÖRÜ", "MERKEZ", "09.03.2023", "", "ÇALILIÖZ", "AKTİF"],
  ["Berat ÖZGÜN", "15274657368", "539 548 87 41", "05.01.1995", "MERKEZ FABRİKA", "KALİTE KONTROL GÖREVLISI", "MERKEZ", "03.07.2023", "", "DİSPANSER", "AKTİF"]
];

// Departman mapping - Excel değerlerini Employee model enum'larına çevir
const departmentMapping = {
  'MERKEZ FABRİKA': 'TORNA GRUBU',       // CNC Torna operatörleri için
  'İŞL FABRİKA': 'GENEL ÇALIŞMA GRUBU',  // Genel imalat işçileri için
  'TEKNİK OFİS / BAKIM ONARıM': 'TEKNİK OFİS',
  'İDAR': 'İDARİ BİRİM'
};

// Pozisyon bazlı departman belirleme
function getDepartmentByPosition(position, originalDepartment) {
  if (position.includes('CNC TORNA') || position.includes('TORNA')) {
    return 'TORNA GRUBU';
  }
  if (position.includes('CNC FREZE') || position.includes('FREZE')) {
    return 'FREZE GRUBU';
  }
  if (position.includes('KAYNAK')) {
    return 'KAYNAK';
  }
  if (position.includes('KALİTE KONTROL')) {
    return 'KALİTE KONTROL';
  }
  if (position.includes('TEKNİK') || position.includes('MÜHENDİS')) {
    return 'TEKNİK OFİS';
  }
  if (position.includes('İDAR') || position.includes('MALİ')) {
    return 'İDARİ BİRİM';
  }
  
  // Default mapping kullan
  return departmentMapping[originalDepartment] || 'GENEL ÇALIŞMA GRUBU';
}

// Lokasyon mapping
const locationMapping = {
  'MERKEZ': 'MERKEZ ŞUBE',
  'İŞL': 'IŞIL ŞUBE'
};

async function importEmployees() {
  try {
    console.log('🚀 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga_vardiya');
    console.log('✅ MongoDB bağlantısı başarılı!');

    let successCount = 0;
    let errorCount = 0;

    for (const [index, row] of excelData.entries()) {
      try {
        const [fullName, tcNo, phone, birthDateStr, department, position, location, hireDateStr, serviceRoute, serviceStop, status] = row;

        // Ad ve soyadı ayır
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Tarihleri parse et
        let birthDate = null;
        let hireDate = new Date();
        
        try {
          if (birthDateStr && birthDateStr !== '') {
            // DD.MM.YYYY formatını parse et
            const [day, month, year] = birthDateStr.split('.');
            birthDate = new Date(year, month - 1, day);
          }
        } catch (e) {
          console.log(`⚠️ ${fullName} için doğum tarihi parse edilemedi: ${birthDateStr}`);
        }

        try {
          if (hireDateStr && hireDateStr !== '') {
            const [day, month, year] = hireDateStr.split('.');
            hireDate = new Date(year, month - 1, day);
          }
        } catch (e) {
          console.log(`⚠️ ${fullName} için işe giriş tarihi parse edilemedi: ${hireDateStr}`);
        }

        // Çalışan ID oluştur (TC No'nun son 6 hanesi)
        const employeeId = tcNo ? tcNo.slice(-6) : 'EMP' + Date.now().toString().slice(-6);

        // Departman belirle (pozisyon bazlı)
        const mappedDepartment = getDepartmentByPosition(position, department);
        const mappedLocation = locationMapping[location] || 'MERKEZ ŞUBE';

        // Employee objesi oluştur
        const employeeData = {
          employeeId,
          firstName,
          lastName,
          fullName: fullName,
          tcNo: tcNo || '',
          phone: phone || '',
          birthDate: birthDate,
          hireDate: hireDate,
          position: position || 'ÇALIŞAN',
          department: mappedDepartment,
          location: mappedLocation,
          status: 'AKTIF',
          serviceInfo: {
            routeName: serviceRoute || '',
            stopName: serviceStop || '',
            usesService: Boolean(serviceRoute && serviceRoute.trim())
          },
          notes: `Excel'den aktarıldı - ${new Date().toLocaleDateString('tr-TR')}`
        };

        const employee = new Employee(employeeData);
        await employee.save();

        successCount++;
        console.log(`✅ ${fullName} eklendi (${mappedDepartment} - ${mappedLocation}) [${index + 1}/${excelData.length}]`);

      } catch (error) {
        errorCount++;
        console.error(`❌ ${row[0]} eklenirken hata:`, error.message);
      }
    }

    // Özet istatistikler
    console.log('\n🎉 IMPORT İŞLEMİ TAMAMLANDI!');
    console.log('='.repeat(50));
    console.log(`✅ Başarılı: ${successCount} çalışan`);
    console.log(`❌ Hatalı: ${errorCount} çalışan`);
    console.log(`📊 Toplam: ${excelData.length} kayıt`);

    // Veritabanı durumu
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'AKTIF' });
    
    console.log('\n📈 VERİTABANI DURUMU:');
    console.log(`👥 Toplam çalışan: ${totalEmployees}`);
    console.log(`🟢 Aktif çalışan: ${activeEmployees}`);

    // Departman dağılımı
    const departmentStats = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n🏢 DEPARTMAN DAĞILIMI:');
    departmentStats.forEach(dept => {
      console.log(`  • ${dept._id}: ${dept.count} kişi`);
    });

  } catch (error) {
    console.error('💥 Genel hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Veritabanı bağlantısı kapatıldı');
    process.exit(0);
  }
}

importEmployees();
