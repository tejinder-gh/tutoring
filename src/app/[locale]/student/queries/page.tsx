import { auth } from "@/auth";
import { createQuery } from "@/lib/actions/communication";
import { db } from "@/lib/db";
import { MessageSquare } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function StudentQueriesPage() {
    const session = await auth();
    if (!session?.user?.id) return <div>Unauthorized</div>;

    const queries = await db.query.findMany({
        where: { studentId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My Queries</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    {queries.map(query => (
                        <div key={query.id} className="bg-accent/20 border border-border p-6 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold">{query.subject}</h3>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${query.status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                                    }`}>
                                    {query.status}
                                </span>
                            </div>
                            <p className="text-text-muted text-sm">{query.message}</p>
                            {query.response && (
                                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="text-xs font-semibold text-green-600 mb-1">Response:</p>
                                    <p className="text-sm text-foreground">{query.response}</p>
                                </div>
                            )}
                            <p className="text-xs text-text-muted mt-4">
                                {new Date(query.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                    {queries.length === 0 && <p className="text-text-muted">No queries yet.</p>}
                </div>

                <div>
                    <div className="bg-accent/10 border border-border p-6 rounded-xl sticky top-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <MessageSquare size={18} /> Ask a Question
                        </h3>
                        <form action={createQuery} className="space-y-4">
                            <input
                                type="text" name="subject" placeholder="Subject" required
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                            />
                            <textarea
                                name="message" placeholder="Type your question..." required rows={4}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                            />
                            <button type="submit" className="w-full bg-primary text-black font-bold py-2 rounded text-sm hover:opacity-90">
                                Submit Query
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
