'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Button, Input, Textarea, Select, Label, FormField, Alert } from '@/components/ui';
import { updateGym } from '@/actions/gyms';
import { useState } from 'react';

interface GymSettingsFormProps {
  gym: {
    id: string;
    name: string;
    address: string | null;
    description: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    cancellation_policy: string;
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function GymSettingsForm({ gym }: GymSettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);

    const result = await updateGym(formData);

    if (!result.success) {
      setError(result.error || 'Failed to update settings');
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="gymId" value={gym.id} />

      {error && (
        <Alert variant="error">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <p className="text-sm">Settings saved successfully!</p>
        </Alert>
      )}

      <FormField label="Gym Name" required>
        <Input
          name="name"
          defaultValue={gym.name}
          placeholder="Your gym's name"
          required
          minLength={2}
        />
      </FormField>

      <FormField label="Address">
        <Input
          name="address"
          defaultValue={gym.address || ''}
          placeholder="123 Main St, Denver, CO"
        />
      </FormField>

      <FormField label="Description" hint="Tell trainers about your gym">
        <Textarea
          name="description"
          defaultValue={gym.description || ''}
          placeholder="Describe your gym, equipment, and facilities..."
          rows={4}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Contact Name">
          <Input
            name="contactName"
            defaultValue={gym.contact_name || ''}
            placeholder="John Smith"
          />
        </FormField>

        <FormField label="Contact Phone">
          <Input
            name="contactPhone"
            type="tel"
            defaultValue={gym.contact_phone || ''}
            placeholder="(555) 123-4567"
          />
        </FormField>
      </div>

      <FormField label="Cancellation Policy">
        <Select name="cancellationPolicy" defaultValue={gym.cancellation_policy}>
          <option value="flexible">Flexible - 24 hours notice</option>
          <option value="moderate">Moderate - 48 hours notice</option>
          <option value="strict">Strict - 7 days notice</option>
        </Select>
      </FormField>

      <div className="flex justify-end pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
