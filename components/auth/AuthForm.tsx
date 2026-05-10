"use client";

import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ArrowRight, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

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
        return "Bu e-posta adresiyle daha önce kayıt yapılmış.";
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

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function clearAuthFields() {
    setDisplayName("");
    setEmail("");
    setPassword("");
  }

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setStatus(null);
    clearAuthFields();
  }

  useEffect(() => {
    clearAuthFields();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: displayName.trim() || "Not Asistan Kullanıcısı" });
        clearAuthFields();
        setStatus("Kayıt başarılı. Şimdi işletme bilgilerinizi oluşturalım.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        clearAuthFields();
        setStatus("Giriş başarılı. Panel hazırlanıyor.");
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

  return (
    <main className="authPage">
      <section className="authHero">
        <div className="authBrand">
          <img className="authLogoImage" src="/icons/icon-192.png" alt="Not Asistan" />
          <span>Not Asistan</span>
        </div>
        <h1>Randevuyu kaydeder, işlemi özetler, sonraki adımı hatırlatır.</h1>
        <p>
          Randevulu çalışan işletmeler için müşteri notları, işlem hafızası, hatırlatma ve takip yönetimi tek panelde.
        </p>
        <div className="authHeroGrid">
          <div><strong>Randevu</strong><span>Günlük plan ve teyit takibi</span></div>
          <div><strong>İşlem Notu</strong><span>Her müşteriye özel hafıza</span></div>
          <div><strong>Hatırlatma</strong><span>Tekrar geliş ve kontrol zamanı</span></div>
          <div><strong>AI Asistan</strong><span>Mesaj ve özet taslakları</span></div>
        </div>
        <div className="authMarketingLinks">
          <a href="/tanitim">Tanıtım sayfasını gör</a>
          <a href="/fiyatlandirma">Paketleri incele</a>
        </div>
      </section>

      <section className="authCard">
        <div className="authCardTop">
          <div>
            <span className="eyebrow"><Sparkles size={16} /> Güvenli Giriş</span>
            <h2>{mode === "login" ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}</h2>
            <p>{mode === "login" ? "Not Asistan panelinize devam edin." : "İlk işletmenizi birkaç adımda kurun."}</p>
          </div>
        </div>

        <div className="authSwitch">
          <button type="button" className={mode === "login" ? "selected" : ""} onClick={() => handleModeChange("login")}>Giriş</button>
          <button type="button" className={mode === "register" ? "selected" : ""} onClick={() => handleModeChange("register")}>Kayıt</button>
        </div>

        <form onSubmit={handleSubmit} className="authForm" autoComplete="off" key={mode}>
          {mode === "register" && (
            <label>
              <span>Ad soyad</span>
              <div className="inputWithIcon"><UserRound size={18} /><input name={`not-asistan-display-${mode}`} autoComplete="off" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
            </label>
          )}

          <label>
            <span>E-posta</span>
            <div className="inputWithIcon"><Mail size={18} /><input name={`not-asistan-email-${mode}`} type="email" autoComplete="off" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          </label>

          <label>
            <span>Şifre</span>
            <div className="inputWithIcon"><LockKeyhole size={18} /><input name={`not-asistan-password-${mode}`} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          </label>

          {error && <p className="formMessage errorMessage">{error}</p>}
          {status && <p className="formMessage successMessage">{status}</p>}

          <button className="authSubmit" disabled={submitting} type="submit">
            {submitting ? "İşleniyor..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            <ArrowRight size={19} />
          </button>
        </form>

        {mode === "login" && (
          <button className="textButton" onClick={handlePasswordReset}>Şifremi unuttum</button>
        )}
      </section>
    </main>
  );
}
