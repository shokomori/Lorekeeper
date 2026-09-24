import { useMemo, useState } from 'react'

const campaigns = [
  {
    id: 1,
    name: 'The Ashes of Eldoria',
    description: 'A party of adventurers retraces the fall of a kingdom and uncovers a hidden cult beneath the old capital.',
    npcs: 24,
    places: 12,
    sessions: 18,
  },
  {
    id: 2,
    name: 'The Glass Harbor',
    description: 'A weary city begins to awaken as sea spirits and smuggling rings scramble for control of the harbor.',
    npcs: 18,
    places: 9,
    sessions: 12,
  },
  {
    id: 3,
    name: 'Blackwood Trials',
    description: 'A remote forest holds the remains of a failed magical experiment and a chain of impossible rituals.',
    npcs: 30,
    places: 15,
    sessions: 22,
  },
]

const npcList = [
  { name: 'Marcus Vale', role: 'Merchant', notes: 'Trades in rare relics and rumor. Never sits still for long.', accent: 'MV', type: 'neutral' },
  { name: 'Seraphine Voss', role: 'Scholar', notes: 'Knows the old empire’s rituals and never ignores a mystery.', accent: 'SV', type: 'scholar' },
  { name: 'Brask the Hollow', role: 'Bounty Hunter', notes: 'Hunts escaped cultists with a quiet, frightening efficiency.', accent: 'BH', type: 'danger' },
  { name: 'Edda Thorn', role: 'Healer', notes: 'Works from a hidden clinic on the edge of the market district.', accent: 'ET', type: 'neutral' },
]

const locationList = [
  { name: 'Blackmoor Village', description: 'A settlement of timber homes perched beneath a deep pine forest.', notes: 'The village square now hosts nightly prayer circles.', accent: 'BV' },
  { name: 'The Cathedral Steps', description: 'A broken staircase leading to the old cathedral’s lower crypts.', notes: 'The first chamber leaks violet mist after dusk.', accent: 'CS' },
  { name: 'Velk’s Market', description: 'A crowded market of strange herbs, relics, and whispered bargains.', notes: 'Members of the Red Ledger use it as a meeting ground.', accent: 'VM' },
  { name: 'The Ashen Spire', description: 'A ruined tower that hums with old, unstable magic.', notes: 'The central chamber flickers with impossible shadows.', accent: 'AS' },
]

const sessionList = [
  {
    title: 'Session 12 — The Cathedral Falls',
    date: 'September 23, 2026',
    summary: 'The party discovered Marcus’s connection to the vampire lord, fought three guards, and escaped through the old cathedral crypt.',
  },
  {
    title: 'Session 11 — Glass Harbor',
    date: 'September 16, 2026',
    summary: 'The crew traced a smuggling ring to the tidal vaults and found sealed letters over a decade old.',
  },
  {
    title: 'Session 10 — The Blackwood',
    date: 'September 9, 2026',
    summary: 'The scouts followed silver tracks through the forest and uncovered a ritual circle beneath a fallen shrine.',
  },
]

const compendiumEntries = [
  { name: 'Beholder', type: 'Monster', cr: 'CR 13', size: 'Large aberration', hp: '180 HP', traits: ['Antimagic cone', 'Legendary resistance'] },
  { name: 'Fireball', type: 'Spell', cr: '3rd-level', size: 'Evocation', hp: 'N/A', traits: ['8d6 fire', '20-foot radius'] },
  { name: 'Moonstone Mask', type: 'Item', cr: 'Rare', size: 'Wondrous item', hp: 'N/A', traits: ['Ward against fear', 'Sleep immunity'] },
  { name: 'Hexblade', type: 'Class', cr: 'Full caster hybrid', size: 'Martial', hp: 'N/A', traits: ['Curse channel', 'Hex weapon'] },
]

const navItems = [
  { key: 'campaigns', label: 'All Campaigns', icon: '⟵' },
  { key: 'dashboard', label: 'Dashboard', icon: '◆' },
  { key: 'npcs', label: 'NPCs', icon: '☺' },
  { key: 'locations', label: 'Locations', icon: '⌂' },
  { key: 'sessions', label: 'Sessions', icon: '✎' },
  { key: 'compendium', label: 'Compendium', icon: '✦' },
  { key: 'profile', label: 'Profile & Settings', icon: '⚙' },
]

