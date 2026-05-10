import { db } from "@/lib/firebase";
import type { Sector, TenantAppearance } from "@/types/domain";
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

const sectorThemeDefaults: Record<Sector, Pick<TenantAppearance, "primaryColor" | "accentColor">> = {
  beauty: { primaryColor: "#8b2f72", accentColor: "#f06ca7" },
  clinic: { primaryColor: "#0b4f8a", accentColor: "#18b89b" },
  auto: { primaryColor: "#0b2e79", accentColor: "#f28a25" },
  education: { primaryColor: "#3154b8", accentColor: "#7c5cff" },
  consulting: { primaryColor: "#12334d", accentColor: "#19a7a8" },
};

export function getDefaultAppearance(sector: Sector, tenantName?: string): TenantAppearance {
  const defaults = sectorThemeDefaults[sector] ?? sectorThemeDefaults.beauty;
  return {
    themeMode: "auto",
    primaryColor: defaults.primaryColor,
    accentColor: defaults.accentColor,
    brandName: tenantName || "",
    logoUrl: "",
  };
}

function normalizeAppearance(raw: unknown, sector: Sector, tenantName?: string): TenantAppearance {
  const fallback = getDefaultAppearance(sector, tenantName);
  if (!raw || typeof raw !== "object") return fallback;

  const data = raw as Partial<TenantAppearance>;
  return {
    themeMode: data.themeMode === "custom" ? "custom" : "auto",
    primaryColor: typeof data.primaryColor === "string" && data.primaryColor ? data.primaryColor : fallback.primaryColor,
    accentColor: typeof data.accentColor === "string" && data.accentColor ? data.accentColor : fallback.accentColor,
    brandName: typeof data.brandName === "string" ? data.brandName : fallback.brandName,
    logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : "",
    updatedAt: data.updatedAt,
  };
}

export function listenTenantAppearance(
  tenantId: string,
  sector: Sector,
  tenantName: string,
  onChange: (appearance: TenantAppearance) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    doc(db, "tenants", tenantId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(getDefaultAppearance(sector, tenantName));
        return;
      }
      const data = snapshot.data();
      onChange(normalizeAppearance(data.appearance, sector, String(data.name ?? tenantName)));
    },
    (error) => {
      console.error("Tema ayarları okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export async function updateTenantAppearance(params: {
  tenantId: string;
  publicSlug?: string;
  sector: Sector;
  tenantName: string;
  appearance: TenantAppearance;
}) {
  const appearance: TenantAppearance = {
    ...params.appearance,
    brandName: params.appearance.brandName?.trim() || params.tenantName,
    logoUrl: params.appearance.logoUrl?.trim() || "",
  };

  await updateDoc(doc(db, "tenants", params.tenantId), {
    appearance: {
      ...appearance,
      updatedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });

  if (params.publicSlug) {
    await setDoc(
      doc(db, "publicTenants", params.publicSlug),
      {
        tenantId: params.tenantId,
        name: params.tenantName,
        sector: params.sector,
        slug: params.publicSlug,
        isActive: true,
        appearance: {
          ...appearance,
          updatedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}
