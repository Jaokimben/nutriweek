/**
 * 🚀 NUTRIWEEK BACKEND SERVER
 * 
 * Backend pour la gestion des fichiers praticien avec:
 * - Upload de fichiers
 * - Versioning automatique
 * - API de téléchargement
 * - Historique complet
 * - Pas d'effacement (sauf reset explicite)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180',
    'http://localhost:5181',
    'https://nutriweek-es33.vercel.app',
    /https:\/\/.*-i3apeogi3krbe5bmmtels-.*\.sandbox\.novita\.ai/
  ],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Créer les dossiers nécessaires
const uploadsDir = path.join(__dirname, 'uploads');
const versionsDir = path.join(uploadsDir, 'versions');
const dbDir = path.join(__dirname, 'data');

[uploadsDir, versionsDir, dbDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Dossier créé: ${dir}`);
  }
});

// Database simple (JSON file)
const { JsonDB, Config } = require('node-json-db');
const db = new JsonDB(new Config(path.join(dbDir, 'files'), true, true, '/'));

// Initialize database structure
const initDB = async () => {
  try {
    await db.getData('/files');
    console.log('🗄️ Database déjà initialisée');
  } catch (error) {
    await db.push('/files', {
      alimentsPetitDej: { versions: [] },
      alimentsDejeuner: { versions: [] },
      alimentsDiner: { versions: [] },
      fodmapList: { versions: [] },
      reglesGenerales: { versions: [] },
      pertePoidHomme: { versions: [] },
      pertePoidFemme: { versions: [] },
      vitalite: { versions: [] },
      confortDigestif: { versions: [] }  // 🆕 AJOUTÉ
    });
    console.log('🗄️ Database initialisée');
  }
};

// Initialize DB synchronously at startup
initDB().catch(err => console.error('❌ Erreur initialisation DB:', err));

// Routes
const filesRoutes = require('./routes/files.cjs');
app.use('/api/files', filesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'NutriWeek Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  try {
    const files = db.getData('/files');
    const stats = {
      totalFiles: 0,
      totalVersions: 0,
      fileTypes: {}
    };

    Object.keys(files).forEach(fileType => {
      const versions = files[fileType].versions || [];
      stats.totalVersions += versions.length;
      if (versions.length > 0) {
        stats.totalFiles++;
      }
      stats.fileTypes[fileType] = {
        versions: versions.length,
        latestVersion: versions.length > 0 ? versions[versions.length - 1] : null
      };
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(500).json({
    error: err.message || 'Erreur serveur interne',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀  NutriWeek Backend API');
  console.log('🚀 ========================================');
  console.log(`🚀  Port: ${PORT}`);
  console.log(`🚀  Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀  URL: http://localhost:${PORT}`);
  console.log('🚀 ========================================');
  console.log('');
  console.log('📍 Endpoints disponibles:');
  console.log(`   GET  /api/health          - Health check`);
  console.log(`   GET  /api/stats           - Statistiques globales`);
  console.log(`   GET  /api/files           - Liste tous les fichiers`);
  console.log(`   GET  /api/files/:type     - Obtenir fichier par type`);
  console.log(`   GET  /api/files/:type/versions - Historique versions`);
  console.log(`   POST /api/files/upload    - Upload nouveau fichier`);
  console.log(`   GET  /api/files/download/:type/:version - Télécharger`);
  console.log('');
});

module.exports = app;
