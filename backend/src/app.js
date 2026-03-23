const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const studyRoutes = require('./routes/study');
const userRoutes = require('./routes/user');

const app = express();

// CORS 配置：开发环境允许所有，生产环境只允许指定域名
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://taizhouclaw.com', 'https://www.taizhouclaw.com']
    : true, // 开发环境允许所有
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 安全头配置
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // 允许图片跨域
  contentSecurityPolicy: false // 暂时禁用CSP，避免影响前端资源加载
}));

// 启用gzip压缩（显著减少传输体积）
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json());

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    // 检查MIME类型
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('只允许上传 JPG/PNG 格式的图片'));
    }

    // 检查文件扩展名
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      return cb(new Error('文件扩展名不合法'));
    }

    cb(null, true);
  }
});

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 托管前端静态文件（build后的dist目录）
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有文件上传' });
    }
    // 返回相对路径，前端根据当前域名动态拼接
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('文件上传错误:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/user', userRoutes);

// SPA fallback - Vue Router的history模式支持
// 只对HTML页面路由返回index.html，静态资源由express.static处理
app.use((req, res, next) => {
  // API请求跳过
  if (req.path.startsWith('/api')) {
    return next();
  }
  // 静态资源跳过（有扩展名的文件）
  if (req.path.includes('.')) {
    return next();
  }
  // 只对HTML页面路由返回index.html
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // 监听所有网卡，允许外网访问
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
