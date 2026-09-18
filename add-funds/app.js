import {market,indices,stocks,number,signed,stepMarket} from './market.js';
const app = document.querySelector('#app');
const asset=(name,ext='svg')=>`./assets/${name}.${ext}`;
const pic=(name,cls='icon',ext='svg')=>`<img class="${cls}" src="${asset(name,ext)}" alt="">`;
const apps=[['Google Pay','gpay','png'],['PhonePe','options-imgPhonepeIcon1','svg'],['Paytm','options-imgGroup','svg'],['BHIM UPI','options-imgFrame2147238136','svg'],['UPI ID / Number',null,null]];
let state={amount:'1000',selected:0,method:'upi',expanded:false,upi:'',preset:100};
const status=()=>`<div class="status">${pic('pay-imgPhoneUi','')}</div>`;
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function start(amount=1000){state={amount:String(amount),selected:0,method:'upi',expanded:false,upi:'',preset:state.preset};location.hash='add-funds';render();window.scrollTo(0,0);}
function choose(index){if(!Number.isInteger(index)||index<0||index>=apps.length)throw Error('Unknown payment option');state.selected=index;state.method='upi';state.expanded=false;render();document.querySelector('#more')?.focus();}
function dashboard(){
app.className='dashboard-screen';
app.innerHTML=`<div class="status">${pic('dash-imgPhoneUi','')}</div>
<header class="dash-head">${pic('dash-imgLogoIcon','logo')}<div class="profile"><strong>ADITYA KUMAR</strong><p>ID : <b>ABC123</b></p></div><div class="head-icons">${pic('dash-imgIcon')}${pic('dash-imgIndices')}<span class="notification">${pic('dash-imgBellSolid1')}<span>2</span></span></div></header>
<div class="dashboard">
<div class="indices">${indices.map(q=>`<div class="index" data-market="${q.id}"><div>${q.name}</div><div class="quote"><b data-price>${number(q.price)}</b><span data-change class="${q.direction}">${signed(q.change)} (${signed(q.percent)}%)</span></div></div>`).join('')}</div>${marketStatus()}
<section class="activation"><div class="activation-heading">${pic('dash-imgFrame')}<div><strong>Your Account Activation is in progress...</strong><p>Usually done in 1-2 business days .</p></div></div><div class="steps"><div class="step">${pic('dash-imgComponent6')}<div>e-Sign Completed<small>14 Nov, 11:37 AM</small></div></div><div class="step">${pic('dash-imgComponent7')}<div>KYC Verification</div></div><div class="step">${pic('dash-imgComponent8')}<div>Exchange Approval</div></div></div></section>
<section class="feature"><div class="feature-top"><div class="feature-copy"><span class="featured">FEATURED</span><h2>Trailing Stop Loss</h2><p>Protect profits. Limit losses.</p><ul><li>${pic('dash-imgSvg')}Automated risk management</li><li>${pic('dash-imgSvg')}Lock in profits as market moves</li></ul></div><img class="chart" src="./assets/chart.png" alt="Trailing stop loss chart"></div><button class="primary" data-outside>Try Trailing Stop Loss ${pic('dash-imgFrame1')}</button></section>
<div class="dots" aria-label="Featured card 2 of 2"><span></span><span></span></div>
<section class="fund-card" aria-label="Add funds"><img class="safe" src="./assets/fund-art.png" alt=""><div class="fund-content"><h2>Get ready to Trade!</h2><p>Add funds now, trade the moment your account is live!</p><div class="presets">${[100,200,500].map(v=>`<button data-preset="${v}" aria-pressed="${v===state.preset}" class="${v===state.preset?'active':''}">₹${v}</button>`).join('')}</div><button class="primary" id="start">Add Funds Now ${pic('dash-imgFrame2')}</button></div></section>
<section class="links">${[['Top Traded Options','options-icon','png'],['Top Traded Futures','dash-imgRiStockFill','svg'],['IPOs','ipo-icon','png'],['Scanners','dash-imgStreamlineGraphBarIncrease','svg'],['Scalper','dash-imgGrommetIconsLineChart','svg'],['Movers','dash-imgChartColumnSolid1','svg']].map(([name,icon,ext])=>`<button class="tile" data-outside>${pic(icon,'icon',ext)}<span>${name}</span>${pic('dash-imgChevronDown','chevron')}</button>`).join('')}</section></div>
<nav class="nav" aria-label="Main navigation">${[['Home','dash-imgHome1'],['Watchlist','dash-imgBinocularsSolid1'],['Portfolio','dash-imgEpSuitcaseLine'],['Orders','dash-imgFileText1'],['Menu','dash-imgMenu1']].map(([n,i])=>`<a href="${n==='Watchlist'?'#watchlist':'#'}" ${n==='Home'?'aria-current="page"':''}>${pic(i)}${n}</a>`).join('')}</nav><div class="toast" id="scope-note" role="status" hidden>Available in the full app. This prototype focuses on Add funds.</div>`;
bindMarketControls();
document.querySelector('#start').onclick=()=>start(state.preset);
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{state.preset=Number(b.dataset.preset);dashboard();});
document.querySelectorAll('[data-outside]').forEach(b=>b.onclick=()=>{const note=document.querySelector('#scope-note');note.hidden=false;setTimeout(()=>note.hidden=true,3000);});
}
const watchState={tab:0,query:'',sort:'default',tabs:['1','3','Buy on 5th','Buy NOW','WXYZ']};
const watchQuotes=stocks;
let marketPaused=false;
let marketTimer=null;
let lastMarketUpdate=new Date();
function marketTime(){return lastMarketUpdate.toLocaleTimeString('en-GB',{hour12:false,timeZone:'Asia/Kolkata'})+' IST';}
function marketStatus(){return `<div class="market-status"><span><i aria-hidden="true"></i>Demo prices · <span data-market-time>${marketPaused?'Paused':marketTime()}</span></span><button type="button" id="market-pause" aria-label="${marketPaused?'Resume':'Pause'} simulated prices" aria-pressed="${marketPaused}">${marketPaused?'Resume':'Pause'}</button></div>`;}
function bindMarketControls(){document.querySelector('#market-pause').onclick=()=>{marketPaused=!marketPaused;const b=document.querySelector('#market-pause');b.textContent=marketPaused?'Resume':'Pause';b.setAttribute('aria-label',(marketPaused?'Resume':'Pause')+' simulated prices');b.setAttribute('aria-pressed',String(marketPaused));document.querySelector('[data-market-time]').textContent=marketPaused?'Paused':marketTime();syncMarketTimer();};}
function syncMarketTimer(){
 clearInterval(marketTimer);marketTimer=null;
 if(marketPaused||document.hidden||location.hash==='#add-funds')return;
 marketTimer=setInterval(()=>{
  stepMarket();lastMarketUpdate=new Date();
  if(location.hash==='#watchlist'&&['gainers','losers'].includes(watchState.sort))renderWatchQuotes();
  updateMarketDOM();
 },2200);
}
function updateMarketDOM(){
 document.querySelectorAll('[data-market]').forEach(el=>{
  const q=market.find(q=>q.id===el.dataset.market);
  const price=el.querySelector('[data-price]');
  price.textContent=number(q.price);
  const change=el.querySelector('[data-change]');
  change.className=q.direction;
  if(el.classList.contains('watch-index')){
   change.children[0].textContent=signed(q.change);
   change.children[1].textContent=signed(q.percent)+'%';
  }else change.textContent=signed(q.change)+' ('+signed(q.percent)+'%)';
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&q.tick){
   price.getAnimations().forEach(a=>a.cancel());
   price.animate([{backgroundColor:q.tick>0?'#079a8026':'#f0374526',color:q.tick>0?'#079a80':'#f03745'},{backgroundColor:'transparent',color:'#1a1a1a'}],{duration:850,easing:'ease-out'});
  }
 });
 const time=document.querySelector('[data-market-time]');if(time)time.textContent=marketTime();
}

