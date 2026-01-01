import { useState, useEffect } from 'react'
import {
  getAllFiles,
  saveAlimentsPetitDej,
  saveAlimentsDejeuner,
  saveAlimentsDiner,
  saveFodmapList,
  saveReglesGenerales,
  savePertePoidHomme,
  savePertePoidFemme,
  saveVitalite,
  deleteFile,
  downloadFile,
  getStorageStats,
  exportAllFiles,
  importAllFiles,
  resetAllFiles
} from '../utils/practitionerStorage'
import './PractitionerPortal.css'

const PractitionerPortal = ({ onBack }) => {
  const [files, setFiles] = useState(null)
  const [stats, setStats] = useState(null)
  const [uploading, setUploading] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const loadedFiles = getAllFiles()
    const loadedStats = getStorageStats()
    setFiles(loadedFiles)
    setStats(loadedStats)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleFileUpload = async (fileType, saveFn, file) => {
    if (!file) return

    setUploading(fileType)
    try {
      await saveFn(file)
      loadData()
      showToast(`✅ Fichier uploadé: ${file.name}`)
    } catch (error) {
      showToast(`❌ Erreur: ${error.message}`, 'error')
    } finally {
      setUploading(null)
    }
  }

  const handleDelete = async (fileType) => {
    if (!confirm('Confirmer la suppression de ce fichier ?')) return

    try {
      await deleteFile(fileType)
      loadData()
      showToast('🗑️ Fichier supprimé')
    } catch (error) {
      showToast(`❌ Erreur: ${error.message}`, 'error')
    }
  }

  const handleDownload = async (fileType) => {
    try {
      await downloadFile(fileType)
      showToast('📥 Téléchargement démarré')
    } catch (error) {
      showToast(`❌ Erreur: ${error.message}`, 'error')
    }
  }

  const handleExport = async () => {
    try {
      await exportAllFiles()
      showToast('📤 Export réussi')
    } catch (error) {
      showToast(`❌ Erreur: ${error.message}`, 'error')
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      await importAllFiles(file)
      loadData()
      showToast('📥 Import réussi')
    } catch (error) {
      showToast(`❌ Erreur: ${error.message}`, 'error')
    }
  }

  const handleReset = async () => {
    if (!confirm('⚠️ ATTENTION: Supprimer TOUS les fichiers ? Cette action est irréversible.')) return

    try {
      await resetAllFiles()
      loadData()
      showToast('🗑️ Tous les fichiers supprimés')
    } catch (error) {
      showToast(`❌ Erreur: ${error.message}`, 'error')
    }
  }

  if (!files || !stats) {
    return <div className="loading">⏳ Chargement...</div>
  }

  const fileConfigs = [
    {
      key: 'alimentsPetitDej',
      title: 'Excel Petit-Déjeuner',
      description: 'Aliments autorisés pour le petit-déjeuner',
      icon: '🌅',
      saveFn: saveAlimentsPetitDej,
      formats: '.xls, .xlsx, .csv'
    },
    {
      key: 'alimentsDejeuner',
      title: 'Excel Déjeuner',
      description: 'Aliments autorisés pour le déjeuner',
      icon: '🍽️',
      saveFn: saveAlimentsDejeuner,
      formats: '.xls, .xlsx, .csv'
    },
    {
      key: 'alimentsDiner',
      title: 'Excel Dîner',
      description: 'Aliments autorisés pour le dîner',
      icon: '🌙',
      saveFn: saveAlimentsDiner,
      formats: '.xls, .xlsx, .csv'
    },
    {
      key: 'fodmapList',
      title: 'Liste FODMAP',
      description: 'Aliments à éviter pour personnes sensibles',
      icon: '🚫',
      saveFn: saveFodmapList,
      formats: '.txt, .csv, .json'
    },
    {
      key: 'reglesGenerales',
      title: 'Règles Générales',
      description: 'Document des règles nutritionnelles',
      icon: '📄',
      saveFn: saveReglesGenerales,
      formats: '.doc, .docx, .txt'
    },
    {
      key: 'pertePoidHomme',
      title: 'Perte de Poids - Homme',
      description: 'Programme perte de poids spécifique hommes',
      icon: '💪',
      saveFn: savePertePoidHomme,
      formats: '.doc, .docx, .txt'
    },
    {
      key: 'pertePoidFemme',
      title: 'Perte de Poids - Femme',
      description: 'Programme perte de poids spécifique femmes',
      icon: '💃',
      saveFn: savePertePoidFemme,
      formats: '.doc, .docx, .txt'
    },
    {
      key: 'vitalite',
      title: 'Programme Vitalité',
      description: 'Document programme vitalité',
      icon: '⚡',
      saveFn: saveVitalite,
      formats: '.doc, .docx, .txt'
    }
  ]

  return (
    <div className="practitioner-portal">
      {/* Header */}
      <div className="practitioner-header">
        <h1>
          <span>👨‍⚕️</span>
          Portail Praticien
        </h1>
        <div className="header-actions">
          <button onClick={onBack} className="btn-back">
            ← Retour
          </button>
        </div>
      </div>

      <div className="practitioner-container">
        {/* Storage Stats */}
        <div className="storage-stats">
          <h3>📊 Statistiques de Stockage</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.fileCount}</span>
              <span className="stat-label">Fichiers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.formattedSize}</span>
              <span className="stat-label">Utilisé</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.formattedMax}</span>
              <span className="stat-label">Maximum</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.usedPercent}%</span>
              <span className="stat-label">Rempli</span>
            </div>
          </div>
          <div className="storage-bar">
            <div className="storage-fill" style={{ width: `${stats.usedPercent}%` }} />
          </div>
        </div>

        {/* Files Grid */}
        <div className="files-grid">
          {fileConfigs.map(config => {
            const file = files[config.key]
            const isUploading = uploading === config.key

            return (
              <div key={config.key} className="file-card">
                {/* Header */}
                <div className="file-header">
                  <span className="file-icon">{config.icon}</span>
                  <div className="file-title">
                    <h3>{config.title}</h3>
                    <p>{config.description}</p>
                  </div>
                </div>

                {/* Status */}
                {file ? (
                  <div className="file-status uploaded">
                    ✅ <strong>{file.name}</strong>
                    <div className="file-info">
                      Taille: {Math.round(file.size / 1024)} KB
                      <br />
                      Uploadé: {new Date(file.uploadedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="file-status empty">
                    ⚠️ Aucun fichier uploadé
                  </div>
                )}

                {/* Upload Zone */}
                {!file && (
                  <label className="upload-zone">
                    <input
                      type="file"
                      accept={config.formats}
                      onChange={(e) => {
                        const selectedFile = e.target.files[0]
                        if (selectedFile) {
                          handleFileUpload(config.key, config.saveFn, selectedFile)
                        }
                      }}
                      style={{ display: 'none' }}
                      disabled={isUploading}
                    />
                    <div className="upload-icon">📤</div>
                    <p className="upload-text">
                      {isUploading ? '⏳ Upload en cours...' : 'Cliquer pour uploader'}
                    </p>
                    <p className="upload-hint">Formats: {config.formats}</p>
                  </label>
                )}

                {/* Actions */}
                {file && (
                  <div className="file-actions">
                    <button
                      onClick={() => handleDownload(config.key)}
                      className="btn-action btn-download"
                      disabled={isUploading}
                    >
                      📥 Télécharger
                    </button>
                    <button
                      onClick={() => handleDelete(config.key)}
                      className="btn-action btn-delete"
                      disabled={isUploading}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                )}

                {/* Replace Button */}
                {file && (
                  <label className="upload-zone" style={{ marginTop: '0.5rem', padding: '1rem' }}>
                    <input
                      type="file"
                      accept={config.formats}
                      onChange={(e) => {
                        const selectedFile = e.target.files[0]
                        if (selectedFile) {
                          handleFileUpload(config.key, config.saveFn, selectedFile)
                        }
                      }}
                      style={{ display: 'none' }}
                      disabled={isUploading}
                    />
                    <p className="upload-text" style={{ fontSize: '0.85rem' }}>
                      {isUploading ? '⏳ Remplacement...' : '🔄 Remplacer ce fichier'}
                    </p>
                  </label>
                )}
              </div>
            )
          })}
        </div>

        {/* Global Actions */}
        <div className="global-actions">
          <button onClick={handleExport} className="btn-export">
            📤 Exporter Tous les Fichiers
          </button>
          <label className="btn-import">
            📥 Importer Fichiers
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={handleReset} className="btn-reset">
            🗑️ Réinitialiser Tout
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default PractitionerPortal
