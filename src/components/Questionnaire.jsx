import { useState } from 'react'
import './Questionnaire.css'

const Questionnaire = ({ onComplete, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialData || {
    // Objectifs
    objectif: 'perte', // Par défaut: perte de poids
    
    // Général - Profil type adulte
    taille: '170',      // 170 cm
    poids: '75',        // 75 kg
    age: '30',          // 30 ans
    genre: 'homme',     // Homme
    tourDeTaille: '85', // 85 cm
    
    // Nombre de repas
    nombreRepas: '3',   // 3 repas par jour
    
    // Capacité digestive
    capaciteDigestive: [], // Aucun problème par défaut
    
    // Intolérances
    intolerances: [],      // Aucune intolérance par défaut
    
    // Morphotype
    morphotype: 'mesomorphe', // Morphologie équilibrée
    
    // Activité physique
    activitePhysique: 'moderee', // Activité modérée
    
    // Semaine actuelle (pour calcul calories)
    semaineActuelle: 1
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value, autoAdvance = false) => {
    // Update form data
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Auto-advance to next step if specified
    if (autoAdvance) {
      setTimeout(() => {
        // Validate with the new form data, not the old state
        if (validateStepWithData(currentStep, newFormData)) {
          if (currentStep < 7) {
            setCurrentStep(currentStep + 1)
          } else {
            onComplete(newFormData)
          }
        }
      }, 300) // Small delay for visual feedback
    }
  }

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || []
      const newValue = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
      return { ...prev, [field]: newValue }
    })
  }

  // Validate with provided data (for auto-advance) or current formData
  const validateStepWithData = (step, data = formData) => {
    const newErrors = {}
    
    switch(step) {
      case 1:
        if (!data.objectif) newErrors.objectif = 'Veuillez sélectionner un objectif'
        break
      case 2:
        if (!data.taille || data.taille < 100 || data.taille > 250) 
          newErrors.taille = 'Taille invalide (100-250 cm)'
        if (!data.poids || data.poids < 30 || data.poids > 300) 
          newErrors.poids = 'Poids invalide (30-300 kg)'
        if (!data.age || data.age < 10 || data.age > 120) 
          newErrors.age = 'Âge invalide (10-120 ans)'
        if (!data.genre) newErrors.genre = 'Veuillez sélectionner un genre'
        if (!data.tourDeTaille || data.tourDeTaille < 50 || data.tourDeTaille > 200) 
          newErrors.tourDeTaille = 'Tour de taille invalide (50-200 cm)'
        break
      case 3:
        if (!data.nombreRepas) newErrors.nombreRepas = 'Veuillez sélectionner le nombre de repas'
        break
      case 4:
        // Capacité digestive - optional but validates if objectif is confort digestif
        if (data.objectif === 'confort' && data.capaciteDigestive.length === 0) {
          newErrors.capaciteDigestive = 'Veuillez sélectionner au moins une option'
        }
        break
      case 5:
        // Intolérances - optional
        break
      case 6:
        if (!data.morphotype) newErrors.morphotype = 'Veuillez sélectionner un morphotype'
        break
      case 7:
        if (!data.activitePhysique) newErrors.activitePhysique = 'Veuillez sélectionner votre niveau d\'activité'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Wrapper for backward compatibility
  const validateStep = (step) => {
    return validateStepWithData(step, formData)
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1)
      } else {
        // Complete questionnaire
        onComplete(formData)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="step fade-in">
            <h2>Quel est votre objectif ?</h2>
            <div className="options-grid">
              <button
                className={`option-card ${formData.objectif === 'perte' ? 'selected' : ''}`}
                onClick={() => handleChange('objectif', 'perte', true)}
              >
                <span className="icon">🎯</span>
                <span className="label">Perdre du poids</span>
              </button>
              <button
                className={`option-card ${formData.objectif === 'confort' ? 'selected' : ''}`}
                onClick={() => handleChange('objectif', 'confort', true)}
              >
                <span className="icon">💚</span>
                <span className="label">Confort digestif</span>
              </button>
              <button
                className={`option-card ${formData.objectif === 'vitalite' ? 'selected' : ''}`}
                onClick={() => handleChange('objectif', 'vitalite', true)}
              >
                <span className="icon">⚡</span>
                <span className="label">Vitalité</span>
              </button>
            </div>
            {errors.objectif && <p className="error">{errors.objectif}</p>}
          </div>
        )
      
      case 2:
        return (
          <div className="step fade-in">
            <h2>Informations générales</h2>
            <div className="form-group">
              <label>Taille (cm)</label>
              <input
                type="number"
                value={formData.taille}
                onChange={(e) => handleChange('taille', e.target.value)}
                placeholder="170"
              />
              {errors.taille && <p className="error">{errors.taille}</p>}
            </div>
            <div className="form-group">
              <label>Poids (kg)</label>
              <input
                type="number"
                value={formData.poids}
                onChange={(e) => handleChange('poids', e.target.value)}
                placeholder="70"
              />
              {errors.poids && <p className="error">{errors.poids}</p>}
            </div>
            <div className="form-group">
              <label>Âge</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="30"
              />
              {errors.age && <p className="error">{errors.age}</p>}
            </div>
            <div className="form-group">
              <label>Genre</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="genre"
                    checked={formData.genre === 'M'}
                    onChange={() => handleChange('genre', 'M')}
                  />
                  <span>Homme</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="genre"
                    checked={formData.genre === 'F'}
                    onChange={() => handleChange('genre', 'F')}
                  />
                  <span>Femme</span>
                </label>
              </div>
              {errors.genre && <p className="error">{errors.genre}</p>}
            </div>
            <div className="form-group">
              <label>Tour de taille (cm)</label>
              <input
                type="number"
                value={formData.tourDeTaille}
                onChange={(e) => handleChange('tourDeTaille', e.target.value)}
                placeholder="85"
              />
              {errors.tourDeTaille && <p className="error">{errors.tourDeTaille}</p>}
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="step fade-in">
            <h2>Nombre de repas par jour</h2>
            <div className="options-grid">
              <button
                className={`option-card ${formData.nombreRepas === '2' ? 'selected' : ''}`}
                onClick={() => handleChange('nombreRepas', '2', true)}
              >
                <span className="icon">🍽️</span>
                <span className="label">Deux repas</span>
              </button>
              <button
                className={`option-card ${formData.nombreRepas === '3' ? 'selected' : ''}`}
                onClick={() => handleChange('nombreRepas', '3', true)}
              >
                <span className="icon">🍽️🍽️</span>
                <span className="label">Trois repas</span>
              </button>
            </div>
            {errors.nombreRepas && <p className="error">{errors.nombreRepas}</p>}
          </div>
        )
      
      case 4:
        return (
          <div className="step fade-in">
            <h2>Capacité digestive</h2>
            <p className="subtitle">Sélectionnez vos symptômes (choix multiples)</p>
            <p className="help-text">💡 Cochez toutes les réponses qui s'appliquent, puis cliquez sur Suivant</p>
            <div className="checkbox-list">
              {['Reflux gastrique', 'Rôt', 'Nausée', 'Ballonnement', 'Transit lent', 'Transit rapide'].map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.capaciteDigestive.includes(option)}
                    onChange={() => handleMultiSelect('capaciteDigestive', option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors.capaciteDigestive && <p className="error">{errors.capaciteDigestive}</p>}
          </div>
        )
      
      case 5:
        return (
          <div className="step fade-in">
            <h2>Intolérances connues</h2>
            <p className="subtitle-optional">Sélectionnez vos intolérances (choix multiples)</p>
            <p className="help-text">💡 Cochez toutes les réponses qui s'appliquent, puis cliquez sur Suivant</p>
            <div className="checkbox-list">
              {['Gluten', 'Lait', 'Fruits à coque', 'Œufs'].map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.intolerances.includes(option)}
                    onChange={() => handleMultiSelect('intolerances', option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )
      
      case 6:
        const morphotypes = [
          {
            id: 'M1',
            name: 'Ectomorphe',
            icon: '🏃',
            description: 'Mince et longiligne',
            traits: 'Métabolisme rapide, difficulté à prendre du poids'
          },
          {
            id: 'M2',
            name: 'Mésomorphe',
            icon: '💪',
            description: 'Musclé et athlétique',
            traits: 'Prend facilement du muscle, corps équilibré'
          },
          {
            id: 'M3',
            name: 'Endomorphe',
            icon: '🧍',
            description: 'Corpulence forte',
            traits: 'Prend facilement du poids, métabolisme lent'
          },
          {
            id: 'M4',
            name: 'Mixte',
            icon: '⚖️',
            description: 'Combinaison de types',
            traits: 'Caractéristiques mixtes entre morphotypes'
          }
        ]
        
        return (
          <div className="step fade-in">
            <h2>Quel est votre morphotype ?</h2>
            <p className="subtitle">Sélectionnez le type qui vous correspond le mieux</p>
            <div className="morphotype-grid">
              {morphotypes.map(type => (
                <button
                  key={type.id}
                  className={`morphotype-card ${formData.morphotype === type.id ? 'selected' : ''}`}
                  onClick={() => handleChange('morphotype', type.id, true)}
                >
                  <div className="morphotype-icon">{type.icon}</div>
                  <div className="morphotype-content">
                    <div className="morphotype-title">
                      <span className="morphotype-id">{type.id}</span>
                      <span className="morphotype-name">{type.name}</span>
                    </div>
                    <p className="morphotype-description">{type.description}</p>
                    <p className="morphotype-traits">{type.traits}</p>
                  </div>
                </button>
              ))}
            </div>
            {errors.morphotype && <p className="error">{errors.morphotype}</p>}
          </div>
        )
      
      case 7:
        return (
          <div className="step fade-in">
            <h2>Activité physique</h2>
            <div className="options-grid">
              <button
                className={`option-card ${formData.activitePhysique === 'sedentaire' ? 'selected' : ''}`}
                onClick={() => handleChange('activitePhysique', 'sedentaire', true)}
              >
                <span className="icon">🪑</span>
                <span className="label">Sédentaire</span>
              </button>
              <button
                className={`option-card ${formData.activitePhysique === 'moderee' ? 'selected' : ''}`}
                onClick={() => handleChange('activitePhysique', 'moderee', true)}
              >
                <span className="icon">🚶</span>
                <span className="label">Modérée (30 min)</span>
              </button>
              <button
                className={`option-card ${formData.activitePhysique === 'elevee' ? 'selected' : ''}`}
                onClick={() => handleChange('activitePhysique', 'elevee', true)}
              >
                <span className="icon">🏃</span>
                <span className="label">Élevée (&gt;1H)</span>
              </button>
            </div>
            {errors.activitePhysique && <p className="error">{errors.activitePhysique}</p>}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="questionnaire">
      <div className="header">
        <h1>🥗 Nutrition Personnalisée</h1>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>
        <p className="step-indicator">Étape {currentStep} sur 7</p>
      </div>
      
      <div className="content">
        {renderStep()}
      </div>
      
      <div className="navigation">
        {currentStep > 1 && (
          <button className="btn-secondary" onClick={prevStep}>
            Précédent
          </button>
        )}
        <button className="btn-primary" onClick={nextStep}>
          {currentStep === 7 ? 'Générer mon menu' : 'Suivant'}
        </button>
      </div>

      {currentStep === 1 && (
        <div className="quote">
          <p>💬 "Désormais vous n'êtes plus seuls."</p>
        </div>
      )}
    </div>
  )
}

export default Questionnaire