const tabItems = [
  { key: 'dashboard', label: 'Home', icon: '◆' },
  { key: 'npcs', label: 'NPCs', icon: '☺' },
  { key: 'locations', label: 'Places', icon: '⌂' },
  { key: 'sessions', label: 'Log', icon: '✎' },
  { key: 'profile', label: 'Me', icon: '⚙' },
]

function App() {
  const [screen, setScreen] = useState('login')
  const [activeView, setActiveView] = useState('dashboard')

  const pageTitle = useMemo(() => {
    const map = {
      campaigns: 'Campaigns',
      dashboard: 'Campaign Dashboard',
      npcs: 'NPCs',
      locations: 'Locations',
      sessions: 'Session Journal',
      compendium: 'Compendium',
      profile: 'Profile & Settings',
    }
    return map[activeView] ?? 'Campaign Dashboard'
  }, [activeView])

  const currentPath = useMemo(() => {
    const map = {
      campaigns: 'All Campaigns / The Ashes of Eldoria',
      dashboard: 'Campaign / Dashboard',
      npcs: 'Campaign / NPCs',
      locations: 'Campaign / Locations',
      sessions: 'Campaign / Sessions',
      compendium: 'Reference / Compendium',
      profile: 'Account / Profile',
    }
    return map[activeView] ?? 'Campaign / Dashboard'
  }, [activeView])

  const renderView = () => {
    if (activeView === 'campaigns') {
      return (
        <div className="grid">
          {campaigns.map((campaign) => (
            <button
              key={campaign.id}
              className="card clickable"
              onClick={() => setActiveView('dashboard')}
              type="button"
            >
              <h3>{campaign.name}</h3>
              <p>{campaign.description}</p>
              <div className="stats">
                <span>{campaign.npcs} NPCs</span>
                <span>{campaign.places} Places</span>
                <span>{campaign.sessions} Sessions</span>
              </div>
            </button>
          ))}
          <button className="new-campaign-card card clickable" type="button">
            <div className="plus">+</div>
            <div>New campaign</div>
          </button>
        </div>
      )
    }

    if (activeView === 'npcs') {
      return (
        <>
          <div className="toolbar">
            <input className="search-box" type="text" placeholder="Search NPCs by name or role" />
            <button className="btn primary small" type="button">+ Add NPC</button>
          </div>
          <div className="entity-list">
            {npcList.map((npc) => (
              <div key={npc.name} className="entity-row">
                <div className="portrait">{npc.accent}</div>
                <div className="body">
                  <h4>
                    {npc.name}
                    <span className={`role-pill ${npc.type === 'danger' ? 'danger' : ''}`}>{npc.role}</span>
                  </h4>
                  <p>{npc.notes}</p>
                  <div className="meta">
                    <span className="tag">Seen in 4 sessions</span>
                    <span className="tag">Connected to 2 events</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )
    }

    if (activeView === 'locations') {
      return (
        <>
          <div className="toolbar">
            <input className="search-box" type="text" placeholder="Search locations" />
            <button className="btn primary small" type="button">+ Add Place</button>
          </div>
          <div className="entity-list">
            {locationList.map((place) => (
              <div key={place.name} className="entity-row">
                <div className="portrait">{place.accent}</div>
                <div className="body">
                  <h4>{place.name}</h4>
                  <p>{place.description}</p>
                  <div className="meta">
                    <span className="tag">{place.notes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )
    }

    if (activeView === 'sessions') {
      return (
        <>
          <div className="toolbar">
            <input className="search-box" type="text" placeholder="Search session entries" />
            <button className="btn primary small" type="button">+ New Session</button>
          </div>
          <div className="timeline">
            {sessionList.map((session) => (
              <div key={session.title} className="tl-item">
                <div className="rc-date">{session.date}</div>
                <h4>{session.title}</h4>
                <p>{session.summary}</p>
              </div>
            ))}
          </div>

          <div className="ai-panel">
            <div className="ai-panel-head">
              <div className="ic">AI</div>
              <h4>Session assistant</h4>
            </div>
            <div className="ai-panel-body">
              <div className="field">
                <label>Session notes</label>
                <textarea rows="4" defaultValue="The party entered Blackmoor Village and discovered that Marcus was working for the vampire lord. They fought three guards before escaping through the old cathedral." />
              </div>
              <button className="btn primary" type="button">Summarize session</button>
              <div className="ai-result">
                <div className="box">
                  <div className="t">Summary</div>
                  <div>The party discovered Marcus’s connection to the vampire lord, fought three guards, and escaped through the old cathedral.</div>
                </div>
                <div className="box">
                  <div className="t">Detected entities</div>
                  <div>
                    <span className="pill">Marcus</span>
                    <span className="pill">Vampire Lord</span>
                    <span className="pill">Blackmoor Village</span>
                    <span className="pill">Old Cathedral</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )
    }

    if (activeView === 'compendium') {
      return (
        <>
          <div className="filter-row">
            <button className="chip active" type="button">All</button>
            <button className="chip" type="button">Monsters</button>
            <button className="chip" type="button">Spells</button>
            <button className="chip" type="button">Items</button>
            <button className="chip" type="button">Classes</button>
          </div>
          <div className="entity-list">
            {compendiumEntries.map((entry) => (
              <div key={entry.name} className="mon-card">
                <div className="mon-card-top">
                  <h4>{entry.name}</h4>
                  <div className="cr">{entry.cr}</div>
                </div>
                <div className="sub">{entry.type} · {entry.size}</div>
                <div className="mon-stat-row">
                  <div><b>HP:</b> {entry.hp}</div>
                  <div><b>Tags:</b> {entry.traits.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="api-note">
            This reference data is pulled from the external RPG lookup service rather than stored directly in the campaign database.
          </div>
        </>
      )
    }

    if (activeView === 'profile') {
      return (
        <>
          <div className="profile-head">
            <div className="avatar-lg">DM</div>
            <div>
              <h2>Dungeon Master</h2>
              <div className="role">dm@eldoria.campaign</div>
            </div>
          </div>

          <div className="settings-grid">
            <div>
              <div className="card settings-card">
                <h3>Account details</h3>
                <p className="desc">Manage the identity connected to your campaign vault.</p>
                <div className="field-row">
                  <div className="field">
                    <label>Display name</label>
                    <input defaultValue="Dungeon Master" />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input defaultValue="dm@eldoria.campaign" />
                  </div>
                </div>
                <button className="btn primary" type="button" style={{ marginTop: 16 }}>Save profile</button>
              </div>

              <div className="card settings-card">
                <h3>Campaign preferences</h3>
                <p className="desc">Tune the defaults that shape how your session records behave.</p>
                <div className="field">
                  <label>Default campaign view</label>
                  <select className="select-field" defaultValue="dashboard">
                    <option value="dashboard">Dashboard</option>
                    <option value="sessions">Session Journal</option>
                    <option value="npcs">NPCs</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card settings-card danger-zone">
              <h3>Preferences</h3>
              <p className="desc">Toggles for session and note behavior.</p>

              <div className="toggle-row">
                <div>
                  <div className="t-label">Auto-save notes</div>
                  <div className="t-desc">Keeps a session draft synced as you write.</div>
                </div>
                <div className="switch on" aria-label="Autosave enabled" />
              </div>

              <div className="toggle-row">
                <div>
                  <div className="t-label">AI summary prompts</div>
                  <div className="t-desc">Automatically suggest NPC and location tags.</div>
                </div>
                <div className="switch on" aria-label="AI summary prompts enabled" />
              </div>

              <div className="toggle-row">
                <div>
                  <div className="t-label">Private campaign mode</div>
                  <div className="t-desc">Hide campaign data from public compendium exports.</div>
                </div>
                <div className="switch" aria-label="Private campaign mode disabled" />
              </div>

              <button className="btn gold block" type="button">Download campaign export</button>
            </div>
          </div>
        </>
      )
    }

    return (
      <div className="dash-hero flourish">
        <div className="eyebrow">Campaign master</div>
        <h1>The Ashes of Eldoria</h1>
        <p>A party of adventurers retraces the fall of a kingdom and uncovers a hidden cult beneath the old capital.</p>
      </div>
    )
  }

  return (
    <>
      <div id="screen-login" className={`screen ${screen === 'login' ? '' : 'hidden'}`}>
        <div className="login-card flourish">
          <img
            className="login-logo"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 120'%3E%3Crect width='400' height='120' rx='18' fill='%2308070a'/%3E%3Cpath d='M20 90L60 35L90 35L90 80L120 80L120 35L150 35L150 90L180 90L180 18L40 18L20 90Z' fill='%23e8d94a'/%3E%3Cpath d='M206 18H244L230 90H198L206 18ZM225 40H225.4L233 71H216L206 18H244L213 90H198L206 18H244L227 90' fill='%238a5fd6'/%3E%3Cpath d='M266 18H306L343 69L353 18H382L340 101H302L266 18ZM290 51H310L327 79L302 79' fill='%23e8d94a'/%3E%3C/svg%3E"
            alt="Lorekeeper logo"
          />
          <p className="login-sub">Your campaign, remembered.</p>

          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="dm@yourdomain.com" defaultValue="" autoComplete="email" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••••" defaultValue="" autoComplete="current-password" />
          </div>
          <button className="btn primary block" type="button" style={{ marginTop: 18 }} onClick={() => setScreen('app')}>
            Enter the Realm
          </button>

          <div className="or-row"><hr className="divider" /><span>or</span><hr className="divider" /></div>

          <button className="btn block google-btn" type="button" onClick={() => setScreen('app')}>
            <span style={{ fontFamily: 'Cinzel, serif' }}>G</span> Continue with Google
          </button>

          <p className="login-foot">New here? <button type="button" onClick={() => setScreen('app')}>Create an account</button></p>
        </div>
      </div>

      <div id="app-shell" className={screen === 'app' ? 'active' : ''}>
        <aside className="sidebar">
          <div className="brand"><img className="mark" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%2308070a'/%3E%3Cpath d='M8 48L20 18H26L20 48H8ZM28 48L36 18H42L36 48H28ZM14 38H35L37 44H16L14 38Z' fill='%23e8d94a'/%3E%3Cpath d='M46 18H52L43 48H37L46 18Z' fill='%238a5fd6'/%3E%3C/svg%3E" alt="Lorekeeper icon" /> Lorekeeper</div>

          <div className="campaign-context">
            <div className="cc-label">Current campaign</div>
            <div className="cc-name">The Ashes of Eldoria</div>
          </div>

          <div className="nav-group">
            <div className="nav-label">LIBRARY</div>
            <button
              className={`nav-item ${activeView === 'campaigns' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveView('campaigns')}
            >
              <span className="ic">⟵</span> All Campaigns
            </button>
          </div>

          <div className="nav-group">
            <div className="nav-label">THIS CAMPAIGN</div>
            {navItems.slice(1, 6).map((item) => (
              <button
                key={item.key}
                className={`nav-item ${activeView === item.key ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveView(item.key)}
              >
                <span className="ic">{item.icon}</span> {item.label}
              </button>
            ))}
          </div>

          <div className="nav-group">
            <div className="nav-label">REFERENCE</div>
            <button
              className={`nav-item ${activeView === 'compendium' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveView('compendium')}
            >
              <span className="ic">✦</span> Compendium
            </button>
          </div>

          <div className="nav-group">
            <div className="nav-label">ACCOUNT</div>
            <button
              className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveView('profile')}
            >
              <span className="ic">⚙</span> Profile &amp; Settings
            </button>
          </div>

          <div className="sidebar-foot">
            <hr className="divider" style={{ marginBottom: 10 }} />
            <div className="user-chip" onClick={() => setActiveView('profile')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveView('profile')}>
              <span className="av">DM</span> Dungeon Master <span style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={(event) => { event.stopPropagation(); setScreen('login'); }}>⏻</span>
            </div>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div>
              <h2>{pageTitle}</h2>
              <div className="path">{currentPath}</div>
            </div>
            <button className="btn primary small" type="button">+ New Session</button>
          </header>

          <div className="view">
            {renderView()}
          </div>
        </main>
      </div>

      <nav className="tabbar" aria-label="Mobile navigation">
        {tabItems.map((item) => (
          <button
            key={item.key}
            className={`tab ${activeView === item.key ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveView(item.key)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}

export default App
