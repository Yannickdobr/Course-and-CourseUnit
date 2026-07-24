"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import DashboardSidebar from "./components/DashboardSidebar";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const authStored = localStorage.getItem("eduflex-auth");
    if (!authStored && !user) {
      router.push("/connexion");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className={styles.layout} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-main)", color: "var(--text-light)" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <DashboardSidebar
        name={user.name}
        initials={user.initials}
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
}