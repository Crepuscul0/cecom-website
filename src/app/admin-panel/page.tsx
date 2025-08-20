"use client"

import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { TicketsManagement } from '@/components/admin/TicketsManagement'

export default function AdminPanelPage() {
  return (
    <AdminPanelLayout activeSection="tickets">
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Bienvenido al Panel de Administración
          </h2>
          <p className="text-muted-foreground mb-8">
            Gestiona tickets, cotizaciones, aplicaciones y VPNs desde un solo lugar.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Tickets</h3>
              <p className="text-sm text-muted-foreground">Gestiona solicitudes de soporte técnico</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="text-green-600 mb-4">
                <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Cotizaciones</h3>
              <p className="text-sm text-muted-foreground">Administra cotizaciones de productos</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="text-purple-600 mb-4">
                <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aplicaciones</h3>
              <p className="text-sm text-muted-foreground">Supervisa desarrollo de aplicaciones</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="text-orange-600 mb-4">
                <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">VPNs</h3>
              <p className="text-sm text-muted-foreground">Administra conexiones VPN</p>
            </div>
          </div>
        </div>
      </div>
    </AdminPanelLayout>
  )
}
