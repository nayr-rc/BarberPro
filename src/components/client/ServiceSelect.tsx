"use client";

import { useState } from "react";
import { Service } from "@/lib/types";

interface ServiceSelectProps {
  services: Service[];
  selectedService: Service | null;
  onSelect: (service: Service) => void;
}

export default function ServiceSelect({
  services,
  selectedService,
  onSelect,
}: ServiceSelectProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-barber-beige">1. Selecione o Serviço</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className={`p-4 rounded-lg border-2 transition ${
              selectedService?.id === service.id
                ? "bg-barber-brown border-barber-accent"
                : "bg-barber-dark border-barber-brown hover:border-barber-accent"
            }`}
          >
            <div className="text-left">
              <h4 className="text-barber-beige font-bold">{service.name}</h4>
              <p className="text-barber-accent text-sm">
                R$ {service.price.toFixed(2)}
              </p>
              <p className="text-barber-accent text-xs mt-1">
                ⏱️ {service.durationMinutes} min
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
