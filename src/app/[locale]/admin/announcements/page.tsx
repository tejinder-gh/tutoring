import { createAnnouncement } from "@/lib/actions/communication";
import { db } from "@/lib/db";
import { Megaphone, Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Announcements</h1>
      <p className="text-text-muted mb-8">Broadcast updates to all students and staff.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Form */}
          <div>
              <div className="bg-accent/10 border border-border p-6 rounded-xl">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Plus size={18} /> New Announcement
                  </h3>
                  <form action={createAnnouncement} className="space-y-4">
                      <input
                          type="text" name="title" placeholder="Title" required
                          className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                      />
                      <textarea
                          name="content" placeholder="Message content..." required rows={4}
                          className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                      />
                      <button type="submit" className="w-full bg-primary text-black font-bold py-2 rounded text-sm hover:opacity-90">
                          Post Announcement
                      </button>
                  </form>
              </div>
          </div>

          {/* List */}
          <div className="space-y-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                  <Megaphone size={20} /> History
              </h3>
              {announcements.map(ann => (
                  <div key={ann.id} className="bg-accent/20 border border-border p-4 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{ann.title}</h4>
                          <span className="text-xs text-text-muted">{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-text-muted">{ann.content}</p>
                      <p className="text-xs text-text-muted mt-2 border-t border-border/30 pt-2">
                          Posted by: {ann.author.name}
                      </p>
                  </div>
              ))}
              {announcements.length === 0 && <p className="text-text-muted">No announcements found.</p>}
          </div>
      </div>
    </div>
  );
}
