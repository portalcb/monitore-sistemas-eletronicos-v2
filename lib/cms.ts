import { catalog, catalogVersion, commercialHome, commercialSeo } from "./catalog";
import { cache } from "react";
import { supabaseConfig } from "./admin-auth";

export const defaultCms = {
  company: { name: "Monitore Sistemas Eletrônicos", phone: "(47) 3365-3287", address: "5ª Avenida, 185 — Vila Real", city: "Balneário Camboriú – SC", postalCode: "88330-260", cnpj: "07.034.637/0001-48" },
  catalogVersion,
  home: commercialHome,
  seo: commercialSeo,
  services: catalog,
  posts: [] as Array<{id:string;title:string;slug:string;excerpt:string;content:string;contentFormat:"text"|"html";category:string;tags:string[];image:string;author:string;status:"draft"|"published"|"scheduled";publishAt:string;seoTitle:string;seoDescription:string}>,
  updatedAt: null as string | null, updatedBy: null as string | null,
};
const bucket = "monitore-cms"; const objectPath = "content/site.json";

async function ensureBucket() {
  const { url, service } = supabaseConfig();
  if (!service) throw new Error("A chave privada do Supabase não está disponível.");
  const headers = { apikey: service, Authorization: `Bearer ${service}`, "Content-Type": "application/json" };
  const check = await fetch(`${url}/storage/v1/bucket/${bucket}`, { headers, cache: "no-store" });
  if (!check.ok) {
    const checkDetails = await check.text();
    const missingBucket = check.status === 404 || check.status === 400 && (checkDetails.includes("NoSuchBucket") || checkDetails.includes("Bucket not found"));
    if (!missingBucket) throw new Error(`Não foi possível verificar o armazenamento (${check.status}).`);
    const created = await fetch(`${url}/storage/v1/bucket`, { method: "POST", headers, body: JSON.stringify({ id: bucket, name: bucket, public: false, file_size_limit: 10485760 }) });
    if (!created.ok && created.status !== 409) throw new Error("Não foi possível preparar o armazenamento do painel.");
  }
  return { url, service };
}

export const readCms = cache(async function readCms() {
  try {
    const { url, service } = await ensureBucket();
    const response = await fetch(`${url}/storage/v1/object/authenticated/${bucket}/${objectPath}`, { headers: { apikey: service!, Authorization: `Bearer ${service}` }, cache: "no-store" });
    if (!response.ok) return defaultCms;
    const saved = await response.json();
    return { ...defaultCms, ...saved, company: { ...defaultCms.company, ...saved.company }, catalogVersion, home: saved.catalogVersion === catalogVersion ? saved.home : commercialHome, seo: saved.catalogVersion === catalogVersion ? saved.seo : commercialSeo, services: saved.catalogVersion === catalogVersion && Array.isArray(saved.services) ? saved.services.filter((s: {slug: string}) => catalog.some(c => c.slug === s.slug)) : catalog, posts: Array.isArray(saved.posts) ? saved.posts : defaultCms.posts };
  } catch { return defaultCms; }
});

export async function writeCms(data: unknown) {
  const { url, service } = await ensureBucket();
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, { method: "POST", headers: { apikey: service!, Authorization: `Bearer ${service}`, "Content-Type": "application/json", "x-upsert": "true" }, body: JSON.stringify(data) });
  if (!response.ok) {
    const details = await response.text();
    console.error("[cms] Supabase upload failed", { status: response.status, details: details.slice(0, 500) });
    throw new Error(`Não foi possível salvar as alterações (${response.status}).`);
  }
}
