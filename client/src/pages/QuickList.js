import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Switch,
  FormControlLabel,
  Badge,
  ButtonGroup,
  Skeleton,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction
} from '@mui/material';
import {
  Download as DownloadIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  FileDownload as FileDownloadIcon,
  Visibility as PreviewIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Group as GroupIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  DirectionsBus as BusIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

// 🎨 Şablon Konfigürasyonları - OPTİMİZE EDİLMİŞ
const TEMPLATE_CONFIGS = {
  corporate: {
    id: 'corporate',
    name: 'Kurumsal Şablon',
    description: 'Resmi belgeler için profesyonel tasarım',
    color: '#1976d2',
    accentColor: '#f5f5f5',
    fontFamily: 'Calibri',
    icon: '🏢',
    preview: '/templates/corporate-preview.png',
    recommended: true,
    gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    features: ['Logo desteği', 'Resmi başlık', 'İmza alanları', 'QR kod']
  },
  premium: {
    id: 'premium',
    name: 'Premium Şablon',
    description: 'Yönetici sunumları için özel tasarım',
    color: '#2e7d32',
    accentColor: '#e8f5e8',
    fontFamily: 'Arial',
    icon: '⭐',
    preview: '/templates/premium-preview.png',
    recommended: false,
    gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
    features: ['Premium logo', 'Grafik elementler', 'Renkli başlıklar', 'İstatistikler']
  },
  executive: {
    id: 'executive',
    name: 'Yönetici Şablonu',
    description: 'Üst düzey raporlar için lüks tasarım',
    color: '#7b1fa2',
    accentColor: '#f3e5f5',
    fontFamily: 'Times New Roman',
    icon: '👔',
    preview: '/templates/executive-preview.png',
    recommended: false,
    gradient: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
    features: ['Lüks tasarım', 'Altın detaylar', 'Executive logo', 'VIP düzen']
  }
};

// Debounce fonksiyonu - form alanları için
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Liste başlığından liste türünü tespit etme - optimize edilmiş
const getListTypeFromTitle = (title) => {
  if (!title) return 'custom';
  
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('devam') || lowerTitle.includes('imza')) return 'attendance';
  if (lowerTitle.includes('mesai') || lowerTitle.includes('fazla')) return 'overtime';
  
  return 'custom';
};

