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

  return profile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
