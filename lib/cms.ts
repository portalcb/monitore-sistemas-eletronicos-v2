import { supabaseConfig } from "./admin-auth";

export const defaultCms = {
  company: { name: "Monitore Sistemas Eletrônicos", phone: "(47) 3365-3287", address: "5ª Avenida, 185 — Vila Real", city: "Balneário Camboriú – SC", postalCode: "88330-260", cnpj: "07.034.637/0001-48" },
  home: { title: "Segurança eletrônica e tecnologia em Balneário Camboriú", description: "Projetos pensados para o contexto de cada imóvel, com atendimento próximo e uma jornada clara do primeiro contato à execução." },
  seo: { title: "Monitore Sistemas Eletrônicos | Balneário Camboriú", description: "Soluções em segurança eletrônica e tecnologia em Balneário Camboriú." },
  services: [
    {slug:"cameras-de-seguranca-cftv",name:"Câmeras de Segurança e CFTV",image:"/services/cftv.jpg",desc:"Projetos de CFTV com câmeras estrategicamente posicionadas, gravação confiável e acesso remoto para ampliar a visibilidade do imóvel.",benefits:["Cobertura planejada","Gravação e consulta","Acesso remoto"],published:true},
    {slug:"alarmes-e-sensores",name:"Alarmes e Sensores",image:"/services/alarmes.jpg",desc:"Sistemas com sensores e central inteligente, configurados conforme acessos, ambientes e prioridades de proteção.",benefits:["Detecção de eventos","Configuração por ambiente","Integração ao projeto"],published:true},
    {slug:"controle-de-acesso",name:"Controle de Acesso",image:"/services/controle-acesso.jpg",desc:"Organização e proteção do fluxo de pessoas por biometria, cartão, senha ou soluções digitais adequadas ao contexto.",benefits:["Entradas organizadas","Mais rastreabilidade","Gestão de permissões"],published:true},
    {slug:"automacao",name:"Automação",image:"/services/automacao.jpg",desc:"Integração de iluminação, climatização, segurança e equipamentos para proporcionar praticidade e controle.",benefits:["Rotinas inteligentes","Controle centralizado","Mais praticidade"],published:true},
    {slug:"cerca-eletrica",name:"Cerca Elétrica",image:"/services/cerca-eletrica.jpg",desc:"Proteção perimetral dimensionada para o imóvel, com instalação cuidadosa e integração ao sistema de segurança.",benefits:["Proteção perimetral","Projeto contextual","Integração com alarmes"],published:true},
    {slug:"iluminacao-de-emergencia",name:"Iluminação de Emergência",image:"/services/iluminacao-emergencia.jpg",desc:"Soluções para rotas de saída, corredores e áreas comuns, favorecendo orientação durante quedas de energia.",benefits:["Rotas mais visíveis","Cobertura de áreas comuns","Planejamento técnico"],published:true},
    {slug:"energia-solar",name:"Energia Solar",image:"/services/energia-solar.jpg",desc:"Projeto de geração fotovoltaica organizado conforme o imóvel e a necessidade energética apresentada.",benefits:["Geração renovável","Projeto sob medida","Acompanhamento claro"],published:true},
    {slug:"armarios-inteligentes",name:"Armários Inteligentes",image:"/services/armarios-inteligentes.jpg",desc:"Estrutura tecnológica para recebimento e retirada organizada de encomendas em condomínios e empresas.",benefits:["Retirada organizada","Mais autonomia","Operação simplificada"],published:true},
    {slug:"carregadores-veiculos-eletricos",name:"Carregadores para Veículos Elétricos",image:"/services/carregadores-ve.jpg",desc:"Infraestrutura de recarga preparada de acordo com o local, a demanda e as condições técnicas disponíveis.",benefits:["Recarga conveniente","Infraestrutura planejada","Uso residencial ou corporativo"],published:true},
    {slug:"sonorizacao",name:"Sonorização de Ambientes",image:"/services/sonorizacao.jpg",desc:"Distribuição de áudio pensada para ambientes residenciais, comerciais e corporativos, com integração discreta.",benefits:["Som bem distribuído","Integração ao ambiente","Controle simplificado"],published:true},
    {slug:"interfonia-video-porteiro",name:"Interfonia e Vídeo Porteiro",image:"/services/interfonia.jpg",desc:"Comunicação e visualização de acessos para apoiar uma entrada mais organizada e segura.",benefits:["Identificação de visitantes","Comunicação direta","Mais controle na entrada"],published:true},
    {slug:"cabeamento-redes",name:"Cabeamento Estruturado e Redes",image:"/services/cabeamento.jpg",desc:"Infraestrutura organizada para dados, conectividade e equipamentos, planejada para estabilidade e expansão.",benefits:["Rede organizada","Conectividade estável","Expansão facilitada"],published:true},
    {slug:"automatizadores-portoes",name:"Automatizadores de Portões",image:"/services/portoes.jpg",desc:"Automação de acessos veiculares com solução dimensionada conforme portão, fluxo e necessidade do imóvel.",benefits:["Acesso mais prático","Operação automatizada","Projeto por contexto"],published:true},
    {slug:"monitoramento",name:"Monitoramento",image:"/services/monitoramento.jpg",desc:"Estrutura integrada para acompanhamento de eventos e equipamentos de segurança eletrônica.",benefits:["Acompanhamento centralizado","Integração de sistemas","Mais visibilidade operacional"],published:true}
  ],
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

export async function readCms() {
  try {
    const { url, service } = await ensureBucket();
    const response = await fetch(`${url}/storage/v1/object/authenticated/${bucket}/${objectPath}`, { headers: { apikey: service!, Authorization: `Bearer ${service}` }, cache: "no-store" });
    if (!response.ok) return defaultCms;
    const saved = await response.json();
    return { ...defaultCms, ...saved, services: Array.isArray(saved.services) ? saved.services : defaultCms.services, posts: Array.isArray(saved.posts) ? saved.posts : defaultCms.posts };
  } catch { return defaultCms; }
}

export async function writeCms(data: unknown) {
  const { url, service } = await ensureBucket();
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, { method: "POST", headers: { apikey: service!, Authorization: `Bearer ${service}`, "Content-Type": "application/json", "x-upsert": "true" }, body: JSON.stringify(data) });
  if (!response.ok) {
    const details = await response.text();
    console.error("[cms] Supabase upload failed", { status: response.status, details: details.slice(0, 500) });
    throw new Error(`Não foi possível salvar as alterações (${response.status}).`);
  }
}
