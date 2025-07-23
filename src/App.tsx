import { useEffect, useState } from 'react'
import { fetchData } from './utils/fetchApi'
import type { Project, Milestone } from './model/types'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [milestoneForm, setMilestoneForm] = useState<{ [projectId: number]: { name: string; due_date: string } }>({})
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })

  const fetchProjects = async () => {
    const data = await fetchData.select('projects', { columns: '*' }) as Project[]
    setProjects(data)
  }

  const fetchMilestones = async () => {
    const data = await fetchData.select('milestones', { columns: '*' }) as Milestone[]
    setMilestones(data)
  }

  useEffect(() => {
    fetchProjects()
    fetchMilestones()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    }
  }, [isDarkMode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim()) return

    if (editingProject) {
      await fetchData.update('projects', { name: form.name, description: form.description }, { id: editingProject.id })
      setEditingProject(null)
    } else {
      await fetchData.insert('projects', { name: form.name, description: form.description })
    }
    setForm({ name: '', description: '' })
    fetchProjects()
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setForm({ name: project.name, description: project.description })
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sicuro di eliminare?')) return

    await fetchData.remove('milestones', { project_id: id })
    await fetchData.remove('projects', { id: id })

    fetchProjects()
  }

  const handleCancel = () => {
    setEditingProject(null)
    setForm({ name: '', description: '' })
  }

  const handleMilestoneFormChange = (projectId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setMilestoneForm({
      ...milestoneForm,
      [projectId]: {
        ...milestoneForm[projectId],
        [e.target.name]: e.target.value,
      },
    })
  }

  const handleAddMilestone = async (projectId: number) => {
    const { name, due_date } = milestoneForm[projectId] || { name: '', due_date: '' }
    if (!name || !due_date) {
      return
    }
    await fetchData.insert('milestones', { name, due_date, project_id: projectId, status: 1 })
    setMilestoneForm({ ...milestoneForm, [projectId]: { name: '', due_date: '' } })
    fetchMilestones()
  }

  const handleToggleMilestone = async (milestone: Milestone) => {
    const newStatus = milestone.status === 2 ? 1 : 2
    await fetchData.update('milestones', { status: newStatus }, { id: milestone.id })
    fetchMilestones()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getProjectMilestones = (projectId: number) => {
    return milestones
      .filter((m) => m.project_id === projectId)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
  }

  const getProjectProgress = (projectId: number) => {
    const projectMilestones = getProjectMilestones(projectId)
    if (projectMilestones.length === 0) return 0
    const completed = projectMilestones.filter(m => m.status === 2).length
    return Math.round((completed / projectMilestones.length) * 100)
  }


  return (
    <div className="project-tracker">
    <div className="project-tracker__content">
      <header className="project-tracker__header">
        <h1 className="project-tracker__title">
          📋 Project Tracker
        </h1>
        <p className="project-tracker__subtitle">
          Gestisci i tuoi progetti e milestone
        </p>
      </header>

      {/* Form per creare/modificare progetti */}
      <div className="card card--form">
        <h3 className="form-section__title">
          {editingProject ? '✏️ Modifica Progetto' : '➕ Nuovo Progetto'}
        </h3>
        
        <input
          name="name"
          placeholder="Nome progetto"
          value={form.name}
          onChange={handleChange}
          className="input"
        />
        
        <textarea
          name="description"
          placeholder="Descrizione progetto..."
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="input textarea"
        />
        
        <div>
          <button onClick={handleSubmit} className="btn btn--primary">
            {editingProject ? '💾 Salva modifiche' : '✨ Crea progetto'}
          </button>
          {editingProject && (
            <button onClick={handleCancel} className="btn btn--secondary">
              ❌ Annulla
            </button>
          )}
        </div>
      </div>

      {/* Lista progetti */}
      <div>
        {projects.map((project) => {
          const projectMilestones = getProjectMilestones(project.id)
          const progress = getProjectProgress(project.id)
          
          return (
            <div key={project.id} className="card project-card">
              <div className="project-card__header">
                <div className="project-card__content">
                  <h2 className="project-card__title">
                    {project.name}
                  </h2>
                  <p className="project-card__description">
                    {project.description}
                  </p>
                  
                  {projectMilestones.length > 0 && (
                    <div className="progress-section">
                      <div className="progress-info">
                        <span>Progresso: {progress}%</span>
                        <span>({projectMilestones.filter(m => m.status === 2).length}/{projectMilestones.length})</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-bar__fill ${progress === 100 ? 'progress-bar__fill--complete' : 'progress-bar__fill--incomplete'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="project-card__actions">
                  <button 
                    onClick={() => handleEdit(project)} 
                    className="btn btn--secondary btn--icon"
                    title="Modifica progetto"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)} 
                    className="btn btn--danger btn--icon"
                    title="Elimina progetto"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Sezione Timeline Milestone */}
              <div className="timeline-section">
                <h4 className="timeline-header">
                  🎯 Milestone
                  <span className="timeline-badge">
                    {projectMilestones.length}
                  </span>
                </h4>
                
                {projectMilestones.length > 0 && (
                  <div className="timeline">
                    <div className="timeline__line" />
                    {projectMilestones.map((milestone, index) => (
                      <div key={milestone.id} className="timeline-item">
                        <div className={`timeline-item__dot ${milestone.status === 2 ? 'timeline-item__dot--completed' : 'timeline-item__dot--pending'}`} />
                        
                        <div className={`timeline-item__content ${milestone.status === 2 ? 'timeline-item__content--completed' : 'timeline-item__content--pending'}`}>
                          <div className="timeline-item__main">
                            <input
                              type="checkbox"
                              checked={milestone.status === 2}
                              onChange={() => handleToggleMilestone(milestone)}
                              className="timeline-item__checkbox"
                            />
                            
                            <div className="timeline-item__details">
                              <div className={`timeline-item__name ${milestone.status === 2 ? 'timeline-item__name--completed' : ''}`}>
                                {milestone.name}
                              </div>
                              
                              <div className="timeline-item__meta">
                                📅 {formatDate(milestone.due_date)}
                                {milestone.status === 2 && (
                                  <span className="timeline-item__status">
                                    ✓ Completato
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Form per aggiungere nuove milestone */}
                <div className="milestone-form">
                  <div className="milestone-form__grid">
                    <input
                      name="name"
                      placeholder="Nuova milestone..."
                      value={milestoneForm[project.id]?.name || ''}
                      onChange={(e) => handleMilestoneFormChange(project.id, e)}
                      className="input"
                    />
                    
                    <input
                      name="due_date"
                      type="date"
                      value={milestoneForm[project.id]?.due_date || ''}
                      onChange={(e) => handleMilestoneFormChange(project.id, e)}
                      className="input"
                    />
                    
                    <button 
                      onClick={() => handleAddMilestone(project.id)}
                      className="btn btn--primary"
                    >
                      ➕ Aggiungi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Empty state */}
        {projects.length === 0 && (
          <div className="card card--empty">
            <div className="empty-state__icon">📝</div>
            <h3 className="empty-state__title">
              Nessun progetto ancora
            </h3>
            <p className="empty-state__text">
              Inizia creando il tuo primo progetto usando il form qui sopra!
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}

export default App
