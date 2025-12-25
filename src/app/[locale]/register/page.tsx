"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight, BookOpen, CheckCircle, Code2, Loader2, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function RegisterPage() {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tier: "hands-on",
    background: "",
    goal: "",
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const tierParam = searchParams.get("tier");
    if (tierParam) {
      setFormData((prev) => ({ ...prev, tier: tierParam }));
    }
  }, [searchParams]);

  const tiers = [
    { id: "fundamentals", label: t("courses.roadmap.fundamentals.title"), price: "₹45,000", icon: BookOpen },
    { id: "hands-on", label: t("courses.roadmap.handsOn.title"), price: "₹95,000", icon: Code2, recommended: true },
    { id: "career", label: t("courses.roadmap.career.title"), price: "₹1,35,000", icon: Rocket },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("contact.form.error"));
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("contact.form.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-accent/20 rounded-2xl p-8 border border-border text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t("contact.success.title")}
          </h1>
          <p className="text-text-muted mb-6">
            {t("contact.success.message")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Back to Home <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t("contact.form.title")}
          </h1>
          <p className="text-text-muted">
            {t("contact.form.subtitle")}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${step >= s ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-accent text-text-muted'}`}
              >
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-0.5 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-accent/10 backdrop-blur-sm rounded-3xl p-8 border border-border shadow-xl">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Personal Information</h2>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">{t("contact.form.name")}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">{t("contact.form.email")}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">{t("contact.form.phone")}</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.email || !formData.phone}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Choose Tier */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Choose Your Track</h2>

              <div className="space-y-4">
                {tiers.map((tier) => (
                  <label
                    key={tier.id}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all
                      ${formData.tier === tier.id
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                        : 'border-border hover:border-border/80 bg-accent/5'
                      }
                      ${tier.recommended ? 'ring-1 ring-primary/20' : ''}`}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={tier.id}
                      checked={formData.tier === tier.id}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.tier === tier.id ? 'bg-primary text-primary-foreground' : 'bg-accent text-text-muted'}`}>
                      <tier.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{tier.label}</span>
                        {tier.recommended && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-black">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <span className="text-text-muted text-xs font-semibold">{tier.price}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${formData.tier === tier.id ? 'border-primary bg-primary shadow-sm shadow-primary/20' : 'border-border'}`}>
                      {formData.tier === tier.id && <CheckCircle size={12} className="text-primary-foreground" />}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-accent/50 text-foreground py-4 rounded-xl font-bold hover:bg-accent transition active:scale-[0.98]"
                >
                  {tCommon("back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {tCommon("continue")} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Background & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Final Details</h2>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">{t("contact.form.status")}</label>
                <select
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="">{t("contact.form.statusPlaceholder")}</option>
                  <option value="student">{t("contact.form.options.student")}</option>
                  <option value="graduate">{t("contact.form.options.graduate")}</option>
                  <option value="professional">{t("contact.form.options.professional")}</option>
                  <option value="other">{t("contact.form.options.other")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">{t("contact.form.goalsLabel")}</label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-primary resize-none outline-none transition-all"
                  placeholder="Tell us what you want to achieve..."
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center font-medium">{error}</p>
              )}

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-accent/50 text-foreground py-4 rounded-xl font-bold hover:bg-accent transition active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {t("contact.form.submitting")}
                    </>
                  ) : (
                    <>
                      {t("contact.form.submit")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
