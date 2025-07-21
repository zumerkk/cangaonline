const mongoose = require('mongoose');
const ServiceRoute = require('./models/ServiceRoute');
const ServiceSchedule = require('./models/ServiceSchedule');
const Employee = require('./models/Employee');

// Environment variables'ları yükle
const dotenv = require('dotenv');
dotenv.config();

// MongoDB bağlantısı - Atlas Cloud Database kullanıyor
const connectDB = async () => {
  try {
    // Environment variable'dan connection string al, yoksa hata ver
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable tanımlanmamış! .env dosyasını kontrol edin.');
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Atlas bağlantısı başarılı! 🌐');
    console.log('📍 Atlas Cluster: canga.rgadvdl.mongodb.net');
  } catch (error) {
    console.error('❌ MongoDB Atlas bağlantı hatası:', error);
    console.error('🔧 .env dosyasında MONGODB_URI kontrolü yapın');
    process.exit(1);
  }
};

// Excel'deki detaylı çalışan-durak eşleştirme verileri
const employeeServiceData = {
  // DİSPANSER SERVİS GÜZERGAHI
  'DİSPANSER SERVİS GÜZERGAHI': [
    { name: 'ALİ GÜRBÜZ', stop: 'ŞADIRVAN (PERŞEMBE PAZARI)', order: 1 },
    { name: 'ALİ SAVAŞ', stop: 'NOKTA A-101/DOĞTAŞ', order: 2 },
    { name: 'BERAT ÖZDEN', stop: 'DİSPANSER ÜST GEÇİT', order: 3 },
    { name: 'CEVCET ÖKSÜZ', stop: 'DİSPANSER ÜST GEÇİT', order: 4 },
    { name: 'ERDAL YAKUT', stop: 'GÜL PASTANESİ', order: 5 },
    { name: 'EYÜP TORUN', stop: 'DİSPANSER ÜST GEÇİT', order: 6 },
    { name: 'İBRAHİM VARLIOĞLU', stop: 'DİSPANSER ÜST GEÇİT', order: 7 },
    { name: 'MUHAMMED SEFA PEHLİVANLI', stop: 'DİSPANSER ÜST GEÇİT', order: 8 },
    { name: 'MURAT ÇAVDAR', stop: 'ŞADIRVAN (PERŞEMBE PAZARI)', order: 9 },
    { name: 'MUSTAFA BIYIK', stop: 'DİSPANSER ÜST GEÇİT', order: 10 },
    { name: 'ÖZKAN AYDIN', stop: 'DİSPANSER ÜST GEÇİT', order: 12 },
    { name: 'CELAL GÜLŞEN', stop: 'DİSPANSER ÜST GEÇİT', order: 13 },
    { name: 'MUHAMMED NAZİM GÖÇ', stop: 'DİSPANSER ÜST GEÇİT', order: 14 },
    { name: 'TUNCAY TEKİN', stop: 'DİSPANSER ÜST GEÇİT', order: 15 }
  ],

  // SANAYİ MAHALLESİ SERVİS GÜZERGAHI
  'SANAYİ MAHALLESİ SERVİS GÜZERGAHI': [
    { name: 'ALİ ŞIH YORULMAZ', stop: 'ÇORBACI ALİ DAYI', order: 1 },
    { name: 'AHMET DURAN TUNA', stop: 'NOKTA A-101/DOĞTAŞ', order: 2 },
    { name: 'FATİH BALOĞLU', stop: 'ÇORBACI ALİ DAYI', order: 4 },
    { name: 'HAKKİ YÜCEL', stop: 'ÇORBACI ALİ DAYI', order: 5 },
    { name: 'HAYATİ SÖZDİNLER', stop: 'ÇORBACI ALİ DAYI', order: 6 },
    { name: 'HAYDAR ACAR', stop: 'RASATTEPE KÖPRÜ', order: 7 },
    { name: 'GÜLNUR AĞIRMAN', stop: 'AYTEMİZ PETROL', order: 7 },
    { name: 'İSMET BAŞER', stop: 'AYTEMİZ PETROL', order: 8 },
    { name: 'KEMALETTİN GÜLEŞEN', stop: 'RASATTEPE KÖPRÜ', order: 9 },
    { name: 'MACİT USLU', stop: 'ÇORBACI ALİ DAYI', order: 10 },
    { name: 'MUSTAFA SÜMER', stop: 'RASATTEPE KÖPRÜ', order: 11 },
    { name: 'NİYAZİ YURTSEVEN', stop: 'NOKTA A-101', order: 12 },
    { name: 'BERAT AKTAŞ', stop: 'NOKTA A-101', order: 13 },
    { name: 'NURİ ÖZKAN', stop: 'ÇORBACI ALİ DAYI', order: 14 },
    { name: 'MUSTAFA BAŞKAYA', stop: 'ÇORBACI ALİ DAYI', order: 16 },
    { name: 'MUZAFFER KIZILÇIÇEK', stop: 'MEZARLIK PEYZAJ ÖNÜ', order: 17 }
  ],

  // OSMANGAZI-KARŞIYAKA MAHALLESİ
  'OSMANGAZI-KARŞIYAKA MAHALLESİ': [
    { name: 'ASIM DEMET', stop: 'SALI PAZARI', order: 1 },
    { name: 'İLYAS ÇURTAY', stop: 'KAHVELER (KARŞIYAKA)', order: 2 },
    { name: 'POLAT ERCAN', stop: 'KAHVELER (KARŞIYAKA)', order: 2 },
    { name: 'EMRE DEMİRCİ', stop: 'KEL MUSTAFA DURAĞI', order: 3 },
    { name: 'MUSTAFA SAMURKOLLU', stop: 'ERDURAN BAKKAL (KARŞIYAKA)', order: 3 },
    { name: 'SEFA ÖZTÜRK', stop: 'BAHÇELİEVLER', order: 6 },
    { name: 'SALİH GÖZÜAK', stop: 'KAHVELER (KARŞIYAKA)', order: 7 },
    { name: 'SELİM ALSAÇ', stop: 'SALI PAZARI', order: 8 },
    { name: 'ÜMİT SAZAK', stop: 'KAHVELER (KARŞIYAKA)', order: 9 },
    { name: 'ÜMİT TORUN', stop: 'KAHVELER (KARŞIYAKA)', order: 10 },
    { name: 'KEMAL KARACA', stop: 'BAHÇELİEVLER', order: 10 },
    { name: 'YAŞAR ÇETİN', stop: 'BAHÇELİEVLER SAĞLIK OCAĞI', order: 11 },
    { name: 'MUSTAFA DOĞAN', stop: 'YUVA TOKİ', order: 11 },
    { name: 'CİHAN ÇELEBİ', stop: 'GÜLLU YOLU BİM MARKET', order: 11 }
  ],

  // ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI
  'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI': [
    { name: 'AHMET ÇANGA', stop: 'NOKTA A-101/DOĞTAŞ', order: 1 },
    { name: 'AHMET ŞAHİN', stop: 'SAAT KULESİ', order: 2 },
    { name: 'ALİ ÇAVUŞ BAŞTUĞ', stop: 'FIRINLI CAMİ', order: 3 },
    { name: 'ALİ ÖKSÜZ', stop: 'SAAT KULESİ', order: 4 },
    { name: 'AYNUR AYTEKİN', stop: 'ÇALILIÖZ KÖPRÜ (ALT YOL)', order: 5 },
    { name: 'CELAL BARAN', stop: 'ÇALILIÖZ KÖPRÜ (ALT YOL)', order: 6 },
    { name: 'LEVENT DURMAZ', stop: 'ÇALILIÖZ KÖPRÜ (ALT YOL)', order: 9 },
    { name: 'METİN ARSLAN', stop: 'NAR MARKET', order: 10 },
    { name: 'MUSA DOĞU', stop: 'FIRINLI CAMİ', order: 11 },
    { name: 'ÖMER FİLİZ', stop: 'SAAT KULESİ', order: 11 },
    { name: 'SADULLAH AKBAYIR', stop: 'SAAT KULESİ', order: 12 },
    { name: 'EYÜP ÜNVANLİ', stop: 'FIRINLI CAMİ', order: 12 },
    { name: 'OSMAN ÖZKİLİÇ', stop: 'VALİLİK', order: 13 },
    { name: 'UĞUR ALBAYRAK', stop: 'SAAT KULESİ', order: 13 },
    { name: 'BERAT SUSAR', stop: 'VALİLİK ARKASI', order: 15 },
    { name: 'HÜLUSİ EREN CAN', stop: 'VALİLİK ARKASI', order: 16 },
    { name: 'İBRAHİM ÜÇER', stop: 'ES BENZİNLİK', order: 17 },
    { name: 'SONER ÇETİN GÜRSOY', stop: 'VALİLİK ARKASI', order: 18 },
    { name: 'ABBAS CAN ÖNGER', stop: 'BAĞDAT BENZİNLİK', order: 18 },
    { name: 'MEHMET ALİ ÖZÇELİK', stop: 'SAAT KULESİ', order: 19 }
  ],

  // ÇARŞI MERKEZ SERVİS GÜZERGAHI
  'ÇARŞI MERKEZ SERVİS GÜZERGAHI': [
    { name: 'AHMET ÇELİK', stop: 'S-OİL BENZİNLİK', order: 1 },
    { name: 'BİRKAN ŞEKER', stop: 'S-OİL BENZİNLİK', order: 2 },
    { name: 'HİLMİ SORGUN', stop: 'S-OİL BENZİNLİK', order: 3 },
    { name: 'EMİR KAAN BAŞER', stop: 'BAŞPINAR', order: 4 },
    { name: 'MERT SÜNBÜL', stop: 'TOPRAK YEMEK', order: 5 },
    { name: 'MESUT TUNCER', stop: 'HALI SAHA', order: 6 },
    { name: 'ALPEREN TOZLU', stop: 'HALI SAHA', order: 7 },
    { name: 'VEYSEL EMRE TOZLU', stop: 'HALI SAHA', order: 8 },
    { name: 'HAKAN AKPINAR', stop: 'HALI SAHA', order: 8 },
    { name: 'MUHAMMED ZÜMER KEKİLLİOĞLU', stop: 'HALI SAHA', order: 8 },
    { name: 'MİNE KARAOĞLU', stop: 'ESKİ REKTÖRLÜK', order: 9 },
    { name: 'FURKAN KADİR EDEN', stop: 'REKTÖRLÜK', order: 10 },
    { name: 'YUSUF GÜRBÜZ', stop: 'ES BENZİNLİK', order: 12 },
    { name: 'MEHMET ERTAŞ', stop: 'ESKİ REKTÖRLÜK', order: 13 },
    { name: 'HÜDAGÜL DEĞİRMENCİ', stop: 'ESKİ REKTÖRLÜK', order: 14 },
    { name: 'YASİN SAYGILI', stop: 'ESKİ REKTÖRLÜK/ GÜNDOĞDU OSMANGAZİ', order: 15 },
    { name: 'ÇAĞRI YILDIZ', stop: 'BAĞDAT KÖPRÜ', order: 17 },
    { name: 'CEMAL ERAKSOY', stop: 'YENİ MAHALLE GO BENZİNLİK', order: 17 },
    { name: 'AZİZ BUĞRA KARA', stop: 'BAĞDAT KÖPRÜ VE ÜZERİ', order: 18 }
  ]
};

