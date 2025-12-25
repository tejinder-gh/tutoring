import { auth } from "@/auth";
import { getAllHighlights } from "@/lib/actions/annotations";
import { ArrowRight, Highlighter, Quote } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HighlightsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const highlights = await getAllHighlights();

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <Highlighter className="text-primary" />
            My Highlights
          </h1>
          <p className="text-text-muted mt-2">
            Your annotated notes from lessons
          </p>
        </header>

        {highlights.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
              <Highlighter size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No highlights yet
            </h3>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Select text in any lesson to highlight it and add personal notes. They will appear here for review.
            </p>
            <Link
              href="/student/learn"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Start Learning
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {highlights.map((highlight) => (
              <Link
                key={highlight.id}
                href={`/student/learn/${highlight.lesson.module.curriculum.course.id}/${highlight.lessonId}`}
                className="block p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-all hover:shadow-lg group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-1 h-full min-h-[60px] rounded-full shrink-0"
                    style={{ backgroundColor: highlight.color }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted font-bold mb-2">
                      {highlight.lesson.module.curriculum.course.title} / {highlight.lesson.title}
                    </p>

                    <blockquote className="text-lg font-medium text-foreground mb-3 relative pl-4 italic">
                      <Quote className="absolute left-0 top-0 w-3 h-3 text-text-muted opacity-50 -scale-x-100" />
                      "{highlight.selectedText}"
                    </blockquote>

                    {highlight.note && (
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <p className="text-sm text-foreground">
                          <span className="font-bold text-primary mr-2">Note:</span>
                          {highlight.note}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-text-muted mt-3">
                      {new Date(highlight.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="self-center p-2 bg-accent/10 rounded-lg text-text-muted group-hover:text-primary transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
