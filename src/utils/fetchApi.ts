import { supabase } from '../supabaseClient'

export const fetchData = {
  async select<T>(
    table: string,
    options?: {
      columns?: string  // es: 'id, name, description'
      match?: Record<string, any>
      orderBy?: { column: string; ascending?: boolean }
    }
  ): Promise<T[]> {
    let query = supabase.from(table).select(options?.columns || '*')

    if (options?.match) {
      query = query.match(options.match)
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
