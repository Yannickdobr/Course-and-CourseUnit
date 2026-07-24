"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, initialsFromName, type UserRole } from "@/app/components/AuthProvider";
import { authApi } from "@/lib/api";

export default function BecomeInstructorCTA() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Déjà formateur / admin → accès direct au studio */
  if (user && (user.role === "formateur" || user.role === "admin" || user.role === "superadmin")) {
    return (
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link href="/studio" className="btn-orange">Accéder à mon studio</Link>
      </div>
    );
  }

  /* Non connecté → inscription gratuite */
  if (!user) {
    return (
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link href="/inscription?role=formateur" className="btn-orange">S&apos;inscrire comme formateur</Link>
        <Link href="/connexion" className="btn-outline">J&apos;ai déjà un compte</Link>
      </div>
    );
  }

  /* Inscrit (apprenant) → bascule self-service gratuite */
  async function handleBecome() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await authApi.becomeInstructor(user.id);
      login({
        id: res.id,
        name: res.name,
        email: res.email,
        initials: initialsFromName(res.name),
        role: res.role as UserRole,
        token: res.token,
        hasActiveSubscription: res.hasActiveSubscription,
      });
      router.push("/studio");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action impossible.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn-orange" onClick={handleBecome} disabled={loading}>
        {loading ? "Activation…" : "Devenir formateur maintenant"}
      </button>
      {error && <p style={{ color: "var(--pink)", marginTop: "0.6rem", fontSize: "0.88rem" }}>{error}</p>}
    </div>
  );
}
