export type Project = {
    id: number
    name: string
    description: string
    created_at: string
  }
  
  export type Milestone = {
    id: number
    project_id: number
    name: string
    due_date: string
    status: 1 | 2 | 3
    tab_status: 'in_corso' | 'completato' | 'in_ritardo'
    created_at: string
  }