import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  BeachAccess as VacationIcon,
  LocalHospital as SickIcon,
  Person as PersonalIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Notifications as NotificationIcon,
  CalendarToday as CalendarIcon,
  Group as TeamIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInDays, addDays, startOfYear, endOfYear } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const VacationManager = ({ employees, onVacationUpdate }) => {
  const [vacationDialog, setVacationDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [vacationRequests, setVacationRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Yeni izin talebi
  const [newVacation, setNewVacation] = useState({
    employeeId: '',
    employeeName: '',
    startDate: null,
    endDate: null,
    type: 'annual', // annual, sick, personal, maternity, marriage
    reason: '',
    substituteId: '', // Yerine bakacak kişi
    urgencyLevel: 'normal', // low, normal, high, urgent
    documentsRequired: false,
    managerNotes: ''
  });

  // İzin türleri konfigürasyonu
  const vacationTypes = {
    annual: { 
      label: 'Yıllık İzin', 
      icon: <VacationIcon />, 
      color: 'primary',
      maxDays: 14,
      requiresApproval: true,
      allowedNotice: 7 // Kaç gün önceden başvuru
    },
    sick: { 
      label: 'Hastalık İzni', 
      icon: <SickIcon />, 
      color: 'error',
      maxDays: 10,
      requiresApproval: true,
      requiresDocument: true
    },
    personal: { 
      label: 'Mazeret İzni', 
      icon: <PersonalIcon />, 
      color: 'warning',
      maxDays: 3,
      requiresApproval: true
    },
    maternity: { 
      label: 'Doğum İzni', 
      icon: <PersonalIcon />, 
      color: 'success',
      maxDays: 112,
      requiresApproval: false
    },
    marriage: { 
      label: 'Evlilik İzni', 
      icon: <PersonalIcon />, 
      color: 'secondary',
      maxDays: 3,
      requiresApproval: false
    }
  };

  // Component mount
  useEffect(() => {
    fetchVacationRequests();
  }, []);

  // İzin taleplerini getir
  const fetchVacationRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/calendar/vacations');
      const data = await response.json();
      
      if (data.success) {
        setVacationRequests(data.data || []);
      }
    } catch (error) {
      console.error('İzin talepleri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  // Yeni izin talebi oluştur
  const createVacationRequest = async () => {
    try {
      // ✅ Validasyonlar
      const validation = validateVacationRequest(newVacation);
      if (!validation.valid) {
        toast.error(validation.message);
        return;
      }

      // 📊 Çakışma kontrolü
      const conflicts = checkVacationConflicts(newVacation);
      if (conflicts.length > 0) {
        toast.error(`Bu tarihte ${conflicts.length} çalışan daha izinde olacak!`);
        return;
      }

      const response = await fetch('http://localhost:5001/api/calendar/vacations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVacation,
          id: Date.now(), // Geçici ID
          requestDate: new Date(),
          status: 'pending',
          approvalFlow: generateApprovalFlow(newVacation)
        })
      });

      if (response.ok) {
        toast.success('✅ İzin talebi oluşturuldu!');
        
        // Otomatik bildirim gönder
        await sendVacationNotification(newVacation, 'REQUEST_CREATED');
        
        // State güncelle
        fetchVacationRequests();
        resetNewVacation();
        setVacationDialog(false);
      }
    } catch (error) {
      console.error('İzin talebi oluşturma hatası:', error);
      toast.error('İzin talebi oluşturulamadı!');
    }
  };

  // İzin talebi validasyonu
  const validateVacationRequest = (vacation) => {
    const { employeeId, startDate, endDate, type } = vacation;
    
    if (!employeeId || !startDate || !endDate) {
      return { valid: false, message: 'Tüm alanları doldurun!' };
    }

    // Tarih kontrolü
    if (startDate >= endDate) {
      return { valid: false, message: 'Bitiş tarihi başlangıçtan sonra olmalı!' };
    }

    // İzin günü sayısı kontrolü
    const days = differenceInDays(endDate, startDate) + 1;
    const typeConfig = vacationTypes[type];
    
    if (days > typeConfig.maxDays) {
      return { valid: false, message: `${typeConfig.label} maksimum ${typeConfig.maxDays} gün olabilir!` };
    }

    // Önceden bildirim kontrolü
    if (typeConfig.allowedNotice) {
      const noticeDate = addDays(new Date(), typeConfig.allowedNotice);
      if (startDate < noticeDate) {
        return { valid: false, message: `En az ${typeConfig.allowedNotice} gün önceden başvuru yapmalısınız!` };
      }
    }

    // Yıllık izin bakiyesi kontrolü
    if (type === 'annual') {
      const remaining = getAnnualLeaveBalance(employeeId);
      if (days > remaining) {
        return { valid: false, message: `Kalan yıllık izin: ${remaining} gün!` };
      }
    }

    return { valid: true };
  };

  // Çakışma kontrolü
  const checkVacationConflicts = (newVacation) => {
    const { employeeId, startDate, endDate } = newVacation;
    const employee = employees.find(e => e.id === employeeId);
    
    return vacationRequests.filter(existing => {
      // Aynı departmanda çalışanları kontrol et
      const existingEmployee = employees.find(e => e.id === existing.employeeId);
      const sameDepartment = employee?.department === existingEmployee?.department;
      
      // Tarih çakışması
      const hasDateOverlap = startDate <= existing.endDate && endDate >= existing.startDate;
      
      // Onaylanmış veya bekleyen izinler
      const activeStatus = ['approved', 'pending'].includes(existing.status);
      
      return sameDepartment && hasDateOverlap && activeStatus;
    });
  };

  // Yıllık izin bakiyesi hesapla
  const getAnnualLeaveBalance = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return 0;

    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
    
    // Bu yıl kullanılan yıllık izinler
    const usedDays = vacationRequests
      .filter(req => 
        req.employeeId === employeeId && 
        req.type === 'annual' && 
        req.status === 'approved' &&
        req.startDate >= yearStart && 
        req.startDate <= yearEnd
      )
      .reduce((total, req) => total + differenceInDays(req.endDate, req.startDate) + 1, 0);

    return Math.max(0, 14 - usedDays); // 14 gün yıllık izin hakkı
  };

  // Onay akışı oluştur
  const generateApprovalFlow = (vacation) => {
    const employee = employees.find(e => e.id === vacation.employeeId);
    const flow = [];

    // 1. Departman yöneticisi
    flow.push({
      step: 1,
      approverRole: 'department_manager',
      approverName: 'Departman Yöneticisi',
      status: 'pending',
      requiredBy: addDays(new Date(), 2)
    });

    // 2. İK onayı (5 günden fazla izinlerde)
    const days = differenceInDays(vacation.endDate, vacation.startDate) + 1;
    if (days > 5) {
      flow.push({
        step: 2,
        approverRole: 'hr_manager',
        approverName: 'İnsan Kaynakları',
        status: 'waiting',
        requiredBy: addDays(new Date(), 3)
      });
    }

    // 3. Genel müdür (10 günden fazla izinlerde)
    if (days > 10) {
      flow.push({
        step: 3,
        approverRole: 'general_manager',
        approverName: 'Genel Müdür',
        status: 'waiting',
        requiredBy: addDays(new Date(), 5)
      });
    }

    return flow;
  };

  // Bildirim gönder
  const sendVacationNotification = async (vacation, eventType) => {
    const notifications = [];
    
    switch (eventType) {
      case 'REQUEST_CREATED':
        notifications.push({
          type: 'VACATION_REQUEST',
          title: 'Yeni İzin Talebi',
          message: `${vacation.employeeName} izin talebi oluşturdu`,
          recipients: ['department_manager', 'hr_manager'],
          priority: 'normal'
        });
        break;
      
      case 'REQUEST_APPROVED':
        notifications.push({
          type: 'VACATION_APPROVED',
          title: 'İzin Onaylandı',
          message: `İzin talebiniz onaylandı`,
          recipients: [vacation.employeeId],
          priority: 'high'
        });
        break;
    }

    // Bildirim API'sine gönder
    for (const notification of notifications) {
      try {
        await fetch('http://localhost:5001/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        });
      } catch (error) {
        console.error('Bildirim gönderme hatası:', error);
      }
    }
  };

  // İzin onayla
  const approveVacation = async (vacationId, step) => {
    try {
      const response = await fetch(`http://localhost:5001/api/calendar/vacations/${vacationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, approvedBy: 'current_user' })
      });

      if (response.ok) {
        toast.success('✅ İzin onaylandı!');
        fetchVacationRequests();
        
        // Bildirim gönder
        const vacation = vacationRequests.find(v => v.id === vacationId);
        if (vacation) {
          await sendVacationNotification(vacation, 'REQUEST_APPROVED');
        }
      }
    } catch (error) {
      console.error('İzin onaylama hatası:', error);
      toast.error('İzin onaylanamadı!');
    }
  };

  // İzin reddet
  const rejectVacation = async (vacationId, reason) => {
    try {
      const response = await fetch(`http://localhost:5001/api/calendar/vacations/${vacationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, rejectedBy: 'current_user' })
      });

      if (response.ok) {
        toast.success('❌ İzin reddedildi!');
        fetchVacationRequests();
      }
    } catch (error) {
      console.error('İzin reddetme hatası:', error);
      toast.error('İzin reddedilemedi!');
    }
  };

  // Yeni izin state'ini sıfırla
  const resetNewVacation = () => {
    setNewVacation({
      employeeId: '',
      employeeName: '',
      startDate: null,
      endDate: null,
      type: 'annual',
      reason: '',
      substituteId: '',
      urgencyLevel: 'normal',
      documentsRequired: false,
      managerNotes: ''
    });
  };

  // İzin türü için renk
  const getVacationTypeColor = (type) => {
    return vacationTypes[type]?.color || 'default';
  };

  // İzin durumu için renk
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  // Departman izin istatistikleri
  const getDepartmentVacationStats = () => {
    const stats = {};
    
    employees.forEach(emp => {
      if (!stats[emp.department]) {
        stats[emp.department] = {
          total: 0,
          onVacation: 0,
          pendingRequests: 0
        };
      }
      stats[emp.department].total++;
    });

    vacationRequests.forEach(req => {
      const employee = employees.find(e => e.id === req.employeeId);
      if (employee && stats[employee.department]) {
        if (req.status === 'approved' && 
            new Date() >= req.startDate && 
            new Date() <= req.endDate) {
          stats[employee.department].onVacation++;
        }
        if (req.status === 'pending') {
          stats[employee.department].pendingRequests++;
        }
      }
    });

    return stats;
  };

  const departmentStats = getDepartmentVacationStats();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Box>
        {/* İzin Yönetimi Dialog */}
        <Dialog open={vacationDialog} onClose={() => setVacationDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VacationIcon color="primary" />
              🏖️ İzin Yönetimi Sistemi
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              <Tab 
                label={
                  <Badge badgeContent={vacationRequests.filter(r => r.status === 'pending').length} color="error">
                    Bekleyen Talepler
                  </Badge>
                } 
              />
              <Tab label="Yeni İzin Talebi" />
              <Tab label="İzin Takvimi" />
              <Tab label="Departman İstatistikleri" />
            </Tabs>

            {/* Tab 0: Bekleyen Talepler */}
            {selectedTab === 0 && (
              <Box sx={{ mt: 2 }}>
                {loading && <LinearProgress sx={{ mb: 2 }} />}
                
                {vacationRequests
                  .filter(req => req.status === 'pending')
                  .map((request) => {
                    const employee = employees.find(e => e.id === request.employeeId);
                    const typeConfig = vacationTypes[request.type];
                    const days = differenceInDays(request.endDate, request.startDate) + 1;
                    
                    return (
                      <Card key={request.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ bgcolor: `${typeConfig.color}.main` }}>
                                  {typeConfig.icon}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1">{employee?.name}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {employee?.department}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={3}>
                              <Chip 
                                label={typeConfig.label}
                                color={typeConfig.color}
                                size="small"
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="body2">
                                {format(request.startDate, 'dd/MM/yyyy')} - {format(request.endDate, 'dd/MM/yyyy')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {days} gün
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                              <Typography variant="body2">{request.reason}</Typography>
                              {request.urgencyLevel === 'urgent' && (
                                <Chip label="ACİL" color="error" size="small" sx={{ mt: 0.5 }} />
                              )}
                            </Grid>
                            
                            <Grid item xs={12} md={2}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Onayla">
                                  <IconButton 
                                    color="success" 
                                    onClick={() => approveVacation(request.id, 1)}
                                  >
                                    <ApproveIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reddet">
                                  <IconButton 
                                    color="error" 
                                    onClick={() => rejectVacation(request.id, 'Uygun değil')}
                                  >
                                    <RejectIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Grid>
                          </Grid>
                          
                          {/* Onay Akışı */}
                          {request.approvalFlow && (
                            <Box sx={{ mt: 2 }}>
                              <Stepper activeStep={request.approvalFlow.findIndex(s => s.status === 'pending')} orientation="horizontal">
                                {request.approvalFlow.map((step, index) => (
                                  <Step key={index}>
                                    <StepLabel>
                                      {step.approverName}
                                      <Typography variant="caption" display="block">
                                        {step.status === 'approved' ? '✅ Onaylandı' : 
                                         step.status === 'pending' ? '⏳ Bekliyor' : '⏸️ Beklemede'}
                                      </Typography>
                                    </StepLabel>
                                  </Step>
                                ))}
                              </Stepper>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                
                {vacationRequests.filter(r => r.status === 'pending').length === 0 && (
                  <Alert severity="info">
                    Bekleyen izin talebi bulunmuyor.
                  </Alert>
                )}
              </Box>
            )}

            {/* Tab 1: Yeni İzin Talebi */}
            {selectedTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Çalışan Seç</InputLabel>
                      <Select
                        value={newVacation.employeeId}
                        onChange={(e) => {
                          const employee = employees.find(emp => emp.id === e.target.value);
                          setNewVacation(prev => ({
                            ...prev,
                            employeeId: e.target.value,
                            employeeName: employee?.name || ''
                          }));
                        }}
                      >
                        {employees.map(emp => (
                          <MenuItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.department}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>İzin Türü</InputLabel>
                      <Select
                        value={newVacation.type}
                        onChange={(e) => setNewVacation(prev => ({ ...prev, type: e.target.value }))}
                      >
                        {Object.entries(vacationTypes).map(([key, type]) => (
                          <MenuItem key={key} value={key}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {type.icon}
                              {type.label} (Max: {type.maxDays} gün)
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Başlangıç Tarihi"
                      value={newVacation.startDate}
                      onChange={(date) => setNewVacation(prev => ({ ...prev, startDate: date }))}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Bitiş Tarihi"
                      value={newVacation.endDate}
                      onChange={(date) => setNewVacation(prev => ({ ...prev, endDate: date }))}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="İzin Sebebi"
                      multiline
                      rows={3}
                      value={newVacation.reason}
                      onChange={(e) => setNewVacation(prev => ({ ...prev, reason: e.target.value }))}
                    />
                  </Grid>
                  
                  {newVacation.employeeId && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="subtitle2">
                          Kalan Yıllık İzin: {getAnnualLeaveBalance(newVacation.employeeId)} gün
                        </Typography>
                        {newVacation.startDate && newVacation.endDate && (
                          <Typography variant="body2">
                            Talep edilen gün sayısı: {differenceInDays(newVacation.endDate, newVacation.startDate) + 1} gün
                          </Typography>
                        )}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {/* Tab 2: İzin Takvimi */}
            {selectedTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  📅 Bu kısımda FullCalendar entegrasyonu ile izinlerin takvim görünümü olacak
                </Alert>
              </Box>
            )}

            {/* Tab 3: Departman İstatistikleri */}
            {selectedTab === 3 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {Object.entries(departmentStats).map(([dept, stats]) => (
                    <Grid item xs={12} md={6} key={dept}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>{dept}</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Toplam Çalışan:</Typography>
                            <Typography>{stats.total}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="error.main">İzinde:</Typography>
                            <Typography color="error.main">{stats.onVacation}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="warning.main">Bekleyen Talep:</Typography>
                            <Typography color="warning.main">{stats.pendingRequests}</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(stats.onVacation / stats.total) * 100}
                            color={stats.onVacation / stats.total > 0.3 ? 'error' : 'primary'}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setVacationDialog(false)}>Kapat</Button>
            {selectedTab === 1 && (
              <Button 
                variant="contained" 
                onClick={createVacationRequest}
                disabled={!newVacation.employeeId || !newVacation.startDate || !newVacation.endDate}
              >
                İzin Talebi Oluştur
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Kısa erişim butonu - dışarıdan çağrılacak */}
        <Button
          variant="contained"
          color="secondary"
          startIcon={<VacationIcon />}
          onClick={() => setVacationDialog(true)}
          sx={{ mb: 2 }}
        >
          İzin Yönetimi
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default VacationManager; 