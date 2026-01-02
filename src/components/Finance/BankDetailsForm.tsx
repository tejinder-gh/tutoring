"use client";

import { updateBankDetails } from "@/app/actions/finance";
import { useState } from "react";

export function BankDetailsForm({ initialDetails }: { initialDetails?: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      bankName: formData.get("bankName") as string,
      accountNumber: formData.get("accountNumber") as string,
      ifsc: formData.get("ifsc") as string,
    };

    await updateBankDetails(data);
    setIsSaving(false);
    setIsEditing(false);
  };

  if (!isEditing && initialDetails) {
    return (
      <div className="bg-card border border-border p-6 rounded-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold">Bank Details</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2">
            <span className="text-text-muted">Bank Name</span>
            <span className="font-medium">{initialDetails.bankName}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="text-text-muted">Account No.</span>
            <span className="font-medium font-mono">
              {initialDetails.accountNumber.replace(/.(?=.{4})/g, '*')}
            </span>
          </div>
          <div className="grid grid-cols-2">
            <span className="text-text-muted">IFSC Code</span>
            <span className="font-medium font-mono">{initialDetails.ifsc}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-6 rounded-xl">
      <h3 className="font-bold mb-4">{isEditing ? "Update Bank Details" : "Add Bank Details"}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-text-muted">Bank Name</label>
          <input
            name="bankName"
            defaultValue={initialDetails?.bankName}
            required
            className="w-full p-2 rounded border border-border bg-background text-sm"
            placeholder="e.g. HDFC Bank"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-text-muted">Account Number</label>
          <input
            name="accountNumber"
            defaultValue={initialDetails?.accountNumber}
            required
            className="w-full p-2 rounded border border-border bg-background text-sm font-mono"
            placeholder="0000 0000 0000 0000"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-text-muted">IFSC Code</label>
          <input
            name="ifsc"
            defaultValue={initialDetails?.ifsc}
            required
            className="w-full p-2 rounded border border-border bg-background text-sm font-mono uppercase"
            placeholder="HDFC0001234"
          />
        </div>
        <div className="flex gap-2 justify-end mt-4">
          {initialDetails && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-outline text-xs px-3 py-2"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary text-xs px-3 py-2"
          >
            {isSaving ? "Saving..." : "Save Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
