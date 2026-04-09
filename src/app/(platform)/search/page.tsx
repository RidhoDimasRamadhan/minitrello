import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, KanbanSquare, CreditCard } from "lucide-react";
import { SearchForm } from "@/components/search/search-form";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { q } = await searchParams;

  let boards: {
    id: string;
    title: string;
    backgroundColor: string;
    description: string | null;
    workspace: { name: string };
    _count: { lists: number; members: number };
  }[] = [];

  let cards: {
    id: string;
    title: string;
    description: string | null;
    list: { title: string; board: { id: string; title: string; backgroundColor: string } };
  }[] = [];

  if (q && q.trim().length > 0) {
    const boardMemberships = await db.boardMember.findMany({
      where: { userId: session.user.id },
      select: { boardId: true },
    });
    const boardIds = boardMemberships.map((b) => b.boardId);

    // Search boards
    boards = await db.board.findMany({
      where: {
        id: { in: boardIds },
        isClosed: false,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        workspace: { select: { name: true } },
        _count: { select: { lists: true, members: true } },
      },
      take: 20,
      orderBy: { updatedAt: "desc" },
    });

    // Search cards
    cards = await db.card.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
        list: {
          boardId: { in: boardIds },
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

  const totalResults = boards.length + cards.length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Cari</h1>
      </div>

      <SearchForm initialQuery={q} />

      {q && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {totalResults} hasil untuk &quot;{q}&quot;
          </p>

          {/* Board Results */}
          {boards.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <KanbanSquare className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm text-muted-foreground uppercase">
                  Board ({boards.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {boards.map((board) => (
                  <Link key={board.id} href={`/board/${board.id}`}>
                    <div
                      className="h-24 rounded-lg overflow-hidden relative hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: board.backgroundColor }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative p-3 h-full flex flex-col justify-between">
                        <span className="text-white font-semibold text-sm truncate">
                          {board.title}
                        </span>
                        <div className="text-white/70 text-xs">
                          <span>{board.workspace.name}</span>
                          <span className="mx-1">&bull;</span>
                          <span>{board._count.lists} list</span>
                          <span className="mx-1">&bull;</span>
                          <span>{board._count.members} member</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Card Results */}
          {cards.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm text-muted-foreground uppercase">
                  Card ({cards.length})
                </h2>
              </div>
              <div className="space-y-2">
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
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-1">Tidak ada hasil</p>
              <p className="text-muted-foreground text-sm">
                Coba kata kunci lain untuk mencari board atau card
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
