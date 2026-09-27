import { useEffect, useMemo, useState } from 'react'
import {
  changePassword,
  createCampaign,
  createLocation,
  createNpc,
  createSession,
  clearAuthToken,
  deleteCampaign,
  deleteLocation,
  deleteNpc,
  deleteSession,
  getCurrentUser,
  listCampaigns,
  listLocations,
  listNpcs,
  listSessions,
  login,
  register,
  updateCampaign,
  updateLocation,
  updateNpc,
  updateProfile,
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

const mobileTabs = [
  ['dashboard', '◆', 'Home'],
  ['sessions', '✎', 'Journal'],
  ['campaign-switcher', '✦', 'Campaign'],
]

function Particles() {
  return <div className="particle-field" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} />)}</div>
}

function CampaignSwitcher({ campaigns, campaign, open, onToggle, onSelect, onCreate, className = '', onClose }) {
  return (
    <div className={`campaign-switcher ${className}`}>
      <button className="campaign-switcher-trigger" type="button" aria-expanded={open} onClick={onToggle}>
        <span className="campaign-sigil">{(campaign?.name || 'L').slice(0, 1).toUpperCase()}</span>
        <span className="campaign-switcher-label"><small>Current campaign</small><strong>{campaign?.name || 'Choose a campaign'}</strong></span>
        <span className="campaign-chevron" aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="campaign-menu" role="dialog" aria-modal="false" aria-label="Campaign selector">
          <div className="campaign-menu-header">
            <div>Your campaigns</div>
            <button className="campaign-menu-close" type="button" aria-label="Close campaign menu" onClick={onClose || onToggle}>×</button>
          </div>
          <div className="campaign-menu-list">
            {campaigns.map((entry) => (
              <button className={`campaign-option ${campaign?.id === entry.id ? 'active' : ''}`} key={entry.id} type="button" role="menuitem" onClick={() => onSelect(entry)}>
                <span className="campaign-option-mark">{campaign?.id === entry.id ? '✓' : '○'}</span>
                <span className="campaign-option-text">{entry.name}</span>
              </button>
            ))}
          </div>
          <div className="campaign-menu-divider" />
          <button className="campaign-create-option" type="button" onClick={onCreate}><span className="campaign-create-plus">+</span> Create new campaign</button>
        </div>
      )}
    </div>
  )
}

function MobileCampaignSheet({ campaigns, campaign, open, onSelect, onCreate, onClose }) {
  if (!open) return null

  return (
    <div className="mobile-campaign-sheet" role="dialog" aria-modal="false" aria-label="Campaign selector">
      <button className="mobile-campaign-backdrop" type="button" aria-label="Close campaign selector" onClick={onClose} />
      <div className="mobile-campaign-panel">
        <div className="mobile-campaign-header">
          <div>Campaigns</div>
          <button className="campaign-menu-close" type="button" aria-label="Close campaign menu" onClick={onClose}>×</button>
        </div>
        <div className="campaign-menu-list">
          {campaigns.map((entry) => (
            <button className={`campaign-option ${campaign?.id === entry.id ? 'active' : ''}`} key={entry.id} type="button" role="menuitem" onClick={() => onSelect(entry)}>
              <span className="campaign-option-mark">{campaign?.id === entry.id ? '✓' : '○'}</span>
              <span className="campaign-option-text">{entry.name}</span>
            </button>
          ))}
        </div>
        <div className="campaign-menu-divider" />
        <button className="campaign-create-option" type="button" onClick={onCreate}><span className="campaign-create-plus">+</span> Create new campaign</button>
      </div>
    </div>
  )
}

function storedUser() {
  try { return JSON.parse(localStorage.getItem('lorekeeper:user') || 'null') } catch { localStorage.removeItem('lorekeeper:user'); return null }
}

