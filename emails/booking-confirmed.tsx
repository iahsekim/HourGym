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

interface BookingConfirmedEmailProps {
  spaceName: string;
  gymName: string;
  date: Date;
  startTime: string;
  endTime: string;
  address: string | null;
  entryInstructions: string | null;
  contactName: string | null;
  contactPhone: string | null;
  totalAmount: number; // in dollars
  bookingId: string;
}

export function BookingConfirmedEmail({
  spaceName,
  gymName,
  date,
  startTime,
  endTime,
  address,
  entryInstructions,
  contactName,
  contactPhone,
  totalAmount,
  bookingId,
}: BookingConfirmedEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hourgym.com';

  return (
    <Html>
      <Head />
      <Preview>Your booking at {gymName} is confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed ✓</Heading>

          <Text style={intro}>
            Great news! Your booking has been confirmed. Here are the details:
          </Text>

          <Section style={section}>
            <Text style={label}>Space</Text>
            <Text style={value}>
              {spaceName} at {gymName}
            </Text>
          </Section>

          <Section style={section}>
            <Text style={label}>When</Text>
            <Text style={value}>
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            <Text style={value}>
              {startTime} - {endTime}
            </Text>
          </Section>

          {address && (
            <Section style={section}>
              <Text style={label}>Where</Text>
              <Text style={value}>{address}</Text>
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                style={mapLink}
              >
                View on Google Maps →
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
            <Section style={section}>
              <Text style={label}>Day-of Contact</Text>
              <Text style={value}>
                {contactName}
                {contactPhone && ` • ${contactPhone}`}
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={section}>
            <Text style={label}>Total Paid</Text>
            <Text style={totalStyle}>${totalAmount.toFixed(2)}</Text>
          </Section>

          <Button style={button} href={`${appUrl}/bookings/${bookingId}`}>
            View Booking Details
          </Button>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={helpText}>
              Need to cancel or modify your booking? You can manage your booking
              through your{' '}
              <Link href={`${appUrl}/bookings`} style={link}>
                bookings page
              </Link>
              . Please review the cancellation policy for any applicable fees.
            </Text>
          </Section>

          <Text style={footer}>
            Questions? Reply to this email or visit our{' '}
            <Link href={appUrl} style={link}>
              Help Center
            </Link>
            .
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

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 24px',
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

const importantSection = {
  backgroundColor: '#fef3c7',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
  border: '1px solid #fbbf24',
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

const totalStyle = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
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

const mapLink = {
  color: '#2563eb',
  fontSize: '14px',
  textDecoration: 'none',
  marginTop: '8px',
  display: 'inline-block',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};

const helpText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const footer = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
};

export default BookingConfirmedEmail;
