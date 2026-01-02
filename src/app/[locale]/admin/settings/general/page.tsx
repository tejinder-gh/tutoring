import { getSettings, updateSettings } from "@/app/actions/settings";
import { auth } from "@/auth";

export default async function GeneralSettingsPage() {
  const session = await auth();
  if (!session?.user) return <div>Unauthorized</div>;

  const settings = await getSettings();

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6">General Settings</h2>

      <form action={updateSettings} className="space-y-6">
        <div className="space-y-4 bg-card border border-border p-6 rounded-xl">
          <h3 className="font-bold border-b border-border pb-2">Site Information</h3>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Site Name</label>
            <input
              name="site.name"
              defaultValue={(settings as any)["site.name"] || "Future Ready"}
              className="input-field"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="site.description"
              defaultValue={(settings as any)["site.description"] || ""}
              className="input-field min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-4 bg-card border border-border p-6 rounded-xl">
          <h3 className="font-bold border-b border-border pb-2">Contact Details</h3>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Contact Email</label>
            <input
              name="contact.email"
              type="email"
              defaultValue={(settings as any)["contact.email"] || ""}
              className="input-field"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input
              name="contact.phone"
              defaultValue={(settings as any)["contact.phone"] || ""}
              className="input-field"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Address</label>
            <textarea
              name="contact.address"
              defaultValue={(settings as any)["contact.address"] || ""}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
