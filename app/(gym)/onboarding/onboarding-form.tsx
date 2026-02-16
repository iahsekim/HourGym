'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Button, Input, Textarea, Select, FormField, Alert } from '@/components/ui';
import { createGym } from '@/actions/gyms';
import { Building, MapPin, Phone, User, AlertCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" loading={pending} disabled={pending}>
      {pending ? 'Creating your gym...' : 'Create Gym Listing'}
    </Button>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const result = await createGym(formData);

    if (!result.success) {
      setError(result.error || 'Failed to create gym');
      return;
    }

    router.push('/gym/dashboard');
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <p className="ml-2 text-sm">{error}</p>
        </Alert>
      )}

      <FormField label="Gym Name" required>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            name="name"
            placeholder="Denver Combat Sports"
            className="pl-10"
            required
            minLength={2}
          />
        </div>
      </FormField>

      <FormField label="Address">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            name="address"
            placeholder="123 Main St, Denver, CO 80202"
            className="pl-10"
          />
        </div>
      </FormField>

      <FormField label="Description" hint="Help trainers understand what makes your gym special">
        <Textarea
          name="description"
          placeholder="Describe your gym, equipment, amenities, parking, etc..."
          rows={4}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Contact Name">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input name="contactName" placeholder="John Smith" className="pl-10" />
          </div>
        </FormField>

        <FormField label="Contact Phone">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              name="contactPhone"
              type="tel"
              placeholder="(555) 123-4567"
              className="pl-10"
            />
          </div>
        </FormField>
      </div>

      <FormField label="Cancellation Policy" hint="When can renters cancel for a full refund?">
        <Select name="cancellationPolicy" defaultValue="moderate">
          <option value="flexible">Flexible - 24 hours notice</option>
          <option value="moderate">Moderate - 48 hours notice</option>
          <option value="strict">Strict - 7 days notice</option>
        </Select>
      </FormField>

      <div className="pt-4">
        <SubmitButton />
      </div>

      <p className="text-center text-xs text-gray-500">
        By creating a listing, you agree to our{' '}
        <a href="/terms" className="text-brand-600 hover:underline">
          Terms of Service
        </a>
      </p>
    </form>
  );
}
