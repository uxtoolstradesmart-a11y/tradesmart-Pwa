import {number,signed} from './market.js';
const icon=(name)=>`<img src="./assets/order-${name}.svg" alt="" draggable="false">`;
// Figma's illustrative contract uses 65 units per lot; this is a demo, not contract reference data.
const LOT_SIZE=65;
export function renderOrder(app,instrument){
 const fno=instrument.kind==='fno';
 const quote=instrument.price;
 let pillObserver;
 const s={product:'Delivery',mode:'Qty',units:fno?LOT_SIZE:1,amount:quote,price:quote,pricing:fno?'Limit':'Market',side:'BUY',exchange:fno?'NFO':'NSE',stopType:'',trigger:'',stop:false,target:false,stopPrice:'',targetPrice:'',advanced:false,validity:'DAY'};
 const rate=()=>s.pricing==='Market'?quote:Number(s.price);
 const quantity=()=>s.mode==='Amount'?Math.floor(Math.round(Number(s.amount)*100)/Math.round(rate()*100)):Number(s.units);
 const value=()=>s.mode==='Amount'?s.amount:s.mode==='Lots'?Number(s.units)/LOT_SIZE:s.units;
 const decimal=v=>Math.round(v*100)/100;
 const valid=()=>Number.isSafeInteger(quantity())&&quantity()>0&&quantity()<=10000000&&(!fno||quantity()%LOT_SIZE===0)&&Number.isFinite(rate())&&rate()>0&&(s.pricing==='Market'||Math.abs(rate()*20-Math.round(rate()*20))<.00001)&&(!s.stopType||Number(s.trigger)>0)&&(!s.stop||Number(s.stopPrice)>0)&&(!s.target||Number(s.targetPrice)>0);
 const pill=(group,items,current)=>`<div class="order-pills" role="group" aria-label="${group}">${items.map(v=>`<button type="button" data-group="${group}" data-value="${v}" aria-pressed="${current===v}">${v}</button>`).join('')}</div>`;
 const choice=(group,items,current)=>`<div class="order-choices" role="group" aria-label="${group}">${items.map(v=>`<button type="button" data-group="${group}" data-value="${v}" aria-pressed="${current===v}">${v}</button>`).join('')}</div>`;
 const stepper=(id,label,val,disabled=false)=>`<div class="order-stepper"><button type="button" data-step="${id}" data-delta="-1" aria-label="Decrease ${label.toLowerCase()}" ${disabled?'disabled':''}>${icon('minus')}</button><input id="order-${id}" aria-label="${label}" inputmode="${id==='price'||s.mode==='Amount'?'decimal':'numeric'}" value="${val}" autocomplete="off" ${disabled?'disabled':''}><button type="button" data-step="${id}" data-delta="1" aria-label="Increase ${label.toLowerCase()}" ${disabled?'disabled':''}>${icon('plus')}</button></div>`;
 function refresh(){
  const q=quantity(),r=rate();
  app.querySelector('#order-helper').textContent=fno?(s.mode==='Lots'?`Qty: ${q}`:`Lots: ${q/LOT_SIZE}`):s.mode==='Amount'?`Qty: ${Number.isFinite(q)?q:0}`:'';
  app.querySelector('#order-margin').textContent='₹'+number(Number.isFinite(q*r)?q*r:0);
  app.querySelector('#order-submit').disabled=!valid();
  const err=app.querySelector('#order-error');
  err.textContent=valid()?'':fno&&(!Number.isInteger(q/LOT_SIZE)||q<=0)?`Enter a quantity in multiples of ${LOT_SIZE}, or a whole number of lots.`:'Enter a valid quantity or amount and positive prices (limit price tick: ₹0.05).';
 }
 function draw(){
 pillObserver?.disconnect();
 const previousPills=new Map([...app.querySelectorAll('.order-pills')].map(group=>[group.getAttribute('aria-label'),group.querySelector('.order-pill-indicator')?.getBoundingClientRect()]));
 app.className='order-screen';
 app.innerHTML=`<div class="status">${icon('status')}</div>
 <header class="order-head"><div class="order-title"><a href="#watchlist" aria-label="Back to watchlist">${icon('back')}</a><h1>${instrument.name}</h1><label class="order-side"><select aria-label="Buy or sell"><option ${s.side==='BUY'?'selected':''}>BUY</option><option ${s.side==='SELL'?'selected':''}>SELL</option></select>${icon('chevron')}</label></div>
 <div class="order-exchanges" role="radiogroup" aria-label="Exchange">${(fno?['NFO','BFO']:['NSE','BSE']).map(ex=>`<label><input type="radio" name="order-exchange" value="${ex}" ${ex===s.exchange?'checked':''}><span>${ex}</span><span>${number(quote)}</span><span class="${instrument.direction}">(${signed(instrument.percent)}%)</span></label>`).join('')}</div>
 <nav class="order-tabs" aria-label="Order categories">${['Regular','Iceberg','AMO','GTT'].map(t=>`<button type="button" ${t==='Regular'?'aria-current="page"':''} data-category="${t}">${t}</button>`).join('')}</nav></header>
 <div class="order-body"><section class="order-fields" aria-label="Trade size and price"><div class="order-field"><div class="order-field-title"><span>Trade in</span>${pill('Trade in',fno?['Qty','Lots']:s.product==='Intraday'?['Qty']:['Qty','Amount'],s.mode)}</div>${stepper('size',s.mode==='Qty'?'Quantity':s.mode,value())}<p id="order-helper"></p></div>
 <div class="order-field"><div class="order-field-title"><span>Price <button class="order-price-help" aria-label="About price" type="button">${icon('price')}</button></span>${pill('Price type',['Limit','Market'],s.pricing)}</div>${stepper('price','Limit price',s.pricing==='Market'?'0.00':Number(s.price).toFixed(2),s.pricing==='Market')}<p class="order-tick" ${s.pricing==='Market'?'style="visibility:hidden"':''}>Tick: 0.05</p></div></section>
 <section class="order-product"><h2>Product Type</h2>${choice('Product type',['Delivery','Intraday'],s.product)}</section>
 <section class="order-type"><h2>Order Type</h2>${choice('Stop order type',['SL - L','SL - M'],s.stopType)}${s.stopType?`<label class="order-extra">Trigger price<input inputmode="decimal" aria-label="Trigger price" data-extra="trigger" value="${s.trigger}"></label>`:''}</section>
 <section class="order-protection">${[['stop','Add Stop Loss to'],['target','Add Target (Profit) to']].map(([key,text])=>`<div class="order-protection-row"><span>${text} ${s.side==='BUY'?'Sell':'Buy'}</span><button type="button" role="switch" aria-label="${text} ${s.side==='BUY'?'Sell':'Buy'}" aria-checked="${s[key]}" data-toggle="${key}"><span></span></button></div>${s[key]?`<label class="order-extra">${key==='stop'?'Stop loss':'Target'} price<input inputmode="decimal" aria-label="${key==='stop'?'Stop loss':'Target'} price" data-extra="${key}Price" value="${s[key+'Price']}"></label>`:''}`).join('')}</section>
 <button type="button" class="order-advanced" aria-expanded="${s.advanced}">Advanced ${icon('chevron')}</button>${s.advanced?`<label class="order-extra">Validity<select aria-label="Validity"><option ${s.validity==='DAY'?'selected':''}>DAY</option><option ${s.validity==='IOC'?'selected':''}>IOC</option></select></label>`:''}
 <p id="order-error" role="status"></p></div>
 <footer class="order-footer"><div class="order-funds"><div>Approx Margin <strong id="order-margin"></strong><button type="button" class="order-refresh" aria-label="Recalculate margin">${icon('refresh')}</button></div><div>Available <strong>₹4000.00</strong></div></div><button class="order-charges" type="button">Tax &amp; Charges</button>
 <button type="button" id="order-submit" class="order-swipe" aria-label="Place demo ${s.side.toLowerCase()} order"><span class="order-swipe-thumb">${icon('swipe')}</span><span>SWIPE TO ${s.side}</span></button></footer>
 <dialog id="order-dialog"></dialog><div class="toast" id="order-note" role="status" hidden></div>`;
 app.querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>{
  const v=b.dataset.value,g=b.dataset.group;
  if(g==='Trade in'&&v!==s.mode){const q=quantity();if(v==='Amount')s.amount=decimal(Number(s.units)*rate());else s.units=Number.isFinite(q)?q:0;s.mode=v;}
  if(g==='Product type'){if(v==='Intraday'&&!fno&&s.mode==='Amount'){s.units=quantity();s.mode='Qty';}s.product=v;}
  if(g==='Price type'){s.pricing=v;s.stopType='';}
  if(g==='Stop order type'){s.stopType=s.stopType===v?'':v;if(s.stopType)s.pricing=v==='SL - L'?'Limit':'Market';}
  draw();app.querySelector(`[data-group="${g}"][data-value="${v}"]`)?.focus();
 });
 app.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{const price=b.dataset.step==='price',delta=Number(b.dataset.delta);if(price)s.price=decimal(Math.max(.05,(Number(s.price)||0)+delta*.05));else if(s.mode==='Amount')s.amount=decimal(Math.max(0,(Number(s.amount)||0)+delta*rate()));else s.units=Math.max(fno?LOT_SIZE:1,(Number(s.units)||0)+delta*(fno?LOT_SIZE:1));app.querySelector(price?'#order-price':'#order-size').value=price?Number(s.price).toFixed(2):value();refresh();});
 app.querySelector('#order-size').oninput=e=>{const raw=e.target.value;const n=/^\d*(\.\d*)?$/.test(raw)&&raw!==''?Number(raw):NaN;if(s.mode==='Amount')s.amount=n;else s.units=s.mode==='Lots'?n*LOT_SIZE:n;refresh();};
 app.querySelector('#order-price').oninput=e=>{s.price=/^\d*(\.\d*)?$/.test(e.target.value)?Number(e.target.value):NaN;refresh();};
 app.querySelectorAll('[data-extra]').forEach(i=>i.oninput=()=>{s[i.dataset.extra]=i.value;refresh();});
 app.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{s[b.dataset.toggle]=!s[b.dataset.toggle];draw();app.querySelector(`[data-toggle="${b.dataset.toggle}"]`).focus();});
 app.querySelector('.order-advanced').onclick=()=>{s.advanced=!s.advanced;draw();app.querySelector('.order-advanced').focus();};
 app.querySelector('[aria-label="Validity"]')?.addEventListener('change',e=>s.validity=e.target.value);
 app.querySelector('[aria-label="Buy or sell"]').onchange=e=>{s.side=e.target.value;draw();};
 app.querySelectorAll('[name="order-exchange"]').forEach(r=>r.onchange=()=>s.exchange=r.value);
 app.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{if(b.dataset.category!=='Regular')note(b.dataset.category+' orders are not included in this demo.');});
 app.querySelector('.order-price-help').onclick=()=>note('Limit: choose a price in ₹0.05 steps. Market: use the demo quote.');
 app.querySelector('.order-refresh').onclick=()=>{refresh();note('Demo margin recalculated.');};
 app.querySelector('.order-charges').onclick=()=>note('Charges are not calculated in this demo. Margin shown is the estimated order value.');
 app.querySelectorAll('.order-pills').forEach(group=>{
  const selected=group.querySelector('[aria-pressed="true"]');
  const indicator=document.createElement('span');indicator.className='order-pill-indicator';indicator.setAttribute('aria-hidden','true');group.prepend(indicator);
  const container=group.getBoundingClientRect(),target=selected.getBoundingClientRect(),old=previousPills.get(group.getAttribute('aria-label'));
  const left=target.left-container.left,width=target.width;
  indicator.style.left=left+'px';indicator.style.width=width+'px';indicator.style.height=target.height+'px';
  if(old&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&(Math.abs(old.left-target.left)>.5||Math.abs(old.width-width)>.5)){
   indicator.animate([{left:(old.left-container.left)+'px',width:old.width+'px'},{left:left+'px',width:width+'px'}],{duration:240,easing:'cubic-bezier(.22,1,.36,1)'});
   group.closest('.order-field').querySelector('.order-stepper').animate([{opacity:.65},{opacity:1}],{duration:200,easing:'ease-out'});
  }
 });
 pillObserver=new ResizeObserver(entries=>{for(const {target:group} of entries){if(!group.isConnected){pillObserver.disconnect();return;}const selected=group.querySelector('[aria-pressed="true"]'),indicator=group.querySelector('.order-pill-indicator');indicator.style.left=selected.offsetLeft+'px';indicator.style.width=selected.offsetWidth+'px';indicator.style.height=selected.offsetHeight+'px';}});
 app.querySelectorAll('.order-pills').forEach(group=>pillObserver.observe(group));
 bindSwipe();refresh();
 }
 function note(text){const el=app.querySelector('#order-note');el.textContent=text;el.hidden=false;setTimeout(()=>el.hidden=true,3500);}
 function submit(){if(!valid())return;const dialog=app.querySelector('#order-dialog');dialog.innerHTML=`<h2>Demo order placed</h2><p>${s.side} ${quantity()} units of ${instrument.name}<br>${s.exchange} · ${s.product} · ${s.pricing}${s.stopType?' · '+s.stopType:''}<br>${s.pricing==='Market'?'At market price':'Limit ₹'+number(rate())}</p><p>No real order has been sent.</p><button class="primary" id="order-done">Back to watchlist</button><button id="order-again">Edit order</button>`;dialog.querySelector('#order-done').onclick=()=>{dialog.close();location.hash='watchlist';};dialog.querySelector('#order-again').onclick=()=>dialog.close();dialog.showModal();}
 function bindSwipe(){const button=app.querySelector('#order-submit');let start=null,travel=0;button.onpointerdown=e=>{if(button.disabled)return;start=e.clientX;travel=0;button.setPointerCapture(e.pointerId);};button.onpointermove=e=>{if(start===null)return;travel=Math.max(0,Math.min(175,e.clientX-start));button.style.setProperty('--swipe',travel+'px');};button.onpointerup=()=>{if(start===null)return;start=null;button.style.setProperty('--swipe','0px');if(travel>=145)submit();};button.onpointercancel=()=>{start=null;button.style.setProperty('--swipe','0px');};button.onclick=e=>{if(e.detail===0)submit();};}
 draw();
}
