"use client";

import { getDefaultAppearance, updateTenantAppearance } from "@/lib/services/appearance-service";
import type { Sector, TenantAppearance } from "@/types/domain";
import { Image, Palette, RotateCcw, Save, Sparkles } from "lucide-react";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

interface AppearanceSettingsProps {
  tenantId: string;
  tenantName: string;
  sector: Sector;
  publicSlug?: string;
  appearance: TenantAppearance;
  onAppearanceChange: (appearance: TenantAppearance) => void;
}

const colorPalettes: Record<Sector, Array<{ label: string; primary: string; accent: string }>> = {
  beauty: [
    { label: "Güzellik", primary: "#8b2f72", accent: "#f06ca7" },
    { label: "Lila", primary: "#6d28d9", accent: "#c084fc" },
    { label: "Rose", primary: "#9f1239", accent: "#fb7185" },
  ],
  clinic: [
    { label: "Medikal", primary: "#0b4f8a", accent: "#18b89b" },
    { label: "Yeşil", primary: "#065f46", accent: "#34d399" },
    { label: "Güven", primary: "#075985", accent: "#38bdf8" },
  ],
  auto: [
    { label: "Servis", primary: "#0b2e79", accent: "#f28a25" },
    { label: "Grafit", primary: "#1f2937", accent: "#f97316" },
    { label: "Mavi", primary: "#0f3a8a", accent: "#22d3ee" },
  ],
  education: [
    { label: "Eğitim", primary: "#3154b8", accent: "#7c5cff" },
    { label: "Mor", primary: "#4c1d95", accent: "#a78bfa" },
    { label: "Bilgi", primary: "#1d4ed8", accent: "#facc15" },
  ],
  consulting: [
    { label: "Kurumsal", primary: "#12334d", accent: "#19a7a8" },
    { label: "Lacivert", primary: "#0f172a", accent: "#38bdf8" },
    { label: "Prestij", primary: "#312e81", accent: "#f59e0b" },
  ],
};

function isValidHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value.trim());
}

