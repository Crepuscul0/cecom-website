"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase, UserProfile } from '@/lib/supabase'
import { Check, X, Eye, UserCheck, UserX, Search, Filter } from 'lucide-react'

export function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const t = useTranslations('AdminPanel.users')
  const tCommon = useTranslations('AdminPanel.common')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          approval_status: status,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const updateUserRole = async (userId: string, role: 'admin' | 'employee' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId)

      if (error) throw error
      
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.approval_status === filter
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const labels = {
      pending: t('status.pending'),
      approved: t('status.approved'),
      rejected: t('status.rejected')
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      employee: 'bg-blue-100 text-blue-800 border-blue-200',
      user: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    const labels = {
      admin: 'Administrador',
      employee: 'Empleado', 
      user: 'Usuario'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="all">{t('status.all')}</option>
              <option value="pending">{t('status.pending')}</option>
              <option value="approved">{t('status.approved')}</option>
              <option value="rejected">{t('status.rejected')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-foreground">{users.length}</div>
          <div className="text-sm text-muted-foreground">Total Usuarios</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.approval_status === 'pending').length}</div>
          <div className="text-sm text-muted-foreground">{t('status.pending')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{users.filter(u => u.approval_status === 'approved').length}</div>
          <div className="text-sm text-muted-foreground">{t('status.approved')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{users.filter(u => u.approval_status === 'rejected').length}</div>
          <div className="text-sm text-muted-foreground">{t('status.rejected')}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.created')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {tCommon('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                      className="text-sm border border-border rounded px-2 py-1 bg-background"
                      disabled={user.approval_status !== 'approved'}
                    >
                      <option value="user">Usuario</option>
                      <option value="employee">Empleado</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.approval_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {user.approval_status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateUserStatus(user.id, 'approved')}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                            title="Aprobar usuario"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateUserStatus(user.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                            title="Rechazar usuario"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">No se encontraron usuarios</div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('userDetails.title')}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('userDetails.fullName')}</label>
                <div className="text-foreground">{selectedUser.first_name} {selectedUser.last_name}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('userDetails.email')}</label>
                <div className="text-foreground">{selectedUser.email}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('userDetails.role')}</label>
                <div>{getRoleBadge(selectedUser.role)}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('userDetails.status')}</label>
                <div>{getStatusBadge(selectedUser.approval_status)}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('userDetails.registrationDate')}</label>
                <div className="text-foreground">{new Date(selectedUser.created_at).toLocaleString()}</div>
              </div>
              
              {selectedUser.approved_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('userDetails.approvalDate')}</label>
                  <div className="text-foreground">{new Date(selectedUser.approved_at).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
