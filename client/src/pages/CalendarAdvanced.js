import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Fab,
  Tooltip,
  LinearProgress,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Badge,
  Autocomplete,
  Tabs,
  Tab,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ViewModule as ViewModuleIcon,
  ViewDay as ViewDayIcon,
  ViewWeek as ViewWeekIcon,
  List as ListIcon,
  Schedule as ScheduleIcon,
  DirectionsBus as BusIcon,
  Group as GroupIcon,
  Today as TodayIcon,
  Close as CloseIcon,
  Event as EventIcon,
  DragIndicator as DragIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccessTime as TimeIcon,
  Notifications as NotificationIcon,
  FileDownload as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  BeachAccess as VacationIcon,
  Work as WorkIcon,
  HomeWork as HomeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import toast from 'react-hot-toast';

// FullCalendar imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

function CalendarAdvanced() {
  // State'ler
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  
  // Dialog state'leri
  const [eventDialog, setEventDialog] = useState(false);
  const [conflictDialog, setConflictDialog] = useState(false);
  const [vacationDialog, setVacationDialog] = useState(false);
  const [settingsDrawer, setSettingsDrawer] = useState(false);
  
  // Seçili olay ve çakışma bilgileri
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [draggedEvent, setDraggedEvent] = useState(null);

  // Gelişmiş filtreler
  const [advancedFilters, setAdvancedFilters] = useState({
    departments: [], // Seçili departmanlar
    employees: [],   // Seçili çalışanlar
    locations: [],   // Seçili lokasyonlar
    eventTypes: ['shifts', 'services', 'employees', 'vacations'], // Event tipleri
    timeRange: {
      start: null,
      end: null
    },
    showConflicts: true,
    showCapacityWarnings: true
  });

  // Arama state'i
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // İzin yönetimi state'leri
  const [vacationRequests, setVacationRequests] = useState([]);
  const [newVacation, setNewVacation] = useState({
    employeeId: '',
    startDate: new Date(),
    endDate: new Date(),
    type: 'annual', // annual, sick, personal
    reason: '',
    status: 'pending' // pending, approved, rejected
  });

  // Kapasite uyarıları
  const [capacityWarnings, setCapacityWarnings] = useState([]);

  // FullCalendar ref
  const calendarRef = useRef(null);

  // Mock data - gerçek sistemde API'den gelecek
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Örnek çalışanlar
    setEmployees([
      { id: 1, name: 'Ahmet Yılmaz', department: 'TORNA GRUBU', location: 'MERKEZ ŞUBE' },
      { id: 2, name: 'Mehmet Demir', department: 'FREZE GRUBU', location: 'MERKEZ ŞUBE' },
      { id: 3, name: 'Ali Kaya', department: 'KAYNAK', location: 'IŞIL ŞUBE' },
      { id: 4, name: 'Fatma Şahin', department: 'İDARİ BİRİM', location: 'MERKEZ ŞUBE' },
    ]);

    // Örnek izin talepleri
    setVacationRequests([
      {
        id: 1,
        employeeId: 1,
        employeeName: 'Ahmet Yılmaz',
        startDate: addDays(new Date(), 5),
        endDate: addDays(new Date(), 10),
        type: 'annual',
        reason: 'Yıllık izin',
        status: 'pending'
      }
    ]);

    // Örnek kapasite uyarıları
    setCapacityWarnings([
      {
        date: addDays(new Date(), 2),
        department: 'TORNA GRUBU',
        currentCount: 8,
        maxCapacity: 6,
        message: 'TORNA GRUBU\'nda kapasite aşıldı!'
      }
    ]);
  };

  // Çakışma kontrolü
  const checkConflicts = (newEvent) => {
    const conflicts = [];
    events.forEach(event => {
      if (event.type === 'shift' && newEvent.type === 'shift') {
        // Aynı çalışan için çakışma kontrolü
        const eventEmployees = event.extendedProps?.employees || [];
        const newEventEmployees = newEvent.extendedProps?.employees || [];
        
        eventEmployees.forEach(emp => {
          if (newEventEmployees.includes(emp) && 
              newEvent.start < event.end && 
              newEvent.end > event.start) {
            conflicts.push({
              type: 'employee_overlap',
              employee: emp,
              existingEvent: event,
              newEvent: newEvent,
              message: `${emp} zaten ${format(new Date(event.start), 'dd/MM/yyyy')} tarihinde vardiyada!`
            });
          }
        });
      }
    });
    return conflicts;
  };

  // Event sürükleme (Drag & Drop)
  const handleEventDrop = (dropInfo) => {
    const { event, delta } = dropInfo;
    
    // Yeni tarihleri hesapla
    const newEvent = {
      ...event.extendedProps,
      start: event.start,
      end: event.end,
      type: event.extendedProps.type
    };

    // Çakışma kontrolü
    const conflicts = checkConflicts(newEvent);
    
    if (conflicts.length > 0) {
      setConflicts(conflicts);
      setConflictDialog(true);
      dropInfo.revert(); // İşlemi geri al
      return;
    }

    // API'ye güncelleme gönder
    updateEventAPI(event.id, newEvent);
    toast.success('Etkinlik başarıyla taşındı!');
  };

  // Event yeniden boyutlandırma
  const handleEventResize = (resizeInfo) => {
    const { event } = resizeInfo;
    
    // Kapasite kontrolü
    if (event.extendedProps.type === 'shift') {
      const capacityCheck = checkShiftCapacity(event);
      if (!capacityCheck.valid) {
        toast.error(capacityCheck.message);
        resizeInfo.revert();
        return;
      }
    }

    updateEventAPI(event.id, event);
    toast.success('Etkinlik süresi güncellendi!');
  };

  // Vardiya kapasitesi kontrolü
  const checkShiftCapacity = (shift) => {
    const maxCapacity = getMaxCapacityForDepartment(shift.extendedProps.department);
    const currentEmployees = shift.extendedProps.employeeCount || 0;
    
    if (currentEmployees > maxCapacity) {
      return {
        valid: false,
        message: `${shift.extendedProps.department} için maksimum kapasite ${maxCapacity} kişi!`
      };
    }
    
    return { valid: true };
  };

  // Departman için maksimum kapasite
  const getMaxCapacityForDepartment = (department) => {
    const capacities = {
      'TORNA GRUBU': 6,
      'FREZE GRUBU': 8,
      'KAYNAK': 4,
      'İDARİ BİRİM': 3
    };
    return capacities[department] || 5;
  };

  // API güncelleme fonksiyonu
  const updateEventAPI = async (eventId, eventData) => {
    try {
      // Burada gerçek API çağrısı yapılacak
      console.log('Updating event:', eventId, eventData);
    } catch (error) {
      console.error('Event update error:', error);
      toast.error('Güncelleme başarısız!');
    }
  };

  // Akıllı arama
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    // Çalışanları ara
    const employeeResults = employees.filter(emp => 
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.department.toLowerCase().includes(query.toLowerCase())
    );

    // Etkinlikleri ara
    const eventResults = events.filter(event =>
      event.title.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults([...employeeResults, ...eventResults]);
  };

  // İzin onaylama
  const approveVacation = async (vacationId) => {
    try {
      // API çağrısı
      setVacationRequests(prev => 
        prev.map(req => 
          req.id === vacationId 
            ? { ...req, status: 'approved' }
            : req
        )
      );
      toast.success('İzin onaylandı!');
    } catch (error) {
      toast.error('İzin onaylama başarısız!');
    }
  };

  // İzin reddetme
  const rejectVacation = async (vacationId) => {
    try {
      setVacationRequests(prev => 
        prev.map(req => 
          req.id === vacationId 
            ? { ...req, status: 'rejected' }
            : req
        )
      );
      toast.success('İzin reddedildi!');
    } catch (error) {
      toast.error('İzin reddetme başarısız!');
    }
  };

  // Export fonksiyonları
  const exportToExcel = () => {
    // Excel export logic
    toast.success('Excel dosyası oluşturuluyor...');
  };

  const exportToPDF = () => {
    // PDF export logic
    toast.success('PDF dosyası oluşturuluyor...');
  };

  const printCalendar = () => {
    window.print();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Box sx={{ bgcolor: darkMode ? 'grey.900' : 'background.default', minHeight: '100vh' }}>
        {/* Gelişmiş Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, p: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: darkMode ? 'white' : 'inherit' }}>
              🚀 Gelişmiş Takvim & Ajanda
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sürükle-bırak, çakışma kontrolü, izin yönetimi ve daha fazlası!
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Arama */}
            <TextField
              size="small"
              placeholder="Çalışan, vardiya ara..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon />
              }}
              sx={{ width: 200 }}
            />

            {/* Export Butonları */}
            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Excel'e Aktar">
                <Button onClick={exportToExcel}>
                  <DownloadIcon />
                </Button>
              </Tooltip>
              <Tooltip title="PDF'e Aktar">
                <Button onClick={exportToPDF}>
                  <PrintIcon />
                </Button>
              </Tooltip>
              <Tooltip title="Yazdır">
                <Button onClick={printCalendar}>
                  <ShareIcon />
                </Button>
              </Tooltip>
            </ButtonGroup>

            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? 'Açık Mod' : 'Koyu Mod'}>
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Ayarlar */}
            <Tooltip title="Ayarlar">
              <IconButton onClick={() => setSettingsDrawer(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Uyarı Çubuğu */}
        {capacityWarnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2, mx: 2 }}>
            <Typography variant="subtitle2">⚠️ Kapasite Uyarıları:</Typography>
            {capacityWarnings.map((warning, index) => (
              <Typography key={index} variant="body2">
                • {warning.message} ({format(warning.date, 'dd/MM/yyyy')})
              </Typography>
            ))}
          </Alert>
        )}

        {/* İzin Onay Çubuğu */}
        {vacationRequests.filter(req => req.status === 'pending').length > 0 && (
          <Alert severity="info" sx={{ mb: 2, mx: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>
                🏖️ {vacationRequests.filter(req => req.status === 'pending').length} izin talebi onay bekliyor
              </Typography>
              <Button size="small" onClick={() => setVacationDialog(true)}>
                İncele
              </Button>
            </Box>
          </Alert>
        )}

        {/* Ana Takvim - Gelişmiş Özelliklerle */}
        <Paper sx={{ m: 2, p: 2, bgcolor: darkMode ? 'grey.800' : 'white' }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={currentView}
            locale="tr"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            events={events}
            // Gelişmiş özellikler
            editable={true}                    // Düzenlenebilir
            droppable={true}                   // Sürükle-bırak
            selectable={true}                  // Seçilebilir
            selectMirror={true}               // Seçim preview
            eventDurationEditable={true}      // Süre düzenlenebilir
            eventStartEditable={true}         // Başlangıç düzenlenebilir
            // Event handlers
            eventDrop={handleEventDrop}       // Sürükleme
            eventResize={handleEventResize}   // Yeniden boyutlandırma
            // Görünüm ayarları
            height="auto"
            dayMaxEvents={3}
            moreLinkClick="popover"
            eventDisplay="block"
            // Zaman formatları
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            // Stil ayarları
            themeSystem={darkMode ? 'bootstrap' : 'standard'}
            // Türkçe metinler
            buttonText={{
              today: 'Bugün',
              month: 'Ay',
              week: 'Hafta',
              day: 'Gün',
              list: 'Liste'
            }}
          />
        </Paper>

        {/* Çakışma Uyarı Dialog */}
        <Dialog open={conflictDialog} onClose={() => setConflictDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" />
              Çakışma Tespit Edildi!
            </Box>
          </DialogTitle>
          <DialogContent>
            {conflicts.map((conflict, index) => (
              <Alert key={index} severity="error" sx={{ mb: 2 }}>
                {conflict.message}
              </Alert>
            ))}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Bu işlemi gerçekleştirmek istiyorsanız, önce mevcut atamaları düzenleyin.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConflictDialog(false)}>Anladım</Button>
          </DialogActions>
        </Dialog>

        {/* İzin Yönetimi Dialog */}
        <Dialog open={vacationDialog} onClose={() => setVacationDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VacationIcon color="primary" />
              İzin Talepleri Yönetimi
            </Box>
          </DialogTitle>
          <DialogContent>
            <Tabs value={0}>
              <Tab label="Bekleyen Talepler" />
              <Tab label="Onaylananlar" />
              <Tab label="Reddedilenler" />
            </Tabs>
            
            <Box sx={{ mt: 2 }}>
              {vacationRequests.map((request) => (
                <Card key={request.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">{request.employeeName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(request.startDate, 'dd/MM/yyyy')} - {format(request.endDate, 'dd/MM/yyyy')}
                        </Typography>
                        <Typography variant="body2">{request.reason}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => approveVacation(request.id)}
                              startIcon={<CheckIcon />}
                            >
                              Onayla
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => rejectVacation(request.id)}
                              startIcon={<CancelIcon />}
                            >
                              Reddet
                            </Button>
                          </>
                        )}
                        <Chip 
                          label={request.status === 'pending' ? 'Bekliyor' : 
                                request.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                          color={request.status === 'pending' ? 'warning' : 
                                request.status === 'approved' ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVacationDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* Ayarlar Drawer */}
        <Drawer
          anchor="right"
          open={settingsDrawer}
          onClose={() => setSettingsDrawer(false)}
        >
          <Box sx={{ width: 300, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              ⚙️ Takvim Ayarları
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={advancedFilters.showConflicts} />}
                label="Çakışmaları Göster"
              />
              <FormControlLabel
                control={<Switch checked={advancedFilters.showCapacityWarnings} />}
                label="Kapasite Uyarıları"
              />
              <FormControlLabel
                control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
                label="Koyu Mod"
              />
            </FormGroup>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Varsayılan Görünüm
            </Typography>
            <Select
              fullWidth
              size="small"
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value)}
            >
              <MenuItem value="dayGridMonth">Ay Görünümü</MenuItem>
              <MenuItem value="timeGridWeek">Hafta Görünümü</MenuItem>
              <MenuItem value="timeGridDay">Gün Görünümü</MenuItem>
              <MenuItem value="listWeek">Liste Görünümü</MenuItem>
            </Select>
          </Box>
        </Drawer>

        {/* Floating Action Buttons */}
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Tooltip title="Yeni İzin Talebi">
            <Fab size="small" color="secondary">
              <VacationIcon />
            </Fab>
          </Tooltip>
          <Tooltip title="Yeni Vardiya">
            <Fab size="small" color="primary">
              <WorkIcon />
            </Fab>
          </Tooltip>
          <Tooltip title="Yeni Etkinlik">
            <Fab color="primary">
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default CalendarAdvanced; 