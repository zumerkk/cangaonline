const mongoose = require('mongoose');
const Employee = require('./models/Employee');
require('dotenv').config();

// Excel resimlerinden çıkardığım tüm çalışan verileri
const employeesData = [
  // MERKEZ ŞUBE - TORNA GRUBU
  {
    firstName: 'SONER',
    lastName: 'GÜRSOY',
    employeeId: 'TORNA-001',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2023-01-15')
  },
  {
    firstName: 'MERT',
    lastName: 'SÜNBÜL',
    employeeId: 'TORNA-002',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-16:00', priority: 1 }],
    hireDate: new Date('2022-03-10')
  },
  {
    firstName: 'BERAT',
    lastName: 'SUSAR',
    employeeId: 'TORNA-003',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-16:00', priority: 1 }],
    hireDate: new Date('2022-06-20')
  },
  {
    firstName: 'AHMET DURAN',
    lastName: 'TUNA',
    employeeId: 'TORNA-004',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [
      { shiftType: '08:00-16:00', priority: 1 },
      { shiftType: '16:00-24:00', priority: 2 }
    ],
    hireDate: new Date('2021-09-05')
  },
  {
    firstName: 'MUZAFFER',
    lastName: 'KIZILÇIÇEK',
    employeeId: 'TORNA-005',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-16:00', priority: 1 }],
    hireDate: new Date('2023-02-12')
  },
  {
    firstName: 'SEFA',
    lastName: 'PEHLİVANLI',
    employeeId: 'TORNA-006',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '16:00-24:00', priority: 1 }],
    hireDate: new Date('2022-11-08')
  },
  {
    firstName: 'HULUSİ EREN',
    lastName: 'CAN',
    employeeId: 'TORNA-007',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '16:00-24:00', priority: 1 }],
    hireDate: new Date('2023-01-20')
  },
  {
    firstName: 'VEYSEL EMRE',
    lastName: 'TOZLU',
    employeeId: 'TORNA-008',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '16:00-24:00', priority: 1 }],
    hireDate: new Date('2022-08-15')
  },
  {
    firstName: 'MUSTAFA',
    lastName: 'BIYIK',
    employeeId: 'TORNA-009',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '16:00-24:00', priority: 1 }],
    hireDate: new Date('2023-03-25')
  },
  {
    firstName: 'MESUT',
    lastName: 'TUNCER',
    employeeId: 'TORNA-010',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '24:00-08:00', priority: 1 }],
    hireDate: new Date('2021-12-01')
  },
  {
    firstName: 'AZİZ BUĞRA',
    lastName: 'KARA',
    employeeId: 'TORNA-011',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '24:00-08:00', priority: 1 }],
    hireDate: new Date('2022-04-18')
  },
  {
    firstName: 'BERAT',
    lastName: 'AKTAŞ',
    employeeId: 'TORNA-012',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '24:00-08:00', priority: 1 }],
    hireDate: new Date('2023-05-10')
  },
  {
    firstName: 'BİRKAN',
    lastName: 'ŞEKER',
    employeeId: 'TORNA-013',
    department: 'TORNA GRUBU',
    position: 'Torna Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '24:00-08:00', priority: 1 }],
    hireDate: new Date('2022-07-30')
  },

  // FREZE GRUBU
  {
    firstName: 'MEHMET',
    lastName: 'ERTAŞ',
    employeeId: 'FREZE-001',
    department: 'FREZE GRUBU',
    position: 'Freze Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-16:00', priority: 1 }],
    hireDate: new Date('2022-02-14')
  },
  {
    firstName: 'CELAL',
    lastName: 'GÜLŞEN',
    employeeId: 'FREZE-002',
    department: 'FREZE GRUBU',
    position: 'Freze Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-16:00', priority: 1 }],
    hireDate: new Date('2021-11-22')
  },
  {
    firstName: 'EMİR KAAN',
    lastName: 'BAŞER',
    employeeId: 'FREZE-003',
    department: 'FREZE GRUBU',
    position: 'Freze Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '16:00-24:00', priority: 1 }],
    hireDate: new Date('2023-01-08')
  },
  {
    firstName: 'MEHMET ALİ',
    lastName: 'ÖZÇELİK',
    employeeId: 'FREZE-004',
    department: 'FREZE GRUBU',
    position: 'Freze Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '16:00-24:00', priority: 1 }],
    hireDate: new Date('2022-09-12')
  },
  {
    firstName: 'ERDAL',
    lastName: 'YAKUT',
    employeeId: 'FREZE-005',
    department: 'FREZE GRUBU',
    position: 'Freze Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '24:00-08:00', priority: 1 }],
    hireDate: new Date('2021-08-19')
  },
  {
    firstName: 'YASİN',
    lastName: 'SAYGILI',
    employeeId: 'FREZE-006',
    department: 'FREZE GRUBU',
    position: 'Freze Tezgahı Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '24:00-08:00', priority: 1 }],
    hireDate: new Date('2022-12-05')
  },

  // GENEL ÇALIŞMA GRUBU
  {
    firstName: 'ZAFER NURİ',
    lastName: 'ÖZKAN',
    employeeId: 'GENEL-001',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-05-10')
  },
  {
    firstName: 'MUSTAFA',
    lastName: 'SAMURKOLLU',
    employeeId: 'GENEL-002',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2022-01-25')
  },

  // TESTERE GRUBU
  {
    firstName: 'AHMET',
    lastName: 'ÇANGA',
    employeeId: 'TESTERE-001',
    department: 'TESTERE',
    position: 'Testere Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-06-15')
  },
  {
    firstName: 'UĞUR',
    lastName: 'ALBAYRAK',
    employeeId: 'TESTERE-002',
    department: 'TESTERE',
    position: 'Testere Operatörü',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-04-20')
  },

  // BAKIM VE ONARIM
  {
    firstName: 'ÖZKAN',
    lastName: 'AYDIN',
    employeeId: 'BAKIM-001',
    department: 'BAKIM VE ONARIM',
    position: 'Bakım Teknisyeni',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-03-12')
  },
  {
    firstName: 'İSMET',
    lastName: 'BAŞER',
    employeeId: 'BAKIM-002',
    department: 'BAKIM VE ONARIM',
    position: 'Bakım Teknisyeni',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-07-08')
  },

  // İDARİ BİRİM
  {
    firstName: 'Mine',
    lastName: 'KARAOĞLU',
    employeeId: 'IDARI-001',
    department: 'İDARİ BİRİM',
    position: 'İnsan Kaynakları Uzmanı',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-01-15')
  },
  {
    firstName: 'Aynur',
    lastName: 'AYTEKİN',
    employeeId: 'IDARI-002',
    department: 'İDARİ BİRİM',
    position: 'Muhasebe Uzmanı',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2019-09-20')
  },
  {
    firstName: 'Burcu',
    lastName: 'KARAKOÇ',
    employeeId: 'IDARI-003',
    department: 'İDARİ BİRİM',
    position: 'İdari Personel',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-02-10')
  },
  {
    firstName: 'Gülnur',
    lastName: 'AĞIRMAN',
    employeeId: 'IDARI-004',
    department: 'İDARİ BİRİM',
    position: 'Sekreter',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-11-03')
  },
  {
    firstName: 'Mustafa',
    lastName: 'SAMURKOLLU',
    employeeId: 'IDARI-005',
    department: 'İDARİ BİRİM',
    position: 'İdari Personel',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-06-18')
  },
  {
    firstName: 'Zafer Nuri',
    lastName: 'ÖZKAN',
    employeeId: 'IDARI-006',
    department: 'İDARİ BİRİM',
    position: 'İdari Personel',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-08-25')
  },

  // TEKNİK OFİS / BAKIM ONARIM
  {
    firstName: 'Bahadır',
    lastName: 'AKKÜL',
    employeeId: 'TEKNIK-001',
    department: 'TEKNİK OFİS',
    position: 'Teknik Ressam',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2019-12-01')
  },
  {
    firstName: 'Dilara Berra',
    lastName: 'YILDIRIM',
    employeeId: 'TEKNIK-002',
    department: 'TEKNİK OFİS',
    position: 'Teknik Ressam',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-03-15')
  },
  {
    firstName: 'Muhammed Zümer',
    lastName: 'KEKİLLİOĞLU',
    employeeId: 'TEKNIK-003',
    department: 'TEKNİK OFİS',
    position: 'Proje Yöneticisi',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2018-08-20')
  },
  {
    firstName: 'Emir',
    lastName: 'GÖÇÜK',
    employeeId: 'TEKNIK-004',
    department: 'TEKNİK OFİS',
    position: 'Teknik Personel',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-01-10')
  },
  {
    firstName: 'Hüdagül',
    lastName: 'DEĞİRMENCİ',
    employeeId: 'TEKNIK-005',
    department: 'TEKNİK OFİS',
    position: 'Teknik Personel',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-05-22')
  },
  {
    firstName: 'İsmet',
    lastName: 'BAŞER',
    employeeId: 'TEKNIK-006',
    department: 'TEKNİK OFİS',
    position: 'Teknik Personel',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2019-11-05')
  },
  {
    firstName: 'Murat',
    lastName: 'SEPETÇİ',
    employeeId: 'TEKNIK-007',
    department: 'TEKNİK OFİS',
    position: 'Usta/Ustabaşı',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2018-04-12')
  },
  {
    firstName: 'Özkan',
    lastName: 'AYDIN',
    employeeId: 'TEKNIK-008',
    department: 'TEKNİK OFİS',
    position: 'Teknik Personel',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-02-28')
  },
  {
    firstName: 'Yılmaz Yağız',
    lastName: 'ERÇETİN',
    employeeId: 'TEKNIK-009',
    department: 'TEKNİK OFİS',
    position: 'Teknik Personel',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-09-14')
  },

  // KALİTE KONTROL
  {
    firstName: 'Celal',
    lastName: 'BARAN',
    employeeId: 'KALITE-001',
    department: 'KALİTE KONTROL',
    position: 'Kalite Kontrol Uzmanı',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2019-06-08')
  },
  {
    firstName: 'Emre',
    lastName: 'ÇİÇEK',
    employeeId: 'KALITE-002',
    department: 'KALİTE KONTROL',
    position: 'Kalite Kontrol Teknisyeni',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-10-15')
  },
  {
    firstName: 'Kamil Batuhan',
    lastName: 'BEVGO',
    employeeId: 'KALITE-003',
    department: 'KALİTE KONTROL',
    position: 'Kalite Kontrol Teknisyeni',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-12-20')
  },
  {
    firstName: 'Sadullah',
    lastName: 'AKBAYIR',
    employeeId: 'KALITE-004',
    department: 'KALİTE KONTROL',
    position: 'Kalite Kontrol Teknisyeni',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-07-30')
  },

  // IŞIL ŞUBE ÇALIŞANLARI
  {
    firstName: 'CİHAN',
    lastName: 'ÇELEBİ',
    employeeId: 'ISIL-001',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'IŞIL ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-16:00', priority: 1 }],
    hireDate: new Date('2022-02-21')
  },
  {
    firstName: 'YUSUF',
    lastName: 'GÜRBÜZ',
    employeeId: 'ISIL-002',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'IŞIL ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-16:00', priority: 1 }],
    hireDate: new Date('2021-11-10')
  },
  {
    firstName: 'KEMALETTİN',
    lastName: 'GÜLEŞEN',
    employeeId: 'ISIL-003',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'IŞIL ŞUBE',
    shiftPreferences: [{ shiftType: '16:00-24:00', priority: 1 }],
    hireDate: new Date('2022-03-15')
  },
  {
    firstName: 'EMRAH',
    lastName: 'KOLUKISA',
    employeeId: 'ISIL-004',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'IŞIL ŞUBE',
    shiftPreferences: [{ shiftType: '16:00-24:00', priority: 1 }],
    hireDate: new Date('2021-08-22')
  },
  {
    firstName: 'SALİH',
    lastName: 'GÖZÜAK',
    employeeId: 'ISIL-005',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'IŞIL ŞUBE',
    shiftPreferences: [
      { shiftType: '16:00-24:00', priority: 1 },
      { shiftType: '08:00-20:00', priority: 2 }
    ],
    hireDate: new Date('2021-12-01')
  },
  {
    firstName: 'ÇAĞRI',
    lastName: 'YILDIZ',
    employeeId: 'ISIL-006',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'IŞIL ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-20:00', priority: 1 }],
    hireDate: new Date('2022-01-18')
  },
  {
    firstName: 'ÜMİT',
    lastName: 'SAZAK',
    employeeId: 'ISIL-007',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'IŞIL ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-20:00', priority: 1 }],
    hireDate: new Date('2022-05-09')
  },
  {
    firstName: 'EYÜP',
    lastName: 'ÜNVANLI',
    employeeId: 'ISIL-008',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'IŞIL ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-16:00', priority: 1 }],
    hireDate: new Date('2023-03-05')
  },

  // STAJYER ÖĞRENCİ LİSE
  {
    firstName: 'ABDULBAKİ',
    lastName: 'ÖZESEN',
    employeeId: 'STAJYER-001',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-10'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'ESAD',
    lastName: 'ÇİDEM',
    employeeId: 'STAJYER-002',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-10'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'İLYAS',
    lastName: 'CURTAY',
    employeeId: 'STAJYER-003',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-10'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'KUTLUAY',
    lastName: 'AKYEL',
    employeeId: 'STAJYER-004',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-10'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'ALİ',
    lastName: 'AYDOĞDU',
    employeeId: 'STAJYER-005',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-07'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'HANİFE',
    lastName: 'GÜNDOĞDU',
    employeeId: 'STAJYER-006',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-07'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'HANİFİ MERT',
    lastName: 'ÜRÜN',
    employeeId: 'STAJYER-007',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-07'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'MUHAMMED AKIN',
    lastName: 'KARABULUT',
    employeeId: 'STAJYER-008',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-07'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'MUHAMMED SEFA',
    lastName: 'PEHLİVANLI',
    employeeId: 'STAJYER-009',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-07'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'OĞUZ EFE',
    lastName: 'ZORLU',
    employeeId: 'STAJYER-010',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-07'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'YASİN',
    lastName: 'SAYGILI',
    employeeId: 'STAJYER-011',
    department: 'STAJYERLİK',
    position: 'Stajyer Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-07'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },

  // OSB ŞUBE ÇALIŞANLARI (PDF'den)
  {
    firstName: 'BATUHAN',
    lastName: 'İLHAN',
    employeeId: 'OSB-001',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-05-26')
  },
  {
    firstName: 'ASIM',
    lastName: 'DEMET',
    employeeId: 'OSB-002',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-08-12')
  },
  {
    firstName: 'EYÜP',
    lastName: 'ÜNVANLI',
    employeeId: 'OSB-003',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2022-01-20')
  },
  {
    firstName: 'MURAT',
    lastName: 'GENCER',
    employeeId: 'OSB-004',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-11-15')
  },
  {
    firstName: 'ALİ ŞIH',
    lastName: 'YORULMAZ',
    employeeId: 'OSB-005',
    department: 'FREZE GRUBU',
    position: 'Freze Operatörü',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2022-03-08')
  },
  {
    firstName: 'AHMET',
    lastName: 'ÇELİK',
    employeeId: 'OSB-006',
    department: 'FREZE GRUBU',
    position: 'Freze Operatörü',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-09-22')
  },
  {
    firstName: 'ABBAS',
    lastName: 'CANAÖNGER',
    employeeId: 'OSB-007',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2022-05-14')
  },
  {
    firstName: 'CİHAN',
    lastName: 'ÇELEBİ',
    employeeId: 'OSB-008',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-12-03')
  },
  {
    firstName: 'MUSTAFA',
    lastName: 'SİMER',
    employeeId: 'OSB-009',
    department: 'BAKIM VE ONARIM',
    position: 'Bakım Teknisyeni',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-08-17')
  },
  {
    firstName: 'AHMET',
    lastName: 'İLGİN',
    employeeId: 'OSB-010',
    department: 'BAKIM VE ONARIM',
    position: 'Bakım Teknisyeni',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-04-25')
  },
  {
    firstName: 'AHMET',
    lastName: 'ŞAHİN',
    employeeId: 'OSB-011',
    department: 'BAKIM VE ONARIM',
    position: 'Bakım Teknisyeni',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2022-02-11')
  },
  {
    firstName: 'ALİ ÇAVUŞ',
    lastName: 'BAŞTUĞ',
    employeeId: 'OSB-012',
    department: 'BAKIM VE ONARIM',
    position: 'Usta',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2020-06-30')
  },
  {
    firstName: 'ALİ',
    lastName: 'GÜRBÜZ',
    employeeId: 'OSB-013',
    department: 'BAKIM VE ONARIM',
    position: 'Bakım Teknisyeni',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-10-12')
  },
  {
    firstName: 'ALİ',
    lastName: 'ÖKSÜZ',
    employeeId: 'OSB-014',
    department: 'BAKIM VE ONARIM',
    position: 'Bakım Teknisyeni',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2022-07-18')
  },
  {
    firstName: 'MUSTAFA',
    lastName: 'BAŞKAYA',
    employeeId: 'OSB-015',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-03-28')
  },
  {
    firstName: 'NİYAZİ',
    lastName: 'YURTSEVEN',
    employeeId: 'OSB-016',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2022-04-05')
  },
  {
    firstName: 'ERKAN',
    lastName: 'GÜLLEÇ',
    employeeId: 'OSB-017',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-09-10')
  },
  {
    firstName: 'SEFA',
    lastName: 'ÖZTURK',
    employeeId: 'OSB-018',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2022-01-14')
  },
  {
    firstName: 'SÜLEYMAN',
    lastName: 'GÖZÜAK',
    employeeId: 'OSB-019',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-12-22')
  },
  {
    firstName: 'ÜMİT',
    lastName: 'DEMİRKEL',
    employeeId: 'OSB-020',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-11-08')
  },
  {
    firstName: 'ÜMİT',
    lastName: 'TORUN',
    employeeId: 'OSB-021',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2022-02-28')
  },
  {
    firstName: 'YAŞAR',
    lastName: 'ÇETİN',
    employeeId: 'OSB-022',
    department: 'GENEL ÇALIŞMA GRUBU',
    position: 'Genel İşçi',
    location: 'OSB ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2021-07-16')
  },

  // ÇIRAK LİSE ÖĞRENCİLERİ
  {
    firstName: 'Abdullah',
    lastName: 'YÖNDEMLİ',
    employeeId: 'CIRAK-001',
    department: 'ÇIRAK LİSE',
    position: 'Çırak Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-26'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'Ali Osman',
    lastName: 'ÇİÇEK',
    employeeId: 'CIRAK-002',
    department: 'ÇIRAK LİSE',
    position: 'Çırak Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-26'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'Elvan Taha',
    lastName: 'TÜRE',
    employeeId: 'CIRAK-003',
    department: 'ÇIRAK LİSE',
    position: 'Çırak Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-26'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'Gökhan',
    lastName: 'YORULMAZ',
    employeeId: 'CIRAK-004',
    department: 'ÇIRAK LİSE',
    position: 'Çırak Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-26'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'Halil İbrahim',
    lastName: 'GÜRBÜZ',
    employeeId: 'CIRAK-005',
    department: 'ÇIRAK LİSE',
    position: 'Çırak Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-26'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'Recep Furkan',
    lastName: 'BAŞTUĞ',
    employeeId: 'CIRAK-006',
    department: 'ÇIRAK LİSE',
    position: 'Çırak Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-26'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  },
  {
    firstName: 'Vehbi Vefa',
    lastName: 'DEMET',
    employeeId: 'CIRAK-007',
    department: 'ÇIRAK LİSE',
    position: 'Çırak Öğrenci',
    location: 'MERKEZ ŞUBE',
    shiftPreferences: [{ shiftType: '08:00-18:00', priority: 1 }],
    hireDate: new Date('2024-06-26'),
    canWorkNightShift: false,
    canWorkOvertimeShift: false
  }
];

