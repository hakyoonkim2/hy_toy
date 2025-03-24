function u(e,s){e.forEach(r=>{const{symbol:t,price:o,openPrice:n}=b(r);if(s[t]){const c=d(s[t].openPrice,o);s[t].price=o,s[t].color=c,n&&(s[t].openPrice=n)}})}function b(e){if("s"in e&&"c"in e)return{symbol:e.s,price:parseFloat(e.c)};if("code"in e&&"trade_price"in e)return{symbol:e.code,price:e.trade_price,openPrice:e.opening_price};throw new Error("Unknown data type")}function d(e,s){let r="#FFFFFF";return e<s?r="#f75467":e>s&&(r="#4386f9"),r}async function f(){try{const e=await fetch("https://ipapi.co/json/"),{country_code:s}=await e.json();return s!=="US"}catch(e){return console.error("Failed to detect country from IP:",e),!1}}const w="wss://stream.binance.com:9443/ws/!ticker@arr",y="https://api.binance.com/api/v3",h="https://api.binance.us/api/v3";async function g(){try{const e=await f(),r=await(await fetch(`${e?y:h}/exchangeInfo`)).json();if(!r.symbols)throw new Error("Failed to fetch symbols list");return r.symbols.filter(o=>o.symbol.endsWith("USDT")&&o.status==="TRADING").map(o=>o.symbol)}catch(e){return console.error("Error fetching symbols list:",e),[]}}async function m(e){const r=`${await f()?y:h}/klines?symbol=${e}&interval=1d&limit=2`;try{const o=await(await fetch(r)).json();if(!Array.isArray(o)||o.length<2)throw new Error(`No sufficient data for ${e}`);const n=o.length>=2?o[1][1]:o[0][1],c=o.length>=2?o[1][4]:o[0][4];return{symbol:e,openPrice:n,curPrice:c}}catch(t){return console.error(`Error fetching data for ${e}:`,t),{symbol:e,openPrice:null,curPrice:null}}}async function F(e){const s=await g();if(s.length===0){console.error("No symbols available.");return}console.log(`Fetching open prices for ${s.length} symbols...`),(await Promise.all(s.map(m))).forEach(t=>{let o="#FFFFFF";const n=parseFloat(t.curPrice),c=parseFloat(t.openPrice);c<n?o="#f75467":c>n&&(o="#4386f9"),e[t.symbol]={price:n,color:o,openPrice:c}})}const P=self,a=[],i={};let l=null;F(i);const p=e=>{l=new WebSocket(e??w),l.onmessage=s=>{const r=JSON.parse(s.data),t=Array.from(r).filter(o=>o.s.includes("USDT"));try{u(t,i)}catch(o){a.forEach(n=>{n.postMessage(`데이터 정리 오류: ${o}`)})}a.forEach(o=>{o.postMessage({type:"symbolData",data:i})})},l.onclose=()=>{a.forEach(s=>{s.postMessage("연결 끊김")})}};P.onconnect=e=>{const s=e.ports[0];a.push(s),s.onmessage=r=>{console.log("Received from client:",r.data)},Object.keys(i).length>0&&s.postMessage({type:"symbolData",data:i}),a.forEach(r=>{r.postMessage("Binance shared worker 유저가 추가됨")}),s.start()};const E=async()=>{await f()?p():p("wss://stream.binance.us:9443/ws/!ticker@arr")};E();
