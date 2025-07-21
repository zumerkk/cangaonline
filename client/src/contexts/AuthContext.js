import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Session süresi (1 saat = 3600000 ms)
  const SESSION_DURATION = 3600000;

  // Component mount olduğunda session kontrolü
  useEffect(() => {
    checkAuthStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Session kontrolü
  const checkAuthStatus = () => {
    try {
      const authData = localStorage.getItem('canga_auth');
      const loginTime = localStorage.getItem('canga_login_time');
      
      if (authData && loginTime) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - parseInt(loginTime);
        
        // 1 saatten fazla geçmişse logout
        if (timeDiff > SESSION_DURATION) {
          logout();
          return;
        }
        
        // Session geçerliyse kullanıcıyı ayarla
        const userData = JSON.parse(authData);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Kalan süre için timeout ayarla
        const remainingTime = SESSION_DURATION - timeDiff;
        setupSessionTimeout(remainingTime);
      }
    } catch (error) {
      console.error('Auth kontrolü hatası:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Session timeout ayarla
  const setupSessionTimeout = (duration) => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    const timeout = setTimeout(() => {
      logout();
      alert('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
    }, duration);
    
    setSessionTimeout(timeout);
  };

  // Giriş fonksiyonu - Backend API kullanarak
  const login = async (password) => {
    try {
      setLoading(true);
      
      // Backend API'ye giriş isteği gönder
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Giriş başarısız');
      }

      // Kullanıcı bilgilerini al
      const userData = data.user;

      // Local storage'a kaydet
      const loginTime = new Date().getTime();
      localStorage.setItem('canga_auth', JSON.stringify(userData));
      localStorage.setItem('canga_login_time', loginTime.toString());
      localStorage.setItem('canga_password', password); // API çağrıları için

      // State'i güncelle
      setUser(userData);
      setIsAuthenticated(true);
      
      // 1 saatlik session timeout ayarla
      setupSessionTimeout(SESSION_DURATION);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Giriş yapılırken hata oluştu' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const logout = () => {
    // Timeout'u temizle
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    
    // Local storage'ı temizle
    localStorage.removeItem('canga_auth');
    localStorage.removeItem('canga_login_time');
    localStorage.removeItem('canga_password'); // Şifreyi de temizle
    
    // State'i sıfırla
    setUser(null);
    setIsAuthenticated(false);
  };

  // Session süresini uzat (kullanıcı aktifse)
  const extendSession = () => {
    if (isAuthenticated) {
      const newLoginTime = new Date().getTime();
      localStorage.setItem('canga_login_time', newLoginTime.toString());
      setupSessionTimeout(SESSION_DURATION);
    }
  };

  // Kullanıcı bilgilerini güncelle
  const updateUser = (updatedUserData) => {
    try {
      // Mevcut kullanıcı bilgileriyle birleştir
      const newUserData = { ...user, ...updatedUserData };
      
      // Local storage'ı güncelle
      localStorage.setItem('canga_auth', JSON.stringify(newUserData));
      
      // State'i güncelle
      setUser(newUserData);
      
      return { success: true };
    } catch (error) {
      console.error('Kullanıcı güncellemesi hatası:', error);
      return { success: false, message: 'Güncelleme başarısız' };
    }
  };

  // Kullanıcı aktivitesi dinleyicisi
  useEffect(() => {
    if (isAuthenticated) {
      const handleActivity = () => {
        extendSession();
      };

      // Mouse ve keyboard aktivitelerini dinle
      window.addEventListener('mousedown', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('scroll', handleActivity);
      
      return () => {
        window.removeEventListener('mousedown', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('scroll', handleActivity);
      };
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    extendSession,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 