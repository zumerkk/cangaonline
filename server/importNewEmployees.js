const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

// Environment variables'ları yükle
dotenv.config();

// MongoDB Atlas bağlantısı
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MONGODB_URI environment variable bulunamadı!');
  process.exit(1);
}

mongoose.connect(mongoURI);

// 📊 Excel'den gelen ham veri
const employeeData = [
    {
        "ADI SOYADI": "Ahmet EREN",
        "SİCİL NO": "1171901938",
        "TC KİMLİK": "38365807718",
        "DOĞ.TARİHİ": "08.01.1998",
        "GÖREVİ": "İDK KAMARA",
        "DEPARTMANI": "İDK KAMARA",
        "GİRİŞ TARİHİ": "07.05.2019",
        "BİRİMİ": "MERKEZ",
        "ÇAL.ŞEKLİ": "KAMBER",
        "DURUM": "AKTIF",
        "TİP": "AKTIF",
        "ÇIKIŞ": ""
    },
    {
        "ADI SOYADI": "Ahmet EREN",
        "SİCİL NO": "1171901939",
        "TC KİMLİK": "38365807718",
        "DOĞ.TARİHİ": "08.01.1998",
        "GÖREVİ": "İDK KAMARA",
        "DEPARTMANI": "İDK KAMARA",
        "GİRİŞ TARİHİ": "07.05.2019",
        "BİRİMİ": "MERKEZ",
        "ÇAL.ŞEKLİ": "KAMBER",
        "DURUM": "AKTIF",
        "TİP": "AKTIF",
        "ÇIKIŞ": ""
    },
    {
        "ADI SOYADI": "Arhan CALIOĞLU",
        "SİCİL NO": "1631821936",
        "TC KİMLİK": "28.06.1990",
        "DOĞ.TARİHİ": "28.06.1990",
        "GÖREVİ": "İDK KAMARA",
        "DEPARTMANI": "İDK KAMARA",
        "GİRİŞ TARİHİ": "04.04.2018",
        "BİRİMİ": "MERKEZ",
        "ÇAL.ŞEKLİ": "KAMBER",
        "DURUM": "AKTIF",
        "TİP": "AKTIF",
        "ÇIKIŞ": ""
    },
    {
        "ADI SOYADI": "Arhan CALIOĞLU",
        "SİCİL NO": "1641821936",
        "TC KİMLİK": "10.07.1988",
        "DOĞ.TARİHİ": "10.07.1988",
        "GÖREVİ": "İDK KAMARA",
        "DEPARTMANI": "İDK KAMARA",
        "GİRİŞ TARİHİ": "13.07.2012",
        "BİRİMİ": "MERKEZ",
        "ÇAL.ŞEKLİ": "KAMBER",
        "DURUM": "AKTIF",
        "TİP": "AKTIF",
        "ÇIKIŞ": ""
    },
    {
        "ADI SOYADI": "Ali FIRAT",
        "SİCİL NO": "1321801948",
        "TC KİMLİK": "30.06.1962",
        "DOĞ.TARİHİ": "30.06.1962",
        "GÖREVİ": "İDK KAMARA",
        "DEPARTMANI": "İDK KAMARA",
        "GİRİŞ TARİHİ": "07.05.2019",
        "BİRİMİ": "MERKEZ",
        "ÇAL.ŞEKLİ": "KAMBER",
        "DURUM": "AKTIF",
        "TİP": "AKTIF",
        "ÇIKIŞ": ""
    },
    {
        "ADI SOYADI": "Ali Burak MERTOĞLU",
        "SİCİL NO": "1881821958",
        "TC KİMLİK": "24.02.1979",
        "DOĞ.TARİHİ": "24.02.1979",
        "GÖREVİ": "İDK KAMARA",
        "DEPARTMANI": "İDK KAMARA",
        "GİRİŞ TARİHİ": "17.07.2017",
        "BİRİMİ": "MERKEZ",
        "ÇAL.ŞEKLİ": "KAMBER",
        "DURUM": "AKTIF",
        "TİP": "AKTIF",
        "ÇIKIŞ": ""
    },
    {
        "ADI SOYADI": "Ali Rıdvan GÜVEN",
        "SİCİL NO": "2371831956",
        "TC KİMLİK": "24.01.1974",
        "DOĞ.TARİHİ": "24.01.1974",
        "GÖREVİ": "İDK KAMARA",
        "DEPARTMANI": "İDK KAMARA",
        "GİRİŞ TARİHİ": "04.01.2016",
        "BİRİMİ": "MERKEZ",
        "ÇAL.ŞEKLİ": "KAMBER",
        "DURUM": "AKTIF",
        "TİP": "AKTIF",
        "ÇIKIŞ": ""
    },
    {
        "ADI SOYADI": "Ali Murat ÇALIŞ",
        "SİCİL NO": "2471831956",
        "TC KİMLİK": "04.07.1985",
        "DOĞ.TARİHİ": "04.07.1985",
        "GÖREVİ": "İDK KAMARA",
        "DEPARTMANI": "İDK KAMARA",
        "GİRİŞ TARİHİ": "01.03.2021",
        "BİRİMİ": "MERKEZ",
        "ÇAL.ŞEKLİ": "KAMBER",
        "DURUM": "AKTIF",
        "TİP": "AKTIF",
        "ÇIKIŞ": ""
    },
    {
        "ADI SOYADI": "Alparslan KOCAER",
        "SİCİL NO": "3711611964",
        "TC KİMLİK": "19.09.1987",
        "DOĞ.TARİHİ": "19.09.1987",
        "GÖREVİ": "İDK KAMARA",
        "DEPARTMANI": "İDK KAMARA",
        "GİRİŞ TARİHİ": "03.11.2014",
        "BİRİMİ": "MERKEZ",
        "ÇAL.ŞEKLİ": "KAMBER",
        "DURUM": "AKTIF",
        "TİP": "AKTIF",
        "ÇIKIŞ": ""
    },
    {
        "ADI SOYADI": "Alparslan KORKMAZ",
        "SİCİL NO": "12131611964",
        "TC KİMLİK": "23.07.1985",
        "DOĞ.TARİHİ": "23.07.1985",
        "GÖREVİ": "İDK KAMARA",
        "DEPARTMANI": "İDK KAMARA",
        "GİRİŞ TARİHİ": "11.01.2021",
        "BİRİMİ": "MERKEZ",
        "ÇAL.ŞEKLİ": "KAMBER",
        "DURUM": "AKTIF",
        "TİP": "AKTIF",
        "ÇIKIŞ": ""
    }
];

