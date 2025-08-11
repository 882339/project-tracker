import type { Milestone, Project } from '../model/types'
import { fetchData } from './fetchApi'


export const fetchProjects = async () => {
  const data = await fetchData.select('projects', { columns: '*' }) as Project[]
  return data
}

export const fetchMilestones = async () => {
  const data = await fetchData.select('milestones', { columns: '*' }) as Milestone[]
  return data;
}
