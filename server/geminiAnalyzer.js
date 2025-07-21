const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyD3e2ojC42Wuw_ADqngDDBxkZvg0TsFXgk';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

class CangaDataAnalyzer {
  constructor() {
    this.employees = [];
    this.analysisResults = {};
  }

  // 🔄 Veritabanından çalışan verilerini al
  async loadEmployeeData() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga_vardiya');
      console.log('✅ MongoDB bağlantısı başarılı');
      
      this.employees = await Employee.find({}).lean();
      console.log(`📊 ${this.employees.length} çalışan verisi yüklendi\n`);
      
      return this.employees;
    } catch (error) {
      console.error('❌ Veri yükleme hatası:', error);
      throw error;
    }
  }

  // 🤖 Gemini AI ile isim benzerlik analizi
  async analyzeNameSimilarities() {
    console.log('🔍 İsim benzerlik analizi başlıyor...');
    
    const names = this.employees.map(emp => emp.adSoyad).join('\n');
    
    const prompt = `
TÜRKÇE ÇALIŞAN İSİMLERİ ANALİZİ:

Aşağıdaki çalışan isimlerini analiz et ve şunları tespit et:

1. ÇOK BENZERLİKLER: Aynı kişi olabilecek farklı yazılmış isimler
2. YAZIM HATALARI: Potansiyel klavye hataları veya yanlış yazımlar  
3. DUPLİKAT ADAYLAR: Aynı ad-soyad kombinasyonları
4. TUTARSIZLIKLAR: Farklı yazım stilleri (büyük/küçük harf vb.)

İsimler:
${names}

ÇIKTI FORMATI (JSON):
{
  "benzerlikler": [
    {
      "grup": ["İsim 1", "İsim 2"],
      "benzerlik_orani": 95,
      "muhtemel_sebep": "Yazım hatası",
      "oneri": "İsim 1 olarak birleştir"
    }
  ],
  "duplikatlar": [
    {
      "isim": "Tam Aynı İsim",
      "adet": 2,
      "oneri": "TC No kontrolü gerekli"
    }
  ],
  "yazim_hatalari": [
    {
      "yanlis": "Yanlış İsim",
      "dogru": "Doğru İsim",
      "guven": 90
    }
  ],
  "genel_degerlendirme": "Kısa özet ve öneriler"
}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // JSON parse etmeye çalış
      let analysis;
      try {
        // JSON kısmını çıkar
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          analysis = { genel_degerlendirme: response };
        }
      } catch (parseError) {
        analysis = { 
          genel_degerlendirme: response,
          parse_hatasi: "JSON formatında dönemedi"
        };
      }

      this.analysisResults.nameSimilarities = analysis;
      console.log('✅ İsim analizi tamamlandı\n');
      return analysis;
    } catch (error) {
      console.error('❌ Gemini API hatası:', error);
      return { hata: error.message };
    }
  }

  // 🔍 TC No ve veri tutarlılık analizi
  async analyzeDataConsistency() {
    console.log('🔍 Veri tutarlılık analizi başlıyor...');
    
    const employeeData = this.employees.map(emp => ({
      isim: emp.adSoyad,
      tcNo: emp.tcNo,
      departman: emp.departman,
      lokasyon: emp.lokasyon,
      pozisyon: emp.pozisyon,
      durum: emp.durum
    }));

    const prompt = `
ÇANGA FABRİKA ÇALIŞAN VERİLERİ TUTARLILIK ANALİZİ:

Aşağıdaki çalışan verilerini analiz et ve şunları tespit et:

1. TC NO SORUNLARI: Geçersiz, eksik veya duplicate TC numaraları
2. DEPARTMAN TUTARSIZLIKLARI: Farklı yazılmış aynı departmanlar
3. LOKASYON HATALARI: Geçersiz veya tutarsız lokasyonlar
4. VERİ EKSİKLİKLERİ: Boş veya null alanlar
5. İŞ MANTIK HATALARI: Departman-lokasyon uyumsuzlukları

Veriler:
${JSON.stringify(employeeData, null, 2)}

BEKLENEN DEPARTMANLAR: MERKEZ FABRİKA, İŞİ_FABRİKA, ARGE, TEKNİK OFİS / BAKIM ONARIM, İDARİ, DİĞER
BEKLENEN LOKASYONLAR: MERKEZ, İŞL, OSB

ÇIKTI FORMATI (JSON):
{
  "tc_no_sorunlari": [
    {
      "isim": "Çalışan İsmi",
      "tc_no": "12345678901",
      "sorun": "Geçersiz format",
      "oneri": "Düzeltme önerisi"
    }
  ],
  "departman_sorunlari": [
    {
      "isim": "Çalışan İsmi", 
      "departman": "Yanlış Departman",
      "oneri": "Doğru departman"
    }
  ],
  "lokasyon_sorunlari": [],
  "eksik_veriler": [],
  "mantik_hatalari": [],
  "istatistikler": {
    "toplam_kayit": 0,
    "sorunlu_kayit": 0,
    "temiz_kayit": 0
  },
  "genel_degerlendirme": "Özet ve öneriler"
}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      let analysis;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          analysis = { genel_degerlendirme: response };
        }
      } catch (parseError) {
        analysis = { 
          genel_degerlendirme: response,
          parse_hatasi: "JSON formatında dönemedi"
        };
      }

      this.analysisResults.dataConsistency = analysis;
      console.log('✅ Veri tutarlılık analizi tamamlandı\n');
      return analysis;
    } catch (error) {
      console.error('❌ Gemini API hatası:', error);
      return { hata: error.message };
    }
  }

  // 📊 Excel vs Database karşılaştırma
  async compareWithExcelData(excelNames) {
    console.log('🔍 Excel-Database karşılaştırma analizi başlıyor...');
    
    const dbNames = this.employees.map(emp => emp.adSoyad);
    
    const prompt = `
EXCEL VE VERİTABANI KARŞILAŞTIRMA ANALİZİ:

Excel'deki isimler ile veritabanındaki isimleri karşılaştır ve şunları tespit et:

1. EKSİK İSİMLER: Excel'de olup veritabanında olmayan
2. FAZLA İSİMLER: Veritabanında olup Excel'de olmayan  
3. YAYIN FARKLILIKLARI: Benzer ama farklı yazılmış isimler
4. EŞLEŞTİRME ÖNERİLERİ: Hangi isimlerin aynı kişi olabileceği

EXCEL İSİMLERİ:
${excelNames.join('\n')}

VERİTABANI İSİMLERİ:
${dbNames.join('\n')}

ÇIKTI FORMATI (JSON):
{
  "eksik_isimler": ["Excel'de var, DB'de yok"],
  "fazla_isimler": ["DB'de var, Excel'de yok"],
  "potansiyel_eslesmeler": [
    {
      "excel_isim": "Excel İsmi",
      "db_isim": "DB İsmi", 
      "benzerlik": 85,
      "oneri": "Aynı kişi olabilir"
    }
  ],
  "istatistikler": {
    "excel_toplam": 0,
    "db_toplam": 0,
    "eslesen": 0,
    "eksik": 0,
    "fazla": 0
  },
  "genel_degerlendirme": "Karşılaştırma özeti ve öneriler"
}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      let analysis;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          analysis = { genel_degerlendirme: response };
        }
      } catch (parseError) {
        analysis = { 
          genel_degerlendirme: response,
          parse_hatasi: "JSON formatında dönemedi"
        };
      }

      this.analysisResults.excelComparison = analysis;
      console.log('✅ Excel karşılaştırma analizi tamamlandı\n');
      return analysis;
    } catch (error) {
      console.error('❌ Gemini API hatası:', error);
      return { hata: error.message };
    }
  }

  // 🎯 Akıllı temizleme önerileri
  async generateCleanupSuggestions() {
    console.log('🔍 Akıllı temizleme önerileri oluşturuluyor...');
    
    const allResults = JSON.stringify(this.analysisResults, null, 2);
    
    const prompt = `
ÇANGA FABRİKA VERİ TEMİZLEME STRATEJİSİ:

Aşağıdaki analiz sonuçlarına dayanarak kapsamlı bir veri temizleme stratejisi oluştur:

ANALİZ SONUÇLARI:
${allResults}

ÖNERİLER İÇİN:
1. ÖNCELİK SIRASI: Hangi sorunlar önce çözülmeli
2. ADIM ADIM PLAN: Nasıl ilerlemeli
3. RİSK DEĞERLENDİRMESİ: Hangi işlemler riskli
4. YEDEKLEME ÖNERİLERİ: Neleri yedeklemeli
5. DOĞRULAMA YÖNTEMLERİ: Sonuçları nasıl kontrol etmeli

ÇIKTI FORMATI (JSON):
{
  "oncelik_sirasi": [
    {
      "sira": 1,
      "konu": "TC No duplikatları",
      "aciliyet": "Yüksek",
      "etki": "Kritik",
      "tahmini_sure": "30 dakika"
    }
  ],
  "adim_adim_plan": [
    {
      "adim": 1,
      "baslik": "Veri Yedekleme",
      "detay": "Mevcut veritabanını yedekle",
      "komutlar": ["mongodump komutu"],
      "dikkat_edilecekler": ["Yedek lokasyonu"]
    }
  ],
  "risk_degerlendirmesi": {
    "yuksek_risk": ["Veri kaybı riski olan işlemler"],
    "orta_risk": ["Geri dönüşü zor işlemler"],
    "dusuk_risk": ["Güvenli işlemler"]
  },
  "dogrulama_yontemleri": [
    "Kayıt sayısı kontrolü",
    "Sample veri kontrolü"
  ],
  "genel_strateji": "Kapsamlı açıklama ve öneriler"
}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      let suggestions;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          suggestions = { genel_strateji: response };
        }
      } catch (parseError) {
        suggestions = { 
          genel_strateji: response,
          parse_hatasi: "JSON formatında dönemedi"
        };
      }

      this.analysisResults.cleanupSuggestions = suggestions;
      console.log('✅ Temizleme önerileri oluşturuldu\n');
      return suggestions;
    } catch (error) {
      console.error('❌ Gemini API hatası:', error);
      return { hata: error.message };
    }
  }

  // 📝 Kapsamlı rapor oluştur
  generateReport() {
    const report = {
      tarih: new Date().toISOString(),
      analiz_turu: 'Çanga Fabrika Çalışan Veri Analizi',
      toplam_kayit: this.employees.length,
      analizler: this.analysisResults,
      ozet: {
        isim_benzerlik_sayisi: this.analysisResults.nameSimilarities?.benzerlikler?.length || 0,
        tutarlilik_sorunu_sayisi: this.analysisResults.dataConsistency?.sorunlu_kayit || 0,
        excel_eksik_sayisi: this.analysisResults.excelComparison?.istatistikler?.eksik || 0
      }
    };
    
    return report;
  }

  // 🚀 Tam analiz çalıştır
  async runFullAnalysis(excelNames = []) {
    try {
      console.log('🚀 ÇANGA VERİ ANALİZ SİSTEMİ BAŞLIYOR...\n');
      console.log('🤖 Gemini AI ile Akıllı Veri Analizi\n');
      
      // 1. Veri yükle
      await this.loadEmployeeData();
      
      // 2. İsim benzerlik analizi
      await this.analyzeNameSimilarities();
      
      // 3. Veri tutarlılık analizi  
      await this.analyzeDataConsistency();
      
      // 4. Excel karşılaştırma (eğer Excel verisi verilmişse)
      if (excelNames.length > 0) {
        await this.compareWithExcelData(excelNames);
      }
      
      // 5. Temizleme önerileri
      await this.generateCleanupSuggestions();
      
      // 6. Rapor oluştur
      const report = this.generateReport();
      
      console.log('🎉 ANALİZ TAMAMLANDI!\n');
      console.log('📊 ÖZET:');
      console.log(`   • Toplam çalışan: ${report.toplam_kayit}`);
      console.log(`   • İsim benzerlikleri: ${report.ozet.isim_benzerlik_sayisi}`);
      console.log(`   • Tutarlılık sorunları: ${report.ozet.tutarlilik_sorunu_sayisi}`);
      console.log(`   • Excel eksik kayıtlar: ${report.ozet.excel_eksik_sayisi}\n`);
      
      // MongoDB bağlantısını kapat
      await mongoose.connection.close();
      
      return report;
      
    } catch (error) {
      console.error('❌ Analiz hatası:', error);
      await mongoose.connection.close();
      throw error;
    }
  }
}

