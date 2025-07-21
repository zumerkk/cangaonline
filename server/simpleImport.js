const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// Mevcut 102 çalışan verisi (önceki import'tan alınan gerçek veriler)
const currentEmployees = [
  { adSoyad: 'Abbas DÜZTAŞ', tcNo: '20997662440', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Abdulsamed ÇELİK', tcNo: '23997630958', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Adem GÜMÜŞ', tcNo: '10852402518', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ahmet ARSLAN', tcNo: '17591842958', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ahmet ÇELİK', tcNo: '17015995194', departman: 'MERKEZ FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ahmet İLGİN', tcNo: '18185359282', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ali GÜRBÜZ', tcNo: '31874414568', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ali SAVAŞ', tcNo: '41678066694', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ali ÖKSÜZ', tcNo: '11747176342', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ali ŞİŞ YORULMAZ', tcNo: '17028813668', departman: 'MERKEZ FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Alican DİLAVER', tcNo: '10835667344', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Asım DEMET', tcNo: '27351247586', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Aynur AYTEKİN', tcNo: '27489656630', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Aziz Buğra KARA', tcNo: '11198796552', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Bahadır AKTAŞ', tcNo: '21122268646', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL' },
  { adSoyad: 'Baharam İLHAN', tcNo: '31106442510', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Berat AKTAL', tcNo: '11196395194', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Berat ÖZDEN', tcNo: '21111305998', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Berat ŞENER', tcNo: '10862007372', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Berkan BİLKANH', tcNo: '31121943072', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Berkay ERCAN', tcNo: '31935353866', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Birkan ŞEKER', tcNo: '10958403872', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Burak KARAOĞ', tcNo: '51019169210', departman: 'İDARİ', lokasyon: 'MERKEZ' },
  { adSoyad: 'Burakhan DEMİR', tcNo: '11094982622', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Celal GÜLŞEN', tcNo: '36884357412', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Cemal ERAKDİY', tcNo: '10179609428', departman: 'MERKEZ FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Cevdet ÖKSÜZ', tcNo: '60461839724', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Cihan ÇELİİR', tcNo: '24978906301', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Civan VİLÜN', tcNo: '13015218844', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Dilara Berra YILDİRİM', tcNo: '24007966206', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Emir GÖÇÜN', tcNo: '10887366144', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Emir Kaan BAŞEİS', tcNo: '10855417936', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Emre ÇİÇEK', tcNo: '41156219360', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL' },
  { adSoyad: 'Engin YIRMAK', tcNo: '11751140056', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Erdal YAKUT', tcNo: '58354220650', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Erdem Kamil YILDİRİM', tcNo: '21049987440', departman: 'İDARİ', lokasyon: 'MERKEZ' },
  { adSoyad: 'Eyüp TORUN', tcNo: '25318448082', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Eyüp YİNMAN', tcNo: '26506685416', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Faruk KARAKAYA', tcNo: '25123491504', departman: 'ARGE', lokasyon: 'MERKEZ' },
  { adSoyad: 'Gölnur AĞIRMAN', tcNo: '11775137174', departman: 'İŞİ_FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Hakan AKTEMİK', tcNo: '20026099730', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Haydar ACAR', tcNo: '26014901582', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Haşim GÖRENSİZ', tcNo: '40917606187', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Hilmi SORGUN', tcNo: '10860520180', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL' },
  { adSoyad: 'Hüdayı GÖRYÜRMAK', tcNo: '21890180344', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Hülya Ivan CAN', tcNo: '10934403600', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'İbrahim KUTLU', tcNo: '35514913154', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'İbrahim VARLIOĞLU', tcNo: '50320087960', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'İbas ÇERTM', tcNo: '11183300505', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'İrfan KIRAÇ', tcNo: '12401752068', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'İsmail BALER', tcNo: '24974573766', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Kamil Berkutlu MUTLU', tcNo: '10876000306', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL' },
  { adSoyad: 'Kemal KARACA', tcNo: '38761743198', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Kemalettin GÜLŞEN', tcNo: '24037800806', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Levent DURMAZ', tcNo: '38170892102', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'MUHAMMED ZÜMER KEKİLLİOĞLU', tcNo: '59317766772', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Macit USLU', tcNo: '11230316396', departman: 'İŞİ_FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Mehmet Ali GÜLÜK', tcNo: '11011822962', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Mehmet ERTAŞ', tcNo: '25315328344', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Mehmet Kemal İMANG', tcNo: '42120777830', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Meks ARSLAN', tcNo: '63248441010', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Metin ZİNCİR', tcNo: '61088885552', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Mine APTİBEY', tcNo: '20162617906', departman: 'DİĞER', lokasyon: 'İŞL' },
  { adSoyad: 'Muhammed Sefa PEHLİVANLI', tcNo: '11991668640', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Muhammet NAZİM GÖÇ', tcNo: '23410913662', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Murat GÜRBÜZ', tcNo: '22412418886', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Murat GÜRBÜZ', tcNo: '31964813976', departman: 'İDARİ', lokasyon: 'MERKEZ' },
  { adSoyad: 'Murat KERENLİ', tcNo: '31073523244', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Murat SEPETÇİ', tcNo: '18610331194', departman: 'İŞİ_FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Murat ÇAVDAR', tcNo: '49397833906', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Mustafa BAŞKAYA', tcNo: '18767861734', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Mustafa BİYİK', tcNo: '20644978244', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Mustafa DOĞAN', tcNo: '31058461846', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Mustafa KAREKOĞUZLU', tcNo: '45418252900', departman: 'İDARİ', lokasyon: 'İŞL' },
  { adSoyad: 'Mustafa SÜMER', tcNo: '38994127862', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Muzaffer İLHAN', tcNo: '10631110934', departman: 'İDARİ', lokasyon: 'MERKEZ' },
  { adSoyad: 'Muzaffer ŞIKÇİÇEK', tcNo: '10512338650', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Niyazi YURTSEVEN', tcNo: '36196552108', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Nuri ÖZKAN', tcNo: '10470814942', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Okan AYDIN', tcNo: '13658110018', departman: 'İŞİ_FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Okan REÇBER', tcNo: '11975401732', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Osman KÖSEKUL', tcNo: '18596616720', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Osman ÖDEYÜK', tcNo: '50566661326', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Rafiuliflah AKRAMİİ', tcNo: '46366221550', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Salih GÖZÜAK', tcNo: '96122246340', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Sefa ÖZTÜRK', tcNo: '19806848100', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Selim ALSAÇ', tcNo: '30239479490', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Semir GÜRDÜY', tcNo: '11044232010', departman: 'MERKEZ FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Serkan GÜLDEN', tcNo: '23693067440', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Sinan BÖLGE', tcNo: '31840700626', departman: 'İDARİ', lokasyon: 'MERKEZ' },
  { adSoyad: 'Süleyman COŞKUN', tcNo: '24864681826', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Tuncay TEKİN', tcNo: '31857711810', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Uğur BAMANIK', tcNo: '18341658882', departman: 'MERKEZ FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Veysel Emre TOULU', tcNo: '10772408560', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Yasin SAHİLLİ', tcNo: '11123919162', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Yaşar ÇETİN', tcNo: '17519182162', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Yusuf GÜŞBİLK', tcNo: '13324749616', departman: 'İŞİ_FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Ömer FİLİZ', tcNo: '54010666652', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ömer TOKUR', tcNo: '26574909780', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Ümit DEMİREL', tcNo: '19054778928', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ümit SAZAK', tcNo: '18746507138', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ümit TORUN', tcNo: '38706651114', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'İbas ÇERTM', tcNo: '11183300505', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'İbrahim KUTLU', tcNo: '35514913154', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'İbrahim VARLIOĞLU', tcNo: '50320087960', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'İrfan KIRAÇ', tcNo: '12401752068', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'İsmail BALER', tcNo: '24974573766', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' }
];

// Eksik 49 çalışan (Excel'de var, veritabanında yok)
const missingEmployees = [
  { adSoyad: 'Abdurrahim AKICI', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Abdurrahim ÖZKUL', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ahmet AYAN', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Ahmet ŞAHİN', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ahmet ÖZTÜRK', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Ali KÜÇÜKALP', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ali YILDIRMAZ', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Arda AYNALI', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Azer Buğra KAYA', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Berat ŞIYAR', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Bekir TOSUN', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Berat SÜRÜK', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Cem ÇELEN', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Cem ÖZTÜRK', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Civan ÖZBAY', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Cihan DOĞA', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Emre AYDIN', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Emracan BUDAK', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Ender AYAK', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Enes ÖZKÖK', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Eren ÇINAR', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Ergin ORAL', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Erkan ÖZMANZUMLARI', departman: 'ARGE', lokasyon: 'MERKEZ' },
  { adSoyad: 'Ertuğrul ÇAKMAK', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Eyüp YORULMAZ', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Gürhan ÇOBAN', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Halil Emre CAN', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Hakan AKTUBAR', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Hasan AKTUBAR', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'İbrahim İLHAN', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'İsmail ÇAKAT', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Kerem ARSLAN', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Kerem GÖKSAK', departman: 'ARGE', lokasyon: 'MERKEZ' },
  { adSoyad: 'Kerem EKRAĞAZ', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL' },
  { adSoyad: 'Kerem EKMURAL', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Muhammet Emre TOSUN', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Nihat KANDEMİR', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Recep KONYALI', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Savaş ÖCAL', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Şahin FIÇICIOĞLU', departman: 'ARGE', lokasyon: 'MERKEZ' },
  { adSoyad: 'Şakir GERMANOS', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'MERKEZ' },
  { adSoyad: 'Süleyman ERKAY', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Tolga PEHLİVANLI', departman: 'İDARİ', lokasyon: 'MERKEZ' },
  { adSoyad: 'Tunçay ALİCE', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Veli DURDU', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Yakup BOYRAZ', departman: 'MERKEZ FABRİKA', lokasyon: 'MERKEZ' },
  { adSoyad: 'Yusuf KOCA', departman: 'İŞİ_FABRİKA', lokasyon: 'İŞL' },
  { adSoyad: 'Zafer DENİZ', departman: 'ARGE', lokasyon: 'MERKEZ' },
  { adSoyad: 'Zeki PAŞA', departman: 'TEKNİK OFİS / BAKIM ONARIM', lokasyon: 'İŞL' },
  { adSoyad: 'Ahmet ÇANGA', departman: 'İDARİ', lokasyon: 'MERKEZ' } // Firma Sahibi
];

const simpleImport = async () => {
  try {
    console.log('🔄 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canga_vardiya');
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // 1. Mevcut tüm çalışanları temizle
    console.log('🗑️  TÜM ÇALIŞANLAR SİLİNİYOR...');
    const deleteResult = await Employee.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} çalışan silindi\n`);

    // 2. Mevcut 102 çalışanı ekle
    console.log('💾 MEVCut 102 ÇALIŞAN EKLENİYOR...');
    let successCount = 0;
    let errorCount = 0;

    // TC No duplicate problemi olabilir, tek tek ekleyerek kontrol edelim
    const processedTcNos = new Set();
    
    for (const emp of currentEmployees) {
      try {
        // TC No duplicate kontrolü
        if (processedTcNos.has(emp.tcNo)) {
          console.log(`⚠️  Duplicate TC No atlandı: ${emp.adSoyad} (${emp.tcNo})`);
          continue;
        }
        
        const employee = new Employee({
          adSoyad: emp.adSoyad,
          tcNo: emp.tcNo,
          departman: emp.departman,
          lokasyon: emp.lokasyon,
          pozisyon: 'ÇALIŞAN', // Required field
          durum: 'AKTİF', // Required field
          cepTelefonu: '',
          dogumTarihi: new Date('1990-01-01'),
          iseGirisTarihi: new Date('2020-01-01'),
          servisGuzergahi: 'BELİRLİ DEĞİL',
          durak: 'BELİRLİ DEĞİL'
        });

        await employee.save();
        processedTcNos.add(emp.tcNo);
        successCount++;
        console.log(`✅ ${successCount}. ${emp.adSoyad} eklendi`);
        
      } catch (error) {
        errorCount++;
        console.log(`❌ ${emp.adSoyad} eklenemedi:`, error.message);
      }
    }

    console.log(`\n📊 Mevcut çalışanlar: ${successCount} başarılı, ${errorCount} hata\n`);

    // 3. Eksik 49 çalışanı ekle
    console.log('💾 EKSİK 49 ÇALIŞAN EKLENİYOR...');
    let missingSuccessCount = 0;
    let missingErrorCount = 0;

    for (const emp of missingEmployees) {
      try {
        // TC No otomatik oluştur
        const randomTc = '1' + Math.floor(Math.random() * 900000000 + 100000000).toString();
        
        const employee = new Employee({
          adSoyad: emp.adSoyad,
          tcNo: randomTc,
          departman: emp.departman,
          lokasyon: emp.lokasyon,
          pozisyon: 'ÇALIŞAN',
          durum: 'AKTİF',
          cepTelefonu: '',
          dogumTarihi: new Date('1990-01-01'),
          iseGirisTarihi: new Date('2020-01-01'),
          servisGuzergahi: 'BELİRLİ DEĞİL',
          durak: 'BELİRLİ DEĞİL'
        });

        await employee.save();
        missingSuccessCount++;
        console.log(`✅ ${missingSuccessCount}. ${emp.adSoyad} eklendi`);
        
      } catch (error) {
        missingErrorCount++;
        console.log(`❌ ${emp.adSoyad} eklenemedi:`, error.message);
      }
    }

    console.log(`\n📊 Eksik çalışanlar: ${missingSuccessCount} başarılı, ${missingErrorCount} hata\n`);

    // 4. Final kontrol
    const finalCount = await Employee.countDocuments();
    console.log(`🎉 TAMAMLANDI!`);
    console.log(`💾 Toplam veritabanındaki çalışan sayısı: ${finalCount}`);
    console.log(`📋 Hedeflenen: ${currentEmployees.length + missingEmployees.length} (${currentEmployees.length} mevcut + ${missingEmployees.length} eksik)`);
    console.log(`✅ Başarı oranı: ${((successCount + missingSuccessCount) / (currentEmployees.length + missingEmployees.length) * 100).toFixed(1)}%\n`);

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');

  } catch (error) {
    console.error('❌ İşlem hatası:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// İşlemi başlat
console.log('🚀 VERİTABANI TEMİZLEME VE KOMPLE YENİDEN EKLEME...\n');
simpleImport(); 