// Database types
export type UserRole = 'renter' | 'gym_owner';
export type SpaceType = 'mats' | 'turf' | 'cage' | 'studio' | 'other';
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Profile {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  role: UserRole;
  stripe_customer_id: string | null;
  sms_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface Gym {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
  timezone: string;
  description: string | null;
  cancellation_policy: CancellationPolicy;
  instant_book: boolean;
  contact_name: string | null;
  contact_phone: string | null;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Space {
  id: string;
  gym_id: string;
  name: string;
  type: SpaceType;
  description: string | null;
  hourly_rate: number;
  capacity: number | null;
  square_feet: number | null;
  entry_instructions: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpacePhoto {
  id: string;
  space_id: string;
  url: string;
  position: number;
  created_at: string;
}

export interface AvailabilityTemplate {
  id: string;
  space_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface AvailabilityOverride {
  id: string;
  space_id: string;
  date: string;
  blocked: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  space_id: string;
  renter_id: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  total_amount: number;
  platform_fee: number;
  gym_payout: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  stripe_refund_id: string | null;
  waiver_accepted_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  refund_amount: number | null;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface SpaceWithGym extends Space {
  gym: Gym;
  photos?: SpacePhoto[];
}

export interface SpaceWithPhotos extends Space {
  photos: SpacePhoto[];
}

export interface GymWithSpaces extends Gym {
  spaces: Space[];
}

export interface BookingWithDetails extends Booking {
  space: SpaceWithGym;
  renter: Profile;
}

// Action response type
export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

// Slot type for availability
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// Pricing calculation result
export interface PricingResult {
  hours: number;
  subtotal: number;
  platformFee: number;
  total: number;
  gymPayout: number;
}

// Form state
export interface FormState {
  error?: string;
  success?: boolean;
  message?: string;
}
