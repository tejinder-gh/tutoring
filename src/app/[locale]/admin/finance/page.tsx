
import { AlertCircle, ArrowRight, Lock, Wallet } from "lucide-react";

export default function AdminFinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance</h1>
          <p className="text-text-muted">Financial overview and reports</p>
        </div>
      </div>

      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative max-w-lg w-full">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-3xl rounded-full opacity-50"></div>

            <div className="relative bg-background/50 backdrop-blur-sm border border-border rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 relative">
                     <Wallet className="text-text-muted" size={40} />
                     <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full border border-border">
                         <Lock size={20} className="text-primary" />
                     </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-4">Module Locked</h2>
                <p className="text-text-muted mb-8 leading-relaxed">
                    The Finance module is currently under active development. It will include revenue tracking, fee collection reports, and staff payroll management.
                </p>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/50 text-left">
                         <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <ArrowRight size={14} className="text-green-500" />
                         </div>
                         <div>
                             <div className="text-sm font-semibold text-foreground">Revenue Analytics</div>
                             <div className="text-xs text-text-muted">Coming Q1 2025</div>
                         </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/50 text-left">
                         <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <ArrowRight size={14} className="text-blue-500" />
                         </div>
                         <div>
                             <div className="text-sm font-semibold text-foreground">Automated Invoicing</div>
                             <div className="text-xs text-text-muted">Coming Q1 2025</div>
                         </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                        <AlertCircle size={12} />
                        Early Access Preview
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
