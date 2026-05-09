"use client";

import { Download, Share2, Smartphone, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "notasistan_pwa_banner_dismissed_at";
const DISMISS_DAYS = 7;

function isRecentlyDismissed() {
  if (typeof window === "undefined") return true;
  const rawValue = window.localStorage.getItem(DISMISS_KEY);
  if (!rawValue) return false;

  const dismissedAt = Number(rawValue);
  if (Number.isNaN(dismissedAt)) return false;

  const maxAge = DISMISS_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedAt < maxAge;
}

function isRunningStandalone() {
  if (typeof window === "undefined") return false;
  const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return standaloneMedia || iosStandalone;
}

function isMobileBrowser() {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

function isIosBrowser() {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const helpText = useMemo(() => {
    if (isIosBrowser()) {
      return "iPhone/iPad için Safari'de Paylaş simgesine dokunun, ardından 'Ana Ekrana Ekle' seçeneğini kullanın.";
    }

    return "Android için Chrome menüsünden 'Uygulamayı yükle' veya 'Ana ekrana ekle' seçeneğini kullanabilirsiniz.";
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((error) => {
          console.warn("Not Asistan service worker kaydı başarısız:", error);
        });
      });
    }

    if (isRunningStandalone() || isRecentlyDismissed()) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (isMobileBrowser()) {
      const timer = window.setTimeout(() => setIsVisible(true), 1400);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) {
      setShowHelp(true);
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice.outcome === "accepted") {
      setIsVisible(false);
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
      return;
    }

    setShowHelp(true);
  }

  function handleDismiss() {
    setIsVisible(false);
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  if (!isVisible) return null;

  return (
    <aside className="pwaInstallBanner" aria-label="Not Asistan telefona ekleme önerisi">
      <button className="pwaCloseButton" type="button" onClick={handleDismiss} aria-label="PWA önerisini kapat">
        <X size={18} />
      </button>
      <div className="pwaIconBubble">
        <Smartphone size={22} />
      </div>
      <div className="pwaContent">
        <strong>Not Asistan'ı telefona ekleyin</strong>
        <p>Randevu, not ve hatırlatmalara uygulama gibi hızlı erişin. Tarayıcı adresi aramakla vakit kaybetmeyin.</p>
        {showHelp && (
          <div className="pwaHelpText">
            <Share2 size={16} />
            <span>{helpText}</span>
          </div>
        )}
      </div>
      <button className="pwaInstallButton" type="button" onClick={handleInstall}>
        <Download size={18} />
        Telefona Ekle
      </button>
    </aside>
  );
}
