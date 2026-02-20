import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import Modal from '../../components/ui/Modal'

export default function AdminAdminsPage() {
  const { admins, addAdmin, removeAdmin, user, isSuperAdmin } = useAuth()
  const { isDark } = useTheme()
  const [showAdd, setShowAdd] = useState(false)
  const [email, setEmail] = useState(''); const [name, setName] = useState(''); const [role, setRole] = useState<'admin' | 'superadmin'>('admin'); const [error, setError] = useState('')
  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'

  const handleAdd = () => { setError(''); if (!email.trim() || !name.trim()) { setError('Name and email required'); return }; const ok = addAdmin(email, name, role); if (!ok) { setError('Email already registered'); return }; setShowAdd(false); setEmail(''); setName(''); setRole('admin') }

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div><h1 className={`font-display text-2xl font-bold ${txt}`}>Admin Users</h1><p className={`text-sm ${sub}`}>{admins.length} administrators</p></div>{isSuperAdmin && <button onClick={() => setShowAdd(true)} className="btn-primary !text-xs !px-5 !py-2.5 !rounded-xl">+ Add Admin</button>}</div>
      {!isSuperAdmin && <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${isDark ? 'bg-amber-400/10 border border-amber-400/20 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>Only super admins can manage admins.</div>}
      <div className="space-y-3">{admins.map(a => (
        <div key={a.id} className="card-surface rounded-2xl p-5 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-display ${a.role === 'superadmin' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-gradient-to-br from-prism-violet to-prism-cyan text-void-950'}`}>{a.name.charAt(0)}</div>
          <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className={`font-medium text-sm ${txt}`}>{a.name}</span>{a.id === user?.id && <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${isDark ? 'bg-prism-violet/15 text-prism-violet' : 'bg-violet-50 text-violet-600'}`}>You</span>}</div><div className={`text-xs ${sub}`}>{a.email}</div></div>
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase tracking-wider ${a.role === 'superadmin' ? isDark ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' : 'bg-amber-50 text-amber-600 border border-amber-200' : isDark ? 'bg-purple-500/10 text-purple-200/90 border border-purple-500/25' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>{a.role}</span>
          {isSuperAdmin && a.id !== 'sa-1' && a.id !== user?.id && <button onClick={() => { if (confirm('Remove ' + a.name + '?')) removeAdmin(a.id) }} className="btn-danger">Remove</button>}
        </div>
      ))}</div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Admin">
        <div className="space-y-4">
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Name *</label><input className="form-field" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Email *</label><input className="form-field" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Role</label><select className="form-field" value={role} onChange={e => setRole(e.target.value as any)}><option value="admin">Admin</option><option value="superadmin">Super Admin</option></select></div>
          {error && <div className={`px-3 py-2.5 rounded-xl text-sm ${isDark ? 'bg-red-400/15 text-red-400' : 'bg-red-50 text-red-600'}`}>{error}</div>}
          <div className="flex gap-3 justify-end mt-6"><button onClick={() => setShowAdd(false)} className="btn-outline !px-5 !py-2.5 !rounded-xl !text-sm">Cancel</button><button onClick={handleAdd} className="btn-primary !px-6 !py-2.5 !rounded-xl !text-xs">Add Admin</button></div>
        </div>
      </Modal>
    </div>
  )
}
