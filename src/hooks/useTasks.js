import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    const { data, error: err } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })
    if (err) setError(err.message)
    else {
      setTasks(data || [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks])

  const addTask = useCallback(async (payload) => {
    const { error: err } = await supabase.from('tasks').insert(payload)
    if (err) throw new Error(err.message)
  }, [])

  const updateTask = useCallback(async (id, payload) => {
    const { error: err } = await supabase.from('tasks').update(payload).eq('id', id)
    if (err) throw new Error(err.message)
  }, [])

  const deleteTask = useCallback(async (id) => {
    const { error: err } = await supabase.from('tasks').delete().eq('id', id)
    if (err) throw new Error(err.message)
  }, [])

  return { tasks, loading, error, addTask, updateTask, deleteTask, refetch: fetchTasks }
}