// Liste Ayarları Form Bileşeni - Memo ile optimize edildi
const ListSettingsForm = React.memo(({ listInfo, setListInfo, locations }) => {
  // Form state'leri için local state kullan
  const [localTitle, setLocalTitle] = useState(listInfo.title);
  const [localDate, setLocalDate] = useState(listInfo.date);
  const [localDescription, setLocalDescription] = useState(listInfo.description);
  const [localCustomTimeSlot, setLocalCustomTimeSlot] = useState(listInfo.customTimeSlot);
  
  // Debounce değerleri
  const debouncedTitle = useDebounce(localTitle, 300);
  const debouncedDescription = useDebounce(localDescription, 300);
  const debouncedCustomTimeSlot = useDebounce(localCustomTimeSlot, 300);
  
  // Değerler değiştiğinde parent'a bildir
  useEffect(() => {
    setListInfo(prev => ({ ...prev, title: debouncedTitle }));
  }, [debouncedTitle, setListInfo]);
  
  useEffect(() => {
    setListInfo(prev => ({ ...prev, description: debouncedDescription }));
  }, [debouncedDescription, setListInfo]);
  
  useEffect(() => {
    setListInfo(prev => ({ ...prev, customTimeSlot: debouncedCustomTimeSlot }));
  }, [debouncedCustomTimeSlot, setListInfo]);
  
  // Date ve location değişikliklerini anında uygula (debounce gerekmez)
  const handleDateChange = (e) => {
    setLocalDate(e.target.value);
    setListInfo(prev => ({ ...prev, date: e.target.value }));
  };
  
  const handleLocationChange = (e) => {
    setListInfo(prev => ({ ...prev, location: e.target.value }));
  };
  
  const handleTimeSlotChange = (e) => {
    setListInfo(prev => ({ 
      ...prev, 
      timeSlot: e.target.value,
      customTimeSlot: e.target.value === 'custom' ? prev.customTimeSlot : ''
    }));
  };
  
  return (
    <>
      <TextField
        fullWidth
        label="Liste Başlığı"
        value={localTitle}
        onChange={(e) => setLocalTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        type="date"
        label="Tarih"
        value={localDate}
        onChange={handleDateChange}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Lokasyon</InputLabel>
        <Select
          value={listInfo.location}
          onChange={handleLocationChange}
          startAdornment={<LocationIcon sx={{ mr: 1 }} />}
        >
          {locations.map(loc => (
            <MenuItem key={loc} value={loc}>{loc}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Vardiya Saati</InputLabel>
        <Select
          value={listInfo.timeSlot}
          onChange={handleTimeSlotChange}
          startAdornment={<ScheduleIcon sx={{ mr: 1 }} />}
        >
          <MenuItem value="08:00-18:00">08:00-18:00 (10 saat)</MenuItem>
          <MenuItem value="08:00-16:00">08:00-16:00 (8 saat)</MenuItem>
          <MenuItem value="16:00-24:00">16:00-24:00 (8 saat)</MenuItem>
          <MenuItem value="24:00-08:00">24:00-08:00 (8 saat)</MenuItem>
          <MenuItem value="custom">🕐 Özel Saat Belirle</MenuItem>
        </Select>
      </FormControl>

      {/* ✅ Özel Vardiya Saati Input'u */}
      {listInfo.timeSlot === 'custom' && (
        <TextField
          fullWidth
          label="Özel Vardiya Saati"
          value={localCustomTimeSlot}
          onChange={(e) => setLocalCustomTimeSlot(e.target.value)}
          placeholder="Örn: 09:00-17:30 veya Esnek Çalışma"
          sx={{ mb: 2 }}
          helperText="İstediğiniz saati yazabilirsiniz (Örn: 06:00-14:00, Esnek, Gece Vardiyası)"
        />
      )}

      <TextField
        fullWidth
        label="Açıklama (Opsiyonel)"
        value={localDescription}
        onChange={(e) => setLocalDescription(e.target.value)}
        multiline
        rows={3}
        sx={{ mb: 2 }}
      />
    </>
  );
});

// 🚀 Ana Bileşen
function QuickList() {
  // 📊 Ana State'ler
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // 🎯 Adım Kontrolü - gelecekte kullanılacak
  // const [activeStep, setActiveStep] = useState(0);
  // const [tabValue, setTabValue] = useState(0);
  
  // 🎨 Şablon ve Ayarlar
  const [selectedTemplate, setSelectedTemplate] = useState('corporate');
  const [previewDialog, setPreviewDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  
  // 📋 Liste Bilgileri
  const [listInfo, setListInfo] = useState({
    title: `İmza Listesi - ${new Date().toLocaleDateString('tr-TR')}`,
    date: new Date().toISOString().split('T')[0],
    location: 'MERKEZ ŞUBE',
    timeSlot: '08:00-18:00',
    customTimeSlot: '', // ✅ Özel vardiya saati için eklendi
    description: '',
    isOvertimeList: false,
    overtimeReason: '',
    showDepartment: true,
    showPosition: true,
    showSignature: true,
    showTime: true,
    customFields: []
  });
  
  // 🔍 Gelişmiş Filtreler
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    location: '',
    status: 'AKTIF',
    position: '',
    sortBy: 'firstName',
    sortOrder: 'asc'
  });
  
  // 📋 Liste Türleri - OPTİMİZE EDİLMİŞ
  const [listTypes] = useState([
    { id: 'attendance', name: 'Devam Listesi', icon: '📋', template: 'corporate', color: '#1976d2', description: 'Günlük devam kontrolü' },
    { id: 'overtime', name: 'Fazla Mesai Listesi', icon: '⏰', template: 'premium', color: '#ff9800', description: 'Mesai saatleri dışı çalışma' },
    { id: 'custom', name: 'Özel Liste', icon: '⚙️', template: 'executive', color: '#795548', description: 'Özelleştirilebilir liste' }
  ]);

  // 📊 İstatistikler
  const [stats, setStats] = useState({
    totalEmployees: 0,
    filteredCount: 0,
    selectedCount: 0,
    departmentCount: 0
  });

  // Optimize edilmiş state'ler
  const [bulkActions, setBulkActions] = useState({});

  const [listHistory, setListHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentTemplates, setRecentTemplates] = useState(['corporate']);
  
  // Akıllı öneriler kaldırıldı - performans iyileştirmesi
  const smartSuggestions = {
    recommendedEmployees: [],
    missingDepartments: [],
    optimalCount: 20
  };

  // 📊 Gerçek zamanlı istatistikler
  const [liveStats, setLiveStats] = useState({
    averageSelectionTime: 0,
    mostUsedTemplate: 'corporate',
    popularDepartments: [],
    peakUsageHours: []
  });

  // 🎨 Tema ve görünüm
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'compact'
  const [darkMode, setDarkMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  // Referanslar
  const [departments, setDepartments] = useState([]);
  const locations = ['MERKEZ ŞUBE', 'IŞIL ŞUBE']; // OSB ŞUBE kaldırıldı - sistemde mevcut değil

  // 🚀 Component Mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // 📊 İstatistik Güncelleme
  useEffect(() => {
    setStats({
      totalEmployees: employees.length,
      filteredCount: filteredEmployees.length,
      selectedCount: selectedEmployees.length,
      departmentCount: [...new Set(employees.map(emp => emp.department))].length
    });
  }, [employees, filteredEmployees, selectedEmployees]);

  // 🤖 Akıllı önerileri güncelle
  useEffect(() => {
    // Artık akıllı öneriler useMemo ile hesaplanıyor, bir şey yapmaya gerek yok
  }, [selectedEmployees, employees, listInfo.title]);

  // 🔄 Çalışanları Getir
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/employees?limit=500');
      const data = await response.json();
      
      if (data.success) {
        const activeEmployees = data.data || [];
        setEmployees(activeEmployees);
        setFilteredEmployees(activeEmployees);
        
        // Departmanları çıkar
        const uniqueDepartments = [...new Set(activeEmployees.map(emp => emp.department))];
        setDepartments(uniqueDepartments.sort());
        
        toast.success(`${activeEmployees.length} çalışan yüklendi`);
      }
    } catch (error) {
      console.error('Çalışan verisi alınamadı:', error);
      toast.error('Çalışan verisi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filtreleme İşlemi
  useEffect(() => {
    try {
      let filtered = employees;

      // Stajyer ve çırakları hariç tut (onlar ayrı sayfada)
      filtered = filtered.filter(emp => 
        emp.department !== 'STAJYERLİK' && emp.department !== 'ÇIRAK LİSE'
      );

      // Arama filtresi
      if (filters.search) {
        filtered = filtered.filter(emp => 
          emp.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
          emp.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
          emp.employeeId?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Diğer filtreler
      if (filters.department) {
        filtered = filtered.filter(emp => emp.department === filters.department);
      }
      if (filters.location) {
        filtered = filtered.filter(emp => emp.location === filters.location);
      }
      if (filters.status) {
        filtered = filtered.filter(emp => emp.status === filters.status);
      }
      if (filters.position) {
        filtered = filtered.filter(emp => emp.position?.includes(filters.position));
      }

      // Sıralama
      filtered.sort((a, b) => {
        const aValue = a[filters.sortBy] || '';
        const bValue = b[filters.sortBy] || '';
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        return aValue.localeCompare(bValue, 'tr') * order;
      });

      setFilteredEmployees(filtered);
    } catch (error) {
      console.error('Filtreleme hatası:', error);
      toast.error('Filtreleme sırasında hata oluştu');
    }
  }, [filters, employees]);

  // 📊 Excel Export - Profesyonel - useCallback ile optimize edildi
  const handleProfessionalDownload = useCallback(async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Lütfen en az bir çalışan seçin!');
      return;
    }

    setDownloadLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:5001/api/excel/export/quick-list-professional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employees: selectedEmployees,
          listInfo: {
            ...listInfo,
            // ✅ Özel vardiya saatini Excel'e gönder
            timeSlot: listInfo.timeSlot === 'custom' ? listInfo.customTimeSlot : listInfo.timeSlot
          },
          template: selectedTemplate
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const templateName = TEMPLATE_CONFIGS[selectedTemplate].name.replace(/\s+/g, '_');
        a.download = `${templateName}_${listInfo.location}_${listInfo.date.replace(/-/g, '')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // 📊 Analytics Event Kaydet
        const generationTime = Date.now() - startTime;
        await trackAnalyticsEvent('list_created', {
          type: getListTypeFromTitle(listInfo.title) || 'custom',
          template: selectedTemplate,
          employeeCount: selectedEmployees.length,
          location: listInfo.location,
          departments: [...new Set(selectedEmployees.map(emp => emp.department))],
          fileSize: blob.size,
          generationTime
        });
        
        toast.success('📊 Profesyonel Excel dosyası indirildi!');
      } else {
        throw new Error('Excel dosyası oluşturulamadı');
      }
    } catch (error) {
      console.error('Excel export hatası:', error);
      toast.error('Excel dosyası oluşturulamadı');
      
      // 📊 Hata Analytics
      try {
        await trackAnalyticsEvent('error_occurred', {
          errorType: 'excel_generation_failed',
          errorMessage: error.message,
          template: selectedTemplate,
          employeeCount: selectedEmployees.length
        });
      } catch (analyticsError) {
        console.warn('Analytics event gönderilemedi:', analyticsError);
      }
    } finally {
      setDownloadLoading(false);
    }
  }, [selectedEmployees, listInfo, selectedTemplate]);

  // 🚌 Servis Listesi İndir - YENİ ÖZELLİK!
  const handleServiceListDownload = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Lütfen en az bir çalışan seçin!');
      return;
    }

    setDownloadLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:5001/api/excel/export/quick-list-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employees: selectedEmployees,
          listInfo: {
            ...listInfo,
            timeSlot: listInfo.timeSlot === 'custom' ? listInfo.customTimeSlot : listInfo.timeSlot
          },
          template: selectedTemplate
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeLocation = listInfo.location.replace(/\s+/g, '_');
        const safeDate = listInfo.date.replace(/-/g, '');
        a.download = `Servis_Listesi_${safeLocation}_${safeDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // 📊 Analytics Event Kaydet
        const generationTime = Date.now() - startTime;
        await trackAnalyticsEvent('service_list_created', {
          type: 'service_schedule',
          employeeCount: selectedEmployees.length,
          location: listInfo.location,
          departments: [...new Set(selectedEmployees.map(emp => emp.department))],
          fileSize: blob.size,
          generationTime
        });
        
        toast.success('🚌 Servis listesi indirildi!');
      } else {
        throw new Error('Servis listesi oluşturulamadı');
      }
    } catch (error) {
      console.error('Servis listesi export hatası:', error);
      toast.error('Servis listesi oluşturulamadı');
      
      // 📊 Hata Analytics
      try {
        await trackAnalyticsEvent('error_occurred', {
          errorType: 'service_list_generation_failed',
          errorMessage: error.message,
          employeeCount: selectedEmployees.length
        });
      } catch (analyticsError) {
        console.warn('Analytics event gönderilemedi:', analyticsError);
      }
    } finally {
      setDownloadLoading(false);
    }
  };

  // 🖨️ İmza Listesini Yazdır - YENİ ÖZELLİK!
  const handleProfessionalPrint = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Lütfen en az bir çalışan seçin!');
      return;
    }

    setDownloadLoading(true);
    
    try {
      // HTML yazdırma görünümü için veri hazırla
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        toast.error('Popup penceresi açılamadı. Lütfen popup engelleyiciyi kontrol edin.');
        setDownloadLoading(false);
        return;
      }
      
      // Yazdırma sayfası için HTML içeriği oluştur
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Çanga İmza Listesi - ${listInfo.title}</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #1976d2;
              padding-bottom: 10px;
            }
            .print-title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
              color: #1976d2;
            }
            .print-subtitle {
              font-size: 18px;
              margin: 5px 0;
            }
            .print-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .print-info div {
              margin-right: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .signature-cell {
              width: 120px;
              height: 40px;
            }
            .time-cell {
              width: 80px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 30px;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1 class="print-title">ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ.</h1>
            <h2 class="print-subtitle">${listInfo.title}</h2>
          </div>
          
          <div class="print-info">
            <div><strong>Tarih:</strong> ${new Date(listInfo.date).toLocaleDateString('tr-TR')}</div>
            <div><strong>Lokasyon:</strong> ${listInfo.location}</div>
            <div><strong>Vardiya:</strong> ${listInfo.timeSlot === 'custom' ? listInfo.customTimeSlot : listInfo.timeSlot}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Ad Soyad</th>
                ${listInfo.showDepartment ? '<th>Departman</th>' : ''}
                <th>Giriş Saati</th>
                <th>Giriş İmza</th>
                <th>Çıkış Saati</th>
                <th>Çıkış İmza</th>
              </tr>
            </thead>
            <tbody>
              ${selectedEmployees.map((emp, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${emp.firstName || ''} ${emp.lastName || ''}</td>
                  ${listInfo.showDepartment ? `<td>${emp.department || ''}</td>` : ''}
                  <td class="time-cell"></td>
                  <td class="signature-cell"></td>
                  <td class="time-cell"></td>
                  <td class="signature-cell"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Bu belge ${new Date().toLocaleString('tr-TR')} tarihinde oluşturulmuştur.</p>
          </div>
          
          <button onclick="window.print()" style="padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 20px auto; display: block;">
            Yazdır
          </button>
          
          <script>
            // Sayfa yüklendiğinde otomatik yazdırma diyaloğu aç
            window.onload = function() {
              // Kısa bir gecikme ile yazdırma diyaloğunu aç
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `;
      
      // Yazdırma penceresine içeriği yaz
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      toast.success('🖨️ Yazdırma ekranı açılıyor!');
      
      // 📊 Analytics Event Kaydet
      await trackAnalyticsEvent('list_printed', {
        type: getListTypeFromTitle(listInfo.title) || 'custom',
        template: selectedTemplate,
        employeeCount: selectedEmployees.length,
        location: listInfo.location
      });
    } catch (error) {
      console.error('Yazdırma hatası:', error);
      toast.error('Yazdırma ekranı hazırlanamadı');
    } finally {
      setDownloadLoading(false);
    }
  };

  // 🖨️ Servis Listesini Yazdır - YENİ ÖZELLİK!
  const handleServiceListPrint = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Lütfen en az bir çalışan seçin!');
      return;
    }

    setDownloadLoading(true);
    
    try {
      // HTML yazdırma görünümü için veri hazırla
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        toast.error('Popup penceresi açılamadı. Lütfen popup engelleyiciyi kontrol edin.');
        setDownloadLoading(false);
        return;
      }
      
      // Yazdırma sayfası için HTML içeriği oluştur
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Çanga Servis Listesi - ${listInfo.title}</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #ff9800;
              padding-bottom: 10px;
            }
            .print-title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
              color: #ff9800;
            }
            .print-subtitle {
              font-size: 18px;
              margin: 5px 0;
            }
            .print-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .print-info div {
              margin-right: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #fff3e0;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 30px;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1 class="print-title">ÇANGA SAVUNMA ENDÜSTRİ LTD.ŞTİ.</h1>
            <h2 class="print-subtitle">SERVİS YOLCU LİSTESİ</h2>
          </div>
          
          <div class="print-info">
            <div><strong>Tarih:</strong> ${new Date(listInfo.date).toLocaleDateString('tr-TR')}</div>
            <div><strong>Lokasyon:</strong> ${listInfo.location}</div>
            <div><strong>Vardiya:</strong> ${listInfo.timeSlot === 'custom' ? listInfo.customTimeSlot : listInfo.timeSlot}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Ad Soyad</th>
                <th>Departman</th>
                <th>Servis Güzergahı</th>
              </tr>
            </thead>
            <tbody>
              ${selectedEmployees.map((emp, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${emp.firstName || ''} ${emp.lastName || ''}</td>
                  <td>${emp.department || ''}</td>
                  <td>${emp.serviceRoute || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Bu belge ${new Date().toLocaleString('tr-TR')} tarihinde oluşturulmuştur.</p>
          </div>
          
          <button onclick="window.print()" style="padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 20px auto; display: block;">
            Yazdır
          </button>
          
          <script>
            // Sayfa yüklendiğinde otomatik yazdırma diyaloğu aç
            window.onload = function() {
              // Kısa bir gecikme ile yazdırma diyaloğunu aç
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `;
      
      // Yazdırma penceresine içeriği yaz
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      toast.success('🚌 Servis listesi yazdırma ekranı açılıyor!');
      
      // 📊 Analytics Event Kaydet
      await trackAnalyticsEvent('service_list_printed', {
        type: 'service_schedule',
        employeeCount: selectedEmployees.length,
        location: listInfo.location
      });
    } catch (error) {
      console.error('Yazdırma hatası:', error);
      toast.error('Yazdırma ekranı hazırlanamadı');
    } finally {
      setDownloadLoading(false);
    }
  };

  // �� Şablon Değiştirme
  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    toast.success(`${TEMPLATE_CONFIGS[templateId].name} seçildi`);
    
    // 📊 Analytics Event
    trackAnalyticsEvent('template_selected', {
      template: templateId,
      templateName: TEMPLATE_CONFIGS[templateId].name
    });
  };

  // 📋 Liste Türü Değiştirme
  const handleListTypeChange = (listType) => {
    setListInfo(prev => ({
      ...prev,
      title: `${listType.name} - ${new Date().toLocaleDateString('tr-TR')}`,
      isOvertimeList: listType.id === 'overtime'
    }));
    setSelectedTemplate(listType.template);
    toast.success(`${listType.name} şablonu hazırlandı`);
    
    // 📊 Analytics Event
    trackAnalyticsEvent('list_type_selected', {
      listType: listType.id,
      listTypeName: listType.name,
      template: listType.template
    });
  };

  // 👥 Çalışan Seçim İşlemleri
  const toggleEmployeeSelection = (employee) => {
    setSelectedEmployees(prev => {
      const isSelected = prev.find(emp => emp._id === employee._id);
      const newSelection = isSelected 
        ? prev.filter(emp => emp._id !== employee._id)
        : [...prev, employee];
      
      // 📊 Analytics Event
      trackAnalyticsEvent(isSelected ? 'employee_deselected' : 'employee_selected', {
        employeeId: employee.employeeId,
        department: employee.department,
        location: employee.location,
        totalSelected: newSelection.length
      });
      
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectedEmployees(
      selectedEmployees.length === filteredEmployees.length ? [] : [...filteredEmployees]
    );
  };

  const selectByDepartment = (department) => {
    const deptEmployees = filteredEmployees.filter(emp => emp.department === department);
    setSelectedEmployees(prev => {
      const otherDeptEmployees = prev.filter(emp => emp.department !== department);
      return [...otherDeptEmployees, ...deptEmployees];
    });
  };

  // 🗑️ Temizleme İşlemleri
  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      location: '',
      status: 'AKTIF',
      position: '',
      sortBy: 'firstName',
      sortOrder: 'asc'
    });
  };

  const clearSelection = () => {
    setSelectedEmployees([]);
  };

  // 📊 Analytics Event Tracking Helper
  const trackAnalyticsEvent = async (eventType, listDetails = {}, metadata = {}) => {
    try {
      // Device info topla
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        isMobile: /Mobile|Android|iOS/.test(navigator.userAgent)
      };

      const analyticsData = {
        eventType,
        listDetails,
        userInfo: {
          // Gerçek kullanıcı bilgileri auth context'den gelecek
          department: 'İNSAN KAYNAKLARI', // Temporary
          role: 'admin', // Temporary
          location: 'MERKEZ ŞUBE' // Temporary
        },
        sessionId: sessionStorage.getItem('sessionId') || generateSessionId(),
        deviceInfo,
        performance: {
          pageLoadTime: Math.round(performance.now()),
          memoryUsage: (navigator.deviceMemory || 0) * 1024 * 1024 * 1024 // GB to bytes
        },
        metadata
      };

      await fetch('http://localhost:5001/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analyticsData)
      });
    } catch (error) {
      console.warn('Analytics event gönderilemedi:', error);
    }
  };

  // 🆔 Session ID Generator
  const generateSessionId = () => {
    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('sessionId', sessionId);
    return sessionId;
  };



  // 🚀 Component Mount - Analytics
  useEffect(() => {
    // Sayfa görüntüleme eventi
    trackAnalyticsEvent('page_view', {}, {
      page: 'quick_list',
      timestamp: new Date().toISOString()
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔍 Filtre değişimi - Analytics
  useEffect(() => {
    if (filters.search || filters.department || filters.location) {
      trackAnalyticsEvent('filter_applied', {}, {
        filters: {
          search: !!filters.search,
          department: filters.department,
          location: filters.location,
          sortBy: filters.sortBy
        },
        resultCount: filteredEmployees.length
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.department, filters.location, filters.sortBy, filteredEmployees.length]);

  // 📊 Dashboard Kartları
  const renderStatsCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4">{stats.totalEmployees}</Typography>
                <Typography variant="body2">Toplam Çalışan</Typography>
              </Box>
              <GroupIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={6} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)', color: 'white' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4">{stats.filteredCount}</Typography>
                <Typography variant="body2">Filtrelenen</Typography>
              </Box>
              <FilterIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={6} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)', color: 'white' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4">{stats.selectedCount}</Typography>
                <Typography variant="body2">Seçilen</Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={6} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)', color: 'white' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4">{stats.departmentCount}</Typography>
                <Typography variant="body2">Departman</Typography>
              </Box>
              <BusinessIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 📊 Gelişmiş İstatistik Kartları
  const renderAdvancedStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Temel İstatistikler */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ 
          background: TEMPLATE_CONFIGS[selectedTemplate].gradient,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {selectedEmployees.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Seçili Çalışan
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.7 }} />
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(selectedEmployees.length / filteredEmployees.length) * 100} 
              sx={{ 
                mt: 1, 
                bgcolor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': { bgcolor: 'rgba(255,255,255,0.8)' }
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {filteredEmployees.length} çalışandan %{Math.round((selectedEmployees.length / filteredEmployees.length) * 100) || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Departman Dağılımı */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Departmanlar</Typography>
              <BusinessIcon color="primary" />
            </Box>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {[...new Set(selectedEmployees.map(emp => emp.department))].length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {departments.length} toplam departman
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Şablon Bilgisi */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Şablon</Typography>
              <Box sx={{ fontSize: 24 }}>{TEMPLATE_CONFIGS[selectedTemplate].icon}</Box>
            </Box>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {TEMPLATE_CONFIGS[selectedTemplate].name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {TEMPLATE_CONFIGS[selectedTemplate].description}
            </Typography>
            {TEMPLATE_CONFIGS[selectedTemplate].recommended && (
              <Chip 
                label="Önerilen"
                size="small" 
                color="success" 
                sx={{ mt: 1 }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 🎨 Şablon Seçici
  const renderTemplateSelector = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon color="primary" />
          Şablon Seçimi
        </Typography>
        
        <Grid container spacing={2}>
          {Object.values(TEMPLATE_CONFIGS).map((template) => (
            <Grid item xs={12} md={4} key={template.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === template.id ? 2 : 1,
                  borderColor: selectedTemplate === template.id ? template.color : 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleTemplateChange(template.id)}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box sx={{ fontSize: 48, mb: 1 }}>{template.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                    {template.recommended && (
                      <Badge badgeContent="ÖNERİLEN" color="primary" sx={{ ml: 1 }} />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={template.fontFamily} 
                      size="small" 
                      sx={{ bgcolor: template.accentColor, mr: 1 }}
                    />
                    <Chip 
                      label="Kurumsal" 
                      size="small" 
                      color={selectedTemplate === template.id ? 'primary' : 'default'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  // 📋 Liste Türü Seçici
  const renderListTypeSelector = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileDownloadIcon color="primary" />
          Liste Türü
        </Typography>
        
        <Grid container spacing={2}>
          {listTypes.map((listType) => (
            <Grid item xs={6} md={2} key={listType.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 2
                  }
                }}
                onClick={() => handleListTypeChange(listType)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ fontSize: 32, mb: 1 }}>{listType.icon}</Box>
                  <Typography variant="body2" fontWeight="bold">
                    {listType.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  // 🔍 Gelişmiş Filtre Paneli
  const renderAdvancedFilters = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          Gelişmiş Filtreler
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="🔍 Arama"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Ad, soyad, sicil no..."
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Departman</InputLabel>
              <Select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                label="Departman"
              >
                <MenuItem value="">Tümü</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Lokasyon</InputLabel>
              <Select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                label="Lokasyon"
              >
                <MenuItem value="">Tümü</MenuItem>
                {locations.map(loc => (
                  <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sırala</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                label="Sırala"
              >
                <MenuItem value="firstName">Ada Göre</MenuItem>
                <MenuItem value="lastName">Soyada Göre</MenuItem>
                <MenuItem value="department">Departmana Göre</MenuItem>
                <MenuItem value="employeeId">Sicil Numarasına Göre</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={1}>
            <FormControl fullWidth>
              <InputLabel>Yön</InputLabel>
              <Select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                label="Yön"
              >
                <MenuItem value="asc">A-Z</MenuItem>
                <MenuItem value="desc">Z-A</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              sx={{ height: '56px' }}
            >
              Temizle
            </Button>
          </Grid>
        </Grid>
        
        {/* Hızlı Departman Seçimi */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" display="block" sx={{ mb: 1 }}>
            Departmana Göre Hızlı Seçim:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {departments.map(dept => (
              <Chip
                key={dept}
                label={dept}
                size="small"
                clickable
                onClick={() => selectByDepartment(dept)}
                color={selectedEmployees.some(emp => emp.department === dept) ? 'primary' : 'default'}
                icon={<WorkIcon />}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // 🎯 Akıllı Toplu Seçim Paneli kaldırıldı - performans iyileştirmesi
  const renderSmartSelectionPanel = () => null;

  // Bulk Actions kaldırıldı - performans iyileştirmesi
  const handleBulkSelectByDepartment = () => {}; 
  const handleRandomSelection = () => {};
  const handleSmartSelection = () => {};

  // 👥 Çalışan Listesi
  const renderEmployeeList = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Çalışan Listesi ({filteredEmployees.length})
          </Typography>
          <ButtonGroup>
            <Button
              size="small"
              variant={selectedEmployees.length === filteredEmployees.length ? 'contained' : 'outlined'}
              onClick={handleSelectAll}
            >
              {selectedEmployees.length === filteredEmployees.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={clearSelection}
              disabled={selectedEmployees.length === 0}
            >
              Temizle
            </Button>
          </ButtonGroup>
        </Box>

        {loading ? (
          <Box>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
                <Skeleton variant="rectangular" width={60} height={20} />
              </Box>
            ))}
          </Box>
        ) : filteredEmployees.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Çalışan bulunamadı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filtre kriterlerinizi değiştirip tekrar deneyin.
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {/* Optimize edilmiş render işlemi - tüm çalışanlar yerine ilk 100 tane */}
            {filteredEmployees.slice(0, 100).map((employee) => {
              const isSelected = selectedEmployees.find(emp => emp._id === employee._id);
              
              return (
                <ListItem
                  key={employee._id}
                  sx={{
                    border: 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: isSelected ? 'primary.50' : 'background.paper',
                  }}
                  onClick={() => toggleEmployeeSelection(employee)}
                >
                  <ListItemAvatar>
                    <Checkbox
                      checked={!!isSelected}
                      color="primary"
                    />
                  </ListItemAvatar>
                  
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: TEMPLATE_CONFIGS[selectedTemplate].color }}>
                      {employee.firstName?.charAt(0) || '?'}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="bold">
                        {employee.firstName} {employee.lastName}
                        <Chip 
                          label={employee.employeeId} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" component="div">
                          {employee.department} • {employee.location}
                        </Typography>
                      </>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Chip
                      label={employee.status}
                      size="small"
                      color={employee.status === 'AKTIF' ? 'success' : 'default'}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
            
            {filteredEmployees.length > 100 && (
              <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'background.paper' }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredEmployees.length - 100} çalışan daha göstermek için filtreleyin...
                </Typography>
              </Box>
            )}
          </List>
        )}
      </CardContent>
    </Card>
  );

  // Bulk Actions kaldırıldı - performans iyileştirmesi

  return (
    <Box sx={{ p: 3 }}>
      {/* 🏷️ Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontWeight: 'bold'
        }}>
          📋 Profesyonel Liste Oluşturucu
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Kurumsal imza listelerini kolayca oluşturun, özelleştirin ve profesyonel Excel formatında indirin
        </Typography>
      </Box>

      {/* 📊 İstatistik Kartları */}
      {renderStatsCards()}

      {/* 📊 Gelişmiş İstatistik Kartları */}
      {renderAdvancedStatsCards()}

      {/* 🎨 Şablon Seçici */}
      {renderTemplateSelector()}

      {/* 📋 Liste Türü Seçici */}
      {renderListTypeSelector()}

      {/* ⚙️ Ana Konfigürasyon */}
      <Grid container spacing={3}>
        {/* Sol Panel - Ayarlar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon color="primary" />
                Liste Ayarları
              </Typography>
              
              {/* Optimize edilmiş form bileşeni */}
              <ListSettingsForm 
                listInfo={listInfo} 
                setListInfo={setListInfo} 
                locations={locations} 
              />

              {/* 🎯 Hızlı Aksiyon Butonları */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleProfessionalDownload}
                  disabled={selectedEmployees.length === 0 || downloadLoading}
                  startIcon={downloadLoading ? <LinearProgress size={20} /> : <FileDownloadIcon />}
                  sx={{ mb: 1, py: 1.5 }}
                >
                  {downloadLoading ? 'Hazırlanıyor...' : `📋 İmza Listesi İndir (${selectedEmployees.length})`}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  size="medium"
                  onClick={handleProfessionalPrint}
                  disabled={selectedEmployees.length === 0 || downloadLoading}
                  startIcon={<PrintIcon />}
                  sx={{ mb: 1 }}
                >
                  🖨️ İmza Listesini Yazıcıya Aktar
                </Button>
                
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  size="large"
                  onClick={handleServiceListDownload}
                  disabled={selectedEmployees.length === 0 || downloadLoading}
                  startIcon={downloadLoading ? <LinearProgress size={20} /> : <BusIcon />}
                  sx={{ mb: 1, py: 1.5 }}
                >
                  {downloadLoading ? 'Hazırlanıyor...' : `🚌 Servis Listesi İndir (${selectedEmployees.length})`}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  size="medium"
                  onClick={handleServiceListPrint}
                  disabled={selectedEmployees.length === 0 || downloadLoading}
                  startIcon={<PrintIcon />}
                  sx={{ mb: 1 }}
                >
                  🖨️ Servis Listesini Yazıcıya Aktar
                </Button>
                
                <ButtonGroup fullWidth>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => setPreviewDialog(true)}
                    disabled={selectedEmployees.length === 0}
                  >
                    Önizle
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setSettingsDialog(true)}
                  >
                    Ayarlar
                  </Button>
                </ButtonGroup>
              </Box>
            </CardContent>
          </Card>

          {/* 📊 Seçim Özeti */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" />
                Seçim Özeti
              </Typography>
              
              <Typography variant="body1" paragraph>
                <strong>{selectedEmployees.length}</strong> çalışan seçili
              </Typography>
              
              {selectedEmployees.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Seçilen Departmanlar:
                  </Typography>
                  {[...new Set(selectedEmployees.map(emp => emp.department))].map(dept => (
                    <Chip 
                      key={dept} 
                      label={dept} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }}
                      color="primary" 
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Seçilen şablon: <strong>{TEMPLATE_CONFIGS[selectedTemplate].name}</strong>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Sağ Panel - Filtreler ve Liste */}
        <Grid item xs={12} md={8}>
          {renderAdvancedFilters()}
          {renderEmployeeList()}
        </Grid>
      </Grid>

      {/* 🚀 Speed Dial - Hızlı Aksiyon Menüsü */}
      <SpeedDial
        ariaLabel="Hızlı İşlemler"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        disabled={downloadLoading}
      >
        <SpeedDialAction
          icon={<DownloadIcon />}
          tooltipTitle="İmza Listesi İndir"
          onClick={handleProfessionalDownload}
          disabled={selectedEmployees.length === 0}
        />
        <SpeedDialAction
          icon={<BusIcon />}
          tooltipTitle="Servis Listesi İndir"
          onClick={handleServiceListDownload}
          disabled={selectedEmployees.length === 0}
        />
        <SpeedDialAction
          icon={<PreviewIcon />}
          tooltipTitle="Önizle"
          onClick={() => setPreviewDialog(true)}
          disabled={selectedEmployees.length === 0}
        />
        <SpeedDialAction
          icon={<PrintIcon />}
          tooltipTitle="Yazdır"
          onClick={handleProfessionalPrint}
          disabled={selectedEmployees.length === 0}
        />
        <SpeedDialAction
          icon={<ShareIcon />}
          tooltipTitle="Paylaş"
          onClick={() => toast.info('Paylaşma özelliği yakında!')}
        />
      </SpeedDial>

      {/* 👁️ Önizleme Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>📋 Liste Önizlemesi</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {TEMPLATE_CONFIGS[selectedTemplate].name} kullanılarak {selectedEmployees.length} çalışan için liste oluşturulacak
          </Alert>
          
          <Typography variant="body2" paragraph>
            <strong>Başlık:</strong> {listInfo.title}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Tarih:</strong> {new Date(listInfo.date).toLocaleDateString('tr-TR')}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Lokasyon:</strong> {listInfo.location}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Vardiya:</strong> {listInfo.timeSlot === 'custom' ? listInfo.customTimeSlot : listInfo.timeSlot}
          </Typography>
          
          {/* Seçilen çalışanların önizlemesi */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Seçilen Çalışanlar:</Typography>
          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
            {selectedEmployees.slice(0, 10).map((emp, index) => (
              <Typography key={emp._id} variant="body2">
                {index + 1}. {emp.firstName} {emp.lastName} - {emp.department}
              </Typography>
            ))}
            {selectedEmployees.length > 10 && (
              <Typography variant="body2" color="text.secondary">
                ... ve {selectedEmployees.length - 10} çalışan daha
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Kapat</Button>
          <Button variant="contained" onClick={handleProfessionalDownload} startIcon={<DownloadIcon />}>
            Excel İndir
          </Button>
          <Button variant="outlined" color="primary" onClick={handleProfessionalPrint} startIcon={<PrintIcon />}>
            Yazıcıya Aktar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ⚙️ Ayarlar Dialog */}
      <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚙️ Gelişmiş Ayarlar</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Görünüm Ayarları:</Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={listInfo.showDepartment}
                onChange={(e) => setListInfo(prev => ({ ...prev, showDepartment: e.target.checked }))}
              />
            }
            label="Departman Bilgisi Göster"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={listInfo.showPosition}
                onChange={(e) => setListInfo(prev => ({ ...prev, showPosition: e.target.checked }))}
              />
            }
            label="Pozisyon Bilgisi Göster"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={listInfo.showSignature}
                onChange={(e) => setListInfo(prev => ({ ...prev, showSignature: e.target.checked }))}
              />
            }
            label="İmza Alanı Göster"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={listInfo.showTime}
                onChange={(e) => setListInfo(prev => ({ ...prev, showTime: e.target.checked }))}
              />
            }
            label="Giriş/Çıkış Saati Göster"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Kapat</Button>
          <Button variant="contained" onClick={() => setSettingsDialog(false)}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default QuickList; 