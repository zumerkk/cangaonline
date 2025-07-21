const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGODB_URI = 'mongodb+srv://thebestkekilli:Z56uhyL13kQlOERM@canga.rgadvdl.mongodb.net/canga?retryWrites=true&w=majority&appName=canga';

// 103 çalışanın tam listesi - Excel tablosundan alındı
const complete103Employees = [
  { name: "Ahmet ÇANGA", tcNo: "49414249498", phone: "532 377 99 22", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇALILIÖZ" },
  { name: "Ahmet ÇANGA", tcNo: "17012815250", phone: "505 088 86 25", position: "TORNACI", serviceRoute: "", serviceStop: "SAAT" },
  { name: "Ahmet ŞAHİN", tcNo: "27159952240", phone: "505 998 55 15", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "YAYLACAİK" },
  { name: "Ali GÜRBÜZ", tcNo: "14782917040", phone: "545 968 29 29", position: "MAL İŞÇİSİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "RASATTEPE KÖPRÜ BENZİNLİK" },
  { name: "Ahmet İLGİN", tcNo: "18385959042", phone: "544 999 64 76", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "KURUBAŞ" },
  { name: "Ahmet ÖZTAŞ", tcNo: "28872685678", phone: "537 037 23 23", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "ADAY(KARŞI) SÜTLÜCE" },
  { name: "Ali GÜRBÜZ", tcNo: "31954564608", phone: "506 380 11 39", position: "AutoForm Editörü", serviceRoute: "", serviceStop: "ŞADIRVAN" },
  { name: "Ali GÜNER", tcNo: "17047757832", phone: "554 014 41 41", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "YALTAÇLIK" },
  { name: "Ali SAVAŞ", tcNo: "47069969644", phone: "533 942172 04", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KALETEPİN" },
  { name: "Ali Rıza KALP", tcNo: "20644978244", phone: "507 521 45 57", position: "İKİ AMBAR EMİNİ", serviceRoute: "", serviceStop: "TIRTILLAR" },
  { name: "Ali Rıza KALFA", tcNo: "11219965802", phone: "532 399 12 89", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Asır DEMET", tcNo: "27054247060", phone: "506 654 13 52", position: "TORNACI", serviceRoute: "", serviceStop: "KEMALLAR" },
  { name: "Asır KONUŞ", tcNo: "31894932242", phone: "506 409 88 33", position: "ÖZEL GÜVENLİK VE ÇORBACISI", serviceRoute: "", serviceStop: "OSMANGAZİ" },
  { name: "Asım AYTEKİN", tcNo: "38535858040", phone: "539 111 12 32", position: "CNC OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Ahmet Duran TUNA", tcNo: "13119496173", phone: "537 536 14 56", position: "SERİGRAFİ(ANE ANA MEKİNİSTİ)", serviceRoute: "", serviceStop: "NOKTA A-101" },
  { name: "Belkıs AKGÜL", tcNo: "49413466398", phone: "534 506 74 79", position: "MERHAMETLİ ANA MEKİNİSTİ", serviceRoute: "", serviceStop: "KUŞMA ARAÇI İLE" },
  { name: "Bekir AKKUŞ", tcNo: "19421519474", phone: "545 645 17 39", position: "İKİ DOKTOR", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Bekdemir İLHAN", tcNo: "19441613651", phone: "545 645 17 99", position: "SİL GÜDE SORUMLUSU", serviceRoute: "", serviceStop: "OVACIK" },
  { name: "Berat AKTAŞ", tcNo: "11194989982", phone: "533 802 14 76", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "NOKTA A-101" },
  { name: "Berat SOYAR", tcNo: "14085847779", phone: "546 773 47 41", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "VALİLİK" },
  { name: "Berat KOZMA", tcNo: "32934478546", phone: "507 288 61 71", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Berat ÖZDEN", tcNo: "28082867377", phone: "537 469 61 71", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "ŞOH. BENZİNLİK" },
  { name: "Bekın KUZEY", tcNo: "11011667268", phone: "506 331 96 15", position: "MURAT SERV SORUMLUSU", serviceRoute: "", serviceStop: "İGKME ARAÇLI" },
  { name: "Berkın SIL.KAYA", tcNo: "25431681209", phone: "507 986 45 45", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "BAĞHELLERE ARAÇI" },
  { name: "Bekın YAŞAR", tcNo: "53988445176", phone: "544 369 17 29", position: "KAYTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Cüyet GÜLŞEN", tcNo: "61549999776", phone: "517 986 26 35", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Gülşiş ŞAHLAR", tcNo: "18786164800", phone: "544 543 71 13", position: "SİL GÜDE USTABAŞI", serviceRoute: "", serviceStop: "TUZMAKALLE (C) BENZİNLİK" },
  { name: "Cünter ÇETİN", tcNo: "32471548648", phone: "507 576 67 44", position: "ETKLAMA", serviceRoute: "", serviceStop: "ÇEVİRONELİ BIM MARKETI" },
  { name: "Civan KÜBUR", tcNo: "63888773412", phone: "539 089 26 35", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "HOŞGELENE" },
  { name: "Cüngül EZİK", tcNo: "20948006486", phone: "539 467 91 56", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Çıhun Bekle ŞÜ.RİMAZ", tcNo: "20867662806", phone: "537 599 77 31", position: "MÜZAYİT KEZELEME UYMACAM", serviceRoute: "", serviceStop: "TEMPUÇARE" },
  { name: "Gör CAMİR", tcNo: "20808522626", phone: "537 599 77 31", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "OSMANGAZİ" },
  { name: "Çezvet ÖZKUK", tcNo: "12854841661", phone: "533 597 59 86", position: "MAKİNE MÜHENDİSİ", serviceRoute: "", serviceStop: "ŞEKERLKLER GENÇLİĞİ" },
  { name: "Çayın ÇUBAR", tcNo: "17337254036", phone: "532 721 52 11", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "GÖL MUSTAFA DURKAĞIDİGİ OKARYAYA" },
  { name: "Çırav ÇUKAR", tcNo: "67851384698", phone: "544 087 43 88", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Ener YILMAZ", tcNo: "60482866800", phone: "533 834 43 48", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "GÜL PAÇAÇAKEK" },
  { name: "Erasln Kaşık YILDIRIM", tcNo: "24816669791", phone: "538 687 46 71", position: "FABRİKA KÖĞUR YARDHCISI", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI İLÇEHOSMANGAZİ" },
  { name: "Ener BALİ", tcNo: "53744899672", phone: "507 373 02 36", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Eyup ÜNVANLI", tcNo: "85688644183", phone: "544 369 17 29", position: "BYÇ.T", serviceRoute: "", serviceStop: "FIRİNLI CAMİ" },
  { name: "Fenih YAV", tcNo: "26314201076", phone: "507 409 61 71", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "FIRİNLİK" },
  { name: "Folat KIRAN", tcNo: "11791748724", phone: "544 999 17 71", position: "MUSTAT. OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Folat ÖZKAN", tcNo: "49331828036", phone: "539 459 17 71", position: "İKİ İMA", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Gnear AZTEPAR", tcNo: "20658997756", phone: "507 469 61 71", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "OSMANGAZİ" },
  { name: "Hesan DURMUŞ", tcNo: "26720901072", phone: "538 667 46 71", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KASIM" },
  { name: "Hesan SORBON", tcNo: "27169653858", phone: "543 447 27 31", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "ÇEVRECİ BENZİNLİK" },
  { name: "Hülgerd DEĞİRMENCİ", tcNo: "11994346949", phone: "505 854 43 20", position: "SERİGRAF METRİNİNİ", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK GENÇLİĞİ" },
  { name: "Hulun CAN", tcNo: "16013855840", phone: "507 986 45 45", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "VALİLİK" },
  { name: "Hun ÇAKILDI", tcNo: "31789876764", phone: "507 986 45 45", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KASATKAÇE" },
  { name: "Halukan YALDIRALI", tcNo: "10348977996", phone: "533 644 83 35", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Hayatı EÇÜR", tcNo: "21167756453", phone: "543 633 94 12", position: "TORNACI", serviceRoute: "", serviceStop: "VALİLİK" },
  { name: "Haykar ACAR", tcNo: "21087152404", phone: "507 921 16 52", position: "KALİTE KONTROL ÜST SİST", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Hıpka TANIR", tcNo: "24537798477", phone: "543 862 59 75", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "BAMÇELİEVLER" },
  { name: "İcmat BAŞER", tcNo: "20758991145", phone: "507 469 61 71", position: "EMPAÇI", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Kamal ÇETİN ÇETİN", tcNo: "13797968116", phone: "536 564 64 69", position: "KALITE", serviceRoute: "", serviceStop: "İTÇLER" },
  { name: "Kemal KARACA", tcNo: "36743734159", phone: "544 554 35 36", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "BAMÇELİEVLER" },
  { name: "Kamal EKMEN", tcNo: "24917628094", phone: "544 543 83 35", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "İTÇLER" },
  { name: "Kemal DURMAZ", tcNo: "59728931162", phone: "543 844 99 71", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "" },
  { name: "Kamal İŞBEK", tcNo: "11391887043", phone: "507 531 84 45", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "İTÇLER" },
  { name: "Mahammed Zümer KEKİLLİOĞLU", tcNo: "52212868775", phone: "543 447 27 31", position: "BİLGİSAYAR BLGZ VE YÖNETİM SİSTEMLERİ ENDÜSTRİ", serviceRoute: "", serviceStop: "HALİ SAHA" },
  { name: "Mükrat EKTAŞ", tcNo: "36118256428", phone: "532 524 88 78", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Mükrat TORUN", tcNo: "14389233784", phone: "533 712 76 71", position: "MAL İŞÇİSİ OPERATÖRÜ", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Matıl ASLÇAK", tcNo: "4120814964", phone: "534 845 39 11", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇÜCÜK ŞUBE KARŞISI" },
  { name: "Musı AŞKAR", tcNo: "95894089502", phone: "534 901 56 60", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "OSMANGAZİ" },
  { name: "Mine KARAOĞLU", tcNo: "36784222359", phone: "534 979 99 14", position: "SAYIM ALMA SORUMLUSU", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Mine YEŞİL", tcNo: "10152629276", phone: "533 517 72 08", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Muhammed Nalan GÖÇ", tcNo: "11927993339", phone: "534 138 49 28", position: "BYÇ.NT", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Mahammad Şafa PERKGEMLİ", tcNo: "17013954680", phone: "554 014 46 69", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Murat GÖNTAY", tcNo: "23241846988", phone: "534 433 48 79", position: "SERVO KORUMA LOGI", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Murat BULAN", tcNo: "20775081090", phone: "506 638 11 03", position: "KALİTE KONTROL ŞEFİ", serviceRoute: "", serviceStop: "ŞEMSTAN" },
  { name: "Murat ÖZBÜY", tcNo: "31964433776", phone: "532 637 26 86", position: "İMAM AB ÇA ATFKÖRG", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Murat ALYÜZÜZ", tcNo: "31825769869", phone: "538 574 33 43", position: "SHAFTSDE(VE USTAUBBAŞAKAM ZAMANNı)", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Musda DOĞU", tcNo: "67878861794", phone: "543 832 45 29", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "FIRİNLI CAMI" },
  { name: "Musak DOĞU", tcNo: "51284546556", phone: "508 662 22 52", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "FIRİNLI CAMI" },
  { name: "Murat KAZ", tcNo: "40285667076", phone: "537 619 43 99", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "ÇEVAP" },
  { name: "Mustafa BIYIK", tcNo: "23744798159", phone: "544 645 17 79", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Mustafa BAŞKAYA", tcNo: "64443325260", phone: "535 506 39 71", position: "EMF EKRAF DHİNEME LİGGI", serviceRoute: "", serviceStop: "ÇORBACI" },
  { name: "Mustafa SÜMER", tcNo: "86080778652", phone: "539 099 34 71", position: "SİL GÜDE USTABAKI", serviceRoute: "", serviceStop: "RASATTI" },
  { name: "Mustafa TÜRK ÖZTÜRK", tcNo: "60211856962", phone: "532 924 66 11", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Mustafa TOĞRUL", tcNo: "13641100994", phone: "532 327 31 58", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Nıyazı YURTSEVEN", tcNo: "55295435198", phone: "507 721 89 41", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "" },
  { name: "Nuri ÖZKAN", tcNo: "92948185176", phone: "533 892 27 52", position: "MUSTAT. OPERATÖRÜ", serviceRoute: "", serviceStop: "ETILER" },
  { name: "Naser GÜNBAY", tcNo: "42568668176", phone: "535 702 27 32", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "VALİLİK" },
  { name: "Nıyaz FİLİZ", tcNo: "64858666770", phone: "543 959 19 83", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Osman ÖZKİLİÇ", tcNo: "15259078798", phone: "505 431 26 22", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Özkan AYDIN", tcNo: "15669119189", phone: "532 140 74 27", position: "MAKİNE ÜSTEDİRİ KUAMALÜMAHACIM", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Özlem ÖZEL", tcNo: "11797851470", phone: "533 392 57 50", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "ŞATIRLER" },
  { name: "Salih GÖZÜAK", tcNo: "58177754445", phone: "544 625 51 06", position: "MUMAL AHAL OPERATÖRÜ", serviceRoute: "", serviceStop: "KARŞIYAKA" },
  { name: "Salim ALBAÇ", tcNo: "37841527576", phone: "536 585 64 61", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "SEVERMELER ARACI" },
  { name: "Suzan BÖYLÜZ", tcNo: "31886769636", phone: "508 981 71 06", position: "ÖZEL GÜVENLİK OPERATÖRÜ", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Surat ONKAY", tcNo: "32968990508", phone: "534 718 19 11", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Sadullah AKAMIR", tcNo: "46365253509", phone: "543 647 34 71", position: "MAKİNA MÜHENDİSİ", serviceRoute: "", serviceStop: "" },
  { name: "Safa ÖZTÜRK", tcNo: "15415754969", phone: "505 375 21 11", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "BAMÇELİEVLER" },
  { name: "Sultan GÜLIŞEN", tcNo: "27089829525", phone: "545 533 102/5", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Süleyman ÇELİKER", tcNo: "26073137163", phone: "538 449 83 52", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "BAMÇELİEVLER" },
  { name: "Tamer DALHA", tcNo: "47594368895", phone: "536 564 64 69", position: "DİAS", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Uğur ALBAYRAK", tcNo: "47063308879", phone: "543 914 83 53", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "SAAT KULESİ" },
  { name: "Vef ÇEVİK", tcNo: "39849588315", phone: "534 711 52 35", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "RASATKAÇE" },
  { name: "Ufuk SAZAN", tcNo: "20076752692", phone: "507 534 86 10", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Ümit TORUN", tcNo: "18765433632", phone: "543 531 21 13", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "KARŞIYAKA" },
  { name: "Veyal Gürü TOZLU", tcNo: "14775280008", phone: "506 662 58 77", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "OSMANGAZİ" },
  { name: "Veyal Emıs TOZLU", tcNo: "17394452452", phone: "543 528 59 19", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KARŞIYAKA" },
  { name: "Yasin SAYGİLİ", tcNo: "31222695582", phone: "532 726 96 71", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Yasar ÇETİN", tcNo: "24810906934", phone: "538 667 46 71", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "ÇTYABAK MAHALLESİ SK" }
];

async function import103Complete() {
  try {
    console.log('🔄 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    console.log('📊 Mevcut durum kontrol ediliyor...');
    const currentCount = await Employee.countDocuments({ durum: 'AKTIF' });
    console.log(`👥 Mevcut aktif çalışan: ${currentCount}`);

    if (complete103Employees.length === 0) {
      console.log('❌ 103 çalışanın listesi henüz eklenmemiş!');
      console.log('Lütfen complete103Employees array\'ini doldurun.');
      return;
    }

    console.log(`📋 İşlenecek çalışan sayısı: ${complete103Employees.length}`);

    // Önce tüm çalışanları sil
    console.log('\n🗑️ Mevcut tüm çalışanlar siliniyor...');
    await Employee.deleteMany({});
    console.log('✅ Mevcut çalışanlar temizlendi');

    let addedCount = 0;
    const failedEmployees = [];

    console.log('\n👥 103 çalışan ekleniyor...');
    
    for (const empData of complete103Employees) {
      try {
        const nameParts = empData.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        const employee = new Employee({
          firstName,
          lastName, 
          adSoyad: empData.name,
          fullName: empData.name,
          employeeId: `EMP${String(addedCount + 1).padStart(3, '0')}`,
          tcNo: empData.tcNo || '',
          cepTelefonu: empData.phone || '',
          phone: empData.phone || '',
          pozisyon: empData.position,
          position: empData.position,
          departman: empData.position.includes('CNC') ? 'ÜRETİM' : 'GENEL',
          department: empData.position.includes('CNC') ? 'ÜRETİM' : 'GENEL',
          lokasyon: 'MERKEZ',
          location: 'MERKEZ',
          durum: 'AKTIF',
          status: 'AKTIF',
          servisGuzergahi: empData.serviceRoute || '',
          durak: empData.serviceStop || '',
          serviceInfo: {
            usesService: empData.serviceRoute ? true : false,
            routeName: empData.serviceRoute || '',
            stopName: empData.serviceStop || ''
          }
        });

        await employee.save();
        console.log(`✅ ${empData.name} eklendi (${addedCount + 1}/103)`);
        addedCount++;
      } catch (error) {
        console.error(`❌ ${empData.name} eklenirken hata:`, error.message);
        failedEmployees.push(empData.name);
      }
    }

    // Sonuçları raporla
    console.log('\n📊 İŞLEM SONUÇLARI:');
    console.log('='.repeat(50));
    console.log(`✅ Başarıyla eklenen: ${addedCount} çalışan`);
    console.log(`❌ Hatalı: ${failedEmployees.length} çalışan`);
    console.log(`📋 Toplam işlenen: ${complete103Employees.length} kayıt`);

    if (failedEmployees.length > 0) {
      console.log('\n❌ Eklenemeyen çalışanlar:');
      failedEmployees.forEach(name => console.log(`- ${name}`));
    }

    // Final kontrol
    const finalCount = await Employee.countDocuments({ durum: 'AKTIF' });
    console.log(`\n🎯 FINAL DURUM:`);
    console.log(`👥 Toplam aktif çalışan: ${finalCount}`);

    // Güzergah dağılımı
    const routeDistribution = await Employee.aggregate([
      { $match: { durum: 'AKTIF' } },
      {
        $group: {
          _id: '$servisGuzergahi',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n🚌 GÜZERGAH DAĞILIMI:');
    routeDistribution.forEach(route => {
      const routeName = route._id || 'Güzergah Yok';
      console.log(`${routeName}: ${route.count} çalışan`);
    });

    console.log('\n🎉 103 çalışan import işlemi tamamlandı!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
import103Complete(); 