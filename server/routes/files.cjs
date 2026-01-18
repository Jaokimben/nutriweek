/**
 * 📁 ROUTES FILES - Gestion des fichiers praticien
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
const { JsonDB, Config } = require('node-json-db');

// Database
const dbPath = path.join(__dirname, '../db/files.json');
const db = new JsonDB(new Config(dbPath, true, true, '/'));

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
    const files = db.getData('/files');
    const result = {};

    Object.keys(files).forEach(fileType => {
      const versions = files[fileType].versions || [];
      if (versions.length > 0) {
        result[fileType] = {
          current: versions[versions.length - 1],
          totalVersions: versions.length
        };
      } else {
        result[fileType] = {
          current: null,
          totalVersions: 0
        };
      }
    });

    res.json({
      success: true,
      files: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/files/:type
 * Obtenir la dernière version d'un type de fichier spécifique
 */
router.get('/:type', (req, res) => {
  try {
    const { type } = req.params;
    const fileData = db.getData(`/files/${type}`);
    const versions = fileData.versions || [];

    if (versions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aucun fichier trouvé pour le type: ${type}`
      });
    }

    const latestVersion = versions[versions.length - 1];

    res.json({
      success: true,
      fileType: type,
      currentVersion: latestVersion,
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
 * GET /api/files/:type/versions
 * Obtenir l'historique complet des versions d'un type de fichier
 */
router.get('/:type/versions', (req, res) => {
  try {
    const { type } = req.params;
    const fileData = db.getData(`/files/${type}`);
    const versions = fileData.versions || [];

    res.json({
      success: true,
      fileType: type,
      versions: versions,
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

    // Créer l'entrée de version
    const versionEntry = {
      version: Date.now(),
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.body.uploadedBy || 'praticien'
    };

    // Ajouter la version à la base de données
    const currentVersions = db.getData(`/files/${fileType}/versions`) || [];
    currentVersions.push(versionEntry);
    db.push(`/files/${fileType}/versions`, currentVersions);

    console.log(`✅ Nouveau fichier uploadé: ${fileType} v${versionEntry.version}`);

    res.json({
      success: true,
      message: 'Fichier uploadé avec succès',
      fileType: fileType,
      version: versionEntry,
      totalVersions: currentVersions.length
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

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/files/download/:type/:version?
 * Télécharger un fichier (dernière version si version non spécifiée)
 */
router.get('/download/:type', (req, res) => {
  handleDownload(req, res);
});

router.get('/download/:type/:version', (req, res) => {
  handleDownload(req, res);
});

const handleDownload = (req, res) => {
  try {
    const { type, version } = req.params;
    const fileData = db.getData(`/files/${type}`);
    const versions = fileData.versions || [];

    if (versions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aucun fichier trouvé pour le type: ${type}`
      });
    }

    let fileToDownload;

    if (version) {
      // Télécharger une version spécifique
      fileToDownload = versions.find(v => v.version === parseInt(version));
      if (!fileToDownload) {
        return res.status(404).json({
          success: false,
          message: `Version ${version} non trouvée pour le type: ${type}`
        });
      }
    } else {
      // Télécharger la dernière version
      fileToDownload = versions[versions.length - 1];
    }

    // Vérifier que le fichier existe
    if (!fs.existsSync(fileToDownload.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier physique introuvable sur le serveur'
      });
    }

    // Définir les headers pour le téléchargement
    res.setHeader('Content-Disposition', `attachment; filename="${fileToDownload.originalName}"`);
    res.setHeader('Content-Type', fileToDownload.mimeType);
    res.setHeader('Content-Length', fileToDownload.size);

    // Envoyer le fichier
    const fileStream = fs.createReadStream(fileToDownload.filePath);
    fileStream.pipe(res);

    console.log(`📥 Téléchargement: ${type} v${fileToDownload.version}`);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * DELETE /api/files/:type/versions/:version
 * Supprimer une version spécifique (optionnel, rarement utilisé)
 */
router.delete('/:type/versions/:version', (req, res) => {
  try {
    const { type, version } = req.params;
    const fileData = db.getData(`/files/${type}`);
    const versions = fileData.versions || [];

    const versionIndex = versions.findIndex(v => v.version === parseInt(version));

    if (versionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Version ${version} non trouvée`
      });
    }

    const versionToDelete = versions[versionIndex];

    // Supprimer le fichier physique
    if (fs.existsSync(versionToDelete.filePath)) {
      fs.unlinkSync(versionToDelete.filePath);
    }

    // Retirer de la base de données
    versions.splice(versionIndex, 1);
    db.push(`/files/${type}/versions`, versions);

    console.log(`🗑️ Version supprimée: ${type} v${version}`);

    res.json({
      success: true,
      message: 'Version supprimée avec succès',
      remainingVersions: versions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
