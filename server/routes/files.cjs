/**
 * 📁 ROUTES FILES - Gestion des fichiers praticien (SQLite)
 * 
 * Routes pour:
 * - Upload avec versioning
 * - Téléchargement
 * - Liste des fichiers
 * - Historique des versions
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Note: DB instance is provided via req.db from the main app

// Configuration Multer pour upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/versions');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileType = req.body.fileType || 'unknown';
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${fileType}_v${timestamp}_${sanitizedName}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Validation des types de fichiers
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'application/json',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const allowedExtensions = ['.xls', '.xlsx', '.csv', '.txt', '.json', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Format de fichier non autorisé: ${file.mimetype}`));
    }
  }
});

/**
 * GET /api/files
 * Liste tous les fichiers (dernière version de chaque type)
 */
router.get('/', (req, res) => {
  try {
    const db = req.db;
    console.log('📋 [GET /] Fetching all files from SQLite');
    
    const allFiles = db.getAllFiles();
    
    console.log(`📋 [GET /] Found ${allFiles.length} file types`);
    
    const result = {};
    allFiles.forEach(file => {
      result[file.fileType] = {
        current: {
          version: file.version,
          originalName: file.originalName,
          fileName: file.fileName,
          filePath: file.filePath,
          size: file.size,
          mimeType: file.mimeType,
          uploadedAt: file.uploadedAt,
          uploadedBy: file.uploadedBy
        },
        totalVersions: file.totalVersions
      };
      console.log(`  ✓ ${file.fileType}: ${file.totalVersions} version(s)`);
    });

    res.json({
      success: true,
      files: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [GET /] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/files/:type
 * Obtenir le fichier le plus récent d'un type spécifique
 */
router.get('/:type', (req, res) => {
  try {
    const db = req.db;
    const { type } = req.params;
    const latestVersion = db.getLatestVersion(type);

    if (!latestVersion) {
      return res.status(404).json({
        success: false,
        message: `Aucun fichier trouvé pour le type: ${type}`
      });
    }

    res.json({
      success: true,
      fileType: type,
      currentVersion: {
        version: latestVersion.version,
        originalName: latestVersion.originalName,
        fileName: latestVersion.fileName,
        filePath: latestVersion.filePath,
        size: latestVersion.size,
        mimeType: latestVersion.mimeType,
        uploadedAt: latestVersion.uploadedAt,
        uploadedBy: latestVersion.uploadedBy
      },
      totalVersions: db.countVersions(type)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/files/:type/versions
 * Obtenir l'historique de toutes les versions d'un type
 */
router.get('/:type/versions', (req, res) => {
  try {
    const db = req.db;
    const { type } = req.params;
    const versions = db.getFileVersions(type);

    res.json({
      success: true,
      fileType: type,
      versions: versions.map(v => ({
        version: v.version,
        originalName: v.originalName,
        fileName: v.fileName,
        size: v.size,
        mimeType: v.mimeType,
        uploadedAt: v.uploadedAt,
        uploadedBy: v.uploadedBy
      })),
      totalVersions: versions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/files/upload
 * Upload un nouveau fichier (crée une nouvelle version)
 */
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    const { fileType } = req.body;

    if (!fileType) {
      // Supprimer le fichier uploadé si fileType manquant
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Le type de fichier (fileType) est requis'
      });
    }

    const db = req.db;

    // Créer l'entrée de version
    const versionData = {
      version: Date.now(),
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.body.uploadedBy || 'praticien'
    };

    // Ajouter à la base de données SQLite
    const result = db.addFileVersion(fileType, versionData);

    console.log(`✅ Nouveau fichier uploadé: ${fileType} v${versionData.version}`);

    res.json({
      success: true,
      message: 'Fichier uploadé avec succès',
      fileType: fileType,
      version: {
        version: versionData.version,
        originalName: versionData.originalName,
        fileName: versionData.fileName,
        filePath: versionData.filePath,
        size: versionData.size,
        mimeType: versionData.mimeType,
        uploadedAt: versionData.uploadedAt,
        uploadedBy: versionData.uploadedBy
      },
      totalVersions: db.countVersions(fileType)
    });
  } catch (error) {
    // Nettoyer le fichier en cas d'erreur
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erreur lors de la suppression du fichier:', unlinkError);
      }
    }

    console.error('❌ Erreur upload:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/files/download/:type
 * Télécharger la dernière version d'un type de fichier
 */
router.get('/download/:type', (req, res) => {
  try {
    const db = req.db;
    const { type } = req.params;
    const latestVersion = db.getLatestVersion(type);

    if (!latestVersion) {
      return res.status(404).json({
        success: false,
        message: `Aucun fichier trouvé pour: ${type}`
      });
    }

    if (!fs.existsSync(latestVersion.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier physique introuvable'
      });
    }

    res.download(latestVersion.filePath, latestVersion.originalName);
    console.log(`📥 Téléchargement: ${type} v${latestVersion.version}`);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/files/:type/versions/:version
 * Supprimer une version spécifique
 */
router.delete('/:type/versions/:version', (req, res) => {
  try {
    const db = req.db;
    const { type, version } = req.params;
    const versions = db.getFileVersions(type);
    const versionToDelete = versions.find(v => v.version === parseInt(version));

    if (!versionToDelete) {
      return res.status(404).json({
        success: false,
        message: `Version ${version} non trouvée`
      });
    }

    // Supprimer le fichier physique
    if (fs.existsSync(versionToDelete.filePath)) {
      fs.unlinkSync(versionToDelete.filePath);
    }

    // Retirer de la base de données
    db.deleteVersion(type, parseInt(version));

    console.log(`🗑️ Version supprimée: ${type} v${version}`);

    res.json({
      success: true,
      message: 'Version supprimée avec succès',
      remainingVersions: db.countVersions(type)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
