const mongoose = require('mongoose');
const Employee = require('./models/Employee'); // 🎯 Çalışan modelini import ediyoruz
require('dotenv').config(); // .env dosyasındaki değişkenleri kullanmak için

// --- VERİLER ---
// 📝 Sana attığım metin ve resimlerdeki tüm çalışan verilerini dikkatlice buraya girdim.
// Her bir çalışan için güzergah ve durak bilgilerini resimlerden alarak güncelledim.
const employeesData = [
  // AD - SOYAD, TCKN, CEP, DOĞUM, İŞE GİRİŞ, GÖREV, SERVİS GÜZERGAHI, BİNİŞ NOKTASI
  { adSoyad: 'Ahmet ÇANGA', tcNo: '40147428190', cepTelefonu: '5523770932', dogumTarihi: '1969-03-22', iseGirisTarihi: '2019-05-21', pozisyon: 'CNC TORNA OPERATÖRÜ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'NOKTA A-101/DOĞTAŞ' },
  { adSoyad: 'Ahmet ÇELİK', tcNo: '17915891326', cepTelefonu: '5330173071', dogumTarihi: '1995-09-20', iseGirisTarihi: '2019-09-04', pozisyon: 'KAYNAKÇI', servisGuzergahi: 'Çarşı Merkez', durak: 'S-OİL BENZİNLİK' },
  { adSoyad: 'Ahmet ŞAHİN', tcNo: '47218592200', cepTelefonu: '5058080113', dogumTarihi: '2004-06-30', iseGirisTarihi: '2024-06-24', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'SAAT KULESİ' },
  { adSoyad: 'Abbas Can ÖNGER', tcNo: '10470137946', cepTelefonu: '5439640229', dogumTarihi: '2006-07-19', iseGirisTarihi: '2025-05-05', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'BAĞDAT BENZİNLİK' },
  { adSoyad: 'Ahmet ILGIN', tcNo: '18185559282', cepTelefonu: '5419596876', dogumTarihi: '1973-03-20', iseGirisTarihi: '2023-03-14', pozisyon: 'KAYNAKÇI', servisGuzergahi: 'Sanayi Mahallesi', durak: 'NOKTA A-101' }, // Servis bilgisi resimlerde yok, metinden alındı.
  { adSoyad: 'Ali Çavuş BAŞTUĞ', tcNo: '28873804358', cepTelefonu: '5510573521', dogumTarihi: '1978-02-26', iseGirisTarihi: '1900-01-07', pozisyon: 'BOYACI', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'FIRINLI CAMİ' },
  { adSoyad: 'Ali GÜRBÜZ', tcNo: '31874424968', cepTelefonu: '5063405157', dogumTarihi: '1985-05-23', iseGirisTarihi: '2019-11-08', pozisyon: 'ASFALTLAMA GÖREVLİSİ', servisGuzergahi: 'Dispanser', durak: 'ŞADIRVAN (PERŞEMBE PAZARI)' },
  { adSoyad: 'Ali ÖKSÜZ', tcNo: '11747376242', cepTelefonu: '5436388481', dogumTarihi: '2006-07-08', iseGirisTarihi: '2024-06-24', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'SAAT KULESİ' },
  { adSoyad: 'Ali SAVAŞ', tcNo: '45676966694', cepTelefonu: '5437437741', dogumTarihi: '1956-01-01', iseGirisTarihi: '2024-07-31', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Dispanser', durak: 'NOKTA A-101/DOĞTAŞ' },
  { adSoyad: 'Ali Şıh YORULMAZ', tcNo: '12920334486', cepTelefonu: '5438041868', dogumTarihi: '1979-06-01', iseGirisTarihi: '2014-08-21', pozisyon: 'IŞIL ŞUBE USTABAŞI', servisGuzergahi: 'Sanayi Mahallesi', durak: 'ÇORBACI ALİ DAYI' },
  { adSoyad: 'Aziz Buğra KARA', tcNo: '11138396552', cepTelefonu: '5327095380', dogumTarihi: '2005-11-29', iseGirisTarihi: '2024-09-09', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Çarşı Merkez', durak: 'BAĞDAT KÖPRÜ VE ÜZERİ' },
  { adSoyad: 'Asım DEMET', tcNo: '27551247586', cepTelefonu: '5466551352', dogumTarihi: '1952-09-21', iseGirisTarihi: '2021-06-30', pozisyon: 'TORNACI', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'SALİ PAZARI' },
  { adSoyad: 'Alperen TOZLU', tcNo: '10028925254', cepTelefonu: '5060620863', dogumTarihi: '2000-11-02', iseGirisTarihi: '2023-09-01', pozisyon: 'ÖZEL GÜVENLİK GÖREVLİSİ', servisGuzergahi: 'Çarşı Merkez', durak: 'HALI SAHA' },
  { adSoyad: 'Aynur AYTEKİN', tcNo: '25789906848', cepTelefonu: '5053510442', dogumTarihi: '1978-04-20', iseGirisTarihi: '2019-08-17', pozisyon: 'LOBİ GÖREVLİSİ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'ÇALILIÖZ KÖPRÜ (ALT YOL)' },
  { adSoyad: 'Ahmet Duran TUNA', tcNo: '56302289476', cepTelefonu: '5389712212', dogumTarihi: '2002-02-02', iseGirisTarihi: '2024-09-30', pozisyon: 'CNC TORNA OPERATÖRÜ', servisGuzergahi: 'Sanayi Mahallesi', durak: 'NOKTA A-101/DOĞTAŞ' },
  { adSoyad: 'Bahadır AKKÜL', tcNo: '15116984724', cepTelefonu: '5372042406', dogumTarihi: '1992-09-22', iseGirisTarihi: '2021-04-07', pozisyon: 'ÜRETİM/PLANLAMA MÜHENDİSİ', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'Burcu KARAKOÇ', tcNo: '51031464958', cepTelefonu: '5456640671', dogumTarihi: '1993-02-09', iseGirisTarihi: '2023-10-09', pozisyon: 'ÖN MUHASEBE', servisGuzergahi: 'Çalılıöz Mahallesi', durak: '' }, // Durağı resimde belirtilmemiş
  { adSoyad: 'Batuhan İLHAN', tcNo: '19544113862', cepTelefonu: '5456421769', dogumTarihi: '1997-03-20', iseGirisTarihi: '2021-07-17', pozisyon: 'IŞIL ŞUBE SORUMLUSU', servisGuzergahi: 'Ovacık', durak: '' }, // Servis bilgisi resimlerde yok
  { adSoyad: 'Berat AKTAŞ', tcNo: '11186395194', cepTelefonu: '5510566176', dogumTarihi: '2006-01-02', iseGirisTarihi: '2024-09-11', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Sanayi Mahallesi', durak: 'NOKTA A-101' },
  { adSoyad: 'Berat SUSAR', tcNo: '10802407372', cepTelefonu: '5467238741', dogumTarihi: '2005-08-03', iseGirisTarihi: '2024-05-20', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'VALİLİK ARKASI' },
  { adSoyad: 'Berat ÖZDEN', tcNo: '33274657366', cepTelefonu: '5395483661', dogumTarihi: '1995-01-05', iseGirisTarihi: '2023-07-03', pozisyon: 'KALİTE KONTROL GÖREVLİSİ', servisGuzergahi: 'Dispanser', durak: 'DİSPANSER ÜST GEÇİT' },
  { adSoyad: 'Birkan ŞEKER', tcNo: '10958402672', cepTelefonu: '5510656540', dogumTarihi: '2005-10-03', iseGirisTarihi: '2024-05-27', pozisyon: 'CNC TORNA OPERATÖRÜ', servisGuzergahi: 'Çarşı Merkez', durak: 'S-OİL BENZİNLİK' },
  { adSoyad: 'Bilal CEVİZOĞLU', tcNo: '18347554322', cepTelefonu: '5305519671', dogumTarihi: '1992-03-02', iseGirisTarihi: '2020-05-14', pozisyon: 'MERKEZ ŞUBE SORUMLUSU', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'Berkan BULANIK', tcNo: '15454012608', cepTelefonu: '5465755231', dogumTarihi: '2002-10-04', iseGirisTarihi: '2024-11-28', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'Celal BARAN', tcNo: '23542981880', cepTelefonu: '5300928566', dogumTarihi: '1990-04-23', iseGirisTarihi: '2021-12-13', pozisyon: 'KALİTE KONTROL GÖREVLİSİ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'ÇALILIÖZ KÖPRÜ (ALT YOL)' },
  { adSoyad: 'Celal GÜLŞEN', tcNo: '36841537412', cepTelefonu: '5380362695', dogumTarihi: '2001-04-10', iseGirisTarihi: '2025-01-02', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Dispanser', durak: 'DİSPANSER ÜST GEÇİT' },
  { adSoyad: 'Cemal ERAKSOY', tcNo: '10379691860', cepTelefonu: '5456557813', dogumTarihi: '2005-07-01', iseGirisTarihi: '2025-06-23', pozisyon: 'CNC TORNA OPERATÖRÜ', servisGuzergahi: 'Çarşı Merkez', durak: 'YENİMAHALLE GO BENZİNLİK' },
  { adSoyad: 'Cihan ÇELEBİ', tcNo: '25978902552', cepTelefonu: '5356676981', dogumTarihi: '1977-09-10', iseGirisTarihi: '2024-12-23', pozisyon: 'TAŞLAMA', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'ÇULLU YOLU BİM MARKET' },
  { adSoyad: 'Cevdet ÖKSÜZ', tcNo: '60463439724', cepTelefonu: '5358747644', dogumTarihi: '1968-03-18', iseGirisTarihi: '2022-07-14', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Dispanser', durak: 'DİSPANSER ÜST GEÇİT' },
  { adSoyad: 'Çağrı YILDIZ', tcNo: '19922369966', cepTelefonu: '5424998591', dogumTarihi: '1994-11-24', iseGirisTarihi: '2024-05-27', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Çarşı Merkez', durak: 'BAĞDAT KÖPRÜ' },
  { adSoyad: 'Dilara Berra YILDIRIM', tcNo: '24007966206', cepTelefonu: '5333393281', dogumTarihi: '1998-11-11', iseGirisTarihi: '2025-01-20', pozisyon: 'BİLGİ İŞLEM SORUMLUSU', servisGuzergahi: 'Osmangazi', durak: '' }, // Resimlerde bu güzergah yok, metinden alındı.
  { adSoyad: 'Emir Kaan BAŞER', tcNo: '10655412936', cepTelefonu: '5419676827', dogumTarihi: '2005-06-15', iseGirisTarihi: '2024-07-29', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Çarşı Merkez', durak: 'BAŞPINAR' },
  { adSoyad: 'Emir GÖÇÜK', tcNo: '13669266144', cepTelefonu: '5317072696', dogumTarihi: '2001-11-15', iseGirisTarihi: '2024-12-30', pozisyon: 'MAKİNE MÜHENDİSİ', servisGuzergahi: 'Rektörlük (Yenişehir)', durak: '' }, // Servis bilgisi resimlerde yok
  { adSoyad: 'Emre DEMİRCİ', tcNo: '31729326508', cepTelefonu: '5427312633', dogumTarihi: '2001-10-15', iseGirisTarihi: '2025-04-14', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'KEL MUSTAFA DURAĞI' },
  { adSoyad: 'Emre ÇİÇEK', tcNo: '47155194680', cepTelefonu: '5518676386', dogumTarihi: '1988-12-15', iseGirisTarihi: '2019-05-09', pozisyon: 'KALİTE KONTROL GÖREVLİSİ', servisGuzergahi: 'Bağdat Köprü', durak: '' }, // Servis bilgisi resimlerde yok
  { adSoyad: 'Erdal YAKUT', tcNo: '58354220650', cepTelefonu: '5310838438', dogumTarihi: '1987-04-28', iseGirisTarihi: '2019-08-21', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Dispanser', durak: 'GÜL PASTANESİ' },
  { adSoyad: 'Erdem Kamil YILDIRIM', tcNo: '24016965924', cepTelefonu: '', dogumTarihi: null, iseGirisTarihi: null, pozisyon: 'FABRİKA MÜDÜR YARDIMCISI', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'Eyüp TORUN', tcNo: '20336488082', cepTelefonu: '5515516236', dogumTarihi: '1982-01-01', iseGirisTarihi: '2024-08-26', pozisyon: 'KAYNAKÇI', servisGuzergahi: 'Dispanser', durak: 'DİSPANSER ÜST GEÇİT' },
  { adSoyad: 'Eyüp ÜNVANLI', tcNo: '53080681416', cepTelefonu: '5413605129', dogumTarihi: '1954-01-05', iseGirisTarihi: '2019-01-16', pozisyon: 'BEKÇİ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'FIRINLI CAMİ' },
  { adSoyad: 'Furkan Kadir ESEN', tcNo: '25121428106', cepTelefonu: '5527805002', dogumTarihi: '2002-01-02', iseGirisTarihi: '2025-04-21', pozisyon: 'KALİTE KONTROL GÖREVLİSİ', servisGuzergahi: 'Çarşı Merkez', durak: 'REKTÖRLÜK' },
  { adSoyad: 'Gülnur AĞIRMAN', tcNo: '11773175574', cepTelefonu: '5435995571', dogumTarihi: '1997-03-15', iseGirisTarihi: '2025-04-14', pozisyon: 'MUTFAK GÖREVLİSİ', servisGuzergahi: 'Sanayi Mahallesi', durak: 'AYTEMİZ PETROL' },
  { adSoyad: 'Hayati SÖZDİNLER', tcNo: '40813406286', cepTelefonu: '5528801571', dogumTarihi: '1966-11-13', iseGirisTarihi: '2022-04-04', pozisyon: 'TESVİYECİ', servisGuzergahi: 'Sanayi Mahallesi', durak: 'ÇORBACI ALİ DAYI' },
  { adSoyad: 'Hakan AKPINAR', tcNo: '20024099736', cepTelefonu: '5076870171', dogumTarihi: '2002-12-11', iseGirisTarihi: '2025-04-29', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Çarşı Merkez', durak: 'HALI SAHA' },
  { adSoyad: 'Haydar ACAR', tcNo: '40975800182', cepTelefonu: 'kullanmıyor', dogumTarihi: '1972-06-01', iseGirisTarihi: '2023-03-14', pozisyon: 'BOYACI', servisGuzergahi: 'Sanayi Mahallesi', durak: 'RASATTEPE KÖPRÜ' },
  { adSoyad: 'Hilmi SORGUN', tcNo: '27100863816', cepTelefonu: '5454412781', dogumTarihi: '2001-08-29', iseGirisTarihi: '2022-07-18', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Çarşı Merkez', durak: 'S-OİL BENZİNLİK' },
  { adSoyad: 'Hüdagül DEĞİRMENCİ', tcNo: '23890180584', cepTelefonu: '5053606505', dogumTarihi: '2001-08-12', iseGirisTarihi: '2024-12-25', pozisyon: 'MAKİNE MÜHENDİSİ', servisGuzergahi: 'Çarşı Merkez', durak: 'ESKİ REKTÖRLÜK' },
  { adSoyad: 'Hulusi Eren CAN', tcNo: '10934403600', cepTelefonu: '5050705681', dogumTarihi: '2005-09-07', iseGirisTarihi: '2024-05-20', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'VALİLİK ARKASI' },
  { adSoyad: 'İlyas CURTAY', tcNo: '11318390950', cepTelefonu: '5415588633', dogumTarihi: '2006-03-25', iseGirisTarihi: '2024-06-24', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'KAHVELER (KARŞIYAKA)' },
  { adSoyad: 'İbrahim VARLIOĞLU', tcNo: '50320087960', cepTelefonu: '5434180879', dogumTarihi: '1987-09-22', iseGirisTarihi: '2019-02-28', pozisyon: 'BOYACI', servisGuzergahi: 'Dispanser', durak: 'DİSPANSER ÜST GEÇİT' },
  { adSoyad: 'İbrahim ÜÇER', tcNo: '21167783612', cepTelefonu: '5050118672', dogumTarihi: '1955-09-13', iseGirisTarihi: '2021-07-27', pozisyon: 'TORNACI', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'ES BENZİNLİK' },
  { adSoyad: 'İrfan KIRAÇ', tcNo: '12401752068', cepTelefonu: '5071981529', dogumTarihi: '1983-09-16', iseGirisTarihi: '2019-05-03', pozisyon: 'LOJİSTİK GÖREVLİSİ', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'İsmet BAŞER', tcNo: '29251791512', cepTelefonu: '5438825872', dogumTarihi: '1976-10-20', iseGirisTarihi: '2020-06-01', pozisyon: 'ELEKTRİK/BAKIM ONARIM GÖREVLİSİ', servisGuzergahi: 'Sanayi Mahallesi', durak: 'AYTEMİZ PETROL' },
  { adSoyad: 'Kamil Batuhan BEYGO', tcNo: '16979600110', cepTelefonu: '5434716179', dogumTarihi: '1997-08-30', iseGirisTarihi: '2025-05-07', pozisyon: 'KALİTE KONTROL MÜHENDİSİ', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'Kemal KARACA', tcNo: '38761742198', cepTelefonu: '5459542536', dogumTarihi: '1973-05-01', iseGirisTarihi: '2017-05-04', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'BAHÇELİEVLER' },
  { adSoyad: 'Kemalettin GÜLEŞEN', tcNo: '24037965804', cepTelefonu: '5444160355', dogumTarihi: '1977-08-25', iseGirisTarihi: '2023-04-03', pozisyon: 'KAYNAKÇI', servisGuzergahi: 'Sanayi Mahallesi', durak: 'RASATTEPE KÖPRÜ' },
  { adSoyad: 'Levent DURMAZ', tcNo: '38170493162', cepTelefonu: '5428450071', dogumTarihi: '1994-03-10', iseGirisTarihi: '2024-07-30', pozisyon: 'KAYNAKÇI', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'ÇALILIÖZ KÖPRÜ (ALT YOL)' },
  { adSoyad: 'Macit USLU', tcNo: '11219393234', cepTelefonu: '5468535662', dogumTarihi: '2003-02-16', iseGirisTarihi: '2024-07-29', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Sanayi Mahallesi', durak: 'ÇORBACI ALİ DAYI' },
  { adSoyad: 'Muhammed Zümer KEKİLLİOĞLU', tcNo: '52912766772', cepTelefonu: '5413812114', dogumTarihi: '2002-05-28', iseGirisTarihi: '2025-06-26', pozisyon: 'BİLGİSAYAR BİLGİ YÖNETİM ELEMANI (ENGELLİ)', servisGuzergahi: 'Çarşı Merkez', durak: 'HALI SAHA' },
  { adSoyad: 'Mehmet ERTAŞ', tcNo: '25115328344', cepTelefonu: '5527240674', dogumTarihi: '1999-07-22', iseGirisTarihi: '2024-09-10', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Çarşı Merkez', durak: 'ESKİ REKTÖRLÜK' },
  { adSoyad: 'Mehmet Kemal İNANÇ', tcNo: '42250757518', cepTelefonu: '5523127971', dogumTarihi: '1979-11-10', iseGirisTarihi: '2020-02-25', pozisyon: 'ÖZEL GÜVENLİK GÖREVLİSİ', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'Metin ARSLAN', tcNo: '61246413894', cepTelefonu: '5386447931', dogumTarihi: '1976-09-11', iseGirisTarihi: '2024-07-17', pozisyon: 'KALİTE KONTROL GÖREVLİSİ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'NAR MARKET' },
  { adSoyad: 'Mesut TUNCER', tcNo: '46498485952', cepTelefonu: '5063543966', dogumTarihi: '1966-03-20', iseGirisTarihi: '2020-09-02', pozisyon: 'CNC TORNA OPERATÖRÜ', servisGuzergahi: 'Çarşı Merkez', durak: 'HALI SAHA' },
  { adSoyad: 'Mine KARAOĞLU', tcNo: '30745222320', cepTelefonu: '5369759918', dogumTarihi: '1989-09-08', iseGirisTarihi: '2022-07-14', pozisyon: 'SATIN ALMA SORUMLUSU', servisGuzergahi: 'Çarşı Merkez', durak: 'ESKİ REKTÖRLÜK' },
  { adSoyad: 'Mehmet Ali ÖZÇELİK', tcNo: '10135225278', cepTelefonu: '5511211208', dogumTarihi: '2001-06-16', iseGirisTarihi: '2024-10-14', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'SAAT KULESİ' },
  { adSoyad: 'Muhammet Nazim GÖÇ', tcNo: '11057399320', cepTelefonu: '5413384926', dogumTarihi: '2005-11-19', iseGirisTarihi: '2024-12-24', pozisyon: 'BOYACI', servisGuzergahi: 'Dispanser', durak: 'DİSPANSER ÜST GEÇİT' },
  { adSoyad: 'Muhammed Sefa PEHLİVANLI', tcNo: '11993368640', cepTelefonu: '5543316640', dogumTarihi: '2006-12-29', iseGirisTarihi: '2024-06-24', pozisyon: 'CNC TORNA OPERATÖRÜ', servisGuzergahi: 'Dispanser', durak: 'DİSPANSER ÜST GEÇİT' },
  { adSoyad: 'Murat GENCER', tcNo: '22412418846', cepTelefonu: '5363316879', dogumTarihi: '1970-01-01', iseGirisTarihi: '2023-03-14', pozisyon: 'DEPO SORUMLUSU', servisGuzergahi: 'Çalılıöz', durak: '' }, // Servis bilgisi resimlerde yok
  { adSoyad: 'Murat ÇAVDAR', tcNo: '49597833806', cepTelefonu: '5062430103', dogumTarihi: '1968-01-30', iseGirisTarihi: '2021-06-23', pozisyon: 'KALİTE KONTROL ŞEFİ', servisGuzergahi: 'Dispanser', durak: 'ŞADIRVAN (PERŞEMBE PAZARI)' },
  { adSoyad: 'Murat GÜRBÜZ', tcNo: '31964421976', cepTelefonu: '5326712686', dogumTarihi: '1974-03-05', iseGirisTarihi: '2018-08-08', pozisyon: 'İDARİ İŞLER MÜDÜRÜ', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'Murat SEPETCİ', tcNo: '31882703888', cepTelefonu: '5367132581', dogumTarihi: '1972-04-27', iseGirisTarihi: '2023-03-14', pozisyon: 'MERKEZ ŞUBE USTABAŞI/BAKIM ONARIM', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'Mustafa BAŞKAYA', tcNo: '18767861734', cepTelefonu: '5455147650', dogumTarihi: '1994-02-15', iseGirisTarihi: '2024-12-02', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Sanayi Mahallesi', durak: 'ÇORBACI ALİ DAYI' },
  { adSoyad: 'Musa DOĞU', tcNo: '51283456206', cepTelefonu: '5464045252', dogumTarihi: '1985-08-01', iseGirisTarihi: '2025-04-14', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'FIRINLI CAMİ' },
  { adSoyad: 'Mustafa DOĞAN', tcNo: '51058463866', cepTelefonu: '5452354590', dogumTarihi: '1966-02-01', iseGirisTarihi: '2025-05-05', pozisyon: 'BOYACI', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'YUVA TOKİ' },
  { adSoyad: 'Mustafa BIYIK', tcNo: '29344788320', cepTelefonu: '5445637170', dogumTarihi: '1966-12-05', iseGirisTarihi: '2019-07-01', pozisyon: 'CNC TORNA OPERATÖRÜ', servisGuzergahi: 'Dispanser', durak: 'DİSPANSER ÜST GEÇİT' },
  { adSoyad: 'Mustafa SAMURKOLLU', tcNo: '45418252900', cepTelefonu: '5362820071', dogumTarihi: '1979-04-12', iseGirisTarihi: '2023-05-15', pozisyon: 'TEMİZLİK GÖREVLİSİ (ENGELLİ)', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'ERDURAN BAKKAL (KARŞIYAKA)' },
  { adSoyad: 'Mustafa SÜMER', tcNo: '56698275862', cepTelefonu: '5300991671', dogumTarihi: '1965-01-20', iseGirisTarihi: '1997-06-10', pozisyon: 'IŞIL ŞUBE USTABAŞI', servisGuzergahi: 'Sanayi Mahallesi', durak: 'RASATTEPE KÖPRÜ' },
  { adSoyad: 'Muzaffer KIZILÇİÇEK', tcNo: '10512138900', cepTelefonu: '5459526011', dogumTarihi: '2006-08-04', iseGirisTarihi: '2024-09-09', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Sanayi Mahallesi', durak: 'MEZARLIKLAR PEYZAJ ÖNÜ' },
  { adSoyad: 'Muzaffer İLHAN', tcNo: '19631110934', cepTelefonu: '5423230101', dogumTarihi: '1971-06-27', iseGirisTarihi: '2023-04-01', pozisyon: 'MUHASEBE', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'Niyazi YURTSEVEN', tcNo: '36394552108', cepTelefonu: '5537756657', dogumTarihi: '1997-12-27', iseGirisTarihi: '2024-06-06', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Sanayi Mahallesi', durak: 'NOKTA A-101' },
  { adSoyad: 'Nuri ÖZKAN', tcNo: '45976918942', cepTelefonu: '5366313957', dogumTarihi: '1972-10-01', iseGirisTarihi: '2019-04-12', pozisyon: 'TEMİZLİK GÖREVLİSİ', servisGuzergahi: 'Sanayi Mahallesi', durak: 'ÇORBACI ALİ DAYI' },
  { adSoyad: 'Osman ÖZKILIÇ', tcNo: '50566081326', cepTelefonu: '5539822727', dogumTarihi: '1992-06-25', iseGirisTarihi: '2025-05-05', pozisyon: 'BOYACI', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'VALİLİK' },
  { adSoyad: 'Orhan YORULMAZ', tcNo: '12806338270', cepTelefonu: '5458808762', dogumTarihi: '1997-01-27', iseGirisTarihi: '2018-11-17', pozisyon: 'KAYNAKÇI', servisGuzergahi: 'Bağdat Köprü', durak: '' }, // Servis bilgisi resimlerde yok
  { adSoyad: 'Ömer FİLİZ', tcNo: '54610666576', cepTelefonu: '5413591863', dogumTarihi: '1993-01-13', iseGirisTarihi: '2022-02-09', pozisyon: 'KAYNAKÇI', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'SAAT KULESİ' },
  { adSoyad: 'Ömer TORUN', tcNo: '52672409780', cepTelefonu: '5531119625', dogumTarihi: '1992-06-03', iseGirisTarihi: '2025-03-17', pozisyon: 'ÖZEL GÜVENLİK GÖREVLİSİ', servisGuzergahi: 'Rektörlük', durak: '' }, // Servis bilgisi resimlerde yok
  { adSoyad: 'Özkan AYDIN', tcNo: '13658310018', cepTelefonu: '5531407477', dogumTarihi: '1994-08-27', iseGirisTarihi: '2021-10-25', pozisyon: 'BAKIM ONARIM MÜHENDİSİ (MEKATRONİK)', servisGuzergahi: 'Dispanser', durak: 'DİSPANSER ÜST GEÇİT' },
  { adSoyad: 'Polat ERCAN', tcNo: '11579381476', cepTelefonu: '5522622782', dogumTarihi: '2006-07-06', iseGirisTarihi: '2025-04-14', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'KAHVELER (KARŞIYAKA)' },
  { adSoyad: 'Salih GÖZÜAK', tcNo: '58177226648', cepTelefonu: '5456029106', dogumTarihi: '1994-12-11', iseGirisTarihi: '2019-05-01', pozisyon: 'KUMLAMA OPERATÖRÜ', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'KAHVELER (KARŞIYAKA)' },
  { adSoyad: 'Süleyman GÖZÜAK', tcNo: '58156227376', cepTelefonu: '5445884161', dogumTarihi: '1997-07-31', iseGirisTarihi: '2024-12-02', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Kendi Aracı İle', durak: '' },
  { adSoyad: 'Sinan BÖLGE', tcNo: '31840705626', cepTelefonu: '5050817106', dogumTarihi: '1993-11-07', iseGirisTarihi: '2024-09-16', pozisyon: 'ÖZEL GÜVENLİK GÖREVLİSİ', servisGuzergahi: 'Rektörlük', durak: '' }, // Servis bilgisi resimlerde yok
  { adSoyad: 'Sefa ÖZTÜRK', tcNo: '47290618928', cepTelefonu: '5454738613', dogumTarihi: '2000-02-16', iseGirisTarihi: '2024-05-23', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'BAHÇELİEVLER' },
  { adSoyad: 'Sadullah AKBAYIR', tcNo: '46366221550', cepTelefonu: '5050471671', dogumTarihi: '1994-04-03', iseGirisTarihi: '2024-06-21', pozisyon: 'MAKİNA MÜHENDİSİ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'SAAT KULESİ' },
  { adSoyad: 'Selim ALSAÇ', tcNo: '30239479490', cepTelefonu: '5445158843', dogumTarihi: '1990-08-01', iseGirisTarihi: '2024-06-24', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'SALİ PAZARI' },
  { adSoyad: 'Serkan GÜLEŞEN', tcNo: '23995967202', cepTelefonu: '5454551622', dogumTarihi: '1986-02-20', iseGirisTarihi: '2021-08-16', pozisyon: 'KAYNAKÇI', servisGuzergahi: 'Bağdat Köprü', durak: '' }, // Servis bilgisi resimlerde yok
  { adSoyad: 'Soner GÜRSOY', tcNo: '48772139382', cepTelefonu: '5360350850', dogumTarihi: '1968-03-04', iseGirisTarihi: '2020-10-05', pozisyon: 'CNC TORNA OPERATÖRÜ', servisGuzergahi: 'Rektörlük', durak: '' }, // Servis bilgisi resimlerde yok
  { adSoyad: 'Tuncay TEKİN', tcNo: '31657711810', cepTelefonu: '5543899563', dogumTarihi: '1968-12-26', iseGirisTarihi: '2022-06-17', pozisyon: 'ARGE', servisGuzergahi: 'Dispanser', durak: 'DİSPANSER ÜST GEÇİT' },
  { adSoyad: 'Uğur ALBAYRAK', tcNo: '41956368394', cepTelefonu: '5416348882', dogumTarihi: '1973-01-11', iseGirisTarihi: '2023-03-14', pozisyon: 'CNC TORNA OPERATÖRÜ', servisGuzergahi: 'Çalılıöz Mahallesi', durak: 'SAAT KULESİ' },
  { adSoyad: 'Ümit TORUN', tcNo: '19847504312', cepTelefonu: '5445157152', dogumTarihi: '1980-08-09', iseGirisTarihi: '2024-05-20', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'KAHVELER (KARŞIYAKA)' },
  { adSoyad: 'Ümit DEMİREL', tcNo: '19658378928', cepTelefonu: '5377026913', dogumTarihi: '2001-01-02', iseGirisTarihi: '2021-04-07', pozisyon: 'İMAL İŞÇİSİ (ENGELLİ)', servisGuzergahi: '', durak: '' }, // Servis bilgisi yok
  { adSoyad: 'Ümit SAZAK', tcNo: '58768207148', cepTelefonu: '5433065642', dogumTarihi: '1997-03-15', iseGirisTarihi: '2024-07-29', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'KAHVELER (KARŞIYAKA)' },
  { adSoyad: 'Veysel Emre TOZLU', tcNo: '10772408560', cepTelefonu: '5060620877', dogumTarihi: '2005-07-19', iseGirisTarihi: '2024-05-20', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Çarşı Merkez', durak: 'HALI SAHA' },
  { adSoyad: 'Yaşar ÇETİN', tcNo: '17528182262', cepTelefonu: '5458585931', dogumTarihi: '1975-01-01', iseGirisTarihi: '2023-03-14', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Osmangazi-Karşıyaka', durak: 'BAHÇELİEVLER SAĞLIK OCAĞI' },
  { adSoyad: 'Yasin SAYGILI', tcNo: '11222393542', cepTelefonu: '5527960071', dogumTarihi: '2006-02-06', iseGirisTarihi: '2024-09-10', pozisyon: 'CNC FREZE OPERATÖRÜ', servisGuzergahi: 'Çarşı Merkez', durak: 'OSMANGAZİ' },
  { adSoyad: 'Yusuf GÜRBÜZ', tcNo: '31823426616', cepTelefonu: '5349678827', dogumTarihi: '1990-06-09', iseGirisTarihi: '2024-05-20', pozisyon: 'İMAL İŞÇİSİ', servisGuzergahi: 'Çarşı Merkez', durak: 'ES BENZİNLİK' },
];

// 🗓️ Tarih formatını (DD.MM.YYYY) ISO formatına (YYYY-MM-DD) çeviren yardımcı fonksiyon
// MongoDB'nin Date tipi için bu format gereklidir.
const parseDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  // Eğer zaten YYYY-MM-DD formatındaysa direkt kullan
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(dateString);
  }
  const parts = dateString.split(/[.\/]/);
  if (parts.length === 3) {
    const [day, month, year] = parts;
    // Yıl 2 haneli ise 2000'li yıllar olduğunu varsayıyoruz (örn: 24 -> 2024)
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }
  return null;
};

// --- VERİTABANI İŞLEMLERİ ---

// 🚀 Veritabanına bağlan ve verileri içeri aktar
const importData = async () => {
  try {
    // 1. Veritabanına bağlan (Doğru değişken adını kullanıyoruz: MONGODB_URI)
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB bağlantısı başarılı!');

    // 2. Önceki tüm çalışan verilerini temizle
    // Bu, her seferinde taze ve güncel bir başlangıç yapmamızı sağlar.
    console.log('🗑️ Eski çalışan verileri siliniyor...');
    await Employee.deleteMany({});
    console.log('✅ Eski veriler başarıyla silindi.');

    // 3. Yeni verileri hazırla
    // Model şemasına uygun hale getiriyoruz.
    const processedEmployees = employeesData.map(emp => ({
      adSoyad: emp.adSoyad,
      tcNo: emp.tcNo,
      cepTelefonu: emp.cepTelefonu,
      dogumTarihi: parseDate(emp.dogumTarihi),
      iseGirisTarihi: parseDate(emp.iseGirisTarihi),
      pozisyon: emp.pozisyon,
      servisGuzergahi: emp.servisGuzergahi || 'Bilinmiyor',
      durak: emp.durak || 'Bilinmiyor',
      // ⚠️ ÖNEMLİ: Lokasyon bilgisi sağlanmadığı için varsayılan olarak 'MERKEZ' atandı.
      // Bu bilgiyi daha sonra gerekirse güncelleyebiliriz.
      lokasyon: 'MERKEZ', 
      durum: 'AKTIF', // Tüm çalışanları varsayılan olarak 'AKTIF' yapıyoruz.
    }));
    
    // 4. Hazırlanan verileri veritabanına TEKER TEKER ekle
    // Not: insertMany() yerine for...of döngüsü ve .save() kullanıyoruz.
    // Bu, her bir doküman için 'pre-save' middleware'ini (otomatik ID oluşturma gibi) tetikler.
    console.log(`📝 ${processedEmployees.length} adet yeni çalışan veritabanına ekleniyor...`);
    for (const empData of processedEmployees) {
      const employee = new Employee(empData);
      await employee.save();
    }
    console.log('🎉 Tüm çalışanlar başarıyla veritabanına eklendi!');

  } catch (error) {
    console.error('❌ Veri aktarımı sırasında bir hata oluştu:', error);
  } finally {
    // 5. Veritabanı bağlantısını kapat
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı.');
  }
};

// Script'i çalıştır
importData(); 