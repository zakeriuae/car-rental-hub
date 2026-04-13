import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { VEHICLE_STATUSES } from '@/lib/constants';
import { Upload, Edit2, Save, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrices, setEditedPrices] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = async () => {
    let q = supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data, error } = await q;
    if (error) console.error('Error fetching vehicles:', error);
    setVehicles(data || []);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handlePriceChange = (id: string, field: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setEditedPrices(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: numValue
      }
    }));
  };

  const handleSave = async () => {
    const updates = Object.entries(editedPrices).map(([id, prices]) => ({
      id,
      ...prices,
    }));

    if (updates.length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from('vehicles').upsert(updates);
    
    if (error) {
      toast({
        title: 'Error saving prices',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Prices updated',
        description: `Successfully updated ${updates.length} vehicles.`,
      });
      await load();
      setEditedPrices({});
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const cancelEdit = () => {
    setEditedPrices({});
    setIsEditing(false);
  };

  const filtered = vehicles.filter(v => {
    const s = search.toLowerCase();
    const plate = String(v.plate_number || '').toLowerCase();
    const make = String(v.make || '').toLowerCase();
    const model = String(v.model || '').toLowerCase();
    return plate.includes(s) || make.includes(s) || model.includes(s);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Prices
              </Button>
              <Button onClick={() => navigate('/vehicles/import')}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={cancelEdit} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <Input 
          placeholder="Search plate, make, model…" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="max-w-xs" 
          disabled={isEditing}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isEditing}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {VEHICLE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plate</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Daily</TableHead>
            <TableHead>Weekly</TableHead>
            <TableHead>Monthly</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map(v => (
            <TableRow 
              key={v.id} 
              className={!isEditing ? "cursor-pointer hover:bg-muted/50" : ""} 
              onClick={() => !isEditing && navigate(`/vehicles/${v.id}`)}
            >
              <TableCell className="font-mono">{v.plate_number}</TableCell>
              <TableCell>{v.make}</TableCell>
              <TableCell>{v.model}</TableCell>
              <TableCell>{v.year || '—'}</TableCell>
              <TableCell>{v.color || '—'}</TableCell>
              
              <TableCell>
                {isEditing ? (
                  <Input
                    type="number"
                    className="w-24 h-8"
                    defaultValue={v.daily_price || ''}
                    onChange={e => handlePriceChange(v.id, 'daily_price', e.target.value)}
                  />
                ) : (
                  <span className="font-medium">
                    {v.daily_price ? `${v.daily_price.toLocaleString()} AED` : '—'}
                  </span>
                )}
              </TableCell>
              
              <TableCell>
                {isEditing ? (
                  <Input
                    type="number"
                    className="w-24 h-8"
                    defaultValue={v.weekly_price || ''}
                    onChange={e => handlePriceChange(v.id, 'weekly_price', e.target.value)}
                  />
                ) : (
                  <span className="font-medium">
                    {v.weekly_price ? `${v.weekly_price.toLocaleString()} AED` : '—'}
                  </span>
                )}
              </TableCell>
              
              <TableCell>
                {isEditing ? (
                  <Input
                    type="number"
                    className="w-24 h-8"
                    defaultValue={v.monthly_price || ''}
                    onChange={e => handlePriceChange(v.id, 'monthly_price', e.target.value)}
                  />
                ) : (
                  <span className="font-medium">
                    {v.monthly_price ? `${v.monthly_price.toLocaleString()} AED` : '—'}
                  </span>
                )}
              </TableCell>
              
              <TableCell><Badge variant={v.status === 'available' ? 'default' : 'secondary'}>{v.status}</Badge></TableCell>
              <TableCell>{v.current_location || '—'}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">No vehicles found</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