function watchlist(){
 app.className='watchlist-screen';
 app.innerHTML=`<div class="status">${pic('watch-status','')}</div>
 <header class="watch-search-header"><label class="watch-search">${pic('watch-ellipse','search-disc')}${pic('watch-search')}<input id="watch-search" aria-label="Search Scrip & Trade" placeholder="Search Scrip & Trade" value="${escapeHtml(watchState.query)}"></label><button class="watch-chart" aria-label="Scroll market indices">${pic('watch-chart')}</button></header>
 <section class="watch-indices" aria-label="Market indices">${indices.map(q=>`<div class="watch-index" data-market="${q.id}"><strong>${q.name}</strong><span data-price>${number(q.price)}</span><div data-change class="${q.direction}"><span>${signed(q.change)}</span><span>${signed(q.percent)}%</span></div></div>`).join('')}<button class="watch-index-more" aria-label="Back to first index">${pic('watch-indices')}</button></section>
 <div class="watch-controls"><div class="watch-tabs" role="tablist" aria-label="Watchlists">${watchState.tabs.map((name,i)=>`<button role="tab" aria-selected="${i===watchState.tab}" aria-controls="watch-quotes" data-watch-tab="${i}" class="${i===watchState.tab?'active':''}">${escapeHtml(name)}</button>`).join('')}</div><div class="watch-tools"><button id="watch-add" aria-label="Add watchlist">${pic('watch-plus')}</button><button id="watch-filter" aria-label="Sort watchlist">${pic('watch-filters')}</button></div></div>
 <section id="watch-quotes" class="watch-quotes" role="tabpanel" aria-label="Watchlist ${escapeHtml(watchState.tabs[watchState.tab])}"></section>${marketStatus()}
 <nav class="nav watch-nav" aria-label="Main navigation">${[['Home','home'],['Watchlist','watchlist'],['Portfolio','portfolio'],['Orders','orders'],['Menu','menu']].map(([name,icon])=>`<button ${name==='Watchlist'?'aria-current="page"':''} data-watch-nav="${name}">${pic('watch-'+icon)}<span>${name}</span></button>`).join('')}</nav>
 <dialog id="watch-dialog"></dialog><div class="toast" id="watch-note" role="status" hidden></div>`;
 renderWatchQuotes();
 bindMarketControls();
 document.querySelector('#watch-search').oninput=e=>{watchState.query=e.target.value;renderWatchQuotes();};
 document.querySelectorAll('[data-watch-tab]').forEach(b=>b.onclick=()=>{watchState.tab=Number(b.dataset.watchTab);document.querySelectorAll('[data-watch-tab]').forEach(t=>{const selected=t===b;t.classList.toggle('active',selected);t.setAttribute('aria-selected',selected);});document.querySelector('#watch-quotes').setAttribute('aria-label','Watchlist '+watchState.tabs[watchState.tab]);renderWatchQuotes();});
 document.querySelectorAll('[data-watch-nav]').forEach(b=>b.onclick=()=>{if(b.dataset.watchNav==='Home')location.hash='';else if(b.dataset.watchNav!=='Watchlist'){const note=document.querySelector('#watch-note');note.textContent=b.dataset.watchNav+' is available in the full app.';note.hidden=false;setTimeout(()=>note.hidden=true,3000);}});
 document.querySelector('.watch-chart').onclick=()=>document.querySelector('.watch-indices').scrollBy({left:159,behavior:'smooth'});
 document.querySelector('.watch-index-more').onclick=()=>document.querySelector('.watch-indices').scrollTo({left:0,behavior:'smooth'});
 document.querySelector('#watch-add').onclick=()=>{const dialog=document.querySelector('#watch-dialog');dialog.innerHTML='<form method="dialog"><h2>Add watchlist</h2><label for="watch-name">Watchlist name</label><input id="watch-name" maxlength="24" required autocomplete="off"><button class="primary" type="submit">Create watchlist</button><button type="button" id="watch-cancel">Cancel</button></form>';dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const name=dialog.querySelector('input').value.trim();if(!name)return;watchState.tabs.push(name);watchState.tab=watchState.tabs.length-1;dialog.close();watchlist();document.querySelector('[aria-selected="true"]').scrollIntoView({block:'nearest',inline:'nearest'});};dialog.querySelector('#watch-cancel').onclick=()=>dialog.close();dialog.showModal();};
 document.querySelector('#watch-filter').onclick=()=>{const dialog=document.querySelector('#watch-dialog');dialog.innerHTML=`<form method="dialog"><h2>Sort watchlist</h2><label for="watch-sort">Order</label><select id="watch-sort"><option value="default">Default order</option><option value="name">Name A–Z</option><option value="gainers">Gainers first</option><option value="losers">Losers first</option></select><button class="primary">Apply</button><button type="button" id="watch-cancel">Cancel</button></form>`;dialog.querySelector('select').value=watchState.sort;dialog.querySelector('form').onsubmit=()=>{watchState.sort=dialog.querySelector('select').value;renderWatchQuotes();};dialog.querySelector('#watch-cancel').onclick=()=>dialog.close();dialog.showModal();};
}
function renderWatchQuotes(){
 let rows=watchState.tab<5?[...watchQuotes]:[];
 rows=rows.filter(q=>q.name.toLowerCase().includes(watchState.query.toLowerCase().trim()));
 if(watchState.sort==='name')rows.sort((a,b)=>a.name.localeCompare(b.name));
 if(watchState.sort==='gainers')rows.sort((a,b)=>b.percent-a.percent);
 if(watchState.sort==='losers')rows.sort((a,b)=>a.percent-b.percent);
 document.querySelector('#watch-quotes').innerHTML=rows.map(q=>`<div class="watch-row" data-market="${q.id}"><div class="watch-symbol"><span>${q.name}</span><small>NSE</small></div><div class="watch-value"><strong data-price>${number(q.price)}</strong><small data-change class="${q.direction}">${signed(q.change)} (${signed(q.percent)}%)</small></div></div>`).join('')||'<p class="watch-empty">'+(watchState.tab>=5?'Your new watchlist is empty.':'No matching scrips.')+'</p>';
}