// MongoDB'ye bağlan ve verileri ekle
async function seedDatabase() {
  try {
    console.log('📡 MongoDB Atlas\'a bağlanılıyor...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable tanımlanmamış!');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas bağlantısı başarılı! 🌐');
    console.log('📍 Atlas Cluster: canga.rgadvdl.mongodb.net');

    // Mevcut çalışanları temizle (sadece geliştirme ortamında)
    if (process.env.NODE_ENV === 'development') {
      await Employee.deleteMany({});
      console.log('🗑️  Mevcut çalışan verileri temizlendi');
    }

    // Çalışanları toplu olarak ekle
    const createdEmployees = await Employee.insertMany(employeesData);
    console.log(`✅ ${createdEmployees.length} çalışan başarıyla eklendi!`);

    // İstatistikleri göster
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          locations: { $addToSet: '$location' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Departman İstatistikleri:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} kişi (${stat.locations.join(', ')})`);
    });

    console.log('\n🎉 Veritabanı başarıyla dolduruldu!');
    console.log('📝 Toplam çalışan sayısı:', createdEmployees.length);

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 MongoDB bağlantısı kapatıldı');
  }
}

// Eğer bu dosya direkt çalıştırılıyorsa seed'i çalıştır
if (require.main === module) {
  seedDatabase();
}

module.exports = { employeesData, seedDatabase };