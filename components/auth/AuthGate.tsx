"use client";

import { Dashboard } from "@/components/Dashboard";
import { AuthForm } from "@/components/auth/AuthForm";
import { TenantSetup } from "@/components/auth/TenantSetup";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/services/user-service";
import type { UserProfile } from "@/types/domain";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";

export function AuthGate() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setProfile(null);

      if (!user) {
        setLoading(false);
        return;
      }

      setProfileLoading(true);
      try {
        const existingProfile = await getUserProfile(user.uid);
        setProfile(existingProfile);
      } catch (error) {
        console.error("Kullanıcı profili okunamadı:", error);
      } finally {
        setProfileLoading(false);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading || profileLoading) {
    return (
      <main className="authPage">
        <section className="authCard authLoadingCard">
          <div className="authLogo">✦</div>
          <h1>Not Asistan hazırlanıyor...</h1>
          <p>Güvenli oturum ve işletme bilgileri kontrol ediliyor.</p>
        </section>
      </main>
    );
  }

  if (!firebaseUser) {
    return <AuthForm />;
  }

  if (profile?.role === "customer") {
    const portalHref = profile.tenantSlug ? `/musteri/${profile.tenantSlug}` : "/";
    return (
      <main className="authPage">
        <section className="authCard authLoadingCard">
          <div className="authLogo">✦</div>
          <h1>Bu hesap müşteri paneli için oluşturulmuş.</h1>
          <p>İşletme yönetim paneline yalnızca işletme kullanıcıları girebilir.</p>
          <a className="authSubmit" href={portalHref}>Müşteri Panelime Git</a>
        </section>
      </main>
    );
  }

  if (!profile?.tenantId) {
    return (
      <TenantSetup
        user={firebaseUser}
        onCompleted={(newProfile) => setProfile(newProfile)}
      />
    );
  }

  return <Dashboard user={firebaseUser} profile={profile} />;
}
