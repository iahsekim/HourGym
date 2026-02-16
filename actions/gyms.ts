'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Gym, GymWithSpaces, ActionResponse } from '@/types';

/**
 * Get current user's gym
 */
export async function getGymByOwner(): Promise<Gym | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: gym, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (error) return null;

  return gym;
}

/**
 * Get gym with all spaces
 */
export async function getGymWithSpaces(): Promise<GymWithSpaces | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: gym, error } = await supabase
    .from('gyms')
    .select(
      `
      *,
      spaces(*)
    `
    )
    .eq('owner_id', user.id)
    .single();

  if (error) return null;

  return gym as GymWithSpaces;
}

/**
 * Create a new gym
 */
export async function createGym(formData: FormData): Promise<ActionResponse<Gym>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const description = formData.get('description') as string;
  const contactName = formData.get('contactName') as string;
  const contactPhone = formData.get('contactPhone') as string;
  const cancellationPolicy = formData.get('cancellationPolicy') as string;

  if (!name || name.trim().length < 2) {
    return { success: false, error: 'Gym name must be at least 2 characters' };
  }

  // Update profile to gym_owner role
  await supabase.from('profiles').update({ role: 'gym_owner' }).eq('id', user.id);

  const { data: gym, error } = await supabase
    .from('gyms')
    .insert({
      owner_id: user.id,
      name: name.trim(),
      address: address?.trim() || null,
      description: description?.trim() || null,
      contact_name: contactName?.trim() || null,
      contact_phone: contactPhone?.trim() || null,
      cancellation_policy: cancellationPolicy || 'moderate',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/gym/dashboard');
  return { success: true, data: gym };
}

/**
 * Update gym settings
 */
export async function updateGym(formData: FormData): Promise<ActionResponse<Gym>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const gymId = formData.get('gymId') as string;
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const description = formData.get('description') as string;
  const contactName = formData.get('contactName') as string;
  const contactPhone = formData.get('contactPhone') as string;
  const cancellationPolicy = formData.get('cancellationPolicy') as string;

  if (!name || name.trim().length < 2) {
    return { success: false, error: 'Gym name must be at least 2 characters' };
  }

  const { data: gym, error } = await supabase
    .from('gyms')
    .update({
      name: name.trim(),
      address: address?.trim() || null,
      description: description?.trim() || null,
      contact_name: contactName?.trim() || null,
      contact_phone: contactPhone?.trim() || null,
      cancellation_policy: cancellationPolicy || 'moderate',
    })
    .eq('id', gymId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/gym/dashboard/settings');
  return { success: true, data: gym };
}