// 🔧 Yardımcı fonksiyonlar

// Tarih dönüştürme (DD.MM.YYYY → Date)
function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    // DD.MM.YYYY formatını parse et
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JavaScript'te aylar 0'dan başlar
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    
    return new Date(year, month, day);
}

// İsim parse etme (Ad Soyad'ı firstName lastName'e ayır)
function parseName(fullName) {
    if (!fullName || typeof fullName !== 'string') {
        return { firstName: 'Bilinmiyor', lastName: 'Bilinmiyor' };
    }
    
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) {
        return { firstName: nameParts[0], lastName: '' };
    }
    
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    return { firstName, lastName };
}

// Departman normalize etme 
function normalizeDepartment(department) {
    if (!department || typeof department !== 'string') return 'DİĞER';
    
    const dept = department.toUpperCase().trim();
    
    // Mapping tablosu - geliştirilmiş
    const departmentMapping = {
        'İDK KAMARA': 'İDARİ BİRİM',
        'IDK KAMARA': 'İDARİ BİRİM',
        'KAMARA': 'İDARİ BİRİM',
        'KEFENDİS': 'GENEL ÇALIŞMA GRUBU',
        'KAMBER': 'GENEL ÇALIŞMA GRUBU',
        'MERKEZ': 'İDARİ BİRİM',
        'TEKNİK': 'TEKNİK OFİS',
        'KALİTE': 'KALİTE KONTROL',
        'BAKIM': 'BAKIM VE ONARIM',
        'TORNA': 'TORNA GRUBU',
        'FREZE': 'FREZE GRUBU',
        'TESTERE': 'TESTERE',
        'KAYNAK': 'KAYNAK',
        'MONTAJ': 'MONTAJ',
        'PLANLAMA': 'PLANLAMA',
        'USTA': 'GENEL ÇALIŞMA GRUBU',
        'OPERATÖR': 'GENEL ÇALIŞMA GRUBU',
        'İŞÇİ': 'GENEL ÇALIŞMA GRUBU',
        'ISCI': 'GENEL ÇALIŞMA GRUBU'
    };
    
    // Tam eşleşme kontrolü
    if (departmentMapping[dept]) {
        return departmentMapping[dept];
    }
    
    // Kısmi eşleşme ara
    for (const [key, value] of Object.entries(departmentMapping)) {
        if (dept.includes(key)) {
            return value;
        }
    }
    
    return 'DİĞER';
}

