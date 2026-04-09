"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { register } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const result = await register({ name, email, password });

    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(result.success);
    router.push("/login");
  }

  return (
    <Card className="shadow-2xl border-0">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="bg-blue-600 text-white p-3 rounded-xl">
            <LayoutDashboard className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Buat Akun Baru</CardTitle>
        <CardDescription>
          Mulai kelola project kamu dengan MiniTrello
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Daftar"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Masuk
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
