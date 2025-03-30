var X=t=>{throw TypeError(t)};var z=(t,e,s)=>e.has(t)||X("Cannot "+s);var i=(t,e,s)=>(z(t,e,"read from private field"),s?s.call(t):e.get(t)),b=(t,e,s)=>e.has(t)?X("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,s),y=(t,e,s,r)=>(z(t,e,"write to private field"),r?r.call(t,s):e.set(t,s),s),U=(t,e,s)=>(z(t,e,"access private method"),s);import{r as T,j as oe}from"./index-Cq4qFegm.js";var ue=class{constructor(){this.listeners=new Set,this.subscribe=this.subscribe.bind(this)}subscribe(t){return this.listeners.add(t),this.onSubscribe(),()=>{this.listeners.delete(t),this.onUnsubscribe()}}hasListeners(){return this.listeners.size>0}onSubscribe(){}onUnsubscribe(){}},H=typeof window>"u"||"Deno"in globalThis;function ee(){}function xe(t,e){return typeof t=="function"?t(e):t}function me(t){return typeof t=="number"&&t>=0&&t!==1/0}function be(t,e){return Math.max(t+(e||0)-Date.now(),0)}function Ke(t,e){return typeof t=="function"?t(e):t}function Se(t,e){return typeof t=="function"?t(e):t}function We(t,e){const{type:s="all",exact:r,fetchStatus:n,predicate:o,queryKey:l,stale:a}=t;if(l){if(r){if(e.queryHash!==ve(l,e.options))return!1}else if(!Z(e.queryKey,l))return!1}if(s!=="all"){const f=e.isActive();if(s==="active"&&!f||s==="inactive"&&f)return!1}return!(typeof a=="boolean"&&e.isStale()!==a||n&&n!==e.state.fetchStatus||o&&!o(e))}function Ne(t,e){const{exact:s,status:r,predicate:n,mutationKey:o}=t;if(o){if(!e.options.mutationKey)return!1;if(s){if(V(e.options.mutationKey)!==V(o))return!1}else if(!Z(e.options.mutationKey,o))return!1}return!(r&&e.state.status!==r||n&&!n(e))}function ve(t,e){return((e==null?void 0:e.queryKeyHashFn)||V)(t)}function V(t){return JSON.stringify(t,(e,s)=>J(s)?Object.keys(s).sort().reduce((r,n)=>(r[n]=s[n],r),{}):s)}function Z(t,e){return t===e?!0:typeof t!=typeof e?!1:t&&e&&typeof t=="object"&&typeof e=="object"?!Object.keys(e).some(s=>!Z(t[s],e[s])):!1}function ce(t,e){if(t===e)return t;const s=te(t)&&te(e);if(s||J(t)&&J(e)){const r=s?t:Object.keys(t),n=r.length,o=s?e:Object.keys(e),l=o.length,a=s?[]:{};let f=0;for(let w=0;w<l;w++){const h=s?w:o[w];(!s&&r.includes(h)||s)&&t[h]===void 0&&e[h]===void 0?(a[h]=void 0,f++):(a[h]=ce(t[h],e[h]),a[h]===t[h]&&t[h]!==void 0&&f++)}return n===l&&f===n?t:a}return e}function Qe(t,e){if(!e||Object.keys(t).length!==Object.keys(e).length)return!1;for(const s in t)if(t[s]!==e[s])return!1;return!0}function te(t){return Array.isArray(t)&&t.length===Object.keys(t).length}function J(t){if(!se(t))return!1;const e=t.constructor;if(e===void 0)return!0;const s=e.prototype;return!(!se(s)||!s.hasOwnProperty("isPrototypeOf")||Object.getPrototypeOf(t)!==Object.prototype)}function se(t){return Object.prototype.toString.call(t)==="[object Object]"}function we(t){return new Promise(e=>{setTimeout(e,t)})}function Ce(t,e,s){return typeof s.structuralSharing=="function"?s.structuralSharing(t,e):s.structuralSharing!==!1?ce(t,e):e}function Ye(t,e,s=0){const r=[...t,e];return s&&r.length>s?r.slice(1):r}function Ge(t,e,s=0){const r=[e,...t];return s&&r.length>s?r.slice(0,-1):r}var le=Symbol();function Te(t,e){return!t.queryFn&&(e!=null&&e.initialPromise)?()=>e.initialPromise:!t.queryFn||t.queryFn===le?()=>Promise.reject(new Error(`Missing queryFn: '${t.queryHash}'`)):t.queryFn}var P,L,I,re,Ae=(re=class extends ue{constructor(){super();b(this,P);b(this,L);b(this,I);y(this,I,e=>{if(!H&&window.addEventListener){const s=()=>e();return window.addEventListener("visibilitychange",s,!1),()=>{window.removeEventListener("visibilitychange",s)}}})}onSubscribe(){i(this,L)||this.setEventListener(i(this,I))}onUnsubscribe(){var e;this.hasListeners()||((e=i(this,L))==null||e.call(this),y(this,L,void 0))}setEventListener(e){var s;y(this,I,e),(s=i(this,L))==null||s.call(this),y(this,L,e(r=>{typeof r=="boolean"?this.setFocused(r):this.onFocus()}))}setFocused(e){i(this,P)!==e&&(y(this,P,e),this.onFocus())}onFocus(){const e=this.isFocused();this.listeners.forEach(s=>{s(e)})}isFocused(){var e;return typeof i(this,P)=="boolean"?i(this,P):((e=globalThis.document)==null?void 0:e.visibilityState)!=="hidden"}},P=new WeakMap,L=new WeakMap,I=new WeakMap,re),De=new Ae,B,O,q,ne,Ee=(ne=class extends ue{constructor(){super();b(this,B,!0);b(this,O);b(this,q);y(this,q,e=>{if(!H&&window.addEventListener){const s=()=>e(!0),r=()=>e(!1);return window.addEventListener("online",s,!1),window.addEventListener("offline",r,!1),()=>{window.removeEventListener("online",s),window.removeEventListener("offline",r)}}})}onSubscribe(){i(this,O)||this.setEventListener(i(this,q))}onUnsubscribe(){var e;this.hasListeners()||((e=i(this,O))==null||e.call(this),y(this,O,void 0))}setEventListener(e){var s;y(this,q,e),(s=i(this,O))==null||s.call(this),y(this,O,e(this.setOnline.bind(this)))}setOnline(e){i(this,B)!==e&&(y(this,B,e),this.listeners.forEach(r=>{r(e)}))}isOnline(){return i(this,B)}},B=new WeakMap,O=new WeakMap,q=new WeakMap,ne),he=new Ee;function ke(){let t,e;const s=new Promise((n,o)=>{t=n,e=o});s.status="pending",s.catch(()=>{});function r(n){Object.assign(s,n),delete s.resolve,delete s.reject}return s.resolve=n=>{r({status:"fulfilled",value:n}),t(n)},s.reject=n=>{r({status:"rejected",reason:n}),e(n)},s}function Fe(t){return Math.min(1e3*2**t,3e4)}function fe(t){return(t??"online")==="online"?he.isOnline():!0}var de=class extends Error{constructor(t){super("CancelledError"),this.revert=t==null?void 0:t.revert,this.silent=t==null?void 0:t.silent}};function $(t){return t instanceof de}function ge(t){let e=!1,s=0,r=!1,n;const o=ke(),l=c=>{var m;r||(d(new de(c)),(m=t.abort)==null||m.call(t))},a=()=>{e=!0},f=()=>{e=!1},w=()=>De.isFocused()&&(t.networkMode==="always"||he.isOnline())&&t.canRun(),h=()=>fe(t.networkMode)&&t.canRun(),u=c=>{var m;r||(r=!0,(m=t.onSuccess)==null||m.call(t,c),n==null||n(),o.resolve(c))},d=c=>{var m;r||(r=!0,(m=t.onError)==null||m.call(t,c),n==null||n(),o.reject(c))},E=()=>new Promise(c=>{var m;n=k=>{(r||w())&&c(k)},(m=t.onPause)==null||m.call(t)}).then(()=>{var c;n=void 0,r||(c=t.onContinue)==null||c.call(t)}),A=()=>{if(r)return;let c;const m=s===0?t.initialPromise:void 0;try{c=m??t.fn()}catch(k){c=Promise.reject(k)}Promise.resolve(c).then(u).catch(k=>{var g;if(r)return;const v=t.retry??(H?0:3),C=t.retryDelay??Fe,W=typeof C=="function"?C(s,k):C,p=v===!0||typeof v=="number"&&s<v||typeof v=="function"&&v(s,k);if(e||!p){d(k);return}s++,(g=t.onFail)==null||g.call(t,s,k),we(W).then(()=>w()?void 0:E()).then(()=>{e?d(k):A()})})};return{promise:o,cancel:l,continue:()=>(n==null||n(),o),cancelRetry:a,continueRetry:f,canStart:h,start:()=>(h()?A():E().then(A),o)}}var Ue=t=>setTimeout(t,0);function Re(){let t=[],e=0,s=a=>{a()},r=a=>{a()},n=Ue;const o=a=>{e?t.push(a):n(()=>{s(a)})},l=()=>{const a=t;t=[],a.length&&n(()=>{r(()=>{a.forEach(f=>{s(f)})})})};return{batch:a=>{let f;e++;try{f=a()}finally{e--,e||l()}return f},batchCalls:a=>(...f)=>{o(()=>{a(...f)})},schedule:o,setNotifyFunction:a=>{s=a},setBatchNotifyFunction:a=>{r=a},setScheduler:a=>{n=a}}}var Le=Re(),j,ie,Oe=(ie=class{constructor(){b(this,j)}destroy(){this.clearGcTimeout()}scheduleGc(){this.clearGcTimeout(),me(this.gcTime)&&y(this,j,setTimeout(()=>{this.optionalRemove()},this.gcTime))}updateGcTime(t){this.gcTime=Math.max(this.gcTime||0,t??(H?1/0:5*60*1e3))}clearGcTimeout(){i(this,j)&&(clearTimeout(i(this,j)),y(this,j,void 0))}},j=new WeakMap,ie),x,K,D,_,S,Y,M,F,R,ae,He=(ae=class extends Oe{constructor(e){super();b(this,F);b(this,x);b(this,K);b(this,D);b(this,_);b(this,S);b(this,Y);b(this,M);y(this,M,!1),y(this,Y,e.defaultOptions),this.setOptions(e.options),this.observers=[],y(this,_,e.client),y(this,D,i(this,_).getQueryCache()),this.queryKey=e.queryKey,this.queryHash=e.queryHash,y(this,x,je(this.options)),this.state=e.state??i(this,x),this.scheduleGc()}get meta(){return this.options.meta}get promise(){var e;return(e=i(this,S))==null?void 0:e.promise}setOptions(e){this.options={...i(this,Y),...e},this.updateGcTime(this.options.gcTime)}optionalRemove(){!this.observers.length&&this.state.fetchStatus==="idle"&&i(this,D).remove(this)}setData(e,s){const r=Ce(this.state.data,e,this.options);return U(this,F,R).call(this,{data:r,type:"success",dataUpdatedAt:s==null?void 0:s.updatedAt,manual:s==null?void 0:s.manual}),r}setState(e,s){U(this,F,R).call(this,{type:"setState",state:e,setStateOptions:s})}cancel(e){var r,n;const s=(r=i(this,S))==null?void 0:r.promise;return(n=i(this,S))==null||n.cancel(e),s?s.then(ee).catch(ee):Promise.resolve()}destroy(){super.destroy(),this.cancel({silent:!0})}reset(){this.destroy(),this.setState(i(this,x))}isActive(){return this.observers.some(e=>Se(e.options.enabled,this)!==!1)}isDisabled(){return this.getObserversCount()>0?!this.isActive():this.options.queryFn===le||this.state.dataUpdateCount+this.state.errorUpdateCount===0}isStale(){return this.state.isInvalidated?!0:this.getObserversCount()>0?this.observers.some(e=>e.getCurrentResult().isStale):this.state.data===void 0}isStaleByTime(e=0){return this.state.isInvalidated||this.state.data===void 0||!be(this.state.dataUpdatedAt,e)}onFocus(){var s;const e=this.observers.find(r=>r.shouldFetchOnWindowFocus());e==null||e.refetch({cancelRefetch:!1}),(s=i(this,S))==null||s.continue()}onOnline(){var s;const e=this.observers.find(r=>r.shouldFetchOnReconnect());e==null||e.refetch({cancelRefetch:!1}),(s=i(this,S))==null||s.continue()}addObserver(e){this.observers.includes(e)||(this.observers.push(e),this.clearGcTimeout(),i(this,D).notify({type:"observerAdded",query:this,observer:e}))}removeObserver(e){this.observers.includes(e)&&(this.observers=this.observers.filter(s=>s!==e),this.observers.length||(i(this,S)&&(i(this,M)?i(this,S).cancel({revert:!0}):i(this,S).cancelRetry()),this.scheduleGc()),i(this,D).notify({type:"observerRemoved",query:this,observer:e}))}getObserversCount(){return this.observers.length}invalidate(){this.state.isInvalidated||U(this,F,R).call(this,{type:"invalidate"})}fetch(e,s){var f,w,h;if(this.state.fetchStatus!=="idle"){if(this.state.data!==void 0&&(s!=null&&s.cancelRefetch))this.cancel({silent:!0});else if(i(this,S))return i(this,S).continueRetry(),i(this,S).promise}if(e&&this.setOptions(e),!this.options.queryFn){const u=this.observers.find(d=>d.options.queryFn);u&&this.setOptions(u.options)}const r=new AbortController,n=u=>{Object.defineProperty(u,"signal",{enumerable:!0,get:()=>(y(this,M,!0),r.signal)})},o=()=>{const u=Te(this.options,s),d={client:i(this,_),queryKey:this.queryKey,meta:this.meta};return n(d),y(this,M,!1),this.options.persister?this.options.persister(u,d,this):u(d)},l={fetchOptions:s,options:this.options,queryKey:this.queryKey,client:i(this,_),state:this.state,fetchFn:o};n(l),(f=this.options.behavior)==null||f.onFetch(l,this),y(this,K,this.state),(this.state.fetchStatus==="idle"||this.state.fetchMeta!==((w=l.fetchOptions)==null?void 0:w.meta))&&U(this,F,R).call(this,{type:"fetch",meta:(h=l.fetchOptions)==null?void 0:h.meta});const a=u=>{var d,E,A,c;$(u)&&u.silent||U(this,F,R).call(this,{type:"error",error:u}),$(u)||((E=(d=i(this,D).config).onError)==null||E.call(d,u,this),(c=(A=i(this,D).config).onSettled)==null||c.call(A,this.state.data,u,this)),this.scheduleGc()};return y(this,S,ge({initialPromise:s==null?void 0:s.initialPromise,fn:l.fetchFn,abort:r.abort.bind(r),onSuccess:u=>{var d,E,A,c;if(u===void 0){a(new Error(`${this.queryHash} data is undefined`));return}try{this.setData(u)}catch(m){a(m);return}(E=(d=i(this,D).config).onSuccess)==null||E.call(d,u,this),(c=(A=i(this,D).config).onSettled)==null||c.call(A,u,this.state.error,this),this.scheduleGc()},onError:a,onFail:(u,d)=>{U(this,F,R).call(this,{type:"failed",failureCount:u,error:d})},onPause:()=>{U(this,F,R).call(this,{type:"pause"})},onContinue:()=>{U(this,F,R).call(this,{type:"continue"})},retry:l.options.retry,retryDelay:l.options.retryDelay,networkMode:l.options.networkMode,canRun:()=>!0})),i(this,S).start()}},x=new WeakMap,K=new WeakMap,D=new WeakMap,_=new WeakMap,S=new WeakMap,Y=new WeakMap,M=new WeakMap,F=new WeakSet,R=function(e){const s=r=>{switch(e.type){case"failed":return{...r,fetchFailureCount:e.failureCount,fetchFailureReason:e.error};case"pause":return{...r,fetchStatus:"paused"};case"continue":return{...r,fetchStatus:"fetching"};case"fetch":return{...r,...Pe(r.data,this.options),fetchMeta:e.meta??null};case"success":return{...r,data:e.data,dataUpdateCount:r.dataUpdateCount+1,dataUpdatedAt:e.dataUpdatedAt??Date.now(),error:null,isInvalidated:!1,status:"success",...!e.manual&&{fetchStatus:"idle",fetchFailureCount:0,fetchFailureReason:null}};case"error":const n=e.error;return $(n)&&n.revert&&i(this,K)?{...i(this,K),fetchStatus:"idle"}:{...r,error:n,errorUpdateCount:r.errorUpdateCount+1,errorUpdatedAt:Date.now(),fetchFailureCount:r.fetchFailureCount+1,fetchFailureReason:n,fetchStatus:"idle",status:"error"};case"invalidate":return{...r,isInvalidated:!0};case"setState":return{...r,...e.state}}};this.state=s(this.state),Le.batch(()=>{this.observers.forEach(r=>{r.onQueryUpdate()}),i(this,D).notify({query:this,type:"updated",action:e})})},ae);function Pe(t,e){return{fetchFailureCount:0,fetchFailureReason:null,fetchStatus:fe(e.networkMode)?"fetching":"paused",...t===void 0&&{error:null,status:"pending"}}}function je(t){const e=typeof t.initialData=="function"?t.initialData():t.initialData,s=e!==void 0,r=s?typeof t.initialDataUpdatedAt=="function"?t.initialDataUpdatedAt():t.initialDataUpdatedAt:0;return{data:e,dataUpdateCount:0,dataUpdatedAt:s?r??Date.now():0,error:null,errorUpdateCount:0,errorUpdatedAt:0,fetchFailureCount:0,fetchFailureReason:null,fetchMeta:null,isInvalidated:!1,status:s?"success":"pending",fetchStatus:"idle"}}var ye=T.createContext(void 0),_e=t=>{const e=T.useContext(ye);if(!e)throw new Error("No QueryClient set, use QueryClientProvider to set one");return e},ze=({client:t,children:e})=>(T.useEffect(()=>(t.mount(),()=>{t.unmount()}),[t]),oe.jsx(ye.Provider,{value:t,children:e})),Q=(t=>(t.UPBIT_SYMBOL_LIST="UPBIT_SYMBOL_LIST",t.UPBIT_SYMBOL_TRADE_DATA="UPBIT_SYMBOL_TRADE_DATA",t.UPBIT_SYMBOLS_RESTAPI_TRADE_DATA="UPBIT_SYMBOLS_RESTAPI_TRADE_DATA",t.BINANCE_SYMBOLS_DATA="BINANCE_SYMBOLS_DATA",t))(Q||{});function $e(t){return new Date(t).toLocaleTimeString("ko-KR",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})}async function Ve(){const t=await fetch("https://open.er-api.com/v6/latest/USD");if(!t.ok)throw new Error("환율 데이터를 불러오는 데 실패했습니다.");return(await t.json()).rates.KRW}function Me(t){if(!t)return"other";const e=t.trim().charAt(0);return/[\uAC00-\uD7A3]/.test(e)?"korean":/[a-zA-Z]/.test(e)?"english":"other"}function Ie(t){const e=t.match(/^(.+)\((.+)\)$/);return e?[e[1],e[2]]:[t]}function Je(t,e,s){const r=Me(t),n=t.toLowerCase();if(r==="english"&&s.includes(t.toUpperCase()))return t;for(let o=0;o<e.length;o++){const{korean_name:l,english_name:a,market:f}=e[o],w=a.toLowerCase(),h=f.replace("KRW-","").toLowerCase();if(r==="korean"){if(Ie(l).map(d=>d.toLowerCase()).includes(n))return h}else if(r==="english"&&(w===n||h===n))return h}return""}function G(t){return typeof SharedWorker<"u"&&t instanceof SharedWorker}function Ze(t,e){const s=new Map;return e.forEach(n=>{s.set(n.market.replace("KRW-",""),n.korean_name)}),s.get(t.replace("USDT",""))}function Xe(t,e,s){const r=new Date(t);switch(e){case"seconds":r.setSeconds(r.getSeconds()-s);break;case"minutes":r.setMinutes(r.getMinutes()-s);break;case"days":r.setDate(r.getDate()-s);break;case"weeks":r.setDate(r.getDate()-s*7);break;case"months":r.setMonth(r.getMonth()-s);break;case"years":r.setFullYear(r.getFullYear()-s);break;default:throw new Error(`Invalid candle type: ${e}`)}return r.getTime()}function et(t,e){return t===0?"0":t>=1e3?Number.parseFloat(t.toPrecision(e)).toLocaleString():Number.parseFloat(t.toPrecision(e)).toString()}const pe=T.createContext(null),tt=()=>{const t=T.useContext(pe);if(!t)throw new Error("useCount must be used within a CountProvider");return t},st=({children:t})=>{const[e,s]=T.useState("ADAUSDT"),[r,n]=T.useState([]),[o,l]=T.useState(null),[a,f]=T.useState(null),[w,h]=T.useState([]),u=_e(),d=T.useRef(!1),E=T.useRef(!1);return T.useEffect(()=>{const A=W=>{const p=W.data;(p==null?void 0:p.type)===Q.BINANCE_SYMBOLS_DATA&&(Object.entries(p.data).forEach(([g,N])=>{u.setQueryData(["symbol",g],N)}),d.current===!1&&Object.keys(p.data).length>0&&(n(Object.keys(p.data)),d.current=!0))},c=W=>{const p=W.data;(p==null?void 0:p.type)===Q.UPBIT_SYMBOL_TRADE_DATA?Object.entries(p.data).forEach(([g,N])=>{u.setQueryData(["symbol",g],N)}):(p==null?void 0:p.type)===Q.UPBIT_SYMBOLS_RESTAPI_TRADE_DATA?Object.entries(p.data).forEach(([g,N])=>{u.setQueryData(["symbol",g],N)}):(p==null?void 0:p.type)===Q.UPBIT_SYMBOL_LIST&&E.current===!1&&(h([...p.data]),E.current=!0)},m=()=>typeof SharedWorker<"u"?new SharedWorker(new URL("/hy_toy/assets/BinanceSharedWorker-DC6GdPTm.js",import.meta.url),{type:"module"}):new Worker(new URL("/hy_toy/assets/BinanceWorker-DsO0NNw8.js",import.meta.url),{type:"module"}),k=()=>typeof SharedWorker<"u"?new SharedWorker(new URL("/hy_toy/assets/UpbitSharedWorker-B-dR6IMn.js",import.meta.url),{type:"module"}):new Worker(new URL("/hy_toy/assets/UpbitWorker-Dd4EVjbn.js",import.meta.url),{type:"module"}),v=m(),C=k();return C&&(G(C)?C.port.onmessage=c:C.onmessage=c),v&&(G(v)?v.port.onmessage=A:v.onmessage=A),l(v),f(C),()=>{v&&(G(v)?v.port.close():v.terminate()),C&&(G(C)?C.port.close():C.terminate())}},[]),!o||!a?null:oe.jsx(pe,{value:{symbol:e,setSymbol:s,symbolList:r,setSymbolList:n,upbitSymbolList:w,setUpbitSymbolList:h,worker:o,upbitWorker:a},children:t})};export{be as A,Pe as B,Ce as C,_e as D,Je as E,$e as F,et as G,Xe as H,He as Q,Oe as R,ue as S,Ne as a,ee as b,ge as c,Ge as d,Te as e,Ye as f,De as g,ve as h,xe as i,V as j,ze as k,st as l,We as m,Le as n,he as o,Z as p,Ve as q,Ke as r,le as s,Ze as t,tt as u,ke as v,Se as w,Qe as x,H as y,me as z};
