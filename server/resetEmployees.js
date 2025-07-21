const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

// -------------------------------------------------------------
// 🧹  Bu script eski karışık çalışan verisini temizler
//      ve yerine KULLANICININ verdiği güncel, düzgün listeyi ekler.
// ⚠️  Çalıştırmadan önce .env dosyasında MONGODB_URI tanımlı olmalı!
//      Örn: mongodb+srv://<user>:<pass>@cluster0.mongodb.net/canga?retryWrites=true&w=majority
// -------------------------------------------------------------

// 1) Ortam değişkenlerini yükleyelim
dotenv.config();

// 2) MongoDB bağlantı URI'sini alalım
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('❌  MONGODB_URI environment variable bulunamadı!');
  process.exit(1);
}

// Connection ayarları (daha sonra kullanacağız)
const connectOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000
};

// -------------------------------------------------------------
// 🚧  Yardımcı Fonksiyonlar
// -------------------------------------------------------------

// DD.MM.YYYY → Date objesine çevir
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(p => p.padStart(2, '0'));
  return new Date(`${year}-${month}-${day}`);
}

// Tab ile ayrılmış ham satırı Employee objesine dönüştür
function lineToEmployee(line) {
  // Satırı TAB karakterine göre parçala
  const cols = line.split(/\t+|\s{2,}/);
  if (cols.length < 7) {
    console.warn('⚠️  Atlanan satır (beklenen kolon sayısısı tutmadı):', line);
    return null;
  }

  const [adSoyad, tcNo, cepNo, dogumStr, iseGirisStr, pozisyon, servisDurak] = cols;

  return {
    adSoyad: adSoyad.trim(),
    tcNo: tcNo.trim(),
    cepTelefonu: cepNo.trim(),
    dogumTarihi: parseDate(dogumStr.trim()),
    iseGirisTarihi: parseDate(iseGirisStr.trim()),
    pozisyon: pozisyon.trim(),
    durak: servisDurak?.trim() || '',
    // Zorunlu field olduğu için lokasyon'a şimdilik 'MERKEZ' veriyoruz.
    lokasyon: 'MERKEZ',
    // Durum varsayılan olarak 'AKTIF' geliyor, ekstra ayar gerekmiyor.
  };
}

