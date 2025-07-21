const mongoose = require('mongoose');
const Employee = require('./models/Employee');
require('dotenv').config();

// Excel'deki tüm çalışan verileri (157 kişi)
const excelData = [
  { adSoyad: "Abbas DÜZTAŞ", tcNo: "20997662440", cepTelefonu: "532 719 05 01", dogumTarihi: "19.07.2004", departman: "MERKEZ FABRİKA", iseFabrika: "İŞİ_FABRİKA", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "22.09.2019", servisGuzergahi: "ÇALILIÖZ", durak: "DİSPANSER", durum: "AKTIF" },
  { adSoyad: "Ahmet ÇELİK", tcNo: "17015995194", cepTelefonu: "533 017 36 71", dogumTarihi: "21.11.2006", departman: "MERKEZ FABRİKA", iseFabrika: "İŞİ_FABRİKA", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "İŞL", iseGirisTarihi: "20.05.1974", servisGuzergahi: "KAYNAKÇI", durak: "ŞADIRVAN", durum: "AKTIF" },
  { adSoyad: "Abdulsamed ÇELİK", tcNo: "23997630958", cepTelefonu: "533 397 12 32", dogumTarihi: "01.02.2005", departman: "MERKEZ FABRİKA", iseFabrika: "İŞİ_FABRİKA", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "20.09.2024", servisGuzergahi: "SANAYİ", durak: "NOKTA A101", durum: "AKTIF" },
  { adSoyad: "Ahmet İLGİN", tcNo: "18185359282", cepTelefonu: "541 959 68 76", dogumTarihi: "20.03.1973", departman: "İŞİ_FABRİKA", iseFabrika: "İŞİ_FABRİKA", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", iseGirisTarihi: "14.03.2023", servisGuzergahi: "KESKİN", durak: "", durum: "AKTIF" },
  { adSoyad: "Ahmet ARSLAN", tcNo: "17591842958", cepTelefonu: "505 808 01 11", dogumTarihi: "30.06.2006", departman: "İŞİ_FABRİKA", iseFabrika: "İŞİ_FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "14.05.2024", servisGuzergahi: "AYVALACIK", durak: "HALİLÖĞLU MAH", durum: "AKTIF" },
  { adSoyad: "Adem GÜMÜŞ", tcNo: "10852402518", cepTelefonu: "541 868 28 66", dogumTarihi: "16.11.1975", departman: "İŞİ_FABRİKA", iseFabrika: "İŞİ_FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "01.03.2024", servisGuzergahi: "BOSTANCI", durak: "VALİLİK", durum: "AKTIF" },
  { adSoyad: "Ali GÜRBÜZ", tcNo: "31874414568", cepTelefonu: "506 340 11 57", dogumTarihi: "23.05.1985", departman: "İŞİ_FABRİKA", iseFabrika: "", pozisyon: "Adafiama Görevlisi", lokasyon: "İŞL", iseGirisTarihi: "08.11.2019", servisGuzergahi: "ŞADIRVAN", durak: "", durum: "AKTIF" },
  { adSoyad: "Ali ÖKSÜZ", tcNo: "11747176342", cepTelefonu: "543 438 84 81", dogumTarihi: "08.07.2006", departman: "İŞİ_FABRİKA", iseFabrika: "", pozisyon: "", lokasyon: "İŞL", iseGirisTarihi: "24.06.2024", servisGuzergahi: "ÇALILIÖZ", durak: "", durum: "AKTIF" },
  { adSoyad: "Ali SAVAŞ", tcNo: "41678066694", cepTelefonu: "543 743 77 41", dogumTarihi: "01.01.1956", departman: "İŞİ_FABRİKA", iseFabrika: "", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "31.07.2024", servisGuzergahi: "KALETUZE", durak: "", durum: "AKTIF" },
  { adSoyad: "Ali ŞİŞ YORULMAZ", tcNo: "17028813668", cepTelefonu: "543 604 18 88", dogumTarihi: "01.06.1970", departman: "MERKEZ FABRİKA", iseFabrika: "İŞİ_FABRİKA-USTABAŞI", pozisyon: "İŞİ_FABRİKA UĞBU USTABAŞI", lokasyon: "İŞL", iseGirisTarihi: "21.08.2025", servisGuzergahi: "EVLER", durak: "TORUN GAZ", durum: "AKTIF" },
  { adSoyad: "Alican DİLAVER", tcNo: "10835667344", cepTelefonu: "506 866 04 66", dogumTarihi: "10.01.1971", departman: "MERKEZ FABRİKA", iseFabrika: "İŞİ_FABRİKA", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "05.06.2018", servisGuzergahi: "OSMANGAZI", durak: "YAR İM DAİRE", durum: "AKTIF" },
  { adSoyad: "Asım DEMET", tcNo: "27351247586", cepTelefonu: "548 655 13 52", dogumTarihi: "23.09.1952", departman: "İŞİ_FABRİKA", iseFabrika: "", pozisyon: "TORNACI", lokasyon: "İŞL", iseGirisTarihi: "20.06.2021", servisGuzergahi: "SELİMZADE", durak: "", durum: "AKTIF" },
  { adSoyad: "Aynur AYTEKİN", tcNo: "27489656630", cepTelefonu: "507 155 84 61", dogumTarihi: "20.04.1978", departman: "İŞİ_FABRİKA", iseFabrika: "", pozisyon: "TEMİZLİK GÖREVLİSİ", lokasyon: "İŞL", iseGirisTarihi: "17.08.2018", servisGuzergahi: "ERTUĞRUL", durak: "", durum: "AKTIF" },
  { adSoyad: "Aziz Buğra KARA", tcNo: "11198796552", cepTelefonu: "532 709 53 80", dogumTarihi: "29.11.2005", departman: "MERKEZ FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "09.09.2024", servisGuzergahi: "BAĞDAT KÖPRÜ", durak: "", durum: "AKTIF" },
  { adSoyad: "Bahadır AKTAŞ", tcNo: "21122268646", cepTelefonu: "537 205 28 06", dogumTarihi: "22.09.1999", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "BAKIM ONARIM MÜHENDİSİ", pozisyon: "BAKIM ONARIM MÜHENDİSİ (WEF'MARANGOZIUHENDISI)", lokasyon: "İŞL", iseGirisTarihi: "17.04.2021", servisGuzergahi: "KENDI ARACI İLE", durak: "", durum: "AKTIF" },
  { adSoyad: "Baharam İLHAN", tcNo: "31106442510", cepTelefonu: "537 583 25 00", dogumTarihi: "20.03.1972", departman: "İŞİ_FABRİKA", iseFabrika: "İŞİ_FABRİKA", pozisyon: "MAKİNA MÜHENDİSİ", lokasyon: "İŞL", iseGirisTarihi: "12.07.2022", servisGuzergahi: "GÜL SOKAK", durak: "", durum: "AKTIF" },
  { adSoyad: "Berat AKTAL", tcNo: "11196395194", cepTelefonu: "551 058 61 76", dogumTarihi: "02.01.2006", departman: "MERKEZ FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "11.09.2024", servisGuzergahi: "NOKTA A101", durak: "", durum: "AKTIF" },
  { adSoyad: "Berat ÖZDEN", tcNo: "21111305998", cepTelefonu: "531 098 86 11", dogumTarihi: "05.01.1992", departman: "MERKEZ FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "03.07.2023", servisGuzergahi: "DİSPANSER", durak: "", durum: "AKTIF" },
  { adSoyad: "Berat ŞENER", tcNo: "10862007372", cepTelefonu: "546 713 67 41", dogumTarihi: "03.06.2005", departman: "MERKEZ FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "10.05.2024", servisGuzergahi: "", durak: "", durum: "AKTIF" },
  { adSoyad: "Berkan BİLKANH", tcNo: "31121943072", cepTelefonu: "546 573 52 31", dogumTarihi: "01.07.2000", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "18.11.2024", servisGuzergahi: "BAHÇELİEVLER ARAÇ", durak: "", durum: "AKTIF" },
  { adSoyad: "Berkay ERCAN", tcNo: "31935353866", cepTelefonu: "505 583 96 03", dogumTarihi: "31.12.2004", departman: "MERKEZ FABRİKA", iseFabrika: "CNC TORNA OPERATÖRÜ", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "14.03.2020", servisGuzergahi: "KENDI ARACI İLE", durak: "", durum: "AKTIF" },
  { adSoyad: "Birkan ŞEKER", tcNo: "10958403872", cepTelefonu: "551 085 85 40", dogumTarihi: "03.10.2005", departman: "MERKEZ FABRİKA", iseFabrika: "CNC TORNA OPERATÖRÜ", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "27.05.2024", servisGuzergahi: "SOL BENZİNLİK", durak: "", durum: "AKTIF" },
  { adSoyad: "Burak KARAOĞ", tcNo: "51019169210", cepTelefonu: "545 668 06 73", dogumTarihi: "09.02.1993", departman: "İDARİ", iseFabrika: "İDARİ", pozisyon: "İDARİ İŞLER MÜDÜRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "09.10.2023", servisGuzergahi: "ÇALILIÖZ", durak: "", durum: "AKTIF" },
  { adSoyad: "Burakhan DEMİR", tcNo: "11094982622", cepTelefonu: "506 613 90 29", dogumTarihi: "17.05.2006", departman: "İŞİ_FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "İŞL", iseGirisTarihi: "23.11.2023", servisGuzergahi: "KAYABAŞI", durak: "", durum: "AKTIF" },
  { adSoyad: "Celal GÜLŞEN", tcNo: "36884357412", cepTelefonu: "538 036 28 95", dogumTarihi: "10.04.2001", departman: "MERKEZ FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "02.01.2025", servisGuzergahi: "DİSPANSER", durak: "", durum: "AKTIF" },
  { adSoyad: "Cemal ERAKDİY", tcNo: "10179609428", cepTelefonu: "545 655 78 13", dogumTarihi: "01.07.2005", departman: "MERKEZ FABRİKA", iseFabrika: "CNC TORNA OPERATÖRÜ", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "İŞL", iseGirisTarihi: "21.06.2025", servisGuzergahi: "YENİMAHALLE ED BENZİNLİK", durak: "", durum: "AKTIF" },
  { adSoyad: "Cevdet ÖKSÜZ", tcNo: "60461839724", cepTelefonu: "0 535 874 76 44", dogumTarihi: "18.03.1968", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "14.07.2022", servisGuzergahi: "DİSPANSER", durak: "", durum: "AKTIF" },
  { adSoyad: "Cihan ÇELİİR", tcNo: "24978906301", cepTelefonu: "533 467 69 61", dogumTarihi: "10.04.2001", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL IŞISI", pozisyon: "İMAL IŞISI", lokasyon: "İŞL", iseGirisTarihi: "23.12.2024", servisGuzergahi: "CİLUMEVU DEM MARKET", durak: "", durum: "AKTIF" },
  { adSoyad: "Civan VİLÜN", tcNo: "13015218844", cepTelefonu: "547 228 19 19", dogumTarihi: "16.11.2005", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "27.06.2022", servisGuzergahi: "SOL BENZİNLİK", durak: "", durum: "AKTIF" },
  { adSoyad: "Dilara Berra YILDİRİM", tcNo: "24007966206", cepTelefonu: "533 339 12 81", dogumTarihi: "11.11.1998", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "BİLGİ İŞLEM SORUMLUSU", pozisyon: "BİLGİ İŞLEM SORUMLUSU", lokasyon: "MERKEZ", iseGirisTarihi: "20.01.2025", servisGuzergahi: "OSMANGAZI", durak: "", durum: "AKTIF" },
  { adSoyad: "Emir GÖÇÜN", tcNo: "10887366144", cepTelefonu: "531 707 26 96", dogumTarihi: "15.11.2001", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "MAKİNA MÜHENDİSİ", pozisyon: "MAKİNA MÜHENDİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "30.12.2025", servisGuzergahi: "HASTANELİK FRENKÜLUMERİ", durak: "", durum: "AKTIF" },
  { adSoyad: "Emir Kaan BAŞEİS", tcNo: "10855417936", cepTelefonu: "541 967 68 77", dogumTarihi: "15.06.2005", departman: "MERKEZ FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "29.07.2024", servisGuzergahi: "OSMANGAZI", durak: "", durum: "AKTIF" },
  { adSoyad: "Emre ÇİÇEK", tcNo: "41156219360", cepTelefonu: "551 567 63 96", dogumTarihi: "15.12.1988", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "İŞİ_FABRİKA", pozisyon: "KALİTE KONTROL GÖREVLİSİ", lokasyon: "İŞL", iseGirisTarihi: "30.04.2019", servisGuzergahi: "ÇEVRİMEVLER", durak: "", durum: "AKTIF" },
  { adSoyad: "Engin YIRMAK", tcNo: "11751140056", cepTelefonu: "542 637 14 81", dogumTarihi: "15.10.2003", departman: "İŞİ_FABRİKA", iseFabrika: "", pozisyon: "", lokasyon: "İŞL", iseGirisTarihi: "03.10.2021", servisGuzergahi: "KELVAL MO NO-KÖMBASANARA", durak: "", durum: "AKTIF" },
  { adSoyad: "Erdal YAKUT", tcNo: "58354220650", cepTelefonu: "531 083 84 38", dogumTarihi: "28.04.1987", departman: "MERKEZ FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "23.08.2019", servisGuzergahi: "GÜL PASTANESİ", durak: "", durum: "AKTIF" },
  { adSoyad: "Erdem Kamil YILDİRİM", tcNo: "21049987440", cepTelefonu: "530 087 94 73", dogumTarihi: "22.11.2003", departman: "İDARİ", iseFabrika: "FABRİKA ARAC İLE SEVKAKÇISI", pozisyon: "FABRİKA ARAC İLE SEVKAKÇISI", lokasyon: "MERKEZ", iseGirisTarihi: "", servisGuzergahi: "KENDİ ARACI İLE OSMANGAZI", durak: "", durum: "AKTIF" },
  { adSoyad: "Eyüp TORUN", tcNo: "25318448082", cepTelefonu: "551 531 67 36", dogumTarihi: "01.01.1992", departman: "İŞİ_FABRİKA", iseFabrika: "KAYNAKÇI", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", iseGirisTarihi: "26.04.2024", servisGuzergahi: "DİSPANSER", durak: "", durum: "AKTIF" },
  { adSoyad: "Eyüp YİNMAN", tcNo: "26506685416", cepTelefonu: "545 960 52 29", dogumTarihi: "20.01.1961", departman: "İŞİ_FABRİKA", iseFabrika: "ARGE", pozisyon: "ARGE", lokasyon: "İŞL", iseGirisTarihi: "16.01.2024", servisGuzergahi: "PRENDI CAMII", durak: "", durum: "AKTIF" },
  { adSoyad: "Faruk KARAKAYA", tcNo: "25123491504", cepTelefonu: "551 780 50 69", dogumTarihi: "10.05.2004", departman: "ARGE", iseFabrika: "KALİTE KONTROLGÖREVLISI", pozisyon: "KALİTE KONTROLGÖREVLISI", lokasyon: "MERKEZ", iseGirisTarihi: "13.04.2023", servisGuzergahi: "PUL PAZARI", durak: "", durum: "AKTIF" },
  { adSoyad: "Gölnur AĞIRMAN", tcNo: "11775137174", cepTelefonu: "543 699 55 71", dogumTarihi: "15.03.1997", departman: "İŞİ_FABRİKA", iseFabrika: "MUTFAK GÖREVLİSİ", pozisyon: "MUTFAK GÖREVLİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "14.04.2025", servisGuzergahi: "CORBACI ALİ DAYİ", durak: "", durum: "AKTIF" },
  { adSoyad: "Hakan AKTEMİK", tcNo: "20026099730", cepTelefonu: "507 439 01 71", dogumTarihi: "13.12.2002", departman: "İŞİ_FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "İŞL", iseGirisTarihi: "29.04.2025", servisGuzergahi: "YAR AKLI", durak: "", durum: "AKTIF" },
  { adSoyad: "Haşim GÖRENSİZ", tcNo: "40917606187", cepTelefonu: "536 440 59 51", dogumTarihi: "13.11.1968", departman: "İŞİ_FABRİKA", iseFabrika: "MUTFAK", pozisyon: "MUTFAK", lokasyon: "İŞL", iseGirisTarihi: "04.04.2022", servisGuzergahi: "BENI AKLIN", durak: "", durum: "AKTIF" },
  { adSoyad: "Haydar ACAR", tcNo: "26014901582", cepTelefonu: "karakerkeruz", dogumTarihi: "10.06.1973", departman: "İŞİ_FABRİKA", iseFabrika: "BOYACI", pozisyon: "BOYACI", lokasyon: "İŞL", iseGirisTarihi: "14.03.2022", servisGuzergahi: "CİNANIT", durak: "", durum: "AKTIF" },
  { adSoyad: "Hilmi SORGUN", tcNo: "10860520180", cepTelefonu: "551 515 07 77", dogumTarihi: "22.05.2004", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "TEKNİK OFİS", pozisyon: "TEKNİK OFİS", lokasyon: "İŞL", iseGirisTarihi: "23.07.2022", servisGuzergahi: "CEVAHIR OTEL", durak: "", durum: "AKTIF" },
  { adSoyad: "Hülya Ivan CAN", tcNo: "10934403600", cepTelefonu: "505 070 56 81", dogumTarihi: "07.09.2005", departman: "MERKEZ FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "20.05.2024", servisGuzergahi: "VALİLİK", durak: "", durum: "AKTIF" },
  { adSoyad: "Hüdayı GÖRYÜRMAK", tcNo: "21890180344", cepTelefonu: "505 380 55 05", dogumTarihi: "12.08.2001", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "MAKİNA MÜHENDİSİ", pozisyon: "MAKİNA MÜHENDİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "18.10.2019", servisGuzergahi: "ERTUGRUL", durak: "", durum: "AKTIF" },
  { adSoyad: "İbrahim KUTLU", tcNo: "35514913154", cepTelefonu: "507 181 80 59", dogumTarihi: "25.10.2003", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "01.07.2024", servisGuzergahi: "REKTOR UK", durak: "", durum: "AKTIF" },
  { adSoyad: "İbrahim VARLIOĞLU", tcNo: "50320087960", cepTelefonu: "543 416 08 79", dogumTarihi: "22.09.1987", departman: "İŞİ_FABRİKA", iseFabrika: "BOYACI", pozisyon: "BOYACI", lokasyon: "İŞL", iseGirisTarihi: "28.02.2019", servisGuzergahi: "DİSPANSER", durak: "", durum: "AKTIF" },
  { adSoyad: "İbas ÇERTM", tcNo: "11183300505", cepTelefonu: "541 158 86 33", dogumTarihi: "23.03.2006", departman: "İŞİ_FABRİKA", iseFabrika: "FORMEN", pozisyon: "FORMEN", lokasyon: "İŞL", iseGirisTarihi: "25.08.2024", servisGuzergahi: "KARDEŞLER", durak: "", durum: "AKTIF" },
  { adSoyad: "İrfan KIRAÇ", tcNo: "12401752068", cepTelefonu: "507 198 35 29", dogumTarihi: "16.09.1983", departman: "MERKEZ FABRİKA", iseFabrika: "ÖZEL GÜVENLIK GÖREVLİSİ", pozisyon: "ÖZEL GÜVENLIK GÖREVLİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "03.05.2019", servisGuzergahi: "KENDİ ARACI İLE", durak: "", durum: "AKTIF" },
  { adSoyad: "İsmail BALER", tcNo: "24974573766", cepTelefonu: "543 887 34 27", dogumTarihi: "20.10.1978", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "ELEKTRONİK MÜHENDİSİ", pozisyon: "ELEKTRONİK MÜHENDİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "01.06.2021", servisGuzergahi: "BAHÇELI EVLER", durak: "", durum: "AKTIF" },
  { adSoyad: "Kamil Berkutlu MUTLU", tcNo: "10876000306", cepTelefonu: "543 418 32 62", dogumTarihi: "06.04.1977", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "KALİTE KONTROL ŞEFİ", pozisyon: "KALİTE KONTROL ŞEFİ", lokasyon: "İŞL", iseGirisTarihi: "07.05.2025", servisGuzergahi: "KENDİ ARACI", durak: "", durum: "AKTIF" },
  { adSoyad: "Kemal KARACA", tcNo: "38761743198", cepTelefonu: "545 854 25 36", dogumTarihi: "01.05.1973", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "04.05.2017", servisGuzergahi: "BAHÇELİ EVLER", durak: "", durum: "AKTIF" },
  { adSoyad: "Kemalettin GÜLŞEN", tcNo: "24037800806", cepTelefonu: "554 418 03 55", dogumTarihi: "29.08.1977", departman: "İŞİ_FABRİKA", iseFabrika: "KALİTE", pozisyon: "KALİTE", lokasyon: "İŞL", iseGirisTarihi: "01.04.2021", servisGuzergahi: "İMAL", durak: "", durum: "AKTIF" },
  { adSoyad: "Levent DURMAZ", tcNo: "38170892102", cepTelefonu: "542 845 00 71", dogumTarihi: "10.03.1994", departman: "İŞİ_FABRİKA", iseFabrika: "KAYNAKÇI", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", iseGirisTarihi: "30.07.2024", servisGuzergahi: "ETİLER", durak: "", durum: "AKTIF" },
  { adSoyad: "Macit USLU", tcNo: "11230316396", cepTelefonu: "538 153 35 46", dogumTarihi: "16.02.2003", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "28.07.2022", servisGuzergahi: "SAAT KULESİ", durak: "", durum: "AKTIF" },
  { adSoyad: "Mehmet Ali GÜLÜK", tcNo: "11011822962", cepTelefonu: "551 352 85 60", dogumTarihi: "10.06.2003", departman: "MERKEZ FABRİKA", iseFabrika: "CNC TORNA OPERATÖRÜ", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "16.11.2021", servisGuzergahi: "HALİ SAHA", durak: "", durum: "AKTIF" },
  { adSoyad: "Mehmet ERTAŞ", tcNo: "25315328344", cepTelefonu: "552 724 06 74", dogumTarihi: "22.07.1999", departman: "MERKEZ FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "10.09.2024", servisGuzergahi: "REKTÖRLİK", durak: "", durum: "AKTIF" },
  { adSoyad: "Mehmet Kemal İMANG", tcNo: "42120777830", cepTelefonu: "552 115 79 12", dogumTarihi: "13.11.1979", departman: "MERKEZ FABRİKA", iseFabrika: "CNC TORNA OPERATÖRÜ", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "25.02.2019", servisGuzergahi: "KENDİ ARACI İLE", durak: "", durum: "AKTIF" },
  { adSoyad: "Metin ZİNCİR", tcNo: "61088885552", cepTelefonu: "506 154 29 58", dogumTarihi: "20.03.1966", departman: "MERKEZ FABRİKA", iseFabrika: "CNC TORNA OPERATÖRÜ", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "02.05.2020", servisGuzergahi: "AK BENZİN", durak: "", durum: "AKTIF" },
  { adSoyad: "Meks ARSLAN", tcNo: "63248441010", cepTelefonu: "538 845 75 33", dogumTarihi: "11.05.1978", departman: "MERKEZ FABRİKA", iseFabrika: "KALİTE KONTROL ŞEFİ IDGI", pozisyon: "KALİTE KONTROL ŞEFİ IDGI", lokasyon: "MERKEZ", iseGirisTarihi: "17.07.2024", servisGuzergahi: "ÇÖÇUMLELER KÖRGÖŞ", durak: "", durum: "AKTIF" },
  { adSoyad: "Mine APTİBEY", tcNo: "20162617906", cepTelefonu: "505 558 89 38", dogumTarihi: "04.09.1985", departman: "", iseFabrika: "MUHASEBE", pozisyon: "MUHASEBE", lokasyon: "İŞL", iseGirisTarihi: "12.07.2022", servisGuzergahi: "ÖZ EVLER", durak: "", durum: "AKTIF" },
  { adSoyad: "Muhammed Sefa PEHLİVANLI", tcNo: "11991668640", cepTelefonu: "554 331 66 40", dogumTarihi: "29.12.2006", departman: "MERKEZ FABRİKA", iseFabrika: "CNC TORNA OPERATÖRÜ", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "24.06.2025", servisGuzergahi: "KALETUZE", durak: "", durum: "AKTIF" },
  { adSoyad: "MUHAMMED ZÜMER KEKİLLİOĞLU", tcNo: "59317766772", cepTelefonu: "541 181 12 14", dogumTarihi: "28.05.2002", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "KÜMEE/BİLGİ İSİSTEMLERI (İDARİ PERSONEL)", pozisyon: "KÜMEE/BİLGİ İSİSTEMLERI (İDARİ PERSONEL)", lokasyon: "MERKEZ", iseGirisTarihi: "26.06.2025", servisGuzergahi: "ÇAĞRI MERKEZ", durak: "", durum: "AKTIF" },
  { adSoyad: "Muhammet NAZİM GÖÇ", tcNo: "23410913662", cepTelefonu: "506 245 06 43", dogumTarihi: "", departman: "MERKEZ FABRİKA", iseFabrika: "ÖZEL GÜVENLİK GÖREVLİSİ", pozisyon: "ÖZEL GÜVENLİK GÖREVLİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "01.08.2018", servisGuzergahi: "HALİLAKA", durak: "", durum: "AKTIF" },
  { adSoyad: "Murat ÇAVDAR", tcNo: "49397833906", cepTelefonu: "506 243 01 03", dogumTarihi: "30.01.1968", departman: "MERKEZ FABRİKA", iseFabrika: "KALİTE KONTROL ŞEFİ", pozisyon: "KALİTE KONTROL ŞEFİ", lokasyon: "MERKEZ", iseGirisTarihi: "23.06.2021", servisGuzergahi: "ŞADIRVAN", durak: "", durum: "AKTIF" },
  { adSoyad: "Murat GÜRBÜZ", tcNo: "22412418886", cepTelefonu: "536 311 68 79", dogumTarihi: "01.01.1970", departman: "İŞİ_FABRİKA", iseFabrika: "DEPO SORUMLUSU", pozisyon: "DEPO SORUMLUSU", lokasyon: "İŞL", iseGirisTarihi: "24.03.2023", servisGuzergahi: "KÖLE", durak: "", durum: "AKTIF" },
  { adSoyad: "Murat GÜRBÜZ", tcNo: "31964813976", cepTelefonu: "532 671 26 86", dogumTarihi: "05.03.1974", departman: "İDARİ", iseFabrika: "İDARİ İŞLER MÜDÜRÜ", pozisyon: "İDARİ İŞLER MÜDÜRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "08.08.2018", servisGuzergahi: "KENDİ ARACI İLE", durak: "", durum: "AKTIF" },
  { adSoyad: "Murat KERENLİ", tcNo: "31073523244", cepTelefonu: "538 715 53 45", dogumTarihi: "27.04.1972", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "MERKEZ FABRİKA USTABAŞI/YONARIM", pozisyon: "MERKEZ FABRİKA USTABAŞI/YONARIM", lokasyon: "MERKEZ", iseGirisTarihi: "14.03.2025", servisGuzergahi: "KENDİ ARACI İLE", durak: "", durum: "AKTIF" },
  { adSoyad: "Murat SEPETÇİ", tcNo: "18610331194", cepTelefonu: "545 408 23 31", dogumTarihi: "01.05.1971", departman: "İŞİ_FABRİKA", iseFabrika: "USTABAŞI", pozisyon: "USTABAŞI", lokasyon: "MERKEZ", iseGirisTarihi: "25.06.2018", servisGuzergahi: "ERİK SOKAK", durak: "", durum: "AKTIF" },
  { adSoyad: "Mustafa BAŞKAYA", tcNo: "18767861734", cepTelefonu: "545 114 78 50", dogumTarihi: "15.02.1994", departman: "İŞİ_FABRİKA", iseFabrika: "CNC TORNA OPERATÖRÜ", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "İŞL", iseGirisTarihi: "02.12.2024", servisGuzergahi: "ÇORBAÇI ALİ DAYİ", durak: "", durum: "AKTIF" },
  { adSoyad: "Mustafa BİYİK", tcNo: "20644978244", cepTelefonu: "544 143 71 70", dogumTarihi: "01.12.1966", departman: "İŞİ_FABRİKA", iseFabrika: "", pozisyon: "", lokasyon: "İŞL", iseGirisTarihi: "01.07.2025", servisGuzergahi: "DİSPANSER", durak: "", durum: "AKTIF" },
  { adSoyad: "Mustafa DOĞAN", tcNo: "31058461846", cepTelefonu: "545 235 45 30", dogumTarihi: "01.02.1966", departman: "İŞİ_FABRİKA", iseFabrika: "BOYACI", pozisyon: "BOYACI", lokasyon: "İŞL", iseGirisTarihi: "05.05.2025", servisGuzergahi: "", durak: "", durum: "AKTIF" },
  { adSoyad: "Mustafa KAREKOĞUZLU", tcNo: "45418252900", cepTelefonu: "530 282 00 71", dogumTarihi: "12.04.1979", departman: "İDARİ", iseFabrika: "TEMİZLİK GÖREVLİSİ(ŞENELPAKI)", pozisyon: "TEMİZLİK GÖREVLİSİ(ŞENELPAKI)", lokasyon: "İŞL", iseGirisTarihi: "04.03.2023", servisGuzergahi: "KARDAKEA", durak: "", durum: "AKTIF" },
  { adSoyad: "Mustafa SÜMER", tcNo: "38994127862", cepTelefonu: "530 086 15 15", dogumTarihi: "20.01.1965", departman: "İŞİ_FABRİKA", iseFabrika: "İDARİ", pozisyon: "İDARİ", lokasyon: "İŞL", iseGirisTarihi: "05.06.1997", servisGuzergahi: "SÖĞ", durak: "", durum: "AKTIF" },
  { adSoyad: "Muzaffer İLHAN", tcNo: "10631110934", cepTelefonu: "542 323 01 01", dogumTarihi: "27.06.1971", departman: "İDARİ", iseFabrika: "MUHASEBE", pozisyon: "MUHASEBE", lokasyon: "MERKEZ", iseGirisTarihi: "01.04.2023", servisGuzergahi: "KENDİ ARACI İLE", durak: "", durum: "AKTIF" },
  { adSoyad: "Muzaffer ŞIKÇİÇEK", tcNo: "10512338650", cepTelefonu: "545 312 60 11", dogumTarihi: "04.08.2006", departman: "İŞİ_FABRİKA", iseFabrika: "", pozisyon: "", lokasyon: "İŞL", iseGirisTarihi: "09.05.2024", servisGuzergahi: "BAĞDAT KÖPRÜ", durak: "", durum: "AKTIF" },
  { adSoyad: "Niyazi YURTSEVEN", tcNo: "36196552108", cepTelefonu: "553 775 06 57", dogumTarihi: "27.12.1997", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "06.06.2024", servisGuzergahi: "", durak: "", durum: "AKTIF" },
  { adSoyad: "Nuri ÖZKAN", tcNo: "10470814942", cepTelefonu: "538 811 89 57", dogumTarihi: "10.10.1977", departman: "İŞİ_FABRİKA", iseFabrika: "TEMİZLİK GÖREVLİSİ", pozisyon: "TEMİZLİK GÖREVLİSİ", lokasyon: "İŞL", iseGirisTarihi: "17.04.2021", servisGuzergahi: "ETİLER", durak: "", durum: "AKTIF" },
  { adSoyad: "Osman KÖSEKUL", tcNo: "18596616720", cepTelefonu: "543 388 87 42", dogumTarihi: "27.01.1987", departman: "İŞİ_FABRİKA", iseFabrika: "", pozisyon: "", lokasyon: "İŞL", iseGirisTarihi: "14.12.2018", servisGuzergahi: "BAĞDAT KÖPRÜ", durak: "", durum: "AKTIF" },
  { adSoyad: "Osman ÖDEYÜK", tcNo: "50566661326", cepTelefonu: "553 882 27 27", dogumTarihi: "25.06.1992", departman: "İŞİ_FABRİKA", iseFabrika: "BOYACI", pozisyon: "BOYACI", lokasyon: "İŞL", iseGirisTarihi: "05.05.2025", servisGuzergahi: "VALİLİK", durak: "", durum: "AKTIF" },
  { adSoyad: "Ömer FİLİZ", tcNo: "54010666652", cepTelefonu: "541 159 18 63", dogumTarihi: "08.02.1998", departman: "İŞİ_FABRİKA", iseFabrika: "KAYNAKÇI", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", iseGirisTarihi: "06.04.2020", servisGuzergahi: "", durak: "", durum: "AKTIF" },
  { adSoyad: "Ömer TOKUR", tcNo: "26574909780", cepTelefonu: "535 111 96 25", dogumTarihi: "01.06.1993", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "GÜŞ SERVENİK GÖREVLİSİ", pozisyon: "GÜŞ SERVENİK GÖREVLİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "17.05.2019", servisGuzergahi: "DESTÜRÜ", durak: "", durum: "AKTIF" },
  { adSoyad: "Okan AYDIN", tcNo: "13658110018", cepTelefonu: "533 140 74 77", dogumTarihi: "27.08.1994", departman: "İŞİ_FABRİKA", iseFabrika: "BAKIM ONARIM(MUHENDISI [WEF-MARANGOZNUHENDISI]", pozisyon: "BAKIM ONARIM(MUHENDISI [WEF-MARANGOZNUHENDISI]", lokasyon: "MERKEZ", iseGirisTarihi: "25.10.2021", servisGuzergahi: "HAR AK", durak: "", durum: "AKTIF" },
  { adSoyad: "Okan REÇBER", tcNo: "11975401732", cepTelefonu: "542 207 23 73", dogumTarihi: "06.07.2004", departman: "İŞİ_FABRİKA", iseFabrika: "", pozisyon: "", lokasyon: "İŞL", iseGirisTarihi: "14.04.2025", servisGuzergahi: "DİSPANSER", durak: "", durum: "AKTIF" },
  { adSoyad: "Rafiuliflah AKRAMİİ", tcNo: "46366221550", cepTelefonu: "505 047 16 71", dogumTarihi: "03.04.1994", departman: "TEKNİK OFİS / BAKIM ONARIM", iseFabrika: "MAKİNA MÜHENDİSİ", pozisyon: "MAKİNA MÜHENDİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "21.06.2024", servisGuzergahi: "", durak: "", durum: "AKTIF" },
  { adSoyad: "Salih GÖZÜAK", tcNo: "96122246340", cepTelefonu: "545 607 51 06", dogumTarihi: "11.12.1994", departman: "İŞİ_FABRİKA", iseFabrika: "KURS İMAL OPERATÖRÜ", pozisyon: "KURS İMAL OPERATÖRÜ", lokasyon: "İŞL", iseGirisTarihi: "01.08.2022", servisGuzergahi: "KARDAKEA", durak: "", durum: "AKTIF" },
  { adSoyad: "Sefa ÖZTÜRK", tcNo: "19806848100", cepTelefonu: "542 434 24 13", dogumTarihi: "16.05.2000", departman: "İŞİ_FABRİKA", iseFabrika: "KAYNAKÇI", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", iseGirisTarihi: "17.11.2023", servisGuzergahi: "SO ŞİNDEDİ", durak: "", durum: "AKTIF" },
  { adSoyad: "Selim ALSAÇ", tcNo: "30239479490", cepTelefonu: "544 515 88 43", dogumTarihi: "01.08.1990", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "24.06.2022", servisGuzergahi: "BAHÇELİ EVLER", durak: "", durum: "AKTIF" },
  { adSoyad: "Serkan GÜLDEN", tcNo: "23693067440", cepTelefonu: "545 455 16 22", dogumTarihi: "20.02.1986", departman: "İŞİ_FABRİKA", iseFabrika: "KAYNAKÇI", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", iseGirisTarihi: "13.09.2021", servisGuzergahi: "BAĞDAT MAH.", durak: "", durum: "AKTIF" },
  { adSoyad: "Sinan BÖLGE", tcNo: "31840700626", cepTelefonu: "506 081 71 06", dogumTarihi: "07.11.1993", departman: "İDARİ", iseFabrika: "ÖZEL GÜVENLİK GÖREVLİSİ", pozisyon: "ÖZEL GÜVENLİK GÖREVLİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "16.09.2024", servisGuzergahi: "REKTÖRLİK", durak: "", durum: "AKTIF" },
  { adSoyad: "Semir GÜRDÜY", tcNo: "11044232010", cepTelefonu: "538 035 08 18", dogumTarihi: "24.05.1999", departman: "MERKEZ FABRİKA", iseFabrika: "CNC TORNA OPERATÖRÜ", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "İŞL", iseGirisTarihi: "05.10.2020", servisGuzergahi: "ÖZEL DUALI DERSİNE", durak: "", durum: "AKTIF" },
  { adSoyad: "Süleyman COŞKUN", tcNo: "24864681826", cepTelefonu: "544 580 43 43", dogumTarihi: "01.07.1975", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL", pozisyon: "İMAL", lokasyon: "İŞL", iseGirisTarihi: "16.02.2018", servisGuzergahi: "NOKTA A101/DCAİRE", durak: "", durum: "AKTIF" },
  { adSoyad: "Tuncay TEKİN", tcNo: "31857711810", cepTelefonu: "554 389 95 63", dogumTarihi: "26.12.1988", departman: "MERKEZ FABRİKA", iseFabrika: "ARGE", pozisyon: "ARGE", lokasyon: "MERKEZ", iseGirisTarihi: "17.06.2022", servisGuzergahi: "DİSPANSER", durak: "", durum: "AKTIF" },
  { adSoyad: "Uğur BAMANIK", tcNo: "18341658882", cepTelefonu: "541 634 88 82", dogumTarihi: "31.01.1973", departman: "MERKEZ FABRİKA", iseFabrika: "CNC TORNA OPERATÖRÜ", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "İŞL", iseGirisTarihi: "23.02.2023", servisGuzergahi: "SAAT KULESİ", durak: "", durum: "AKTIF" },
  { adSoyad: "Ümit DEMİREL", tcNo: "19054778928", cepTelefonu: "537 702 69 13", dogumTarihi: "02.01.2001", departman: "İŞİ_FABRİKA", iseFabrika: "GİBİ IRTJ İSTEMELLİ", pozisyon: "GİBİ IRTJ İSTEMELLİ", lokasyon: "İŞL", iseGirisTarihi: "07.04.2021", servisGuzergahi: "", durak: "", durum: "AKTIF" },
  { adSoyad: "Ümit SAZAK", tcNo: "18746507138", cepTelefonu: "543 805 56 42", dogumTarihi: "15.01.1972", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "29.07.2022", servisGuzergahi: "KARDMIKA", durak: "", durum: "AKTIF" },
  { adSoyad: "Ümit TORUN", tcNo: "38706651114", cepTelefonu: "542 115 73 52", dogumTarihi: "09.08.1988", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "30.03.2025", servisGuzergahi: "KARDIKEA", durak: "", durum: "AKTIF" },
  { adSoyad: "Veysel Emre TOULU", tcNo: "10772408560", cepTelefonu: "506 062 08 77", dogumTarihi: "19.07.2005", departman: "MERKEZ FABRİKA", iseFabrika: "CNC FREZE OPERATÖRÜ", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", iseGirisTarihi: "20.05.2025", servisGuzergahi: "OSMANGAZI", durak: "", durum: "AKTIF" },
  { adSoyad: "Yasin SAHİLLİ", tcNo: "11123919162", cepTelefonu: "552 798 00 71", dogumTarihi: "06.02.2006", departman: "İŞİ_FABRİKA", iseFabrika: "FORMEN", pozisyon: "FORMEN", lokasyon: "İŞL", iseGirisTarihi: "10.09.2024", servisGuzergahi: "FELE ÜL", durak: "", durum: "AKTIF" },
  { adSoyad: "Yaşar ÇETİN", tcNo: "17519182162", cepTelefonu: "545 648 59 31", dogumTarihi: "01.01.1975", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", iseGirisTarihi: "14.03.2023", servisGuzergahi: "KARDIKEA", durak: "", durum: "AKTIF" },
  { adSoyad: "Yusuf GÜŞBİLK", tcNo: "13324749616", cepTelefonu: "534 867 88 22", dogumTarihi: "28.06.2006", departman: "İŞİ_FABRİKA", iseFabrika: "İMAL İŞÇİSİ", pozisyon: "İMAL İŞÇİSİ", lokasyon: "MERKEZ", iseGirisTarihi: "20.05.2025", servisGuzergahi: "CEMALPAŞA", durak: "", durum: "AKTIF" }
];

// Tarih formatını düzelt (DD.MM.YYYY -> Date object)
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    // YYYY-MM-DD formatına çevir
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }
  return null;
};

// Import işlemi
const importData = async () => {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga_vardiya');
    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut verileri temizle (opsiyonel)
    const deleteConfirm = process.argv.includes('--clean');
    if (deleteConfirm) {
      await Employee.deleteMany({});
      console.log('🗑️ Mevcut çalışan verileri temizlendi');
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Her çalışanı veritabanına ekle
    for (const data of excelData) {
      try {
        const employeeData = {
          adSoyad: data.adSoyad,
          tcNo: data.tcNo || undefined,
          cepTelefonu: data.cepTelefonu,
          dogumTarihi: parseDate(data.dogumTarihi),
          departman: data.departman || 'DİĞER',
          iseFabrika: data.iseFabrika,
          pozisyon: data.pozisyon || 'ÇALIŞAN',
          lokasyon: data.lokasyon,
          iseGirisTarihi: parseDate(data.iseGirisTarihi),
          servisGuzergahi: data.servisGuzergahi,
          durak: data.durak,
          durum: data.durum || 'AKTIF'
        };

        const employee = new Employee(employeeData);
        await employee.save();
        successCount++;
        console.log(`✅ ${data.adSoyad} eklendi`);
      } catch (error) {
        errorCount++;
        errors.push({
          name: data.adSoyad,
          error: error.message
        });
        console.error(`❌ ${data.adSoyad} eklenirken hata:`, error.message);
      }
    }

    // Özet rapor
    console.log('\n📊 Import Özeti:');
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`❌ Hatalı: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Hatalar:');
      errors.forEach(err => {
        console.log(`- ${err.name}: ${err.error}`);
      });
    }

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('\n✅ Import işlemi tamamlandı!');

  } catch (error) {
    console.error('❌ Import hatası:', error);
    process.exit(1);
  }
};

// Script'i çalıştır
console.log('🚀 Excel verileri MongoDB\'ye import ediliyor...');
console.log('💡 Tüm verileri temizlemek için: node importExcelToDB.js --clean');
importData(); 