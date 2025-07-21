import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  GroupAdd as GroupAddIcon,
  People as PeopleIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import CangaLogo from '../assets/7ff0dçanga_logo-removebg-preview.png';

function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // Kullanıcı yönetimi state'leri (sadece SUPER_ADMIN için)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newUserDialog, setNewUserDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Yeni kullanıcı formu state'i
  const [newUserData, setNewUserData] = useState({
    password: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    location: ''
    // employeeId artık gerekli değil, otomatik oluşturuluyor
  });

  // Profil bilgileri state
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Çanga Yöneticisi',
    email: user?.email || 'admin@canga.com.tr',
    phone: user?.phone || '+90 (332) 123 45 67',
    department: user?.department || 'İDARİ BİRİM',
    position: user?.position || 'Sistem Yöneticisi',
    location: user?.location || 'MERKEZ ŞUBE',
    employeeId: user?.employeeId || 'ADMIN-001'
  });

  // Şifre değiştirme state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Şifre görünürlük state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Bildirim ayarları state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    shiftReminders: true,
    systemUpdates: false
  });

  // Onay dialog state
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState('');

  // API helper fonksiyonu
  const apiCall = async (url, options = {}) => {
    const password = localStorage.getItem('canga_password');
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    
    if (!password) {
      showAlert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.', 'error');
      return;
    }
    
    return fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'adminPassword': password,
        ...options.headers,
      },
    });
  };

  // SUPER_ADMIN kontrolü
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Sayfa yüklendiğinde kullanıcıları getir (eğer super admin ise)
  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]); // fetchUsers'ı dependency'e eklemeyelim çünkü infinite loop'a sebep olur

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      
      const response = await apiCall('/api/users');
      
      // API call'da problem varsa çık
      if (!response) {
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        showAlert(`API Hatası: ${response.status} - ${errorText}`, 'error');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
      } else {
        showAlert(data.message || 'Kullanıcılar getirilemedi', 'error');
      }
    } catch (error) {
      showAlert('Kullanıcılar getirilirken hata oluştu', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  // Yeni kullanıcı oluştur
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      
      const response = await apiCall('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      });

      const data = await response.json();

      if (data.success) {
        showAlert(data.message || 'Kullanıcı başarıyla oluşturuldu! 🎉', 'success');
        setNewUserDialog(false);
        setNewUserData({
          password: '',
          name: '',
          email: '',
          phone: '',
          department: '',
          position: '',
          location: ''
        });
        fetchUsers(); // Listeyi yenile
      } else {
        showAlert(data.message || 'Kullanıcı oluşturulamadı', 'error');
      }
    } catch (error) {
      showAlert('Kullanıcı oluşturulurken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı sil
  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      
      const response = await apiCall(`/api/users/${selectedUser._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showAlert('Kullanıcı başarıyla silindi! 🗑️', 'success');
        setDeleteUserDialog(false);
        setSelectedUser(null);
        fetchUsers(); // Listeyi yenile
      } else {
        showAlert(data.message || 'Kullanıcı silinemedi', 'error');
      }
    } catch (error) {
      showAlert('Kullanıcı silinirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Alert göster
  const showAlert = (message, severity = 'success') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 4000);
  };

  // Tab değiştirme
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Profil bilgileri güncelle
  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // Simüle edilmiş API çağrısı
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Local storage güncelle
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('canga_auth', JSON.stringify(updatedUser));
      
      // Context güncelle (eğer updateUser fonksiyonu varsa)
      if (updateUser) {
        updateUser(updatedUser);
      }
      
      showAlert('Profil bilgileri başarıyla güncellendi! 🎉', 'success');
      setConfirmDialog(false);
    } catch (error) {
      showAlert('Güncelleme sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Şifre değiştirme
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('Yeni şifreler eşleşmiyor!', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showAlert('Yeni şifre en az 6 karakter olmalıdır!', 'error');
      return;
    }

    setLoading(true);
    try {
      // Simüle edilmiş şifre değiştirme
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Şifre alanlarını temizle
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showAlert('Şifre başarıyla değiştirildi! 🔒', 'success');
      setConfirmDialog(false);
    } catch (error) {
      showAlert('Şifre değiştirme sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Onay dialog açma
  const handleConfirmAction = (type) => {
    setActionType(type);
    setConfirmDialog(true);
  };

  // Onay dialog işlemleri
  const handleConfirmDialog = () => {
    if (actionType === 'profile') {
      handleProfileUpdate();
    } else if (actionType === 'password') {
      handlePasswordChange();
    }
  };

  // Şifre görünürlük değiştirme
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      {/* Başlık */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          👤 Profil Yönetimi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Sol Panel - Profil Kartı */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              {/* Avatar */}
              <Box sx={{ mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    border: '4px solid #f0f4f8'
                  }}
                >
                  {profileData.name.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {profileData.name}
                </Typography>
                <Chip 
                  label={profileData.position}
                  color="primary"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {profileData.department}
                </Typography>
              </Box>

              {/* Hızlı Bilgiler */}
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <WorkIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Çalışan ID"
                    secondary={profileData.employeeId}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LocationIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Lokasyon"
                    secondary={profileData.location}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CalendarIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Son Giriş"
                    secondary={new Date().toLocaleDateString('tr-TR')}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Çanga Logo Kartı */}
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <img 
                src={CangaLogo} 
                alt="Çanga Logo" 
                style={{ height: 80, width: 'auto', marginBottom: 16 }}
              />
              <Typography variant="body2" color="text.secondary">
                Çanga Savunma Endüstrisi
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Vardiya Yönetim Sistemi v1.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sağ Panel - Ayarlar */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0 }}>
            {/* Tab'lar */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab 
                  icon={<PersonIcon />} 
                  label="Profil Bilgileri" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<SecurityIcon />} 
                  label="Güvenlik" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<NotificationsIcon />} 
                  label="Bildirimler" 
                  iconPosition="start"
                />
                {/* Kullanıcı Yönetimi sekmesi - Sadece SUPER_ADMIN için */}
                {isSuperAdmin && (
                  <Tab 
                    icon={
                      <Badge badgeContent={users.length} color="primary">
                        <PeopleIcon />
                      </Badge>
                    } 
                    label="Kullanıcı Yönetimi" 
                    iconPosition="start"
                  />
                )}
              </Tabs>
            </Box>

            {/* Tab İçerikleri */}
            <Box sx={{ p: 4 }}>
              {/* PROFIL BİLGİLERİ TAB */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    📝 Kişisel Bilgiler
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ad Soyad"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="E-posta"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Telefon"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Departman</InputLabel>
                        <Select
                          value={profileData.department}
                          label="Departman"
                          onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        >
                          <MenuItem value="İDARİ BİRİM">İdari Birim</MenuItem>
                          <MenuItem value="TEKNİK OFİS">Teknik Ofis</MenuItem>
                          <MenuItem value="TORNA GRUBU">Torna Grubu</MenuItem>
                          <MenuItem value="FREZE GRUBU">Freze Grubu</MenuItem>
                          <MenuItem value="KALİTE KONTROL">Kalite Kontrol</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Pozisyon"
                        value={profileData.position}
                        onChange={(e) => setProfileData({...profileData, position: e.target.value})}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Lokasyon</InputLabel>
                        <Select
                          value={profileData.location}
                          label="Lokasyon"
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        >
                                                <MenuItem value="MERKEZ ŞUBE">Merkez Şube</MenuItem>
                      <MenuItem value="IŞIL ŞUBE">Işıl Şube</MenuItem>
                      {/* OSB ŞUBE kaldırıldı - sistemde mevcut değil */}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => handleConfirmAction('profile')}
                      disabled={loading}
                    >
                      Bilgileri Kaydet
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setProfileData({
                        name: user?.name || 'Çanga Yöneticisi',
                        email: user?.email || 'admin@canga.com.tr',
                        phone: user?.phone || '+90 (332) 123 45 67',
                        department: user?.department || 'İDARİ BİRİM',
                        position: user?.position || 'Sistem Yöneticisi',
                        location: user?.location || 'MERKEZ ŞUBE',
                        employeeId: user?.employeeId || 'ADMIN-001'
                      })}
                    >
                      İptal
                    </Button>
                  </Box>
                </Box>
              )}

              {/* GÜVENLİK TAB */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    🔒 Şifre Değiştirme
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mevcut Şifre"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('current')}
                                edge="end"
                              >
                                {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Yeni Şifre"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('new')}
                                edge="end"
                              >
                                {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        helperText="En az 6 karakter olmalıdır"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Yeni Şifre Tekrar"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('confirm')}
                                edge="end"
                              >
                                {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        error={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword}
                        helperText={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? 'Şifreler eşleşmiyor' : ''}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<SecurityIcon />}
                      onClick={() => handleConfirmAction('password')}
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                      color="warning"
                    >
                      Şifreyi Değiştir
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                    >
                      Temizle
                    </Button>
                  </Box>

                  {/* Güvenlik İpuçları */}
                  <Paper sx={{ mt: 4, p: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="h6" gutterBottom>
                      🛡️ Güvenlik İpuçları
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                      <li>Güçlü bir şifre kullanın (büyük-küçük harf, rakam ve özel karakter)</li>
                      <li>Şifrenizi düzenli aralıklarla değiştirin</li>
                      <li>Şifrenizi kimseyle paylaşmayın</li>
                      <li>Farklı sistemlerde farklı şifreler kullanın</li>
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* BİLDİRİMLER TAB */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    🔔 Bildirim Ayarları
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="E-posta Bildirimleri"
                        secondary="Önemli güncellemeler ve duyurular için e-posta al"
                      />
                      <Button
                        variant={notificationSettings.emailNotifications ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: !notificationSettings.emailNotifications
                        })}
                      >
                        {notificationSettings.emailNotifications ? 'Aktif' : 'Pasif'}
                      </Button>
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <NotificationsIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Anlık Bildirimler"
                        secondary="Tarayıcı üzerinden anlık bildirimler"
                      />
                      <Button
                        variant={notificationSettings.pushNotifications ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          pushNotifications: !notificationSettings.pushNotifications
                        })}
                      >
                        {notificationSettings.pushNotifications ? 'Aktif' : 'Pasif'}
                      </Button>
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Vardiya Hatırlatıcıları"
                        secondary="Vardiya başlangıcından 30 dakika önce hatırlatma"
                      />
                      <Button
                        variant={notificationSettings.shiftReminders ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          shiftReminders: !notificationSettings.shiftReminders
                        })}
                      >
                        {notificationSettings.shiftReminders ? 'Aktif' : 'Pasif'}
                      </Button>
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <SettingsIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Sistem Güncellemeleri"
                        secondary="Yeni özellikler ve sistem güncellemeleri"
                      />
                      <Button
                        variant={notificationSettings.systemUpdates ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          systemUpdates: !notificationSettings.systemUpdates
                        })}
                      >
                        {notificationSettings.systemUpdates ? 'Aktif' : 'Pasif'}
                      </Button>
                    </ListItem>
                  </List>

                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => showAlert('Bildirim ayarları kaydedildi! 🔔', 'success')}
                    >
                      Ayarları Kaydet
                    </Button>
                  </Box>
                </Box>
              )}

              {/* KULLANICI YÖNETİMİ TAB - Sadece SUPER_ADMIN için */}
              {isSuperAdmin && activeTab === 3 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      👥 Kullanıcı Yönetimi
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<GroupAddIcon />}
                      onClick={() => setNewUserDialog(true)}
                      sx={{ bgcolor: '#1e3a8a' }}
                    >
                      Yeni Kullanıcı Ekle
                    </Button>
                  </Box>

                  {/* Kullanıcı Listesi */}
                  {usersLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            <TableCell><strong>Kullanıcı Bilgileri</strong></TableCell>
                            <TableCell><strong>Departman</strong></TableCell>
                            <TableCell><strong>Pozisyon</strong></TableCell>
                            <TableCell><strong>Son Giriş</strong></TableCell>
                            <TableCell><strong>İşlemler</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user._id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ bgcolor: '#1e3a8a' }}>
                                    {user.name.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle2">
                                      {user.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {user.email}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ID: {user.employeeId}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={user.department} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>{user.position}</TableCell>
                              <TableCell>
                                {user.lastLogin ? (
                                  <Box>
                                    <Typography variant="body2">
                                      {new Date(user.lastLogin).toLocaleDateString('tr-TR')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(user.lastLogin).toLocaleTimeString('tr-TR')}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Hiç giriş yapmamış
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Kullanıcıyı Sil">
                                  <IconButton
                                    color="error"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setDeleteUserDialog(true);
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                          {users.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                  Henüz kullanıcı eklenmemiş
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  "Yeni Kullanıcı Ekle" butonunu kullanarak kullanıcı oluşturabilirsiniz
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Onay Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>
          {actionType === 'profile' ? '📝 Profil Güncelleme' : '🔒 Şifre Değiştirme'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {actionType === 'profile' 
              ? 'Profil bilgilerinizi güncellemek istediğinizden emin misiniz?'
              : 'Şifrenizi değiştirmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            İptal
          </Button>
          <Button 
            onClick={handleConfirmDialog}
            variant="contained"
            disabled={loading}
            color={actionType === 'password' ? 'warning' : 'primary'}
          >
            {loading ? 'İşleniyor...' : 'Onayla'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Yeni Kullanıcı Ekleme Dialog - Sadece SUPER_ADMIN için */}
      {isSuperAdmin && (
        <Dialog 
          open={newUserDialog} 
          onClose={() => setNewUserDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#1e3a8a', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <GroupAddIcon />
              Yeni Kullanıcı Oluştur
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              💡 <strong>Çalışan ID otomatik oluşturulacak!</strong> Sistem sıralı olarak USR-001, USR-002... şeklinde ID atayacak.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Şifre *"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  helperText="Bu şifre ile kullanıcı sisteme girecek"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ad Soyad *"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-posta *"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                  placeholder="+90 (5XX) XXX XX XX"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pozisyon *"
                  value={newUserData.position}
                  onChange={(e) => setNewUserData({...newUserData, position: e.target.value})}
                  placeholder="Mühendis, Tekniker, vb."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Departman</InputLabel>
                  <Select
                    value={newUserData.department}
                    label="Departman"
                    onChange={(e) => setNewUserData({...newUserData, department: e.target.value})}
                  >
                    <MenuItem value="İDARİ BİRİM">İdari Birim</MenuItem>
                    <MenuItem value="TEKNİK OFİS">Teknik Ofis</MenuItem>
                    <MenuItem value="TORNA GRUBU">Torna Grubu</MenuItem>
                    <MenuItem value="FREZE GRUBU">Freze Grubu</MenuItem>
                    <MenuItem value="KALİTE KONTROL">Kalite Kontrol</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Lokasyon</InputLabel>
                  <Select
                    value={newUserData.location}
                    label="Lokasyon"
                    onChange={(e) => setNewUserData({...newUserData, location: e.target.value})}
                  >
                    <MenuItem value="MERKEZ ŞUBE">Merkez Şube</MenuItem>
                    <MenuItem value="IŞIL ŞUBE">Işıl Şube</MenuItem>
                    {/* OSB ŞUBE kaldırıldı - sistemde mevcut değil */}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => {
                setNewUserDialog(false);
                setNewUserData({
                  password: '',
                  name: '',
                  email: '',
                  phone: '',
                  department: '',
                  position: '',
                  location: ''
                });
              }}
            >
              İptal
            </Button>
            <Button 
              onClick={handleCreateUser}
              variant="contained"
              disabled={loading || !newUserData.password || !newUserData.name || !newUserData.email || !newUserData.department || !newUserData.position || !newUserData.location}
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#1e3a8a' }}
            >
              {loading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Kullanıcı Silme Onay Dialog - Sadece SUPER_ADMIN için */}
      {isSuperAdmin && (
        <Dialog 
          open={deleteUserDialog} 
          onClose={() => setDeleteUserDialog(false)}
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            🗑️ Kullanıcı Silme Onayı
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box>
                <Typography gutterBottom>
                  Aşağıdaki kullanıcıyı silmek istediğinizden emin misiniz?
                </Typography>
                <Card sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      {selectedUser.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedUser.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedUser.email}
                      </Typography>
                      <Typography variant="caption">
                        {selectedUser.department} - {selectedUser.position}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Bu işlem geri alınamaz! Kullanıcı hesabı deaktif edilecek ve sisteme giriş yapamayacak.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setDeleteUserDialog(false);
                setSelectedUser(null);
              }}
            >
              İptal
            </Button>
            <Button 
              onClick={handleDeleteUser}
              variant="contained"
              color="error"
              disabled={loading}
              startIcon={<DeleteIcon />}
            >
              {loading ? 'Siliniyor...' : 'Kullanıcıyı Sil'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}

export default Profile; 