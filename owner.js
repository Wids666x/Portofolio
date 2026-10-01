(()=>{
const PF=window.PF,API='https://api.github.com',H=location.hostname,GH=H.endsWith('.github.io');
const O=GH?H.split('.')[0]:'wiidiia2205-coder',R=GH?(location.pathname.split('/')[1]||'Portofolio'):'Portofolio';
let T=localStorage.pf_t||sessionStorage.pf_t||'',B='main',D,saved='',pend={},drag=null,E,bar,busy=0;
const uid=()=>Math.random().toString(36).slice(2,9);
const el=(t,a={},...k)=>{const e=document.createElement(t);for(const[x,v]of Object.entries(a))x.startsWith('on')?e[x]=v:x==='class'?e.className=v:e.setAttribute(x,v);e.append(...k);return e};
document.head.append(el('style',{},`
.pf-edit .filters,.pf-edit #grid{display:none}
.pfo{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:1rem}
.pfm{background:#fafaf7;padding:1.6rem;max-width:420px;width:100%;display:grid;gap:.9rem;font-size:.85rem}
.pfm label{display:grid;gap:.3rem;color:#7a7a72}.pfm input,.pfm select{padding:.55rem;border:1px solid #ccc;font:inherit;color:#161613}
.pfm input[type=checkbox]{justify-self:start}.pfr{display:flex;gap:.6rem;justify-content:flex-end}
.pfm button,.pfbar button{padding:.5rem 1rem;border:1px solid #161613;background:none;cursor:pointer;font:inherit;color:inherit}
.pfm .pri,.pfbar .pri{background:#161613;color:#fafaf7}
.pfbar{position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:250;background:#fafaf7;border:1px solid #161613;padding:.6rem;display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;font-size:.8rem;max-width:96vw}
.pfbar i{font-style:normal;color:#b3261e}.pfbar button:disabled{opacity:.4}
#pfe{padding:0 4vw 7rem}.pfs{margin-bottom:2.4rem}.pfh{display:flex;gap:.5rem;align-items:center;margin-bottom:.8rem}
.pfh input{flex:1;font:600 1.3rem inherit;border:0;border-bottom:1px solid #ccc;background:none;padding:.3rem 0}.pfh button{border:1px solid #ccc;background:none;cursor:pointer;padding:.3rem .6rem}
.pfg{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;min-height:90px;padding:6px;border:1px dashed #ccc}
.pfc{position:relative;display:grid;gap:2px;font-size:.8rem;cursor:grab;background:#fff;padding:6px}.pfc.drg{opacity:.35}
.pfc img{width:100%;aspect-ratio:4/3;object-fit:cover;pointer-events:none}.pfc small{color:#7a7a72}
.pfc.tall::after{content:"tall";position:absolute;left:10px;top:10px;background:#161613;color:#fff;font-size:.65rem;padding:1px 5px}
.pfb{position:absolute;right:10px;top:10px;display:flex;gap:3px}.pfb button{background:#fafaf7;border:1px solid #161613;cursor:pointer;padding:2px 6px}
.pft{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#161613;color:#fff;padding:.6rem 1rem;z-index:400;font-size:.85rem;max-width:92vw}`));
const toast=m=>{const t=el('div',{class:'pft'},m);document.body.append(t);setTimeout(()=>t.remove(),5000)};
async function gh(p,{method='GET',body,raw}={}){
 const r=await fetch(API+p,{method,headers:{Authorization:'Bearer '+T,Accept:raw?'application/vnd.github.raw+json':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body&&JSON.stringify(body)});
 if(!r.ok){const e=new Error('GitHub '+r.status);e.status=r.status;throw e}
 return raw?r.text():r.json()}
const modal=(title,fields,ok='OK')=>new Promise(res=>{
 const I={},f=el('form',{class:'pfm'},el('h3',{},title));
 fields.forEach(x=>{let i;
  if(x.type==='select'){i=el('select');x.opts.forEach(([v,t])=>{const o=el('option',{value:v},t);if(v===x.value)o.selected=true;i.append(o)})}
  else{i=el('input',{type:x.type||'text'});if(x.type==='checkbox')i.checked=!!x.value;else if(x.type!=='file')i.value=x.value||'';else{i.accept='image/*';i.multiple=!!x.multiple}}
  I[x.name]=i;f.append(el('label',{},x.label,i))});
 const close=v=>{ov.remove();res(v)};
 f.append(el('div',{class:'pfr'},el('button',{type:'button',onclick:()=>close(null)},'Batal'),el('button',{class:'pri'},ok)));
 f.onsubmit=e=>{e.preventDefault();const v={};for(const k in I){const i=I[k];v[k]=i.type==='file'?[...i.files]:i.type==='checkbox'?i.checked:i.value}close(v)};
 const ov=el('div',{class:'pfo'},f);document.body.append(ov);Object.values(I)[0].focus()});
async function img(file){
 const b=await createImageBitmap(file,{imageOrientation:'from-image'}),s=Math.min(1,1800/Math.max(b.width,b.height));
 const c=el('canvas');c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);c.getContext('2d').drawImage(b,0,0,c.width,c.height);
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.86)),url=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(blob)});
 const path='assets/'+(file.name.replace(/\.[^.]+$/,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'foto')+'-'+uid()+'.jpg';
 pend[path]=url.split(',')[1];PF.preview[path]=url;return{path,tall:b.height/b.width>1.1}}
