const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGODB_URI = 'mongodb+srv://thebestkekilli:Z56uhyL13kQlOERM@canga.rgadvdl.mongodb.net/canga?retryWrites=true&w=majority&appName=canga';

// Excel tablosundan satır satır tam doğru liste (103 çalışan)
const correct103Employees = [
  { name: "Ahmet ÇANGA", tcNo: "49414249498", phone: "532 377 99 22", birthDate: "22.05.1969", hireDate: "23.04.2019", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Ali GÜRBÜZ", tcNo: "17012815250", phone: "505 088 86 25", birthDate: "30.06.1964", hireDate: "4.09.2019", position: "TORNACI", serviceRoute: "", serviceStop: "SAAT" },
  { name: "Ahmet ŞAHİN", tcNo: "27159952240", phone: "505 998 55 15", birthDate: "25.06.2004", hireDate: "24.06.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "YAYLACAİK" },
  { name: "Ali KÜÇÜKALP", tcNo: "14782917040", phone: "545 968 29 29", birthDate: "18.07.2006", hireDate: "8.04.2024", position: "MAL İŞÇİSİ", serviceRoute: "SANAYİ MAHALLESİ SERVİS GÜZERGAHI", serviceStop: "RASATTEPE KÖPRÜ BENZİNLİK" },
  { name: "Ahmet İLGİN", tcNo: "18385959042", phone: "544 999 64 76", birthDate: "20.03.1971", hireDate: "14.03.2023", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "KURUBAŞ" },
  { name: "Ahmet ÖZTAŞ", tcNo: "28872685678", phone: "537 037 23 23", birthDate: "26.02.1978", hireDate: "7.01.2020", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "ADAY(KARŞI) SÜTLÜCE" },
  { name: "Ali GÜRBÜZ", tcNo: "31954564608", phone: "506 380 11 39", birthDate: "23.05.1985", hireDate: "8.11.2019", position: "AutoForm Editörü", serviceRoute: "", serviceStop: "ŞADIRVAN" },
  { name: "Ali GÜNER", tcNo: "17047757832", phone: "554 014 41 41", birthDate: "6.07.2005", hireDate: "26.04.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "YALTAÇLIK" },
  { name: "Ali SAVAŞ", tcNo: "47069969644", phone: "533 942172 04", birthDate: "12.08.1956", hireDate: "31.07.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KALETEPİN" },
  { name: "Ali YILDIRIMAZ", tcNo: "20644978244", phone: "507 521 45 57", birthDate: "6.01.1992", hireDate: "7.04.2021", position: "İKİ AMBAR EMİNİ", serviceRoute: "", serviceStop: "TIRTILLAR" },
  { name: "Asır Baha KAYA", tcNo: "11219965802", phone: "532 399 12 89", birthDate: "25.11.2005", hireDate: "9.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Asım DEMET", tcNo: "27054247060", phone: "506 654 13 52", birthDate: "3.06.1982", hireDate: "31.06.2021", position: "TORNACI", serviceRoute: "", serviceStop: "KEMALLAR" },
  { name: "Azer BONKURT", tcNo: "31894932242", phone: "506 409 88 33", birthDate: "2.03.1990", hireDate: "1.09.2021", position: "ÖZEL GÜVENLİK VE ÇORBACISI", serviceRoute: "", serviceStop: "OSMANGAZİ" },
  { name: "Asım AYTEKİN", tcNo: "38535858040", phone: "539 111 12 32", birthDate: "2.11.2000", hireDate: "18.09.2019", position: "CNC OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Ahmet Duran TUNA", tcNo: "13119496173", phone: "537 536 14 56", birthDate: "22.06.1952", hireDate: "9.04.2021", position: "SERİGRAFİ(ANE ANA MEKİNİSTİ)", serviceRoute: "", serviceStop: "NOKTA A-101" },
  { name: "Belkıs AKGÜL", tcNo: "49413466398", phone: "534 506 74 79", birthDate: "4.04.1993", hireDate: "7.04.2021", position: "MERHAMETLİ ANA MEKİNİSTİ", serviceRoute: "", serviceStop: "KUŞMA ARAÇI İLE" },
  { name: "Berkan KÜRKÇÜ", tcNo: "19421519474", phone: "545 645 17 39", birthDate: "20.03.1967", hireDate: "17.09.2021", position: "İKİ DOKTOR", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Berkdemir İLHAN", tcNo: "19441613651", phone: "545 645 17 99", birthDate: "20.03.1997", hireDate: "17.09.2021", position: "SİL GÜDE SORUMLUSU", serviceRoute: "", serviceStop: "OVACIK" },
  { name: "Berat AKTAŞ", tcNo: "11194989982", phone: "533 802 14 76", birthDate: "2.02.2006", hireDate: "11.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "NOKTA A-101" },
  { name: "Berat SOYAR", tcNo: "14085847779", phone: "546 773 47 41", birthDate: "3.09.2004", hireDate: "20.04.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "VALİLİK" },
  { name: "Berat COŞKUN", tcNo: "32934478546", phone: "507 288 61 71", birthDate: "3.09.1995", hireDate: "27.08.2024", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Berat ÖZDEN", tcNo: "28082867377", phone: "537 469 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "ŞOH. BENZİNLİK" },
  { name: "Berat SUSAR", tcNo: "11011667268", phone: "506 331 96 15", birthDate: "2.09.1999", hireDate: "16.04.2020", position: "MURAT SERV SORUMLUSU", serviceRoute: "", serviceStop: "İGKME ARAÇLI" },
  { name: "Birkan ŞEKER", tcNo: "25431681209", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "BAĞHELLERE ARAÇI" },
  { name: "Bulut YAŞAR", tcNo: "53988445176", phone: "544 369 17 29", birthDate: "13.01.1967", hireDate: "14.04.2025", position: "KAYTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Celal GÜLŞEN", tcNo: "61549999776", phone: "517 986 26 35", birthDate: "16.08.2001", hireDate: "5.01.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "İlyas ÇURTAY", tcNo: "18786164800", phone: "544 543 71 13", birthDate: "12.09.1997", hireDate: "2.08.2022", position: "SİL GÜDE USTABAŞI", serviceRoute: "", serviceStop: "TUZMAKALLE (C) BENZİNLİK" },
  { name: "Cihan ÇELEBİ", tcNo: "32471548648", phone: "507 576 67 44", birthDate: "10.08.1997", hireDate: "23.11.2024", position: "ETKLAMA", serviceRoute: "", serviceStop: "ÇEVİRONELİ BIM MARKETI" },
  { name: "Civan ÖZBAY", tcNo: "63888773412", phone: "539 089 26 35", birthDate: "18.06.2003", hireDate: "5.01.2025", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "HOŞGELENE" },
  { name: "Devrim EMİRİ", tcNo: "20948006486", phone: "539 467 91 56", birthDate: "24.14.1998", hireDate: "23.09.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Emir Kaan BAŞER", tcNo: "20867662806", phone: "537 599 77 31", birthDate: "11.11.1999", hireDate: "26.01.2025", position: "MÜZAYİT KEZELEME UYMACAM", serviceRoute: "", serviceStop: "TEMPUÇARE" },
  { name: "Enes ÖZKÖK", tcNo: "20808522626", phone: "537 599 77 31", birthDate: "11.06.2003", hireDate: "29.07.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "OSMANGAZİ" },
  { name: "Eren ÇINAR", tcNo: "12854841661", phone: "533 597 59 86", birthDate: "13.11.2001", hireDate: "30.11.2024", position: "MAKİNE MÜHENDİSİ", serviceRoute: "", serviceStop: "ŞEKERLKLER GENÇLİĞİ" },
  { name: "Eyüp YORULMAZ", tcNo: "17337254036", phone: "532 721 52 11", birthDate: "13.09.2001", hireDate: "14.08.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "GÖL MUSTAFA DURKAĞIDİGİ OKARYAYA" },
  { name: "Ergin ORAL", tcNo: "67851384698", phone: "544 087 43 88", birthDate: "13.12.1988", hireDate: "5.08.2019", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Erkan ÖZMANZUMLARI", tcNo: "60482866800", phone: "533 834 43 48", birthDate: "30.06.1987", hireDate: "25.08.2019", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "GÜL PAÇAÇAKEK" },
  { name: "Erdem Kadir YILDIRIM", tcNo: "24816669791", phone: "538 687 46 71", birthDate: "1.03.1982", hireDate: "26.08.2024", position: "FABRİKA KÖĞUR YARDHCISI", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI İLÇEHOSMANGAZİ" },
  { name: "Ergin ÖZKALDI", tcNo: "53744899672", phone: "507 373 02 36", birthDate: "2.09.2002", hireDate: "7.05.2025", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Eyup ÜNVANLI", tcNo: "85688644183", phone: "544 369 17 29", birthDate: "4.07.2014", hireDate: "16.09.2019", position: "BYÇ.T", serviceRoute: "", serviceStop: "FIRİNLI CAMİ" },
  { name: "Furkan YAV", tcNo: "26314201076", phone: "507 409 61 71", birthDate: "2.09.2002", hireDate: "31.03.2020", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "FIRİNLİK" },
  { name: "Gülnur AĞIRMAN", tcNo: "11791748724", phone: "544 999 17 71", birthDate: "13.01.1997", hireDate: "14.04.2025", position: "MUSTAT. OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇORBACI ALİ DAYI" },
  { name: "Hakan AKPINAR", tcNo: "49331828036", phone: "539 459 17 71", birthDate: "13.11.1966", hireDate: "3.04.2021", position: "İKİ İMA", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Hasan AKTUBAR", tcNo: "20658997756", phone: "507 469 61 71", birthDate: "11.12.2002", hireDate: "29.04.2025", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "OSMANGAZİ" },
  { name: "Haydar ACAR", tcNo: "26720901072", phone: "538 667 46 71", birthDate: "7.02.1993", hireDate: "4.10.2019", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KASIM" },
  { name: "Hasan SORGUN", tcNo: "27169653858", phone: "543 447 27 31", birthDate: "29.09.2003", hireDate: "18.07.2022", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "ÇEVRECİ BENZİNLİK" },
  { name: "Hüdagül DEĞİRMENCİ", tcNo: "11994346949", phone: "505 854 43 20", birthDate: "14.06.2004", hireDate: "23.12.2024", position: "SERİGRAF METRİNİNİ", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK GENÇLİĞİ" },
  { name: "Hulusi Eren CAN", tcNo: "16013855840", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "VALİLİK" },
  { name: "Hun ÇAKILDI", tcNo: "31789876764", phone: "507 986 45 45", birthDate: "7.09.2003", hireDate: "8.08.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KASATKAÇE" },
  { name: "İbrahim YALDIRALI", tcNo: "10348977996", phone: "533 644 83 35", birthDate: "25.09.2002", hireDate: "24.04.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Hayatı EÇÜR", tcNo: "21167756453", phone: "543 633 94 12", birthDate: "13.09.1993", hireDate: "27.05.2021", position: "TORNACI", serviceRoute: "", serviceStop: "VALİLİK" },
  { name: "İsmail AKTUĞ", tcNo: "21087152404", phone: "507 921 16 52", birthDate: "16.09.1982", hireDate: "30.06.2022", position: "KALİTE KONTROL ÜST SİST", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Hakim TANIR", tcNo: "24537798477", phone: "543 862 59 75", birthDate: "30.10.1976", hireDate: "1.06.2026", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "BAMÇELİEVLER" },
  { name: "İsmat BAŞER", tcNo: "20758991145", phone: "507 469 61 71", birthDate: "30.08.1997", hireDate: "20.04.2026", position: "EMPAÇI", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Kemalettin GÜLEŞEN", tcNo: "13797968116", phone: "536 564 64 69", birthDate: "1.09.1973", hireDate: "4.06.2017", position: "KALITE", serviceRoute: "", serviceStop: "İTÇLER" },
  { name: "Kemal KARACA", tcNo: "36743734159", phone: "544 554 35 36", birthDate: "25.09.1977", hireDate: "9.05.2020", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "BAMÇELİEVLER" },
  { name: "Kerem ARSLAN", tcNo: "24917628094", phone: "544 543 83 35", birthDate: "29.09.1977", hireDate: "9.05.2020", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "İTÇLER" },
  { name: "Kerem DURMAZ", tcNo: "59728931162", phone: "543 844 99 71", birthDate: "10.05.1988", hireDate: "30.07.2024", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "" },
  { name: "Kerem EKRAĞAZ", tcNo: "11391887043", phone: "507 531 84 45", birthDate: "16.02.2003", hireDate: "29.07.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "İTÇLER" },
  { name: "Kerem EKMURAL", tcNo: "52212868775", phone: "543 447 27 31", birthDate: "29.05.2000", hireDate: "26.04.2025", position: "BİLGİSAYAR BLGZ VE YÖNETİM SİSTEMLERİ ENDÜSTRİ", serviceRoute: "", serviceStop: "HALİ SAHA" },
  { name: "Muhammed Zümer KEKİLLİOĞLU", tcNo: "36118256428", phone: "532 524 88 78", birthDate: "25.07.1989", hireDate: "10.05.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Mesut TUNCER", tcNo: "14389233784", phone: "533 712 76 71", birthDate: "16.11.1979", hireDate: "3.02.2020", position: "MAL İŞÇİSİ OPERATÖRÜ", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Mine ASLÇAK", tcNo: "4120814964", phone: "534 845 39 11", birthDate: "11.09.1978", hireDate: "27.07.2024", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇÜCÜK ŞUBE KARŞISI" },
  { name: "Mert SÜNBÜL", tcNo: "95894089502", phone: "534 901 56 60", birthDate: "30.03.1966", hireDate: "3.09.2022", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "OSMANGAZİ" },
  { name: "Mine KARAOĞLU", tcNo: "36784222359", phone: "534 979 99 14", birthDate: "6.09.1980", hireDate: "14.07.2022", position: "SAYIM ALMA SORUMLUSU", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Muhammed SEFA", tcNo: "10152629276", phone: "533 517 72 08", birthDate: "16.06.2001", hireDate: "6.03.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Muhammed Nazım GÖÇ", tcNo: "11927993339", phone: "534 138 49 28", birthDate: "19.13.2005", hireDate: "24.11.2024", position: "BYÇ.NT", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Mustafa DOĞAN", tcNo: "17013954680", phone: "554 014 46 69", birthDate: "20.12.2006", hireDate: "20.06.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Murat GÜLÇUR", tcNo: "23241846988", phone: "534 433 48 79", birthDate: "1.07.1970", hireDate: "14.03.2023", position: "SERVO KORUMA LOGI", serviceRoute: "", serviceStop: "ÇALILIÖZ" },
  { name: "Mustafa SAMURKOLLU", tcNo: "20775081090", phone: "506 638 11 03", birthDate: "3.09.1995", hireDate: "27.08.2024", position: "KALİTE KONTROL ŞEFİ", serviceRoute: "", serviceStop: "ŞEMSTAN" },
  { name: "Murat ÖZBÜY", tcNo: "31964433776", phone: "532 637 26 86", birthDate: "4.03.2014", hireDate: "8.08.2019", position: "İMAM AB ÇA ATFKÖRG", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Murat ALYÜZÜZ", tcNo: "31825769869", phone: "538 574 33 43", birthDate: "25.06.1978", hireDate: "14.05.2023", position: "SHAFTSDE(VE USTAUBBAŞAKAM ZAMANNı)", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Mustafa DOĞAN", tcNo: "67878861794", phone: "543 832 45 29", birthDate: "11.02.1988", hireDate: "7.11.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "FIRİNLI CAMI" },
  { name: "Musa DOĞU", tcNo: "51284546556", phone: "508 662 22 52", birthDate: "1.09.1988", hireDate: "14.04.2025", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "FIRİNLI CAMI" },
  { name: "Mustafa DOĞRU", tcNo: "40285667076", phone: "537 619 43 99", birthDate: "1.07.1996", hireDate: "30.05.2025", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "ÇEVAP" },
  { name: "Mustafa BIYIK", tcNo: "23744798159", phone: "544 645 17 79", birthDate: "3.12.1966", hireDate: "1.07.2019", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Mustafa SAMURKOLLU", tcNo: "64443325260", phone: "535 506 39 71", birthDate: "12.09.1973", hireDate: "31.03.2023", position: "EMF EKRAF DHİNEME LİGGI", serviceRoute: "", serviceStop: "ÇORBACI" },
  { name: "Mustafa SÜMER", tcNo: "86080778652", phone: "539 099 34 71", birthDate: "20.10.1989", hireDate: "10.05.1997", position: "SİL GÜDE USTABAKI", serviceRoute: "", serviceStop: "RASATTI" },
  { name: "Mustafa TÜRK ÖZTÜRK", tcNo: "60211856962", phone: "532 924 66 11", birthDate: "16.06.2004", hireDate: "5.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Mustafa TOĞRUL", tcNo: "13641100994", phone: "532 327 31 58", birthDate: "29.04.1995", hireDate: "1.04.2023", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Niyazi YURTSEVEN", tcNo: "55295435198", phone: "507 721 89 41", birthDate: "27.12.1997", hireDate: "4.09.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "" },
  { name: "Nuri ÖZKAN", tcNo: "92948185176", phone: "533 892 27 52", birthDate: "1.09.1972", hireDate: "23.06.2019", position: "MUSTAT. OPERATÖRÜ", serviceRoute: "", serviceStop: "ETILER" },
  { name: "Naser GÜNBAY", tcNo: "42568668176", phone: "535 702 27 32", birthDate: "24.06.1992", hireDate: "3.10.2015", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "VALİLİK" },
  { name: "Naser POLATEKEN", tcNo: "64858666770", phone: "543 959 19 83", birthDate: "13.08.1903", hireDate: "9.03.2025", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Oğuz EFE ZORLU", tcNo: "15259078798", phone: "505 431 26 22", birthDate: "7.09.1992", hireDate: "27.03.2020", position: "KALİTE KONTROL OPERATÖRÜ", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Osman ÖZKİLİÇ", tcNo: "15669119189", phone: "532 140 74 27", birthDate: "27.08.1964", hireDate: "29.10.2021", position: "MAKİNE ÜSTEDİRİ KUAMALÜMAHACIM", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Özkan AYDIN", tcNo: "11797851470", phone: "533 392 57 50", birthDate: "8.07.2005", hireDate: "31.01.2022", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "ŞATIRLER" },
  { name: "Polat ERCAN", tcNo: "58177754445", phone: "544 625 51 06", birthDate: "11.12.1994", hireDate: "1.08.2019", position: "MUMAL AHAL OPERATÖRÜ", serviceRoute: "", serviceStop: "KARŞIYAKA" },
  { name: "Salih GÖZÜAK", tcNo: "37841527576", phone: "536 585 64 61", birthDate: "30.09.1967", hireDate: "7.11.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "SEVERMELER ARACI" },
  { name: "Selim ALSAÇ", tcNo: "31886769636", phone: "508 981 71 06", birthDate: "7.11.1993", hireDate: "16.09.2024", position: "ÖZEL GÜVENLİK OPERATÖRÜ", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Süleyman ERKAY", tcNo: "32968990508", phone: "534 718 19 11", birthDate: "16.02.2003", hireDate: "31.01.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Sadullah AKBAYIR", tcNo: "46365253509", phone: "543 647 34 71", birthDate: "5.08.1994", hireDate: "31.08.2024", position: "MAKİNA MÜHENDİSİ", serviceRoute: "", serviceStop: "" },
  { name: "Sefa ÖZTÜRK", tcNo: "15415754969", phone: "505 375 21 11", birthDate: "4.10.2002", hireDate: "23.11.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "BAMÇELİEVLER" },
  { name: "Sultan GÜLIŞEN", tcNo: "27089829525", phone: "545 533 102/5", birthDate: "26.09.1997", hireDate: "13.11.2019", position: "KAYNAKÇI", serviceRoute: "", serviceStop: "BAĞDAT KÖPRÜ" },
  { name: "Süleyman ÇELİKER", tcNo: "26073137163", phone: "538 449 83 52", birthDate: "3.10.2002", hireDate: "27.08.2024", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "BAMÇELİEVLER" },
  { name: "Tamer DALHA", tcNo: "47594368895", phone: "536 564 64 69", birthDate: "2.09.1999", hireDate: "16.04.2020", position: "DİAS", serviceRoute: "", serviceStop: "DİSPANSER" },
  { name: "Uğur ALBAYRAK", tcNo: "47063308879", phone: "543 914 83 53", birthDate: "1.03.2002", hireDate: "3.01.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "SAAT KULESİ" },
  { name: "Vef ÇEVİK", tcNo: "39849588315", phone: "534 711 52 35", birthDate: "13.12.1984", hireDate: "5.08.2019", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "RASATKAÇE" },
  { name: "Ufuk SAZAN", tcNo: "20076752692", phone: "507 534 86 10", birthDate: "2.09.1999", hireDate: "16.04.2020", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KUŞDE ARAÇLI" },
  { name: "Ümit SAZAK", tcNo: "18765433632", phone: "543 531 21 13", birthDate: "1.03.2002", hireDate: "3.01.2025", position: "CNC TORNA OPERATÖRÜ", serviceRoute: "", serviceStop: "KARŞIYAKA" },
  { name: "Ümit TORUN", tcNo: "14775280008", phone: "506 662 58 77", birthDate: "19.07.2005", hireDate: "26.05.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "OSMANGAZİ" },
  { name: "Veysel Emre TOZLU", tcNo: "17394452452", phone: "543 528 59 19", birthDate: "1.03.2015", hireDate: "8.01.2024", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "KARŞIYAKA" },
  { name: "Yasin SAYGİLİ", tcNo: "31222695582", phone: "532 726 96 71", birthDate: "6.03.2006", hireDate: "19.09.2024", position: "CNC FREZE OPERATÖRÜ", serviceRoute: "", serviceStop: "ESKİ REKTÖRLÜK" },
  { name: "Yaşar ÇETİN", tcNo: "24810906934", phone: "538 667 46 71", birthDate: "13.12.1984", hireDate: "5.08.2019", position: "MAL İŞÇİSİ", serviceRoute: "", serviceStop: "ÇTYABAK MAHALLESİ SK" }
];

// Parse tarih helper fonksiyonu
function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(year, month - 1, day);
  }
  return null;
}

async function fix103Employees() {
  try {
    console.log('🔄 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    console.log('📊 Mevcut durum kontrol ediliyor...');
    const currentCount = await Employee.countDocuments({ durum: 'AKTIF' });
    console.log(`👥 Mevcut aktif çalışan: ${currentCount}`);

    console.log(`📋 Düzeltilecek liste: ${correct103Employees.length} çalışan`);

    // Önce tüm çalışanları sil
    console.log('\n🗑️ Mevcut tüm çalışanlar siliniyor...');
    await Employee.deleteMany({});
    console.log('✅ Mevcut çalışanlar temizlendi');

    let addedCount = 0;
    const failedEmployees = [];

    console.log('\n👥 103 çalışan doğru şekilde ekleniyor...');
    
    for (const empData of correct103Employees) {
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
          dogumTarihi: parseDate(empData.birthDate),
          iseGirisTarihi: parseDate(empData.hireDate),
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
    console.log(`📋 Toplam işlenen: ${correct103Employees.length} kayıt`);

    if (failedEmployees.length > 0) {
      console.log('\n❌ Eklenemeyen çalışanlar:');
      failedEmployees.forEach(name => console.log(`- ${name}`));
    }

    // Final kontrol
    const finalCount = await Employee.countDocuments({ durum: 'AKTIF' });
    console.log(`\n🎯 FINAL DURUM:`);
    console.log(`👥 Toplam aktif çalışan: ${finalCount}`);

    // Özel kontroller
    const ahmetCangaCount = await Employee.countDocuments({ adSoyad: 'Ahmet ÇANGA' });
    const zumerCount = await Employee.countDocuments({ adSoyad: { $regex: 'Zümer KEKİLLİOĞLU' } });
    
    console.log('\n🔍 ÖZEL KONTROLLER:');
    console.log(`🔸 Ahmet ÇANGA sayısı: ${ahmetCangaCount} (olması gereken: 1)`);
    console.log(`🔸 Zümer KEKİLLİOĞLU sayısı: ${zumerCount} (olması gereken: 1)`);

    console.log('\n🎉 103 çalışan düzeltme işlemi tamamlandı!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
fix103Employees();