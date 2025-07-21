const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// 🌍 MongoDB bağlantısı
const MONGODB_URI = 'mongodb+srv://zumerkekillioglu:Toor1234@cluster0.1flaw.mongodb.net/canga_db?retryWrites=true&w=majority';

// 📋 Aktif çalışanlar verisi - Excel'den alınan
const activeEmployeesData = [
  // DİSPANSER SERVİS GÜZERGAHI
  { name: "Ali GÜRBÜZ", tcNo: "64542249499", phone: "532 377 99 22", birthDate: "22.05.1969", hireDate: "23.04.2019", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ŞADIRVAN (PERŞEMBE PAZARI)" },
  { name: "Ali SAVAŞ", tcNo: "17012815250", phone: "505 088 86 25", birthDate: "30.06.1964", hireDate: "4.09.2019", position: "TORNACI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101/DOĞTAŞ" },
  { name: "Berat ÖZDEN", tcNo: "27159952240", phone: "505 998 55 15", birthDate: "25.06.2004", hireDate: "24.06.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "Cevdet ÖKSÜZ", tcNo: "14782917040", phone: "545 968 29 29", birthDate: "18.07.2006", hireDate: "8.04.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "Erdal YAKUT", tcNo: "18385959042", phone: "544 999 64 76", birthDate: "20.03.1971", hireDate: "14.03.2023", position: "KAYNAKÇI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "GÜL PASTANESİ" },
  { name: "Eyüp TORUN", tcNo: "28872685678", phone: "537 037 23 23", birthDate: "26.02.1978", hireDate: "7.01.2020", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "İbrahim VARLIOĞLU", tcNo: "31954564608", phone: "506 380 11 39", birthDate: "23.05.1985", hireDate: "8.11.2019", position: "AutoForm Editörü", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "Muhammed Sefa PEHLİVANLI", tcNo: "17047757832", phone: "554 014 41 41", birthDate: "6.07.2005", hireDate: "26.04.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "Murat ÇAVDAR", tcNo: "47069969644", phone: "533 942172 04", birthDate: "12.08.1956", hireDate: "31.07.2024", position: "MAL İŞÇİSİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "ŞADIRVAN (PERŞEMBE PAZARI)" },
  { name: "Mustafa BIYIK", tcNo: "20644978244", phone: "507 521 45 57", birthDate: "6.01.1992", hireDate: "7.04.2021", position: "İKİ AMBAR EMİNİ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "Özkan AYDIN", tcNo: "11219965802", phone: "532 399 12 89", birthDate: "25.11.2005", hireDate: "9.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "Celal GÜLŞEN", tcNo: "27054247060", phone: "506 654 13 52", birthDate: "3.06.1982", hireDate: "31.06.2021", position: "TORNACI", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "Muhammed NAZİM GÖÇ", tcNo: "31894932242", phone: "506 409 88 33", birthDate: "2.03.1990", hireDate: "1.09.2021", position: "ÖZEL GÜVENLİK", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },
  { name: "Tuncay TEKİN", tcNo: "38535858040", phone: "539 111 12 32", birthDate: "2.11.2000", hireDate: "18.09.2019", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "DİSPANSER SERVİS GÜZERGAHI", serviceStop: "DİSPANSER ÜST GEÇİT" },

  // SANAYİ MAHALLESİ SERVİS GÜZERGAHI  
  { name: "Ali Sıh YORULMAZ", tcNo: "13119496173", phone: "537 536 14 56", birthDate: "22.06.1952", hireDate: "9.04.2021", position: "SERİGRAFİ ANE ANA MEKİNİSTİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Ahmet Duran TUNA", tcNo: "49413466398", phone: "534 506 74 79", birthDate: "4.04.1993", hireDate: "7.04.2021", position: "BİL İŞLEM", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101/DOĞTAŞ" },
  { name: "Fatih BALOĞLU", tcNo: "19421519474", phone: "545 645 17 39", birthDate: "20.03.1967", hireDate: "17.09.2021", position: "İKİ - GÜDE SORUMLUSU", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Hakki YÜCEU", tcNo: "11194989982", phone: "533 802 14 76", birthDate: "2.02.2006", hireDate: "11.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Hayati SÖZDİNLER", tcNo: "15948211625", phone: "505 445 71 39", birthDate: "20.03.1967", hireDate: "17.09.2021", position: "İKİ - GÜDE SORUMLUSU", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Haydar ACAR", tcNo: "11048899684", phone: "533 802 14 76", birthDate: "2.02.2006", hireDate: "11.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "RASATTEPE KÖPRÜ" },
  { name: "Gülnur AĞIRMAN", tcNo: "32925036260", phone: "507 288 61 71", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "AYTEMİZ PETROL" },
  { name: "İsmet BAŞER", tcNo: "20826892256", phone: "507 469 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "AYTEMİZ PETROL" },
  { name: "Kemalettin GÜLEŞEN", tcNo: "20778803510", phone: "537 469 61 71", birthDate: "11.02.2002", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "RASATTEPE KÖPRÜ" },
  { name: "Macit USLU", tcNo: "27189853658", phone: "543 447 27 31", birthDate: "29.09.2003", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Mustafa SÜMER", tcNo: "11994346949", phone: "505 854 43 20", birthDate: "14.06.2004", hireDate: "23.12.2024", position: "SERİGRAF METİNİNİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "RASATTEPE KÖPRÜ" },
  { name: "Niyazi YURTSEVEN", tcNo: "16013855840", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101" },
  { name: "Berat AKTAŞ", tcNo: "31789876764", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "NOKTA A-101" },
  { name: "Nuri ÖZKAN", tcNo: "16013855830", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Mustafa BAŞKAYA", tcNo: "51412659840", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Muzaffer KIZILÇIÇEK", tcNo: "32471346923", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "MEZARLIK PEYZAJ ÖNÜ" },

  // OSMANGAZİ-KARŞIYAKA MAHALLESİ
  { name: "Asım DEMET", tcNo: "63888773412", phone: "539 089 26 35", birthDate: "18.06.2003", hireDate: "5.01.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "SALI PAZARI" },
  { name: "İlyas ÇURTAY", tcNo: "18736164800", phone: "544 543 71 13", birthDate: "12.09.1997", hireDate: "2.08.2022", position: "SİL GÜDE USTABAŞI", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "Polat ERCAN", tcNo: "32471548648", phone: "507 576 67 44", birthDate: "3.09.2004", hireDate: "20.04.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "Mustafa SAMURKOLLU", tcNo: "13374467266", phone: "507 310 93 30", birthDate: "3.09.1995", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "ERDURAN BAKKAL (KARŞIYAKA)" },
  { name: "Sefa ÖZTÜRK", tcNo: "15436512040", phone: "505 375 21 11", birthDate: "4.10.2002", hireDate: "23.11.2024", position: "MAL İŞÇİSİ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAHÇELIEVLER" },
  { name: "Salih GÖZÜAK", tcNo: "23234731680", phone: "507 921 16 65", birthDate: "26.09.1997", hireDate: "13.11.2019", position: "KALİTE KONTROL OPERAТÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "Selim ALSAÇ", tcNo: "16993855542", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "SALI PAZARI" },
  { name: "Ümit SAZAK", tcNo: "12476524523", phone: "507 534 36 10", birthDate: "2.09.1999", hireDate: "16.04.2020", position: "MAL İŞÇİSİ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "Ümit TORUN", tcNo: "18765433632", phone: "543 531 21 13", birthDate: "1.03.2002", hireDate: "3.01.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "KAHVELER (KARŞIYAKA)" },
  { name: "Yaşar ÇETİN", tcNo: "24810906934", phone: "538 667 46 71", birthDate: "13.12.1984", hireDate: "5.08.2019", position: "KALİTE KONTROL OPERAТÖRÜ", serviceRoute: "OSMANGAZİ-KARŞIYAKA MAHALLESİ", serviceStop: "BAHÇELIEVLER SAĞLIK OCAĞI" },

  // ÇALILIÖZ MAHALLESİ
  { name: "Ahmet ŞAHİN", tcNo: "26094659756", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
  { name: "Ali Çavuş BAŞTUĞ", tcNo: "16993435142", phone: "538 534 67 36", birthDate: "10.06.1997", hireDate: "3.01.2020", position: "EMİL", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "FIRINLI CAMİ" },
  { name: "Ali ÖKSÜZ", tcNo: "26094659700", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
  { name: "Aynur AYTEKİN", tcNo: "11219965890", phone: "532 399 12 89", birthDate: "25.11.2005", hireDate: "9.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇALILIÖZ KÖPRÜ (ALT YOL)" },
  { name: "Celal BARAN", tcNo: "26094659712", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇALILIÖZ KÖPRÜ (ALT YOL)" },
  { name: "Levent DURMAZ", tcNo: "47069969699", phone: "533 942172 04", birthDate: "12.08.1956", hireDate: "31.07.2024", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ÇALILIÖZ KÖPRÜ (ALT YOL)" },
  { name: "Metin ARSLAN", tcNo: "26094659668", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "NAR MARKET" },
  { name: "Musa DOĞU", tcNo: "21808634198", phone: "543 899 49 33", birthDate: "29.06.2001", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "FIRINLI CAMİ" },
  { name: "Ömer FİLİZ", tcNo: "16993855512", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
  { name: "Sadullah AKBAYIR", tcNo: "21808634171", phone: "543 899 49 33", birthDate: "29.06.2001", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
  { name: "Uğur ALBAYRAK", tcNo: "16993855577", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },
  { name: "Berat SUSAR", tcNo: "25943365890", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "VALİLİK ARKASI" },
  { name: "Hulusi Eren CAN", tcNo: "16993855522", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "VALİLİK ARKASI" },
  { name: "İbrahim ÜÇER", tcNo: "27189853611", phone: "543 447 27 31", birthDate: "29.09.2003", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "ES BENZİNLİK" },
  { name: "Soner Çetin GÜRSOY", tcNo: "16993855599", phone: "536 564 64 69", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "VALİLİK ARKASI" },
  { name: "Mehmet Ali ÖZÇELÍK", tcNo: "21808634144", phone: "543 899 49 33", birthDate: "29.06.2001", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "SAAT KULESİ" },

  // ÇARŞI MERKEZ
  { name: "Ahmet ÇELİK", tcNo: "61549999776", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" },
  { name: "Birkan ŞEKER", tcNo: "53988445176", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" },
  { name: "Hilmi SORGUN", tcNo: "61549999723", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "S-OİL BENZİNLİK" },
  { name: "Emir Kaan BAŞER", tcNo: "25943365847", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "BAŞPINAR" },
  { name: "Mert SÜNBÜL", tcNo: "61549999744", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "TOPRAK YEMEK" },
  { name: "Mesut TUNCER", tcNo: "53988445189", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },
  { name: "Alperen TOZLU", tcNo: "25943365821", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },
  { name: "Veysel Emre TOZLU", tcNo: "61549999756", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "HALİ SAHA" },
  { name: "Mine KARAOĞLU", tcNo: "53988445134", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Furkan Kadir EDEN", tcNo: "61549999721", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "REKTÖRLÜK" },
  { name: "Yusuf GÜRBÜZ", tcNo: "25943365865", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "ES BENZİNLİK" },
  { name: "Mehmet EKTAŞ", tcNo: "53988445167", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Hüdagül DEĞİRMENCİ", tcNo: "61549999732", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Yasin SAYGILI", tcNo: "25943365876", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "ESKİ REKTÖRLÜK/ GÜNDOĞDU OSMANGAZİ" },
  { name: "Çağrı YILDIZ", tcNo: "53988445145", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "MUTAT. OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Cemal ERAKŞOY", tcNo: "61549999718", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "YENİMAHALLE GO BENZİNLİK" },
  { name: "Aziz BUĞRA KARA", tcNo: "25943365832", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "ÇARŞI MERKEZ SERVİS GÜZERGAHI", serviceStop: "BAĞDAT KÖPRÜVE ÜZERİ" },

  // Servis kullanmayanlar (örnekler)
  { name: "Rıdvan AKGÜL", tcNo: "10998435177", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: null, serviceStop: null },
  { name: "Emre DEMİRCİ", tcNo: "25943365854", phone: "507 409 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: null, serviceStop: null }
];

// 📅 Tarih parse fonksiyonu (DD.MM.YYYY → YYYY-MM-DD)
function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
}

// 🆔 Employee ID oluştur (İlk harfler + sıra numarası)
function generateEmployeeId(firstName, lastName, index) {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  const number = (index + 1).toString().padStart(4, '0');
  return `${firstInitial}${lastInitial}${number}`;
}

// 🏢 Departman normalizasyonu 
function normalizeDepartment(position) {
  const departmentMap = {
    // CNC Operatörleri
    'CNC TORNA OPERATÖRÜ': 'TORNA GRUBU',
    'CNC FREZE OPERATÖRÜ': 'FREZE GRUBU',
    'TORNACI': 'TORNA GRUBU',
    
    // Teknik Pozisyonlar
    'AutoForm Editörü': 'TEKNİK OFİS',
    'BİL İŞLEM': 'TEKNİK OFİS',
    'KALİTE KONTROL OPERAТÖRÜ': 'KALİTE KONTROL',
    'KAYNAKÇI': 'KAYNAK',
    
    // Üretim
    'MAL İŞÇİSİ': 'GENEL ÇALIŞMA GRUBU',
    'EMİL': 'GENEL ÇALIŞMA GRUBU',
    'MUTAT. OPERATÖRÜ': 'MONTAJ',
    
    // Diğer
    'SERİGRAFİ ANE ANA MEKİNİSTİ': 'TEKNİK OFİS',
    'SERİGRAF METİNİNİ': 'TEKNİK OFİS',
    'İKİ AMBAR EMİNİ': 'DEPO',
    'İKİ - GÜDE SORUMLUSU': 'KALİTE KONTROL',
    'SİL GÜDE USTABAŞI': 'KALİTE KONTROL',
    'ÖZEL GÜVENLİK': 'İDARİ BİRİM',
    'İDARE': 'İDARİ BİRİM'
  };
  
  return departmentMap[position] || 'DİĞER';
}

// 📍 Lokasyon belirleme (Servis güzergahına göre)
function determineLocation(serviceRoute) {
  if (!serviceRoute) return 'MERKEZ ŞUBE'; // Default
  
  const isilRoutes = ['SANAYİ MAHALLESİ SERVİS GÜZERGAHI', 'OSMANGAZİ-KARŞIYAKA MAHALLESİ', 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI'];
  const merkezRoutes = ['DİSPANSER SERVİS GÜZERGAHI', 'ÇARŞI MERKEZ SERVİS GÜZERGAHI'];
  
  if (isilRoutes.includes(serviceRoute)) {
    return 'IŞIL ŞUBE';
  } else if (merkezRoutes.includes(serviceRoute)) {
    return 'MERKEZ ŞUBE';
  }
  
  return 'MERKEZ ŞUBE'; // Default
}

// 🚀 Ana import fonksiyonu
async function importActiveEmployees() {
  try {
    console.log('🔌 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı!');

    // 🗑️ Mevcut çalışanları temizle (Ahmet ÇANGA ve Muhammed Zümer KEKİLLİOĞLU hariç)
    console.log('🗑️ Mevcut çalışanlar temizleniyor...');
    const excludeList = ['Ahmet ÇANGA', 'Muhammed Zümer KEKİLLİOĞLU'];
    
    const deleteResult = await Employee.deleteMany({
      fullName: { $nin: excludeList }
    });
    console.log(`🗑️ ${deleteResult.deletedCount} mevcut çalışan silindi.`);

    // 📝 Aktif çalışanları ekle (hariç tutulanlar olmadan)
    console.log('📝 Aktif çalışanlar ekleniyor...');
    let addedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < activeEmployeesData.length; i++) {
      const empData = activeEmployeesData[i];
      
      // 🚫 Hariç tutulacakları kontrol et
      if (empData.name === 'Ahmet ÇANGA' || empData.name === 'Muhammed Zümer KEKİLLİOĞLU') {
        console.log(`⏭️ ${empData.name} atlandı (hariç tutuldu)`);
        skippedCount++;
        continue;
      }

      // 👤 İsim ayrıştır
      const nameParts = empData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // 📋 Çalışan verisi hazırla
      const employee = new Employee({
        firstName: firstName,
        lastName: lastName,
        fullName: empData.name,
        employeeId: generateEmployeeId(firstName, lastName, addedCount),
        tcNo: empData.tcNo,
        phone: empData.phone,
        birthDate: parseDate(empData.birthDate),
        hireDate: parseDate(empData.hireDate),
        position: empData.position,
        department: normalizeDepartment(empData.position),
        location: determineLocation(empData.serviceRoute),
        status: 'AKTIF',
        serviceInfo: {
          routeName: empData.serviceRoute,
          stopName: empData.serviceStop,
          usesService: empData.serviceRoute ? true : false
        }
      });

      try {
        await employee.save();
        console.log(`✅ ${empData.name} eklendi (${employee.employeeId})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ ${empData.name} eklenirken hata:`, error.message);
      }
    }

    console.log('\n🎉 İmport işlemi tamamlandı!');
    console.log(`✅ Eklenen: ${addedCount} çalışan`);
    console.log(`⏭️ Atlanan: ${skippedCount} çalışan`);

  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı.');
  }
}

// 🚀 Scripti çalıştır
if (require.main === module) {
  importActiveEmployees();
}

module.exports = importActiveEmployees; 