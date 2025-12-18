"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("contact");
  const footerT = useTranslations("footer");

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-6 bg-accent/5 border-b border-border">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
             {footerT("contact")}
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 max-w-6xl">
            {/* Contact Info */}
            <div className="space-y-8">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-1">Visit Us</h3>
                        <p className="text-muted-foreground">{footerT("address")}</p>
                    </div>
                </div>

                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-1">Email Us</h3>
                        <p className="text-muted-foreground">hello@futureready.com</p>
                    </div>
                </div>

                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Phone size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-1">Call Us</h3>
                        <p className="text-muted-foreground">+91 98765 43210</p>
                    </div>
                </div>
            </div>

            {/* Form Placeholder */}
            <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
                <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-sm font-medium">First Name</label>
                             <input type="text" className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Last Name</label>
                             <input type="text" className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Doe" />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="text-sm font-medium">Email</label>
                         <input type="email" className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none" placeholder="john@example.com" />
                    </div>
                     <div className="space-y-2">
                         <label className="text-sm font-medium">Message</label>
                         <textarea className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px]" placeholder="How can we help you?" />
                    </div>
                    <button className="w-full py-3 rounded-xl bg-primary text-black font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
                        <Send size={18} />
                        Send Message
                    </button>
                </form>
            </div>
        </div>
      </section>
    </div>
  );
}
