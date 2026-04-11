export const LEAD_STATUSES = [
  'new', 'qualified', 'in_progress', 'waiting_customer', 'reserved', 'handed_to_human', 'closed'
] as const;

export const CHATBOT_STAGES = [
  'new_lead', 'faq_mode', 'collect_rental_date', 'collect_duration',
  'collect_car_preference', 'collect_budget_optional', 'collect_delivery_location',
  'collect_return_location', 'check_inventory', 'present_options',
  'awaiting_car_selection', 'collect_customer_full_name', 'collect_documents_info',
  'reservation_draft_ready', 'reservation_confirmed', 'human_handoff', 'closed'
] as const;

export const VEHICLE_STATUSES = ['available', 'booked', 'maintenance', 'unavailable'] as const;

export const RESERVATION_STATUSES = ['draft', 'pending', 'confirmed', 'blocked', 'completed', 'cancelled'] as const;

export const RESERVATION_TYPES = ['booking', 'block'] as const;

export const DOCUMENT_TYPES = ['passport', 'visa', 'driving_license', 'id_card', 'other'] as const;

export const VERIFICATION_STATUSES = ['pending', 'approved', 'rejected'] as const;

export const LEAD_SOURCES = ['whatsapp', 'website', 'instagram', 'ads', 'manual'] as const;
