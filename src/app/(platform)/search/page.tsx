import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { SearchForm } from "@/components/search/search-form";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { q } = await searchParams;

  let cards: {
    id: string;
    title: string;
    description: string | null;
    list: { title: string; board: { id: string; title: string; backgroundColor: string } };
  }[] = [];

  if (q && q.trim().length > 0) {
    // Get boards user has access to
    const boardIds = await db.boardMember.findMany({
      where: { userId: session.user.id },
      select: { boardId: true },
    });

    cards = await db.card.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
        list: {
          boardId: { in: boardIds.map((b) => b.boardId) },
        },
      },
      include: {
        list: {
          select: {
            title: true,
            board: {
              select: { id: true, title: true, backgroundColor: true },
            },
          },
        },
      },
      take: 50,
      orderBy: { updatedAt: "desc" },
    });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Cari Card</h1>
      </div>

      <SearchForm initialQuery={q} />

      {q && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {cards.length} hasil untuk &quot;{q}&quot;
          </p>

          {cards.map((card) => (
            <Link
              key={card.id}
              href={`/board/${card.list.board.id}`}
              className="block"
            >
              <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded flex-shrink-0"
                    style={{
                      backgroundColor: card.list.board.backgroundColor,
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{card.title}</h3>
                    {card.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {card.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {card.list.board.title} &bull; {card.list.title}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {cards.length === 0 && q && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Tidak ada card yang ditemukan
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
