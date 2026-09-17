import React, { useState } from 'react';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

export default function ArchitectureTab() {
  const [activeConceptTab, setActiveConceptTab] = useState('WORKFLOW');

  const services = [
    {
      name: "Eureka Discovery Server",
      port: 8761,
      tech: "Spring Cloud Netflix Eureka",
      role: "Centralized service registry and instance heartbeat health directory.",
      status: "ACTIVE",
      endpoint: "http://localhost:8761",
      iconName: "explore",
    },
    {
      name: "API Gateway",
      port: 8080,
      tech: "Spring Cloud Gateway + LoadBalancer",
      role: "Edge routing, global JwtAuthFilter, and dynamic lb:// client load balancing.",
      status: "ACTIVE",
      endpoint: "http://localhost:8080",
      iconName: "layers",
    },
    {
      name: "Auth Service",
      port: 8081,
      tech: "Spring Security 6 + JJWT + BCrypt",
      role: "Stateless HMAC-SHA256 JWT tokens with role claims (CLIENT, TECHNICIAN, ADMIN).",
      status: "ACTIVE",
      endpoint: "http://localhost:8081/api/auth/users",
      iconName: "key",
    },
    {
      name: "Service Booking Service",
      port: 8082,
      tech: "Spring Data JPA + OpenFeign",
      role: "Bay slot scheduling and atomic concurrency collision elimination.",
      status: "ACTIVE",
      endpoint: "http://localhost:8082/api/bookings/bays/availability",
      iconName: "calendar_month",
    },
    {
      name: "Service Record Service",
      port: 8083,
      tech: "Spring Data JPA + OpenFeign",
      role: "Vehicle lifecycle history by VIN, DTC codes, and parts replaced.",
      status: "ACTIVE",
      endpoint: "http://localhost:8083/api/records",
      iconName: "build",
    },
    {
      name: "Billing Service",
      port: 8084,
      tech: "Spring Data JPA",
      role: "Dynamic labor, itemized parts, EPA fees, and 18% GST settlement invoice engine.",
      status: "ACTIVE",
      endpoint: "http://localhost:8084/api/billing/invoices",
      iconName: "receipt_long",
    },
  ];

  const coreConcepts = [
    {
      id: "1",
      title: "Platform Goal",
      summary: "End-to-end digital garage operations.",
      detail: "Replaces manual pen-and-paper workflow with digital booking, bay concurrency locking, mechanic diagnostic records, and automated invoicing."
    },
    {
      id: "2",
      title: "Microservices Architecture",
      summary: "Domain boundary isolation.",
      detail: "Separate microservices for Auth, Booking, Record, and Billing with dedicated data stores and OpenFeign inter-service communication."
    },
    {
      id: "3",
      title: "Bay Collision Guard",
      summary: "Zero-collision scheduling.",
      detail: "Database unique constraints on (bay_id, booking_date, time_slot) reject overlapping reservations with HTTP 409 Conflict."
    },
    {
      id: "4",
      title: "Security & API Gateway",
      summary: "Stateless JJWT tokens.",
      detail: "All external requests hit Port 8080 API Gateway. JwtAuthFilter validates headers and routes via lb:// to target microservices."
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#271638]">
        <div>
          <div className="text-xs text-zinc-400 font-mono mb-1">
            24SDCS03R &bull; Team PS24-S54-15
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Microservices Architecture &amp; System Topology
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Spring Boot 3, Spring Cloud Gateway, Eureka Server, and OpenFeign inter-service pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeConceptTab === 'WORKFLOW' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveConceptTab('WORKFLOW')}
          >
            Pipeline Flow
          </Button>
          <Button
            variant={activeConceptTab === 'CONCEPTS' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveConceptTab('CONCEPTS')}
          >
            Architecture Concepts
          </Button>
        </div>
      </div>

      {/* 2-Column Overview (NO 3/4 Horizontal Cards) */}
      {activeConceptTab === 'WORKFLOW' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-[#231333]">
              <Icon name="route" size={16} /> Inter-Service Orchestration
            </h2>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 bg-[#180e24] rounded-lg border border-[#2c1740]">
                <div className="font-semibold text-white">1. Authentication</div>
                <p className="text-zinc-400 text-[11px] mt-0.5">User logs in via Auth Service (:8081). Gateway inspects JWT bearer token on edge Port 8080.</p>
              </div>

              <div className="p-3 bg-[#180e24] rounded-lg border border-[#2c1740]">
                <div className="font-semibold text-white">2. Booking &amp; Record Staging</div>
                <p className="text-zinc-400 text-[11px] mt-0.5">Booking Service (:8082) verifies bay slot and calls Record Service (:8083) via OpenFeign to stage record.</p>
              </div>

              <div className="p-3 bg-[#180e24] rounded-lg border border-[#2c1740]">
                <div className="font-semibold text-white">3. Diagnostics &amp; Dynamic Invoicing</div>
                <p className="text-zinc-400 text-[11px] mt-0.5">Technician logs replaced parts. Moving to COMPLETED triggers Billing Service (:8084) to generate 18% GST invoice.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-[#231333]">
              <Icon name="verified_user" size={16} /> Bay Collision Elimination Case
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#180e24] rounded-lg border border-[#2c1740] font-mono">
                <div className="text-emerald-300 font-bold">Booking A (First Request):</div>
                <div className="text-zinc-300 text-[11px] mt-1">Vehicle: AP39AB1234 &bull; Bay 1 &bull; 10:00 AM</div>
                <div className="text-emerald-400 text-[11px] mt-0.5">Status: 200 OK &rarr; CONFIRMED</div>
              </div>

              <div className="p-3 bg-[#180e24] rounded-lg border border-[#2c1740] font-mono">
                <div className="text-red-300 font-bold">Booking B (Conflicting Overlap):</div>
                <div className="text-zinc-300 text-[11px] mt-1">Vehicle: KA01CD5678 &bull; Bay 1 &bull; 10:00 AM</div>
                <div className="text-red-400 text-[11px] mt-0.5">Status: 409 CONFLICT &rarr; Rejected by Guard</div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreConcepts.map((c) => (
            <Card key={c.id} className="p-6 space-y-2">
              <div className="text-xs text-purple-300 font-mono font-medium">Concept #{c.id}</div>
              <h3 className="text-sm font-bold text-white">{c.title}</h3>
              <p className="text-xs text-zinc-300 font-medium">{c.summary}</p>
              <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-[#231333]">
                {c.detail}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Services Table (Spacious, clean, no nested cards) */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#231333]">
          <h2 className="text-sm font-semibold text-white">Registered Microservices Topology</h2>
          <span className="text-xs text-zinc-400 font-mono">6 Microservices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#271638] text-zinc-400 font-medium">
                <th className="py-2.5 px-3">Microservice</th>
                <th className="py-2.5 px-3">Port</th>
                <th className="py-2.5 px-3">Technology</th>
                <th className="py-2.5 px-3">Domain Responsibility</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e102e] text-zinc-200">
              {services.map((s) => (
                <tr key={s.name} className="hover:bg-[#1a0e28] transition-colors">
                  <td className="py-3 px-3 font-semibold text-white font-mono flex items-center gap-2">
                    <Icon name={s.iconName} size={16} />
                    <span>{s.name}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-purple-300">:{s.port}</td>
                  <td className="py-3 px-3 text-zinc-400">{s.tech}</td>
                  <td className="py-3 px-3 text-zinc-300">{s.role}</td>
                  <td className="py-3 px-3 text-right">
                    <Badge variant="success">
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