function FormModal({ type, item, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(item || (type === 'session' ? { title: '', date: new Date().toISOString().slice(0, 10), recap: '' } : { name: '', description: '', role: '', notes: '' }))

  useEffect(() => {
    setForm(item || (type === 'session' ? { title: '', date: new Date().toISOString().slice(0, 10), recap: '' } : { name: '', description: '', role: '', notes: '' }))
  }, [type, item])

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const labels = type === 'campaign' ? ['name', 'description'] : type === 'npc' ? ['name', 'role', 'description', 'notes'] : type === 'location' ? ['name', 'description', 'notes'] : ['title', 'date', 'recap']

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal-card" onSubmit={(event) => { event.preventDefault(); onSubmit(form) }}>
        <div className="modal-head">
          <h2>{item ? 'Edit' : 'New'} {type}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">×</button>
        </div>
        {labels.map((key) => {
          const isTextArea = key === 'description' || key === 'notes' || key === 'recap'
          const isRequired = key === 'name' || key === 'title'
          return (
            <label className="field" key={key}>
              {key}
              {isTextArea ? (
                <textarea rows="4" value={form[key] ?? ''} onChange={update(key)} required={isRequired} />
              ) : (
                <input required={isRequired} type={key === 'date' ? 'date' : 'text'} value={form[key] ?? ''} onChange={update(key)} />
              )}
            </label>
          )
        })}
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
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true)
    try {
      const email = form.email.trim()
      const password = form.password
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address.')
      }
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long.')
      }
      if (mode === 'register' && !form.name.trim()) {
        throw new Error('Name is required.')
      }
      const result = mode === 'login' ? await login(email, password) : await register(form.name.trim(), email, password)
      onAuthenticated(result.user)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }

  return (
    <>
      <Particles />
      <main className="auth-screen" data-mode={mode}>
        <form className="login-card" onSubmit={submit}>
        <div className="auth-brand"><Logo /></div>
        <div className="auth-kicker">The living archive</div>
        <h1 className="auth-title">{mode === 'login' ? 'Welcome back' : 'Begin your journey'}</h1>
        <p className="login-sub">{mode === 'login' ? 'Continue your journey through the realm.' : 'Create your Lorekeeper account and start building your world.'}</p>
        {mode === 'register' && (
          <label className="field">
            Name
            <input required autoComplete="name" placeholder="Your name" value={form.name} onChange={update('name')} />
          </label>
        )}
        <label className="field">
          Email
          <input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
        </label>
        <label className="field">
          Password
          <input required type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Enter your password" value={form.password} onChange={update('password')} />
        </label>
        {error && <div className="error-message">{error}</div>}
        <button className="btn primary block auth-submit" disabled={loading} type="submit">{loading ? 'Opening...' : mode === 'login' ? 'Enter the Realm' : 'Create account'}</button>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setMode((current) => (current === 'login' ? 'register' : 'login'))
            setError('')
          }}
        >
          <span>{mode === 'login' ? 'New here?' : 'Already have an account?'}</span> {mode === 'login' ? 'Create an account' : 'Sign in'}
        </button>
        </form>
      </main>
    </>
  )
}

