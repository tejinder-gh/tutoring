import { getCurrentUser } from "@/app/actions/user";
import { auth } from "@/auth";
import { Key, User } from "lucide-react";
import { redirect } from "next/navigation";
import { ChangePasswordForm, ProfileForm } from "./ProfileForms";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-text-muted">Manage your account settings</p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Profile Information</h2>
              <p className="text-sm text-text-muted">Update your personal details</p>
            </div>
          </div>

          <ProfileForm user={user} />
        </div>

        {/* Password Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500">
              <Key size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Change Password</h2>
              <p className="text-sm text-text-muted">Update your account password</p>
            </div>
          </div>

          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
