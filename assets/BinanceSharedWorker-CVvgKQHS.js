(function(){"use strict";const p="wss://stream.binance.com:9443/ws/!ticker@arr",f="https://api.binance.com/api/v3";async function h(){try{const r=await(await fetch(`${f}/exchangeInfo`)).json();if(!r.symbols)throw new Error("Failed to fetch symbols list");return r.symbols.filter(o=>o.symbol.endsWith("USDT")&&o.status==="TRADING").map(o=>o.symbol)}catch(e){return console.error("Error fetching symbols list:",e),[]}}async function u(e){const r=`${f}/klines?symbol=${e}&interval=1d&limit=2`;try{const o=await(await fetch(r)).json();if(!Array.isArray(o)||o.length<2)throw new Error(`No sufficient data for ${e}`);const n=o.length>=2?o[1][1]:o[0][1],t=o.length>=2?o[1][4]:o[0][4];return{symbol:e,openPrice:n,curPrice:t}}catch(s){return console.error(`Error fetching data for ${e}:`,s),{symbol:e,openPrice:null,curPrice:null}}}async function y(e){const r=await h();if(r.length===0){console.error("No symbols available.");return}console.log(`Fetching open prices for ${r.length} symbols...`),(await Promise.all(r.map(u))).forEach(o=>{let n="#FFFFFF";const t=parseFloat(o.curPrice),l=parseFloat(o.openPrice);l<t?n="#f75467":l>t&&(n="#4386f9"),e[o.symbol]={price:t,color:n,openPrice:l}})}function g(e,r){e.forEach(s=>{const{symbol:o,price:n,openPrice:t}=b(s);if(r[o]){const l=d(r[o].openPrice,n);r[o].price=n,r[o].color=l,t&&(r[o].openPrice=t)}})}function b(e){if("s"in e&&"c"in e)return{symbol:e.s,price:parseFloat(e.c)};if("code"in e&&"trade_price"in e)return{symbol:e.code,price:e.trade_price,openPrice:e.opening_price};throw new Error("Unknown data type")}function d(e,r){let s="#FFFFFF";return e<r?s="#f75467":e>r&&(s="#4386f9"),s}const m=self,c=[],a={};let i=null;y(a);const w=()=>{i=new WebSocket(p),i.onmessage=e=>{const r=JSON.parse(e.data),s=Array.from(r).filter(o=>o.s.includes("USDT"));try{g(s,a)}catch(o){c.forEach(n=>{n.postMessage(`데이터 정리 오류: ${o}`)})}c.forEach(o=>{o.postMessage({type:"symbolData",data:a})})},i.onclose=()=>{c.forEach(e=>{e.postMessage("연결 끊김")})}};m.onconnect=e=>{const r=e.ports[0];c.push(r),r.onmessage=s=>{console.log("Received from client:",s.data)},Object.keys(a).length>0&&r.postMessage({type:"symbolData",data:a}),c.forEach(s=>{s.postMessage("유저가 추가됨")}),r.start()},w()})();
