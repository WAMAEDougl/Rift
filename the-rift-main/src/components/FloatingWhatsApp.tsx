"use client";

import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { BUSINESS, getWhatsAppOrderLink } from "@/lib/constants";

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);

  const quickMessages = [
    { label: "I want to place an order", icon: "🛒" },
    { label: "What's on the menu today?", icon: "📋" },
    { label: "Do you deliver to my area?", icon: "🚚" },
    { label: "I need a custom flour blend", icon: "🌾" },
  ];

  const contactChannels = [
    {
      label: "Call Us",
      href: "tel:+254713280550",
      icon: "📞",
      color: "bg-primary hover:opacity-90",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/${BUSINESS.whatsapp}`,
      icon: "💬",
      color: "bg-primary hover:opacity-90",
    },
    {
      label: "Facebook",
      href: BUSINESS.facebook,
      icon: "📘",
      color: "bg-primary hover:opacity-90",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat popup */}
      {isOpen && (
        <div className="mb-4 w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-primary p-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-lg">
                  A
                </div>
                <div>
                  <p className="font-bold text-sm">{BUSINESS.name}</p>
                  <p className="text-primary-foreground/70 text-xs">
                    Usually replies within minutes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="bg-muted/50 rounded-xl p-3 mb-4">
              <p className="text-sm text-foreground/80">
                Hi! 👋 Welcome to Ayola Foods. How can we help you today?
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Tap a message below or type your own
              </p>
            </div>

            {/* Quick messages */}
            <div className="space-y-2">
              {quickMessages.map((msg) => (
                <a
                  key={msg.label}
                  href={getWhatsAppOrderLink(msg.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg border border-border text-sm text-foreground/80 hover:bg-muted hover:border-border hover:text-foreground transition-colors"
                >
                  <span>{msg.icon}</span>
                  {msg.label}
                </a>
              ))}
            </div>

            {/* Contact channels — call, WhatsApp, Facebook */}
            <div className="flex gap-2 mt-3">
              {contactChannels.map((ch) => (
                <a
                  key={ch.label}
                  href={ch.href}
                  target={ch.href.startsWith("tel:") ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-primary-foreground text-xs font-semibold transition-colors ${ch.color}`}
                >
                  <span>{ch.icon}</span> {ch.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-foreground text-background rounded-full shadow-lg hover:bg-primary hover:scale-110 transition-all flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6 fill-current" />
        )}
      </button>
    </div>
  );
}
