// Supabase adapter: gives the app the same small db/user/downloads API it used on claude.ai.
(function(){
 if(window.claude||!window.WAVES||!window.supabase)return;
 const sb=supabase.createClient(WAVES.url,WAVES.anonKey);let session=null,isStaff=false;
 const ready=(async()=>{const{data}=await sb.auth.getSession();session=data.session;
  if(session){const r=await sb.from('staff').select('user_id').eq('user_id',session.user.id).maybeSingle();isStaff=!!r.data}})();
 const fail=e=>{if(e)throw e};
 function docRef(c,id){return{
  async set(o){fail((await sb.from('docs').upsert({col:c,id,data:o,updated_at:new Date().toISOString()})).error)},
  async update(p){const r=await sb.from('docs').select('data').eq('col',c).eq('id',id).single();fail(r.error);
   fail((await sb.from('docs').update({data:{...r.data.data,...p},updated_at:new Date().toISOString()}).eq('col',c).eq('id',id)).error)},
  onSnapshot(next,err){const load=async()=>{const r=await sb.from('docs').select('data').eq('col',c).eq('id',id).maybeSingle();if(r.error){err&&err(r.error);return}next({data:()=>r.data?r.data.data:undefined})};
   load();const ch=sb.channel('d-'+c+id+Math.random()).on('postgres_changes',{event:'*',schema:'public',table:'docs',filter:'col=eq.'+c},load).subscribe();return()=>sb.removeChannel(ch)}}}
 const DB={doc:p=>{const[c,id]=p.split('/');return docRef(c,id)},
  collection:c=>({doc:id=>docRef(c,id),
   onSnapshot(next,err){const load=async()=>{const r=await sb.from('docs').select('id,data').eq('col',c);if(r.error){err&&err(r.error);return}next({docs:r.data.map(x=>({id:x.id,data:()=>x.data}))})};
    load();const ch=sb.channel('c-'+c+Math.random()).on('postgres_changes',{event:'*',schema:'public',table:'docs',filter:'col=eq.'+c},load).subscribe();return()=>sb.removeChannel(ch)}})};
 const U={canEdit:async()=>isStaff,can:async()=>isStaff,id:async()=>session?session.user.id:''};
 const DL={save:async({filename,data})=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data]));a.download=filename;a.click()}};
 window.claude={use:async n=>{await ready;return n=='db'?DB:n=='user'?U:n=='downloads'?DL:null}};
 addEventListener('hashchange',async()=>{
  if(location.hash=='#logout'){await sb.auth.signOut();location.hash='';location.reload()}
  if(location.hash=='#login'){modal('<h3>Staff sign in</h3><label>Email</label><input id="le" type="email" autocomplete="username"><label>Password</label><input id="lp" type="password" autocomplete="current-password"><p><button class="b" id="lb">Sign in</button> <button class="b o" onclick="cm();location.hash=\'\'">Cancel</button></p>');
   $('#lb').onclick=async()=>{const r=await sb.auth.signInWithPassword({email:$('#le').value,password:$('#lp').value});if(r.error)return toast('Sign in failed: '+r.error.message,1);location.hash='app';location.reload()}}});
})();