// 📋 Excel isimleri (önceki analizden)
const excelNames = [
  'Abbas DÜZTAŞ', 'Ahmet ÇELİK', 'Abdulsamed ÇELİK', 'Ahmet İLGİN', 'Ahmet ARSLAN',
  'Adem GÜMÜŞ', 'Ali GÜRBÜZ', 'Ali ÖKSÜZ', 'Ali SAVAŞ', 'Ali ŞİŞ YORULMAZ',
  'Abdurrahim AKICI', 'Abdurrahim ÖZKUL', 'Ahmet AYAN', 'Ahmet ŞAHİN', 'Ahmet ÖZTÜRK',
  'Ali KÜÇÜKALP', 'Ali YILDIRMAZ', 'Arda AYNALI', 'Azer Buğra KAYA', 'Berat ŞIYAR',
  // ... daha fazla isim eklenebilir
];

// 🚀 Ana fonksiyon
const runAnalysis = async () => {
  const analyzer = new CangaDataAnalyzer();
  
  try {
    const report = await analyzer.runFullAnalysis(excelNames);
    
    // Raporu dosyaya kaydet
    const fs = require('fs');
    const reportPath = `./canga_veri_analiz_raporu_${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    console.log(`📄 Detaylı rapor kaydedildi: ${reportPath}`);
    console.log('\n📋 TEMEL ÖNERİLER:');
    
    if (report.analizler.cleanupSuggestions?.oncelik_sirasi) {
      report.analizler.cleanupSuggestions.oncelik_sirasi.slice(0, 3).forEach(item => {
        console.log(`   ${item.sira}. ${item.konu} (${item.aciliyet} öncelik)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ana analiz hatası:', error);
  }
};

// Export
module.exports = { CangaDataAnalyzer, runAnalysis };

// Direkt çalıştırma
if (require.main === module) {
  runAnalysis();
} 