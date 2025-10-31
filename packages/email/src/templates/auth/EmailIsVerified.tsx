import * as React from "react";
import { Section, Text } from "@react-email/components";
import Layout from "./../Layout";
const styles = {
  p: { color: "#333", fontSize: "15px", lineHeight: "1.5" },
} as const;
import { siteName } from "@rccyx/constants";

export interface EmailIsVerifiedProps {
  readonly userName?: string;
}

export default function EmailIsVerified({ userName }: EmailIsVerifiedProps) {
  return (
    <Layout title={`Welcome to ${siteName}`} previewText="You are all set">
      <Section>
        <Text style={styles.p}>
          {userName ? `Hi ${userName},` : "Hi,"} your email is verified. You are
          all set.
        </Text>
        <Text style={styles.p}>Jump back in and enjoy.</Text>
      </Section>
    </Layout>
  );
}
