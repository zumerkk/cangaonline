import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  IconButton,
  Tooltip,
  Chip,
  Container,
  AppBar,
  Toolbar,
  InputAdornment,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  DirectionsBus as BusIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Download as DownloadIcon,
  Sync as SyncIcon,
  People as PeopleIcon,
  Update as UpdateIcon
} from '@mui/icons-material';

function PassengerList() {
  // 🚌 5 AKTİF SERVİS GÜZERGAHI - Excel'den alınan gerçek veriler
  const demoRoutes = [
    { _id: '507f1f77bcf86cd799439011', routeName: 'DISPANSER SERVİS GÜZERGAHI', passengerCount: 14 },
    { _id: '507f1f77bcf86cd799439012', routeName: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', passengerCount: 16 },
    { _id: '507f1f77bcf86cd799439013', routeName: 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI', passengerCount: 18 },
    { _id: '507f1f77bcf86cd799439014', routeName: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', passengerCount: 17 },
    { _id: '507f1f77bcf86cd799439015', routeName: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', passengerCount: 19 },
    { _id: 'kendi_araci', routeName: 'KENDİ ARACI', passengerCount: 19 }
  ];

  // State'ler
  const [passengers, setPassengers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  // Yeni/Düzenlenen yolcu state'i
  const [passengerForm, setPassengerForm] = useState({
    name: '',
    department: '',
    position: '',
    shift: '',
    route: '',
    stop: '',
    address: '',
    phone: '',
    emergencyContact: '',
    notes: ''
  });

  // Departmanlar listesi (Excel'den alınan gerçek departmanlar)
  const departments = [
    'TORNA GRUBU',
    'FREZE GRUBU', 
    'TESTERE',
    'GENEL ÇALIŞMA GRUBU',
    'İDARİ BİRİM',
    'TEKNİK OFİS',
    'KALİTE KONTROL',
    'BAKIM VE ONARIM',
    'STAJYERLİK',
    'ÇIRAK LİSE',
    'ÇALILIÖZ',
    'MERKEZ',
    'SANAYİ',
    'DİSPANSER',
    'KARŞIYAKA',
    'OSMANGAZI'
  ];

  // Vardiya seçenekleri
  const shifts = [
    '08:00-18:00',
    '08:00-16:00', 
    '16:00-24:00',
    '24:00-08:00'
  ];

  // Alert gösterme
  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 4000);
  };

  // Örnek yolcu verileri (Excel'den alınan gerçek veriler) - KULLANILMIYOR
  const samplePassengersOLD = [
    {
      id: 1,
      name: 'AHMET ÇANGA',
      department: 'ÇALILIÖZ',
      position: 'İŞÇİ',
      shift: '08:00-18:00',
      route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
      stop: 'NOKTA A-101/DOĞTAŞ',
      address: 'Çalılıöz Mahallesi',
      phone: '555-0001',
      emergencyContact: '555-0002',
      notes: ''
    },
    {
      id: 2,
      name: 'AHMET ŞAHİN',
      department: 'ÇALILIÖZ', 
      position: 'İŞÇİ',
      shift: '08:00-18:00',
      route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
      stop: 'SAAT KULESİ',
      address: 'Çalılıöz Mahallesi',
      phone: '555-0003',
      emergencyContact: '555-0004',
      notes: ''
    },
    {
      id: 3,
      name: 'ALİ ÇAVUŞ BAŞTUĞ',
      department: 'ÇALILIÖZ',
      position: 'İŞÇİ',
      shift: '08:00-18:00',
      route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', 
      stop: 'FIRINLI CAMİ',
      address: 'Çalılıöz Mahallesi',
      phone: '555-0005',
      emergencyContact: '555-0006',
      notes: ''
    },
    {
      id: 4,
      name: 'ALİ ÖKSÜZ',
      department: 'ÇALILIÖZ',
      position: 'İŞÇİ',
      shift: '08:00-18:00',
      route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
      stop: 'SAAT KULESİ',
      address: 'Çalılıöz Mahallesi',
      phone: '555-0007',
      emergencyContact: '555-0008',
      notes: ''
    },
    {
      id: 5,
      name: 'AYNUR AYTEKİN',
      department: 'ÇALILIÖZ',
      position: 'İŞÇİ',
      shift: '08:00-18:00',
      route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
      stop: 'ÇALILIÖZ KÖPRÜ (ALT YOL)',
      address: 'Çalılıöz Mahallesi',
      phone: '555-0009',
      emergencyContact: '555-0010',
      notes: ''
    },
    {
      id: 6,
      name: 'BİRKAN ŞEKER',
      department: 'TORNA GRUBU',
      position: 'TORNA TEZGAHÇİSİ',
      shift: '08:00-18:00',
      route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
      stop: 'S-OİL BENZİNLİK',
      address: 'Merkez',
      phone: '555-0011',
      emergencyContact: '555-0012',
      notes: ''
    },
    {
      id: 7,
      name: 'AHMET ÇELİK',
      department: 'TORNA GRUBU',
      position: 'TORNA TEZGAHÇİSİ',
      shift: '08:00-18:00',
      route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
      stop: 'S-OİL BENZİNLİK',
      address: 'Merkez',
      phone: '555-0013',
      emergencyContact: '555-0014',
      notes: ''
    },
    {
      id: 8,
      name: 'EMİR KAAN BAŞER',
      department: 'FREZE GRUBU',
      position: 'FREZE TEZGAHÇİSİ',
      shift: '08:00-18:00',
      route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
      stop: 'BAŞPINAR',
      address: 'Merkez',
      phone: '555-0015',
      emergencyContact: '555-0016',
      notes: ''
    },
    {
      id: 9,
      name: 'MERT SÜNBÜL',
      department: 'KALİTE KONTROL',
      position: 'KALİTE KONTROL UZMANI',
      shift: '08:00-18:00',
      route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
      stop: 'TOPRAK YEMEK',
      address: 'Merkez',
      phone: '555-0017',
      emergencyContact: '555-0018',
      notes: ''
    },
    {
      id: 10,
      name: 'MESUT TUNCER',
      department: 'TORNA GRUBU',
      position: 'TORNA TEZGAHÇİSİ',
      shift: '08:00-18:00',
      route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
      stop: 'HALI SAHA',
      address: 'Merkez',
      phone: '555-0019',
      emergencyContact: '555-0020',
      notes: ''
    },
    // Excel'den alınan gerçek yolcu verileri - 157 kayıt
    { id: 11, name: 'AHMET ÇANGA', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'NOKTA A-101/DOĞTAŞ', address: 'Çalılıöz', phone: '555-0021', emergencyContact: '555-0022', notes: '' },
    { id: 12, name: 'AHMET DURAN TUNA', department: 'TORNA GRUBU', position: 'TORNA TEZGAHÇİSİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'NOKTA A-101/DOĞTAŞ', address: 'Sanayi', phone: '555-0023', emergencyContact: '555-0024', notes: '' },
    { id: 13, name: 'AHMET ŞAHİN', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'SAAT KULESİ', address: 'Çalılıöz', phone: '555-0025', emergencyContact: '555-0026', notes: '' },
    { id: 14, name: 'ALİ BUHARA KARA', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'BAGDAT KOPRU VE UZERI', address: 'Merkez', phone: '555-0027', emergencyContact: '555-0028', notes: '' },
    { id: 15, name: 'ALİ ÇAVUŞ BAŞTUĞ', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'FIRINLI CAMİ', address: 'Çalılıöz', phone: '555-0029', emergencyContact: '555-0030', notes: '' },
    { id: 16, name: 'ALİ GÜRBÜZ', department: 'DİSPANSER', position: 'SAĞLIK MEMURU', shift: '08:00-18:00', route: 'DİSPANSER SERVİS GÜZERGAHI', stop: 'ŞADIRVAN (PERŞEMBE PAZARI)', address: 'Dispanser', phone: '555-0031', emergencyContact: '555-0032', notes: '' },
    { id: 17, name: 'ALİ KAAN', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'BAGDAT KOPRU VE UZERI', address: 'Merkez', phone: '555-0033', emergencyContact: '555-0034', notes: '' },
    { id: 18, name: 'ALİ ÖKSÜZ', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'SAAT KULESİ', address: 'Çalılıöz', phone: '555-0035', emergencyContact: '555-0036', notes: '' },
    { id: 19, name: 'ALİ SAVAŞ', department: 'DİSPANSER', position: 'SAĞLIK MEMURU', shift: '08:00-18:00', route: 'DİSPANSER SERVİS GÜZERGAHI', stop: 'NOKTA A-101/DOĞTAŞ', address: 'Dispanser', phone: '555-0037', emergencyContact: '555-0038', notes: '' },
    { id: 20, name: 'ALİ SITKI YORULMAZ', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'CORBACI ALİ DAYI', address: 'Sanayi', phone: '555-0039', emergencyContact: '555-0040', notes: '' },
    { id: 21, name: 'ALİ VELİ ŞOY ARİ', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'NİP', address: 'Merkez', phone: '555-0041', emergencyContact: '555-0042', notes: '' },
    { id: 22, name: 'ALPEREN TOZLU', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'HALI SAHA', address: 'Merkez', phone: '555-0043', emergencyContact: '555-0044', notes: '' },
    { id: 23, name: 'AYNUR AYTEKİN', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇALILIÖZ KÖPRÜ (ALT YOL)', address: 'Çalılıöz', phone: '555-0045', emergencyContact: '555-0046', notes: '' },
    { id: 24, name: 'BERAT ÖZDEN', department: 'KALİTE KONTROL', position: 'KALİTE KONTROL UZMANI', shift: '08:00-18:00', route: 'DİSPANSER SERVİS GÜZERGAHI', stop: 'DİSPANSER ÜST GEÇİT', address: 'Dispanser', phone: '555-0047', emergencyContact: '555-0048', notes: '' },
    { id: 25, name: 'BERAT SUSAR', department: 'TORNA GRUBU', position: 'TORNA TEZGAHÇİSİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'AYTEMİZ BENZİNLİK', address: 'Merkez', phone: '555-0049', emergencyContact: '555-0050', notes: '' },
    { id: 26, name: 'BİRKAN ŞEKER', department: 'TORNA GRUBU', position: 'TORNA TEZGAHÇİSİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'S-OİL BENZİNLİK', address: 'Merkez', phone: '555-0051', emergencyContact: '555-0052', notes: '' },
    { id: 27, name: 'BURHANETTİN LIMAN', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'TIYATERHANELI UST BENZİNLİK', address: 'Merkez', phone: '555-0053', emergencyContact: '555-0054', notes: '' },
    { id: 28, name: 'CELAL BARAN', department: 'KALİTE KONTROL', position: 'KALİTE KONTROL UZMANI', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇALILIÖZ KÖPRÜ (ALT YOL)', address: 'Çalılıöz', phone: '555-0055', emergencyContact: '555-0056', notes: '' },
    { id: 29, name: 'CEVDET ÖKSÜZ', department: 'DİSPANSER', position: 'SAĞLIK MEMURU', shift: '08:00-18:00', route: 'DİSPANSER SERVİS GÜZERGAHI', stop: 'DİSPANSER ÜST GEÇİT', address: 'Dispanser', phone: '555-0057', emergencyContact: '555-0058', notes: '' },
    { id: 30, name: 'EMİR KAAN BAŞER', department: 'FREZE GRUBU', position: 'FREZE TEZGAHÇİSİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'BAŞPINAR', address: 'Merkez', phone: '555-0059', emergencyContact: '555-0060', notes: '' },
    { id: 31, name: 'ERDAL YAKUT', department: 'FREZE GRUBU', position: 'FREZE TEZGAHÇİSİ', shift: '08:00-18:00', route: 'DİSPANSER SERVİS GÜZERGAHI', stop: 'GÜL PASTANESİ', address: 'Dispanser', phone: '555-0061', emergencyContact: '555-0062', notes: '' },
    { id: 32, name: 'EYÜP TORUN', department: 'DİSPANSER', position: 'SAĞLIK MEMURU', shift: '08:00-18:00', route: 'DİSPANSER SERVİS GÜZERGAHI', stop: 'DİSPANSER ÜST GEÇİT', address: 'Dispanser', phone: '555-0063', emergencyContact: '555-0064', notes: '' },
    { id: 33, name: 'FATİH BALOĞLU', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'CORBACI ALİ DAYI', address: 'Sanayi', phone: '555-0065', emergencyContact: '555-0066', notes: '' },
    { id: 34, name: 'GÖKHAN GÖKÇE', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'NİP', address: 'Merkez', phone: '555-0067', emergencyContact: '555-0068', notes: '' },
    { id: 35, name: 'HAKKİ YÜCEL', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'CORBACI ALİ DAYI', address: 'Sanayi', phone: '555-0069', emergencyContact: '555-0070', notes: '' },
    { id: 36, name: 'HAYATİ SÖZDİNLER', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'CORBACI ALİ DAYI', address: 'Sanayi', phone: '555-0071', emergencyContact: '555-0072', notes: '' },
    { id: 37, name: 'HAYRİ CANGIR', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'EŞK REKTÖRLÜĞ/CİNEMOSAKDİ ÇARŞI MERKEZ', address: 'Merkez', phone: '555-0073', emergencyContact: '555-0074', notes: '' },
    { id: 38, name: 'HİLMİ SORGUN', department: 'FREZE GRUBU', position: 'FREZE TEZGAHÇİSİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'S-OİL BENZİNLİK', address: 'Merkez', phone: '555-0075', emergencyContact: '555-0076', notes: '' },
    { id: 39, name: 'HÜSEYİN CAN', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'VALİLE ARKASI', address: 'Merkez', phone: '555-0077', emergencyContact: '555-0078', notes: '' },
    { id: 40, name: 'İBRAHİM ASLAN', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇALILIÖZ KÖPRÜ (ALT YOL)', address: 'Çalılıöz', phone: '555-0079', emergencyContact: '555-0080', notes: '' },
    { id: 41, name: 'LEVENT DURMAZ', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇALILIÖZ KÖPRÜ (ALT YOL)', address: 'Çalılıöz', phone: '555-0081', emergencyContact: '555-0082', notes: '' },
    { id: 42, name: 'MEHMET AKTAN', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'NİP', address: 'Merkez', phone: '555-0083', emergencyContact: '555-0084', notes: '' },
    { id: 43, name: 'MEHMET ERTİÇ', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'EŞK REKTÖRLÜK', address: 'Merkez', phone: '555-0085', emergencyContact: '555-0086', notes: '' },
    { id: 44, name: 'MERT SÜNBÜL', department: 'KALİTE KONTROL', position: 'KALİTE KONTROL UZMANI', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'TOPRAK YEMEK', address: 'Merkez', phone: '555-0087', emergencyContact: '555-0088', notes: '' },
    { id: 45, name: 'MESUT TUNCER', department: 'TORNA GRUBU', position: 'TORNA TEZGAHÇİSİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'HALI SAHA', address: 'Merkez', phone: '555-0089', emergencyContact: '555-0090', notes: '' },
    { id: 46, name: 'MURAT TUNÇ', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'MIZRAK CİVAR ÜST GEÇİT', address: 'Merkez', phone: '555-0091', emergencyContact: '555-0092', notes: '' },
    { id: 47, name: 'MUSTAFA ÖKTEN', department: 'DİSPANSER', position: 'SAĞLIK MEMURU', shift: '08:00-18:00', route: 'DİSPANSER SERVİS GÜZERGAHI', stop: 'DİSPANSER ÜST GEÇİT', address: 'Dispanser', phone: '555-0093', emergencyContact: '555-0094', notes: '' },
    { id: 48, name: 'NECATİ ÖZMEN', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'SAAT KULESİ', address: 'Merkez', phone: '555-0095', emergencyContact: '555-0096', notes: '' },
    { id: 49, name: 'SEFAETTİN VANLIDA', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'DİSPANSER', address: 'Merkez', phone: '555-0097', emergencyContact: '555-0098', notes: '' },
    { id: 50, name: 'SERDİ KALYOL', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'MERKEZ', address: 'Merkez', phone: '555-0099', emergencyContact: '555-0100', notes: '' },
    { id: 51, name: 'VEYSEL EMRE TOZLU', department: 'TORNA GRUBU', position: 'TORNA TEZGAHÇİSİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'HALI SAHA', address: 'Merkez', phone: '555-0101', emergencyContact: '555-0102', notes: '' },
    { id: 52, name: 'YASİN ŞAHİNKAYA', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'DİSPANSER ÜST GEÇİT', address: 'Merkez', phone: '555-0103', emergencyContact: '555-0104', notes: '' },
    { id: 53, name: 'YAŞAR SAMSÜL', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'EŞK REKTÖRLÜK/ CİNEMOSAKDİ ÇARŞI MERKEZ', address: 'Merkez', phone: '555-0105', emergencyContact: '555-0106', notes: '' },
    { id: 54, name: 'YUSUF KANLIOĞLU', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'CİŞL ÇİN ÖZEL LİST', address: 'Merkez', phone: '555-0107', emergencyContact: '555-0108', notes: '' },
    { id: 55, name: 'ZEKİ ÜNAL', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'CİŞL ÇİN ÖZEL LİST', address: 'Sanayi', phone: '555-0109', emergencyContact: '555-0110', notes: '' },
    { id: 56, name: 'AHMET ASLAN', department: 'MERKEZ', position: 'İŞÇİ', shift: '16:00-24:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'MERKEZ', address: 'Merkez', phone: '555-0111', emergencyContact: '555-0112', notes: '' },
    { id: 57, name: 'AHMET ÇELİK', department: 'TORNA GRUBU', position: 'TORNA TEZGAHÇİSİ', shift: '16:00-24:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'S-OİL BENZİNLİK', address: 'Merkez', phone: '555-0113', emergencyContact: '555-0114', notes: '' },
    
    // KENDİ ARACI İLE GELENLER
    { id: 58, name: 'AHMET ILGIN', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0115', emergencyContact: '555-0116', notes: 'Kendi aracı ile geliyor' },
    { id: 59, name: 'BAHADIR AKKUL', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0117', emergencyContact: '555-0118', notes: 'Kendi aracı ile geliyor' },
    { id: 60, name: 'BATUHAN İLHAN', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0119', emergencyContact: '555-0120', notes: 'Kendi aracı ile geliyor' },
    { id: 61, name: 'BİLAL CEVİZOĞLU', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0121', emergencyContact: '555-0122', notes: 'Kendi aracı ile geliyor' },
    { id: 62, name: 'BURCU KARAKOÇ', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0123', emergencyContact: '555-0124', notes: 'Kendi aracı ile geliyor' },
    { id: 63, name: 'ERDEM KAMİL YILDIRIM', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0125', emergencyContact: '555-0126', notes: 'Kendi aracı ile geliyor' },
    { id: 64, name: 'İRFAN KIRAÇ', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0127', emergencyContact: '555-0128', notes: 'Kendi aracı ile geliyor' },
    { id: 65, name: 'KAMİL BATUHAN BEYGO', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0129', emergencyContact: '555-0130', notes: 'Kendi aracı ile geliyor' },
    { id: 66, name: 'MEHMET KEMAL İNAÇ', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0131', emergencyContact: '555-0132', notes: 'Kendi aracı ile geliyor' },
    { id: 67, name: 'MURAT GENCER', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0133', emergencyContact: '555-0134', notes: 'Kendi aracı ile geliyor' },
    { id: 68, name: 'MURAT GÜRBÜZ', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0135', emergencyContact: '555-0136', notes: 'Kendi aracı ile geliyor' },
    { id: 69, name: 'MURAT SEPETCİ', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0137', emergencyContact: '555-0138', notes: 'Kendi aracı ile geliyor' },
    { id: 70, name: 'ORHAN YORULMAZ', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0139', emergencyContact: '555-0140', notes: 'Kendi aracı ile geliyor' },
    { id: 71, name: 'SERKAN GÜLESEN', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0141', emergencyContact: '555-0142', notes: 'Kendi aracı ile geliyor' },
    { id: 72, name: 'ÜMİT DEMİREL', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0143', emergencyContact: '555-0144', notes: 'Kendi aracı ile geliyor' },
    { id: 73, name: 'BERKAN BULANIK', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Şehir Merkezi', phone: '555-0145', emergencyContact: '555-0146', notes: 'Kendi aracı ile geliyor (Bahşili)' },
    { id: 74, name: 'SÜLEYMAN GÖZUAK', department: 'İDARİ BİRİM', position: 'PERSONEL', shift: '08:00-18:00', route: 'KENDİ ARACI', stop: 'FABRİKA', address: 'Yenişehir', phone: '555-0147', emergencyContact: '555-0148', notes: 'Kendi aracı ile geliyor (Yenişehir)' },
    
    // ÇARŞI MERKEZ GÜZERGAHINDAKİ EKSİK YOLCULAR
    { id: 75, name: 'HAKAN AKPINAR', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'HALI SAHA', address: 'Merkez', phone: '555-0149', emergencyContact: '555-0150', notes: '' },
    { id: 76, name: 'MUHAMMED ZÜMER KEKİLLİOĞLU', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'HALI SAHA', address: 'Merkez', phone: '555-0151', emergencyContact: '555-0152', notes: '' },
    { id: 77, name: 'MİNE KARAOĞLU', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'ESKİ REKTÖRLÜK', address: 'Merkez', phone: '555-0153', emergencyContact: '555-0154', notes: '' },
    { id: 78, name: 'FURKAN KADİR EDEN', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'REKTÖRLÜK', address: 'Merkez', phone: '555-0155', emergencyContact: '555-0156', notes: '' },
    { id: 79, name: 'YUSUF GÜRBÜZ', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'ES BENZİNLİK', address: 'Merkez', phone: '555-0157', emergencyContact: '555-0158', notes: '' },
    { id: 80, name: 'MEHMET ERTAŞ', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'ESKİ REKTÖRLÜK', address: 'Merkez', phone: '555-0159', emergencyContact: '555-0160', notes: '' },
    { id: 81, name: 'HÜDAGÜL DEĞİRMENCİ', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'ESKİ REKTÖRLÜK', address: 'Merkez', phone: '555-0161', emergencyContact: '555-0162', notes: '' },
    { id: 82, name: 'YASİN SAYGİLİ', department: 'OSMANGAZI', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'ESKİ REKTÖRLÜK/GÜNDOĞDU OSMANGAZİ', address: 'Osmangazi', phone: '555-0163', emergencyContact: '555-0164', notes: '' },
    { id: 83, name: 'ÇAĞRI YILDIZ', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'BAĞDAT KÖPRÜ', address: 'Merkez', phone: '555-0165', emergencyContact: '555-0166', notes: '' },
    { id: 84, name: 'CEMAL ERAKSOY', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'YENİMAHALLE GO BENZİNLİK', address: 'Merkez', phone: '555-0167', emergencyContact: '555-0168', notes: '' },
    { id: 85, name: 'AZİZ BUĞRA KARA', department: 'MERKEZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇARŞI MERKEZ SERVİS GÜZERGAHI', stop: 'BAĞDAT KÖPRÜ VE ÜZERİ', address: 'Merkez', phone: '555-0169', emergencyContact: '555-0170', notes: '' },
    
    // ÇALILIÖZ MAHALLESİ GÜZERGAHINDAKİ EKSİK YOLCULAR
    { id: 86, name: 'EYÜP ÜNVANLI', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'FIRINLI CAMİ', address: 'Çalılıöz', phone: '555-0171', emergencyContact: '555-0172', notes: '' },
    { id: 87, name: 'OSMAN ÖZKİLİÇ', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'VALİLİK', address: 'Çalılıöz', phone: '555-0173', emergencyContact: '555-0174', notes: '' },
    { id: 88, name: 'UĞUR ALBAYRAK', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'SAAT KULESİ', address: 'Çalılıöz', phone: '555-0175', emergencyContact: '555-0176', notes: '' },
    { id: 89, name: 'BERAT SUSAR', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'VALİLİK ARKASI', address: 'Çalılıöz', phone: '555-0177', emergencyContact: '555-0178', notes: '' },
    { id: 90, name: 'HÜLUSİ EREN CAN', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'VALİLİK ARKASI', address: 'Çalılıöz', phone: '555-0179', emergencyContact: '555-0180', notes: '' },
    { id: 91, name: 'İBRAHİM ÜÇER', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ES BENZİNLİK', address: 'Çalılıöz', phone: '555-0181', emergencyContact: '555-0182', notes: '' },
    { id: 92, name: 'SONER ÇETİN GÜRSOY', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'VALİLİK ARKASI', address: 'Çalılıöz', phone: '555-0183', emergencyContact: '555-0184', notes: '' },
    { id: 93, name: 'ABBAS CAN ÖNGER', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'BAĞDAT BENZİNLİK', address: 'Çalılıöz', phone: '555-0185', emergencyContact: '555-0186', notes: '' },
    { id: 94, name: 'MEHMET ALİ ÖZÇELİK', department: 'ÇALILIÖZ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI', stop: 'SAAT KULESİ', address: 'Çalılıöz', phone: '555-0187', emergencyContact: '555-0188', notes: '' },
    
    // OSMANGAZİ-KARŞIYAKA MAHALLESİ GÜZERGAHINDAKİ EKSİK YOLCULAR  
    { id: 95, name: 'POLAT ERCAN', department: 'KARŞIYAKA', position: 'İŞÇİ', shift: '08:00-18:00', route: 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI', stop: 'KAHVELER (KARŞIYAKA)', address: 'Karşıyaka', phone: '555-0189', emergencyContact: '555-0190', notes: '' },
    { id: 96, name: 'EMRE DEMİRCİ', department: 'KARŞIYAKA', position: 'İŞÇİ', shift: '08:00-18:00', route: 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI', stop: 'KEL MUSTAFA DURAĞI', address: 'Karşıyaka', phone: '555-0191', emergencyContact: '555-0192', notes: '' },
    { id: 97, name: 'KEMAL KARACA', department: 'KARŞIYAKA', position: 'İŞÇİ', shift: '08:00-18:00', route: 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI', stop: 'BAHÇELİEVLER', address: 'Karşıyaka', phone: '555-0193', emergencyContact: '555-0194', notes: '' },
    { id: 98, name: 'MUSTAFA DOĞAN', department: 'KARŞIYAKA', position: 'İŞÇİ', shift: '08:00-18:00', route: 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI', stop: 'YUVA TOKİ', address: 'Karşıyaka', phone: '555-0195', emergencyContact: '555-0196', notes: '' },
    { id: 99, name: 'CİHAN ÇELEBİ', department: 'KARŞIYAKA', position: 'İŞÇİ', shift: '08:00-18:00', route: 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇULLU YOLU BİM MARKET', address: 'Karşıyaka', phone: '555-0197', emergencyContact: '555-0198', notes: '' },
    
    // SANAYİ MAHALLESİ GÜZERGAHINDAKİ EKSİK YOLCULAR
    { id: 100, name: 'FATİH BALOĞLU', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇORBACI ALİ DAYI', address: 'Sanayi', phone: '555-0199', emergencyContact: '555-0200', notes: '' },
    { id: 101, name: 'HAKKİ YÜCEL', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇORBACI ALİ DAYI', address: 'Sanayi', phone: '555-0201', emergencyContact: '555-0202', notes: '' },
    { id: 102, name: 'HAYATİ SÖZDİNLER', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇORBACI ALİ DAYI', address: 'Sanayi', phone: '555-0203', emergencyContact: '555-0204', notes: '' },
    { id: 103, name: 'HAYDAR ACAR', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'RASATTEPE KÖPRÜ', address: 'Sanayi', phone: '555-0205', emergencyContact: '555-0206', notes: '' },
    { id: 104, name: 'GÜLNUR AĞIRMAN', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'AYTEMİZ PETROL', address: 'Sanayi', phone: '555-0207', emergencyContact: '555-0208', notes: '' },
    { id: 105, name: 'İSMET BAŞER', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'AYTEMİZ PETROL', address: 'Sanayi', phone: '555-0209', emergencyContact: '555-0210', notes: '' },
    { id: 106, name: 'KEMALETTİN GÜLESEN', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'RASATTEPE KÖPRÜ', address: 'Sanayi', phone: '555-0211', emergencyContact: '555-0212', notes: '' },
    { id: 107, name: 'MACİT USLU', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇORBACI ALİ DAYI', address: 'Sanayi', phone: '555-0213', emergencyContact: '555-0214', notes: '' },
    { id: 108, name: 'MUSTAFA SÜMER', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'RASATTEPE KÖPRÜ', address: 'Sanayi', phone: '555-0215', emergencyContact: '555-0216', notes: '' },
    { id: 109, name: 'NİYAZİ YURTSEVEN', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'NOKTA A-101', address: 'Sanayi', phone: '555-0217', emergencyContact: '555-0218', notes: '' },
    { id: 110, name: 'BERAT AKTAŞ', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'NOKTA A-101', address: 'Sanayi', phone: '555-0219', emergencyContact: '555-0220', notes: '' },
    { id: 111, name: 'NURİ ÖZKAN', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇORBACI ALİ DAYI', address: 'Sanayi', phone: '555-0221', emergencyContact: '555-0222', notes: '' },
    { id: 112, name: 'MUSTAFA BAŞKAYA', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'ÇORBACI ALİ DAYI', address: 'Sanayi', phone: '555-0223', emergencyContact: '555-0224', notes: '' },
    { id: 113, name: 'MUZAFFER KIZILÇIÇEK', department: 'SANAYİ', position: 'İŞÇİ', shift: '08:00-18:00', route: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', stop: 'MEZARLIK PEYZAJ ÖNÜ', address: 'Sanayi', phone: '555-0225', emergencyContact: '555-0226', notes: '' },
    
    // DİSPANSER GÜZERGAHINDAKİ EKSİK YOLCULAR
    { id: 114, name: 'CELAL GÜLŞEN', department: 'DİSPANSER', position: 'İŞÇİ', shift: '08:00-18:00', route: 'DİSPANSER SERVİS GÜZERGAHI', stop: 'DİSPANSER ÜST GEÇİT', address: 'Dispanser', phone: '555-0227', emergencyContact: '555-0228', notes: '' },
    { id: 115, name: 'MUHAMMED NAZİM GÖÇ', department: 'DİSPANSER', position: 'İŞÇİ', shift: '08:00-18:00', route: 'DİSPANSER SERVİS GÜZERGAHI', stop: 'DİSPANSER ÜST GEÇİT', address: 'Dispanser', phone: '555-0229', emergencyContact: '555-0230', notes: '' },
    { id: 116, name: 'TUNCAY TEKİN', department: 'DİSPANSER', position: 'İŞÇİ', shift: '08:00-18:00', route: 'DİSPANSER SERVİS GÜZERGAHI', stop: 'DİSPANSER ÜST GEÇİT', address: 'Dispanser', phone: '555-0231', emergencyContact: '555-0232', notes: '' }
  ];

  // Component mount olduğunda verileri yükle
  useEffect(() => {
    fetchAllData();
  }, []);

  // Tüm verileri getir
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEmployees(),
        fetchRoutes(),
        generatePassengerListFromEmployees()
      ]);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      showAlert('Veriler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Çalışanları getir
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/employees?limit=1000');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data || []);
        console.log('Çalışan sayısı:', data.data?.length || 0);
      }
    } catch (error) {
      console.error('Çalışanlar yüklenirken hata:', error);
    }
  };

  // Çalışanlardan yolcu listesi oluştur - GERÇEKLEŞTİRİLEN VERİLER KULLANILACAK
  const generatePassengerListFromEmployees = async () => {
    try {
      // Önce employees'leri kontrol et
      let employeeData = employees;
      if (!employeeData || employeeData.length === 0) {
        const response = await fetch('http://localhost:5001/api/employees?limit=1000');
        const data = await response.json();
        employeeData = data.success ? data.data || [] : [];
      }

      // Güzergah verilerini kontrol et
      let routeData = routes;
      if (!routeData || routeData.length === 0) {
        const response = await fetch('http://localhost:5001/api/services/routes');
        const data = await response.json();
        routeData = data.success ? data.data || [] : [];
      }

      console.log('🚌 Yolcu listesi oluşturuluyor (gerçek veriler kullanılacak)...');
      console.log('📊 Çalışan sayısı:', employeeData.length);
      console.log('🚌 Güzergah sayısı:', routeData.length);

      // 🚌 5 AKTİF SERVİS GÜZERGAHI - Excel'den alınan gerçek veriler
      const activeRoutes = [
        'DISPANSER SERVİS GÜZERGAHI',
        'SANAYİ MAHALLESİ SERVİS GÜZERGAHI', 
        'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI',
        'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
        'ÇARŞI MERKEZ SERVİS GÜZERGAHI'
      ];

      // Çalışanları yolcu formatına çevir - GERÇEKLEŞTİRİLEN VERİLER KULLANILACAK
      const passengerList = employeeData.map((employee, index) => {
        // 🚌 Çalışanın gerçek servis güzergahını belirle
        let assignedRoute = 'KENDİ ARACI';
        let assignedStop = 'FABRİKA';

        // 1. Önce serviceInfo.routeName kontrol et (yeni format)
        if (employee.serviceInfo?.routeName && activeRoutes.includes(employee.serviceInfo.routeName)) {
          assignedRoute = employee.serviceInfo.routeName;
          assignedStop = employee.serviceInfo.stopName || 'FABRİKA';
        } 
        // 2. Sonra servisGuzergahi kontrol et (eski format - geriye uyumluluk)
        else if (employee.servisGuzergahi && activeRoutes.includes(employee.servisGuzergahi)) {
          assignedRoute = employee.servisGuzergahi;
          assignedStop = employee.durak || 'FABRİKA';
        }
        // 3. Türkçe alanları kontrol et (Excel'den gelen veriler - VERİTABANI FORMAT MAPPING)
        else if (employee.servisGuzergahi) {
          const routeMapping = {
            // Mevcut format - tam eşleşme
            'DİSPANSER SERVİS GÜZERGAHI': 'DISPANSER SERVİS GÜZERGAHI',
            'SANAYİ MAHALLESİ SERVİS GÜZERGAHI': 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI',
            'OSMANGAZİ-KARŞIYAKA MAHALLESİ': 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI',
            'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI': 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
            'ÇARŞI MERKEZ SERVİS GÜZERGAHI': 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
            
            // Veritabanındaki format - kısaltılmış
            'Çalılıöz Mahallesi': 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
            'Sanayi Mahallesi': 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI',
            'Çarşı Merkez': 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
            'Osmangazi-Karşıyaka': 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI',
            'Dispanser': 'DISPANSER SERVİS GÜZERGAHI',
            
            // Diğer olası formatlar
            'ÇALILIÖZ MAHALLESİ': 'ÇALILIÖZ MAHALLESİ SERVİS GÜZERGAHI',
            'SANAYİ MAHALLESİ': 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI',
            'ÇARŞI MERKEZ': 'ÇARŞI MERKEZ SERVİS GÜZERGAHI',
            'OSMANGAZİ-KARŞIYAKA': 'OSMANGAZİ-KARŞIYAKA MAHALLESİ SERVİS GÜZERGAHI',
            'DİSPANSER': 'DISPANSER SERVİS GÜZERGAHI'
          };

          const mappedRoute = routeMapping[employee.servisGuzergahi] || employee.servisGuzergahi;
          if (activeRoutes.includes(mappedRoute)) {
            assignedRoute = mappedRoute;
            assignedStop = employee.durak || 'FABRİKA';
          }
        }

        // 4. Eğer hala servis güzergahı belirlenmediyse varsayılan ata
        if (assignedRoute === 'KENDİ ARACI') {
          // İDARİ çalışanlar genellikle kendi araçlarını kullanır
          const adminPositions = ['İDARE', 'MÜDÜR', 'YÖNETMEN', 'BAŞKAN', 'GENEL MÜDÜR'];
          const isAdmin = adminPositions.some(pos => 
            employee.position?.toUpperCase().includes(pos) || 
            employee.pozisyon?.toUpperCase().includes(pos)
          );
          
          if (!isAdmin) {
            // İDARİ değilse ÇARŞI MERKEZ'e varsayılan ata
            assignedRoute = 'ÇARŞI MERKEZ SERVİS GÜZERGAHI';
            assignedStop = 'HALİ SAHA';
          }
        }

        return {
          id: employee._id || `emp_${index}`,
          employeeId: employee._id,
          name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 
                employee.fullName || 
                employee.adSoyad || 
                'İsimsiz',
          department: employee.department || employee.departman || 'Belirtilmemiş',
          position: employee.position || employee.pozisyon || employee.role || 'İşçi',
          shift: employee.shift || '08:00-18:00',
          route: assignedRoute,
          stop: assignedStop,
          address: employee.address || employee.location || employee.lokasyon || 'Belirtilmemiş',
          phone: employee.phone || employee.cepTelefonu || employee.phoneNumber || '',
          emergencyContact: employee.emergencyContact || '',
          notes: employee.notes || '',
          status: employee.status || employee.durum || 'AKTIF',
          createdAt: employee.createdAt || new Date(),
          updatedAt: new Date()
        };
      });

      // 🚌 Güzergah bazında istatistikler
      const routeStats = {};
      activeRoutes.forEach(route => {
        routeStats[route] = passengerList.filter(p => p.route === route).length;
      });
      routeStats['KENDİ ARACI'] = passengerList.filter(p => p.route === 'KENDİ ARACI').length;

      console.log('🚌 Güzergah İstatistikleri:', routeStats);

      setPassengers(passengerList);
      console.log('✅ Yolcu listesi oluşturuldu:', passengerList.length, 'kişi');
      showAlert(`Yolcu listesi güncellendi: ${passengerList.length} kişi - Güzergah verileri Excel'den alındı`, 'success');

    } catch (error) {
      console.error('Yolcu listesi oluşturma hatası:', error);
      showAlert('Yolcu listesi oluşturulamadı', 'error');
    }
  };

  // Güzergah verilerini getir (Test endpoint'ini kullan)
  const fetchRoutes = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/services/routes/test');
      const data = await response.json();
      if (data.success) {
        setRoutes(data.data || []);
        console.log('✅ Test güzergah sayısı:', data.data?.length || 0);
        console.log('📊 Toplam yolcu sayısı:', data.data?.reduce((total, route) => total + (route.passengerCount || 0), 0));
      }
    } catch (error) {
      console.error('Güzergahlar yüklenirken hata:', error);
    }
  };

  // Servis güzergahlarından senkronize et
  const syncWithServiceRoutes = async () => {
    setSyncing(true);
    try {
      showAlert('Servis güzergahlarından yolcu verileri senkronize ediliyor...', 'info');
      
      // Tüm güzergahlardan yolcuları al
      const allRoutePassengers = [];
      
      for (const route of routes) {
        try {
          const response = await fetch(`http://localhost:5001/api/services/routes/test/${route._id}/passengers`);
          const data = await response.json();
          
          if (data.success && data.data.passengers) {
            const routePassengers = data.data.passengers.map(p => ({
              id: p._id || `route_${route._id}_${allRoutePassengers.length}`,
              employeeId: p.employeeId,
              name: p.fullName || p.name,
              department: p.department || 'Belirtilmemiş',
              position: p.position || 'İşçi',
              shift: p.shift || '08:00-18:00',
              route: route.routeName,
              stop: p.stopName || 'FABRİKA',
              address: p.address || route.routeName,
              phone: p.phone || '',
              emergencyContact: '',
              notes: `Güzergah: ${route.routeName}`,
              status: 'AKTIF',
              orderNumber: p.orderNumber,
              createdAt: new Date(),
              updatedAt: new Date()
            }));
            
            allRoutePassengers.push(...routePassengers);
          }
        } catch (error) {
          console.error(`${route.routeName} güzergahı yolcuları alınamadı:`, error);
        }
      }

      // Mevcut yolcu listesi ile güzergah yolcularını birleştir
      const combinedPassengers = [...passengers];
      
      allRoutePassengers.forEach(routePassenger => {
        const existingIndex = combinedPassengers.findIndex(p => 
          p.employeeId === routePassenger.employeeId || 
          p.name === routePassenger.name
        );
        
        if (existingIndex >= 0) {
          // Mevcut yolcuyu güncelle
          combinedPassengers[existingIndex] = {
            ...combinedPassengers[existingIndex],
            route: routePassenger.route,
            stop: routePassenger.stop,
            orderNumber: routePassenger.orderNumber,
            updatedAt: new Date()
          };
        } else {
          // Yeni yolcu ekle
          combinedPassengers.push(routePassenger);
        }
      });

      setPassengers(combinedPassengers);
      showAlert(`Senkronizasyon tamamlandı: ${combinedPassengers.length} yolcu`, 'success');
      
    } catch (error) {
      console.error('Senkronizasyon hatası:', error);
      showAlert('Senkronizasyon başarısız', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Dialog açma/kapama
  const handleOpenDialog = (passenger = null) => {
    if (passenger) {
      setSelectedPassenger(passenger);
      setPassengerForm(passenger);
    } else {
      setSelectedPassenger(null);
      setPassengerForm({
        name: '',
        department: '',
        position: '',
        shift: '',
        route: '',
        stop: '',
        address: '',
        phone: '',
        emergencyContact: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPassenger(null);
  };

  // Form input değişiklikleri
  const handleFormChange = (field, value) => {
    setPassengerForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Yolcu kaydetme
  const handleSavePassenger = async () => {
    try {
      if (selectedPassenger) {
        // Güncelleme
        const updatedPassengers = passengers.map(p => 
          p.id === selectedPassenger.id ? { ...passengerForm, id: selectedPassenger.id, updatedAt: new Date() } : p
        );
        setPassengers(updatedPassengers);
        showAlert('Yolcu bilgileri güncellendi', 'success');
      } else {
        // Yeni ekleme
        const newPassenger = {
          ...passengerForm,
          id: `new_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setPassengers([...passengers, newPassenger]);
        showAlert('Yeni yolcu eklendi', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Yolcu kaydedilirken hata:', error);
      showAlert('Kaydetme hatası', 'error');
    }
  };

  // Yolcu silme
  const handleDeletePassenger = async (passengerId) => {
    if (window.confirm('Bu yolcuyu silmek istediğinizden emin misiniz?')) {
      try {
        const filteredPassengers = passengers.filter(p => p.id !== passengerId);
        setPassengers(filteredPassengers);
        showAlert('Yolcu silindi', 'success');
      } catch (error) {
        console.error('Yolcu silinirken hata:', error);
        showAlert('Silme hatası', 'error');
      }
    }
  };

  // Filtreleme fonksiyonu
  const getFilteredPassengers = () => {
    return passengers.filter(passenger => {
      const matchesSearch = passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           passenger.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRoute = !filterRoute || passenger.route === filterRoute;
      const matchesDepartment = !filterDepartment || passenger.department === filterDepartment;
      const matchesShift = !filterShift || passenger.shift === filterShift;
      
      return matchesSearch && matchesRoute && matchesDepartment && matchesShift;
    });
  };

  // Benzersiz departmanları al
  const getUniqueDepartments = () => {
    const departments = [...new Set(passengers.map(p => p.department))];
    return departments.filter(dept => dept && dept !== 'Belirtilmemiş').sort();
  };

  // Benzersiz vardiyaları al
  const getUniqueShifts = () => {
    const shifts = [...new Set(passengers.map(p => p.shift))];
    return shifts.filter(shift => shift).sort();
  };

  // Benzersiz güzergahları al
  const getUniqueRoutes = () => {
    const routeNames = [...new Set(passengers.map(p => p.route))];
    return routeNames.filter(route => route).sort();
  };

  // Excel'e aktar fonksiyonu - TÜM YOLCULARI EXPORT ET
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      // Filtrelenmiş yolcu listesini al
      const currentPassengers = getFilteredPassengers();
      
      console.log(`📊 Excel'e aktarılacak yolcu sayısı: ${currentPassengers.length}`);
      showAlert(`Excel dosyası hazırlanıyor: ${currentPassengers.length} yolcu`, 'info');
      
      // Yolcu verilerini backend'e gönder ve Excel dosyası al
      const response = await fetch('http://localhost:5001/api/excel/passengers/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        body: JSON.stringify({ 
          passengers: currentPassengers,
          totalCount: currentPassengers.length,
          exportDate: new Date().toISOString(),
          exportedBy: 'Çanga Yolcu Listesi Sistemi'
        })
      });

      if (response.ok) {
        // Dosyayı blob olarak al
        const blob = await response.blob();
        
        // Dosya adı ve tarih oluştur - güzel format
        const currentDate = new Date();
        const dateStr = currentDate.toLocaleDateString('tr-TR').replace(/\./g, '-');
        const timeStr = currentDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace(':', '');
        const fileName = `Canga_Yolcu_Listesi_${currentPassengers.length}_Kayit_${dateStr}_${timeStr}.xlsx`;
        
        // Dosyayı indir
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        // Temizlik
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        showAlert(`Excel dosyası başarıyla indirildi: ${currentPassengers.length} yolcu`, 'success');
      } else {
        const errorData = await response.json();
        showAlert(errorData.message || 'Excel oluşturma başarısız', 'error');
      }
    } catch (error) {
      console.error('Excel export hatası:', error);
      showAlert('Excel oluşturma işlemi başarısız. Sunucu bağlantısını kontrol edin.', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Departman renkleri
  const getDepartmentColor = (department) => {
    const colors = {
      'TORNA GRUBU': '#1976d2',
      'FREZE GRUBU': '#388e3c',
      'TESTERE': '#f57c00',
      'GENEL ÇALIŞMA GRUBU': '#7b1fa2',
      'İDARİ BİRİM': '#c2185b',
      'TEKNİK OFİS': '#00796b',
      'KALİTE KONTROL': '#5d4037',
      'BAKIM VE ONARIM': '#424242',
      'STAJYERLİK': '#e64a19',
      'ÇIRAK LİSE': '#303f9f',
      'ÇALILIÖZ': '#8bc34a'
    };
    return colors[department] || '#757575';
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Yolcu listesi yükleniyor...
          </Typography>
        </Box>
      </Container>
    );
  }

  const filteredPassengers = getFilteredPassengers();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🚌 Yolcu Listesi Yönetimi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Güncel çalışan verilerine dayalı yolcu listesi - {filteredPassengers.length} kayıt
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Servis Güzergahlarından Senkronize Et">
            <Button
              variant="outlined"
              startIcon={syncing ? <CircularProgress size={16} /> : <SyncIcon />}
              onClick={syncWithServiceRoutes}
              disabled={syncing}
            >
              {syncing ? 'Senkronize Ediliyor...' : 'Senkronize Et'}
            </Button>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<UpdateIcon />}
            onClick={fetchAllData}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Yolcu
          </Button>
        </Box>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
              <Typography variant="h4" component="div">
                {filteredPassengers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Yolcu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BusIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" component="div">
                {getUniqueRoutes().length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktif Güzergah
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" component="div">
                {getUniqueDepartments().length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Departman Sayısı
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
              <Typography variant="h4" component="div">
                {passengers.filter(p => p.route !== 'KENDİ ARACI').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Servis Kullanan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtreleme */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Yolcu adı veya departman ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Güzergah</InputLabel>
                <Select
                  value={filterRoute}
                  onChange={(e) => setFilterRoute(e.target.value)}
                  label="Güzergah"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {getUniqueRoutes().map((route) => (
                    <MenuItem key={route} value={route}>
                      {route}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="Departman"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {getUniqueDepartments().map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Vardiya</InputLabel>
                <Select
                  value={filterShift}
                  onChange={(e) => setFilterShift(e.target.value)}
                  label="Vardiya"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {getUniqueShifts().map((shift) => (
                    <MenuItem key={shift} value={shift}>
                      {shift}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRoute('');
                    setFilterDepartment('');
                    setFilterShift('');
                  }}
                >
                  Temizle
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                  onClick={handleExportExcel}
                  disabled={exporting}
                >
                  {exporting ? 'Excel Hazırlanıyor...' : 'Excel'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Yolcu Listesi */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Yolcu Listesi ({filteredPassengers.length} kayıt)
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Ad Soyad</strong></TableCell>
                  <TableCell><strong>Departman</strong></TableCell>
                  <TableCell><strong>Pozisyon</strong></TableCell>
                  <TableCell><strong>Vardiya</strong></TableCell>
                  <TableCell><strong>Güzergah</strong></TableCell>
                  <TableCell><strong>Durak</strong></TableCell>
                  <TableCell><strong>Telefon</strong></TableCell>
                  <TableCell align="center"><strong>İşlemler</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPassengers.map((passenger) => (
                  <TableRow key={passenger.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1, color: '#666' }} />
                        <strong>{passenger.name}</strong>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={passenger.department}
                        size="small"
                        sx={{
                          backgroundColor: getDepartmentColor(passenger.department),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>{passenger.position}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<ScheduleIcon />}
                        label={passenger.shift}
                        variant="outlined"
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <BusIcon sx={{ mr: 1, color: '#666' }} />
                        <Typography variant="body2">
                          {passenger.route}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LocationIcon sx={{ mr: 1, color: '#f44336' }} />
                        {passenger.stop}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PhoneIcon sx={{ mr: 1, color: '#666' }} />
                        {passenger.phone || 'Belirtilmemiş'}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Düzenle">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(passenger)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          color="error"
                          onClick={() => handleDeletePassenger(passenger.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPassengers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="h6" color="textSecondary">
                        Aradığınız kriterlerde yolcu bulunamadı
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Yolcu Ekleme/Düzenleme Dialog'u */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPassenger ? '✏️ Yolcu Düzenle' : '➕ Yeni Yolcu Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ad Soyad"
                value={passengerForm.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={passengerForm.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                  label="Departman"
                >
                  {getUniqueDepartments().map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pozisyon"
                value={passengerForm.position}
                onChange={(e) => handleFormChange('position', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Vardiya</InputLabel>
                <Select
                  value={passengerForm.shift}
                  onChange={(e) => handleFormChange('shift', e.target.value)}
                  label="Vardiya"
                >
                  {getUniqueShifts().map((shift) => (
                    <MenuItem key={shift} value={shift}>
                      {shift}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Güzergah</InputLabel>
                <Select
                  value={passengerForm.route}
                  onChange={(e) => handleFormChange('route', e.target.value)}
                  label="Güzergah"
                >
                  {getUniqueRoutes().map((route) => (
                    <MenuItem key={route} value={route}>
                      {route}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Durak"
                value={passengerForm.stop}
                onChange={(e) => handleFormChange('stop', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon"
                value={passengerForm.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Acil Durum İletişim"
                value={passengerForm.emergencyContact}
                onChange={(e) => handleFormChange('emergencyContact', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                value={passengerForm.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notlar"
                value={passengerForm.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={handleSavePassenger} 
            variant="contained"
            disabled={!passengerForm.name || !passengerForm.department}
          >
            {selectedPassenger ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}

export default PassengerList;