"use client";

import { auth } from "@/lib/firebase";
import { getPublicTenantBySlug } from "@/lib/services/public-booking-service";
import { getUserProfile } from "@/lib/services/user-service";
import { registerCustomerPortalAccount } from "@/lib/services/customer-portal-service";
import type { PublicTenant, UserProfile } from "@/types/domain";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { ArrowRight, Building2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { CustomerPanel } from "@/components/customer/CustomerPanel";

interface CustomerPortalProps {
  slug: string;
}

type Mode = "login" | "register";

function getFirebaseErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "E-posta adresi geçerli görünmüyor.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "E-posta veya şifre hatalı.";
      case "auth/email-already-in-use":
        return "Bu e-posta adresiyle daha önce kayıt yapılmış. Giriş yapmayı deneyin.";
      case "auth/weak-password":
        return "Şifre en az 6 karakter olmalı.";
      case "auth/too-many-requests":
        return "Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.";
      default:
        return `Firebase hatası: ${error.code}`;
    }
  }

  return "Beklenmeyen bir hata oluştu.";
}

export function CustomerPortal({ slug }: CustomerPortalProps) {
  const [tenant, setTenant] = useState<PublicTenant | null>(null);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("login");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    getPublicTenantBySlug(slug)
      .then((record) => {
        if (mounted) setTenant(record);
      })
      .catch((err) => {
        console.error("Müşteri paneli işletme profili okunamadı:", err);
        if (mounted) setError("İşletme bilgisi okunamadı. Bağlantıyı kontrol edin.");
      })
      .finally(() => {
        if (mounted) setTenantLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setProfile(null);
      setAuthLoading(true);

      if (!user) {
        setAuthLoading(false);
        return;
      }

      try {
        const existingProfile = await getUserProfile(user.uid);
        setProfile(existingProfile);
      } catch (err) {
        console.error("Müşteri profili okunamadı:", err);
        setError("Müşteri profili okunamadı. Tekrar giriş yapmayı deneyin.");
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tenant) return;

    setSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      if (mode === "register") {
        if (!displayName.trim()) {
          setError("Ad soyad alanı zorunludur.");
          return;
        }
        if (!phone.trim()) {
          setError("Telefon alanı zorunludur.");
          return;
        }

        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: displayName.trim() });
        const createdProfile = await registerCustomerPortalAccount({
          user: credential.user,
          tenant,
          displayName,
          phone,
        });
        setProfile(createdProfile);
        setStatus("Müşteri hesabınız oluşturuldu. Paneliniz hazırlanıyor.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setStatus("Giriş başarılı. Müşteri paneliniz hazırlanıyor.");
      }
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setError(null);
    setStatus(null);

    if (!email) {
      setError("Şifre sıfırlama için önce e-posta adresinizi yazın.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    }
  }

  if (tenantLoading || authLoading) {
    return (
      <main className="customerPortalPage">
        <section className="customerPortalCard customerPortalLoading">
          <div className="customerPortalMark">✦</div>
          <h1>Müşteri paneliniz hazırlanıyor...</h1>
          <p>İşletme ve oturum bilgileri kontrol ediliyor.</p>
        </section>
      </main>
    );
  }

  if (!tenant) {
    return (
      <main className="customerPortalPage">
        <section className="customerPortalCard customerPortalLoading">
          <div className="customerPortalMark">!</div>
          <h1>Randevu sayfası bulunamadı</h1>
          <p>Bu bağlantı aktif bir Not Asistan işletmesine bağlı görünmüyor.</p>
        </section>
      </main>
    );
  }

  if (firebaseUser && profile?.role === "customer" && profile.tenantId === tenant.tenantId) {
    return <CustomerPanel tenant={tenant} profile={profile} onSignOut={() => signOut(auth)} />;
  }

  const isWrongAccount = firebaseUser && profile && (profile.role !== "customer" || profile.tenantId !== tenant.tenantId);

  const publicThemeStyle = tenant.appearance?.themeMode === "custom"
    ? ({
        "--theme-primary": tenant.appearance.primaryColor,
        "--theme-primary-dark": tenant.appearance.primaryColor,
        "--theme-accent": tenant.appearance.accentColor,
        "--theme-soft": `${tenant.appearance.accentColor}18`,
      } as CSSProperties)
    : undefined;
  const publicBrandName = tenant.appearance?.brandName || tenant.name;

  return (
    <main className={`customerPortalPage customer-theme-${tenant.sector} theme-${tenant.sector}`} style={publicThemeStyle}>
      <section className="customerPortalHero">
        <div className="customerPortalBrand">
          <div className="customerPortalMark">{tenant.appearance?.logoUrl ? <img src={tenant.appearance.logoUrl} alt="Logo" /> : "✦"}</div>
          <span>Not Asistan</span>
        </div>
        <h1>{publicBrandName} müşteri paneli</h1>
        <p>Randevularınızı, taleplerinizi ve size özel işlem özetlerini telefondan kolayca takip edin.</p>
        <div className="customerPortalBadges">
          <span>Yaklaşan randevular</span>
          <span>İşlem özetleri</span>
          <span>Erteleme / iptal talebi</span>
        </div>
      </section>

      <section className="customerPortalCard">
        <span className="eyebrow"><Building2 size={16} /> {publicBrandName}</span>
        <h2>{mode === "login" ? "Müşteri girişi" : "Müşteri hesabı oluştur"}</h2>
        <p>{mode === "login" ? "Daha önce hesap oluşturduysanız giriş yapın." : "Randevularınızı takip etmek için müşteri hesabınızı oluşturun."}</p>

        <div className="authSwitch customerSwitch">
          <button className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Giriş</button>
          <button className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>Kayıt</button>
        </div>

        <form onSubmit={handleSubmit} className="authForm">
          {mode === "register" && (
            <>
              <label>
                <span>Ad soyad</span>
                <div className="inputWithIcon"><UserRound size={18} /><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Murat Aydın" required /></div>
              </label>
              <label>
                <span>Telefon</span>
                <div className="inputWithIcon"><Phone size={18} /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0555 123 45 67" required /></div>
              </label>
            </>
          )}

          <label>
            <span>E-posta</span>
            <div className="inputWithIcon"><Mail size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" required /></div>
          </label>

          <label>
            <span>Şifre</span>
            <div className="inputWithIcon"><LockKeyhole size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" required minLength={6} /></div>
          </label>

          {isWrongAccount && <p className="formMessage errorMessage">Bu oturum bu işletmenin müşteri paneliyle eşleşmiyor. Lütfen çıkış yapıp doğru müşteri hesabıyla giriş yapın.</p>}
          {error && <p className="formMessage errorMessage">{error}</p>}
          {status && <p className="formMessage successMessage">{status}</p>}

          <button className="authSubmit" disabled={submitting} type="submit">
            {submitting ? "İşleniyor..." : mode === "login" ? "Müşteri Paneline Gir" : "Hesap Oluştur"}
            <ArrowRight size={19} />
          </button>
        </form>

        {mode === "login" && <button className="textButton" onClick={handlePasswordReset}>Şifremi unuttum</button>}
        {firebaseUser && <button className="textButton" onClick={() => signOut(auth)}>Bu oturumdan çık</button>}
      </section>
    </main>
  );
}
