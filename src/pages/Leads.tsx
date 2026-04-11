import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LEAD_STATUSES, CHATBOT_STAGES } from '@/lib/constants';

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      let q = supabase.from('leads').select('*').order('updated_at', { ascending: false });
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      if (stageFilter !== 'all') q = q.eq('current_stage', stageFilter);
      const { data } = await q;
      setLeads(data || []);
    };
    load();
  }, [statusFilter, stageFilter]);

  const filtered = leads.filter(l =>
    (l.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    l.whatsapp_number.includes(search)
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Leads / CRM</h1>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input placeholder="Search name or phone…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LEAD_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {CHATBOT_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map(l => (
            <TableRow key={l.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/leads/${l.id}`)}>
              <TableCell>{l.full_name || '—'}</TableCell>
              <TableCell>{l.whatsapp_number}</TableCell>
              <TableCell><Badge variant="outline">{l.status}</Badge></TableCell>
              <TableCell className="text-xs">{l.current_stage}</TableCell>
              <TableCell>{l.source || '—'}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(l.updated_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No leads found</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
