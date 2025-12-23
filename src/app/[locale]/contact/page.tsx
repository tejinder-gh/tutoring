"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ContactPage() {
    const t = useTranslations("contact");
    const footerT = useTranslations("footer");

    return (
        <div className="min-h-screen bg-background">
            <section className="relative py-20 px-6 bg-accent/5 border-border">
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
                                <p className="text-muted-foreground">SCO-25, first, Near, New, Krishna Mandir Rd, near Baba Deep Singh G Gurdwara, Nehru Nagar, Model Town Extension, Model Town, Ludhiana, Punjab 141002</p>
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
                                <p className="text-muted-foreground">+91 79733 93949</p>
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
                                <label className="text-sm font-medium">{t("form.tierLabel")}</label>
                                <select className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="">{t("form.tierPlaceholder")}</option>
                                    {Object.entries(t.raw("form.tierOptions")).map(([key, label]: [string, any]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
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

                {/* Google Map Embed */}
                <div className="container mx-auto max-w-6xl mt-12 rounded-3xl overflow-hidden border border-border shadow-md">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3423.638531238495!2d75.8458157762464!3d30.896942177759246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a8235a82860c7%3A0xe547466e3b567d1d!2sBaba%20Deep%20Singh%20Gurudwara%20Sahib!5e0!3m2!1sen!2sin!4v1703275000000!5m2!1sen!2sin"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </section >
        </div >
    );
}
