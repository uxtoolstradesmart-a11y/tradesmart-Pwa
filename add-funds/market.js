import {quoteValues} from './quote-math.js';

// Fictional demonstration prices, not exchange quotes or historical snapshots.
const seeds=[
 ['nifty','NIFTY',24856.35,24768.20,'index'],
 ['banknifty','BANK NIFTY',54125.60,54302.85,'index'],
 ['sensex','SENSEX',81234.75,80985.40,'index'],
 ['hdfcbank','HDFCBANK-EQ',1768.40,1754.20,'stock'],
 ['reliance','RELIANCE-EQ',1392.65,1401.30,'stock'],
 ['bankbaroda','BANKBARODA-EQ',245.80,243.15,'stock'],
 ['tatamotors','TATA MOTORS',720.35,726.90,'stock'],
 ['tcs','TCS-EQ',3425.60,3398.75,'stock'],
 ['bbtc','BBTC-EQ',1842.25,1831.50,'stock'],
 ['infosys','INFY-EQ',1525.70,1538.40,'stock']
];
export const market=seeds.map(([id,name,price,close,kind])=>({id,name,kind,anchor:price,...quoteValues(price,close),tick:0}));
export const indices=market.filter(q=>q.kind==='index');
export const stocks=market.filter(q=>q.kind==='stock');
export const number=value=>value.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
export const signed=value=>(value>0?'+':value<0?'-':'')+number(Math.abs(value));
export function stepMarket(random=Math.random, quotes=market){
 const mood=(random()-.5)*.00018;
 for(const q of quotes){
  const volatility=q.kind==='index'?.00022:.00065;
  const move=q.price*(mood+(random()-.5)*volatility)+(q.anchor-q.price)*.025;
  const tickSize=.05;
  let next=Math.round((q.price+move)/tickSize)*tickSize;
  if(Math.abs(next-q.price)<.025)next=q.price+(random()>.5?tickSize:-tickSize);
  next=Math.max(q.anchor*.97,Math.min(q.anchor*1.03,next));
  const values=quoteValues(next,q.previousClose);
  q.tick=Math.sign(values.price-q.price);
  Object.assign(q,values);
 }
}
