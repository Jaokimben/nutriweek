/**
 * 🗄️ DATABASE MODULE - SQLite
 * 
 * Module de base de données robuste pour gérer les fichiers praticien.
 * Remplace JsonDB par SQLite pour résoudre les problèmes de synchronisation.
 * 
 * Tables:
 * - file_versions: Stocke toutes les versions de tous les fichiers
 * 
 * Avantages SQLite:
 * - Transactions ACID
 * - Pas de problème de cache/synchronisation
 * - Robuste et rapide
 * - Facile à sauvegarder
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class FileDatabase {
  constructor(dbPath) {
    // Créer le dossier si nécessaire
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Ouvrir/créer la base de données
    this.db = new Database(dbPath, { verbose: console.log });
    
    // Activer les clés étrangères
    this.db.pragma('foreign_keys = ON');
    
    // Créer les tables si elles n'existent pas
    this.initSchema();
    
    console.log('✅ Database SQLite initialisée:', dbPath);
  }

  /**
   * Initialiser le schéma de la base de données
   */
  initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS file_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_type TEXT NOT NULL,
        version INTEGER NOT NULL,
        original_name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        uploaded_by TEXT NOT NULL DEFAULT 'praticien',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(file_type, version)
      );

      CREATE INDEX IF NOT EXISTS idx_file_type ON file_versions(file_type);
      CREATE INDEX IF NOT EXISTS idx_version ON file_versions(version);
      CREATE INDEX IF NOT EXISTS idx_uploaded_at ON file_versions(uploaded_at);
    `);
    
    console.log('✅ Schéma de base de données créé');
  }

  /**
   * Ajouter une nouvelle version de fichier
   */
  addFileVersion(fileType, versionData) {
    const stmt = this.db.prepare(`
      INSERT INTO file_versions (
        file_type, version, original_name, file_name, file_path,
        size, mime_type, uploaded_at, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      fileType,
      versionData.version,
      versionData.originalName,
      versionData.fileName,
      versionData.filePath,
      versionData.size,
      versionData.mimeType,
      versionData.uploadedAt,
      versionData.uploadedBy
    );

    return {
      id: result.lastInsertRowid,
      ...versionData
    };
  }

  /**
   * Obtenir toutes les versions d'un type de fichier
   */
  getFileVersions(fileType) {
    const stmt = this.db.prepare(`
      SELECT 
        id, file_type as fileType, version, original_name as originalName,
        file_name as fileName, file_path as filePath, size, mime_type as mimeType,
        uploaded_at as uploadedAt, uploaded_by as uploadedBy, created_at as createdAt
      FROM file_versions
      WHERE file_type = ?
      ORDER BY version ASC
    `);

    return stmt.all(fileType);
  }

  /**
   * Obtenir la dernière version d'un type de fichier
   */
  getLatestVersion(fileType) {
    const stmt = this.db.prepare(`
      SELECT 
        id, file_type as fileType, version, original_name as originalName,
        file_name as fileName, file_path as filePath, size, mime_type as mimeType,
        uploaded_at as uploadedAt, uploaded_by as uploadedBy, created_at as createdAt
      FROM file_versions
      WHERE file_type = ?
      ORDER BY version DESC
      LIMIT 1
    `);

    return stmt.get(fileType);
  }

  /**
   * Obtenir tous les fichiers (dernière version de chaque type)
   */
  getAllFiles() {
    const stmt = this.db.prepare(`
      SELECT 
        fv.id, fv.file_type as fileType, fv.version, fv.original_name as originalName,
        fv.file_name as fileName, fv.file_path as filePath, fv.size, fv.mime_type as mimeType,
        fv.uploaded_at as uploadedAt, fv.uploaded_by as uploadedBy, fv.created_at as createdAt,
        (SELECT COUNT(*) FROM file_versions WHERE file_type = fv.file_type) as totalVersions
      FROM file_versions fv
      INNER JOIN (
        SELECT file_type, MAX(version) as max_version
        FROM file_versions
        GROUP BY file_type
      ) latest ON fv.file_type = latest.file_type AND fv.version = latest.max_version
      ORDER BY fv.file_type
    `);

    return stmt.all();
  }

  /**
   * Compter les versions d'un type de fichier
   */
  countVersions(fileType) {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM file_versions
      WHERE file_type = ?
    `);

    const result = stmt.get(fileType);
    return result.count;
  }

  /**
   * Supprimer une version spécifique
   */
  deleteVersion(fileType, version) {
    const stmt = this.db.prepare(`
      DELETE FROM file_versions
      WHERE file_type = ? AND version = ?
    `);

    const result = stmt.run(fileType, version);
    return result.changes > 0;
  }

  /**
   * Obtenir des statistiques globales
   */
  getStats() {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(DISTINCT file_type) as totalFileTypes,
        COUNT(*) as totalVersions,
        SUM(size) as totalSize
      FROM file_versions
    `);

    return stmt.get();
  }

  /**
   * Fermer la connexion à la base de données
   */
  close() {
    this.db.close();
    console.log('✅ Database fermée');
  }
}

module.exports = FileDatabase;