function valid(){return /^\d+(\.\d{1,2})?$/.test(state.amount)&&Number(state.amount)>0&&Number(state.amount)<=10000000&&(state.method!=='upi'||state.selected!==4||/^(?:[a-zA-Z0-9._-]{2,}@[a-zA-Z][a-zA-Z0-9.-]{1,}|[6-9]\d{9})$/.test(state.upi.trim()));}
function updateValidity(){document.querySelector('#submit').disabled=state.expanded||!valid();}
function payin(){app.className="pay-screen";const selected=apps[state.selected];app.innerHTML=status()+`<header class="top"><div class="title"><button id="back" aria-label="Back to dashboard">${pic('pay-imgBack')}</button>PAYIN</div><div class="identity"><span>Neha Singhania</span><span>YMHS999999</span></div></header><form class="pay" id="pay-form"><div class="amount"><label for="amount">Enter Amount</label><div class="amount-entry"><span>₹</span><input id="amount" aria-label="Amount in rupees" inputmode="decimal" autocomplete="off" value="${escapeHtml(state.amount)}" maxlength="11" required></div></div><div class="quick">${[1000,5000,10000,15000].map(v=>`<button type="button" data-add="${v}">+${v}</button>`).join('')}</div><section class="bank"><label for="bank">Bank Account</label><div class="bank-select"><select id="bank"><option>ICICI Bank Ltd - XXXX 5080</option></select>${pic('pay-imgFrame')}</div><p>Add another bank account from <button class="link" type="button" id="box">BOX</button></p><p id="bank-note" hidden>Bank account management is available in the full app.</p></section><section class="methods"><p>Choose Payment method</p><div class="method ${state.method==='upi'?'selected':''}"><button class="method-heading" type="button" id="upi-method" aria-pressed="${state.method==='upi'}">${pic('pay-imgFrame1')}UPI app <span class="badge">${pic('pay-imgFrame2')}Free &amp; Fastest</span></button>${state.method==='upi'?`<div class="selection"><button class="selection-row" id="more" type="button" aria-label="More Options" aria-expanded="${state.expanded}" aria-controls="picker"><span class="selected-name ${state.selected===4?'is-upi-id':''}">${selected[1]?pic(selected[1],'',selected[2]):''}${selected[0]}</span><span class="more">More Options${pic('pay-imgVector2','')}</span></button>${state.selected===4?`<input class="upi-input" id="upi-id" aria-label="UPI ID or mobile number" placeholder="example@okhdfcbank" value="${escapeHtml(state.upi)}" autocomplete="off"><p class="error" id="upi-error" hidden>Enter a valid UPI ID or 10-digit mobile number.</p>`:''}</div><div class="picker" id="picker" ${!state.expanded?'hidden':''}><h3>Choose your UPI app</h3><div class="options" role="radiogroup" aria-label="UPI payment option">${apps.map(([name,icon,ext],i)=>`<label class="option"><input type="radio" name="payment-app" value="${i}" ${state.selected===i?'checked':''}>${icon?pic(icon,'',ext):''}${i===4?'Pay with ':''}${name}</label>`).join('')}</div></div>`:''}</div><div class="method ${state.method==='bank'?'selected':''}"><button class="method-heading" type="button" id="net-method" aria-pressed="${state.method==='bank'}">${pic('pay-imgFrame3')}<span>Net banking <span class="fee">(₹8 + GST)</span></span></button></div></section><div class="footer"><button class="primary" id="submit" type="submit">ADD FUNDS</button></div></form>`;
document.querySelector('#back').onclick=()=>{location.hash='';};
const input=document.querySelector('#amount');input.style.width=Math.min(Math.max(state.amount.length,2),9)+'ch';
input.oninput=()=>{state.amount=input.value;input.style.width=Math.min(Math.max(input.value.length,2),9)+'ch';updateValidity();};
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{state.amount=String(Math.round(((Number(state.amount)||0)+Number(b.dataset.add))*100)/100);payin();});
document.querySelector('#box').onclick=()=>document.querySelector('#bank-note').hidden=false;
document.querySelector('#upi-method').onclick=()=>{state.method='upi';render();};
document.querySelector('#net-method').onclick=()=>{state.method='bank';state.expanded=false;render();};
document.querySelector('#more')?.addEventListener('click',()=>{
  state.expanded=!state.expanded;
  render();
  document.querySelector('#more').focus({preventScroll:true});
  if(state.expanded)requestAnimationFrame(()=>{
    if(!state.expanded)return;
    const methods=document.querySelector('.methods');
    const footer=document.querySelector('.footer');
    if(!methods||!footer)return;
    const bottom=methods.getBoundingClientRect().bottom;
    const visibleBottom=footer.getBoundingClientRect().top-16;
    if(bottom>visibleBottom)window.scrollBy({top:bottom-visibleBottom,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
});
document.querySelectorAll('[name="payment-app"]').forEach(r=>r.onchange=()=>choose(Number(r.value)));
const upi=document.querySelector('#upi-id');if(upi){upi.oninput=()=>{state.upi=upi.value;document.querySelector('#upi-error').hidden=true;updateValidity();};upi.onblur=()=>{document.querySelector('#upi-error').hidden=!state.upi||valid();};}
document.querySelector('#pay-form').onsubmit=e=>{e.preventDefault();if(!valid()||state.expanded)return;document.querySelector('#receipt').textContent=`₹${Number(state.amount).toLocaleString('en-IN',{maximumFractionDigits:2})} via ${state.method==='bank'?'Net banking':state.selected===4?state.upi:apps[state.selected][0]}.`;document.querySelector('#confirmation').showModal();};
updateValidity();}
function render(){location.hash==='#add-funds'?payin():location.hash==='#watchlist'?watchlist():dashboard();syncMarketTimer();}
document.addEventListener('visibilitychange',syncMarketTimer);
window.addEventListener('pagehide',()=>{clearInterval(marketTimer);marketTimer=null;});
window.addEventListener('pageshow',syncMarketTimer);
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.expanded){state.expanded=false;render();document.querySelector('#more')?.focus();}});
document.querySelector('#done').onclick=()=>{document.querySelector('#confirmation').close();location.hash='';};
document.querySelector('#again').onclick=()=>{document.querySelector('#confirmation').close();start();};
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(console.error);
if(document.modelContext?.registerTool)Promise.resolve(document.modelContext.registerTool({name:'start_add_funds',description:'Open the test Add funds screen. Does not transfer money.',inputSchema:{type:'object',properties:{amount:{type:'number',minimum:1,maximum:10000000}},required:['amount'],additionalProperties:false},annotations:{readOnlyHint:false},execute:({amount})=>{if(!Number.isFinite(amount)||amount<1||amount>10000000)throw Error('Invalid amount');start(amount);return {screen:'add-funds',amount,paymentApp:'Google Pay'};}})).catch(console.error);
render();