// Lokasyon belirleme
function determineLocation(birim, department) {
    if (!birim || typeof birim !== 'string') {
        // Departmana göre karar ver
        const isilDepartments = [
            'ÜNİVERSAL TORNA / FREZE',
            'FORKLİFT OPERATÖRÜ',
            'DEPO',
            'BASMA/ÇEKME VE SIZDIRMAZLIK'
        ];
        
        return isilDepartments.includes(department) ? 'IŞIL ŞUBE' : 'MERKEZ ŞUBE';
    }
    
    const birimUpper = birim.toUpperCase().trim();
    
    // IŞIL şubeye ait birimleri kontrol et
    if (birimUpper.includes('IŞIL') || birimUpper.includes('ISIL')) {
        return 'IŞIL ŞUBE';
    }
    
    // Varsayılan olarak MERKEZ
    return 'MERKEZ ŞUBE';
}

// Durum normalize etme
function normalizeStatus(durum, cikis) {
    // Çıkış tarihi varsa AYRILDI
    if (cikis && cikis.trim() !== '') {
        return 'AYRILDI';
    }
    
    if (!durum || typeof durum !== 'string') return 'AKTIF';
    
    const durumUpper = durum.toUpperCase().trim();
    
    const statusMapping = {
        'AKTIF': 'AKTIF',
        'AKTİF': 'AKTIF',
        'PASİF': 'PASİF',
        'PASIF': 'PASİF',
        'İZİNLİ': 'İZİNLİ',
        'IZINLI': 'İZİNLİ',
        'AYRILDI': 'AYRILDI',
        'AYRILAN': 'AYRILDI',
        'VASAT': 'AKTIF' // VASAT'ı AKTIF olarak kabul et
    };
    
    return statusMapping[durumUpper] || 'AKTIF';
}

// Employee ID oluşturma
function generateEmployeeId(name, index) {
    const { firstName } = parseName(name);
    const prefix = firstName.charAt(0).toUpperCase();
    const id = String(index + 1).padStart(4, '0');
    return `${prefix}${id}`;
}

// TC Kimlik parse etme ve validasyon
function parseTcNo(tcField) {
    if (!tcField || typeof tcField !== 'string') return '';
    
    const tc = tcField.trim();
    
    // Eğer nokta var ve tarih formatında ise boş döndür
    if (tc.includes('.') && tc.length <= 10) return '';
    
    // Sadece 11 haneli sayıları kabul et
    const numericOnly = tc.replace(/\D/g, '');
    if (numericOnly.length === 11) {
        return numericOnly;
    }
    
    return ''; // Geçersiz TC kimlik
}