function AppReal() {
  const [user, setUser] = useState(storedUser)
  const [campaigns, setCampaigns] = useState([])
  const [campaign, setCampaign] = useState(null)
  const [campaignMenuOpen, setCampaignMenuOpen] = useState(false)
  const [view, setView] = useState('dashboard')
  const [data, setData] = useState({ npcs: [], locations: [], sessions: [] })
  const [modal, setModal] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') setCampaignMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!user) return

    listCampaigns()
      .then((rows) => {
        setCampaigns(rows)
        const savedId = localStorage.getItem('lorekeeper:campaign-id')
        setCampaign((current) => {
          if (current && rows.some((row) => row.id === current.id)) return current
          const selected = rows.find((row) => String(row.id) === savedId) || rows[0] || null
          if (selected) localStorage.setItem('lorekeeper:campaign-id', String(selected.id))
          return selected
        })
      })
      .catch((e) => setError(e.message))
  }, [user])

  useEffect(() => {
    if (!campaign || !user) return

    let active = true
    setDataLoading(true)
    setData({ npcs: [], locations: [], sessions: [] })
    Promise.all([listNpcs(campaign.id), listLocations(campaign.id), listSessions(campaign.id)])
      .then(([npcs, locations, sessions]) => { if (active) setData({ npcs, locations, sessions }) })
      .catch((e) => { if (active) setError(e.message) })
      .finally(() => { if (active) setDataLoading(false) })
    return () => { active = false }
  }, [campaign, user])

  function selectCampaign(nextCampaign) {
    setCampaignMenuOpen(false)
    setError('')
    setNotice('')
    setData({ npcs: [], locations: [], sessions: [] })
    setCampaign(nextCampaign)
    localStorage.setItem('lorekeeper:campaign-id', String(nextCampaign.id))
  }

  function startCampaignCreation() {
    setCampaignMenuOpen(false)
    setModal(null)
    setEditingItem(null)
    setError('')
    setNotice('')
    setView('create-campaign')
  }

  function authenticated(nextUser) {
    localStorage.setItem('lorekeeper:user', JSON.stringify(nextUser))
    setUser(nextUser)
    setView('dashboard')
    setError('')
    setNotice('')
  }

  function updateAuthenticatedUser(nextUser) {
    localStorage.setItem('lorekeeper:user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  function signOut() {
    clearAuthToken()
    localStorage.removeItem('lorekeeper:user')
    setUser(null)
    setCampaign(null)
    localStorage.removeItem('lorekeeper:campaign-id')
    setCampaigns([])
    setData({ npcs: [], locations: [], sessions: [] })
    setView('dashboard')
    setError('')
    setNotice('')
  }

  async function saveEntity(input) {
    setLoading(true); setError(''); setNotice('')
    try {
      const payload = { ...input }
      if (modal === 'campaign') {
        const result = editingItem ? await updateCampaign(editingItem.id, payload) : await createCampaign(payload)
        setCampaigns((current) => editingItem ? current.map((entry) => entry.id === result.id ? result : entry) : [result, ...current])
        setCampaign(result)
        localStorage.setItem('lorekeeper:campaign-id', String(result.id))
        setModal(null)
        setEditingItem(null)
        setNotice(editingItem ? 'Campaign updated successfully.' : 'Campaign saved successfully.')
        return
      }

      const result = editingItem
        ? modal === 'npc'
          ? await updateNpc(campaign.id, editingItem.id, payload)
          : modal === 'location'
            ? await updateLocation(campaign.id, editingItem.id, payload)
            : await updateSession(campaign.id, editingItem.id, payload)
        : modal === 'npc'
          ? await createNpc(campaign.id, payload)
          : modal === 'location'
            ? await createLocation(campaign.id, payload)
            : await createSession(campaign.id, payload)

      const key = `${modal}s`
      setData((current) => ({
        ...current,
        [key]: editingItem ? current[key].map((item) => item.id === result.id ? result : item) : [result, ...current[key]],
      }))
      setModal(null)
      setEditingItem(null)
      setNotice(`${editingItem ? 'Updated' : 'Saved'} ${modal} successfully.`)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function removeEntity(type, item) {
    if (!window.confirm(`Delete ${item.name || item.title}?`)) return
    try {
      setError(''); setNotice('')
      if (type === 'npcs') await deleteNpc(campaign.id, item.id)
      if (type === 'locations') await deleteLocation(campaign.id, item.id)
      if (type === 'sessions') await deleteSession(campaign.id, item.id)

      setData((current) => ({ ...current, [type]: current[type].filter((entry) => entry.id !== item.id) }))
      setNotice(`${item.name || item.title} deleted successfully.`)
    } catch (e) {
      setError(e.message)
    }
  }

  async function removeCampaign() {
    if (!campaign || !window.confirm(`Delete ${campaign.name}? This removes its NPCs, locations, and sessions.`)) return
    try {
      setError(''); setNotice('')
      await deleteCampaign(campaign.id)
      const remaining = campaigns.filter((entry) => entry.id !== campaign.id)
      setCampaigns(remaining)
      setCampaign(remaining[0] || null)
      setData({ npcs: [], locations: [], sessions: [] })
      setNotice('Campaign deleted successfully.')
    } catch (e) {
      setError(e.message)
    }
  }

  const title = useMemo(() => view === 'create-campaign' ? 'Create campaign' : views.find(([key]) => key === view)?.[2] || 'Dashboard', [view])
  if (!user) return <Auth onAuthenticated={authenticated} />

  const stats = { npcs: data.npcs.length, locations: data.locations.length, sessions: data.sessions.length }
  const items = data[view] || []

  return (
    <div className="app-shell">
      <Particles />
      <aside className="sidebar">
        <Logo />
        <CampaignSwitcher campaigns={campaigns} campaign={campaign} open={campaignMenuOpen} onToggle={() => setCampaignMenuOpen((current) => !current)} onSelect={selectCampaign} onCreate={startCampaignCreation} onClose={() => setCampaignMenuOpen(false)} />
        <div className="campaign-caption sidebar-campaign-caption">{campaign?.description || 'A living archive for your world.'}</div>
        <div className="campaign-picker-actions">
          <div className="campaign-actions">
            <button className="campaign-add" type="button" onClick={startCampaignCreation}>+ New</button>
            {campaign && (
              <>
                <button className="campaign-add" type="button" onClick={() => { setEditingItem(campaign); setModal('campaign') }}>Edit</button>
                <button className="campaign-add danger-link" type="button" onClick={removeCampaign}>Delete</button>
              </>
            )}
          </div>
        </div>
        <div className="nav-label">WORLD ATLAS</div>
        {views.map(([key, icon, label]) => (
          <button key={key} className={`nav-item ${view === key ? 'active' : ''}`} onClick={() => setView(key)} type="button">
            <span>{icon}</span>{label}
          </button>
        ))}
        <div className="sidebar-foot">
          <button className={`nav-item ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')} type="button"><span>⚙</span>Profile</button>
          <button className="user-chip" onClick={() => setView('profile')} type="button"><span className="avatar">{(user.name || 'U').slice(0, 2).toUpperCase()}</span>{user.name}</button>
        </div>
      </aside>

      <nav className="tabbar" aria-label="Main navigation">
        {mobileTabs.map(([key, icon, label]) => (
          <button key={key} className={`tab ${key === 'campaign-switcher' ? campaignMenuOpen ? 'active' : '' : view === key ? 'active' : ''}`} onClick={() => key === 'campaign-switcher' ? setCampaignMenuOpen((current) => !current) : setView(key)} type="button">
            <span aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className="main">
        <header className="mobile-header">
          <Logo />
          <button className="mobile-profile" onClick={() => setView('profile')} type="button" aria-label="Open profile">
            <span className="avatar">{(user.name || 'U').slice(0, 2).toUpperCase()}</span>
          </button>
        </header>

        <header className="topbar">
          <div>
            <h2>{view === 'profile' ? 'Profile' : title}</h2>
            <div className="path">{view === 'profile' ? 'Account / Profile' : `Campaign / ${title}`}</div>
          </div>
          {campaign && view === 'dashboard' && (
            <div className="campaign-top-actions">
              <button className="btn small" onClick={() => { setEditingItem(campaign); setModal('campaign') }} type="button">Edit campaign</button>
              <button className="btn small danger-link" onClick={removeCampaign} type="button">Delete</button>
            </div>
          )}
          {campaign && view !== 'dashboard' && view !== 'profile' && view !== 'create-campaign' && (
            <button className="btn primary small" onClick={() => { setEditingItem(null); setModal(view === 'npcs' ? 'npc' : view === 'locations' ? 'location' : 'session') }} type="button">+ New {view === 'npcs' ? 'NPC' : view === 'locations' ? 'Location' : 'Session'}</button>
          )}
          <button className="desktop-profile" onClick={() => setView('profile')} type="button" aria-label="Open profile">
            <span className="avatar">{(user.name || 'U').slice(0, 2).toUpperCase()}</span>
          </button>
        </header>

        <MobileCampaignSheet campaigns={campaigns} campaign={campaign} open={campaignMenuOpen} onSelect={selectCampaign} onCreate={startCampaignCreation} onClose={() => setCampaignMenuOpen(false)} />

        <section className="view">
          {error && <div className="error-message">{error}</div>}
          {notice && <div className="success-message" role="status">{notice}</div>}
          {view === 'profile' ? (
            <SettingsView user={user} onUserUpdated={updateAuthenticatedUser} onSignOut={signOut} />
          ) : view === 'create-campaign' ? (
            <CampaignCreation onCreated={(created) => { setCampaigns((current) => [created, ...current]); setCampaign(created); localStorage.setItem('lorekeeper:campaign-id', String(created.id)); setView('dashboard'); setNotice('Campaign saved successfully.') }} onCancel={() => setView(campaign ? 'dashboard' : 'dashboard')} />
          ) : !campaign ? (
            <EmptyCampaign onCreated={(created) => { setCampaigns((current) => [created, ...current]); setCampaign(created); localStorage.setItem('lorekeeper:campaign-id', String(created.id)); setNotice('Campaign saved successfully.') }} />
          ) : dataLoading ? (
            <div className="loading-state">Opening the campaign chronicle...</div>
          ) : view === 'dashboard' ? (
            <Dashboard campaign={campaign} stats={stats} sessions={data.sessions} onNavigate={setView} onNew={(type) => { setEditingItem(null); setModal(type) }} />
          ) : (
            <EntityView type={view} items={items} onEdit={(item) => { setEditingItem(item); setModal(view === 'npcs' ? 'npc' : view === 'locations' ? 'location' : 'session') }} onDelete={(item) => removeEntity(view, item)} />
          )}
        </section>
      </main>

      {modal && <FormModal type={modal} item={editingItem} onClose={() => { setModal(null); setEditingItem(null) }} onSubmit={saveEntity} loading={loading} />}
    </div>
  )
}

function SettingsView({ user, onUserUpdated, onSignOut }) {
  const [panel, setPanel] = useState('account')
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' })
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  async function saveProfile(event) {
    event.preventDefault(); setProfileError(''); setProfileSuccess('');
    const name = profile.name.trim();
    const email = profile.email.trim();
    if (!name) { setProfileError('Display name is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setProfileError('Please enter a valid email address.'); return }

    try {
      setProfileLoading(true)
      const response = await updateProfile(name, email)
      onUserUpdated(response.user)
      setProfileSuccess('Account details saved successfully.')
    } catch (error) {
      setProfileError(error.message)
    } finally {
      setProfileLoading(false)
    }
  }

  async function savePassword(event) {
    event.preventDefault(); setPasswordError(''); setPasswordSuccess('');
    const { currentPassword, newPassword, confirmPassword } = passwordForm
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password confirmation does not match.')
      return
    }

    try {
      setPasswordLoading(true)
      await changePassword(currentPassword, newPassword, confirmPassword)
      setPasswordSuccess('Password updated successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setPasswordError(error.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="profile-layout">
      <div className="profile-sidebar card">
        <div className="profile-head compact">
          <div className="avatar-lg">{(user?.name || 'U').slice(0, 2).toUpperCase()}</div>
          <div>
            <h2>{user?.name || 'User'}</h2>
            <div className="role">Account settings</div>
          </div>
        </div>

        <nav className="profile-nav" aria-label="Profile navigation">
          {[
            ['account', 'Account'],
            ['settings', 'Settings'],
            ['security', 'Security'],
          ].map(([key, label]) => (
            <button key={key} type="button" className={`profile-nav-item ${panel === key ? 'active' : ''}`} onClick={() => setPanel(key)}>
              {label}
            </button>
          ))}
        </nav>

        <button className="btn ghost danger-link" type="button" onClick={onSignOut}>Log out</button>
      </div>

      <div className="profile-content">
        {panel === 'account' && (
          <form onSubmit={saveProfile} className="card settings-card">
            <h3>Account details</h3>
            <p className="desc">Update the public display name and email associated with this account.</p>
            {profileError && <div className="error-message">{profileError}</div>}
            {profileSuccess && <div className="success-message">{profileSuccess}</div>}
            <div className="field"><label>Display name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label></div>
            <div className="field"><label>Email<input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label></div>
            <button className="btn primary" disabled={profileLoading} type="submit">{profileLoading ? 'Saving...' : 'Save account'}</button>
          </form>
        )}

        {panel === 'settings' && (
          <div className="card settings-card">
            <h3>Settings</h3>
            <p className="desc">Keep the campaign dashboard tailored to your play style.</p>
            <div className="toggle-row"><div><div className="t-label">Night mode</div><div className="t-desc">Always keep the app in the vault-toned theme.</div></div><button className="switch on" type="button" aria-label="Toggle night mode" /></div>
            <div className="toggle-row"><div><div className="t-label">Compact cards</div><div className="t-desc">Tighten spacing across journals and records.</div></div><button className="switch" type="button" aria-label="Toggle compact cards" /></div>
            <div className="toggle-row"><div><div className="t-label">Quick session notes</div><div className="t-desc">Keep recent session summaries pinned to the dashboard.</div></div><button className="switch on" type="button" aria-label="Toggle quick session notes" /></div>
          </div>
        )}

        {panel === 'security' && (
          <form onSubmit={savePassword} className="card settings-card">
            <h3>Change password</h3>
            <p className="desc">Use a fresh password and confirm it before saving.</p>
            {passwordError && <div className="error-message">{passwordError}</div>}
            {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
            <div className="field"><label>Current password<input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></label></div>
            <div className="field"><label>New password<input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></label></div>
            <div className="field"><label>Confirm password<input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} /></label></div>
            <button className="btn primary" disabled={passwordLoading} type="submit">{passwordLoading ? 'Saving...' : 'Save password'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

function CampaignCreation({ onCreated, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const created = await createCampaign({ name: name.trim(), description: description.trim() })
      onCreated(created)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="campaign-form-page">
      <div className="page-intro">
        <div className="eyebrow">New world</div>
        <h1>Create a campaign</h1>
        <p>Give your next story a name and a place to begin.</p>
      </div>
      <form className="campaign-form card" onSubmit={submit}>
        <label className="field">Campaign name<input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="The Glass Archive" /></label>
        <label className="field">Description<textarea rows="6" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A ruined archive beneath the moonlit citadel..." /></label>
        {error && <div className="error-message">{error}</div>}
        <div className="form-actions"><button className="btn" type="button" onClick={onCancel}>Cancel</button><button className="btn primary" disabled={saving} type="submit">{saving ? 'Creating...' : 'Create campaign'}</button></div>
      </form>
    </div>
  )
}

function EmptyCampaign({ onCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  return (
    <div className="empty-state">
      <div className="eyebrow">Your vault awaits</div>
      <h1>Create your first campaign</h1>
      <p>Build a living record for every character, place, and session.</p>
      <form onSubmit={async (event) => {
        event.preventDefault(); setSaving(true); setError('')
        try {
          const created = await createCampaign({ name, description })
          onCreated(created)
        } catch (e) {
          setError(e.message)
        } finally {
          setSaving(false)
        }
      }}>
        <label>
          Campaign name
          <input required placeholder="Campaign name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Campaign description
          <textarea placeholder="What is this story about?" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        {error && <div className="error-message">{error}</div>}
        <button className="btn primary" disabled={saving} type="submit">{saving ? 'Creating...' : 'Create campaign'}</button>
      </form>
    </div>
  )
}

function Dashboard({ campaign, stats, sessions, onNavigate, onNew }) {
  const latestSession = sessions[0]

  return (
    <>
      <div className="dashboard-grid">
        <div className="dash-hero flourish" style={{ '--campaign-art': campaign.artwork ? `url("/assets/campaigns/${campaign.artwork}")` : 'url("/assets/wallpapers/archive-gate.jpg")' }}>
          <div className="hero-copy">
            <div className="eyebrow">Campaign chronicle</div>
            <h1>{campaign.name}</h1>
            <p>{campaign.description || 'Your campaign story begins here.'}</p>
            <div className="campaign-master"><span className="master-mark">♙</span> Campaign Master</div>
            <div className="hero-actions">
              <button className="btn primary" type="button" onClick={() => onNavigate('sessions')}>Continue campaign</button>
              <button className="btn gold" type="button" onClick={() => onNavigate('npcs')}>Explore the world</button>
            </div>
          </div>
        </div>

        <aside className="quick-panel">
          <div className="panel-heading"><span>Quick actions</span><span className="panel-rule" /></div>
          <button type="button" onClick={() => onNew('session')}><span className="quick-icon">✎</span>New session<span className="quick-arrow">›</span></button>
          <button type="button" onClick={() => onNew('npc')}><span className="quick-icon">♙</span>New NPC<span className="quick-arrow">›</span></button>
          <button type="button" onClick={() => onNew('location')}><span className="quick-icon">⌂</span>New location<span className="quick-arrow">›</span></button>
          <div className="activity-block">
            <div className="panel-heading"><span>Recent activity</span><span className="panel-rule" /></div>
            {latestSession ? <button type="button" onClick={() => onNavigate('sessions')}><span className="activity-dot">✎</span><span><strong>{latestSession.title}</strong><small>Updated {latestSession.date}</small></span><span className="quick-arrow">›</span></button> : <p className="muted">Your campaign activity will appear here.</p>}
          </div>
        </aside>
      </div>

      <div className="stat-row" aria-label="World atlas">
        {[
          ['npcs', 'Characters', 'People in the story', 'Explore the cast'],
          ['locations', 'Places', 'Landmarks and realms', 'Explore the map'],
          ['sessions', 'Journal', 'Chapters of the campaign', 'Read the chronicle'],
        ].map(([key, label, info, action]) => (
          <button className="stat-box" key={key} onClick={() => onNavigate(key)} type="button">
            <div className="stat-header">
              <span className="stat-icon">{key === 'npcs' ? '◆' : key === 'locations' ? '✦' : '✎'}</span>
              <span className="stat-label">{label}</span>
            </div>
            <span className="num">{stats[key]}</span>
            <span className="lbl">{info}</span>
            <span className="stat-link">{action} <span aria-hidden="true">→</span></span>
          </button>
        ))}
      </div>

      <div className="campaign-panels">
        <div className="story-card">
          <div className="eyebrow">Recent journal</div>
          {latestSession ? (
            <>
              <div className="journal-kicker">SESSION {String(stats.sessions).padStart(2, '0')}</div>
              <h3>{latestSession.title}</h3>
              <div className="story-date">{latestSession.date}</div>
              <p>{latestSession.recap || 'No summary recorded yet.'}</p>
              <div className="story-meta">
                <span>Latest chapter in the chronicle</span>
                <button className="text-link" type="button" onClick={() => onNavigate('sessions')}>Read session <span aria-hidden="true">→</span></button>
              </div>
            </>
          ) : (
            <>
              <h3>Nothing recorded yet</h3>
              <p>Your next session can become the first chapter of this campaign.</p>
              <button className="btn small primary" type="button" onClick={() => onNavigate('sessions')}>Add a session</button>
            </>
          )}
        </div>

        <div className="story-card muted-card">
          <div className="eyebrow">World at a glance</div>
          <h3>What is taking shape</h3>
          <p className="pulse-copy">Your archive grows with every person, place, and chapter you preserve.</p>
          <div className="pulse-list">
            <button type="button" onClick={() => onNavigate('npcs')}><span>{stats.npcs}</span> characters <b>→</b></button>
            <button type="button" onClick={() => onNavigate('locations')}><span>{stats.locations}</span> places <b>→</b></button>
            <button type="button" onClick={() => onNavigate('sessions')}><span>{stats.sessions}</span> chapters <b>→</b></button>
          </div>
        </div>
      </div>

      <div className="section-title">
        <div><div className="eyebrow">Campaign history</div><h3>Recent chapters</h3></div>
        <button className="btn small" onClick={() => onNavigate('sessions')} type="button">View all <span aria-hidden="true">→</span></button>
      </div>
      {sessions.length ? sessions.slice(0, 3).map((session) => (
        <article className="recap-card" key={session.id}>
          <div>
            <div className="rc-date">{session.date}</div>
            <h4>{session.title}</h4>
            <p>{session.recap}</p>
          </div>
        </article>
      )) : <div className="card muted">No sessions recorded yet.</div>}
    </>
  )
}

function EntityView({ type, items, onEdit, onDelete }) {
  return (
    <div className="entity-list">
      {items.length ? items.map((item) => (
        <article className="entity-row" key={item.id}>
          <div className="portrait">{(item.name || item.title).slice(0, 2).toUpperCase()}</div>
          <div className="body">
            {item.date && <div className="rc-date">{item.date}</div>}
            <h4>
              {item.name || item.title}
              {item.role && <span className="role-pill">{item.role}</span>}
            </h4>
            <p>{item.description || item.recap || item.notes || 'No notes added yet.'}</p>
            <div className="meta"><span className="tag">Saved in Lorekeeper</span></div>
          </div>
          <div className="entity-actions">
            <button className="icon-button" type="button" onClick={() => onEdit(item)} aria-label={`Edit ${item.name || item.title}`}>✎</button>
            <button className="icon-button danger-icon" type="button" onClick={() => onDelete(item)} aria-label={`Delete ${item.name || item.title}`}>×</button>
          </div>
        </article>
      )) : <div className="empty-state compact"><h2>No {type} yet</h2><p>Use the button above to add the first one to this campaign.</p></div>}
    </div>
  )
}

export default AppReal
