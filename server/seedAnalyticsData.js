const mongoose = require('mongoose');
const { AnalyticsEvent } = require('./models/Analytics');
require('dotenv').config();

// MongoDB bağlantısı
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MONGODB_URI environment variable bulunamadı!');
  process.exit(1);
}

// 📊 Demo Analytics Verisi Oluştur
const createDemoAnalyticsData = async () => {
  try {
    console.log('🚀 Demo analytics verisi oluşturuluyor...');

    // Mevcut verileri temizle
    await AnalyticsEvent.deleteMany({});
    console.log('🗑️ Mevcut analytics verileri temizlendi');

    const now = new Date();
    const demoEvents = [];

    // Son 30 gün için demo verileri
    for (let i = 30; i >= 0; i--) {
      const eventDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      
      // Her gün için random sayıda event
      const eventCount = Math.floor(Math.random() * 15) + 5; // 5-20 arası event
      
      for (let j = 0; j < eventCount; j++) {
        const hour = Math.floor(Math.random() * 16) + 8; // 08:00-23:00 arası
        const eventTimestamp = new Date(eventDate);
        eventTimestamp.setHours(hour, Math.floor(Math.random() * 60));

        // Random event türü
        const eventTypes = [
          'list_created',
          'list_downloaded', 
          'template_selected',
          'filter_applied',
          'employee_selected',
          'page_view'
        ];
        
        const templates = ['corporate', 'premium', 'executive'];
        const listTypes = ['attendance', 'overtime', 'meeting', 'training', 'project', 'custom'];
        const departments = [
          'İNSAN KAYNAKLARI', 'TEKNİK OFİS', 'TORNA GRUBU', 'FREZE GRUBU', 
          'MONTAJ GRUBU', 'KALİTE KONTROL', 'DEPO & LOJİSTİK', 'GÜVENLİK',
          'TEMİZLİK', 'YEMEKHANE', 'SAĞLIK BİRİMİ', 'BİLGİ İŞLEM'
        ];
        const locations = ['MERKEZ ŞUBE', 'IŞIL ŞUBE', 'OSB ŞUBE'];

        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        let listDetails = {};
        if (eventType === 'list_created' || eventType === 'list_downloaded') {
          listDetails = {
            type: listTypes[Math.floor(Math.random() * listTypes.length)],
            template: templates[Math.floor(Math.random() * templates.length)],
            employeeCount: Math.floor(Math.random() * 50) + 10, // 10-60 çalışan
            location: locations[Math.floor(Math.random() * locations.length)],
            departments: [departments[Math.floor(Math.random() * departments.length)]],
            fileSize: Math.floor(Math.random() * 500000) + 100000, // 100KB-600KB
            generationTime: Math.floor(Math.random() * 3000) + 500 // 500-3500ms
          };
        }

        const demoEvent = {
          eventType,
          listDetails,
          userInfo: {
            department: departments[Math.floor(Math.random() * departments.length)],
            role: Math.random() > 0.7 ? 'admin' : 'user',
            location: locations[Math.floor(Math.random() * locations.length)]
          },
          sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          deviceInfo: {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            platform: Math.random() > 0.7 ? 'MacIntel' : 'Win32',
            browser: Math.random() > 0.5 ? 'Chrome' : 'Safari',
            isMobile: Math.random() > 0.8,
            screenResolution: Math.random() > 0.5 ? '1920x1080' : '1366x768'
          },
          performance: {
            pageLoadTime: Math.floor(Math.random() * 3000) + 500,
            apiResponseTime: Math.floor(Math.random() * 500) + 100,
            renderTime: Math.floor(Math.random() * 1000) + 200,
            memoryUsage: Math.floor(Math.random() * 2000000000) + 1000000000 // 1-3GB
          },
          timestamp: eventTimestamp,
          metadata: {
            page: eventType === 'page_view' ? 'quick_list' : null,
            filters: eventType === 'filter_applied' ? {
              search: Math.random() > 0.5,
              department: Math.random() > 0.7 ? departments[0] : null,
              location: Math.random() > 0.8 ? locations[0] : null
            } : null
          }
        };

        demoEvents.push(demoEvent);
      }
    }

    // Verileri kaydet
    await AnalyticsEvent.insertMany(demoEvents);
    
    console.log(`✅ ${demoEvents.length} demo analytics eventi oluşturuldu!`);
    
    // İstatistikleri göster
    const stats = await AnalyticsEvent.getDashboardStats('30d');
    console.log('📊 Oluşturulan veriler:');
    console.log(`   🎯 Toplam Event: ${stats.totalEvents}`);
    console.log(`   👥 Unique Users: ${stats.uniqueUsers}`);
    console.log(`   📋 Liste Oluşturuldu: ${stats.listsCreated}`);
    console.log(`   ⬇️ Liste İndirildi: ${stats.listsDownloaded}`);
    console.log(`   👨‍💼 Ortalama Çalışan: ${stats.avgEmployeeCount}`);
    console.log(`   📁 Toplam Dosya Boyutu: ${stats.totalFileSize} MB`);
    
    // Şablon kullanımı
    const templateUsage = await AnalyticsEvent.getUsageByTemplate('30d');
    console.log('\n🎨 Şablon Kullanımı:');
    templateUsage.forEach(template => {
      console.log(`   ${template.template}: ${template.count} kullanım`);
    });
    
    // Departman kullanımı
    const departmentUsage = await AnalyticsEvent.getUsageByDepartment('30d');
    console.log('\n🏢 En Aktif Departmanlar:');
    departmentUsage.slice(0, 5).forEach((dept, index) => {
      console.log(`   ${index + 1}. ${dept.department}: ${dept.count} liste`);
    });

  } catch (error) {
    console.error('❌ Demo verisi oluşturma hatası:', error);
  }
};

// Script çalıştır
const runScript = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Atlas bağlantısı başarılı');
    
    await createDemoAnalyticsData();
    
    console.log('\n🎉 Demo analytics verisi başarıyla oluşturuldu!');
    console.log('🌐 Frontend\'i açın ve Analytics Dashboard\'u kontrol edin: http://localhost:3000/analytics');
    
  } catch (error) {
    console.error('❌ Script hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
    process.exit(0);
  }
};

runScript(); 