const mongoose = require('mongoose');
const ScheduledList = require('./models/ScheduledList');
const User = require('./models/User');
require('dotenv').config();

// MongoDB bağlantısı
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MONGODB_URI environment variable bulunamadı!');
  process.exit(1);
}

// 📅 Demo Zamanlanmış Liste Verisi Oluştur
const createDemoScheduledLists = async () => {
  try {
    console.log('🚀 Demo zamanlanmış liste verisi oluşturuluyor...');

    // Admin kullanıcı ID'si - gerçek bir kullanıcı olması gerekir
    let adminUser = await User.findOne({ email: 'admin@canga.com' });
    if (!adminUser) {
      // Admin kullanıcı yoksa oluştur
      adminUser = new User({
        name: 'Admin Kullanıcı',
        email: 'admin@canga.com',
        password: 'admin123',
        employeeId: 'ADMIN-001',
        role: 'SUPER_ADMIN',
        department: 'İDARİ BİRİM',
        position: 'Sistem Yöneticisi',
        location: 'MERKEZ ŞUBE',
        isActive: true
      });
      await adminUser.save();
      console.log('👤 Admin kullanıcı oluşturuldu');
    }

    // Mevcut zamanlanmış listeleri temizle
    await ScheduledList.deleteMany({});
    console.log('🗑️ Mevcut zamanlanmış listeler temizlendi');

    const demoScheduledLists = [
      // 1. Günlük Devam Listesi
      {
        name: 'Günlük Devam Listesi - Merkez Şube',
        description: 'Her gün saat 08:30\'da otomatik oluşturulan devam listesi',
        listConfig: {
          type: 'attendance',
          template: 'corporate',
          location: 'MERKEZ ŞUBE',
          timeSlot: '08:00-18:00',
          title: 'Günlük Devam Listesi',
          includeFields: {
            showDepartment: true,
            showPosition: true,
            showSignature: true,
            showTime: true
          }
        },
        filterCriteria: {
          departments: ['TEKNİK OFİS', 'TORNA GRUBU', 'FREZE GRUBU', 'MONTAJ GRUBU'],
          locations: ['MERKEZ ŞUBE'],
          status: 'AKTIF',
          excludeTrainees: true
        },
        schedule: {
          frequency: 'daily',
          time: '08:30',
          timezone: 'Europe/Istanbul'
        },
        notifications: {
          enabled: true,
          recipients: [
            {
              email: 'hr@canga.com',
              name: 'İnsan Kaynakları',
              role: 'HR'
            },
            {
              email: 'manager@canga.com',
              name: 'Vardiya Sorumlusu',
              role: 'Manager'
            }
          ],
          emailTemplate: {
            subject: 'Günlük Devam Listesi - {{date}}',
            message: 'Merkez şube için günlük devam listesi hazırlandı. Liste ekte bulunmaktadır.'
          },
          sendOnCreate: true,
          sendOnError: true
        },
        status: 'active',
        isActive: true,
        createdBy: adminUser._id
      },

      // 2. Haftalık Fazla Mesai Listesi
      {
        name: 'Haftalık Fazla Mesai Raporu',
        description: 'Her Pazartesi saat 09:00\'da önceki haftanın fazla mesai listesi',
        listConfig: {
          type: 'overtime',
          template: 'premium',
          location: 'TÜM ŞUBELERi',
          timeSlot: '18:00-22:00',
          title: 'Haftalık Fazla Mesai Raporu',
          includeFields: {
            showDepartment: true,
            showPosition: true,
            showSignature: true,
            showTime: true
          }
        },
        filterCriteria: {
          departments: [], // Tüm departmanlar
          locations: ['MERKEZ ŞUBE', 'IŞIL ŞUBE', 'OSB ŞUBE'],
          status: 'AKTIF',
          excludeTrainees: false
        },
        schedule: {
          frequency: 'weekly',
          dayOfWeek: 1, // Pazartesi
          time: '09:00',
          timezone: 'Europe/Istanbul'
        },
        notifications: {
          enabled: true,
          recipients: [
            {
              email: 'management@canga.com',
              name: 'Üst Yönetim',
              role: 'Management'
            }
          ],
          emailTemplate: {
            subject: 'Haftalık Fazla Mesai Raporu - {{week}}',
            message: 'Geçen haftanın fazla mesai raporu hazırlandı.'
          }
        },
        status: 'active',
        isActive: true,
        createdBy: adminUser._id
      },

      // 3. Aylık Toplantı Listesi
      {
        name: 'Aylık Genel Toplantı Listesi',
        description: 'Her ayın ilk günü departman yöneticileri için toplantı listesi',
        listConfig: {
          type: 'meeting',
          template: 'executive',
          location: 'MERKEZ ŞUBE - TOPLANTI SALONU',
          timeSlot: '14:00-16:00',
          title: 'Aylık Genel Toplantı',
          includeFields: {
            showDepartment: true,
            showPosition: true,
            showSignature: true,
            showTime: false
          }
        },
        filterCriteria: {
          departments: ['İNSAN KAYNAKLARI', 'TEKNİK OFİS', 'KALİTE KONTROL'],
          locations: ['MERKEZ ŞUBE'],
          positions: ['Müdür', 'Şef', 'Uzman'],
          status: 'AKTIF',
          excludeTrainees: true
        },
        schedule: {
          frequency: 'monthly',
          dayOfMonth: 1,
          time: '10:00',
          timezone: 'Europe/Istanbul'
        },
        notifications: {
          enabled: true,
          recipients: [
            {
              email: 'secretary@canga.com',
              name: 'Sekreterlik',
              role: 'Secretary'
            }
          ]
        },
        status: 'active',
        isActive: true,
        createdBy: adminUser._id
      },

      // 4. Güvenlik Vardiya Listesi
      {
        name: 'Güvenlik Haftalık Vardiya',
        description: 'Güvenlik personeli için haftalık vardiya listesi',
        listConfig: {
          type: 'custom',
          template: 'corporate',
          location: 'TÜM LOKASYONLAR',
          timeSlot: '24 Saat',
          title: 'Güvenlik Vardiya Listesi',
          includeFields: {
            showDepartment: false,
            showPosition: true,
            showSignature: true,
            showTime: true
          }
        },
        filterCriteria: {
          departments: ['GÜVENLİK'],
          locations: ['MERKEZ ŞUBE', 'IŞIL ŞUBE', 'OSB ŞUBE'],
          status: 'AKTIF',
          excludeTrainees: true
        },
        schedule: {
          frequency: 'weekly',
          dayOfWeek: 0, // Pazar
          time: '20:00',
          timezone: 'Europe/Istanbul'
        },
        notifications: {
          enabled: true,
          recipients: [
            {
              email: 'security@canga.com',
              name: 'Güvenlik Müdürü',
              role: 'Security'
            }
          ]
        },
        status: 'active',
        isActive: true,
        createdBy: adminUser._id
      },

      // 5. Eğitim Katılım Listesi (Duraklatılmış)
      {
        name: 'Aylık Eğitim Katılım Listesi',
        description: 'İSG eğitimleri için katılım listesi (şu anda duraklatılmış)',
        listConfig: {
          type: 'training',
          template: 'premium',
          location: 'EĞİTİM SALONU',
          timeSlot: '09:00-17:00',
          title: 'İSG Eğitimi Katılım Listesi'
        },
        filterCriteria: {
          departments: [],
          locations: ['MERKEZ ŞUBE'],
          status: 'AKTIF',
          excludeTrainees: false
        },
        schedule: {
          frequency: 'monthly',
          dayOfMonth: 15,
          time: '08:00',
          timezone: 'Europe/Istanbul'
        },
        notifications: {
          enabled: false
        },
        status: 'paused',
        isActive: false,
        createdBy: adminUser._id
      }
    ];

    // Scheduled list'leri oluştur ve nextRun hesapla
    const createdLists = [];
    for (const listData of demoScheduledLists) {
      const scheduledList = new ScheduledList(listData);
      scheduledList.calculateNextRun();
      
      // İstatistikleri başlat
      scheduledList.stats = {
        totalRuns: Math.floor(Math.random() * 10) + 1,
        successfulRuns: Math.floor(Math.random() * 8) + 1,
        failedRuns: Math.floor(Math.random() * 2),
        lastRun: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Son 7 gün içinde
        averageEmployeeCount: Math.floor(Math.random() * 30) + 10,
        lastGeneratedFileSize: Math.floor(Math.random() * 200000) + 50000
      };
      
      await scheduledList.save();
      createdLists.push(scheduledList);
    }

    console.log(`✅ ${createdLists.length} demo zamanlanmış liste oluşturuldu!`);
    
    // İstatistikleri göster
    const stats = await ScheduledList.getStatistics();
    console.log('\n📊 Zamanlanmış Liste İstatistikleri:');
    console.log(`   📋 Toplam Liste: ${stats.totalSchedules}`);
    console.log(`   ✅ Aktif Liste: ${stats.activeSchedules}`);
    console.log(`   🏃 Toplam Çalışma: ${stats.totalRuns}`);
    console.log(`   ✅ Başarılı Çalışma: ${stats.successfulRuns}`);
    console.log(`   👨‍💼 Ortalama Çalışan: ${Math.round(stats.avgEmployeeCount)}`);
    
    console.log('\n📅 Oluşturulan Zamanlanmış Listeler:');
    createdLists.forEach((list, index) => {
      const nextRunStr = list.stats.nextRun ? 
        list.stats.nextRun.toLocaleDateString('tr-TR') + ' ' + 
        list.stats.nextRun.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) 
        : 'Hesaplanmadı';
      
      const statusEmoji = list.status === 'active' ? '✅' : 
                         list.status === 'paused' ? '⏸️' : 
                         list.status === 'error' ? '❌' : '⏹️';
      
      console.log(`   ${index + 1}. ${statusEmoji} ${list.name}`);
      console.log(`      📅 Sıklık: ${list.schedule.frequency} (${list.schedule.time})`);
      console.log(`      📍 Lokasyon: ${list.listConfig.location}`);
      console.log(`      🔄 Sonraki Çalışma: ${nextRunStr}`);
      console.log(`      📊 Başarı Oranı: ${list.successRate}%`);
    });

  } catch (error) {
    console.error('❌ Demo zamanlanmış liste oluşturma hatası:', error);
  }
};

// Script çalıştır
const runScript = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Atlas bağlantısı başarılı');
    
    await createDemoScheduledLists();
    
    console.log('\n🎉 Demo zamanlanmış liste verisi başarıyla oluşturuldu!');
    console.log('🌐 Backend API\'den kontrol edin: http://localhost:5001/api/scheduled-lists');
    console.log('📊 Analytics Dashboard: http://localhost:3000/analytics');
    
  } catch (error) {
    console.error('❌ Script hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
    process.exit(0);
  }
};

runScript(); 