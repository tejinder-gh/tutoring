"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center font-sans">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="text-red-500 w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Critical System Error</h1>
        <p className="text-gray-400 max-w-md mb-8">
          The application encountered a critical error and cannot recover.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Reload Application
        </button>
      </body>
    </html>
  );
}
