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

interface BookingCancelledEmailProps {
  spaceName: string;
  gymName: string;
  date: Date;
  startTime: string;
  endTime: string;
  refundAmount: number; // in dollars
  cancelledByGym: boolean;
}

export function BookingCancelledEmail({
  spaceName,
  gymName,
  date,
  startTime,
  endTime,
  refundAmount,
  cancelledByGym,
}: BookingCancelledEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hourgym.com';
  const hasRefund = refundAmount > 0;

  return (
    <Html>
      <Head />
      <Preview>Your booking at {gymName} has been cancelled</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Cancelled</Heading>

          <Text style={intro}>
            {cancelledByGym
              ? `We're sorry, but ${gymName} has cancelled your booking. A full refund has been issued.`
              : 'Your booking has been cancelled as requested.'}
          </Text>

          <Section style={section}>
            <Text style={label}>Cancelled Booking</Text>
            <Text style={value}>
              {spaceName} at {gymName}
            </Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Original Date & Time</Text>
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

          <Hr style={hr} />

          <Section style={refundSection}>
            <Text style={label}>Refund Status</Text>
            {hasRefund ? (
              <>
                <Text style={refundAmount > 0 ? refundValue : value}>
                  ${refundAmount.toFixed(2)} refunded
                </Text>
                <Text style={refundNote}>
                  The refund has been initiated and should appear in your
                  account within 5-10 business days, depending on your payment
                  method.
                </Text>
              </>
            ) : (
              <Text style={value}>
                No refund applied based on the cancellation policy.
              </Text>
            )}
          </Section>

          <Hr style={hr} />

          <Button style={button} href={`${appUrl}/spaces`}>
            Book Another Space
          </Button>

          <Text style={footer}>
            {cancelledByGym
              ? "We apologize for any inconvenience. If you have questions, please reply to this email."
              : 'Questions about your refund? Reply to this email and we\'ll be happy to help.'}
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

const refundSection = {
  backgroundColor: '#f0fdf4',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
  border: '1px solid #22c55e',
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

const refundValue = {
  color: '#22c55e',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const refundNote = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
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

const footer = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
};

export default BookingCancelledEmail;
