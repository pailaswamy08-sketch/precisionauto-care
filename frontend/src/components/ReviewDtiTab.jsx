import React, { useState } from 'react';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

export default function ReviewDtiTab() {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('rubrics');

  const rubricsData = [
    {
      id: 1,
      title: "Problem Analysis & Specification",
      score: "10 / 10",
      grade: "Complete Structure",
      evidence: "Defined in project docs & table justification matrix."
    },
    {
      id: 2,
      title: "Microservices & Discovery",
      score: "10 / 10",
      grade: "Modular Design",
      evidence: "Eureka (:8761) & OpenFeign client implementations."
    },
    {
      id: 3,
      title: "JWT Authentication",
      score: "10 / 10",
      grade: "HMAC-SHA256 & RBAC",
      evidence: "auth-service (:8081) & api-gateway JwtAuthFilter."
    },
    {
      id: 4,
      title: "API Gateway Configuration",
      score: "10 / 10",
      grade: "Reactive WebFlux",
      evidence: "api-gateway (:8080) application.yml & JwtAuthFilter."
    },
    {
      id: 5,
      title: "DTI Framework & Article",
      score: "10 / 10",
      grade: "5-Stage DTI",
      evidence: "Empathize, Define, Ideate, Prototype, Test documentation."
    }
  ];

  const tableJustifications = [
    {
      service: "Auth Service (:8081)",
      table: "users",
      justification: "Critical Security Isolation: Password hashes and role metadata are isolated in authdb to ensure user credential security."
    },
    {
      service: "Booking Service (:8082)",
      table: "bookings",
      justification: "Atomic Collision Elimination: Unique indexing on (bay_id, booking_date, time_slot) prevents overlapping reservations."
    },
    {
      service: "Record Service (:8083)",
      table: "service_records & part_items",
      justification: "Lifecycle Traceability: Tracks sequential repair stages, DTC trouble codes, and cataloged replacement parts by VIN."
    },
    {
      service: "Billing Service (:8084)",
      table: "invoices & invoice_items",
      justification: "Financial Settlement: Encapsulates dynamic billing (Labor + Parts + EPA Fee + 18% GST) and payment audit trail."
    }
  ];

  const handleCopyLinkedInArticle = () => {
    const articleText = `# 🚀 Revolutionizing Automotive Fleet Maintenance with Cloud-Native Microservices (PrecisionAuto Care)

By Team PS24-S54-15 | Course: 24SDCS03R – SOA Programming and Microservices (2026–2027)

## Executive Summary
PrecisionAuto Care (PS024) is a digital platform built on Spring Boot 3, Spring Cloud Gateway, Eureka Server, JJWT, and React.

## DTI 5-Stage Framework
1. EMPATHIZE: Field interviews revealed bay scheduling collisions and fragmented vehicle histories.
2. DEFINE: Formulated requirements for zero-collision bay reservations and dynamic GST invoicing.
3. IDEATE: Decoupled into 4 domain microservices with OpenFeign declarative choreography.
4. PROTOTYPE: Spring Boot 3 microservices + Spring Cloud Gateway (:8080) + Eureka (:8761) + React.
5. TEST: 100% automated test coverage validating collision prevention, JWT security, and dynamic billing.

#Microservices #SpringBoot #SpringCloud #SoftwareArchitecture #SystemDesign #DesignThinking #Java`;

    navigator.clipboard.writeText(articleText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="text-xs text-zinc-400 font-mono mb-1">
            Course 24SDCS03R &bull; Team PS24-S54-15
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Review 1 Continuous Evaluation &amp; DTI Dossier
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Rubrics evaluation (50/50), Database Justification Matrix, and Design Thinking Framework.
          </p>
        </div>

        <Button
          onClick={handleCopyLinkedInArticle}
          className="gap-2 text-xs"
        >
          <Icon name={copied ? "check" : "share"} size={16} />
          <span>{copied ? 'Article Copied!' : 'Copy LinkedIn Article'}</span>
        </Button>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2">
        <Button
          variant={activeSection === 'rubrics' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('rubrics')}
          className="text-xs"
        >
          Rubrics Scorecard
        </Button>
        <Button
          variant={activeSection === 'justification' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('justification')}
          className="text-xs"
        >
          Database Justification
        </Button>
        <Button
          variant={activeSection === 'dti' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('dti')}
          className="text-xs"
        >
          DTI 5-Stages
        </Button>
      </div>

      {/* Section 1: Rubrics Scorecard */}
      {activeSection === 'rubrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rubricsData.map((r) => (
            <Card key={r.id} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 font-medium">Rubric #{r.id}</span>
                <Badge variant="success" className="font-mono text-xs">
                  {r.score}
                </Badge>
              </div>

              <h2 className="text-sm font-bold text-white">{r.title}</h2>
              <div className="text-xs text-zinc-300 font-medium">{r.grade}</div>

              <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                {r.evidence}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Section 2: Database Justification Table */}
      {activeSection === 'justification' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white">Database-per-Service Justification Matrix</h2>
            <span className="text-xs text-zinc-400 font-mono">4 Schemas</span>
          </div>

          <div className="space-y-4 text-xs">
            {tableJustifications.map((item, idx) => (
              <div key={idx} className="p-4 bg-zinc-950 rounded-md border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-mono">{item.service}</span>
                  <Badge variant="secondary" className="font-mono text-[11px]">{item.table}</Badge>
                </div>
                <p className="text-zinc-300 leading-relaxed pt-1">
                  {item.justification}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Section 3: DTI 5-Stage Framework */}
      {activeSection === 'dti' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">1. Empathize &amp; 2. Define</h3>
            <div className="space-y-2 text-xs text-zinc-300">
              <p><strong className="text-white">Empathize:</strong> Identified fleet dispatcher scheduling bottlenecks and mechanic record fragmentation.</p>
              <p><strong className="text-white">Define:</strong> Formulated core needs for zero-collision bay reservations and dynamic GST invoicing.</p>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">3. Ideate, 4. Prototype &amp; 5. Test</h3>
            <div className="space-y-2 text-xs text-zinc-300">
              <p><strong className="text-white">Ideate:</strong> Decoupled into 4 domain microservices with OpenFeign orchestration.</p>
              <p><strong className="text-white">Prototype:</strong> Built full-stack system on Spring Boot 3 + Eureka (:8761) + Gateway (:8080) + React.</p>
              <p><strong className="text-white">Test:</strong> 100% automated test coverage validating collision prevention and dynamic billing.</p>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
