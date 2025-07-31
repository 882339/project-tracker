  import { SupabaseClient } from '@supabase/supabase-js'
  import { supabase } from '../supabaseClient'

type Operator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'like' | 'ilike' | 'is' | 'in' | 'not'
  | 'or' | 'filter'

type Filter =
  | ['eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in' | 'not', string, any]
  | ['or', string]
  | ['filter', string, string, any]



function applyFilter<T>(query: any, filter: Filter): any {
  const [op, ...args] = filter
  switch (op) {
    case 'or':
      query = query.or(args[0])
      break
    case 'filter':
      query = query.filter(args[0], args[1], args[2])
      break
    default:
      query = (query as any)[op](...args)
      break
  }
  return query
}



export const fetchData = {
  async select<T>(
    table: string,
    options?: {
      columns?: string
      match?: Record<string, any>
      filters?: Filter[]
      orderBy?: { column: string; ascending?: boolean }
    }
  ): Promise<T[]> {
    let query = supabase.from(table).select(options?.columns || '*')

    if (options?.match) {
      query = query.match(options.match)
    }

    if (options?.filters) {
      for (const filter of options.filters) {
        query = applyFilter(query, filter)
      }
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      })
    }

    const { data, error } = await query
    if (error) throw error
    return data as T[]
  },

  async insert(table: string, values: any | any[]) {
    const { error } = await supabase.from(table).insert(values)
    if (error) throw error
  },

  async update(table: string, values: any, match: any) {
    const { error } = await supabase.from(table).update(values).match(match)
    if (error) throw error
  },

  async remove(table: string, match: any) {
    const { error } = await supabase.from(table).delete().match(match)
    if (error) throw error
  },
}
