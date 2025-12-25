'use client';

import { createUser } from '@/app/actions/user';
import { AlertCircle, Check, Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Creating...
        </>
      ) : (
        <>
          Create User
        </>
      )}
    </button>
  );
}

export function UserInviteDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    const result = await createUser({}, formData);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess('User created successfully');
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 1500);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 transition shadow-lg shadow-primary/20"
      >
        <Plus size={18} />
        Invite User
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-text-muted hover:text-foreground transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-1">Invite New User</h2>
        <p className="text-sm text-text-muted mb-6">Add a new user to the organization</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-500">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-sm text-green-500">
            <Check size={16} />
            {success}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ex: John Doe"
              className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="Ex: john@example.com"
              className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
            <select
              name="role"
              required
              className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Initial Password</label>
            <input
              type="text"
              name="password"
              defaultValue="Welcome123!"
              className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-mono text-sm"
            />
            <p className="text-xs text-text-muted mt-1">Share this password with the user.</p>
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
