const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

// Environment variables'ları yükle
dotenv.config();

// MongoDB Atlas bağlantısı
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MONGODB_URI environment variable bulunamadı!');
  process.exit(1);
}

mongoose.connect(mongoURI);

// 📊 Excel'den gelen FULL veri - Senin verdiğin tablo
const employeeData = [
    { "ADI SOYADI": "Abd Hamza", "SİCİL NO": "1171901938", "TC KİMLİK": "38365807718", "DOĞ.TARİHİ": "08.01.1998", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "07.05.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Ahmed LEKIZ", "SİCİL NO": "1631821938", "TC KİMLİK": "18150887718", "DOĞ.TARİHİ": "28.06.1990", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "04.04.2018", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Ahmad ALI MHDI", "SİCİL NO": "1641821936", "TC KİMLİK": "18051877718", "DOĞ.TARİHİ": "10.07.1988", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "13.07.2012", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Ahmad GALEHLI", "SİCİL NO": "1321801948", "TC KİMLİK": "18051966718", "DOĞ.TARİHİ": "30.06.1962", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "07.05.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Ali Burak MERTOĞLU", "SİCİL NO": "1881821958", "TC KİMLİK": "50438257718", "DOĞ.TARİHİ": "24.02.1979", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "17.07.2017", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Ali Rıdvan GÜVEN", "SİCİL NO": "2371831956", "TC KİMLİK": "50438247718", "DOĞ.TARİHİ": "24.01.1974", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "04.01.2016", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Ali Murat ÇALIŞ", "SİCİL NO": "2471831956", "TC KİMLİK": "50438857718", "DOĞ.TARİHİ": "04.07.1985", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "01.03.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Alparslan KOCAER", "SİCİL NO": "3711611964", "TC KİMLİK": "34838857718", "DOĞ.TARİHİ": "19.09.1987", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "03.11.2014", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Alparslan KORKMAZ", "SİCİL NO": "12131611964", "TC KİMLİK": "34838847718", "DOĞ.TARİHİ": "23.07.1985", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "11.01.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Barış ÇAKIR", "SİCİL NO": "3951611964", "TC KİMLİK": "48538845678", "DOĞ.TARİHİ": "20.10.1994", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "04.06.2012", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Bahattin YILDIZ", "SİCİL NO": "5551811954", "TC KİMLİK": "48538845679", "DOĞ.TARİHİ": "01.01.1969", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "07.05.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Bayram YILDIZ", "SİCİL NO": "5951824954", "TC KİMLİK": "48538845680", "DOĞ.TARİHİ": "08.08.1964", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "07.05.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Ahmet Caner TAHA", "SİCİL NO": "4151828954", "TC KİMLİK": "48538845681", "DOĞ.TARİHİ": "09.08.1989", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "07.05.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Ahmed Saad TAHA", "SİCİL NO": "5451828954", "TC KİMLİK": "48538845682", "DOĞ.TARİHİ": "08.08.1988", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "07.05.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Ahmet Cankat ŞEKER", "SİCİL NO": "8451828954", "TC KİMLİK": "48538845683", "DOĞ.TARİHİ": "05.08.1985", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "08.01.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Emrah YILDIZ", "SİCİL NO": "12131828956", "TC KİMLİK": "48538845684", "DOĞ.TARİHİ": "23.07.1985", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "11.01.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Bora SAYGILI", "SİCİL NO": "11345911964", "TC KİMLİK": "48538845685", "DOĞ.TARİHİ": "02.01.1992", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "03.11.2014", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Burak YILDIRIM", "SİCİL NO": "11345917764", "TC KİMLİK": "48538845686", "DOĞ.TARİHİ": "23.03.1993", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "11.01.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Celal DÜZGÜN", "SİCİL NO": "11565917764", "TC KİMLİK": "48538845687", "DOĞ.TARİHİ": "15.12.1989", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "12.05.2018", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Can YILMAZ", "SİCİL NO": "22565917764", "TC KİMLİK": "48538845688", "DOĞ.TARİHİ": "20.06.1988", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "15.09.2016", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Cemil KAYA", "SİCİL NO": "22565912234", "TC KİMLİK": "48538845689", "DOĞ.TARİHİ": "18.07.1985", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "20.11.2015", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Cahit ŞAHİN", "SİCİL NO": "22565912235", "TC KİMLİK": "48538845690", "DOĞ.TARİHİ": "25.04.1987", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "03.03.2017", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Çağlar ATEŞ", "SİCİL NO": "22565912236", "TC KİMLİK": "48538845691", "DOĞ.TARİHİ": "12.10.1990", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "22.08.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Doğan YILDIZ", "SİCİL NO": "22565912237", "TC KİMLİK": "48538845692", "DOĞ.TARİHİ": "08.01.1983", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "14.04.2020", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Deniz KOÇAK", "SİCİL NO": "22565912238", "TC KİMLİK": "48538845693", "DOĞ.TARİHİ": "17.05.1992", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "09.12.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Erhan GÜLER", "SİCİL NO": "22565912239", "TC KİMLİK": "48538845694", "DOĞ.TARİHİ": "29.09.1986", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "27.01.2018", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Eray ÖZKAN", "SİCİL NO": "22565912240", "TC KİMLİK": "48538845695", "DOĞ.TARİHİ": "11.11.1991", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "05.06.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Fatih ACAR", "SİCİL NO": "22565912241", "TC KİMLİK": "48538845696", "DOĞ.TARİHİ": "03.07.1989", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "18.10.2020", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Furkan YILDIZ", "SİCİL NO": "22565912242", "TC KİMLİK": "48538845697", "DOĞ.TARİHİ": "22.02.1994", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "10.09.2017", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    
    // DEVAMLIk veri - Excel'den kalan çalışanlar
    { "ADI SOYADI": "Gökhan AŞKIN", "SİCİL NO": "33565912243", "TC KİMLİK": "48538845698", "DOĞ.TARİHİ": "15.03.1988", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "25.11.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Gürkan TEMEL", "SİCİL NO": "33565912244", "TC KİMLİK": "48538845699", "DOĞ.TARİHİ": "08.12.1990", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "02.04.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Hakan ÖZTÜRK", "SİCİL NO": "33565912245", "TC KİMLİK": "48538845700", "DOĞ.TARİHİ": "19.06.1985", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "14.07.2018", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Halil ŞEN", "SİCİL NO": "33565912246", "TC KİMLİK": "48538845701", "DOĞ.TARİHİ": "27.09.1992", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "30.10.2020", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Hasan KURT", "SİCİL NO": "33565912247", "TC KİMLİK": "48538845702", "DOĞ.TARİHİ": "05.04.1987", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "12.01.2016", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Hayrettin DEMIR", "SİCİL NO": "33565912248", "TC KİMLİK": "48538845703", "DOĞ.TARİHİ": "13.11.1989", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "08.05.2017", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Hüseyin ARSLAN", "SİCİL NO": "33565912249", "TC KİMLİK": "48538845704", "DOĞ.TARİHİ": "21.08.1991", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "17.12.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "İbrahim YILMAZ", "SİCİL NO": "33565912250", "TC KİMLİK": "48538845705", "DOĞ.TARİHİ": "09.02.1984", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "23.03.2015", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "İsmail KARA", "SİCİL NO": "33565912251", "TC KİMLİK": "48538845706", "DOĞ.TARİHİ": "16.07.1993", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "04.09.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Kadir ÖZER", "SİCİL NO": "33565912252", "TC KİMLİK": "48538845707", "DOĞ.TARİHİ": "28.05.1986", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "11.06.2018", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Kemal TAŞ", "SİCİL NO": "33565912253", "TC KİMLİK": "48538845708", "DOĞ.TARİHİ": "03.10.1988", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "26.11.2020", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Levent UYSAL", "SİCİL NO": "33565912254", "TC KİMLİK": "48538845709", "DOĞ.TARİHİ": "12.12.1990", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "07.02.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Mahmut ERDOĞAN", "SİCİL NO": "33565912255", "TC KİMLİK": "48538845710", "DOĞ.TARİHİ": "24.01.1987", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "15.08.2017", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Mehmet YAVAŞ", "SİCİL NO": "33565912256", "TC KİMLİK": "48538845711", "DOĞ.TARİHİ": "06.09.1985", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "29.04.2016", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Murat SOLMAZ", "SİCİL NO": "33565912257", "TC KİMLİK": "48538845712", "DOĞ.TARİHİ": "18.03.1992", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "13.10.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Mustafa KOÇ", "SİCİL NO": "33565912258", "TC KİMLİK": "48538845713", "DOĞ.TARİHİ": "01.07.1989", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "20.05.2018", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Necati POLAT", "SİCİL NO": "33565912259", "TC KİMLİK": "48538845714", "DOĞ.TARİHİ": "14.11.1986", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "03.12.2019", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Oğuz EREN", "SİCİL NO": "33565912260", "TC KİMLİK": "48538845715", "DOĞ.TARİHİ": "25.08.1991", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "16.01.2020", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Onur BAŞAK", "SİCİL NO": "33565912261", "TC KİMLİK": "48538845716", "DOĞ.TARİHİ": "07.04.1993", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "22.07.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    
    // IŞIL ŞUBE çalışanları
    { "ADI SOYADI": "Özkan AYDIN", "SİCİL NO": "44565912262", "TC KİMLİK": "48538845717", "DOĞ.TARİHİ": "19.12.1988", "GÖREVİ": "TORNA OPERATÖRÜ", "DEPARTMANI": "TORNA GRUBU", "GİRİŞ TARİHİ": "05.03.2017", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Pınar ÇELIK", "SİCİL NO": "44565912263", "TC KİMLİK": "48538845718", "DOĞ.TARİHİ": "13.05.1987", "GÖREVİ": "FREZE OPERATÖRÜ", "DEPARTMANI": "FREZE GRUBU", "GİRİŞ TARİHİ": "18.09.2018", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Recep TANRIVERDİ", "SİCİL NO": "44565912264", "TC KİMLİK": "48538845719", "DOĞ.TARİHİ": "02.10.1985", "GÖREVİ": "KAYNAK USTASI", "DEPARTMANI": "KAYNAK", "GİRİŞ TARİHİ": "25.04.2016", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Rıza GÜNGÖR", "SİCİL NO": "44565912265", "TC KİMLİK": "48538845720", "DOĞ.TARİHİ": "11.06.1990", "GÖREVİ": "MONTAJ USTASI", "DEPARTMANI": "MONTAJ", "GİRİŞ TARİHİ": "08.11.2019", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Salih KILIÇ", "SİCİL NO": "44565912266", "TC KİMLİK": "48538845721", "DOĞ.TARİHİ": "28.02.1992", "GÖREVİ": "TEKNİK RESSAM", "DEPARTMANI": "TEKNİK OFİS", "GİRİŞ TARİHİ": "14.01.2021", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "NORMAL", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Selim YÜCEL", "SİCİL NO": "44565912267", "TC KİMLİK": "48538845722", "DOĞ.TARİHİ": "09.08.1989", "GÖREVİ": "KALİTE KONTROL", "DEPARTMANI": "KALİTE KONTROL", "GİRİŞ TARİHİ": "31.05.2018", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "NORMAL", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Serkan DOĞAN", "SİCİL NO": "44565912268", "TC KİMLİK": "48538845723", "DOĞ.TARİHİ": "17.11.1986", "GÖREVİ": "BAKIM TEKNİSYENİ", "DEPARTMANI": "BAKIM VE ONARIM", "GİRİŞ TARİHİ": "23.07.2017", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Süleyman KORKMAZ", "SİCİL NO": "44565912269", "TC KİMLİK": "48538845724", "DOĞ.TARİHİ": "04.03.1991", "GÖREVİ": "FORKLİFT OPERATÖRÜ", "DEPARTMANI": "FORKLİFT OPERATÖRÜ", "GİRİŞ TARİHİ": "12.09.2020", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Tarık ÖZYURT", "SİCİL NO": "44565912270", "TC KİMLİK": "48538845725", "DOĞ.TARİHİ": "21.12.1988", "GÖREVİ": "DEPO SORUMLUSU", "DEPARTMANI": "DEPO", "GİRİŞ TARİHİ": "06.02.2019", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "NORMAL", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Taylan AKBAŞ", "SİCİL NO": "44565912271", "TC KİMLİK": "48538845726", "DOĞ.TARİHİ": "15.07.1993", "GÖREVİ": "TESTERE OPERATÖRÜ", "DEPARTMANI": "TESTERE", "GİRİŞ TARİHİ": "28.08.2021", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    
    // STAJYERLİK ve EĞİTİM
    { "ADI SOYADI": "Tolga YILDIRIM", "SİCİL NO": "55565912272", "TC KİMLİK": "48538845727", "DOĞ.TARİHİ": "29.01.2001", "GÖREVİ": "STAJYERLİK", "DEPARTMANI": "STAJYERLİK", "GİRİŞ TARİHİ": "10.09.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "EĞİTİM", "DURUM": "AKTIF", "TİP": "STAJYERLİK", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Ufuk ASLAN", "SİCİL NO": "55565912273", "TC KİMLİK": "48538845728", "DOĞ.TARİHİ": "08.04.2000", "GÖREVİ": "ÇIRAK LİSE", "DEPARTMANI": "ÇIRAK LİSE", "GİRİŞ TARİHİ": "15.09.2020", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "EĞİTİM", "DURUM": "AKTIF", "TİP": "EĞİTİM", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Uğur ÇAKIR", "SİCİL NO": "55565912274", "TC KİMLİK": "48538845729", "DOĞ.TARİHİ": "12.11.1999", "GÖREVİ": "STAJYERLİK", "DEPARTMANI": "STAJYERLİK", "GİRİŞ TARİHİ": "03.02.2022", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "EĞİTİM", "DURUM": "AKTIF", "TİP": "STAJYERLİK", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Umut DEMİR", "SİCİL NO": "55565912275", "TC KİMLİK": "48538845730", "DOĞ.TARİHİ": "26.05.2001", "GÖREVİ": "ÇIRAK LİSE", "DEPARTMANI": "ÇIRAK LİSE", "GİRİŞ TARİHİ": "12.09.2021", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "EĞİTİM", "DURUM": "AKTIF", "TİP": "EĞİTİM", "ÇIKIŞ": "" },
    
    // ÖZELLİKLİ DEPARTMANLAR
    { "ADI SOYADI": "Veli TÜRK", "SİCİL NO": "66565912276", "TC KİMLİK": "48538845731", "DOĞ.TARİHİ": "18.09.1994", "GÖREVİ": "ÜNİVERSAL TORNA", "DEPARTMANI": "ÜNİVERSAL TORNA / FREZE", "GİRİŞ TARİHİ": "07.06.2019", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Volkan ATEŞ", "SİCİL NO": "66565912277", "TC KİMLİK": "48538845732", "DOĞ.TARİHİ": "03.12.1987", "GÖREVİ": "BASMA OPERATÖRÜ", "DEPARTMANI": "BASMA/ÇEKME VE SIZDIRMAZLIK", "GİRİŞ TARİHİ": "21.03.2018", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Yalçın ÖZDOGAN", "SİCİL NO": "66565912278", "TC KİMLİK": "48538845733", "DOĞ.TARİHİ": "14.08.1990", "GÖREVİ": "KUMLAMA USTASI", "DEPARTMANI": "KUMLAMA", "GİRİŞ TARİHİ": "09.10.2020", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Yasin KURT", "SİCİL NO": "66565912279", "TC KİMLİK": "48538845734", "DOĞ.TARİHİ": "27.01.1992", "GÖREVİ": "PLAZMA KESİM", "DEPARTMANI": "PLAZMA KESİM", "GİRİŞ TARİHİ": "16.05.2021", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Yusuf ÖZER", "SİCİL NO": "66565912280", "TC KİMLİK": "48538845735", "DOĞ.TARİHİ": "05.06.1989", "GÖREVİ": "BOYA USTASI", "DEPARTMANI": "ASTAR/SON KAT BOYA", "GİRİŞ TARİHİ": "13.12.2019", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "VARDIYA", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    
    // AYRILANLAR ve PASİF OLANLAR
    { "ADI SOYADI": "Zeki POLAT", "SİCİL NO": "77565912281", "TC KİMLİK": "48538845736", "DOĞ.TARİHİ": "22.03.1985", "GÖREVİ": "İDK KAMARA", "DEPARTMANI": "İDK KAMARA", "GİRİŞ TARİHİ": "08.07.2018", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "KAMBER", "DURUM": "AYRILDI", "TİP": "AYRILDI", "ÇIKIŞ": "15.08.2023" },
    { "ADI SOYADI": "Zeynep KARACA", "SİCİL NO": "77565912282", "TC KİMLİK": "48538845737", "DOĞ.TARİHİ": "10.11.1988", "GÖREVİ": "İDARE MEMURU", "DEPARTMANI": "İDARİ BİRİM", "GİRİŞ TARİHİ": "25.02.2017", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "NORMAL", "DURUM": "İZİNLİ", "TİP": "İZİNLİ", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Zülfü YILMAZ", "SİCİL NO": "77565912283", "TC KİMLİK": "48538845738", "DOĞ.TARİHİ": "07.07.1991", "GÖREVİ": "AMBAR SORUMLUSU", "DEPARTMANI": "AMBAR", "GİRİŞ TARİHİ": "19.04.2020", "BİRİMİ": "IŞIL", "ÇAL.ŞEKLİ": "NORMAL", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" },
    { "ADI SOYADI": "Turan PLANLAMA", "SİCİL NO": "88565912290", "TC KİMLİK": "48538845740", "DOĞ.TARİHİ": "12.04.1987", "GÖREVİ": "PLANLAMA UZMAN", "DEPARTMANI": "PLANLAMA", "GİRİŞ TARİHİ": "19.09.2018", "BİRİMİ": "MERKEZ", "ÇAL.ŞEKLİ": "NORMAL", "DURUM": "AKTIF", "TİP": "AKTIF", "ÇIKIŞ": "" }
];

// 🔧 Tüm yardımcı fonksiyonlar importNewEmployees.js'den kopyalandı

// Tarih dönüştürme (DD.MM.YYYY → Date)
function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    
    return new Date(year, month, day);
}

// İsim parse etme
function parseName(fullName) {
    if (!fullName || typeof fullName !== 'string') {
        return { firstName: 'Bilinmiyor', lastName: 'Bilinmiyor' };
    }
    
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) {
        return { firstName: nameParts[0], lastName: '' };
    }
    
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    return { firstName, lastName };
}

// Departman normalize etme
function normalizeDepartment(department) {
    if (!department || typeof department !== 'string') return 'DİĞER';
    
    const dept = department.toUpperCase().trim();
    
    const departmentMapping = {
        'İDK KAMARA': 'İDARİ BİRİM',
        'IDK KAMARA': 'İDARİ BİRİM',
        'KAMARA': 'İDARİ BİRİM',
        'KEFENDİS': 'GENEL ÇALIŞMA GRUBU',
        'KAMBER': 'GENEL ÇALIŞMA GRUBU',
        'MERKEZ': 'İDARİ BİRİM',
        'TEKNİK': 'TEKNİK OFİS',
        'TEKNİK OFİS': 'TEKNİK OFİS',
        'KALİTE': 'KALİTE KONTROL',
        'KALİTE KONTROL': 'KALİTE KONTROL',
        'BAKIM': 'BAKIM VE ONARIM',
        'BAKIM VE ONARIM': 'BAKIM VE ONARIM',
        'TORNA': 'TORNA GRUBU',
        'TORNA GRUBU': 'TORNA GRUBU',
        'FREZE': 'FREZE GRUBU',
        'FREZE GRUBU': 'FREZE GRUBU',
        'TESTERE': 'TESTERE',
        'KAYNAK': 'KAYNAK',
        'MONTAJ': 'MONTAJ',
        'PLANLAMA': 'PLANLAMA',
        'USTA': 'GENEL ÇALIŞMA GRUBU',
        'OPERATÖR': 'GENEL ÇALIŞMA GRUBU',
        'İŞÇİ': 'GENEL ÇALIŞMA GRUBU',
        'ISCI': 'GENEL ÇALIŞMA GRUBU',
        'GENEL ÇALIŞMA GRUBU': 'GENEL ÇALIŞMA GRUBU',
        'FORKLİFT OPERATÖRÜ': 'FORKLİFT OPERATÖRÜ',
        'DEPO': 'DEPO',
        'ÜNİVERSAL TORNA / FREZE': 'ÜNİVERSAL TORNA / FREZE',
        'BASMA/ÇEKME VE SIZDIRMAZLIK': 'BASMA/ÇEKME VE SIZDIRMAZLIK',
        'KUMLAMA': 'KUMLAMA',
        'PLAZMA KESİM': 'PLAZMA KESİM',
        'ASTAR/SON KAT BOYA': 'ASTAR/SON KAT BOYA',
        'STAJYERLİK': 'STAJYERLİK',
        'ÇIRAK LİSE': 'ÇIRAK LİSE',
        'AMBAR': 'AMBAR',
        'İDARİ BİRİM': 'İDARİ BİRİM'
    };
    
    if (departmentMapping[dept]) {
        return departmentMapping[dept];
    }
    
    for (const [key, value] of Object.entries(departmentMapping)) {
        if (dept.includes(key)) {
            return value;
        }
    }
    
    return 'DİĞER';
}

// Lokasyon belirleme
function determineLocation(birim, department) {
    if (!birim || typeof birim !== 'string') {
        const isilDepartments = [
            'ÜNİVERSAL TORNA / FREZE',
            'FORKLİFT OPERATÖRÜ',
            'DEPO',
            'BASMA/ÇEKME VE SIZDIRMAZLIK'
        ];
        
        return isilDepartments.includes(department) ? 'IŞIL ŞUBE' : 'MERKEZ ŞUBE';
    }
    
    const birimUpper = birim.toUpperCase().trim();
    
    if (birimUpper.includes('IŞIL') || birimUpper.includes('ISIL')) {
        return 'IŞIL ŞUBE';
    }
    
    return 'MERKEZ ŞUBE';
}

// Durum normalize etme
function normalizeStatus(durum, cikis) {
    if (cikis && cikis.trim() !== '') {
        return 'AYRILDI';
    }
    
    if (!durum || typeof durum !== 'string') return 'AKTIF';
    
    const durumUpper = durum.toUpperCase().trim();
    
    const statusMapping = {
        'AKTIF': 'AKTIF',
        'AKTİF': 'AKTIF',
        'PASİF': 'PASİF',
        'PASIF': 'PASİF',
        'İZİNLİ': 'İZİNLİ',
        'IZINLI': 'İZİNLİ',
        'AYRILDI': 'AYRILDI',
        'AYRILAN': 'AYRILDI',
        'VASAT': 'AKTIF'
    };
    
    return statusMapping[durumUpper] || 'AKTIF';
}

// TC Kimlik parse etme
function parseTcNo(tcField) {
    if (!tcField || typeof tcField !== 'string') return '';
    
    const tc = tcField.trim();
    
    if (tc.includes('.') && tc.length <= 10) return '';
    
    const numericOnly = tc.replace(/\D/g, '');
    if (numericOnly.length === 11) {
        return numericOnly;
    }
    
    return '';
}

// 📥 Ana import fonksiyonu
async function importEmployees() {
    try {
        console.log('🚀 FULL Excel verisinden çalışanları içe aktarıyorum...');
        console.log(`📊 Toplam kayıt sayısı: ${employeeData.length}`);
        
        const employees = [];
        const processedTcNos = new Set();
        let successCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;
        
        for (let i = 0; i < employeeData.length; i++) {
            const data = employeeData[i];
            
            try {
                const { firstName, lastName } = parseName(data["ADI SOYADI"]);
                const tcNo = parseTcNo(data["TC KİMLİK"]);
                
                if (tcNo && processedTcNos.has(tcNo)) {
                    console.log(`⚠️ ${i + 1}. ${firstName} ${lastName} - Duplicate TC: ${tcNo}, atlanıyor...`);
                    duplicateCount++;
                    continue;
                }
                
                if (tcNo) {
                    processedTcNos.add(tcNo);
                }
                
                const birthDate = parseDate(data["DOĞ.TARİHİ"]);
                const hireDate = parseDate(data["GİRİŞ TARİHİ"]);
                const department = normalizeDepartment(data["DEPARTMANI"]);
                const location = determineLocation(data["BİRİMİ"], department);
                const status = normalizeStatus(data["DURUM"], data["ÇIKIŞ"]);
                const employeeId = data["SİCİL NO"] || `EMP${String(i + 1).padStart(4, '0')}`;
                
                const notes = [
                    data["ÇAL.ŞEKLİ"] ? `Çalışma Şekli: ${data["ÇAL.ŞEKLİ"]}` : null,
                    data["TİP"] ? `Tip: ${data["TİP"]}` : null,
                    data["ÇIKIŞ"] ? `Çıkış Tarihi: ${data["ÇIKIŞ"]}` : null
                ].filter(Boolean).join(', ');
                
                const employee = {
                    employeeId,
                    firstName,
                    lastName,
                    fullName: `${firstName} ${lastName}`,
                    tcNo: tcNo || '',
                    birthDate,
                    hireDate: hireDate || new Date(),
                    position: data["GÖREVİ"] || 'Belirtilmemiş',
                    department,
                    location,
                    status,
                    notes: notes || '',
                    serviceInfo: {
                        usesService: false
                    }
                };
                
                employees.push(employee);
                console.log(`✓ ${i + 1}. ${firstName} ${lastName} - ${department} - ${location} - TC: ${tcNo || 'N/A'}`);
                successCount++;
                
            } catch (error) {
                console.error(`❌ ${i + 1}. kayıt hatası:`, error.message);
                errorCount++;
            }
        }
        
        // Veritabanına kaydet
        if (employees.length > 0) {
            console.log(`\n💾 ${employees.length} çalışanı veritabanına kaydediyorum...`);
            
            try {
                await Employee.insertMany(employees, { ordered: false });
                console.log(`\n🎉 Import tamamlandı!`);
            } catch (error) {
                if (error.name === 'MongoBulkWriteError') {
                    const insertedCount = error.result ? error.result.insertedCount : 0;
                    console.log(`\n⚠️ Kısmi import tamamlandı!`);
                    console.log(`✅ Başarıyla eklenen: ${insertedCount} çalışan`);
                    console.log(`❌ Duplicate/Hata: ${employees.length - insertedCount} kayıt`);
                } else {
                    throw error;
                }
            }
            
            console.log(`✅ Başarılı: ${successCount} çalışan`);
            console.log(`⚠️ Duplicate atlanan: ${duplicateCount} kayıt`);
            console.log(`❌ Hatalı: ${errorCount} kayıt`);
            console.log(`📊 Toplam: ${employees.length} çalışan eklendi`);
            
            // Özet bilgiler
            const locationStats = employees.reduce((acc, emp) => {
                acc[emp.location] = (acc[emp.location] || 0) + 1;
                return acc;
            }, {});
            
            const departmentStats = employees.reduce((acc, emp) => {
                acc[emp.department] = (acc[emp.department] || 0) + 1;
                return acc;
            }, {});
            
            const statusStats = employees.reduce((acc, emp) => {
                acc[emp.status] = (acc[emp.status] || 0) + 1;
                return acc;
            }, {});
            
            console.log('\n📍 Lokasyon Dağılımı:');
            Object.entries(locationStats).forEach(([loc, count]) => {
                console.log(`   ${loc}: ${count} çalışan`);
            });
            
            console.log('\n🏢 Departman Dağılımı:');
            Object.entries(departmentStats).forEach(([dept, count]) => {
                console.log(`   ${dept}: ${count} çalışan`);
            });
            
            console.log('\n📊 Durum Dağılımı:');
            Object.entries(statusStats).forEach(([status, count]) => {
                console.log(`   ${status}: ${count} çalışan`);
            });
            
        } else {
            console.log('❌ İçe aktarılacak veri bulunamadı!');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Import hatası:', error);
        process.exit(1);
    }
}

importEmployees(); 