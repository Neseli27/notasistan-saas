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
import { FormEvent, useState } from "react";

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
  const [displayName, setDisplayName] = useState("Murat Yılmaz");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: displayName.trim() || "Not Asistan Kullanıcısı" });
        setStatus("Kayıt başarılı. Şimdi işletme bilgilerinizi oluşturalım.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
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
          <div className="authLogo">✦</div>
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
          <button className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Giriş</button>
          <button className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>Kayıt</button>
        </div>

        <form onSubmit={handleSubmit} className="authForm">
          {mode === "register" && (
            <label>
              <span>Ad soyad</span>
              <div className="inputWithIcon"><UserRound size={18} /><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Murat Yılmaz" /></div>
            </label>
          )}

          <label>
            <span>E-posta</span>
            <div className="inputWithIcon"><Mail size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" required /></div>
          </label>

          <label>
            <span>Şifre</span>
            <div className="inputWithIcon"><LockKeyhole size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" required minLength={6} /></div>
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
