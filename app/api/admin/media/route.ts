import { NextResponse } from "next/server";
import { getAdminSession, supabaseConfig } from "@/lib/admin-auth";

const bucket="monitore-media";
const allowed=new Set(["image/jpeg","image/png","image/webp","image/gif","image/svg+xml"]);

async function storage(){
 const {url,service}=supabaseConfig();
 if(!service)throw new Error("A chave privada do Supabase não está disponível.");
 const headers={apikey:service,Authorization:`Bearer ${service}`,"Content-Type":"application/json"};
 const check=await fetch(`${url}/storage/v1/bucket/${bucket}`,{headers,cache:"no-store"});
 if(!check.ok){const details=await check.text();if(!(check.status===404||check.status===400&&details.includes("NoSuchBucket")))throw new Error("Não foi possível acessar a biblioteca.");const created=await fetch(`${url}/storage/v1/bucket`,{method:"POST",headers,body:JSON.stringify({id:bucket,name:bucket,public:true,file_size_limit:5242880,allowed_mime_types:[...allowed]})});if(!created.ok&&created.status!==409)throw new Error("Não foi possível criar a biblioteca.")}
 return {url,service};
}

export async function GET(){
 const session=await getAdminSession();if(!session)return NextResponse.json({error:"Não autorizado."},{status:401});
 try{const {url,service}=await storage();const response=await fetch(`${url}/storage/v1/object/list/${bucket}`,{method:"POST",headers:{apikey:service!,Authorization:`Bearer ${service}`,"Content-Type":"application/json"},body:JSON.stringify({prefix:"uploads",limit:200,offset:0,sortBy:{column:"created_at",order:"desc"}}),cache:"no-store"});if(!response.ok)throw new Error("Não foi possível listar as imagens.");const files=await response.json();return NextResponse.json({files:files.filter((f:any)=>f.name!==".emptyFolderPlaceholder").map((f:any)=>({...f,path:`uploads/${f.name}`,url:`${url}/storage/v1/object/public/${bucket}/uploads/${encodeURIComponent(f.name)}`}))})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Falha na biblioteca."},{status:500})}
}

export async function POST(request:Request){
 const session=await getAdminSession();if(!session)return NextResponse.json({error:"Não autorizado."},{status:401});
 try{const data=await request.formData(),file=data.get("file");if(!(file instanceof File))return NextResponse.json({error:"Selecione uma imagem."},{status:400});if(!allowed.has(file.type))return NextResponse.json({error:"Formato não permitido. Use JPG, PNG, WebP, GIF ou SVG."},{status:400});if(file.size>5242880)return NextResponse.json({error:"A imagem deve ter no máximo 5 MB."},{status:400});const {url,service}=await storage();const base=file.name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-|-$/g,"");const name=`${Date.now()}-${base||"imagem"}`;const path=`uploads/${name}`;const response=await fetch(`${url}/storage/v1/object/${bucket}/${path}`,{method:"POST",headers:{apikey:service!,Authorization:`Bearer ${service}`,"Content-Type":file.type,"x-upsert":"false"},body:await file.arrayBuffer()});if(!response.ok)throw new Error("Não foi possível enviar a imagem.");return NextResponse.json({ok:true,file:{name,path,url:`${url}/storage/v1/object/public/${bucket}/${path}`}})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Falha no envio."},{status:500})}
}

export async function DELETE(request:Request){
 const session=await getAdminSession();if(!session)return NextResponse.json({error:"Não autorizado."},{status:401});if(session.role!=="superadmin")return NextResponse.json({error:"Somente o superadministrador pode excluir arquivos."},{status:403});
 try{const {path}=await request.json();if(typeof path!=="string"||!path.startsWith("uploads/"))return NextResponse.json({error:"Arquivo inválido."},{status:400});const {url,service}=await storage();const response=await fetch(`${url}/storage/v1/object/${bucket}`,{method:"DELETE",headers:{apikey:service!,Authorization:`Bearer ${service}`,"Content-Type":"application/json"},body:JSON.stringify({prefixes:[path]})});if(!response.ok)throw new Error("Não foi possível excluir a imagem.");return NextResponse.json({ok:true})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Falha ao excluir."},{status:500})}
}
