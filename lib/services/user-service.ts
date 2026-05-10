import { db } from "@/lib/firebase";
import type { Sector, UserProfile } from "@/types/domain";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

interface CreateTenantParams {
  uid: string;
  email: string;
  displayName: string;
  tenantName: string;
  sector: Sector;
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createTenantForUser(params: CreateTenantParams): Promise<UserProfile> {
  const tenantSlug = slugify(params.tenantName);

  const tenantRef = await addDoc(collection(db, "tenants"), {
    name: params.tenantName,
    sector: params.sector,
    slug: tenantSlug,
    ownerUid: params.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(db, "publicTenants", tenantSlug), {
    tenantId: tenantRef.id,
    name: params.tenantName,
    sector: params.sector,
    slug: tenantSlug,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const profile: UserProfile = {
    uid: params.uid,
    email: params.email,
    displayName: params.displayName,
    role: "owner",
    tenantId: tenantRef.id,
    tenantName: params.tenantName,
    sector: params.sector,
  };

  await setDoc(doc(db, "users", params.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await seedStarterData(tenantRef.id, params.sector);

  return profile;
}

async function seedStarterData(tenantId: string, sector: Sector) {
  const servicesBySector: Record<Sector, string[]> = {
    beauty: ["Cilt Bakımı", "Saç Boyama", "Kaş Laminasyonu", "Protez Tırnak", "Lazer Epilasyon"],
    clinic: ["Diş Kontrolü", "İmplant Kontrolü", "Cilt Muayenesi", "Fizik Tedavi Seansı", "Diyetisyen Görüşmesi"],
    auto: ["Periyodik Bakım", "Yağ Değişimi", "Fren Balata Kontrolü", "Klima Bakımı", "Lastik Rot-Balans"],
    education: ["Öğrenci Görüşmesi", "Veli Bilgilendirme", "Deneme Analizi", "Ödev Takibi", "Rehberlik Görüşmesi"],
    consulting: ["İlk Görüşme", "Takip Görüşmesi", "Strateji Oturumu", "Rapor Değerlendirme", "Aylık Kontrol"],
  };

  const customerNames = ["Ayşe Yılmaz", "Mehmet Kaya", "Zeynep Demir"];
  const staffBySector: Record<Sector, { name: string; title: string; specialty: string }[]> = {
    beauty: [{ name: "Selin Uzman", title: "Güzellik Uzmanı", specialty: "Cilt bakımı" }],
    clinic: [{ name: "Dr. Murat Yılmaz", title: "Doktor", specialty: "Kontrol ve muayene" }],
    auto: [{ name: "Mehmet Usta", title: "Servis Danışmanı", specialty: "Periyodik bakım" }],
    education: [{ name: "Ayşe Öğretmen", title: "Öğretmen", specialty: "Öğrenci takibi" }],
    consulting: [{ name: "Aylin Danışman", title: "Danışman", specialty: "Strateji görüşmesi" }],
  };

  await Promise.all([
    ...servicesBySector[sector].map((serviceName, index) =>
      addDoc(collection(db, "services"), {
        tenantId,
        sector,
        name: serviceName,
        category: index === 0 ? "Ana Hizmet" : "Genel",
        durationMinutes: index === 0 ? 60 : 45,
        price: 0,
        isActive: true,
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    ),
    ...staffBySector[sector].map((member) =>
      addDoc(collection(db, "staff"), {
        tenantId,
        sector,
        name: member.name,
        title: member.title,
        phone: "",
        email: "",
        specialty: member.specialty,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    ),
    ...customerNames.map((name, index) =>
      addDoc(collection(db, "customers"), {
        tenantId,
        name,
        phone: `05${index + 32}2 123 45 6${index}`,
        email: `demo${index + 1}@notasistan.com`,
        notes: "Demo müşteri kaydı. Gerçek müşteri ekleme modülünde düzenlenecek.",
        segment: index === 0 ? "Düzenli" : "Yeni",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    ),
  ]);
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
