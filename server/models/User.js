const mongoose = require('mongoose');

// User Schema - Çanga Kullanıcı Sistemi
const userSchema = new mongoose.Schema({
  // Ana kimlik bilgileri
  password: {
    type: String,
    required: true,
    unique: true // Her kullanıcının farklı şifresi olacak
  },
  
  // Kişisel bilgiler
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  phone: {
    type: String,
    required: false,
    trim: true
  },
  
  // Çalışma bilgileri
  department: {
    type: String,
    required: true,
    enum: ['İDARİ BİRİM', 'TEKNİK OFİS', 'TORNA GRUBU', 'FREZE GRUBU', 'KALİTE KONTROL']
  },
  
  position: {
    type: String,
    required: true,
    trim: true
  },
  
  location: {
    type: String,
    required: true,
    enum: ['MERKEZ ŞUBE', 'IŞIL ŞUBE', 'OSB ŞUBE']
  },
  
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Yetki ve roller
  role: {
    type: String,
    required: true,
    enum: ['SUPER_ADMIN', 'USER'], // SUPER_ADMIN: Ana admin (28150503), USER: Normal kullanıcı
    default: 'USER'
  },
  
  // Durum bilgileri
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Oluşturma ve güncelleme bilgileri
  createdBy: {
    type: String, // Ana admin tarafından oluşturulan kullanıcılar için
    required: false
  },
  
  // Son giriş bilgileri
  lastLogin: {
    type: Date,
    default: null
  },
  
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // createdAt ve updatedAt otomatik eklenir
  collection: 'users'
});

// Şifre ile kullanıcı bulma (static method)
userSchema.statics.findByPassword = function(password) {
  return this.findOne({ password, isActive: true });
};

// Kullanıcı giriş kaydetme (instance method)
userSchema.methods.recordLogin = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// JSON çıktısında hassas bilgileri gizle
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  // Şifreyi gizle (güvenlik için)
  delete userObject.password;
  return userObject;
};

// Model oluştur ve export et
const User = mongoose.model('User', userSchema);

module.exports = User; 