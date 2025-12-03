import * as React from "react";
import { Section, Text } from "@react-email/components";
import Layout from "./../Layout";
import Button from "../../components/Button";

const styles = {
  p: { color: "#333", fontSize: "15px", lineHeight: "1.5" },
  small: { color: "#666", fontSize: "12px" },
} as const;

export interface VerifyEmailProps {
  readonly verifyUrl: string;
  readonly userName?: string;
}

export default function VerifyEmailTemplate({
  verifyUrl,
  userName,
}: VerifyEmailProps) {
  return (
    <Layout title="Verify your email" previewText="Confirm your address">
      <Section>
        <Text style={styles.p}>
          {userName ? `Hi ${userName},` : "Hi,"} thanks for creating an account.
          One last step before you’re all set.
        </Text>

        <Text style={styles.p}>
          Click the button below to confirm your email address.
        </Text>

        <p style={{ margin: "20px 0" }}>
          <Button href={verifyUrl}>Verify Email</Button>
        </p>

        <Text style={styles.small}>
          If the button doesn’t work, copy and paste this link:
        </Text>
        <Text style={styles.small}>{verifyUrl}</Text>

        <Text style={{ ...styles.small, marginTop: "14px" }}>
          If you didn’t create an account, you can safely ignore this message.
        </Text>
      </Section>
    </Layout>
  );
}
