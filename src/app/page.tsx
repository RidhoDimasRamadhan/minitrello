import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CheckCircle2,
  Users,
  Zap,
  ArrowRight,
  KanbanSquare,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">MiniTrello</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button>Mulai Gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Project Management Made Simple
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Kelola Project Kamu dengan{" "}
              <span className="text-blue-600">Lebih Efektif</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              MiniTrello membantu kamu mengorganisir task dengan board, list,
              dan card. Kolaborasi dengan tim secara real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 gap-2">
                  Mulai Sekarang
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sudah Punya Akun
                </Button>
              </Link>
            </div>
          </div>

          {/* Board Preview */}
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 shadow-2xl">
              <div className="flex gap-4 overflow-hidden">
                {["To Do", "In Progress", "Review", "Done"].map(
                  (title, i) => (
                    <div
                      key={title}
                      className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 min-w-[220px] flex-shrink-0"
                    >
                      <h3 className="font-semibold text-sm mb-3 text-gray-800 dark:text-gray-200">
                        {title}
                      </h3>
                      <div className="space-y-2">
                        {Array.from({
                          length: Math.max(1, 3 - i),
                        }).map((_, j) => (
                          <div
                            key={j}
                            className="bg-white dark:bg-gray-700 rounded-md p-3 shadow-sm"
                          >
                            <div className="flex gap-1.5 mb-2">
                              <div
                                className="h-1.5 rounded-full w-8"
                                style={{
                                  backgroundColor: [
                                    "#61bd4f",
                                    "#f2d600",
                                    "#ff9f1a",
                                    "#eb5a46",
                                  ][j % 4],
                                }}
                              />
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1.5" />
                            <div className="h-2 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Fitur yang Kamu Butuhkan
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Semua tools yang diperlukan untuk mengelola project dari awal
              hingga selesai
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: KanbanSquare,
                title: "Kanban Board",
                description:
                  "Drag and drop card antar list. Visualisasi workflow dengan mudah dan intuitif.",
              },
              {
                icon: Users,
                title: "Kolaborasi Tim",
                description:
                  "Undang anggota tim, assign task, dan komunikasi lewat komentar di setiap card.",
              },
              {
                icon: CheckCircle2,
                title: "Tracking Progress",
                description:
                  "Checklist, due date, label, dan activity log untuk memantau progress project.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Siap Mengelola Project Lebih Baik?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Bergabung sekarang dan rasakan kemudahan manajemen project dengan
            MiniTrello
          </p>
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 gap-2"
            >
              Buat Akun Gratis
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-blue-600 text-white p-1 rounded">
              <LayoutDashboard className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold">MiniTrello</span>
          </div>
          <p>Built with Next.js, Prisma, and PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
