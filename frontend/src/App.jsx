import { useEffect, useMemo, useState } from 'react'
import { Check, CheckCircle2, Circle, ClipboardList, Plus, Trash2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.detail || `Request failed (${response.status})`)
    }
    return response.status === 204 ? null : response.json()
  }

  async function refresh() {
    try {
      setError('')
      setTasks(await request('/tasks'))
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  async function addTask(e) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const task = await request('/tasks', { method: 'POST', body: JSON.stringify({ title }) })
      setTasks(current => [task, ...current])
      setTitle('')
    } catch (e) { setError(e.message) }
  }

  async function toggleTask(task) {
    try {
      const updated = await request(`/tasks/${task.id}`, {
        method: 'PATCH', body: JSON.stringify({ completed: !task.completed })
      })
      setTasks(current => current.map(t => t.id === task.id ? updated : t))
    } catch (e) { setError(e.message) }
  }

  async function removeTask(id) {
    try {
      await request(`/tasks/${id}`, { method: 'DELETE' })
      setTasks(current => current.filter(t => t.id !== id))
    } catch (e) { setError(e.message) }
  }

  const visible = useMemo(() => tasks.filter(t =>
    filter === 'all' || (filter === 'active' && !t.completed) || (filter === 'done' && t.completed)
  ), [tasks, filter])
  const completed = tasks.filter(t => t.completed).length
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0

  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="brand-icon"><ClipboardList size={21}/></span> taskflow</div><span className="tag">STUDENT WORKSPACE</span></header>
    <section className="hero">
      <div><p className="eyebrow">YOUR PERSONAL PRODUCTIVITY SPACE</p><h1>Make room for<br/><span>great work.</span></h1><p className="sub">One task at a time. Keep your day moving forward.</p></div>
      <div className="progress-card"><div className="progress-head"><span>YOUR PROGRESS</span><strong>{progress}%</strong></div><div className="track"><div className="fill" style={{width:`${progress}%`}}/></div><p>{completed} of {tasks.length} tasks completed</p></div>
    </section>
    <section className="workspace">
      <div className="section-head"><div><p className="eyebrow">TASK BOARD</p><h2>Today's focus</h2></div><span className="count">{tasks.length} TOTAL</span></div>
      <form className="add-form" onSubmit={addTask}><Plus size={20}/><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="What needs to get done?" maxLength={200}/><button type="submit">Add task <Plus size={16}/></button></form>
      <div className="filters">{[['all','All tasks'],['active','In progress'],['done','Completed']].map(([key,label])=><button key={key} className={filter===key?'selected':''} onClick={()=>setFilter(key)}>{label}</button>)}</div>
      {error && <div className="error">{error} <button onClick={refresh}>Retry</button></div>}
      {loading ? <p className="empty">Loading your tasks…</p> : visible.length === 0 ? <div className="empty"><CheckCircle2 size={32}/><strong>You're all caught up.</strong><span>Add a task above to get started.</span></div> :
        <div className="task-list">{visible.map(task=><article className={`task ${task.completed?'is-done':''}`} key={task.id}><button className="check" aria-label="Toggle task" onClick={()=>toggleTask(task)}>{task.completed?<CheckCircle2 size={22}/>:<Circle size={22}/>}</button><span className="task-title">{task.title}</span><span className="status">{task.completed?'DONE':'IN PROGRESS'}</span><button className="delete" aria-label="Delete task" onClick={()=>removeTask(task.id)}><Trash2 size={17}/></button></article>)}</div>}
    </section>
    <footer>Built with React, FastAPI & AWS <span>✦</span> Keep showing up.</footer>
  </main>
}
