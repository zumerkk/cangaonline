import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Checkbox
} from '@mui/material';
import {
  Save as SaveIcon,
  Remove as RemoveIcon,
  PersonAdd as PersonAddIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  DragIndicator as DragIcon,
  Print as PrintIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// 🍽️ Yemek molası hesaplama fonksiyonu - FRONTEND
const calculateWorkingHours = (timeSlot) => {
  if (!timeSlot || typeof timeSlot !== 'string') return 8; // Varsayılan 8 saat
  
  // Saat aralığından başlangıç ve bitiş saatlerini çıkar
  const [startTime, endTime] = timeSlot.split('-');
  if (!startTime || !endTime) return 8;
  
  // Saat:dakika formatını parse et
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes || 0) / 60;
  };
  
  const startHour = parseTime(startTime);
  let endHour = parseTime(endTime);
  
  // Gece vardiyası için (24:00 veya 00:00 geçen saatler)
  if (endHour <= startHour) {
    endHour += 24;
  }
  
  // Brüt çalışma saati
  const grossHours = endHour - startHour;
  
  // 🍽️ Yemek molası hesaplama kuralları
  // 08:00-18:00 (10 saat) -> 1 saat yemek molası düş = 9 saat
  // Diğer tüm vardiyalar -> 30 dk (0.5 saat) yemek molası düş
  if (timeSlot === '08:00-18:00') {
    return grossHours - 1; // 10 - 1 = 9 saat
  } else {
    // Diğer tüm vardiyalar için 30 dk düş
    return grossHours - 0.5; // Örnek: 8 - 0.5 = 7.5 saat
  }
};

// 🍽️ Yemek molası açıklama fonksiyonu  
const getWorkingHoursDescription = (timeSlot) => {
  if (!timeSlot) return '';
  
  const workingHours = calculateWorkingHours(timeSlot);
  const grossHours = timeSlot === '08:00-18:00' ? 10 : 
                     timeSlot === '08:00-16:00' ? 8 :
                     timeSlot === '16:00-24:00' ? 8 : 8;
  
  if (timeSlot === '08:00-18:00') {
    return `${grossHours} saat (1 saat yemek molası düşüldü) = ${workingHours} saat çalışma`;
  } else {
    return `${grossHours} saat (30 dk yemek molası düşüldü) = ${workingHours} saat çalışma`;
  }
};

