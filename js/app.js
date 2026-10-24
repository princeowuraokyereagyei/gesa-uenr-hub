/* GESA-UENR Academic Resource Hub: hash router + JSON-driven views. No framework, no backend. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const app=$('#app'),reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const C={},get=u=>C[u]||(C[u]=fetch(u).then(r=>r.ok?r.json():null).catch(()=>null));
const LV={'level-100':['Level 100','Year 1'],'level-200':['Level 200','Year 2'],'level-300':['Level 300','Year 3'],'level-400':['Level 400','Year 4']};
const SM={'sem-1':'1st Semester','sem-2':'2nd Semester'};
const CT={slides:['Lecture Slides','🖥️'],references:['Reference Materials / Books','📚'],'past-questions':['Past Questions','📝'],tutorials:['Tutorial Questions','✏️']};
let S=[],P=[],R=[],K={},SITE={};
const cid=c=>c.code.replace(/\s+/g,'');
const loadC=async p=>K[p]||(K[p]=(await get(`data/courses/${p}.json`))||{levels:{}}); // lazy per programme
const allC=()=>Promise.all(P.map(p=>loadC(p.id)));
const cl=(p,l,s)=>{const a=K[p]?.levels?.[l]?.[s];return Array.isArray(a)?a:[]};
const rsOf=(p,l,s,id)=>R.filter(r=>r.programme==p&&r.level==l&&r.semester==s&&r.course==id);
const pn=id=>P.find(p=>p.id==id)?.name||id;
const crumbs=a=>`<nav class="crumbs" aria-label="Breadcrumb">${[['Home','#/'],...a].map((x,i,r)=>i==r.length-1?`<span aria-current="page">${esc(x[0])}</span>`:`<a href="${x[1]}">${esc(x[0])}</a>`).join('<i>›</i>')}</nav>`;
const back=h=>`<a class="btn ghost" href="${h}" style="margin-top:10px">← Back</a>`;
const card=(h,t,s,i)=>`<a class="card rv" style="--i:${i}" href="${h}"><h3>${esc(t)}</h3><p>${esc(s)}</p></a>`;
const empty=(m,sub)=>`<div class="empty"><span>🚧</span><h3>${esc(m)}</h3><p>${esc(sub||'Check back soon, the Academic Committee is adding more.')}</p></div>`;
const nf=()=>({t:'Not found',html:`<div class="empty" style="margin-top:40px"><span>🧭</span><h1>Page not found</h1><p>That link doesn’t lead anywhere (yet).</p><a class="btn" href="#/">Go home</a></div>`});

const item=r=>{const u=r.externalUrl||r.path||'';return `<article class="it rv"><span class="ft ${esc(r.fileType)}">${esc((r.fileType||'file').toUpperCase())}</span><div class="im"><h4>${esc(r.title)}</h4><p>${[r.lecturer,r.year,r.size].filter(Boolean).map(esc).join(' · ')} ${r.examType?`<span class="pill c">${r.examType=='mid-semester'?'Mid-semester':'End-of-semester'}</span>`:''}</p></div><div class="ac"><a class="btn" href="${esc(u)}" data-dl target="_blank" rel="noopener" aria-label="Download ${esc(r.title)}">⬇ Download</a>${r.fileType=='pdf'?`<a class="btn ghost" href="${esc(u)}" target="_blank" rel="noopener">Preview</a>`:''}<button class="btn ghost" data-share>Share link</button></div></article>`};

const home=async()=>{await allC();
 const nc=P.reduce((n,p)=>n+Object.values(K[p.id].levels||{}).reduce((m,l)=>m+Object.values(l).reduce((q,a)=>q+(Array.isArray(a)?a.length:0),0),0),0);
 const last=store.get('gesa-last'),recent=[...R].sort((a,b)=>(b.dateAdded||'').localeCompare(a.dateAdded||'')).slice(0,6);
 return {t:'Home',html:`<section class="hero"><svg class="gear" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="12" stroke-dasharray="9.95 9.95"/><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="4"/></svg><div class="wrap"><img class="lg" src="assets/logo.webp" alt="GESA-UENR logo" width="120" height="106"><h1>${esc(SITE.title)}</h1><p class="tag">${esc(SITE.tagline)}</p><div class="sb"><input id="q" class="in" type="search" autocomplete="off" placeholder="Search course code, name or resource title…" aria-label="Search"><div id="sr" class="sr" hidden></div></div>${last?`<a class="btn" href="${esc(last)}">Continue where you left off →</a>`:''}<div class="stats">${[[P.length,'Programmes'],[nc,'Courses'],[R.length,'Resources']].map(([n,l])=>`<div><b data-n="${n}">0</b><span>${l}</span></div>`).join('')}</div></div></section>
 ${S.map(s=>`<section class="wrap"><h2>${esc(s.name)}</h2><div class="grid">${s.programmes.map((p,i)=>card(`#/${p.id}`,p.name,'View levels →',i)).join('')}</div></section>`).join('')}
 <section class="wrap"><h2>Recently added</h2>${recent.length?`<div class="grid">${recent.map((r,i)=>card(`#/${r.programme}/${r.level}/${r.semester}/${r.course}`,r.title,`${r.course} · ${CT[r.category]?.[0]||''} · ${r.dateAdded||''}`,i)).join('')}</div>`:empty('Nothing here yet')}</section>`}};

const prog=async(a,b,c,d)=>{await loadC(a);const n=pn(a),base=`#/${a}`;
 if(!b){store.set('gesa-last',base);return {t:n,html:`${crumbs([[n]])}<h1>${esc(n)}</h1><p class="mu">Choose your level.</p><div class="grid">${Object.entries(LV).map(([k,v],i)=>card(`${base}/${k}`,v[0],v[1],i)).join('')}</div>`}}
 if(!LV[b])return nf();const lb=`${base}/${b}`;
 if(!c){store.set('gesa-last',lb);return {t:`${n} ${LV[b][0]}`,html:`${crumbs([[n,base],[LV[b][0]]])}${back(base)}<h1>${LV[b][0]} <span class="mu">/ ${LV[b][1]}</span></h1><p class="mu">Choose a semester.</p><div class="grid">${Object.entries(SM).map(([k,v],i)=>card(`${lb}/${k}`,v,`${cl(a,b,k).length} courses`,i)).join('')}</div>`}}
 if(!SM[c])return nf();const sb=`${lb}/${c}`,list=cl(a,b,c);store.set('gesa-last',sb);
 if(!d)return {t:`${LV[b][0]} ${SM[c]}`,html:`${crumbs([[n,base],[LV[b][0],lb],[SM[c]]])}${back(lb)}<h1>${SM[c]} courses</h1>${list.length?`<table class="tbl"><thead><tr><th>Code</th><th>Course name</th><th>Credits</th><th>Resources</th></tr></thead><tbody>${list.map((x,i)=>`<tr class="rv" style="--i:${i}" data-h="${sb}/${cid(x)}"><td data-l="Code"><a href="${sb}/${cid(x)}">${esc(x.code)}</a></td><td data-l="Course">${esc(x.name)}</td><td data-l="Credits">${esc(x.credits)}</td><td data-l="Resources">${rsOf(a,b,c,cid(x)).length}</td></tr>`).join('')}</tbody></table>`:empty('Materials coming soon','Courses for this semester have not been added yet.')}`};
 const co=list.find(x=>cid(x)==d);if(!co)return nf();const rs=rsOf(a,b,c,d);
 return {t:`${co.code} ${co.name}`,html:`${crumbs([[n,base],[LV[b][0],lb],[SM[c],sb],[co.code]])}${back(sb)}<h1>${esc(co.code)}: ${esc(co.name)}</h1><p class="mu">${esc(co.credits)} credits · ${rs.length} resources</p>
 <div class="tabs" id="tabs" role="tablist">${Object.entries(CT).map(([k,v],i)=>`<button role="tab" data-t="${k}" aria-selected="${i==0}">${v[1]} ${v[0]} (${rs.filter(r=>r.category==k).length})</button>`).join('')}</div>
 <input id="f" class="in" type="search" placeholder="Filter by title, lecturer or year…" aria-label="Filter"><div id="list"></div>`,
 after:()=>{let tab='slides';const paint=()=>{const q=$('#f').value.toLowerCase(),l=rs.filter(r=>r.category==tab&&JSON.stringify(r).toLowerCase().includes(q)).sort((x,y)=>(y.year||0)-(x.year||0));
  if(!l.length){$('#list').innerHTML=empty(`No ${CT[tab][0].toLowerCase()} yet`);return}
  const key=tab=='slides'?r=>r.lecturer||'Other':tab=='past-questions'?r=>`${r.year||''} · ${SM[r.semester]}`:null,g={};
  l.forEach(r=>(g[key?key(r):'']??=[]).push(r));
  $('#list').innerHTML=Object.entries(g).map(([k,v])=>`${k?`<h3 class="gh">${esc(k)}</h3>`:''}${v.map(item).join('')}`).join('');reveal()};
  $('#tabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;tab=b.dataset.t;$$('#tabs button').forEach(x=>x.setAttribute('aria-selected',x==b));paint()};
  $('#f').oninput=paint;paint()}}};

const dir=(t,file,sub,norm)=>async()=>{const it=((await get(file))?.items||[]).map(norm);
 return {t,html:`${crumbs([[t]])}<h1>${t}</h1><p class="mu">${sub}</p><input id="df" class="in" type="search" placeholder="Search…" aria-label="Search"><div class="chips" id="chips"></div><div class="grid" id="dl"></div>`,
 after:()=>{let cat='';const cats=[...new Set(it.map(x=>x.category).filter(Boolean))];
  const paint=()=>{const q=$('#df').value.toLowerCase(),l=it.filter(x=>(!cat||x.category==cat)&&JSON.stringify(x).toLowerCase().includes(q));
   $('#chips').innerHTML=['All',...cats].map(c=>`<button class="chip" data-c="${esc(c)}" aria-pressed="${(c=='All'&&!cat)||c==cat}">${esc(c)}</button>`).join('');
   $('#dl').innerHTML=l.length?l.map((x,i)=>`<a class="card rv" style="--i:${i}" href="${esc(x.url)}" target="_blank" rel="noopener"><span class="pill">${esc(x.category)}</span><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p></a>`).join(''):`<div style="grid-column:1/-1">${empty('No matches')}</div>`;reveal()};
  $('#chips').onclick=e=>{const b=e.target.closest('.chip');if(b){cat=b.dataset.c=='All'?'':b.dataset.c;paint()}};$('#df').oninput=paint;paint()}}};

const cv=async()=>{const d=(await get('data/cv.json'))||{};
 return {t:'CV / Resume / Portfolio',html:`${crumbs([['CV / Resume / Portfolio']])}<h1>CV, Resume or Portfolio?</h1><p class="mu">${esc(d.intro)}</p>
 <div class="tw"><table class="cmp"><thead><tr><th></th>${(d.cols||[]).map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${(d.rows||[]).map(r=>`<tr><th>${esc(r[0])}</th>${r.slice(1).map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
 <h2>Templates</h2><div class="grid">${(d.templates||[]).map((x,i)=>x.url?`<a class="card rv" style="--i:${i}" href="${esc(x.url)}" download><span class="pill">${esc(x.type)}</span><h3>${esc(x.name)}</h3><p>${esc(x.desc)}</p></a>`:`<div class="card rv" style="--i:${i}"><span class="pill c">${esc(x.type)}</span><h3>${esc(x.name)}</h3><p>${esc(x.desc)} (Template coming soon)</p></div>`).join('')}</div>
 <h2>How to customise yours</h2>${(d.guides||[]).map(g=>`<details><summary>${esc(g.title)}</summary><div class="dc">${esc(g.body)}</div></details>`).join('')}
 <h2>Final checklist</h2>${(d.checklist||[]).map(x=>`<label class="ck"><input type="checkbox"> ${esc(x)}</label>`).join('')}`}};

const forms=async()=>{const d=(await get('data/forms.json'))||{};
 return {t:'Student Forms',html:`${crumbs([['Student Forms']])}<h1>Student Forms & Surveys</h1><p class="mu">Forms posted by the Academic Committee.</p><div class="grid">${(d.items||[]).map((x,i)=>{const open=x.status=='Open'&&x.url;return `<div class="card rv" style="--i:${i}"><span class="pill ${x.status=='Open'?'':'c'}">${esc(x.status)}</span><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><p>Deadline: ${esc(x.deadline||'none')}</p><a class="btn ${open?'':'off'}" href="${esc(x.url)}" target="_blank" rel="noopener" style="margin-top:12px">Open form</a></div>`}).join('')||empty('No forms right now')}</div>
 <h2>Admin guide: Google Forms</h2>${(d.guide||[]).map(g=>`<details><summary>${esc(g.title)}</summary><div class="dc">${esc(g.body)}</div></details>`).join('')}`}};

const about=async()=>({t:'About',html:`${crumbs([['About / Contact']])}<h1>About GESA-UENR</h1><p>${esc(SITE.about)}</p><h2>Our mission</h2><p>${esc(SITE.mission)}</p><h2>Contribute materials</h2><p>${esc(SITE.contribute)}</p><h2>Contact</h2><div class="grid">${(SITE.contact||[]).map((c,i)=>c.url?`<a class="card rv" style="--i:${i}" href="${esc(c.url)}" target="_blank" rel="noopener"><h3>${esc(c.label)}</h3></a>`:`<div class="card rv"><h3>${esc(c.label)}</h3><p>Add the link in data/site.json</p></div>`).join('')}</div>`});

const PAGES={links:dir('Research Sites','data/links.json','Journals, databases, writing tools and standards.',x=>({title:x.title,desc:x.description,url:x.url,category:x.category})),
 books:dir('Download Books','data/books.json','Free and legal book sources.',x=>({title:x.title,desc:`${x.author||''}${x.subject?' · '+x.subject:''}`,url:x.url,category:x.subject})),cv,forms,about};

async function route(){const h=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent),[a,b,c,d]=h;
 app.innerHTML='<div class="sk"></div><div class="sk"></div><div class="sk"></div>';let o;
 try{o=!a?await home():PAGES[a]?await PAGES[a]():P.find(x=>x.id==a)?await prog(a,b,c,d):nf()}catch(e){o={t:'Error',html:empty('Something went wrong','Please refresh the page.')}}
 app.innerHTML=`<div class="view">${o.html}</div>`;document.title=`${o.t} · GESA-UENR Hub`;
 $$('#nav a').forEach(x=>x.toggleAttribute('aria-current',x.getAttribute('href')==(a?(PAGES[a]?'#/'+a:null):'#/')));
 $('#nav').classList.remove('open');o.after&&o.after();reveal();counters();scrollTo(0,0);app.focus({preventScroll:true})}

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.05});
const reveal=()=>$$('.rv:not(.on)').forEach(e=>reduce?e.classList.add('on'):io.observe(e));
const counters=()=>$$('[data-n]').forEach(e=>{const n=+e.dataset.n;if(reduce||!n){e.textContent=n;return}const t0=performance.now(),f=t=>{const k=Math.min(1,(t-t0)/900);e.textContent=Math.round(n*(1-Math.pow(1-k,3)));k<1&&requestAnimationFrame(f)};requestAnimationFrame(f)});
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2600)};

document.addEventListener('input',async e=>{if(e.target.id!='q')return;const q=e.target.value.trim().toLowerCase(),box=$('#sr');if(!q){box.hidden=true;return}await allC();const res=[];
 P.forEach(p=>Object.entries(K[p.id].levels||{}).forEach(([l,ss])=>Object.entries(ss).forEach(([s,a])=>Array.isArray(a)&&a.forEach(c=>{if(`${c.code} ${cid(c)} ${c.name}`.toLowerCase().includes(q))res.push([`${c.code} · ${c.name}`,`${pn(p.id)} · ${LV[l]?.[0]} · ${SM[s]}`,`#/${p.id}/${l}/${s}/${cid(c)}`])}))));
 R.filter(r=>r.title.toLowerCase().includes(q)).forEach(r=>res.push([r.title,`${CT[r.category]?.[0]} · ${r.course}`,`#/${r.programme}/${r.level}/${r.semester}/${r.course}`]));
 box.innerHTML=res.slice(0,8).map(x=>`<a href="${x[2]}"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></a>`).join('')||'<p>No matches found.</p>';box.hidden=false});
document.addEventListener('click',async e=>{const t=e.target;
 const dl=t.closest('[data-dl]');if(dl){const u=dl.getAttribute('href');if(!/^https?:/.test(u)){e.preventDefault();const ok=u&&await fetch(u,{method:'HEAD'}).then(r=>r.ok).catch(()=>false);if(!ok)return toast('File not found. It may not be uploaded yet.');const l=document.createElement('a');l.href=u;l.download='';l.click()}toast('Download started');return}
 if(t.closest('[data-share]')){const u=location.href;try{await navigator.clipboard.writeText(u);toast('Link copied')}catch(x){prompt('Copy this link:',u)}return}
 const tr=t.closest('tr[data-h]');if(tr&&!t.closest('a'))location.hash=tr.dataset.h;
 if(!t.closest('.sb'))$('#sr')&&($('#sr').hidden=true)});
const setTheme=t=>{document.documentElement.dataset.theme=t;store.set('gesa-theme',t)};
$('#th').onclick=()=>setTheme(document.documentElement.dataset.theme=='dark'?'light':'dark');
if(!document.documentElement.dataset.theme)document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
$('#bg').onclick=()=>{const o=$('#nav').classList.toggle('open');$('#bg').setAttribute('aria-expanded',o)};
addEventListener('scroll',()=>$('#top').classList.toggle('on',scrollY>500),{passive:true});$('#top').onclick=()=>scrollTo({top:0});
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#inst').hidden=false});$('#inst').onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;$('#inst').hidden=true}};
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
(async()=>{const[pg,rs,st]=await Promise.all([get('data/programmes.json'),get('data/resources.json'),get('data/site.json')]);
 S=pg?.schools||[];P=S.flatMap(s=>s.programmes);R=rs?.items||[];SITE=st||{};route();addEventListener('hashchange',route)})();
})();