export function AppearanceSettings({ tenantId, tenantName, sector, publicSlug, appearance, onAppearanceChange }: AppearanceSettingsProps) {
  const [draft, setDraft] = useState<TenantAppearance>(appearance);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(appearance);
  }, [appearance]);

  const defaultAppearance = useMemo(() => getDefaultAppearance(sector, tenantName), [sector, tenantName]);
  const palettes = colorPalettes[sector] ?? colorPalettes.beauty;

  function updateDraft(data: Partial<TenantAppearance>) {
    setDraft((current) => ({ ...current, ...data }));
  }

  function applyPalette(primaryColor: string, accentColor: string) {
    updateDraft({ themeMode: "custom", primaryColor, accentColor });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isValidHex(draft.primaryColor) || !isValidHex(draft.accentColor)) {
      setError("Renkler #0b2e79 biçiminde 6 haneli HEX kodu olmalı.");
      return;
    }

    setSaving(true);
    try {
      await updateTenantAppearance({
        tenantId,
        publicSlug,
        sector,
        tenantName,
        appearance: draft,
      });
      onAppearanceChange(draft);
      setMessage("Görünüm ayarları kaydedildi. Public randevu sayfası ve müşteri paneli de güncellendi.");
      window.setTimeout(() => setMessage(""), 3200);
    } catch (err) {
      console.error("Görünüm ayarları kaydedilemedi:", err);
      setError("Görünüm ayarları kaydedilemedi. Firestore kurallarını ve bağlantıyı kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  function resetToSectorTheme() {
    const next = {
      ...defaultAppearance,
      themeMode: "auto" as const,
      brandName: draft.brandName || tenantName,
      logoUrl: draft.logoUrl || "",
    };
    setDraft(next);
  }

  return (
    <form className="appearancePanel" onSubmit={handleSubmit}>
      <div className="panelHeader appearanceHeader">
        <div>
          <h3>Görünüm ve Marka Ayarları</h3>
          <p>İşletmenin panel, public randevu sayfası ve müşteri PWA görünümünü yönetin.</p>
        </div>
        <span className="appearanceModePill">{draft.themeMode === "custom" ? "Özel Tema" : "Sektör Teması"}</span>
      </div>

      <div className="appearanceGrid">
        <section className="appearanceFormArea">
          <label className="formField">
            <span>Görünüm modu</span>
            <select value={draft.themeMode} onChange={(event) => updateDraft({ themeMode: event.target.value as TenantAppearance["themeMode"] })}>
              <option value="auto">Sektöre göre otomatik</option>
              <option value="custom">İşletmeye özel renk</option>
            </select>
          </label>

          <div className="appearanceTwoCol">
            <label className="formField">
              <span>Ana renk</span>
              <div className="colorInputRow">
                <input type="color" value={draft.primaryColor} onChange={(event) => updateDraft({ themeMode: "custom", primaryColor: event.target.value })} />
                <input value={draft.primaryColor} onChange={(event) => updateDraft({ themeMode: "custom", primaryColor: event.target.value })} />
              </div>
            </label>

            <label className="formField">
              <span>Vurgu rengi</span>
              <div className="colorInputRow">
                <input type="color" value={draft.accentColor} onChange={(event) => updateDraft({ themeMode: "custom", accentColor: event.target.value })} />
                <input value={draft.accentColor} onChange={(event) => updateDraft({ themeMode: "custom", accentColor: event.target.value })} />
              </div>
            </label>
          </div>

          <div className="paletteRow" aria-label="Hazır renk paletleri">
            {palettes.map((palette) => (
              <button type="button" key={palette.label} onClick={() => applyPalette(palette.primary, palette.accent)}>
                <span className="paletteDots"><i style={{ background: palette.primary }} /><i style={{ background: palette.accent }} /></span>
                {palette.label}
              </button>
            ))}
          </div>

          <label className="formField">
            <span>Public görünen marka adı</span>
            <input value={draft.brandName ?? ""} onChange={(event) => updateDraft({ brandName: event.target.value })} placeholder={tenantName} />
          </label>

          <label className="formField">
            <span>Logo URL</span>
            <input value={draft.logoUrl ?? ""} onChange={(event) => updateDraft({ logoUrl: event.target.value })} placeholder="https://.../logo.png" />
          </label>

          <div className="appearanceActions">
            <button type="button" className="secondaryButton compactActionButton" onClick={resetToSectorTheme}><RotateCcw size={17} /> Sektör temasına dön</button>
            <button type="submit" className="primaryButton compactActionButton" disabled={saving}><Save size={17} /> {saving ? "Kaydediliyor..." : "Kaydet"}</button>
          </div>

          {message && <p className="formMessage successMessage">{message}</p>}
          {error && <p className="formMessage errorMessage">{error}</p>}
        </section>

        <section className="appearancePreview" style={{ "--preview-primary": draft.primaryColor, "--preview-accent": draft.accentColor } as CSSProperties}>
          <div className="previewHero">
            <div className="previewLogo">
              {draft.logoUrl ? <img src={draft.logoUrl} alt="Logo önizleme" /> : <Sparkles size={21} />}
            </div>
            <div>
              <b>{draft.brandName || tenantName}</b>
              <span>Public müşteri deneyimi</span>
            </div>
          </div>
          <div className="previewCard">
            <span><Palette size={15} /> Randevu sayfası</span>
            <strong>Yeni randevu talebi</strong>
            <p>Seçtiğiniz renkler public randevu sayfası ve müşteri panelinde kullanılır.</p>
            <button type="button">Randevu Talebi Gönder</button>
          </div>
          <div className="previewLogoHint"><Image size={15} /> Logo URL boş bırakılırsa Not Asistan simgesi kullanılır.</div>
        </section>
      </div>
    </form>
  );
}