// Kullanıcının gönderdiği tüm satırları çok satırlı string olarak ekliyoruz.
// (TAB karakterini korumak adına `\t` yerine gerçek TAB kullanıyoruz.)
const rawData = `Ahmet ÇANGA	40147428190	552 377 09 32	22.03.1969	21.05.2019	CNC TORNA OPERATÖRÜ	ÇALILIÖZ
Ahmet ÇELİK	17915891326	533 017 30 71	20.09.1995	4.09.2019	KAYNAKÇI	SANAYİ
Ahmet ŞAHİN	47218592200	505 808 01 13	30.06.2004	24.06.2024	İMAL İŞÇİSİ	YAYLACIK
Abbas Can ÖNGER	10470137946	543 964 02 29	19.07.2006	5.05.2025	İMAL İŞÇİSİ	BAĞDAT KÖPRÜ BENZİNLİK
Ahmet ILGIN	18185559282	541 959 68 76	20.03.1973	14.03.2023	KAYNAKÇI	KESKİN
Ali Çavuş BAŞTUĞ	28873804358	551 057 35 21	26.02.1978	7.01.1900	BOYACI	AHILI/ÇALILIÖZ
Ali GÜRBÜZ	31874424968	506 340 51 57	23.05.1985	8.11.2019	ASFALTLAMA GÖREVLİSİ	ŞADIRVAN
Ali ÖKSÜZ	11747376242	543 638 84 81	8.07.2006	24.06.2024	İMAL İŞÇİSİ	YAYLACIK
Ali SAVAŞ	45676966694	543 743 77 41	01.01.1956	31.07.2024	İMAL İŞÇİSİ	KALETEPE
Ali Şıh YORULMAZ	12920334486	543 804 18 68	01.06.1979	21.08.2014	IŞIL ŞUBE USTABAŞI	ETİLER
Aziz Buğra KARA	11138396552	532 709 53 80	29.11.2005	9.09.2024	CNC FREZE OPERATÖRÜ	BAĞDAT KÖPRÜ
Asım DEMET	27551247586	546 655 13 52	21.09.1952	30.06.2021	TORNACI	SELİMÖZER
Alperen TOZLU	10028925254	506 062 08 63	2.11.2000	1.09.2023	ÖZEL GÜVENLİK GÖREVLİSİ	OSMANGAZİ
Aynur AYTEKİN	25789906848	505 351 04 42	20.04.1978	17.08.2019	LOBİ GÖREVLİSİ	ÇALILIÖZ
Ahmet Duran TUNA	56302289476	538 971 22 12	2.02.2002	30.09.2024	CNC TORNA OPERATÖRÜ	NOKTA A101
Bahadır AKKÜL	15116984724	537 204 24 06	22.09.1992	7.04.2021	ÜRETİM/PLANLAMA MÜHENDİSİ	KENDİ ARACI İLE
Burcu KARAKOÇ	51031464958	545 664 06 71	9.02.1993	9.10.2023	ÖN MUHASEBE	ÇALILIÖZ
Batuhan İLHAN	19544113862	545 642 17 69	20.03.1997	17.07.2021	IŞIL ŞUBE SORUMLUSU	OVACIK
Berat AKTAŞ	11186395194	551 056 61 76	2.01.2006	11.09.2024	CNC FREZE OPERATÖRÜ	NOKTA A101
Berat SUSAR	10802407372	546 723 87 41	3.08.2005	20.05.2024	CNC FREZE OPERATÖRÜ	VALİLİK
Berat ÖZDEN	33274657366	539 548 36 61	5.01.1995	3.07.2023	KALİTE KONTROL GÖREVLİSİ	DİSPANSER
Birkan ŞEKER	10958402672	551 065 65 40	3.10.2005	27.05.2024	CNC TORNA OPERATÖRÜ	SOİL BENZİNLİK
Bilal CEVİZOĞLU	18347554322	530 551 96 71	2.03.1992	14.05.2020	MERKEZ ŞUBE SORUMLUSU	KENDİ ARACI İLE
Berkan BULANIK	15454012608	546 575 52 31	4.10.2002	28.11.2024	İMAL İŞÇİSİ	BAHŞILI/KENDİ ARACI
Celal BARAN	23542981880	530 092 85 66	23.04.1990	13.12.2021	KALİTE KONTROL GÖREVLİSİ	ÇALILIÖZ
Celal GÜLŞEN	36841537412	538 036 26 95	10.04.2001	2.01.2025	CNC FREZE OPERATÖRÜ	DİSPANSER
Cemal ERAKSOY	10379691860	545 655 78 13	1.07.2005	23.06.2025	CNC TORNA OPERATÖRÜ	YENİMAHALLE GO BENZİNLİK
Cihan ÇELEBİ	25978902552	535 667 69 81	10.09.1977	23.12.2024	TAŞLAMA	ÇULUYOLU BİM MARKET
Cevdet ÖKSÜZ	60463439724	535 874 76 44	18.03.1968	14.07.2022	İMAL İŞÇİSİ	DİSPANSER
Çağrı YILDIZ	19922369966	542 499 85 91	24.11.1994	27.05.2024	İMAL İŞÇİSİ	BAĞDAT KÖPRÜ
Dilara Berra YILDIRIM	24007966206	533 339 32 81	11.11.1998	20.01.2025	BİLGİ İŞLEM SORUMLUSU	OSMANGAZİ
Emir Kaan BAŞER	10655412936	541 967 68 27	15.06.2005	29.07.2024	CNC FREZE OPERATÖRÜ	OSMANGAZİ
Emir GÖÇÜK	13669266144	531 707 26 96	15.11.2001	30.12.2024	MAKİNE MÜHENDİSİ	REKTÖRLÜK (YENİŞEHİR)
Emre DEMİRCİ	31729326508	542 731 26 33	15.10.2001	14.04.2025	İMAL İŞÇİSİ	KEL MUSTAFA DURAĞI/KARŞIYAKA
Emre ÇİÇEK	47155194680	551 867 63 86	15.12.1988	9.05.2019	KALİTE KONTROL GÖREVLİSİ	BAĞDAT KÖPRÜ
Erdal YAKUT	58354220650	531 083 84 38	28.04.1987	21.08.2019	CNC FREZE OPERATÖRÜ	GÜL PASTANESİ
Erdem Kamil YILDIRIM	24016965924	530 087 46 71			FABRİKA MÜDÜR YARDIMCISI	KENDİ ARACI İLE/OSMANGAZİ
Eyüp TORUN	20336488082	551 551 62 36	1.01.1982	26.08.2024	KAYNAKÇI	DİSPANSER
Eyüp ÜNVANLI	53080681416	541 360 51 29	5.01.1954	16.01.2019	BEKÇİ	FIRINLI CAMİİ
Furkan Kadir ESEN	25121428106	552 780 50 02	2.01.2002	21.04.2025	KALİTE KONTROL GÖREVLİSİ	REKTÖRLÜK
Gülnur AĞIRMAN	11773175574	543 599 55 71	15.03.1997	14.04.2025	MUTFAK GÖREVLİSİ	ÇORBACI ALİ DAYI
Hayati SÖZDİNLER	40813406286	552 880 15 71	13.11.1966	4.04.2022	TESVİYECİ	DİSPANSER
Hakan AKPINAR	20024099736	507 687 01 71	11.12.2002	29.04.2025	CNC FREZE OPERATÖRÜ	OSMANGAZİ
Haydar ACAR	40975800182	kullanmıyor	1.06.1972	14.03.2023	BOYACI	SANAYİ
Hilmi SORGUN	27100863816	545 441 27 81	29.08.2001	18.07.2022	İMAL İŞÇİSİ	CEYARİN BENZİNLİK
Hüdagül DEĞİRMENCİ	23890180584	505 360 65 05	12.08.2001	25.12.2024	MAKİNE MÜHENDİSİ	REKTÖRLÜK (YENİŞEHİR)
Hulusi Eren CAN	10934403600	505 070 56 81	7.09.2005	20.05.2024	CNC FREZE OPERATÖRÜ	VALİLİK
İlyas CURTAY	11318390950	541 558 86 33	25.03.2006	24.06.2024	İMAL İŞÇİSİ	KARŞIYAKA
İbrahim VARLIOĞLU	50320087960	543 418 08 79	22.09.1987	28.02.2019	BOYACI	DİSPANSER
İbrahim ÜÇER	21167783612	505 011 86 72	13.09.1955	27.07.2021	TORNACI	VALİLİK
İrfan KIRAÇ	12401752068	507 198 15 29	16.09.1983	3.05.2019	LOJİSTİK GÖREVLİSİ	KENDİ ARACI İLE
İsmet BAŞER	29251791512	543 882 58 72	20.10.1976	1.06.2020	ELEKTRİK/BAKIM ONARIM GÖREVLİSİ	BAHÇELİEVLER
Kamil Batuhan BEYGO	16979600110	543 471 61 79	30.08.1997	7.05.2025	KALİTE KONTROL MÜHENDİSİ	KENDİ ARACI
Kemal KARACA	38761742198	545 954 25 36	1.05.1973	4.05.2017	İMAL İŞÇİSİ	BAHÇELİEVLER
Kemalettin GÜLEŞEN	24037965804	544 416 03 55	25.08.1977	3.04.2023	KAYNAKÇI	ETİLER
Levent DURMAZ	38170493162	542 845 00 71	10.03.1994	30.07.2024	KAYNAKÇI	
Macit USLU	11219393234	546 853 56 62	16.02.2003	29.07.2024	İMAL İŞÇİSİ	ETİLER
Muhammed Zümer KEKİLLİOĞLU	52912766772	541 381 21 14	28.05.2002	26.06.2025	BİLGİSAYAR BİLGİ YÖNETİM ELEMANI (ENGELLİ)	HALI SAHA
Mehmet ERTAŞ	25115328344	552 724 06 74	22.07.1999	10.09.2024	CNC FREZE OPERATÖRÜ	REKTÖRLÜK
Mehmet Kemal İNANÇ	42250757518	552 312 79 71	10.11.1979	25.02.2020	ÖZEL GÜVENLİK GÖREVLİSİ	KENDİ ARACI İLE
Metin ARSLAN	61246413894	538 644 79 31	11.09.1976	17.07.2024	KALİTE KONTROL GÖREVLİSİ	ÇOCUK ŞUBE KARŞISI
Mesut TUNCER	46498485952	506 354 39 66	20.03.1966	2.09.2020	CNC TORNA OPERATÖRÜ	OSMANGAZİ
Mine KARAOĞLU	30745222320	536 975 99 18	8.09.1989	14.07.2022	SATIN ALMA SORUMLUSU	REKTÖRLÜK
Mehmet Ali ÖZÇELİK	10135225278	551 121 12 08	16.06.2001	14.10.2024	CNC FREZE OPERATÖRÜ	SAAT KULESİ
Muhammet Nazim GÖÇ	11057399320	541 338 49 26	19.11.2005	24.12.2024	BOYACI	DİSPANSER
Muhammed Sefa PEHLİVANLI	11993368640	554 331 66 40	29.12.2006	24.06.2024	CNC TORNA OPERATÖRÜ	KALETEPE
Murat GENCER	22412418846	536 331 68 79	1.01.1970	14.03.2023	DEPO SORUMLUSU	ÇALILIÖZ
Murat ÇAVDAR	49597833806	506 243 01 03	30.01.1968	23.06.2021	KALİTE KONTROL ŞEFİ	ŞADIRVAN
Murat GÜRBÜZ	31964421976	532 671 26 86	5.03.1974	8.08.2018	İDARİ İŞLER MÜDÜRÜ	KENDİ ARACI İLE
Murat SEPETCİ	31882703888	536 713 25 81	27.04.1972	14.03.2023	MERKEZ ŞUBE USTABAŞI/BAKIM ONARIM	KENDİ ARACI İLE
Mustafa BAŞKAYA	18767861734	545 514 76 50	15.02.1994	2.12.2024	İMAL İŞÇİSİ	ÇORBACI ALİ DAYI
Musa DOĞU	51283456206	546 404 52 52	1.08.1985	14.04.2025	İMAL İŞÇİSİ	FIRINLI CAMİİ
Mustafa DOĞAN	51058463866	545 235 45 90	1.02.1966	5.05.2025	BOYACI	
Mustafa BIYIK	29344788320	544 563 71 70	5.12.1966	1.07.2019	CNC TORNA OPERATÖRÜ	DİSPANSER
Mustafa SAMURKOLLU	45418252900	536 282 00 71	12.04.1979	15.05.2023	TEMİZLİK GÖREVLİSİ (ENGELLİ)	KARŞIYAKA
Mustafa SÜMER	56698275862	530 099 16 71	20.01.1965	10.06.1997	IŞIL ŞUBE USTABAŞI	SANAYİ
Muzaffer KIZILÇİÇEK	10512138900	545 952 60 11	4.08.2006	9.09.2024	CNC FREZE OPERATÖRÜ	BAĞDAT KÖPRÜ
Muzaffer İLHAN	19631110934	542 323 01 01	27.06.1971	1.04.2023	MUHASEBE	KENDİ ARACI İLE
Niyazi YURTSEVEN	36394552108	553 775 66 57	27.12.1997	6.06.2024	İMAL İŞÇİSİ	
Nuri ÖZKAN	45976918942	536 631 39 57	1.10.1972	12.04.2019	TEMİZLİK GÖREVLİSİ	ETİLER
Osman ÖZKILIÇ	50566081326	553 982 27 27	25.06.1992	5.05.2025	BOYACI	VALİLİK
Orhan YORULMAZ	12806338270	545 880 87 62	27.01.1997	17.11.2018	KAYNAKÇI	BAĞDAT KÖPRÜ
Ömer FİLİZ	54610666576	541 359 18 63	13.01.1993	9.02.2022	KAYNAKÇI	
Ömer TORUN	52672409780	553 111 96 25	3.06.1992	17.03.2025	ÖZEL GÜVENLİK GÖREVLİSİ	REKTÖRLÜK
Özkan AYDIN	13658310018	553 140 74 77	27.08.1994	25.10.2021	BAKIM ONARIM MÜHENDİSİ (MEKATRONİK)	DİSPANSER
Polat ERCAN	11579381476	552 262 27 82	6.07.2006	14.04.2025	İMAL İŞÇİSİ	KAHVELER
Salih GÖZÜAK	58177226648	545 602 91 06	11.12.1994	1.05.2019	KUMLAMA OPERATÖRÜ	KARŞIYAKA
Süleyman GÖZÜAK	58156227376	544 588 41 61	31.07.1997	2.12.2024	İMAL İŞÇİSİ	YENİŞEHİR/KENDİ ARACI
Sinan BÖLGE	31840705626	505 081 71 06	7.11.1993	16.09.2024	ÖZEL GÜVENLİK GÖREVLİSİ	REKTÖRLÜK
Sefa ÖZTÜRK	47290618928	545 473 86 13	16.02.2000	23.05.2024	İMAL İŞÇİSİ	SELİMÖZER
Sadullah AKBAYIR	46366221550	505 047 16 71	3.04.1994	21.06.2024	MAKİNA MÜHENDİSİ	
Selim ALSAÇ	30239479490	544 515 88 43	1.08.1990	24.06.2024	İMAL İŞÇİSİ	BAHÇELİEVLER
Serkan GÜLEŞEN	23995967202	545 455 16 22	20.02.1986	16.08.2021	KAYNAKÇI	BAĞDAT KÖPRÜ
Soner GÜRSOY	48772139382	536 035 08 50	4.03.1968	5.10.2020	CNC TORNA OPERATÖRÜ	REKTÖRLÜK
Tuncay TEKİN	31657711810	554 389 95 63	26.12.1968	17.06.2022	ARGE	DİSPANSER
Uğur ALBAYRAK	41956368394	541 634 88 82	11.01.1973	14.03.2023	CNC TORNA OPERATÖRÜ	SAAT KULESİ
Ümit TORUN	19847504312	544 515 71 52	9.08.1980	20.05.2024	İMAL İŞÇİSİ	KARŞIYAKA
Ümit DEMİREL	19658378928	537 702 69 13	2.01.2001	7.04.2021	İMAL İŞÇİSİ (ENGELLİ)	
Ümit SAZAK	58768207148	543 306 56 42	15.03.1997	29.07.2024	İMAL İŞÇİSİ	KARŞIYAKA
Veysel Emre TOZLU	10772408560	506 062 08 77	19.07.2005	20.05.2024	CNC FREZE OPERATÖRÜ	OSMANGAZİ
Yaşar ÇETİN	17528182262	545 858 59 31	1.01.1975	14.03.2023	İMAL İŞÇİSİ	KARŞIYAKA
Yasin SAYGILI	11222393542	552 796 00 71	6.02.2006	10.09.2024	CNC FREZE OPERATÖRÜ	REKTÖRLÜK
Yusuf GÜRBÜZ	31823426616	534 967 88 27	9.06.1990	20.05.2024	İMAL İŞÇİSİ	CEYARİN BENZİNLİK`;

