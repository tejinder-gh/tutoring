import { getNotifications } from "@/app/actions/notification";
import { auth } from "@/auth";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { redirect } from "next/navigation";
import { MarkAllReadButton } from "./MarkAllReadButton";

export const dynamic = "force-dynamic";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
  link: string | null;
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const result = await getNotifications();
  const notifications = result.notifications as Notification[];
  const unreadCount = result.unreadCount;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-text-muted">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-card border rounded-xl p-4 transition ${notification.isRead
              ? "border-border opacity-70"
              : "border-primary/30 bg-primary/5"
              }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-2 rounded-lg ${notification.isRead
                  ? "bg-accent text-text-muted"
                  : "bg-primary/20 text-primary"
                  }`}
              >
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{notification.title}</h3>
                  {!notification.isRead && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-muted mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-text-muted mt-2">
                  {format(new Date(notification.createdAt), "MMM d, yyyy • h:mm a")}
                </p>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto mb-4 text-text-muted opacity-30" />
            <h2 className="text-lg font-medium mb-1">No notifications yet</h2>
            <p className="text-text-muted">
              When you receive notifications, they&apos;ll appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