// 📥 Ana import fonksiyonu
async function importEmployees() {
    try {
        console.log('🚀 Excel verisinden çalışanları içe aktarıyorum...');
        
        const employees = [];
        const processedTcNos = new Set(); // Duplicate TC kontrolü
        let successCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;
        
        for (let i = 0; i < employeeData.length; i++) {
            const data = employeeData[i];
            
            try {
                // İsim parse et
                const { firstName, lastName } = parseName(data["ADI SOYADI"]);
                
                // TC Kimlik parse et
                const tcNo = parseTcNo(data["TC KİMLİK"]);
                
                // Duplicate TC kontrolü
                if (tcNo && processedTcNos.has(tcNo)) {
                    console.log(`⚠️ ${i + 1}. ${firstName} ${lastName} - Duplicate TC: ${tcNo}, atlanıyor...`);
                    duplicateCount++;
                    continue;
                }
                
                if (tcNo) {
                    processedTcNos.add(tcNo);
                }
                
                // Tarihleri parse et
                const birthDate = parseDate(data["DOĞ.TARİHİ"]);
                const hireDate = parseDate(data["GİRİŞ TARİHİ"]);
                
                // Departman normalize et
                const department = normalizeDepartment(data["DEPARTMANI"]);
                
                // Lokasyon belirle
                const location = determineLocation(data["BİRİMİ"], department);
                
                // Durum belirle
                const status = normalizeStatus(data["DURUM"], data["ÇIKIŞ"]);
                
                // Employee ID oluştur (unique olması için index + random ekle)
                const employeeId = data["SİCİL NO"] || `EMP${String(i + 1).padStart(4, '0')}`;
                
                // Notlar oluştur
                const notes = [
                    data["ÇAL.ŞEKLİ"] ? `Çalışma Şekli: ${data["ÇAL.ŞEKLİ"]}` : null,
                    data["TİP"] ? `Tip: ${data["TİP"]}` : null,
                    data["ÇIKIŞ"] ? `Çıkış Tarihi: ${data["ÇIKIŞ"]}` : null
                ].filter(Boolean).join(', ');
                
                // Employee objesi oluştur
                const employee = {
                    employeeId,
                    firstName,
                    lastName,
                    fullName: `${firstName} ${lastName}`,
                    tcNo: tcNo || '', // Parsed TC kimlik
                    birthDate,
                    hireDate: hireDate || new Date(), // Hiredate required
                    position: data["GÖREVİ"] || 'Belirtilmemiş',
                    department,
                    location,
                    status,
                    notes: notes || '',
                    serviceInfo: {
                        usesService: false // Varsayılan olarak servis kullanmıyor
                    }
                };
                
                employees.push(employee);
                console.log(`✓ ${i + 1}. ${firstName} ${lastName} - ${department} - ${location} - TC: ${tcNo || 'N/A'}`);
                successCount++;
                
            } catch (error) {
                console.error(`❌ ${i + 1}. kayıt hatası:`, error.message);
                errorCount++;
            }
        }
        
        // Veritabanına kaydet
        if (employees.length > 0) {
            console.log(`\n💾 ${employees.length} çalışanı veritabanına kaydediyorum...`);
            
            // Bulk insert
            await Employee.insertMany(employees, { ordered: false });
            
            console.log(`\n🎉 Import tamamlandı!`);
            console.log(`✅ Başarılı: ${successCount} çalışan`);
            console.log(`❌ Hatalı: ${errorCount} kayıt`);
            console.log(`📊 Toplam: ${employees.length} çalışan eklendi`);
            
            // Özet bilgiler
            const locationStats = employees.reduce((acc, emp) => {
                acc[emp.location] = (acc[emp.location] || 0) + 1;
                return acc;
            }, {});
            
            const departmentStats = employees.reduce((acc, emp) => {
                acc[emp.department] = (acc[emp.department] || 0) + 1;
                return acc;
            }, {});
            
            console.log('\n📍 Lokasyon Dağılımı:');
            Object.entries(locationStats).forEach(([loc, count]) => {
                console.log(`   ${loc}: ${count} çalışan`);
            });
            
            console.log('\n🏢 Departman Dağılımı:');
            Object.entries(departmentStats).forEach(([dept, count]) => {
                console.log(`   ${dept}: ${count} çalışan`);
            });
            
        } else {
            console.log('❌ İçe aktarılacak veri bulunamadı!');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Import hatası:', error);
        process.exit(1);
    }
}

importEmployees(); 