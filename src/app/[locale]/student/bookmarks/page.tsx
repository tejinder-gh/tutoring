import { auth } from "@/auth";
import { getUserBookmarks } from "@/lib/actions/annotations";
import { ArrowRight, Bookmark, BookOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookmarks = await getUserBookmarks();

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <Bookmark className="text-primary fill-primary" />
            My Bookmarks
          </h1>
          <p className="text-text-muted mt-2">
            Quick access to your saved lessons
          </p>
        </header>

        {bookmarks.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
              <Bookmark size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No bookmarks yet
            </h3>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Bookmark important lessons while you learn to easily find them later using the bookmark icon in the lesson viewer.
            </p>
            <Link
              href="/student/learn"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Start Learning
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {bookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                href={`/student/learn/${bookmark.lesson.module.course.id}/${bookmark.lessonId}`}
                className="group p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-primary font-bold mb-1">
                      {bookmark.lesson.module.course.title} • {bookmark.lesson.module.title}
                    </p>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {bookmark.lesson.title}
                    </h3>
                  </div>
                  <div className="p-2 bg-accent/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>

                {bookmark.note && (
                  <div className="p-3 bg-accent/10 rounded-lg mb-4">
                    <p className="text-sm text-text-muted italic">
                      "{bookmark.note}"
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <BookOpen size={14} />
                  <span>Bookmarked on {new Date(bookmark.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
