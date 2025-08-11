import { useEffect, useState } from 'react'
import { fetchData } from './utils/fetchApi'
import type { Project, Milestone } from './model/types'
import { fetchProjects, fetchMilestones } from './utils/fetchUtils'

// Export functions for testing


import {
  Box,
  Button,
  Checkbox,
  Container,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [milestoneForm, setMilestoneForm] = useState<Record<number, { name: string; due_date: string }>>({})

  // === Fetch data ===
  const fetchAllData = async () => {
    const projects = await fetchProjects()
    const milestones = await fetchMilestones()
    setProjects(projects)
    setMilestones(milestones)
  }
  useEffect(() => {
    fetchAllData()
  }, [])


  // === Form handling ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim()) return

    if (editingProject) {
      await fetchData.update('projects', form, { id: editingProject.id })
      setEditingProject(null)
    } else {
      await fetchData.insert('projects', form)
    }

    setForm({ name: '', description: '' })
    fetchAllData()
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setForm({ name: project.name, description: project.description })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Sicuro di eliminare?')) return
    await fetchData.remove('milestones', { project_id: id })
    await fetchData.remove('projects', { id })
    fetchAllData()
  }

  const handleCancel = () => {
    setEditingProject(null)
    setForm({ name: '', description: '' })
  }

  const handleMilestoneFormChange = (projectId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setMilestoneForm(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [e.target.name]: e.target.value,
      },
    }))
  }

  const handleAddMilestone = async (projectId: number) => {
    const { name, due_date } = milestoneForm[projectId] || { name: '', due_date: '' }
    if (!name || !due_date) return

    await fetchData.insert('milestones', { name, due_date, project_id: projectId, status: 1 })
    setMilestoneForm(prev => ({ ...prev, [projectId]: { name: '', due_date: '' } }))
    fetchAllData()
  }


  // === Helpers ===
  const getProjectMilestones = (projectId: number) =>
    milestones.filter(m => m.project_id === projectId).sort((a, b) => a.due_date.localeCompare(b.due_date))



  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Project Tracker
      </Typography>

      {/* Progetto form */}
      <Box sx={{ p: 4, mb: 6, borderRadius: 2, border: '1px solid rgb(75, 75, 75)' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField variant="standard" label="Nome progetto" name="name" value={form.name} onChange={handleChange} />
          <TextField
            label="Descrizione"
            name="description"
            variant="standard"
            value={form.description}
            onChange={handleChange}
            multiline
            rows={3}
          />
          <Box display="flex" gap={2}>
            <Button  variant="outlined" onClick={handleSubmit}>{editingProject ? 'Salva modifiche' : 'Crea progetto'}</Button>
            {editingProject && (
              <Button size="small" variant="outlined" onClick={handleCancel}>
                Annulla
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Lista progetti */}
      {projects.length === 0 ? (
        <Typography align="center" color="text.secondary">
          Nessun progetto ancora. Inizia creandone uno.
        </Typography>
      ) : (
        projects.map((p) => {
          const ms = getProjectMilestones(p.id)

          return (
            <Box key={p.id} sx={{ p: 4, mb: 5, borderRadius: 2, border: '1px solid rgb(75, 75, 75)' }}>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">{p.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {p.description}
                  </Typography>
                </Box>

                <Box display="flex" gap={1} >
                  <Button size="small" variant="outlined"  onClick={() => handleEdit(p)}>
                    Modifica
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(p.id)}>
                    Elimina
                  </Button>
                </Box>
              </Box>

              {/* Timeline */}
              {ms.length > 0 && (
                <Timeline sx={{ mt: 10, mb: 10, fontSize: '9px' }}  position="alternate" >
                  {ms.map((m) => (
                    <TimelineItem key={m.id}>
                      <TimelineSeparator>
                        <TimelineDot color={m.status === 2 ? 'success' : 'grey'} />
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Box  alignItems="center" gap={2}>
                          <Typography sx={{ textDecoration: m.status === 2 ? 'line-through' : 'none' }}>
                            {m.name}<br/>
                            <span style={{ fontSize: '10px', color: 'rgb(150, 150, 150)' }}>
                            {new Date(m.due_date).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                            </span>
                          </Typography>
                        </Box>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}

              {/* Nuova milestone */}
              <Box  mt={3} display="flex" justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row',  }} gap={2}>
                <Box display="flex" gap={2}>
                <TextField
                  label="Milestone"
                  name="name"
                  variant="standard"
                  value={milestoneForm[p.id]?.name || ''}
                  onChange={(e) => handleMilestoneFormChange(p.id, e)}
                />
                <TextField
                  label="Data"
                  name="due_date"
                  type="date"
                  variant="standard"
                  InputLabelProps={{ shrink: true }}
                  value={milestoneForm[p.id]?.due_date || ''}
                  onChange={(e) => handleMilestoneFormChange(p.id, e)}
                />
                </Box>
                <Button sx={{}} size="small" variant="outlined" onClick={() => handleAddMilestone(p.id)}>Aggiungi</Button>
              </Box>
            </Box>
          )
        })
      )}
    </Container>
  )
}

export default App
