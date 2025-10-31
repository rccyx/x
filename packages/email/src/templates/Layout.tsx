import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import { siteName } from "@rccyx/constants";

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
  footerNote?: string;
  previewText?: string;
}

export default function Layout({
  title,
  children,
  footerNote,
  previewText,
}: LayoutProps) {
  const heading = title ?? siteName;

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        {previewText ? <div style={styles.preheader}>{previewText}</div> : null}
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={styles.table}
        >
          <tr>
            <td align="center">
              <Container style={styles.container}>
                <Section style={styles.header}>
                  <Text style={styles.h1}>{heading}</Text>
                </Section>
                <Hr style={styles.hr} />
                <Section style={styles.content}>{children}</Section>
                <Hr style={styles.hr} />
                <Section style={styles.footer}>
                  <Text style={styles.footerText}>
                    © {new Date().getFullYear()} @rccyx. All rights reserved.
                  </Text>
                  {footerNote ? (
                    <Text style={styles.footerSub}>{footerNote}</Text>
                  ) : null}
                </Section>
              </Container>
            </td>
          </tr>
        </table>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: "#ffffff",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
  },
  table: { backgroundColor: "#ffffff" },
  container: {
    margin: "0 auto",
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    overflow: "hidden",
  },
  header: { padding: "20px", textAlign: "center" as const },
  h1: { fontSize: "20px", fontWeight: "bold", color: "#222222", margin: 0 },
  content: { padding: "20px", textAlign: "left" as const },
  hr: { borderColor: "#efefef" },
  footer: { padding: "16px 20px", textAlign: "center" as const },
  footerText: { fontSize: "12px", color: "#666666", margin: "0 0 4px 0" },
  footerSub: { fontSize: "12px", color: "#999999", margin: 0 },
  preheader: {
    display: "none",
    visibility: "hidden" as const,
    overflow: "hidden",
    opacity: 0,
    color: "transparent",
    height: 0,
    width: 0,
  },
};
