import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import type { Project, Milestone } from './model/types'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [milestoneForm, setMilestoneForm] = useState<{ [projectId: number]: { name: string; due_date: string } }>({})

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*')
    console.log(data)
    if (error) {
      console.error(error)
    } else {
      setProjects(data as Project[])
    }
  }

  const fetchMilestones = async () => {
    const { data, error } = await supabase.from('milestones').select('*')
    if (error) {
      console.error(error)
    } else {
      setMilestones(data as Milestone[])
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchMilestones()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (editingProject) {
      // Update
      const { error } = await supabase
        .from('projects')
        .update({ name: form.name, description: form.description })
        .eq('id', editingProject.id)
      console.log(error)
      if (error) alert('Errore aggiornamento')
      setEditingProject(null)
    } else {
      // Insert
      const { error } = await supabase
        .from('projects')
        .insert([{ name: form.name, description: form.description }])
      if (error) alert('Errore creazione')
    }
    setForm({ name: '', description: '' })
    setLoading(false)
    fetchProjects()
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setForm({ name: project.name, description: project.description })
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sicuro di eliminare?')) return
    setLoading(true)
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) alert('Errore eliminazione')
    setLoading(false)
    fetchProjects()
  }

  const handleCancel = () => {
    setEditingProject(null)
    setForm({ name: '', description: '' })
  }

  // Milestone handlers
  const handleMilestoneFormChange = (projectId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setMilestoneForm({
      ...milestoneForm,
      [projectId]: {
        ...milestoneForm[projectId],
        [e.target.name]: e.target.value,
      },
    })
  }

  const handleAddMilestone = async (e: React.FormEvent, projectId: number) => {
    e.preventDefault()
    setLoading(true)
    const { name, due_date } = milestoneForm[projectId] || { name: '', due_date: '' }
    if (!name || !due_date) {
      setLoading(false)
      return
    }
    const { error } = await supabase
      .from('milestones')
      .insert([{ name, due_date, project_id: projectId, status: 1 }])
    if (error) alert('Errore creazione milestone')
    setMilestoneForm({ ...milestoneForm, [projectId]: { name: '', due_date: '' } })
    setLoading(false)
    fetchMilestones()
  }

  const handleToggleMilestone = async (milestone: Milestone) => {
    setLoading(true)
    const newStatus = milestone.status === 2 ? 1 : 2
    const { error } = await supabase
      .from('milestones')
      .update({ status: newStatus })
      .eq('id', milestone.id)
    if (error) alert('Errore update milestone')
    setLoading(false)
    fetchMilestones()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h1>📁 I Miei Progetti</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <input
          name="name"
          placeholder="Nome progetto"
          value={form.name}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />
        <textarea
          name="description"
          placeholder="Descrizione"
          value={form.description}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ marginRight: 8 }}>
          {editingProject ? 'Salva modifiche' : 'Crea progetto'}
        </button>
        {editingProject && (
          <button type="button" onClick={handleCancel} disabled={loading}>
            Annulla
          </button>
        )}
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {projects.map((p) => (
          <li key={p.id} style={{ marginBottom: 32, border: '1px solid #ccc', borderRadius: 8, padding: 16 }}>
            <strong>{p.name}</strong> — {p.description}
            <div style={{ marginTop: 8 }}>
              <button onClick={() => handleEdit(p)} style={{ marginRight: 8 }} disabled={loading}>
                Modifica
              </button>
              <button onClick={() => handleDelete(p.id)} disabled={loading}>
                Elimina
              </button>
            </div>
            {/* Milestone timeline */}
            <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 12 }}>
              <h4 style={{ margin: 0, marginBottom: 8 }}>Milestone</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {milestones
                  .filter((m) => m.project_id === p.id)
                  .sort((a, b) => a.due_date.localeCompare(b.due_date))
                  .map((m) => (
                    <li key={m.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                      <input
                        type="checkbox"
                        checked={m.status === 2}
                        onChange={() => handleToggleMilestone(m)}
                        style={{ marginRight: 8 }}
                      />
                      <span style={{ textDecoration: m.status === 2 ? 'line-through' : 'none' }}>
                        {m.name} <span style={{ color: '#888', fontSize: 12 }}>({m.due_date})</span>
                      </span>
                    </li>
                  ))}
              </ul>
              <form onSubmit={(e) => handleAddMilestone(e, p.id)} style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <input
                  name="name"
                  placeholder="Nome milestone"
                  value={milestoneForm[p.id]?.name || ''}
                  onChange={(e) => handleMilestoneFormChange(p.id, e)}
                  required
                  style={{ flex: 2, padding: 6 }}
                />
                <input
                  name="due_date"
                  type="date"
                  value={milestoneForm[p.id]?.due_date || ''}
                  onChange={(e) => handleMilestoneFormChange(p.id, e)}
                  required
                  style={{ flex: 1, padding: 6 }}
                />
                <button type="submit" disabled={loading} style={{ flex: 1 }}>
                  Aggiungi
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
