import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/actions/profile";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  User,
  Mail,
  Calendar,
  LayoutDashboard,
  KanbanSquare,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { DeleteAccountButton } from "@/components/profile/delete-account-button";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi akun kamu</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Workspace",
            value: profile._count.workspaceMembers,
            icon: LayoutDashboard,
            color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
          },
          {
            label: "Board",
            value: profile._count.boardMembers,
            icon: KanbanSquare,
            color: "text-green-600 bg-green-100 dark:bg-green-900/30",
          },
          {
            label: "Card Dibuat",
            value: profile._count.cards,
            icon: CreditCard,
            color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
          },
          {
            label: "Komentar",
            value: profile._count.comments,
            icon: MessageSquare,
            color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 border rounded-xl p-4"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-2`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-gray-800 border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Informasi Profil</h2>
        </div>

        <ProfileForm
          name={profile.name || ""}
          email={profile.email}
          image={profile.image || ""}
        />

        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
          <Calendar className="h-4 w-4" />
          <span>
            Bergabung sejak{" "}
            {format(profile.createdAt, "dd MMMM yyyy", { locale: id })}
          </span>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Ubah Password</h2>
        <PasswordForm />
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Zona Bahaya</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Menghapus akun akan menghapus semua data yang terkait dengan akun kamu.
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
