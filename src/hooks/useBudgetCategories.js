import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export function useBudgetCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    const { data, error: err } = await supabase
      .from('budget_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (err) setError(err.message)
    else {
      setCategories(data || [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel('budget_categories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_categories' }, () => {
        fetchCategories()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchCategories])

  const addCategory = useCallback(async (payload) => {
    const { error: err } = await supabase.from('budget_categories').insert({
      name: payload.name,
      planned_amount: payload.planned_amount || 0,
      vendor: payload.vendor || '',
      sub_items: payload.sub_items || [],
      sort_order: payload.sort_order ?? 999,
    })
    if (err) throw new Error(err.message)
  }, [])

  const updateCategory = useCallback(async (id, payload) => {
    const { error: err } = await supabase.from('budget_categories').update(payload).eq('id', id)
    if (err) throw new Error(err.message)
  }, [])

  const deleteCategory = useCallback(async (id) => {
    const { error: err } = await supabase.from('budget_categories').delete().eq('id', id)
    if (err) throw new Error(err.message)
  }, [])

  return { categories, loading, error, addCategory, updateCategory, deleteCategory, refetch: fetchCategories }
}
