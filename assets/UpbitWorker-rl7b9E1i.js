const c=[];for(let e=0;e<256;++e)c.push((e+256).toString(16).slice(1));function T(e,t=0){return(c[e[t+0]]+c[e[t+1]]+c[e[t+2]]+c[e[t+3]]+"-"+c[e[t+4]]+c[e[t+5]]+"-"+c[e[t+6]]+c[e[t+7]]+"-"+c[e[t+8]]+c[e[t+9]]+"-"+c[e[t+10]]+c[e[t+11]]+c[e[t+12]]+c[e[t+13]]+c[e[t+14]]+c[e[t+15]]).toLowerCase()}let l;const g=new Uint8Array(16);function U(){if(!l){if(typeof crypto>"u"||!crypto.getRandomValues)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");l=crypto.getRandomValues.bind(crypto)}return l(g)}const A=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto);var y={randomUUID:A};function b(e,t,n){var r;if(y.randomUUID&&!e)return y.randomUUID();e=e||{};const o=e.random??((r=e.rng)==null?void 0:r.call(e))??U();if(o.length<16)throw new Error("Random bytes length must be >= 16");return o[6]=o[6]&15|64,o[8]=o[8]&63|128,T(o)}async function h(){const e=encodeURIComponent("https://api.upbit.com/v1/market/all?isDetails=true"),t=await fetch(`https://proxy-server-flax-rho.vercel.app/api/proxy?url=${e}`),n=await t.json();if(t.status!==200)throw new Error("Failed to fetch symbols list");return n.filter(r=>r.market.startsWith("KRW-"))}async function _(e,t){if(t.length===0){console.error("No symbols available.");return}console.log(`Fetching open prices for ${t.length} symbols...`),t.forEach(n=>{e[n.market]={price:0,color:"#FFFFFF",openPrice:0}})}let p="";function I(e,t){e.forEach(n=>{const{symbol:o,price:r,openPrice:u}=m(n);if(t[o]){const S=f(t[o].openPrice,r);t[o].price=r,t[o].color=S,u&&(t[o].openPrice=u)}})}function m(e){if("s"in e&&"c"in e)return{symbol:e.s,price:parseFloat(e.c)};if("code"in e&&"trade_price"in e)return{symbol:e.code,price:e.trade_price,openPrice:e.opening_price};throw new Error("Unknown data type")}function f(e,t){let n="#FFFFFF";return e<t?n="#f75467":e>t&&(n="#4386f9"),n}async function B(){if(p.length===0)try{const e=await fetch("https://proxy-server-flax-rho.vercel.app/api/proxy?locale=find"),{country:t}=await e.json();return p=t,t==="US"}catch(e){return console.error("Failed to detect country from IP:",e),!1}else return p==="US"}function P(e,t){const n=[];for(let o=0;o<e.length;o+=t)n.push(e.slice(o,o+t));return n}async function w(e){const t=e.join(","),n=encodeURIComponent(`https://api.upbit.com/v1/ticker?markets=${t}`);return(await fetch(`https://proxy-server-flax-rho.vercel.app/api/proxy?url=${n}`)).json()}async function k(e){const t=P(e,100);return(await Promise.all(t.map(w))).flat()}const D="wss://api.upbit.com/websocket/v1/";var a=(e=>(e.UPBIT_SYMBOL_LIST="UPBIT_SYMBOL_LIST",e.UPBIT_SYMBOL_TRADE_DATA="UPBIT_SYMBOL_TRADE_DATA",e.UPBIT_SYMBOLS_RESTAPI_TRADE_DATA="UPBIT_SYMBOLS_RESTAPI_TRADE_DATA",e.BINANCE_SYMBOLS_DATA="BINANCE_SYMBOLS_DATA",e))(a||{});const i={};let s=null;const R=()=>{s=new WebSocket(`${D}ticker`),s.binaryType="arraybuffer",s.onopen=()=>{console.log("Connected"),(async()=>{const t=await h();self.postMessage({type:a.UPBIT_SYMBOL_LIST,data:t}),_(i,t).then(()=>{const n=[{ticket:b()},{type:"ticker",codes:Object.keys(i)}];s==null||s.send(JSON.stringify(n))})})()},s.onmessage=e=>{const n=new TextDecoder("utf-8").decode(e.data),o=JSON.parse(n);try{I([o],i)}catch(r){self.postMessage(`upbit 데이터 정리 오류: ${r}`)}self.postMessage({type:a.UPBIT_SYMBOL_TRADE_DATA,data:{...i[o.code],symbol:o.code}})},s.onclose=()=>{self.postMessage("연결 끊김")}},d=e=>{k(e).then(t=>{t.forEach(n=>{const o=i[n.market];o.openPrice=n.opening_price,o.price=n.trade_price,o.color=f(n.opening_price,n.trade_price)})}),self.postMessage({type:a.UPBIT_SYMBOLS_RESTAPI_TRADE_DATA,data:i})},L=(e,t=1e3)=>{d(e),setInterval(()=>{d(e)},t)},O=async()=>{if(await B())R();else{const t=await h();self.postMessage({type:a.UPBIT_SYMBOL_LIST,data:t}),await _(i,t);const n=Object.keys(i);L(n)}};O();
