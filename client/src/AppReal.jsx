import { useEffect, useMemo, useState } from 'react'
import {
  createCampaign,
  createLocation,
  createNpc,
  createSession,
  deleteCampaign,
  deleteLocation,
  deleteNpc,
  deleteSession,
  listCampaigns,
  listLocations,
  listNpcs,
  listSessions,
  login,
  register,
  updateCampaign,
  updateLocation,
  updateNpc,
  updateSession,
} from './api/lorekeeperApi.js'

function Logo({ compact = false }) {
  return (
    <div className={`logo ${compact ? 'logo-compact' : ''}`} aria-label="Lorekeeper">
      <img src="/lorekeeper-logo.png" alt="" />
    </div>
  )
}

const views = [
  ['dashboard', '◆', 'Dashboard'],
  ['npcs', '♙', 'NPCs'],
  ['locations', '⌂', 'Locations'],
  ['sessions', '✎', 'Sessions'],
]

function storedUser() {
  try { return JSON.parse(localStorage.getItem('lorekeeper:user') || 'null') } catch { localStorage.removeItem('lorekeeper:user'); return null }
}

function FormModal({ type, item, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(item || (type === 'session' ? { title: '', date: new Date().toISOString().slice(0, 10), recap: '' } : { name: '', description: '', role: '', notes: '' }))
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value })
  const labels = type === 'campaign' ? ['name', 'description'] : type === 'npc' ? ['name', 'role', 'description', 'notes'] : type === 'location' ? ['name', 'description', 'notes'] : ['title', 'date', 'recap']

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal-card" onSubmit={(event) => { event.preventDefault(); onSubmit(form) }}>
        <div className="modal-head"><h2>{item ? 'Edit' : 'New'} {type}</h2><button className="icon-button" type="button" onClick={onClose} aria-label="Close">×</button></div>
        {labels.map((key) => (
          <label className="field" key={key}>{key === 'description' || key === 'notes' || key === 'recap' ? key : key}
            {key === 'description' || key === 'notes' || key === 'recap' ? <textarea rows="4" value={form[key]} onChange={update(key)} /> : <input required={key === 'name' || key === 'title'} type={key === 'date' ? 'date' : 'text'} value={form[key]} onChange={update(key)} />}
          </label>
        ))}
        <button className="btn primary block" disabled={loading} type="submit">{loading ? 'Saving...' : 'Save to campaign'}</button>
      </form>
    </div>
  )
}

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value })

  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true)
    try {
      const result = mode === 'login' ? await login(form.email, form.password) : await register(form.name, form.email, form.password)
      onAuthenticated(result.user)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }

  return <main className="auth-screen"><form className="login-card" onSubmit={submit}><Logo /><p className="login-sub">Your campaign, remembered.</p>{mode === 'register' && <label className="field">Name<input required value={form.name} onChange={update('name')} /></label>}<label className="field">Email<input required type="email" value={form.email} onChange={update('email')} /></label><label className="field">Password<input required type="password" value={form.password} onChange={update('password')} /></label>{error && <div className="error-message">{error}</div>}<button className="btn primary block" disabled={loading} type="submit">{loading ? 'Opening...' : mode === 'login' ? 'Enter the Realm' : 'Create account'}</button><button className="text-button" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></form></main>
}

