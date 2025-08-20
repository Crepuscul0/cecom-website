"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Filter, Eye, Edit, Trash2, Settings } from 'lucide-react'

interface Aplicacion {
  id: string
  application_name: string
  client_name: string
  client_email: string
  application_type: string
  description: string
  requirements: any
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'deployed'
  assigned_to: string
  created_by: string
  created_at: string
  updated_at: string
}

export function AplicacionesManagement() {
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAplicacion, setEditingAplicacion] = useState<Aplicacion | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    application_name: '',
    client_name: '',
    client_email: '',
    application_type: '',
    description: '',
    requirements: '',
    status: 'submitted' as const
  })

  const applicationTypes = [
    'Web Application',
    'Mobile App',
    'Desktop Software',
    'API Integration',
    'Database System',
    'E-commerce Platform',
    'CRM System',
    'Other'
  ]

  useEffect(() => {
    fetchAplicaciones()
  }, [])

  const fetchAplicaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('aplicaciones')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAplicaciones(data || [])
    } catch (error) {
      console.error('Error fetching aplicaciones:', error)
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
        requirements: formData.requirements ? JSON.parse(formData.requirements) : null
      }
      
      if (editingAplicacion) {
        const { error } = await supabase
          .from('aplicaciones')
          .update({
            ...submitData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAplicacion.id)
          
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('aplicaciones')
          .insert({
            ...submitData,
            created_by: user?.id
          })
          
        if (error) throw error
      }
      
      await fetchAplicaciones()
      resetForm()
    } catch (error) {
      console.error('Error saving aplicacion:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta aplicación?')) return
    
    try {
      const { error } = await supabase
        .from('aplicaciones')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      await fetchAplicaciones()
    } catch (error) {
      console.error('Error deleting aplicacion:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      application_name: '',
      client_name: '',
      client_email: '',
      application_type: '',
      description: '',
      requirements: '',
      status: 'submitted'
    })
    setEditingAplicacion(null)
    setShowForm(false)
  }

  const startEdit = (aplicacion: Aplicacion) => {
    setFormData({
      application_name: aplicacion.application_name,
      client_name: aplicacion.client_name,
      client_email: aplicacion.client_email,
      application_type: aplicacion.application_type,
      description: aplicacion.description || '',
      requirements: aplicacion.requirements ? JSON.stringify(aplicacion.requirements, null, 2) : '',
      status: aplicacion.status
    })
    setEditingAplicacion(aplicacion)
    setShowForm(true)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      under_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      deployed: 'bg-purple-100 text-purple-800 border-purple-200'
    }
    
    const labels = {
      submitted: 'Enviada',
      under_review: 'En Revisión',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      deployed: 'Desplegada'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const filteredAplicaciones = aplicaciones.filter(aplicacion => {
    const matchesSearch = !searchTerm || 
      aplicacion.application_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aplicacion.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aplicacion.client_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || aplicacion.status === statusFilter
    const matchesType = typeFilter === 'all' || aplicacion.application_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
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
        <h1 className="text-2xl font-bold text-foreground">Gestión de Aplicaciones</h1>
        
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Aplicación
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar aplicaciones..."
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
          <option value="all">Todos los estados</option>
          <option value="submitted">Enviada</option>
          <option value="under_review">En Revisión</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
          <option value="deployed">Desplegada</option>
        </select>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Todos los tipos</option>
          {applicationTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-foreground">{aplicaciones.length}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{aplicaciones.filter(a => a.status === 'submitted').length}</div>
          <div className="text-sm text-muted-foreground">Enviadas</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{aplicaciones.filter(a => a.status === 'under_review').length}</div>
          <div className="text-sm text-muted-foreground">En Revisión</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{aplicaciones.filter(a => a.status === 'approved').length}</div>
          <div className="text-sm text-muted-foreground">Aprobadas</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{aplicaciones.filter(a => a.status === 'deployed').length}</div>
          <div className="text-sm text-muted-foreground">Desplegadas</div>
        </div>
      </div>

      {/* Aplicaciones Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Aplicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredAplicaciones.map((aplicacion) => (
                <tr key={aplicacion.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{aplicacion.application_name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {aplicacion.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{aplicacion.client_name}</div>
                      <div className="text-sm text-muted-foreground">{aplicacion.client_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {aplicacion.application_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(aplicacion.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(aplicacion.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(aplicacion)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(aplicacion.id)}
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
        
        {filteredAplicaciones.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">No se encontraron aplicaciones</div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingAplicacion ? 'Editar Aplicación' : 'Nueva Aplicación'}
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
                    Nombre de la Aplicación *
                  </label>
                  <input
                    type="text"
                    value={formData.application_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, application_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Tipo de Aplicación *
                  </label>
                  <select
                    value={formData.application_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, application_type: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Seleccionar tipo</option>
                    {applicationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
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
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Requerimientos (JSON)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  rows={4}
                  placeholder='{"features": ["Feature 1", "Feature 2"], "technologies": ["React", "Node.js"]}'
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="submitted">Enviada</option>
                  <option value="under_review">En Revisión</option>
                  <option value="approved">Aprobada</option>
                  <option value="rejected">Rechazada</option>
                  <option value="deployed">Desplegada</option>
                </select>
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
                  {editingAplicacion ? 'Actualizar' : 'Crear'} Aplicación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
