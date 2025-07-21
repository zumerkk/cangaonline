const mongoose = require('mongoose');
const Employee = require('./models/Employee');
require('dotenv').config();

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga_vardiya');
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// Excel'deki geriye kalan tüm çalışanlar - toplu veri
const remainingEmployees = [
  { adSoyad: "Hakan AKYAKAR", tcNo: "11627009574", cepTelefonu: "507 687 01 71", dogumTarihi: "11.12.2002", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "29.04.2025", servisGuzergahi: "OSMANGAZİ", durak: "OSMANGAZİ", durum: "AKTIF" },
  { adSoyad: "Barkan KÖSE", tcNo: "25046837878", cepTelefonu: "546 737 52 13", dogumTarihi: "14.10.2002", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "28.11.2022", servisGuzergahi: "BAĞDAT KÖPRÜ", durak: "BAĞDAT KÖPRÜ", durum: "AKTIF" },
  { adSoyad: "MUHAMMED ZÜMER KEKİLLİOĞLU", tcNo: "53912766772", cepTelefonu: "541 381 21 14", dogumTarihi: "24.05.2002", departman: "TEKNİK OFİS / BAKIM MÜHENDİSİ", pozisyon: "YÖNETİM BİLİŞİM SİSTEMLERİ UZMANI (ENGELLİ)", lokasyon: "MERKEZ", servisTarihi: "26.06.2025", servisGuzergahi: "ÇARŞI MERKEZ", durak: "HALİ SAHA", durum: "AKTIF" },
  { adSoyad: "Athanaf GÜNEŞ", tcNo: "56102738876", cepTelefonu: "538 973 23 72", dogumTarihi: "07.09.2002", departman: "MERKEZ FABRİKA", pozisyon: "MERKEZ FABRİKA USTABAŞI", lokasyon: "MERKEZ", servisTarihi: "10.09.2024", servisGuzergahi: "NOKTA A101", durak: "NOKTA A101", durum: "AKTIF" },
  { adSoyad: "EMRE ATAK", tcNo: "11986986564", cepTelefonu: "532 707 26 56", dogumTarihi: "15.11.2001", departman: "TEKNİK OFİS / BAKIM MÜHENDİSİ", pozisyon: "MAKİNE MÜHENDİSİ", lokasyon: "MERKEZ", servisTarihi: "30.12.2024", servisGuzergahi: "REKTÖRLİK (YENİŞEHİR)", durak: "REKTÖRLİK (YENİŞEHİR)", durum: "AKTIF" },
  { adSoyad: "Emre GÖÇÜK", tcNo: "13680264144", cepTelefonu: "531 707 26 56", dogumTarihi: "15.11.2001", departman: "TEKNİK OFİS / BAKIM MÜHENDİSİ", pozisyon: "MAKİNE MÜHENDİSİ", lokasyon: "MERKEZ", servisTarihi: "30.12.2024", servisGuzergahi: "REKTÖRLİK (YENİŞEHİR)", durak: "REKTÖRLİK (YENİŞEHİR)", durum: "AKTIF" },
  { adSoyad: "Hadi ÇAKIR", tcNo: "13729124068", cepTelefonu: "542 733 26 31", dogumTarihi: "15.10.2001", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "14.04.2025", servisGuzergahi: "KEL MUSTAFA (ÇUMRAYASARİKAYA", durak: "KEL MUSTAFA (ÇUMRAYASARİKAYA", durum: "AKTIF" },
  { adSoyad: "Hilmi DÖRSÜN", tcNo: "27100868816", cepTelefonu: "545 441 27 81", dogumTarihi: "29.08.2001", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "18.07.2022", servisGuzergahi: "ÇEVİRME BENZİNLİK", durak: "ÇEVİRME BENZİNLİK", durum: "AKTIF" },
  { adSoyad: "Hedajet ÖZBEMIRCI", tcNo: "23800180584", cepTelefonu: "505 360 65 05", dogumTarihi: "17.08.2001", departman: "TEKNİK OFİS / BAKIM MÜHENDİSİ", pozisyon: "MAKİNE MÜHENDİSİ", lokasyon: "MERKEZ", servisTarihi: "25.12.2024", servisGuzergahi: "REKTÖRLİK (YENİŞEHİR)", durak: "REKTÖRLİK (YENİŞEHİR)", durum: "AKTIF" },
  { adSoyad: "İsmet FIRAT", tcNo: "19514010000", cepTelefonu: "509 070 95 61", dogumTarihi: "01.09.2000", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "20.05.2024", servisGuzergahi: "VALİLİK", durak: "VALİLİK", durum: "AKTIF" },
  { adSoyad: "Celal GÜLSEN", tcNo: "36841537412", cepTelefonu: "538 036 26 95", dogumTarihi: "10.04.2001", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "02.01.2025", servisGuzergahi: "DİSPANSER", durak: "DİSPANSER", durum: "AKTIF" },
  { adSoyad: "Ümit DEMIREL", tcNo: "13059817800", cepTelefonu: "557 705 99 13", dogumTarihi: "16.07.2001", departman: "İŞL FABRİKA", pozisyon: "İŞL İMAL İŞÇİSİ (ENGELLİ)", lokasyon: "İŞL", servisTarihi: "31.05.2025", servisGuzergahi: "YENİLMAHALLE İĞDECİK BENZİNLİK", durak: "YENİLMAHALLE İĞDECİK BENZİNLİK", durum: "AKTIF" },
  { adSoyad: "Agagnon TOĞLU", tcNo: "10058925254", cepTelefonu: "506 062 08 63", dogumTarihi: "02.11.2000", departman: "İDARİ", pozisyon: "ÖZEL GÜVENLİK GÖREVLİSİ", lokasyon: "MERKEZ", servisTarihi: "01.09.2023", servisGuzergahi: "OSMANGAZİ", durak: "OSMANGAZİ", durum: "AKTIF" },
  { adSoyad: "Aziz ARABACI", tcNo: "42256514928", cepTelefonu: "542 473 86 13", dogumTarihi: "16.02.2000", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "17.09.2024", servisGuzergahi: "ÇALILIÖZ", durak: "ÇALILIÖZ", durum: "AKTIF" },
  { adSoyad: "Ömer KASIF", tcNo: "47206851928", cepTelefonu: "544 473 86 13", dogumTarihi: "16.02.2000", departman: "TEKNİK OFİS / BAKIM MÜHENDİSİ", pozisyon: "ELEKTRİK AYARI", lokasyon: "İŞL", servisTarihi: "15.09.2024", servisGuzergahi: "SE ÜRKÇE", durak: "SE ÜRKÇE", durum: "AKTIF" },
  { adSoyad: "Dilara Berna YILDIRIM", tcNo: "24007966206", cepTelefonu: "533 339 32 81", dogumTarihi: "11.11.1998", departman: "TEKNİK OFİS / BAKIM MÜHENDİSİ", pozisyon: "BİLGİ İŞLEM SORUMLUSU", lokasyon: "MERKEZ", servisTarihi: "20.01.2025", servisGuzergahi: "OSMANGAZİ", durak: "OSMANGAZİ", durum: "AKTIF" },
  { adSoyad: "Berkat PEHLİVAN", tcNo: "10855512368", cepTelefonu: "541 967 88 27", dogumTarihi: "15.06.2005", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "29.07.2024", servisGuzergahi: "OSMANGAZİ", durak: "OSMANGAZİ", durum: "AKTIF" },
  { adSoyad: "Kahraman BEKDİOĞLU", tcNo: "15975602110", cepTelefonu: "543 471 61 79", dogumTarihi: "30.08.1997", departman: "TEKNİK OFİS / BAKIM MÜHENDİSİ", pozisyon: "KALİTE KONTROL MÜHENDİSİ", lokasyon: "MERKEZ", servisTarihi: "07.05.2025", servisGuzergahi: "KENDİ ARACI", durak: "KENDİ ARACI", durum: "AKTIF" },
  { adSoyad: "Erdal YAKIT", tcNo: "58354200560", cepTelefonu: "531 083 84 38", dogumTarihi: "28.04.1987", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "21.08.2019", servisGuzergahi: "GÜL PASTANESI", durak: "GÜL PASTANESI", durum: "AKTIF" },
  { adSoyad: "Erdinçhan BİRAHİM", tcNo: "24051058594", cepTelefonu: "530 087 46 71", dogumTarihi: "09.09.2002", departman: "İDARİ", pozisyon: "ŞANTIYE MANDIRCI", lokasyon: "MERKEZ", servisTarihi: "20.05.2024", servisGuzergahi: "KENDİ ARACI İLE OSMANGAZİ", durak: "KENDİ ARACI İLE OSMANGAZİ", durum: "AKTIF" },
  { adSoyad: "Volkan TOKUŞ", tcNo: "20343658012", cepTelefonu: "531 531 42 36", dogumTarihi: "01.01.1982", departman: "İŞL FABRİKA", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", servisTarihi: "26.04.2024", servisGuzergahi: "DİSPANSER", durak: "DİSPANSER", durum: "AKTIF" },
  { adSoyad: "Eyüp ÖZDURAL", tcNo: "32062581185", cepTelefonu: "544 990 15 29", dogumTarihi: "16.05.1994", departman: "İŞL FABRİKA", pozisyon: "BOYACI", lokasyon: "İŞL", servisTarihi: "16.04.2018", servisGuzergahi: "FİRİNLİ CAMİ", durak: "FİRİNLİ CAMİ", durum: "AKTIF" },
  { adSoyad: "Göktuğ ACIKGÖZ", tcNo: "11773175794", cepTelefonu: "543 599 55 71", dogumTarihi: "15.03.1997", departman: "İDARİ", pozisyon: "MUAKAT GÖREVLİSİ", lokasyon: "MERKEZ", servisTarihi: "14.04.2025", servisGuzergahi: "ÇORBACI ALİ DARİ", durak: "ÇORBACI ALİ DARİ", durum: "AKTIF" },
  { adSoyad: "Hayrat ÖZTAN", tcNo: "40813067148", cepTelefonu: "543 305 95 42", dogumTarihi: "13.11.1968", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "29.07.2024", servisGuzergahi: "KAŞIYAMA", durak: "KAŞIYAMA", durum: "AKTIF" },
  { adSoyad: "Orhan YORULMAZ", tcNo: "12800338270", cepTelefonu: "545 890 87 62", dogumTarihi: "27.01.1997", departman: "İŞL FABRİKA", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", servisTarihi: "17.11.2018", servisGuzergahi: "BAĞDAT KÖPRÜ", durak: "BAĞDAT KÖPRÜ", durum: "AKTIF" },
  { adSoyad: "Ömer ÇELİK", tcNo: "17815991226", cepTelefonu: "533 917 36 71", dogumTarihi: "20.09.1995", departman: "İŞL FABRİKA", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", servisTarihi: "04.09.2019", servisGuzergahi: "SANAYI", durak: "SANAYI", durum: "AKTIF" },
  { adSoyad: "Aytaç SOLAK", tcNo: "33926647966", cepTelefonu: "539 548 76 61", dogumTarihi: "05.01.1995", departman: "MERKEZ FABRİKA", pozisyon: "KALİTE KONTROL GÖREVLİSİ", lokasyon: "MERKEZ", servisTarihi: "03.07.2023", servisGuzergahi: "DİSPANSER", durak: "DİSPANSER", durum: "AKTIF" },
  { adSoyad: "Şerif GÖZÜAÇ", tcNo: "58177220648", cepTelefonu: "545 602 91 06", dogumTarihi: "11.12.1994", departman: "İŞL FABRİKA", pozisyon: "KUMLAMA OPERATÖRÜ", lokasyon: "İŞL", servisTarihi: "01.05.2019", servisGuzergahi: "KAŞIYAMA", durak: "KAŞIYAMA", durum: "AKTIF" },
  { adSoyad: "Şahin ÖZKAYA", tcNo: "35912210968", cepTelefonu: "542 499 85 21", dogumTarihi: "12.11.1994", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "27.05.2024", servisGuzergahi: "BAĞDAT KÖPRÜ", durak: "BAĞDAT KÖPRÜ", durum: "AKTIF" },
  { adSoyad: "Onur KAYA", tcNo: "44965445076", cepTelefonu: "544 479 85 13", dogumTarihi: "16.02.2000", departman: "TEKNİK OFİS / BAKIM MÜHENDİSİ", pozisyon: "BAKIM ONARIM MÜHENDİSİ (LABORATOIR MÜHENDİSİ)", lokasyon: "MERKEZ", servisTarihi: "30.10.2023", servisGuzergahi: "DİSPANSER", durak: "DİSPANSER", durum: "AKTIF" },
  { adSoyad: "Polat AYDOAN", tcNo: "11279388476", cepTelefonu: "552 262 37 84", dogumTarihi: "06.07.2006", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "14.04.2025", servisGuzergahi: "KAİVELER", durak: "KAİVELER", durum: "AKTIF" },
  { adSoyad: "Sefali AKSAMUR", tcNo: "46366231550", cepTelefonu: "505 047 16 71", dogumTarihi: "01.08.1994", departman: "TEKNİK OFİS / BAKIM MÜHENDİSİ", pozisyon: "MAKİNE MÜHENDİSİ", lokasyon: "MERKEZ", servisTarihi: "21.06.2024", servisGuzergahi: "DİSPANSER", durak: "DİSPANSER", durum: "AKTIF" },
  { adSoyad: "Sadri ORHAYAŞ", tcNo: "38325084162", cepTelefonu: "542 845 00 73", dogumTarihi: "10.01.1994", departman: "İŞL FABRİKA", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", servisTarihi: "30.07.2024", servisGuzergahi: "ÇORBACI ALİ DARİ", durak: "ÇORBACI ALİ DARİ", durum: "AKTIF" },
  { adSoyad: "Mustafa BAŞKAYA", tcNo: "18789881734", cepTelefonu: "545 514 76 50", dogumTarihi: "15.02.1994", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "02.12.2024", servisGuzergahi: "ÇORBACI ALİ DARİ", durak: "ÇORBACI ALİ DARİ", durum: "AKTIF" },
  { adSoyad: "Şavan ÖZKUŞ", tcNo: "51846700525", cepTelefonu: "505 681 37 06", dogumTarihi: "07.11.1993", departman: "İDARİ", pozisyon: "ÖZEL GÜVENLİK GÖREVLİSİ", lokasyon: "MERKEZ", servisTarihi: "14.09.2024", servisGuzergahi: "REKTÖRLİK", durak: "REKTÖRLİK", durum: "AKTIF" },
  { adSoyad: "Yakup GÜRKAN", tcNo: "51804001500", cepTelefonu: "505 755 71 06", dogumTarihi: "07.11.1993", departman: "İDARİ", pozisyon: "YARIN ALİ", lokasyon: "MERKEZ", servisTarihi: "14.09.2024", servisGuzergahi: "DİSPANSER", durak: "DİSPANSER", durum: "AKTIF" },
  { adSoyad: "Ömer FİLİZ", tcNo: "54610666596", cepTelefonu: "541 339 18 63", dogumTarihi: "13.01.1993", departman: "İŞL FABRİKA", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", servisTarihi: "09.02.2022", servisGuzergahi: "ETİLER", durak: "ETİLER", durum: "AKTIF" },
  { adSoyad: "Rakaşızer YAKIN", tcNo: "15106860736", cepTelefonu: "537 204 24 06", dogumTarihi: "22.09.1992", departman: "TEKNİK OFİS / BAKIM MÜHENDİSİ", pozisyon: "ÜRETİMDELAYAMA MÜHENDİSİ", lokasyon: "MERKEZ", servisTarihi: "07.04.2021", servisGuzergahi: "KENDİ ARACI İLE", durak: "KENDİ ARACI İLE", durum: "AKTIF" },
  { adSoyad: "Gençay ÖZELİÇ", tcNo: "50566081728", cepTelefonu: "553 982 27 27", dogumTarihi: "25.06.1992", departman: "İŞL FABRİKA", pozisyon: "BOYACI", lokasyon: "İŞL", servisTarihi: "05.05.2025", servisGuzergahi: "VALİLİK", durak: "VALİLİK", durum: "AKTIF" },
  { adSoyad: "Ömer AKTIN", tcNo: "52267500790", cepTelefonu: "553 111 89 25", dogumTarihi: "17.03.2005", departman: "İDARİ", pozisyon: "ÖZEL GÜVENLİK GÖREVLİSİ", lokasyon: "MERKEZ", servisTarihi: "17.03.2025", servisGuzergahi: "REKTÖRLİK", durak: "REKTÖRLİK", durum: "AKTIF" },
  { adSoyad: "Burkan ÖZBİLDİREN", tcNo: "27727500790", cepTelefonu: "553 111 89 25", dogumTarihi: "17.03.2005", departman: "İDARİ", pozisyon: "TEMİZ SORUMLUSU", lokasyon: "MERKEZ", servisTarihi: "17.03.2025", servisGuzergahi: "KENDİ ARACI İLE", durak: "KENDİ ARACI İLE", durum: "AKTIF" },
  { adSoyad: "Selin ALAÇ", tcNo: "30238479490", cepTelefonu: "544 515 88 43", dogumTarihi: "01.08.1990", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "24.06.2024", servisGuzergahi: "BAĞCILıEVLER", durak: "BAĞCILıEVLER", durum: "AKTIF" },
  { adSoyad: "Ozan ÇORBACIOĞLU", tcNo: "23993560520", cepTelefonu: "546 185 10 22", dogumTarihi: "20.02.1986", departman: "İŞL FABRİKA", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", servisTarihi: "16.08.2021", servisGuzergahi: "BAĞDAT KÖPRÜ", durak: "BAĞDAT KÖPRÜ", durum: "AKTIF" },
  { adSoyad: "Borna YATAR", tcNo: "12951571010", cepTelefonu: "533 389 95 63", dogumTarihi: "26.12.1968", departman: "MERKEZ FABRİKA", pozisyon: "AMİDE", lokasyon: "MERKEZ", servisTarihi: "17.06.2022", servisGuzergahi: "DİSPANSER", durak: "DİSPANSER", durum: "AKTIF" },
  { adSoyad: "Turcay TEKİN", tcNo: "31657731810", cepTelefonu: "554 389 95 63", dogumTarihi: "26.12.1968", departman: "MERKEZ FABRİKA", pozisyon: "CNC TORNA OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "14.03.2023", servisGuzergahi: "DİSPANSER", durak: "DİSPANSER", durum: "AKTIF" },
  { adSoyad: "Ümit ALTAY", tcNo: "19847504172", cepTelefonu: "544 315 71 52", dogumTarihi: "09.08.1980", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "20.05.2024", servisGuzergahi: "KAŞIYAMA", durak: "KAŞIYAMA", durum: "AKTIF" },
  { adSoyad: "Ümit GEBELEK", tcNo: "19567371784", cepTelefonu: "537 226 95 81", dogumTarihi: "02.03.2001", departman: "İŞL FABRİKA", pozisyon: "İmal İşcisi Engelşi", lokasyon: "İŞL", servisTarihi: "07.04.2021", servisGuzergahi: "KAŞIYAMA", durak: "KAŞIYAMA", durum: "AKTIF" },
  { adSoyad: "Yaşar İNCEÇAK", tcNo: "17527336360", cepTelefonu: "544 858 58 31", dogumTarihi: "19.07.2005", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "20.05.2024", servisGuzergahi: "OSMANGAZİ", durak: "OSMANGAZİ", durum: "AKTIF" },
  { adSoyad: "Veysel Emre TOĞLU", tcNo: "10772406560", cepTelefonu: "506 062 08 77", dogumTarihi: "19.07.2005", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "20.05.2024", servisGuzergahi: "OSMANGAZİ", durak: "OSMANGAZİ", durum: "AKTIF" },
  { adSoyad: "Yaşar GÜLER", tcNo: "17535131240", cepTelefonu: "544 858 58 31", dogumTarihi: "19.07.2005", departman: "İŞL FABRİKA", pozisyon: "İMAL İŞÇİSİ", lokasyon: "İŞL", servisTarihi: "14.03.2023", servisGuzergahi: "KAŞIYAMA", durak: "KAŞIYAMA", durum: "AKTIF" },
  { adSoyad: "Yasin BATALTI", tcNo: "11272351542", cepTelefonu: "552 296 00 71", dogumTarihi: "06.09.2006", departman: "MERKEZ FABRİKA", pozisyon: "CNC FREZE OPERATÖRÜ", lokasyon: "MERKEZ", servisTarihi: "10.09.2024", servisGuzergahi: "REKTÖRLİK", durak: "REKTÖRLİK", durum: "AKTIF" },
  { adSoyad: "Yasin GÜNEŞ", tcNo: "11912342461", cepTelefonu: "531 842 80 27", dogumTarihi: "29.06.1990", departman: "İŞL FABRİKA", pozisyon: "KAYNAKÇI", lokasyon: "İŞL", servisTarihi: "30.05.2024", servisGuzergahi: "KAŞIYAMA REKTÖRLİK", durak: "KAŞIYAMA REKTÖRLİK", durum: "AKTIF" }
];

// Ana import fonksiyonu  
const importRemainingEmployees = async () => {
  try {
    console.log('🚀 Geriye kalan çalışan verileri import işlemi başlıyor...');
    console.log(`📋 ${remainingEmployees.length} çalışan eklenecek`);
    
    let importedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < remainingEmployees.length; i++) {
      const row = remainingEmployees[i];
      
      try {
        // TC No ile çakışma kontrolü yap
        if (row.tcNo) {
          const existing = await Employee.findOne({ tcNo: row.tcNo });
          if (existing) {
            console.log(`⚠️ ${row.adSoyad} zaten mevcut, atlanıyor`);
            skippedCount++;
            continue;
          }
        }
        
        // Veriyi temizle ve normalize et
        const employeeData = {
          adSoyad: row.adSoyad?.trim() || '',
          tcNo: row.tcNo?.toString().replace(/[^\d]/g, '') || '',
          cepTelefonu: row.cepTelefonu?.toString().replace(/[^\d]/g, '') || '',
          dogumTarihi: parseDate(row.dogumTarihi),
          departman: normalizeDepartment(row.departman),
          pozisyon: row.pozisyon?.trim() || '',
          lokasyon: normalizeLocation(row.lokasyon),
          servisTarihi: parseDate(row.servisTarihi),
          servisGuzergahi: row.servisGuzergahi?.trim() || '',
          durak: row.durak?.trim() || '',
          durum: normalizeStatus(row.durum)
        };
        
        // TC No boşsa kaldır
        if (!employeeData.tcNo) {
          delete employeeData.tcNo;
        }
        
        // Yeni çalışan oluştur
        const employee = new Employee(employeeData);
        await employee.save();
        
        importedCount++;
        console.log(`✅ ${importedCount}. ${employeeData.adSoyad} - ${employee.employeeId}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Satır ${i + 1} hatası (${row.adSoyad}):`, error.message);
      }
    }
    
    console.log('\n📊 Import Sonucu:');
    console.log(`✅ Başarıyla eklenen: ${importedCount}`);
    console.log(`⚠️ Zaten mevcut (atlanan): ${skippedCount}`);
    console.log(`❌ Hata olan: ${errorCount}`);
    console.log(`📋 Toplam işlenen: ${remainingEmployees.length}`);
    
    // Final istatistikler
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ durum: 'AKTIF' });
    
    console.log('\n📈 Final Veritabanı Durumu:');
    console.log(`👥 Toplam çalışan: ${totalEmployees}`);
    console.log(`🟢 Aktif çalışan: ${activeEmployees}`);
    
    // Departman dağılımı
    const deptStats = await Employee.aggregate([
      { $group: { _id: '$departman', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n🏢 Final Departman Dağılımı:');
    deptStats.forEach(dept => {
      console.log(`  ${dept._id}: ${dept.count} kişi`);
    });
    
  } catch (error) {
    console.error('❌ Import genel hatası:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Veritabanı bağlantısı kapatıldı');
    process.exit(0);
  }
};

// Yardımcı fonksiyonlar
const parseDate = (dateStr) => {
  if (!dateStr || dateStr === '') return null;
  try {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  } catch (error) {
    console.log(`⚠️ Tarih parse edilemedi: ${dateStr}`);
    return null;
  }
};

const normalizeDepartment = (dept) => {
  if (!dept) return 'MERKEZ FABRİKA';
  const deptUpper = dept.toString().toUpperCase();
  if (deptUpper.includes('MERKEZ FAB')) return 'MERKEZ FABRİKA';
  if (deptUpper.includes('İŞL FAB')) return 'İŞL FABRİKA';
  if (deptUpper.includes('TEKNİK') || deptUpper.includes('BAKIM')) return 'TEKNİK OFİS / BAKIM MÜHENDİSİ';
  if (deptUpper.includes('İDARİ')) return 'İDARİ';
  if (deptUpper.includes('CNC') || deptUpper.includes('TORNA')) return 'CNC TORNA İŞLİYATÇISI';
  return 'MERKEZ FABRİKA';
};

const normalizeLocation = (loc) => {
  if (!loc) return 'MERKEZ';
  const locUpper = loc.toString().toUpperCase();
  if (locUpper.includes('İŞL') || locUpper.includes('ISIL')) return 'İŞL';
  return 'MERKEZ';
};

const normalizeStatus = (status) => {
  if (!status) return 'AKTIF';
  const statusUpper = status.toString().toUpperCase();
  if (statusUpper.includes('AKTIF')) return 'AKTIF';
  if (statusUpper.includes('PASIF')) return 'PASIF';
  if (statusUpper.includes('IZIN')) return 'IZINLI';
  if (statusUpper.includes('AYRIL')) return 'AYRILDI';
  return 'AKTIF';
};

// Script'i çalıştır
const main = async () => {
  await connectDB();
  await importRemainingEmployees();
};

main().catch(console.error); 