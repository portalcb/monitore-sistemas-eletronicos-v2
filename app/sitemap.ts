import type { MetadataRoute } from "next";
import { readCms } from "@/lib/cms";
export const dynamic = "force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const cms=await readCms();const paths=["","solucoes","segmentos","sobre","contato","cidades","cidades/balneario-camboriu","projetos","blog",...cms.services.filter(s=>s.published!==false).map(s=>s.slug),...cms.posts.filter(p=>p.status==="published"||p.status==="scheduled"&&new Date(p.publishAt).getTime()<=Date.now()).map(p=>`blog/${p.slug}`)];return paths.map(path=>({url:`https://www.monitorecbc.com.br/${path}`,changeFrequency:"monthly",priority:path?0.7:1}));}