function CreateShift() {
  const navigate = useNavigate();
  
  // Departmanları useMemo ile optimize et 🚀
  // Veritabanındaki gerçek departman isimlerine göre güncellendi
  const departmentsByLocation = useMemo(() => ({
    'MERKEZ ŞUBE': [
      'MERKEZ FABRİKA',
      'İDARİ BİRİM',
      'TEKNİK OFİS',
      'ÖZEL GÜVENLİK',
      'BAKIM VE ONARIM'
    ],
    'IŞIL ŞUBE': [
      'IŞIL FABRİKA',
      'ÜRETİM',
      'MONTAJ',
      'KAYNAK',
      'BOYAHANE',
      'KALİTE KONTROL'
    ]
    // OSB ŞUBE kaldırıldı - sistemde mevcut değil
  }), []);

  // Vardiya Şablonları - Gerçek departman isimleriyle güncellendi
  const shiftTemplates = useMemo(() => ({
    'MERKEZ ŞUBE': {
      'Standart Haftalık Vardiya': {
        description: 'Tüm departmanlar için standart vardiya düzeni',
        groups: [
          {
            groupName: 'MERKEZ FABRİKA',
            shifts: [
              { timeSlot: '08:00-18:00', employees: [] },
              { timeSlot: '08:00-16:00', employees: [] },
              { timeSlot: '16:00-24:00', employees: [] }
            ]
          },
          {
            groupName: 'İDARİ BİRİM',
            shifts: [{ timeSlot: '08:00-18:00', employees: [] }]
          },
          {
            groupName: 'TEKNİK OFİS',
            shifts: [{ timeSlot: '08:00-18:00', employees: [] }]
          },
          {
            groupName: 'BAKIM VE ONARIM',
            shifts: [{ timeSlot: '08:00-18:00', employees: [] }]
          }
        ],
        specialGroups: [
          { groupType: 'ÖZEL GÜVENLİK', timeSlot: '08:00-18:00', employees: [] }
        ]
      },
      'Sadece Gündüz Vardiyası': {
        description: 'Tüm departmanlar sadece gündüz mesaisi',
        groups: [
          { groupName: 'MERKEZ FABRİKA', shifts: [{ timeSlot: '08:00-18:00', employees: [] }] },
          { groupName: 'İDARİ BİRİM', shifts: [{ timeSlot: '08:00-18:00', employees: [] }] },
          { groupName: 'TEKNİK OFİS', shifts: [{ timeSlot: '08:00-18:00', employees: [] }] },
          { groupName: 'BAKIM VE ONARIM', shifts: [{ timeSlot: '08:00-18:00', employees: [] }] }
        ]
      }
    },
    'IŞIL ŞUBE': {
      'Standart İşil Vardiyası': {
        description: 'İşil şube için tam detaylı vardiya düzeni',
        groups: [
          { 
            groupName: 'IŞIL FABRİKA', 
            shifts: [
              { timeSlot: '08:00-18:00', employees: [] },
              { timeSlot: '08:00-16:00', employees: [] }
            ] 
          },
          { groupName: 'ÜRETİM', shifts: [{ timeSlot: '08:00-18:00', employees: [] }] },
          { groupName: 'MONTAJ', shifts: [{ timeSlot: '08:00-18:00', employees: [] }] },
          { groupName: 'KAYNAK', shifts: [{ timeSlot: '08:00-18:00', employees: [] }] },
          { groupName: 'BOYAHANE', shifts: [{ timeSlot: '08:00-18:00', employees: [] }] },
          { groupName: 'KALİTE KONTROL', shifts: [{ timeSlot: '08:00-18:00', employees: [] }] }
        ]
      }
    }
    // OSB ŞUBE şablonları kaldırıldı - sistemde mevcut değil
  }), []);

  // State'ler - Güvenli başlatma
  const [activeStep, setActiveStep] = useState(0);
  const [shiftData, setShiftData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    location: 'MERKEZ ŞUBE',
    description: '',
    shiftGroups: [],
    specialGroups: [],
    generalManager: { name: 'BİLAL CEVİZOĞLU', title: 'FABRİKA GENEL SORUMLUSU' },
    departmentManager: { name: 'MURAT ÇAVDAR', title: 'BÖLÜM SORUMLUSU' },
    supervisor: { name: 'MURAT SEPETÇİ', title: 'USTABAŞI' }
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filteredDepartments, setFilteredDepartments] = useState([]); // Lokasyona göre filtrelenmiş departmanlar
  const [createdShift, setCreatedShift] = useState(null);
  const [saveDialog, setSaveDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(''); // Seçilen şablon
  
  // Yeni grup ekleme için state'ler
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTimeSlot, setNewGroupTimeSlot] = useState('08:00-18:00');
  const [customTimeSlot, setCustomTimeSlot] = useState('');
  
  // Vardiya kopyalama için state'ler - YENİ ÖZELLİK
  const [copyShiftDialog, setCopyShiftDialog] = useState(false);
  const [copyShiftData, setCopyShiftData] = useState({
    shiftId: '',
    newTitle: '',
    newStartDate: '',
    newEndDate: ''
  });
  const [availableShifts, setAvailableShifts] = useState([]);

  // Adımlar
  const steps = ['Temel Bilgiler', 'Çalışan Seçimi', 'Vardiya Düzenleme', 'Kaydet & Çıktı'];

  // Component mount
  useEffect(() => {
    fetchEmployees();
    fetchAvailableShifts(); // YENİ: Mevcut vardiyaları getir
  }, []);

  // Lokasyon değiştiğinde yöneticileri güncelle
  useEffect(() => {
    const newManagers = {
      'MERKEZ ŞUBE': {
        generalManager: { name: 'BİLAL CEVİZOĞLU', title: 'FABRİKA GENEL SORUMLUSU' },
        departmentManager: { name: 'MURAT ÇAVDAR', title: 'BÖLÜM SORUMLUSU' },
        supervisor: { name: 'MURAT SEPETÇİ', title: 'USTABAŞI' }
      },
      'IŞIL ŞUBE': {
        generalManager: { name: 'BATUHAN İLHAN', title: 'FABRİKA GENEL SORUMLUSU' },
        departmentManager: { name: 'BATUHAN İLHAN', title: 'BÖLÜM SORUMLUSU' },
        supervisor: { name: 'ALİ ŞİŞ YORULMAZ', title: 'USTABAŞI' }
      }
    };

    const managers = newManagers[shiftData.location] || newManagers['MERKEZ ŞUBE'];
    setShiftData(prev => ({
      ...prev,
      generalManager: managers.generalManager,
      departmentManager: managers.departmentManager,
      supervisor: managers.supervisor
    }));

    // Lokasyon değiştiğinde departmanları filtrele
    if (shiftData.location && departmentsByLocation[shiftData.location]) {
      setFilteredDepartments(departmentsByLocation[shiftData.location]);
    } else {
      setFilteredDepartments([]);
    }
  }, [shiftData.location, departmentsByLocation]);

  // Lokasyon mapping fonksiyonları
  const frontendToBackendLocation = (location) => {
    switch (location) {
      case 'MERKEZ ŞUBE': return 'MERKEZ';
      case 'IŞIL ŞUBE': return 'İŞL';
      case 'OSB ŞUBE': return 'OSB';
      default: return location;
    }
  };

  const backendToFrontendLocation = (location) => {
    switch (location) {
      case 'MERKEZ': return 'MERKEZ ŞUBE';
      case 'İŞL': return 'IŞIL ŞUBE';
      case 'OSB': return 'OSB ŞUBE';
      default: return location;
    }
  };
  
  // Mevcut vardiyaları getir - YENİ ÖZELLİK
  const fetchAvailableShifts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/shifts?limit=10');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setAvailableShifts(data.data);
      }
    } catch (error) {
      console.error('❌ Vardiya listesi hatası:', error.message);
      // Hata durumunda boş liste
      setAvailableShifts([]);
    }
  };
  
  // Vardiya kopyalama - YENİ ÖZELLİK
  const handleCopyShift = async () => {
    if (!copyShiftData.shiftId) {
      setSnackbar({
        open: true,
        message: 'Lütfen kopyalanacak bir vardiya seçin',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/shifts/${copyShiftData.shiftId}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newStartDate: copyShiftData.newStartDate || new Date().toISOString().split('T')[0],
          newEndDate: copyShiftData.newEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          title: copyShiftData.newTitle || undefined,
          createdBy: 'User'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Kopyalanan vardiyayı mevcut state'e yükle
        setShiftData(result.data);
        setCreatedShift(result.data);
        
        // Dialog'u kapat
        setCopyShiftDialog(false);
        
        // Başarılı mesajı göster
        setSnackbar({
          open: true,
          message: 'Vardiya başarıyla kopyalandı ve düzenleme için yüklendi',
          severity: 'success'
        });
        
        // Düzenleme adımına git
        setActiveStep(2);
      } else {
        setSnackbar({
          open: true,
          message: `Vardiya kopyalanamadı: ${result.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('❌ Vardiya kopyalama hatası:', error);
      setSnackbar({
        open: true,
        message: 'Vardiya kopyalama sırasında bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Çalışanları getir
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/employees?limit=200');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        const mappedEmployees = (data.data || []).map(emp => {
          // İsim ayrıştırma
          const fullName = emp.adSoyad || '';
          const nameParts = fullName.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          // Lokasyon normalizasyonu
          const backendLocation = emp.lokasyon || emp.location || '';
          const displayLocation = backendToFrontendLocation(backendLocation);
          
          return {
            ...emp,
            firstName: firstName,
            lastName: lastName,
            department: emp.departman || emp.department || '',
            location: backendLocation,
            status: emp.durum || emp.status || 'AKTIF',
            displayLocation: displayLocation
          };
        });
        
        // Çalışanlar yüklendi - debug mesajı kaldırıldı
        
        setEmployees(mappedEmployees);
      } else {
        throw new Error('Backend\'den veri alınamadı veya boş veri geldi');
      }
    } catch (error) {
      console.error('❌ API bağlantı hatası:', error.message);
      
      // Backend bağlantısı yoksa demo veri kullan
      const demoEmployees = [
        {
          _id: 'demo1',
          adSoyad: 'Demo Çalışan 1',
          firstName: 'Demo',
          lastName: 'Çalışan 1',
          department: 'MERKEZ FABRİKA',
          departman: 'MERKEZ FABRİKA',
          lokasyon: 'MERKEZ',
          location: 'MERKEZ',
          displayLocation: 'MERKEZ ŞUBE',
          status: 'AKTIF',
          durum: 'AKTIF'
        },
        {
          _id: 'demo2',
          adSoyad: 'Demo Çalışan 2',
          firstName: 'Demo',
          lastName: 'Çalışan 2',
          department: 'İDARİ BİRİM',
          departman: 'İDARİ BİRİM',
          lokasyon: 'MERKEZ',
          location: 'MERKEZ',
          displayLocation: 'MERKEZ ŞUBE',
          status: 'AKTIF',
          durum: 'AKTIF'
        }
      ];
      
      // Backend bağlantısı yok, demo veriler kullanılıyor
      setEmployees(demoEmployees);
      
      setSnackbar({
        open: true,
        message: 'Backend bağlantısı yok! Demo verilerle çalışılıyor.',
        severity: 'warning'
      });
    }
  };

  // Form değişiklikleri - Güvenli değer kontrolü
  const handleFormChange = (field, value) => {
    // Null ve undefined değerleri güvenli hale getir
    const safeValue = value === null || value === undefined ? '' : value;
    
    setShiftData(prev => ({
      ...prev,
      [field]: safeValue
    }));
  };

  // 🔄 Benzersiz ID üretici - Component seviyesinde memoized - EN BAŞTA!
  const generateUniqueId = useCallback((prefix = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Şablon uygulama fonksiyonu - useCallback ile optimize edildi
  const applyTemplate = useCallback((templateName) => {
    const locationTemplates = shiftTemplates[shiftData.location];
    if (!locationTemplates || !locationTemplates[templateName]) return;
    
    const template = locationTemplates[templateName];
    
    // Akıllı çalışan atama sistemi
    const autoAssignEmployees = (groupName, timeSlot) => {
      const locationFilteredEmployees = employees.filter(emp => 
        emp.status === 'AKTIF' && emp.displayLocation === shiftData.location
      );
      
      // Önce aynı departmandan çalışanları al - akıllı eşleştirme
      const departmentEmployees = locationFilteredEmployees.filter(emp => {
        const empDept = emp.department || emp.departman || '';
        
        // Tam eşleşme
        if (empDept === groupName) return true;
        
        // Kısmi eşleşme
        if (empDept.includes(groupName) || groupName.includes(empDept)) return true;
        
        // Anahtar kelime eşleşmesi
        const groupLower = groupName.toLowerCase();
        const deptLower = empDept.toLowerCase();
        
        if (groupLower.includes('merkez') && deptLower.includes('merkez')) return true;
        if (groupLower.includes('işil') && deptLower.includes('işil')) return true;
        if (groupLower.includes('fabrika') && deptLower.includes('fabrika')) return true;
        
        return false;
      });
      
      // Eğer departmanda çalışan yoksa, lokasyondaki tüm çalışanlardan al
      const availableEmployees = departmentEmployees.length > 0 
        ? departmentEmployees 
        : locationFilteredEmployees;
      
      // Her vardiyaya 2-4 çalışan ata
      const employeeCount = Math.min(
        Math.max(2, Math.floor(availableEmployees.length / 3)), 
        4
      );
      
      return availableEmployees
        .slice(0, employeeCount)
        .map(emp => {
          // 🔧 GELİŞTİRİLMİŞ İSİM ÇÖZÜMLEME - Şablon
          let employeeName = '';
          if (emp.adSoyad && emp.adSoyad.trim() !== '') {
            employeeName = emp.adSoyad.trim();
          } else if (emp.fullName && emp.fullName.trim() !== '') {
            employeeName = emp.fullName.trim();
          } else if (emp.firstName || emp.lastName) {
            const combinedName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
            employeeName = combinedName !== '' ? combinedName : 'İsimsiz Çalışan';
          } else {
            employeeName = `Çalışan_${emp._id?.slice(-4) || 'XXXX'}`;
          }
          
          return {
            employeeId: emp._id,
            name: employeeName,
            originalDepartment: emp.department || emp.departman,
            status: 'PLANLANDI'
          };
        });
    };
    
        // Şablondaki grupları ve vardiyaları uygula - GÜVENLI VERSİYON
    setShiftData(prev => ({
      ...prev,
      shiftGroups: template.groups.map((group, groupIndex) => ({
        id: generateUniqueId('group'),
        groupName: group.groupName,
        shifts: group.shifts.map((shift, shiftIndex) => ({
          id: generateUniqueId('shift'),
          timeSlot: shift.timeSlot,
          employees: autoAssignEmployees(group.groupName, shift.timeSlot)
        }))
      })),
      specialGroups: template.specialGroups ? template.specialGroups.map((sg, sgIndex) => ({
        id: generateUniqueId('special'),
        groupType: sg.groupType,
        timeSlot: sg.timeSlot,
        employees: []
      })) : []
    }));

    setSelectedTemplate(templateName);
    setActiveStep(2); // Düzenleme adımına geç
    
    setSnackbar({
      open: true,
      message: `"${templateName}" şablonu başarıyla uygulandı! Çalışanlar otomatik olarak atandı.`,
      severity: 'success'
    });
  }, [generateUniqueId, shiftTemplates, shiftData.location, employees]); // useCallback dependencies



  // Manuel vardiya oluştur - GÜVENLI VERSİYON - useCallback ile optimize edildi
  const handleManualCreate = useCallback(() => {
    // Lokasyona uygun departmanlara göre boş gruplar oluştur
    const newGroups = filteredDepartments.map((dept, deptIndex) => {
      // Fabrika departmanları için çoklu vardiya
      if (dept.includes('FABRİKA')) {
        return {
          id: generateUniqueId('group'),
          groupName: dept,
          shifts: [
            { id: generateUniqueId('shift'), timeSlot: '08:00-18:00', employees: [] },
            { id: generateUniqueId('shift'), timeSlot: '08:00-16:00', employees: [] },
            { id: generateUniqueId('shift'), timeSlot: '16:00-24:00', employees: [] }
          ]
        };
      }
      
      // Diğer departmanlar için tek vardiya
      return {
        id: generateUniqueId('group'),
        groupName: dept,
        shifts: [
          { id: generateUniqueId('shift'), timeSlot: '08:00-18:00', employees: [] }
        ]
      };
    });

    setShiftData(prev => ({
      ...prev,
      shiftGroups: newGroups
    }));
    setActiveStep(2);
  }, [generateUniqueId, filteredDepartments]); // useCallback dependencies

  // Çalışan ekle
  const addEmployeeToShift = (groupIndex, shiftIndex, employee) => {
    const newShiftData = { ...shiftData };
    
    // Ensure shiftGroups exists and has the required group
    if (!newShiftData.shiftGroups || !newShiftData.shiftGroups[groupIndex]) {
      console.error('ShiftGroups not properly initialized');
      return;
    }
    
    const groupName = newShiftData.shiftGroups[groupIndex].groupName;
    
    // Farklı departmandan ekleme kontrolü - daha esnek yaklaşım
    const empDept = employee.department || employee.departman || '';
    if (empDept !== groupName && !empDept.includes(groupName) && !groupName.includes(empDept)) {
      // Sadece bilgilendirme mesajı - engellemez
      setSnackbar({
        open: true,
        message: `${employee.firstName || employee.adSoyad} farklı bir departmandan (${empDept}) ${groupName} bölümüne eklendi.`,
        severity: 'info'
      });
    }
    
    // 🔧 GELİŞTİRİLMİŞ İSİM ÇÖZÜMLEME
    let employeeName = '';
    if (employee.adSoyad && employee.adSoyad.trim() !== '') {
      employeeName = employee.adSoyad.trim();
    } else if (employee.fullName && employee.fullName.trim() !== '') {
      employeeName = employee.fullName.trim();
    } else if (employee.firstName || employee.lastName) {
      const combinedName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
      employeeName = combinedName !== '' ? combinedName : 'İsimsiz Çalışan';
    } else {
      employeeName = `Çalışan_${employee._id?.slice(-4) || 'XXXX'}`;
    }
    
    // Frontend çalışan ekleniyor - debug mesajı kaldırıldı

    const employeeData = {
      employeeId: employee._id,
      name: employeeName,
      originalDepartment: employee.department || employee.departman || '', // Orijinal departmanı sakla
      status: 'PLANLANDI'
    };

    if (!newShiftData.shiftGroups[groupIndex].shifts[shiftIndex].employees) {
      newShiftData.shiftGroups[groupIndex].shifts[shiftIndex].employees = [];
    }

    // Duplicate kontrolü
    const existingEmployee = newShiftData.shiftGroups[groupIndex].shifts[shiftIndex].employees.find(
      emp => emp.employeeId === employee._id
    );
    
    if (existingEmployee) {
      setSnackbar({
        open: true,
        message: `${employeeName} zaten bu vardiyaya eklenmiş!`,
        severity: 'warning'
      });
      return;
    }

    // Çakışma kontrolü - YENİ ÖZELLİK
    checkEmployeeConflicts(
      employee._id, 
      newShiftData.shiftGroups[groupIndex].shifts[shiftIndex].timeSlot,
      newShiftData.startDate,
      createdShift?._id
    ).then(result => {
      if (result.hasConflicts) {
        // Çakışma var, kullanıcıya sor
        const conflictInfo = result.conflicts.map(c => 
          `• ${c.shiftTitle} (${new Date(c.date).toLocaleDateString('tr-TR')}) - ${c.timeSlot}`
        ).join('\n');
        
        if (window.confirm(
          `⚠️ ÇAKIŞMA TESPİT EDİLDİ!\n\n${employeeName} çalışanı aynı tarihte başka vardiyalarda da çalışıyor:\n\n${conflictInfo}\n\nYine de eklemek istiyor musunuz?`
        )) {
          // Kullanıcı onayladı, çalışanı ekle
          newShiftData.shiftGroups[groupIndex].shifts[shiftIndex].employees.push(employeeData);
          setShiftData(newShiftData);
          
          setSnackbar({
            open: true,
            message: `${employeeName} çalışanı çakışma uyarısına rağmen eklendi!`,
            severity: 'warning'
          });
        } else {
          // Kullanıcı iptal etti
          setSnackbar({
            open: true,
            message: 'Çalışan ekleme iptal edildi',
            severity: 'info'
          });
        }
      } else {
        // Çakışma yok, normal ekle
        newShiftData.shiftGroups[groupIndex].shifts[shiftIndex].employees.push(employeeData);
        setShiftData(newShiftData);
      }
    }).catch(error => {
      console.error('Çakışma kontrolü hatası:', error);
      // Hata durumunda çakışma kontrolünü atla ve ekle
      newShiftData.shiftGroups[groupIndex].shifts[shiftIndex].employees.push(employeeData);
      setShiftData(newShiftData);
      
      setSnackbar({
        open: true,
        message: 'Çakışma kontrolü yapılamadı, çalışan eklendi',
        severity: 'warning'
      });
    });
  };

  // Çalışan çakışma kontrolü - YENİ ÖZELLİK
  const checkEmployeeConflicts = async (employeeId, timeSlot, date, excludeShiftId = null) => {
    try {
      const response = await fetch('http://localhost:5001/api/shifts/check-conflicts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId,
          timeSlot,
          date,
          excludeShiftId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Çakışma kontrolü API hatası:', error);
      // API hatası durumunda boş sonuç döndür
      return { success: false, hasConflicts: false, conflicts: [] };
    }
  };

  // Çalışan çıkar
  const removeEmployeeFromShift = (groupIndex, shiftIndex, empIndex) => {
    const newShiftData = { ...shiftData };
    
    // Ensure shiftGroups exists and has the required group
    if (!newShiftData.shiftGroups || !newShiftData.shiftGroups[groupIndex]) {
      console.error('ShiftGroups not properly initialized');
      return;
    }
    
    if (!newShiftData.shiftGroups[groupIndex].shifts[shiftIndex].employees) {
      return;
    }
    
    newShiftData.shiftGroups[groupIndex].shifts[shiftIndex].employees.splice(empIndex, 1);
    setShiftData(newShiftData);
  };
  
  // 🔄 Sürükle-Bırak işlevi - GÜVENLİ VERSİYON - useCallback ile optimize edildi
  const handleDragEnd = useCallback((result) => {
    const { source, destination } = result;
    
    console.log('🔄 Drag end triggered:', { source, destination, loading });

    // 🔒 Temel validasyon kontrolleri
    if (!destination || !source) {
      console.log('❌ Sürükle-bırak iptal: Kaynak/hedef bilgisi eksik');
      return;
    }

    // Aynı pozisyona bırakılma kontrolü
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      console.log('❌ Sürükle-bırak iptal: Aynı pozisyon');
      return;
    }

    // Loading durumu kontrolü
    if (loading) {
      console.log('❌ Sürükle-bırak iptal: Loading durumu');
      setSnackbar({
        open: true,
        message: 'İşlem devam ediyor, lütfen bekleyin...',
        severity: 'warning'
      });
      return;
    }

    // State validasyonu
    if (!shiftData?.shiftGroups || !Array.isArray(shiftData.shiftGroups)) {
      console.error('❌ ShiftData.shiftGroups bulunamadı');
      setSnackbar({
        open: true,
        message: 'Vardiya verileri bulunamadı. Lütfen sayfayı yenileyin.',
        severity: 'error'
      });
      return;
    }
    
    try {
      // 🔍 DroppableId parsing - SÜPER GÜVENLİ INDEX-BASED VERSİYON
      const parseDroppableId = (droppableId) => {
        // Format: "group-{groupIndex}-shift-{shiftIndex}"
        const parts = droppableId.split('-');
        if (parts.length < 4) {
          throw new Error(`Geçersiz droppableId formatı: ${droppableId}`);
        }
        
        const groupIndex = parseInt(parts[1]);
        const shiftIndex = parseInt(parts[3]);
        
        // Geçerlilik kontrolü
        if (isNaN(groupIndex) || isNaN(shiftIndex)) {
          throw new Error(`Geçersiz index'ler: ${groupIndex}, ${shiftIndex}`);
        }
        
        if (groupIndex < 0 || groupIndex >= shiftData.shiftGroups.length) {
          throw new Error(`Grup index sınır dışı: ${groupIndex}`);
        }
        
        const targetGroup = shiftData.shiftGroups[groupIndex];
        if (!targetGroup?.shifts || shiftIndex < 0 || shiftIndex >= targetGroup.shifts.length) {
          throw new Error(`Vardiya index sınır dışı: ${shiftIndex}`);
        }
        
        return { groupIndex, shiftIndex };
      };

      // Kaynak ve hedef pozisyonları parse et
      const sourcePos = parseDroppableId(source.droppableId);
      const destPos = parseDroppableId(destination.droppableId);
      
      console.log('📍 Pozisyonlar:', { sourcePos, destPos });

      // Geçerlilik kontrolleri
      const sourceGroup = shiftData.shiftGroups[sourcePos.groupIndex];
      const destGroup = shiftData.shiftGroups[destPos.groupIndex];
      
      if (!sourceGroup?.shifts?.[sourcePos.shiftIndex] || !destGroup?.shifts?.[destPos.shiftIndex]) {
        throw new Error('Kaynak veya hedef vardiya bulunamadı');
      }

      const sourceShift = sourceGroup.shifts[sourcePos.shiftIndex];
      const destShift = destGroup.shifts[destPos.shiftIndex];
      
      // Employees array kontrolü
      const sourceEmployees = Array.isArray(sourceShift.employees) ? sourceShift.employees : [];
      const destEmployees = Array.isArray(destShift.employees) ? destShift.employees : [];
      
      if (source.index >= sourceEmployees.length || source.index < 0) {
        throw new Error(`Geçersiz kaynak indeksi: ${source.index}`);
      }

      if (destination.index < 0) {
        throw new Error(`Geçersiz hedef indeksi: ${destination.index}`);
      }

      // 🔄 State güncellemesi - Deep copy ile güvenli
      const newShiftData = JSON.parse(JSON.stringify(shiftData));
      
      // Kaynak çalışanı al
      const movedEmployee = newShiftData.shiftGroups[sourcePos.groupIndex]
        .shifts[sourcePos.shiftIndex].employees.splice(source.index, 1)[0];
      
      if (!movedEmployee) {
        throw new Error('Taşınacak çalışan bulunamadı');
      }

      // Hedef vardiyada employees array kontrolü
      if (!Array.isArray(newShiftData.shiftGroups[destPos.groupIndex].shifts[destPos.shiftIndex].employees)) {
        newShiftData.shiftGroups[destPos.groupIndex].shifts[destPos.shiftIndex].employees = [];
      }
      
      // Hedef pozisyonu sınırla
      const maxDestIndex = newShiftData.shiftGroups[destPos.groupIndex].shifts[destPos.shiftIndex].employees.length;
      const safeDestIndex = Math.min(destination.index, maxDestIndex);
      
      // Çalışanı hedefe ekle
      newShiftData.shiftGroups[destPos.groupIndex]
        .shifts[destPos.shiftIndex].employees.splice(safeDestIndex, 0, movedEmployee);
      
      console.log('✅ Sürükle-bırak başarılı:', {
        employee: movedEmployee.name,
        from: `${sourceGroup.groupName} - ${sourceShift.timeSlot}`,
        to: `${destGroup.groupName} - ${destShift.timeSlot}`
      });
      
      // State'i güncelle
      setShiftData(newShiftData);

      // Başarı mesajı
      setSnackbar({
        open: true,
        message: `${movedEmployee.name} başarıyla taşındı: ${sourceGroup.groupName} → ${destGroup.groupName}`,
        severity: 'success'
      });

    } catch (error) {
      console.error('❌ Sürükle-bırak hatası:', error);
      
      setSnackbar({
        open: true,
        message: `Sürükle-bırak hatası: ${error.message}. Lütfen tekrar deneyin.`,
        severity: 'error'
      });
    }
  }, [shiftData, loading, setSnackbar]); // useCallback dependencies

  // Vardiya kaydet
  const handleSaveShift = async () => {
    setLoading(true);
    try {
      // _id ve __v gibi MongoDB alanlarını çıkar
      const { _id, __v, createdAt, updatedAt, ...cleanShiftData } = shiftData;
      
      const response = await fetch('http://localhost:5001/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...cleanShiftData,
          createdBy: 'User'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setCreatedShift(result.data);
        setSaveDialog(true);
      } else {
        alert('Vardiya kaydedilemedi: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Vardiya kaydetme API hatası:', error);
      
      // Backend bağlantısı yoksa demo kaydı oluştur
      const demoCreatedShift = {
        _id: 'demo-shift-' + Date.now(),
        ...shiftData,
        createdAt: new Date().toISOString(),
        status: 'TASLAK'
      };
      
      setCreatedShift(demoCreatedShift);
      setSaveDialog(true);
      
      setSnackbar({
        open: true,
        message: 'Backend bağlantısı yok! Demo modda vardiya "kaydedildi".',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  // Excel çıktı al - gelişmiş seçeneklerle
  const handleExportExcel = async (exportType = 'standard') => {
    if (!createdShift || !createdShift._id) {
      console.error('⚠️ Excel export hatası: createdShift._id bulunamadı');
      console.log('createdShift:', createdShift);
      alert('Önce vardiyayı kaydetmelisiniz!');
      return;
    }

    const exportEndpoints = {
      'standard': '/api/excel/export/shift',           // Standart vardiya listesi
      'signature': '/api/excel/export/shift/signature', // İmza tablosu
      'overtime': '/api/excel/export/overtime-list'     // Fazla mesai listesi
    };

    const exportTitles = {
      'standard': 'vardiya-listesi',
      'signature': 'imza-tablosu', 
      'overtime': 'fazla-mesai-listesi'
    };

    try {
      // Excel export başlıyor - debug mesajı kaldırıldı
      
      const response = await fetch(`http://localhost:5001${exportEndpoints[exportType]}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shiftId: createdShift._id,
          ...(exportType === 'overtime' && {
            employees: shiftData.shiftGroups.flatMap(group => 
              group.shifts.flatMap(shift => shift.employees)
            ),
            listInfo: {
              location: shiftData.location,
              date: shiftData.startDate,
              timeSlot: '16:00-22:00'
            }
          })
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportTitles[exportType]}-${shiftData.location.replace(/\s+/g, '-')}-${shiftData.startDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Excel export başarılı - debug mesajı kaldırıldı
        
        setSnackbar({
          open: true,
          message: `${exportTitles[exportType]} başarıyla indirildi!`,
          severity: 'success'
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Excel export hatası:', errorText);
        alert(`Excel dosyası oluşturulamadı: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Excel export network hatası:', error);
      
      // Backend bağlantısı yoksa demo Excel oluştur
      const csvContent = generateDemoCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demo-${exportTitles[exportType]}-${shiftData.location.replace(/\s+/g, '-')}-${shiftData.startDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Backend bağlantısı yok! Demo CSV dosyası indirildi.',
        severity: 'warning'
      });
    }
  };

  // Demo CSV oluştur
  const generateDemoCSV = () => {
    let csv = 'Departman,Vardiya Saati,Çalışan Adı,Durum\n';
    
    shiftData.shiftGroups?.forEach(group => {
      group.shifts?.forEach(shift => {
        shift.employees?.forEach(emp => {
          csv += `${group.groupName},${shift.timeSlot},${emp.name},${emp.status}\n`;
        });
      });
    });
    
    return csv;
  };

  // PDF çıktı al - ALTERNATIF
  const handleExportPDF = async () => {
    if (!createdShift) return;

    try {
      const response = await fetch('http://localhost:5001/api/excel/export/shift/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shiftId: createdShift._id
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vardiya-listesi-${shiftData.location}-${shiftData.startDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('PDF dosyası oluşturulamadı');
      }
    } catch (error) {
      console.error('PDF export hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  // 🖨️ Yazıcıya Aktar fonksiyonu
  const handlePrintExcel = async (exportType = 'standard') => {
    if (!createdShift || !createdShift._id) {
      alert('Önce vardiyayı kaydetmelisiniz!');
      return;
    }

    const exportEndpoints = {
      'standard': '/api/excel/export/shift',           // Standart vardiya listesi
      'signature': '/api/excel/export/shift/signature', // İmza tablosu
      'overtime': '/api/excel/export/overtime-list'     // Fazla mesai listesi
    };

    try {
      const response = await fetch(`http://localhost:5001${exportEndpoints[exportType]}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shiftId: createdShift._id,
          ...(exportType === 'overtime' && {
            employees: shiftData.shiftGroups.flatMap(group => 
              group.shifts.flatMap(shift => shift.employees)
            ),
            listInfo: {
              location: shiftData.location,
              date: shiftData.startDate,
              timeSlot: '16:00-22:00'
            }
          })
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Yeni sekme açıp yazdırma işlemi başlat
        const printWindow = window.open(url);
        
        // Sayfa yüklendiğinde yazdırma diyaloğunu başlat
        printWindow.onload = function() {
          printWindow.print();
        };
      } else {
        alert('Yazdırma için dosya hazırlanamadı');
      }
    } catch (error) {
      console.error('Yazdırma hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  // Adım içerikleri
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Vardiya Temel Bilgileri
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Vardiya Başlığı"
                    value={shiftData?.title || ''}
                    onChange={(e) => handleFormChange('title', e.target.value || '')}
                    placeholder="Örn: Merkez Şube - Haftalık Vardiya"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Başlangıç Tarihi"
                    value={shiftData?.startDate || ''}
                    onChange={(e) => handleFormChange('startDate', e.target.value || '')}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Bitiş Tarihi"
                    value={shiftData?.endDate || ''}
                    onChange={(e) => handleFormChange('endDate', e.target.value || '')}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Lokasyon</InputLabel>
                    <Select
                      value={shiftData?.location || 'MERKEZ ŞUBE'}
                      onChange={(e) => handleFormChange('location', e.target.value || 'MERKEZ ŞUBE')}
                    >
                      <MenuItem value="MERKEZ ŞUBE">MERKEZ ŞUBE</MenuItem>
                      <MenuItem value="IŞIL ŞUBE">IŞIL ŞUBE</MenuItem>
                      {/* OSB ŞUBE kaldırıldı - sistemde mevcut değil */}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Açıklama (Opsiyonel)"
                    value={shiftData?.description || ''}
                    onChange={(e) => handleFormChange('description', e.target.value || '')}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                disabled={!shiftData.title || !shiftData.startDate || !shiftData.location}
              >
                Devam Et
              </Button>
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={() => {
                  // Bugünün tarihini varsayılan olarak ayarla
                  const today = new Date().toISOString().split('T')[0];
                  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  
                  setCopyShiftData({
                    shiftId: '',
                    newTitle: '',
                    newStartDate: today,
                    newEndDate: nextWeek
                  });
                  setCopyShiftDialog(true);
                }}
              >
                Mevcut Vardiyadan Kopyala
              </Button>
            </CardActions>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👥 Vardiya Oluşturma Yöntemi
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Vardiyayı nasıl oluşturmak istiyorsunuz?
              </Typography>
              
              {/* Şablon Seçimi */}
              {shiftTemplates[shiftData.location] && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    📋 Hazır Şablonlar
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(shiftTemplates[shiftData.location]).map(([templateName, template]) => (
                      <Grid item xs={12} lg={6} key={templateName}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            '&:hover': { bgcolor: 'action.hover' },
                            border: selectedTemplate === templateName ? '2px solid' : '1px solid',
                            borderColor: selectedTemplate === templateName ? 'primary.main' : 'divider'
                          }}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {templateName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {template.description}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                              {template.groups.length} departman, {template.groups.reduce((total, g) => total + g.shifts.length, 0)} vardiya
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                fullWidth
                                onClick={() => applyTemplate(templateName)}
                              >
                                🔄 Değiştir
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                onClick={() => {
                                  // Mevcut gruplara ekle (değiştirme)
                                  const template = shiftTemplates[shiftData.location][templateName];
                                  
                                  const newGroups = template.groups.map(group => ({
                                    id: Math.random().toString(36).substr(2, 9),
                                    groupName: group.groupName,
                                    shifts: group.shifts.map(shift => ({
                                      id: Math.random().toString(36).substr(2, 9),
                                      timeSlot: shift.timeSlot,
                                      employees: []
                                    }))
                                  }));
                                  
                                  setShiftData(prev => ({
                                    ...prev,
                                    shiftGroups: [...(prev.shiftGroups || []), ...newGroups],
                                    specialGroups: (prev.specialGroups || []).concat(
                                      template.specialGroups ? template.specialGroups.map(sg => ({
                                        id: Math.random().toString(36).substr(2, 9),
                                        groupType: sg.groupType,
                                        timeSlot: sg.timeSlot,
                                        employees: []
                                      })) : []
                                    )
                                  }));
                                  
                                  setActiveStep(2);
                                  setSnackbar({
                                    open: true,
                                    message: `"${templateName}" şablonu mevcut gruplara eklendi!`,
                                    severity: 'success'
                                  });
                                }}
                              >
                                ➕ Ekle
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  <Divider sx={{ my: 3 }} />
                </Box>
              )}
              
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonAddIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6">Manuel Düzenle</Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        • Çalışanları manuel seçim
                        • Tam kontrol
                        • Özel düzenlemeler yapabilme
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={handleManualCreate}
                        startIcon={<PersonAddIcon />}
                      >
                        Manuel Oluştur
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AddIcon color="info" sx={{ mr: 1 }} />
                        <Typography variant="h6">Boş Başlat</Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        • Tamamen boş vardiya
                        • Sıfırdan özelleştirme
                        • Kendi gruplarınızı oluşturun
                      </Typography>
                      <Button
                        variant="outlined"
                        color="info"
                        fullWidth
                        onClick={() => {
                          setShiftData(prev => ({
                            ...prev,
                            shiftGroups: [],
                            specialGroups: []
                          }));
                          setActiveStep(2);
                          setSnackbar({
                            open: true,
                            message: 'Boş vardiya oluşturuldu! Şimdi kendi gruplarınızı ekleyebilirsiniz.',
                            severity: 'info'
                          });
                        }}
                        startIcon={<AddIcon />}
                      >
                        Boş Başlat
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  💡 <strong>İpucu:</strong> Manuel oluşturma ile çalışanları istediğiniz gruplar ve vardiyalara 
                  atayabilirsiniz. Boş başlat seçeneği ile tamamen özel grup yapıları oluşturabilirsiniz.
                </Alert>
              </Box>
            </CardContent>
            <CardActions>
              <Button onClick={() => setActiveStep(0)}>
                Geri Dön
              </Button>
            </CardActions>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👥 Vardiya Düzenleme
              </Typography>
              
              {/* Yeni grup ekleme */}
              <Box sx={{ mb: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Yeni Grup/Departman Ekle
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Departman Adı"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Vardiya Saati</InputLabel>
                      <Select
                        value={newGroupTimeSlot}
                        onChange={(e) => setNewGroupTimeSlot(e.target.value)}
                      >
                        <MenuItem value="08:00-18:00">08:00-18:00 (Gündüz)</MenuItem>
                        <MenuItem value="08:00-16:00">08:00-16:00 (Gündüz)</MenuItem>
                        <MenuItem value="16:00-24:00">16:00-24:00 (Akşam)</MenuItem>
                        <MenuItem value="24:00-08:00">24:00-08:00 (Gece)</MenuItem>
                        <MenuItem value="custom">Özel Saat...</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={!newGroupName.trim()}
                      onClick={() => {
                        const newShiftData = { ...shiftData };
                        
                        // Yeni grup oluştur - GÜVENLI VERSİYON
                        const newGroup = {
                          id: generateUniqueId('group'),
                          groupName: newGroupName.trim(),
                          shifts: [
                            {
                              id: generateUniqueId('shift'),
                              timeSlot: newGroupTimeSlot === 'custom' ? customTimeSlot : newGroupTimeSlot,
                              employees: []
                            }
                          ]
                        };
                        
                        // Gruplara ekle
                        if (!newShiftData.shiftGroups) {
                          newShiftData.shiftGroups = [];
                        }
                        
                        newShiftData.shiftGroups.push(newGroup);
                        setShiftData(newShiftData);
                        
                        // Formu temizle
                        setNewGroupName('');
                        setNewGroupTimeSlot('08:00-18:00');
                        setCustomTimeSlot('');
                      }}
                    >
                      Ekle
                    </Button>
                  </Grid>
                  
                  {/* Özel saat girişi */}
                  {newGroupTimeSlot === 'custom' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Özel Saat (ÖR: 09:30-17:30)"
                        value={customTimeSlot}
                        onChange={(e) => setCustomTimeSlot(e.target.value)}
                        placeholder="HH:MM-HH:MM formatında girin"
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              {/* Vardiya grupları - SÜRÜKLE BIRAK ÖZELLİĞİ İLE - GÜVENLI VERSİYON */}
              <DragDropContext 
                onDragEnd={handleDragEnd}
                onDragStart={(start) => {
                  console.log('🔄 Drag started:', start);
                }}
                onDragUpdate={(update) => {
                  // Drag update sırasında validasyon yapabilir
                  if (!update.destination) return;
                  console.log('🔄 Drag update:', update);
                }}
              >
                {(shiftData.shiftGroups || []).map((group, groupIndex) => {
                  // 🔒 Güvenli key prop - ID yoksa unique key oluştur
                  const safeKey = group.id || `group-fallback-${groupIndex}-${Date.now()}`;
                  
                  return (
                  <Paper key={safeKey} sx={{ mb: 3, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" color="primary">
                        {group.groupName}
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          const newShiftData = { ...shiftData };
                          newShiftData.shiftGroups.splice(groupIndex, 1);
                          setShiftData(newShiftData);
                        }}
                      >
                        Grubu Sil
                      </Button>
                    </Box>
                    
                    {/* Vardiya saatleri */}
                    {(group.shifts || []).map((shift, shiftIndex) => (
                      <Card key={shift.id || `shift-${groupIndex}-${shiftIndex}`} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                              <Typography variant="subtitle1" color="text.secondary">
                                Vardiya: {shift.timeSlot}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getWorkingHoursDescription(shift.timeSlot)}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                  // Yeni vardiya saati ekle
                                  const newShiftData = { ...shiftData };
                                  if (!newShiftData.shiftGroups[groupIndex].shifts) {
                                    newShiftData.shiftGroups[groupIndex].shifts = [];
                                  }
                                  
                                  // Farklı bir saat ekle - mevcut saatlerden farklı olsun
                                  const existingTimeSlots = new Set(
                                    newShiftData.shiftGroups[groupIndex].shifts.map(s => s.timeSlot)
                                  );
                                  
                                  const availableTimeSlots = [
                                    '08:00-18:00', 
                                    '08:00-16:00', 
                                    '16:00-24:00',
                                    '24:00-08:00'
                                  ].filter(ts => !existingTimeSlots.has(ts));
                                  
                                  const newTimeSlot = availableTimeSlots[0] || '08:00-18:00';
                                  
                                  newShiftData.shiftGroups[groupIndex].shifts.push({
                                    id: generateUniqueId('shift'),
                                    timeSlot: newTimeSlot,
                                    employees: []
                                  });
                                  
                                  setShiftData(newShiftData);
                                }}
                              >
                                Vardiya Ekle
                              </Button>
                              
                              <Button
                                size="small"
                                color="error"
                                disabled={group.shifts.length <= 1}
                                onClick={() => {
                                  const newShiftData = { ...shiftData };
                                  newShiftData.shiftGroups[groupIndex].shifts.splice(shiftIndex, 1);
                                  setShiftData(newShiftData);
                                }}
                              >
                                Vardiyayı Sil
                              </Button>
                            </Box>
                          </Box>
                          
                          {/* Çalışan seçimi */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Autocomplete
                              sx={{ flexGrow: 1 }}
                              options={employees.filter(emp => emp.status === 'AKTIF' || emp.durum === 'AKTIF')}
                              getOptionLabel={(emp) => emp.adSoyad || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
                              renderInput={(params) => (
                                <TextField {...params} label="Çalışan Ekle" size="small" />
                              )}
                              onChange={(e, value) => {
                                if (value) {
                                  addEmployeeToShift(groupIndex, shiftIndex, value);
                                }
                              }}
                              value={null}
                              isOptionEqualToValue={(option, value) => option._id === value?._id}
                            />
                            
                            <Button
                              sx={{ ml: 1 }}
                              variant="outlined"
                              size="small"
                              onClick={() => handleDepartmentChange(group.groupName)}
                            >
                              Departmandan Ekle
                            </Button>
                          </Box>
                          
                          {/* Çalışan listesi - SÜRÜKLE BIRAK - SÜPER GÜVENLİ VERSİYON */}
                          <Droppable 
                            droppableId={`group-${groupIndex}-shift-${shiftIndex}`}
                            key={`droppable-stable-${groupIndex}-${shiftIndex}-${group.groupName}`}
                            isDropDisabled={loading}
                          >
                            {(provided, snapshot) => {
                              // 🔒 Güvenlik kontrolleri
                              if (!provided || !provided.innerRef) {
                                console.warn('Droppable provided props eksik, fallback render ediliyor');
                                return (
                                  <Alert severity="warning" sx={{ my: 1 }}>
                                    Sürükle-bırak özelliği şu an kullanılamıyor. Sayfayı yenileyin.
                                  </Alert>
                                );
                              }

                              // 🔒 State validasyonu
                              const safeEmployees = Array.isArray(shift.employees) ? shift.employees : [];
                              
                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  style={{
                                    backgroundColor: snapshot.isDraggingOver ? '#f5f5f5' : 'transparent',
                                    border: '1px dashed #ccc',
                                    borderRadius: '4px',
                                    minHeight: '60px',
                                    padding: '4px',
                                    transition: 'background-color 0.2s ease'
                                  }}
                                >
                                  <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                                    {safeEmployees.map((emp, empIndex) => {
                                      // 🔒 Employee data validasyonu
                                      if (!emp || typeof emp !== 'object') {
                                        console.warn('Geçersiz employee data:', emp);
                                        return null;
                                      }

                                                                             // SÜPER STABLE key ve ID oluştur
                                       const safeEmployeeId = emp.employeeId || emp._id || `temp-emp-${empIndex}`;
                                       const draggableId = `employee-${groupIndex}-${shiftIndex}-${empIndex}`;
                                       const draggableKey = `draggable-${groupIndex}-${shiftIndex}-${empIndex}-${safeEmployeeId}`;
                                      
                                      return (
                                        <Draggable 
                                          key={draggableKey}
                                          draggableId={draggableId}
                                          index={empIndex}
                                          isDragDisabled={loading}
                                        >
                                          {(provided, snapshot) => {
                                            // 🔒 Draggable provided props kontrolü
                                            if (!provided || !provided.innerRef) {
                                              return (
                                                <ListItem key={draggableKey}>
                                                  <ListItemText 
                                                    primary={emp.name || 'İsimsiz Çalışan'} 
                                                    secondary="Sürükle-bırak hatası"
                                                  />
                                                </ListItem>
                                              );
                                            }

                                            return (
                                              <ListItem
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                divider
                                                sx={{
                                                  backgroundColor: snapshot.isDragging ? '#e3f2fd' : 'transparent',
                                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                                  transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                                  transition: 'all 0.2s ease',
                                                  '&:hover': {
                                                    backgroundColor: '#f5f5f5'
                                                  }
                                                }}
                                                secondaryAction={
                                                  <IconButton 
                                                    edge="end" 
                                                    aria-label="delete"
                                                    onClick={() => removeEmployeeFromShift(groupIndex, shiftIndex, empIndex)}
                                                    size="small"
                                                    disabled={loading}
                                                  >
                                                    <RemoveIcon />
                                                  </IconButton>
                                                }
                                              >
                                                <div 
                                                  {...provided.dragHandleProps} 
                                                  style={{ 
                                                    marginRight: 10, 
                                                    cursor: loading ? 'not-allowed' : 'grab',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    opacity: loading ? 0.5 : 1
                                                  }}
                                                >
                                                  <DragIcon color="action" fontSize="small" />
                                                </div>
                                                <ListItemText 
                                                  primary={emp.name || 'İsimsiz Çalışan'} 
                                                  secondary={emp.originalDepartment !== group.groupName ? 
                                                    `Orijinal Departman: ${emp.originalDepartment || 'Belirtilmemiş'}` : undefined}
                                                />
                                              </ListItem>
                                            );
                                          }}
                                        </Draggable>
                                      );
                                    })}
                                    
                                    {/* Placeholder ve boş mesaj */}
                                    {provided.placeholder}
                                    {safeEmployees.length === 0 && (
                                      <ListItem>
                                        <ListItemText 
                                          primary="Bu vardiyada çalışan yok" 
                                          secondary="Çalışan ekleyin veya buraya sürükleyin"
                                          sx={{ 
                                            textAlign: 'center',
                                            color: 'text.secondary',
                                            fontStyle: 'italic'
                                          }}
                                        />
                                      </ListItem>
                                    )}
                                  </List>
                                </div>
                              );
                            }}
                          </Droppable>
                        </CardContent>
                      </Card>
                    ))}
                  </Paper>
                  );
                })}
              </DragDropContext>
              
              {shiftData.shiftGroups?.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Henüz vardiya grubu eklenmedi. Yukarıdan yeni grup ekleyin veya şablon seçin.
                </Alert>
              )}
            </CardContent>
            <CardActions>
              <Button onClick={() => setActiveStep(1)}>Geri</Button>
              <Button 
                variant="contained" 
                onClick={() => setActiveStep(3)}
                disabled={!shiftData.shiftGroups?.length}
              >
                İleri
              </Button>
            </CardActions>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💾 Vardiya Kaydet & Çıktı Al
              </Typography>
              
              <Alert severity="success" sx={{ mb: 3 }}>
                Vardiya başarıyla hazırlandı! Artık kaydedip Excel çıktısı alabilirsiniz.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <SaveIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Vardiyayı Kaydet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Vardiya sisteme kaydedilecek ve daha sonra düzenlenebilecek
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleSaveShift}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <DownloadIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Dosya Çıktısı
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Excel veya PDF formatında indirilebilir vardiya listesi
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleExportExcel}
                        disabled={!createdShift}
                        startIcon={<DownloadIcon />}
                        size="small"
                      >
                        Excel
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={handleExportPDF}
                        disabled={!createdShift}
                        startIcon={<PdfIcon />}
                        size="small"
                      >
                        PDF
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button onClick={() => setActiveStep(2)}>
                Geri Dön
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/shifts')}
              >
                Vardiya Listesi
              </Button>
            </CardActions>
          </Card>
        );

      default:
        return null;
    }
  };

  // State tanımlamaları
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Lokasyona göre filtrele
  const locationFilteredEmployees = employees.filter(emp => {
    // Aktif çalışan kontrolü
    const isActive = emp.status === 'AKTIF';
    
    // Işıl Şube seçiliyse tüm aktif çalışanları göster
    if (shiftData.location === 'IŞIL ŞUBE') {
      return isActive;
    }
    
    // Diğer şubeler için normal filtreleme yap
    const targetBackendLocation = frontendToBackendLocation(shiftData.location);
    const employeeBackendLocation = emp.location;
    const isCorrectLocation = employeeBackendLocation === targetBackendLocation;
    
    // Debug log
    if (!isActive || !isCorrectLocation) {
      console.log('🔍 Filtrelenen çalışan:', {
        name: emp.adSoyad || `${emp.firstName} ${emp.lastName}`,
        status: emp.status,
        location: emp.location,
        displayLocation: emp.displayLocation,
        targetLocation: shiftData.location,
        targetBackendLocation,
        isActive,
        isCorrectLocation,
        isIsilSube: shiftData.location === 'IŞIL ŞUBE'
      });
    }
    
    return isActive && isCorrectLocation;
  });

  // Departmana göre filtrele
  const departmentFilteredEmployees = locationFilteredEmployees.filter(emp => {
    const empDepartment = emp.department || emp.departman || '';
    
    // Işıl Şube için departman filtresi yok
    if (shiftData.location === 'IŞIL ŞUBE') {
      return true;
    }
    
    // Diğer şubeler için normal departman filtresi
    if (!selectedDepartment || selectedDepartment === 'all') {
      return true;
    }
    
    return empDepartment === selectedDepartment;
  });

  // Departman değişikliği handler'ı
  const handleDepartmentChange = (department) => {
    // Departmana göre çalışanları filtrele ve seç
    const departmentEmployees = employees.filter(emp => {
      // Aktif çalışanları filtrele
      if (emp.status !== 'AKTIF' && emp.durum !== 'AKTIF') return false;
      
      // Departman kontrolü - esnek eşleştirme
      const empDept = emp.department || emp.departman || '';
      return empDept === department || 
             empDept.includes(department) || 
             department.includes(empDept);
    });
    
    if (departmentEmployees.length === 0) {
      setSnackbar({
        open: true,
        message: `${department} departmanında çalışan bulunamadı!`,
        severity: 'warning'
      });
      return;
    }
    
    // Kullanıcıya sor
    if (window.confirm(`${department} departmanından ${departmentEmployees.length} çalışanı toplu olarak eklemek istiyor musunuz?`)) {
      // Departman bazlı toplu atama diyaloğunu göster
      showDepartmentAssignDialog(department, departmentEmployees);
    }
  };
  
  // Departman bazlı toplu çalışan atama diyaloğu - YENİ ÖZELLİK
  const [departmentAssignDialog, setDepartmentAssignDialog] = useState(false);
  const [departmentAssignData, setDepartmentAssignData] = useState({
    department: '',
    employees: [],
    selectedEmployees: [],
    targetGroupIndex: -1,
    targetShiftIndex: -1
  });
  
  // Departman atama diyaloğunu göster
  const showDepartmentAssignDialog = (department, departmentEmployees) => {
    // Hedef grup ve vardiya indeksini bul
    let targetGroupIndex = -1;
    let targetShiftIndex = -1;
    
    // Aynı departman adına sahip grup var mı?
    shiftData.shiftGroups.forEach((group, groupIndex) => {
      if (group.groupName === department) {
        targetGroupIndex = groupIndex;
        
        // İlk vardiyayı seç
        if (group.shifts && group.shifts.length > 0) {
          targetShiftIndex = 0;
        }
      }
    });
    
    setDepartmentAssignData({
      department,
      employees: departmentEmployees,
      selectedEmployees: [...departmentEmployees], // Varsayılan olarak hepsi seçili
      targetGroupIndex,
      targetShiftIndex
    });
    
    setDepartmentAssignDialog(true);
  };
  
  // Toplu çalışan atama işlemi
  const handleBulkEmployeeAssign = () => {
    const { selectedEmployees, targetGroupIndex, targetShiftIndex } = departmentAssignData;
    
    if (targetGroupIndex === -1 || targetShiftIndex === -1) {
      setSnackbar({
        open: true,
        message: 'Lütfen geçerli bir hedef grup ve vardiya seçin',
        severity: 'error'
      });
      return;
    }
    
    // Seçilen çalışanları ekle
    let addedCount = 0;
    let conflictCount = 0;
    
    // Tüm çalışanları ekle
    const addEmployeePromises = selectedEmployees.map(employee => 
      new Promise(resolve => {
        // Çakışma kontrolü yap
        checkEmployeeConflicts(
          employee._id,
          shiftData.shiftGroups[targetGroupIndex].shifts[targetShiftIndex].timeSlot,
          shiftData.startDate,
          createdShift?._id
        ).then(result => {
          if (result.hasConflicts) {
            conflictCount++;
            resolve(false);
          } else {
            // Çalışanı ekle
            const employeeName = employee.adSoyad || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
            
            // Duplicate kontrolü
            const isDuplicate = shiftData.shiftGroups[targetGroupIndex].shifts[targetShiftIndex].employees.some(
              emp => emp.employeeId === employee._id
            );
            
            if (!isDuplicate) {
              addEmployeeToShift(targetGroupIndex, targetShiftIndex, employee);
              addedCount++;
              resolve(true);
            } else {
              resolve(false);
            }
          }
        }).catch(() => {
          // Hata durumunda çalışanı ekle
          const isDuplicate = shiftData.shiftGroups[targetGroupIndex].shifts[targetShiftIndex].employees.some(
            emp => emp.employeeId === employee._id
          );
          
          if (!isDuplicate) {
            addEmployeeToShift(targetGroupIndex, targetShiftIndex, employee);
            addedCount++;
            resolve(true);
          } else {
            resolve(false);
          }
        });
      })
    );
    
    // Tüm işlemler tamamlandığında
    Promise.all(addEmployeePromises).then(() => {
      setDepartmentAssignDialog(false);
      
      setSnackbar({
        open: true,
        message: `${addedCount} çalışan başarıyla eklendi. ${conflictCount} çalışan çakışma nedeniyle eklenmedi.`,
        severity: addedCount > 0 ? 'success' : 'warning'
      });
    });
  };

  return (
    <Box>
      {/* Başlık */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🛠️ Yeni Vardiya Oluştur
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Excel formatındaki gibi profesyonel vardiya listeleri oluşturun
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate('/shifts')}
        >
          Vardiya Listesi
        </Button>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* İçerik */}
      {renderStepContent()}

      {/* Snackbar - Bildirimler için */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Vardiya Kopyalama Dialog - YENİ ÖZELLİK */}
      <Dialog open={copyShiftDialog} onClose={() => setCopyShiftDialog(false)} maxWidth="md">
        <DialogTitle>Vardiya Kopyala</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Kopyalanacak Vardiya</InputLabel>
                <Select
                  value={copyShiftData.shiftId}
                  onChange={(e) => setCopyShiftData({ ...copyShiftData, shiftId: e.target.value })}
                >
                  <MenuItem value="" disabled>Vardiya Seçin</MenuItem>
                  {availableShifts.map(shift => (
                    <MenuItem key={shift._id} value={shift._id}>
                      {shift.title} ({new Date(shift.startDate).toLocaleDateString('tr-TR')})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Yeni Vardiya Başlığı (Opsiyonel)"
                value={copyShiftData.newTitle}
                onChange={(e) => setCopyShiftData({ ...copyShiftData, newTitle: e.target.value })}
                placeholder="Boş bırakırsanız '(Kopya)' eklenecek"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Yeni Başlangıç Tarihi"
                value={copyShiftData.newStartDate}
                onChange={(e) => setCopyShiftData({ ...copyShiftData, newStartDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Yeni Bitiş Tarihi"
                value={copyShiftData.newEndDate}
                onChange={(e) => setCopyShiftData({ ...copyShiftData, newEndDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyShiftDialog(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={handleCopyShift}
            disabled={!copyShiftData.shiftId || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CopyIcon />}
          >
            Kopyala ve Düzenle
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Departman Bazlı Toplu Atama Dialog - YENİ ÖZELLİK */}
      <Dialog 
        open={departmentAssignDialog} 
        onClose={() => setDepartmentAssignDialog(false)} 
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {departmentAssignData.department} Departmanı Çalışanlarını Ekle
            </Typography>
            <Chip 
              label={`${departmentAssignData.selectedEmployees?.length || 0} / ${departmentAssignData.employees?.length || 0} Çalışan Seçildi`} 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Hedef Grup ve Vardiya
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Hedef Grup</InputLabel>
                    <Select
                      value={departmentAssignData.targetGroupIndex}
                      onChange={(e) => setDepartmentAssignData({
                        ...departmentAssignData,
                        targetGroupIndex: e.target.value,
                        targetShiftIndex: -1 // Grup değişince vardiyayı sıfırla
                      })}
                    >
                      <MenuItem value={-1} disabled>Grup Seçin</MenuItem>
                      {shiftData.shiftGroups.map((group, index) => (
                        <MenuItem key={index} value={index}>
                          {group.groupName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth
                    disabled={departmentAssignData.targetGroupIndex === -1}
                  >
                    <InputLabel>Hedef Vardiya</InputLabel>
                    <Select
                      value={departmentAssignData.targetShiftIndex}
                      onChange={(e) => setDepartmentAssignData({
                        ...departmentAssignData,
                        targetShiftIndex: e.target.value
                      })}
                    >
                      <MenuItem value={-1} disabled>Vardiya Seçin</MenuItem>
                      {departmentAssignData.targetGroupIndex !== -1 && 
                        shiftData.shiftGroups[departmentAssignData.targetGroupIndex]?.shifts.map((shift, index) => (
                          <MenuItem key={index} value={index}>
                            {shift.timeSlot}
                          </MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Eklenecek Çalışanlar
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Button 
                  size="small"
                  onClick={() => setDepartmentAssignData({
                    ...departmentAssignData,
                    selectedEmployees: [...departmentAssignData.employees]
                  })}
                >
                  Tümünü Seç
                </Button>
                <Button 
                  size="small"
                  onClick={() => setDepartmentAssignData({
                    ...departmentAssignData,
                    selectedEmployees: []
                  })}
                >
                  Seçimi Temizle
                </Button>
              </Box>
              <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                <List dense>
                  {departmentAssignData.employees.map((employee, index) => {
                    const employeeName = employee.adSoyad || 
                                       `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
                    const isSelected = departmentAssignData.selectedEmployees.some(
                      emp => emp._id === employee._id
                    );
                    
                    return (
                      <ListItem 
                        key={index}
                        secondaryAction={
                          <Checkbox
                            edge="end"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                // Çalışanı seçimden çıkar
                                setDepartmentAssignData({
                                  ...departmentAssignData,
                                  selectedEmployees: departmentAssignData.selectedEmployees.filter(
                                    emp => emp._id !== employee._id
                                  )
                                });
                              } else {
                                // Çalışanı seçime ekle
                                setDepartmentAssignData({
                                  ...departmentAssignData,
                                  selectedEmployees: [...departmentAssignData.selectedEmployees, employee]
                                });
                              }
                            }}
                          />
                        }
                      >
                        <ListItemText 
                          primary={employeeName}
                          secondary={employee.department || employee.departman || ''}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepartmentAssignDialog(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={handleBulkEmployeeAssign}
            disabled={
              departmentAssignData.targetGroupIndex === -1 || 
              departmentAssignData.targetShiftIndex === -1 ||
              departmentAssignData.selectedEmployees.length === 0 ||
              loading
            }
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            {departmentAssignData.selectedEmployees.length} Çalışanı Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kaydet Dialog - Gelişmiş Export Seçenekleri */}
      <Dialog open={saveDialog} onClose={() => setSaveDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>✅ Vardiya Başarıyla Oluşturuldu!</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Vardiya listeniz başarıyla oluşturuldu ve veritabanına kaydedildi.
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Vardiya Özeti:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Başlık:</strong> {shiftData.title}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Lokasyon:</strong> {shiftData.location}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Tarih:</strong> {shiftData.startDate} - {shiftData.endDate}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Departman Sayısı:</strong> {shiftData.shiftGroups?.length || 0}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Export Seçenekleri */}
          <Typography variant="h6" gutterBottom>
            📋 İndirme Seçenekleri:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  📊 Standart Vardiya Listesi
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Departman bazlı, tam detaylı vardiya çizelgesi. Tüm grupları ve saatleri içerir.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth 
                  onClick={() => handleExportExcel('standard')}
                  sx={{ mb: 1 }}
                  disabled={!createdShift}
                >
                  Excel İndir
                </Button>
                <Button
                  variant="outlined"
                  fullWidth 
                  size="small"
                  onClick={handleExportPDF}
                  sx={{ mb: 1 }}
                >
                  PDF İndir
                </Button>
                <Button
                  variant="outlined"
                  fullWidth 
                  size="small"
                  onClick={() => handlePrintExcel('standard')}
                  startIcon={<PrintIcon />}
                  color="secondary"
                >
                  Yazıcıya Aktar
                </Button>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  ✍️ İmza Tablosu
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Giriş-çıkış imza formatu. Puantaj için kullanıma hazır tablo.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary"
                  fullWidth 
                  onClick={() => handleExportExcel('signature')}
                  disabled={!createdShift}
                  sx={{ mb: 1 }}
                >
                  İmza Tablosu İndir
                </Button>
                <Button
                  variant="outlined"
                  fullWidth 
                  size="small"
                  onClick={() => handlePrintExcel('signature')}
                  startIcon={<PrintIcon />}
                  color="secondary"
                >
                  Yazıcıya Aktar
                </Button>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  ⏰ Fazla Mesai Listesi
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Fazla çalışma saatleri için özel format. 16:00-22:00 vardiyası.
                </Typography>
                <Button 
                  variant="contained" 
                  color="warning"
                  fullWidth 
                  onClick={() => handleExportExcel('overtime')}
                  disabled={!createdShift}
                  sx={{ mb: 1 }}
                >
                  Fazla Mesai İndir
                </Button>
                <Button
                  variant="outlined"
                  fullWidth 
                  size="small"
                  onClick={() => handlePrintExcel('overtime')}
                  startIcon={<PrintIcon />}
                  color="warning"
                >
                  Yazıcıya Aktar
                </Button>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialog(false)}>
            Kapat
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/shifts')}
            >
              Vardiya Listesi
            </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => {
              // Yeni vardiya oluşturmaya dön
              setActiveStep(0);
              setShiftData({
                title: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                location: 'MERKEZ ŞUBE',
                description: '',
                generalManager: { name: 'BİLAL CEVİZOĞLU', title: 'FABRİKA GENEL SORUMLUSU' },
                departmentManager: { name: 'MURAT ÇAVDAR', title: 'BÖLÜM SORUMLUSU' },
                supervisor: { name: 'MURAT SEPETÇİ', title: 'USTABAŞI' },
                shiftGroups: [],
                specialGroups: [],
                nightShiftNote: '24:00-08:00 GECE VARDİYASI PAZARTESİYİ SALIYA BAĞLAYAN GECE BAŞLAYACAKTIR.'
              });
              setCreatedShift(null);
              setSaveDialog(false);
              setSelectedTemplate('');
            }}
          >
            🆕 Yeni Vardiya Oluştur
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CreateShift; 