// -------------------------------------------------------------
// 🚀  Ana akış
// -------------------------------------------------------------
(async function main() {
  try {
    console.log('🔌  MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(mongoURI, connectOptions);
    console.log('✅  MongoDB bağlantısı başarılı!');

    console.log('🗑️  Eski çalışan verisi siliniyor...');
    await Employee.deleteMany({});
    console.log('✅  Eski veriler temizlendi.');

    console.log('📄  Yeni liste işleniyor...');
    const employees = rawData.split('\n')
      .map(lineToEmployee)
      .filter(Boolean); // null dönen problemli satırları atla

    console.log(`🔎  Toplam ${employees.length} çalışan kaydı hazır.`);

    console.log('💾  Veritabanına kaydediliyor...');
    for (let i = 0; i < employees.length; i++) {
      const emp = new Employee(employees[i]);
      await emp.save(); // pre-save middleware tetiklenir, ID vs. oluşur
      process.stdout.write(`\r📝  Kayıt ediliyor: ${i + 1}/${employees.length}`);
    }

    console.log('\n🎉  Tüm çalışanlar başarıyla eklendi!');
    console.log('👉  Artık http://localhost:3000/employees sayfasında yeni verileri görebilirsiniz.');
  } catch (err) {
    console.error('❌  Hata oluştu:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})(); 