import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { LayoutTemplate } from "lucide-react";
import { TemplateCard } from "@/components/board/template-card";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const templates = await db.board.findMany({
    where: { isTemplate: true },
    include: {
      lists: { select: { id: true, title: true } },
      createdBy: { select: { name: true } },
      _count: { select: { lists: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const workspaces = await db.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    select: { id: true, name: true },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Board Templates</h1>
      </div>
      <p className="text-muted-foreground">
        Gunakan template untuk memulai board baru dengan cepat
      </p>

      {/* Built-in templates */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Template Bawaan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Kanban Basic",
              color: "#0079bf",
              lists: ["To Do", "In Progress", "Done"],
            },
            {
              title: "Project Management",
              color: "#519839",
              lists: ["Backlog", "To Do", "In Progress", "Review", "Done"],
            },
            {
              title: "Bug Tracking",
              color: "#b04632",
              lists: ["Reported", "Confirmed", "In Fix", "Testing", "Resolved"],
            },
            {
              title: "Sprint Board",
              color: "#89609e",
              lists: ["Sprint Backlog", "In Progress", "In Review", "QA", "Done"],
            },
          ].map((template) => (
            <TemplateCard
              key={template.title}
              template={template}
              workspaces={workspaces}
            />
          ))}
        </div>
      </section>

      {/* User templates */}
      {templates.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Template Kamu</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="h-24 rounded-lg overflow-hidden relative"
                style={{ backgroundColor: template.backgroundColor }}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative p-3 h-full flex flex-col justify-between">
                  <span className="text-white font-semibold text-sm">
                    {template.title}
                  </span>
                  <span className="text-white/70 text-xs">
                    {template._count.lists} list &bull; oleh{" "}
                    {template.createdBy.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
