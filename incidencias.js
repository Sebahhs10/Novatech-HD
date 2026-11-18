(() => {
  'use strict';
  const STORAGE_KEY = 'novatech_casos_v1';
  const $ = id => document.getElementById(id);
  const ahora = () => new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
  const demo = [
    {id:'INC-0001',type:'Incidencia',title:'Producto con stock negativo al registrar salida',area:'Inventario',priority:'Alta',owner:'Soporte TI',requester:'María González',description:'Al intentar registrar una salida, el sistema muestra una cantidad que no coincide con el stock disponible.',status:'En atención',created:'18/11/2026, 09:15',updated:'18/11/2026, 10:20',history:[{date:'18/11/2026, 09:15',text:'Caso registrado por María González.'},{date:'18/11/2026, 10:20',text:'Soporte TI inició la revisión del movimiento de inventario.'}]},
    {id:'SOL-0002',type:'Solicitud',title:'Habilitar acceso para nuevo operador',area:'Accesos',priority:'Media',owner:'Administrador',requester:'Carlos Ruiz',description:'Se solicita habilitar una cuenta para el nuevo operador del almacén.',status:'Abierto',created:'18/11/2026, 08:40',updated:'18/11/2026, 08:40',history:[{date:'18/11/2026, 08:40',text:'Solicitud registrada. Pendiente de asignación.'}]},
    {id:'INC-0003',type:'Incidencia',title:'Pedido no refleja el cambio de estado',area:'Pedidos',priority:'Baja',owner:'Equipo de soporte',requester:'Ana Torres',description:'El pedido aparece como pendiente aunque ya fue enviado.',status:'Resuelto',created:'17/11/2026, 15:30',updated:'18/11/2026, 11:05',history:[{date:'17/11/2026, 15:30',text:'Incidencia registrada.'},{date:'18/11/2026, 11:05',text:'Se verificó y actualizó el estado del pedido.'}]}
  ];
  let cases = loadCases();
  let selectedId = cases[0]?.id || null;

  function loadCases(){
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : demo; }
    catch(e){ console.warn('No se pudieron cargar los casos', e); return demo; }
  }
  function save(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cases)); } catch(e){ alert('No se pudo guardar. Revisa el almacenamiento del navegador.'); } }
  function esc(value){ return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function nextId(type){ const prefix = type === 'Incidencia' ? 'INC' : 'SOL'; const nums = cases.filter(c=>c.id.startsWith(prefix)).map(c=>Number(c.id.split('-')[1])||0); return `${prefix}-${String(Math.max(0,...nums)+1).padStart(4,'0')}`; }
  function updateKpis(){ $('kpiTotal').textContent=cases.length; $('kpiOpen').textContent=cases.filter(c=>c.status==='Abierto').length; $('kpiProgress').textContent=cases.filter(c=>['En atención','En espera'].includes(c.status)).length; $('kpiClosed').textContent=cases.filter(c=>c.status==='Resuelto').length; }
  function renderList(){
    const term=$('caseSearch').value.trim().toLowerCase(), status=$('caseStatusFilter').value, type=$('caseTypeFilter').value;
    const filtered=cases.filter(c=>(status==='Todos'||c.status===status)&&(type==='Todos'||c.type===type)&&[c.id,c.title,c.requester,c.area].some(v=>v.toLowerCase().includes(term)));
    $('caseList').innerHTML=filtered.length ? filtered.map(c=>`<button type="button" class="case-row ${c.id===selectedId?'selected':''}" data-case-id="${esc(c.id)}"><span class="case-row-top"><b>${esc(c.id)}</b><span class="priority priority-${c.priority.toLowerCase().replace('í','i')}">${esc(c.priority)}</span></span><strong>${esc(c.title)}</strong><span class="case-row-meta">${esc(c.type)} · ${esc(c.area)} · ${esc(c.requester)}</span><span class="case-row-bottom"><span class="case-status status-${c.status.toLowerCase().replace(' ','-')}">${esc(c.status)}</span><small>Actualizado: ${esc(c.updated)}</small></span></button>`).join('') : '<div class="case-empty">No hay casos que coincidan con la búsqueda.</div>';
    $('caseList').querySelectorAll('[data-case-id]').forEach(btn=>btn.addEventListener('click',()=>{selectedId=btn.dataset.caseId;renderList();renderDetail();}));
  }
  function renderDetail(){
    const c=cases.find(x=>x.id===selectedId); const box=$('caseDetail');
    if(!c){box.innerHTML='<div class="empty-detail"><span>🗂️</span><h3>Selecciona un caso</h3><p>Elige un registro de la bandeja para ver su seguimiento.</p></div>';return;}
    box.innerHTML=`<div class="detail-head"><div><p class="eyebrow">FICHA DE SEGUIMIENTO</p><h2>${esc(c.id)}</h2><p>${esc(c.title)}</p></div><span class="case-status status-${c.status.toLowerCase().replace(' ','-')}">${esc(c.status)}</span></div>
      <div class="detail-tags"><span>${esc(c.type)}</span><span>Área: ${esc(c.area)}</span><span class="priority priority-${c.priority.toLowerCase().replace('í','i')}">${esc(c.priority)}</span></div>
      <div class="detail-info"><div><small>Solicitante</small><strong>${esc(c.requester)}</strong></div><div><small>Responsable</small><strong>${esc(c.owner||'Sin asignar')}</strong></div><div><small>Creado</small><strong>${esc(c.created)}</strong></div><div><small>Última actualización</small><strong>${esc(c.updated)}</strong></div></div>
      <div class="detail-description"><h3>Descripción</h3><p>${esc(c.description)}</p></div>
      <div class="detail-actions"><label>Actualizar estado<select id="detailStatus"><option ${c.status==='Abierto'?'selected':''}>Abierto</option><option ${c.status==='En atención'?'selected':''}>En atención</option><option ${c.status==='En espera'?'selected':''}>En espera</option><option ${c.status==='Resuelto'?'selected':''}>Resuelto</option></select></label><label>Responsable<input id="detailOwner" maxlength="50" value="${esc(c.owner||'')}"></label><button id="saveCaseChanges" class="btn-actualizar" type="button">Guardar cambios</button></div>
      <div class="history-block"><h3>Bitácora de seguimiento</h3><form id="historyForm" class="history-form"><input id="historyNote" maxlength="220" placeholder="Escribe el avance realizado..." required><button type="submit">Agregar avance</button></form><ol class="timeline">${(c.history||[]).slice().reverse().map(h=>`<li><span class="timeline-dot"></span><div><strong>${esc(h.date)}</strong><p>${esc(h.text)}</p></div></li>`).join('')}</ol></div>`;
    $('saveCaseChanges').addEventListener('click',()=>{const old=c.status;c.status=$('detailStatus').value;c.owner=$('detailOwner').value.trim();c.updated=ahora();if(old!==c.status)c.history.push({date:c.updated,text:`Estado actualizado: ${old} → ${c.status}.`});else c.history.push({date:c.updated,text:`Responsable actualizado: ${c.owner||'Sin asignar'}.`});save();updateKpis();renderList();renderDetail();});
    $('historyForm').addEventListener('submit',e=>{e.preventDefault();const note=$('historyNote').value.trim();if(!note)return;c.history.push({date:ahora(),text:note});c.updated=ahora();save();renderList();renderDetail();});
  }
  $('caseForm').addEventListener('submit',e=>{e.preventDefault();const type=$('caseType').value;const created=ahora();const c={id:nextId(type),type,title:$('caseTitle').value.trim(),area:$('caseArea').value,priority:$('casePriority').value,owner:$('caseOwner').value.trim(),requester:$('caseRequester').value.trim(),description:$('caseDescription').value.trim(),status:'Abierto',created,updated:created,history:[{date:created,text:`${type} registrado por ${$('caseRequester').value.trim()}.`}]};if(!c.title||!c.requester||!c.description)return;cases.unshift(c);selectedId=c.id;save();e.target.reset();updateKpis();renderList();renderDetail();});
  ['caseSearch','caseStatusFilter','caseTypeFilter'].forEach(id=>$(id).addEventListener(id==='caseSearch'?'input':'change',renderList));
  $('exportCases').addEventListener('click',()=>{const headers=['Código','Tipo','Asunto','Área','Prioridad','Solicitante','Responsable','Estado','Creado','Actualizado','Descripción'];const rows=cases.map(c=>[c.id,c.type,c.title,c.area,c.priority,c.requester,c.owner,c.status,c.created,c.updated,c.description]);const csv=[headers,...rows].map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='novatech_casos.csv';a.click();URL.revokeObjectURL(url);});
  updateKpis();renderList();renderDetail();
})();
