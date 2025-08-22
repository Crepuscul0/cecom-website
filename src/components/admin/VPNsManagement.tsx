"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Filter, Eye, Edit, Trash2, Wifi, WifiOff } from 'lucide-react'

interface VPN {
  id: string
  vpn_name: string
  client_name: string
  client_email: string
  server_location: string
  configuration: any
  status: 'requested' | 'configuring' | 'active' | 'suspended' | 'terminated'
  assigned_to: string
  created_by: string
  expires_at: string
  created_at: string
  updated_at: string
}

export function VPNsManagement() {
  const [vpns, setVpns] = useState<VPN[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVPN, setEditingVPN] = useState<VPN | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const t = useTranslations('AdminPanel.vpns')
  const tCommon = useTranslations('AdminPanel.common')

  type VPNFormData = {
    vpn_name: string
    client_name: string
    client_email: string
    server_location: string
    configuration: string
    status: VPN['status']
    expires_at: string
  }

  const [formData, setFormData] = useState<VPNFormData>({
    vpn_name: '',
    client_name: '',
    client_email: '',
    server_location: '',
    configuration: '',
    status: 'requested',
    expires_at: ''
  })

  const serverLocations = [
    'Estados Unidos - Este',
    'Estados Unidos - Oeste',
    'Canadá',
    'Reino Unido',
    'Alemania',
    'Francia',
    'Japón',
    'Australia',
    'Brasil',
    'República Dominicana'
  ]

  useEffect(() => {
    fetchVPNs()
  }, [])

  const fetchVPNs = async () => {
    try {
      const { data, error } = await supabase
        .from('vpns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVpns(data || [])
    } catch (error) {
      console.error('Error fetching VPNs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const submitData = {
        ...formData,
        configuration: formData.configuration ? JSON.parse(formData.configuration) : null,
        expires_at: formData.expires_at || null
      }
      
      if (editingVPN) {
        const { error } = await supabase
          .from('vpns')
          .update({
            ...submitData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingVPN.id)
          
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('vpns')
          .insert({
            ...submitData,
            created_by: user?.id
          })
          
        if (error) throw error
      }
      
      await fetchVPNs()
      resetForm()
    } catch (error) {
      console.error('Error saving VPN:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta VPN?')) return
    
    try {
      const { error } = await supabase
        .from('vpns')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      await fetchVPNs()
    } catch (error) {
      console.error('Error deleting VPN:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      vpn_name: '',
      client_name: '',
      client_email: '',
      server_location: '',
      configuration: '',
      status: 'requested',
      expires_at: ''
    })
    setEditingVPN(null)
    setShowForm(false)
  }

  const startEdit = (vpn: VPN) => {
    setFormData({
      vpn_name: vpn.vpn_name,
      client_name: vpn.client_name,
      client_email: vpn.client_email,
      server_location: vpn.server_location || '',
      configuration: vpn.configuration ? JSON.stringify(vpn.configuration, null, 2) : '',
      status: vpn.status,
      expires_at: vpn.expires_at ? vpn.expires_at.split('T')[0] : ''
    })
    setEditingVPN(vpn)
    setShowForm(true)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      requested: 'bg-blue-100 text-blue-800 border-blue-200',
      configuring: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      suspended: 'bg-orange-100 text-orange-800 border-orange-200',
      terminated: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const labels = {
      requested: 'Solicitada',
      configuring: 'Configurando',
      active: 'Activa',
      suspended: 'Suspendida',
      terminated: 'Terminada'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getStatusIcon = (status: string) => {
    if (status === 'active') {
      return <Wifi className="h-4 w-4 text-green-600" />
    }
    return <WifiOff className="h-4 w-4 text-muted-foreground" />
  }

  const isExpired = (expiresAt: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const filteredVPNs = vpns.filter(vpn => {
    const matchesSearch = !searchTerm || 
      vpn.vpn_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vpn.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vpn.client_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || vpn.status === statusFilter
    const matchesLocation = locationFilter === 'all' || vpn.server_location === locationFilter
    
    return matchesSearch && matchesStatus && matchesLocation
  })

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
        
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
{t('newVPN')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">{t('status.all')}</option>
          <option value="requested">{t('status.requested')}</option>
          <option value="configuring">{t('status.configuring')}</option>
          <option value="active">{t('status.active')}</option>
          <option value="suspended">{t('status.suspended')}</option>
          <option value="terminated">{t('status.terminated')}</option>
        </select>
        
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">{t('locations.all')}</option>
          {serverLocations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-foreground">{vpns.length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.total')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{vpns.filter(v => v.status === 'active').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.active')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{vpns.filter(v => v.status === 'configuring').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.configuring')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{vpns.filter(v => v.status === 'suspended').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.suspended')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{vpns.filter(v => v.expires_at && isExpired(v.expires_at)).length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.expired')}</div>
        </div>
      </div>

      {/* VPNs Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.client')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.expires')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {tCommon('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredVPNs.map((vpn) => (
                <tr key={vpn.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(vpn.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">{vpn.vpn_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{vpn.client_name}</div>
                      <div className="text-sm text-muted-foreground">{vpn.client_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {vpn.server_location || 'No especificada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vpn.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {vpn.expires_at ? (
                      <div className={isExpired(vpn.expires_at) ? 'text-red-600 font-medium' : ''}>
                        {new Date(vpn.expires_at).toLocaleDateString('es-ES')}
                        {isExpired(vpn.expires_at) && ' (Expirada)'}
                      </div>
                    ) : (
                      'Sin expiración'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(vpn)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vpn.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredVPNs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">{t('noVPNsFound')}</div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingVPN ? 'Editar VPN' : 'Nueva VPN'}
              </h3>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nombre de la VPN *
                  </label>
                  <input
                    type="text"
                    value={formData.vpn_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, vpn_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Ubicación del Servidor
                  </label>
                  <select
                    value={formData.server_location}
                    onChange={(e) => setFormData(prev => ({ ...prev, server_location: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Seleccionar ubicación</option>
                    {serverLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email del Cliente *
                  </label>
                  <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Configuración (JSON)
                </label>
                <textarea
                  value={formData.configuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, configuration: e.target.value }))}
                  rows={4}
                  placeholder='{"protocol": "OpenVPN", "port": 1194, "encryption": "AES-256"}'
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as VPN['status'] }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="requested">Solicitada</option>
                    <option value="configuring">Configurando</option>
                    <option value="active">Activa</option>
                    <option value="suspended">Suspendida</option>
                    <option value="terminated">Terminada</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Fecha de Expiración
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-muted-foreground border border-border rounded-md hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  {editingVPN ? 'Actualizar' : 'Crear'} VPN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