const dirty=()=>JSON.stringify(D)!==saved||Object.keys(pend).length;
const secOpts=()=>D.sections.map(s=>[s.id,s.title]);
const find=id=>{for(const s of D.sections){const i=s.works.findIndex(w=>w.id===id);if(i>-1)return{s,i,w:s.works[i]}}};
function mv(id,sid,idx){const f=find(id),to=D.sections.find(s=>s.id===sid);f.s.works.splice(f.i,1);if(f.s===to&&f.i<idx)idx--;to.works.splice(Math.max(0,idx),0,f.w);draw()}
const mvBy=(id,d)=>{const f=find(id);mv(id,f.s.id,f.i+(d>0?2:-1))};
async function addW(){
 if(!D.sections.length)return toast('Buat sub bab dulu.');
 const v=await modal('Tambah karya',[{name:'f',label:'Foto (boleh banyak)',type:'file',multiple:1},{name:'s',label:'Sub bab',type:'select',opts:secOpts()},{name:'t',label:'Judul (jika 1 foto)'},{name:'u',label:'Keterangan (jika 1 foto)'}],'Tambah');
 if(!v||!v.f.length)return;
 try{for(const f of v.f){const r=await img(f);D.sections.find(s=>s.id===v.s).works.push({id:uid(),title:v.f.length===1&&v.t?v.t:f.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' '),sub:v.f.length===1?v.u:'',img:r.path,tall:r.tall})}draw()}catch(e){toast('Foto tidak bisa dibaca (pakai JPG/PNG).')}}
async function editW(id){
 const f=find(id),w=f.w,v=await modal('Edit karya',[{name:'t',label:'Judul',value:w.title},{name:'u',label:'Keterangan',value:w.sub},{name:'s',label:'Sub bab',type:'select',opts:secOpts(),value:f.s.id},{name:'k',label:'Tampilan tinggi (portrait)',type:'checkbox',value:w.tall},{name:'f',label:'Ganti foto (opsional)',type:'file'}],'Simpan');
 if(!v)return;w.title=v.t;w.sub=v.u;w.tall=v.k;
 if(v.f[0])try{const r=await img(v.f[0]);w.img=r.path}catch(e){toast('Foto tidak bisa dibaca.')}
 if(v.s!==f.s.id)mv(id,v.s,1e9);else draw()}
function delW(id){if(confirm('Hapus karya ini?')){const f=find(id);f.s.works.splice(f.i,1);draw()}}
async function addS(){const v=await modal('Tambah sub bab',[{name:'t',label:'Nama sub bab'}],'Tambah');if(v&&v.t.trim()){D.sections.push({id:uid(),title:v.t.trim(),works:[]});draw()}}
function secBy(i,d){const a=D.sections,j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];draw()}
function draw(){
 E.textContent='';
 D.sections.forEach((s,si)=>{
  const g=el('div',{class:'pfg'}),ti=el('input',{value:s.title});ti.onchange=()=>{s.title=ti.value.trim()||s.title;draw()};
  g.ondragover=e=>{if(drag)e.preventDefault()};g.ondrop=e=>{if(drag&&e.target===g){e.preventDefault();mv(drag,s.id,1e9)}};
  s.works.forEach((w,wi)=>{
   const c=el('div',{class:'pfc'+(w.tall?' tall':''),draggable:'true'},el('img',{src:PF.preview[w.img]||w.img}),el('b',{},w.title||'(tanpa judul)'),el('small',{},w.sub),
    el('div',{class:'pfb'},el('button',{onclick:()=>mvBy(w.id,-1)},'◀'),el('button',{onclick:()=>mvBy(w.id,1)},'▶'),el('button',{onclick:()=>editW(w.id)},'✎'),el('button',{onclick:()=>delW(w.id)},'✕')));
   c.ondragstart=e=>{drag=w.id;e.dataTransfer.setData('text/plain',w.id);setTimeout(()=>c.classList.add('drg'))};
   c.ondragend=()=>{drag=null;draw()};c.ondragover=e=>{if(drag&&drag!==w.id)e.preventDefault()};
   c.ondrop=e=>{e.preventDefault();e.stopPropagation();if(!drag)return;const r=c.getBoundingClientRect();mv(drag,s.id,wi+(e.clientX>r.left+r.width/2?1:0))};
   g.append(c)});
  E.append(el('section',{class:'pfs'},el('div',{class:'pfh'},el('span',{},String(si+1).padStart(2,'0')),ti,
   el('button',{onclick:()=>secBy(si,-1)},'↑'),el('button',{onclick:()=>secBy(si,1)},'↓'),
   el('button',{onclick:()=>{if(confirm(`Hapus sub bab "${s.title}" beserta ${s.works.length} karyanya?`)){D.sections.splice(si,1);draw()}}},'✕')),g))});
 bar.querySelector('i').textContent=dirty()?'● belum disimpan':'';bar.querySelector('.pri').disabled=!dirty()||busy}