function AppReal() {
  const [user, setUser] = useState(storedUser)
  const [campaigns, setCampaigns] = useState([])
  const [campaign, setCampaign] = useState(null)
  const [view, setView] = useState('dashboard')
  const [data, setData] = useState({ npcs: [], locations: [], sessions: [] })
  const [modal, setModal] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) listCampaigns(user.id).then((rows) => { setCampaigns(rows); setCampaign(rows[0] || null) }).catch((e) => setError(e.message)) }, [user])
  useEffect(() => {
    if (!campaign || !user) return
    Promise.all([listNpcs(campaign.id, user.id), listLocations(campaign.id, user.id), listSessions(campaign.id, user.id)]).then(([npcs, locations, sessions]) => setData({ npcs, locations, sessions })).catch((e) => setError(e.message))
  }, [campaign, user])

  function authenticated(nextUser) { localStorage.setItem('lorekeeper:user', JSON.stringify(nextUser)); setUser(nextUser) }
  function signOut() { localStorage.removeItem('lorekeeper:user'); setUser(null); setCampaign(null) }
  async function saveEntity(input) {
    setLoading(true); setError('')
    try {
      const payload = { ...input, userId: user.id }
      if (modal === 'campaign') {
        const result = editingItem ? await updateCampaign(editingItem.id, payload) : await createCampaign(payload)
        setCampaigns((current) => editingItem ? current.map((entry) => entry.id === result.id ? result : entry) : [result, ...current]); setCampaign(result); setModal(null); setEditingItem(null); return
      }
      const result = editingItem
        ? modal === 'npc' ? await updateNpc(campaign.id, editingItem.id, payload) : modal === 'location' ? await updateLocation(campaign.id, editingItem.id, payload) : await updateSession(campaign.id, editingItem.id, payload)
        : modal === 'npc' ? await createNpc(campaign.id, payload) : modal === 'location' ? await createLocation(campaign.id, payload) : await createSession(campaign.id, payload)
      const key = `${modal}s`
      setData((current) => ({ ...current, [key]: editingItem ? current[key].map((item) => item.id === result.id ? result : item) : [result, ...current[key]] })); setModal(null); setEditingItem(null)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  async function removeEntity(type, item) {
    if (!window.confirm(`Delete ${item.name || item.title}?`)) return
    try {
      if (type === 'npcs') await deleteNpc(campaign.id, item.id, user.id)
      if (type === 'locations') await deleteLocation(campaign.id, item.id, user.id)
      if (type === 'sessions') await deleteSession(campaign.id, item.id, user.id)
      setData((current) => ({ ...current, [type]: current[type].filter((entry) => entry.id !== item.id) }))
    } catch (e) { setError(e.message) }
  }

  async function removeCampaign() {
    if (!campaign || !window.confirm(`Delete ${campaign.name}? This removes its NPCs, locations, and sessions.`)) return
    try {
      await deleteCampaign(campaign.id, user.id)
      const remaining = campaigns.filter((entry) => entry.id !== campaign.id)
      setCampaigns(remaining); setCampaign(remaining[0] || null); setData({ npcs: [], locations: [], sessions: [] })
    } catch (e) { setError(e.message) }
  }

  const title = useMemo(() => views.find(([key]) => key === view)?.[2] || 'Dashboard', [view])
  if (!user) return <Auth onAuthenticated={authenticated} />

  const stats = { npcs: data.npcs.length, locations: data.locations.length, sessions: data.sessions.length }
  const items = data[view] || []
  return <div className="app-shell">
    <aside className="sidebar"><Logo /><div className="campaign-picker"><small>Current campaign</small><select value={campaign?.id || ''} onChange={(event) => setCampaign(campaigns.find((entry) => String(entry.id) === event.target.value) || null)}><option value="" disabled>Select campaign</option>{campaigns.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select><div className="campaign-actions"><button className="campaign-add" type="button" onClick={() => { setEditingItem(null); setModal('campaign') }}>+ New</button>{campaign && <><button className="campaign-add" type="button" onClick={() => { setEditingItem(campaign); setModal('campaign') }}>Edit</button><button className="campaign-add danger-link" type="button" onClick={removeCampaign}>Delete</button></>}</div></div><div className="nav-label">THIS CAMPAIGN</div>{views.map(([key, icon, label]) => <button key={key} className={`nav-item ${view === key ? 'active' : ''}`} onClick={() => setView(key)} type="button"><span>{icon}</span>{label}</button>)}<div className="sidebar-foot"><button className="nav-item" onClick={signOut} type="button"><span>↪</span>Sign out</button><div className="user-chip"><span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span>{user.name}</div></div></aside>
    <main className="main"><header className="topbar"><div><h2>{title}</h2><div className="path">Campaign / {title}</div></div>{campaign && view !== 'dashboard' && <button className="btn primary small" onClick={() => { setEditingItem(null); setModal(view === 'npcs' ? 'npc' : view === 'locations' ? 'location' : 'session') }} type="button">+ New {view === 'npcs' ? 'NPC' : view === 'locations' ? 'Location' : 'Session'}</button>}</header><section className="view">{error && <div className="error-message">{error}</div>}{!campaign ? <EmptyCampaign onCreated={(created) => { setCampaigns([created, ...campaigns]); setCampaign(created) }} userId={user.id} /> : view === 'dashboard' ? <Dashboard campaign={campaign} stats={stats} sessions={data.sessions} onNavigate={setView} /> : <EntityView type={view} items={items} onEdit={(item) => { setEditingItem(item); setModal(view === 'npcs' ? 'npc' : view === 'locations' ? 'location' : 'session') }} onDelete={(item) => removeEntity(view, item)} />}</section></main>
    {modal && <FormModal type={modal} item={editingItem} onClose={() => { setModal(null); setEditingItem(null) }} onSubmit={saveEntity} loading={loading} />}
  </div>
}

function EmptyCampaign({ userId, onCreated }) { const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false); return <div className="empty-state"><div className="eyebrow">Your vault awaits</div><h1>Create your first campaign</h1><p>Build a living record for every character, place, and session.</p><form onSubmit={async (event) => { event.preventDefault(); setSaving(true); setError(''); try { const created = await createCampaign({ userId, name, description }); onCreated(created) } catch (e) { setError(e.message) } finally { setSaving(false) } }}><input required placeholder="Campaign name" value={name} onChange={(e) => setName(e.target.value)} /><textarea placeholder="What is this story about?" value={description} onChange={(e) => setDescription(e.target.value)} />{error && <div className="error-message">{error}</div>}<button className="btn primary" disabled={saving} type="submit">{saving ? 'Creating...' : 'Create campaign'}</button></form></div> }
function Dashboard({ campaign, stats, sessions, onNavigate }) { return <><div className="dash-hero"><div className="eyebrow">Campaign master</div><h1>{campaign.name}</h1><p>{campaign.description || 'Your campaign story begins here.'}</p></div><div className="stat-row">{[['npcs', 'NPCs'], ['locations', 'Locations'], ['sessions', 'Sessions']].map(([key, label]) => <button className="stat-box" key={key} onClick={() => onNavigate(key)} type="button"><span className="num">{stats[key]}</span><span className="lbl">{label}</span></button>)}</div><div className="section-title"><h3>Recent sessions</h3><button className="btn small" onClick={() => onNavigate('sessions')} type="button">View journal</button></div>{sessions.length ? sessions.slice(0, 3).map((session) => <article className="recap-card" key={session.id}><div><div className="rc-date">{session.date}</div><h4>{session.title}</h4><p>{session.recap}</p></div></article>) : <div className="card muted">No sessions recorded yet.</div>}</> }
function EntityView({ type, items, onEdit, onDelete }) { return <div className="entity-list">{items.length ? items.map((item) => <article className="entity-row" key={item.id}><div className="portrait">{(item.name || item.title).slice(0, 2).toUpperCase()}</div><div className="body"><h4>{item.name || item.title}{item.role && <span className="role-pill">{item.role}</span>}</h4><p>{item.description || item.recap || item.notes || 'No notes added yet.'}</p><div className="meta"><span className="tag">Saved in Lorekeeper</span></div></div><div className="entity-actions"><button className="icon-button" type="button" onClick={() => onEdit(item)} aria-label={`Edit ${item.name || item.title}`}>✎</button><button className="icon-button danger-icon" type="button" onClick={() => onDelete(item)} aria-label={`Delete ${item.name || item.title}`}>×</button></div></article>) : <div className="empty-state compact"><h2>No {type} yet</h2><p>Use the button above to add the first one to this campaign.</p></div>}</div> }

export default AppReal
