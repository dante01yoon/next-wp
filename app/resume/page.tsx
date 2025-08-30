import React from "react";
import { Section, Container, Prose } from "@/components/craft";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, ExternalLink } from "lucide-react";
import Balancer from "react-wrap-balancer";

export const metadata = {
  title: "Resume | Dante",
  description: "Professional resume and CV",
  robots: { index: true, follow: true }, // 검색엔진 차단
};

export default function ResumePage() {
  const embedUrl = `https://docs.google.com/document/d/${process.env.NEXT_PUBLIC_RESUME_EMBED_ID}`;

  const pdfUrl = `https://docs.google.com/document/d/${process.env.NEXT_PUBLIC_RESUME_EMBED_ID}/export?format=pdf`;
  return (
    <Section>
      <Container>
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <Prose>
              <h1>
                <Balancer>Resume</Balancer>
              </h1>
              <p className="text-muted-foreground">
                My professional experience and background
              </p>
            </Prose>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="default" size="lg">
                <a href={pdfUrl} className="inline-flex items-center gap-2">
                  <Download size={18} />
                  Download PDF
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a 
                  href={embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <ExternalLink size={18} />
                  Open in New Tab
                </a>
              </Button>
            </div>
          </div>

          {/* Resume Viewer Card */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Resume Viewer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[85vh] min-h-[600px] w-full bg-muted/20">
                <iframe
                  src={embedUrl}
                  title="Professional Resume"
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
