const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('./models/Employee');

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/canga';
    await mongoose.connect(mongoURI);
    console.log('🟢 MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('🔴 MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// 🆔 Otomatik Employee ID üretici
const generateEmployeeId = async (firstName, lastName) => {
  const prefix = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  
  // Son ID'yi bul
  const lastEmployee = await Employee.findOne({
    employeeId: { $regex: `^${prefix}` }
  }).sort({ employeeId: -1 });

  let nextNumber = 1;
  if (lastEmployee && lastEmployee.employeeId) {
    const lastNumber = parseInt(lastEmployee.employeeId.replace(prefix, ''));
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

// 📅 Tarih dönüştürücü (DD.MM.YYYY formatından Date'e)
const parseDate = (dateString) => {
  if (!dateString || dateString.trim() === '') return null;
  
  try {
    const [day, month, year] = dateString.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } catch (error) {
    console.log(`⚠️ Geçersiz tarih formatı: ${dateString}`);
    return null;
  }
};

// 🏢 Departman normalizer
const normalizeDepartment = (dept) => {
  if (!dept) return 'DİĞER';
  
  const deptUpper = dept.toUpperCase().trim();
  
  // Mapping tablosu
  const departmentMap = {
    'CNC TORNA OPERATÖRÜ': 'TORNA GRUBU',
    'CNC TığıĞı': 'TORNA GRUBU',
    'CNC FREZE OPERATÖRÜ': 'FREZE GRUBU',
    'MAL İşCiSi': 'GENEL ÇALIŞMA GRUBU',
    'ÖZEL GÜVENLIK VE GÜREŞIM': 'SERVİS',
    'LOGİ OPERATÖRÜ': 'DEPO',
    'YURONG OPERATÖRÜ': 'TEKNİK OFİS',
    'MONTAJ OPERATÖRÜ': 'MONTAJ',
    'LASTIK OPERATÖRÜ': 'GENEL ÇALIŞMA GRUBU',
    'BUR OPERATÖRÜ': 'TORNA GRUBU',
    'ALTIN SEÇME KONTROL GÖREVI': 'KALİTE KONTROL',
    'FRANGMAN': 'SERVİS',
    'BOYACI': 'ASTAR/SON KAT BOYA',
    'MEKANIK MUHENDISI': 'TEKNİK OFİS',
    'SIL SÜRÜCÜ USTAMASI': 'GENEL ÇALIŞMA GRUBU',
    'KALİTE KONTROL GÖREVI': 'KALİTE KONTROL',
    'SIL SÜRE USTAMASI': 'GENEL ÇALIŞMA GRUBU',
    'FAHRIKLARA MÜTEHIR VARLIKCILAR': 'TEKNİK OFİS',
    'BOYACI': 'ASTAR/SON KAT BOYA',
    'MÜTEVF OPERATÖRÜ': 'GENEL ÇALIŞMA GRUBU',
    'MUTFAK OPERATÖRÜ': 'SERVİS',
    'KAPICI': 'SERVİS',
    'İŞ MAKİNASI': 'FORKLİFT OPERATÖRÜ',
    'TORNAcı': 'TORNA GRUBU',
    'KAPALI ARTI': 'SERVİS',
    'SAYIŞMAN': 'İDARİ BİRİM',
    'MAKİNA MUHENDİSİ': 'TEKNİK OFİS',
    'MARANGOZ': 'GENEL ÇALIŞMA GRUBU',
    'BOYACI': 'ASTAR/SON KAT BOYA',
    'TURNUV': 'TORNA GRUBU',
    'KAPICI ARTI': 'SERVİS',
    'SATIŞ ALAMI GÖREV': 'İDARİ BİRİM',
    'BUS İş MÜDÜRÜM SÖHBETLEME': 'TEKNİK OFİS',
    'TOHUMCI': 'GENEL ÇALIŞMA GRUBU',
    'TIRNAKCI BÖYÜMÜRÜ': 'GENEL ÇALIŞMA GRUBU',
    'TİPENÇLİK': 'GENEL ÇALIŞMA GRUBU'
  };
  
  return departmentMap[deptUpper] || 'DİĞER';
};

// 📍 Lokasyon belirleyici
const determineLocation = (serviceRoute) => {
  if (!serviceRoute) return 'MERKEZ ŞUBE';
  
  const route = serviceRoute.toUpperCase();
  if (route.includes('IŞIL') || route.includes('ISIL')) {
    return 'IŞIL ŞUBE';
  }
  
  return 'MERKEZ ŞUBE';
};

// 🚌 Servis bilgilerini ayır
const parseServiceInfo = (serviceString) => {
  if (!serviceString) return { routeName: null, stopName: null };
  
  const parts = serviceString.split(',').map(s => s.trim());
  
  return {
    routeName: parts[0] || null,
    stopName: parts[1] || null
  };
};

// 📊 Excel verisi - Excel'den kopyaladığın veri
const excelData = [
  { name: "Ahmet ÇANGA", tcNo: "44745434166", phone: "552 577 39 22", birthDate: "23.10.1969", hireDate: "23.08.2019", position: "CNC TORNA OPERATÖRÜ", service: "SAADETTEPE" },
  { name: "Tahsin ŞİMŞEK", tcNo: "17829517326", phone: "", birthDate: "15.07.2000", hireDate: "6.09.2019", position: "CNC TığıĞı", service: "YAYLAcık" },
  { name: "Ahmet SAHİN", tcNo: "27122192296", phone: "505 908 81 13", birthDate: "20.06.2004", hireDate: "24.06.2024", position: "MAL İşCiSi", service: "YAYLAcık" },
  { name: "Yasin YILMAZ", tcNo: "14976387946", phone: "534 962 19 22", birthDate: "18.07.2002", hireDate: "1.08.2023", position: "MAL İşCiSi", service: "SAADETTEPE, KÖPRÜLİK VE İPEKYOLU" },
  // ... Tüm veriyi buraya ekleyeceğiz
];

// Ana import fonksiyonu
const importEmployeeData = async () => {
  try {
    console.log('\n📊 EXCEL VERİSİ İMPORT İŞLEMİ BAŞLADI...\n');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < excelData.length; i++) {
      const data = excelData[i];
      
      try {
        // İsmi ayır
        const nameParts = data.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        // Employee ID oluştur
        const employeeId = await generateEmployeeId(firstName, lastName);

        // Servis bilgilerini ayır
        const serviceInfo = parseServiceInfo(data.service);

        // Employee objesi oluştur
        const employeeData = {
          employeeId,
          firstName,
          lastName,
          tcNo: data.tcNo || null,
          phone: data.phone || null,
          birthDate: parseDate(data.birthDate),
          hireDate: parseDate(data.hireDate) || new Date(),
          position: data.position || 'Belirtilmemiş',
          department: normalizeDepartment(data.position),
          location: determineLocation(data.service),
          serviceInfo: {
            routeName: serviceInfo.routeName,
            stopName: serviceInfo.stopName,
            usesService: serviceInfo.routeName ? true : false
          },
          status: 'AKTIF'
        };

        // Veritabanına kaydet
        const employee = new Employee(employeeData);
        await employee.save();

        console.log(`✅ ${successCount + 1}. ${firstName} ${lastName} (${employeeId}) başarıyla eklendi`);
        successCount++;

      } catch (error) {
        errorCount++;
        const errorMsg = `${i + 1}. satır (${data.name}): ${error.message}`;
        errors.push(errorMsg);
        console.log(`❌ ${errorMsg}`);
      }
    }

    // Sonuçları göster
    console.log('\n📊 İMPORT SONUÇLARI:');
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`❌ Hatalı: ${errorCount}`);
    console.log(`📋 Toplam: ${excelData.length}`);

    if (errors.length > 0) {
      console.log('\n🔴 HATALAR:');
      errors.forEach(error => console.log(`   ${error}`));
    }

    console.log('\n🎉 Excel verisi import işlemi tamamlandı!');

  } catch (error) {
    console.error('🔴 Import işlemi sırasında hata:', error);
  }
};

// Script çalıştır
const runImport = async () => {
  try {
    await connectDB();
    await importEmployeeData();
  } catch (error) {
    console.error('🔴 Script hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
    process.exit(0);
  }
};

// Eğer script doğrudan çalıştırılıyorsa
if (require.main === module) {
  runImport();
}

module.exports = { importEmployeeData, connectDB }; 