// 19-24 Ağustos 2024 servis programları (Excel'den)
const serviceScheduleData = [
  // 08:15 FABRIKA ÇIKIŞ
  {
    timeSlot: '08:15 FABRIKA ÇIKIŞ',
    direction: 'FABRIKA ÇIKIŞ',
    passengers: [
      { name: 'CELAL BARAN', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI' },
      { name: 'OĞUZ EFE ZORLU', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI' },
      { name: 'ERDAL YAKUT', route: 'DİSPANSER SERVİS GÜZERGAHI' }
    ]
  },
  // 16:15 FABRIKA ÇIKIŞ
  {
    timeSlot: '16:15 FABRIKA ÇIKIŞ',
    direction: 'FABRIKA ÇIKIŞ',
    passengers: [
      { name: 'HÜLUSİ EREN CAN', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI' },
      { name: 'KADİR CANBULAT', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' },
      { name: 'MUSTAFA BIYIK', route: 'DİSPANSER SERVİS GÜZERGAHI' },
      { name: 'SEFA PEHLİVANLI', route: 'DİSPANSER SERVİS GÜZERGAHI' }
    ]
  },
  // 20:15 FABRIKA ÇIKIŞ
  {
    timeSlot: '20:15 FABRIKA ÇIKIŞ',
    direction: 'FABRIKA ÇIKIŞ',
    passengers: [
      { name: 'BERAT ÖZDEN', route: 'DİSPANSER SERVİS GÜZERGAHI' },
      { name: 'MİKAİL GÜMÜŞBAŞ', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' },
      { name: 'EMİR KAAN BAŞER', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' },
      { name: 'ALPER ŞABAN RÜZGAR', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' }
    ]
  },
  // 00:15 FABRIKA ÇIKIŞ
  {
    timeSlot: '00:15 FABRIKA ÇIKIŞ',
    direction: 'FABRIKA ÇIKIŞ',
    passengers: [
      { name: 'BİRKAN ŞEKER', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' },
      { name: 'BERAT SUSAR', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI' },
      { name: 'MERT SÜNBÜL', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' }
    ]
  },
  // 15:30 FABRIKA GELİŞ
  {
    timeSlot: '15:30 FABRIKA GELİŞ',
    direction: 'FABRIKA GELİŞ',
    passengers: [
      { name: 'BİRKAN ŞEKER', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' },
      { name: 'BERAT SUSAR', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI' },
      { name: 'MERT SÜNBÜL', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' }
    ]
  },
  // 19:30 FABRIKA GELİŞ
  {
    timeSlot: '19:30 FABRIKA GELİŞ',
    direction: 'FABRIKA GELİŞ',
    passengers: [
      { name: 'CELAL BARAN', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI' },
      { name: 'OĞUZ EFE ZORLU', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI' },
      { name: 'ERDAL YAKUT', route: 'DİSPANSER SERVİS GÜZERGAHI' }
    ]
  },
  // 23:30 FABRIKA GELİŞ
  {
    timeSlot: '23:30 FABRIKA GELİŞ',
    direction: 'FABRIKA GELİŞ',
    passengers: [
      { name: 'İSMAİL AKTUĞ', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' },
      { name: 'MESUT TUNCER', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' },
      { name: 'VEYSEL EMRE TOZLU', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' }
    ]
  },
  // 21:00 FABRIKA ÇIKIŞ
  {
    timeSlot: '21:00 FABRIKA ÇIKIŞ',
    direction: 'FABRIKA ÇIKIŞ',
    passengers: [
      { name: 'ALİ ÇAVUŞ BAŞTUĞ', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI' },
      { name: 'HAYDAR ACAR', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI' },
      { name: 'İBRAHİM VARLIOĞLU', route: 'DİSPANSER SERVİS GÜZERGAHI' },
      { name: 'BERAT COŞKUN', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' },
      { name: 'SALİH ALBAYRAK', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' },
      { name: 'YUSUF ACAR', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI' }
    ]
  }
];

// Kendi araç kullanacak çalışanlar
const privateVehicleEmployees = [
  'AHMET İLGİN',
  'BAHADIR AKKUL',
  'BATUHAN İLHAN',
  'BİLAL CEVİZOĞLU',
  'BURCU KARAKOÇ',
  'ERDEM KAMİL YILDIRIM',
  'İRFAN KIRAÇ',
  'KAMİL BATUHAN BEYGO',
  'MEHMET KEMAL İNAÇ',
  'MURAT GENCER',
  'MURAT GÜRBÜZ',
  'MURAT SEPETCİ',
  'ORHAN YORULMAZ',
  'SERKAN GÜLEŞEN',
  'ÜMİT DEMİREL',
  'BERKAN BULANIK (BAHŞILI)',
  'SÜLEYMAN GÖZÜAK (YENİŞEHİR)'
];

// Çalışanları servis durağı bilgisi ile güncelle
const updateEmployeesWithServiceInfo = async () => {
  console.log('🔄 Çalışanların servis bilgileri güncelleniyor...');

  try {
    const employees = await Employee.find();
    let updatedCount = 0;

    for (const employee of employees) {
      let updated = false;
      let serviceRoute = null;
      let stopName = null;
      let stopOrder = null;
      let usesPrivateVehicle = false;

      // Kendi araç kontrolü
      if (privateVehicleEmployees.includes(employee.fullName)) {
        usesPrivateVehicle = true;
        updated = true;
      } else {
        // Servis güzergahlarında ara
        for (const [routeName, routeEmployees] of Object.entries(employeeServiceData)) {
          const employeeData = routeEmployees.find(emp => emp.name === employee.fullName);
          if (employeeData) {
            const route = await ServiceRoute.findOne({ routeName: routeName });
            if (route) {
              serviceRoute = route._id;
              stopName = employeeData.stop;
              stopOrder = employeeData.order;
              updated = true;
              break;
            }
          }
        }
      }

      if (updated) {
        await Employee.findByIdAndUpdate(employee._id, {
          'serviceInfo.routeId': serviceRoute,
          'serviceInfo.stopName': stopName,
          'serviceInfo.stopOrder': stopOrder,
          'serviceInfo.usesService': !usesPrivateVehicle,
          'serviceInfo.serviceNotes': usesPrivateVehicle ? 'Kendi aracını kullanıyor' : ''
        });
        updatedCount++;
      }
    }

    console.log(`✅ ${updatedCount} çalışanın servis bilgisi güncellendi`);
  } catch (error) {
    console.error('❌ Çalışan güncelleme hatası:', error);
  }
};

// Servis programlarını oluştur
const createServiceSchedules = async () => {
  console.log('📅 Servis programları oluşturuluyor...');

  try {
    // Eski programları temizle
    await ServiceSchedule.deleteMany({});

    const schedules = [];
    const scheduleDate = new Date('2024-08-19'); // 19-24 Ağustos 2024

    for (const scheduleData of serviceScheduleData) {
      // Her güzergah için ayrı program oluştur
      const routeGroups = {};
      
      // Yolcuları güzergaha göre grupla
      for (const passenger of scheduleData.passengers) {
        if (!routeGroups[passenger.route]) {
          routeGroups[passenger.route] = [];
        }
        routeGroups[passenger.route].push(passenger);
      }

      // Her güzergah grubu için ServiceSchedule oluştur
      for (const [routeName, passengers] of Object.entries(routeGroups)) {
        const route = await ServiceRoute.findOne({ routeName });
        if (!route) continue;

        const passengersWithDetails = [];
        
                 for (const passenger of passengers) {
           const employee = await Employee.findOne({ fullName: passenger.name });
           if (employee) {
             // Çalışanın durak bilgisini al
             const employeeStop = employeeServiceData[routeName]?.find(emp => emp.name === passenger.name);
             
             passengersWithDetails.push({
               employeeId: employee._id,
               employeeName: employee.fullName,
               department: employee.department,
               stopName: employee.serviceInfo?.stopName || employeeStop?.stop || 'Bilinmeyen',
               stopOrder: employee.serviceInfo?.stopOrder || employeeStop?.order || 999,
               boardingStatus: 'BEKLEMEDE' // BEKLEMEDE, BİNDİ, BİNMEDİ, İPTAL (model enum'una uygun)
             });
           }
         }

        // Yolcuları durak sırasına göre sırala
        passengersWithDetails.sort((a, b) => a.stopOrder - b.stopOrder);

        const schedule = new ServiceSchedule({
          // Gerekli alanları ServiceSchedule modeline uygun şekilde ekliyoruz
          title: `${routeName} - ${scheduleData.timeSlot}`,
          startDate: scheduleDate,
          endDate: new Date(scheduleDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 gün sonra (19-24 Ağustos)
          status: 'PLANLANDI', // Artık enum'da mevcut
          createdBy: 'System', // Gerekli alan
          
          // ServiceSchedule modelinin serviceRoutes yapısına uygun
          serviceRoutes: [{
            routeId: route._id,
            routeName: routeName,
            timeSlots: [{
              timeSlot: scheduleData.timeSlot,
              direction: scheduleData.direction,
              passengers: passengersWithDetails.map(p => ({
                employeeId: p.employeeId,
                employeeName: p.employeeName,
                stopName: p.stopName,
                stopOrder: p.stopOrder,
                boardingStatus: p.boardingStatus // Zaten doğru değer set edilmiş
              })),
              vehicle: {
                plateNumber: `34 ABC ${Math.floor(Math.random() * 900) + 100}`, // Demo plaka
                driverName: 'Şoför Ataması Bekleniyor',
                capacity: 50,
                currentLoad: 0
              },
              isActive: true,
              isCompleted: false
            }]
          }],
          
          notes: `Excel verilerinden oluşturulan servis programı - ${routeName}`
        });

        schedules.push(schedule);
      }
    }

    // Programları kaydet
    const savedSchedules = await ServiceSchedule.insertMany(schedules);
    console.log(`✅ ${savedSchedules.length} servis programı oluşturuldu`);

    return savedSchedules;
  } catch (error) {
    console.error('❌ Program oluşturma hatası:', error);
  }
};

// Ana fonksiyon
const updateServiceSystem = async () => {
  await connectDB();
  
  console.log('🚌 Servis sistemi güncelleniyor...');
  console.log('📋 Excel verilerinden detaylı programlar oluşturuluyor...');
  
  await updateEmployeesWithServiceInfo();
  await createServiceSchedules();
  
  console.log('\n🎉 Servis sistemi başarıyla güncellendi!');
  console.log('📊 Sistemde şunlar mevcut:');
  console.log('- Detaylı çalışan-durak eşleştirmeleri');
  console.log('- 19-24 Ağustos 2024 servis programları');
  console.log('- Yolcu listleri ve biniş durumları');
  console.log('- Kendi araç kullanacak çalışan listesi');
  
  process.exit(0);
};

updateServiceSystem(); 