async function save(){
 busy=1;draw();const used=new Set(D.sections.flatMap(s=>s.works.map(w=>w.img))),old=new Set(JSON.parse(saved).sections.flatMap(s=>s.works.map(w=>w.img)));
 try{
  const p=`/repos/${O}/${R}/git`,ref=await gh(`${p}/ref/heads/${B}`),base=ref.object.sha,tree=(await gh(`${p}/commits/${base}`)).tree.sha,ent=[];
  for(const[path,b64]of Object.entries(pend))if(used.has(path))ent.push({path,mode:'100644',type:'blob',sha:(await gh(`${p}/blobs`,{method:'POST',body:{content:b64,encoding:'base64'}})).sha});
  const json=JSON.stringify(D,null,2)+'\n';
  ent.push({path:'data/works.json',mode:'100644',type:'blob',sha:(await gh(`${p}/blobs`,{method:'POST',body:{content:json,encoding:'utf-8'}})).sha});
  const del=[...old].filter(x=>!used.has(x)&&/^assets\//.test(x)).map(path=>({path,mode:'100644',type:'blob',sha:null}));
  let t;try{t=await gh(`${p}/trees`,{method:'POST',body:{base_tree:tree,tree:[...ent,...del]}})}catch(e){t=await gh(`${p}/trees`,{method:'POST',body:{base_tree:tree,tree:ent}})}
  const c=await gh(`${p}/commits`,{method:'POST',body:{message:'Update portfolio (owner editor)',tree:t.sha,parents:[base]}});
  await gh(`${p}/refs/heads/${B}`,{method:'PATCH',body:{sha:c.sha}});
  saved=JSON.stringify(D);pend={};toast('Tersimpan ✓ Website publik ikut berubah dalam 1–2 menit.')
 }catch(e){toast(e.status===401||e.status===403?'Token tidak punya izin menulis (Contents: Read and write).':'Gagal menyimpan: '+e.message)}
 busy=0;draw()}
function logout(){delete localStorage.pf_t;sessionStorage.removeItem('pf_t');T='';location.hash='';location.reload()}
function exit(){if(dirty()&&!confirm('Buang perubahan yang belum disimpan?'))return;E.remove();bar.remove();document.body.classList.remove('pf-edit');location.hash='';PF.set(PF.clean(JSON.parse(saved)))}
async function start(){
 if(!T){const v=await modal('Login Owner',[{name:'t',label:'GitHub token (fine-grained, Contents: Read and write)',type:'password'},{name:'r',label:'Ingat di perangkat ini',type:'checkbox'}],'Masuk');
  if(!v||!v.t.trim())return;T=v.t.trim();(v.r?localStorage:sessionStorage).pf_t=T}
 try{const r=await gh(`/repos/${O}/${R}`);B=r.default_branch;if(r.permissions&&!r.permissions.push)throw{status:403};try{B=(await gh(`/repos/${O}/${R}/pages`)).source.branch||B}catch(e){}}
 catch(e){delete localStorage.pf_t;sessionStorage.removeItem('pf_t');T='';return toast('Token ditolak atau tidak punya akses ke repository ini.')}
 try{D=PF.clean(JSON.parse(await gh(`/repos/${O}/${R}/contents/data/works.json?ref=${B}`,{raw:1})))}catch(e){D=PF.clean(JSON.parse(JSON.stringify(PF.get())))}
 saved=JSON.stringify(D);pend={};document.body.classList.add('pf-edit');
 E=el('div',{id:'pfe'});document.querySelector('#works').append(E);
 bar=el('div',{class:'pfbar'},el('button',{onclick:addW},'+ Karya'),el('button',{onclick:addS},'+ Sub bab'),el('button',{class:'pri',onclick:save},'Simpan'),
  el('button',{onclick:()=>{if(!dirty()||confirm('Buang perubahan?')){D=PF.clean(JSON.parse(saved));pend={};draw()}}},'Batal'),el('button',{onclick:exit},'Keluar editor'),el('button',{onclick:logout},'Logout'),el('i'));
 document.body.append(bar);addEventListener('beforeunload',e=>{if(dirty())e.preventDefault()});
 draw();document.querySelector('#works').scrollIntoView()}
window.PF_OWNER=start;start()})();
