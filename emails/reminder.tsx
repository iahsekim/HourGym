import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components';

interface ReminderEmailProps {
  spaceName: string;
  gymName: string;
  date: Date;
  startTime: string;
  endTime: string;
  address: string | null;
  entryInstructions: string | null;
  contactName: string | null;
  contactPhone: string | null;
  bookingId: string;
}

export function ReminderEmail({
  spaceName,
  gymName,
  date,
  startTime,
  endTime,
  address,
  entryInstructions,
  contactName,
  contactPhone,
  bookingId,
}: ReminderEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hourgym.com';

  return (
    <Html>
      <Head />
      <Preview>
        Reminder: Your booking at {gymName} starts in 1 hour
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <div style={alertBanner}>⏰ Starting in 1 Hour</div>

          <Heading style={h1}>Time to Head Out!</Heading>

          <Text style={intro}>
            Your booking at {gymName} is coming up. Here's everything you need:
          </Text>

          <Section style={section}>
            <Text style={label}>Space</Text>
            <Text style={value}>
              {spaceName} at {gymName}
            </Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Time</Text>
            <Text style={value}>
              {startTime} - {endTime}
            </Text>
            <Text style={dateText}>
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Section>

          {address && (
            <Section style={addressSection}>
              <Text style={label}>📍 Address</Text>
              <Text style={value}>{address}</Text>
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                style={directionsButton}
              >
                Get Directions →
              </Link>
            </Section>
          )}

          {entryInstructions && (
            <Section style={importantSection}>
              <Text style={label}>🚪 Entry Instructions</Text>
              <Text style={value}>{entryInstructions}</Text>
            </Section>
          )}

          {(contactName || contactPhone) && (
            <Section style={contactSection}>
              <Text style={label}>📞 Day-of Contact</Text>
              <Text style={value}>
                {contactName}
                {contactPhone && (
                  <>
                    {' • '}
                    <Link href={`tel:${contactPhone}`} style={phoneLink}>
                      {contactPhone}
                    </Link>
                  </>
                )}
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={checklistSection}>
            <Text style={checklistTitle}>Quick Checklist</Text>
            <Text style={checklistItem}>✓ Gym bag packed</Text>
            <Text style={checklistItem}>✓ Water bottle</Text>
            <Text style={checklistItem}>✓ Entry instructions saved</Text>
            <Text style={checklistItem}>✓ Address pulled up on maps</Text>
          </Section>

          <Button style={button} href={`${appUrl}/bookings/${bookingId}`}>
            View Full Booking Details
          </Button>

          <Text style={footer}>
            Have a great workout! 💪
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
};

const alertBanner = {
  backgroundColor: '#fef3c7',
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 16px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const intro = {
  color: '#666666',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 32px',
  textAlign: 'center' as const,
};

const section = {
  marginBottom: '24px',
};

const addressSection = {
  backgroundColor: '#f0f9ff',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
  border: '1px solid #0ea5e9',
};

const importantSection = {
  backgroundColor: '#fef3c7',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
  border: '1px solid #fbbf24',
};

const contactSection = {
  backgroundColor: '#f5f3ff',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
  border: '1px solid #8b5cf6',
};

const label = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const value = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const dateText = {
  color: '#666666',
  fontSize: '14px',
  margin: '4px 0 0',
};

const directionsButton = {
  color: '#0ea5e9',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  marginTop: '12px',
  display: 'inline-block',
};

const phoneLink = {
  color: '#8b5cf6',
  textDecoration: 'none',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
};

const checklistSection = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
};

const checklistTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const checklistItem = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
  margin: '24px 0',
};

const footer = {
  color: '#666666',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0 0',
  textAlign: 'center' as const,
};

export default ReminderEmail;
