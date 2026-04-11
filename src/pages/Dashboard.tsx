import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, Calendar, FileText } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0, availableVehicles: 0, bookedVehicles: 0,
    totalLeads: 0, inProgressLeads: 0, openReservations: 0, pendingDocs: 0
  });

  useEffect(() => {
    const load = async () => {
      const [vehicles, leads, reservations, docs] = await Promise.all([
        supabase.from('vehicles').select('status'),
        supabase.from('leads').select('status'),
        supabase.from('reservations').select('status'),
        supabase.from('customer_documents').select('verification_status'),
      ]);
      const v = vehicles.data || [];
      const l = leads.data || [];
      const r = reservations.data || [];
      const d = docs.data || [];
      setStats({
        totalVehicles: v.length,
        availableVehicles: v.filter(x => x.status === 'available').length,
        bookedVehicles: v.filter(x => x.status !== 'available').length,
        totalLeads: l.length,
        inProgressLeads: l.filter(x => x.status === 'in_progress').length,
        openReservations: r.filter(x => ['draft','pending','confirmed'].includes(x.status)).length,
        pendingDocs: d.filter(x => x.verification_status === 'pending').length,
      });
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Vehicles', value: stats.totalVehicles, icon: Car },
    { label: 'Available', value: stats.availableVehicles, icon: Car },
    { label: 'Booked / Unavailable', value: stats.bookedVehicles, icon: Car },
    { label: 'Total Leads', value: stats.totalLeads, icon: Users },
    { label: 'In Progress', value: stats.inProgressLeads, icon: Users },
    { label: 'Open Reservations', value: stats.openReservations, icon: Calendar },
    { label: 'Pending Documents', value: stats.pendingDocs, icon: FileText },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
