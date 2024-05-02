var p=Object.defineProperty;var g=(d,h,r)=>h in d?p(d,h,{enumerable:!0,configurable:!0,writable:!0,value:r}):d[h]=r;var u=(d,h,r)=>(g(d,typeof h!="symbol"?h+"":h,r),r);function m(d){return d instanceof HTMLInputElement||d instanceof HTMLTextAreaElement||d instanceof HTMLSelectElement}function y(){return Math.random().toString(36).substring(2)}function S(d){try{const h=JSON.parse(d);return!!h&&typeof h=="object"}catch{return!1}}class v extends HTMLElement{constructor(){super();u(this,"form",this.querySelector("form")||null);u(this,"steps",this.querySelectorAll("af-step"));u(this,"stepIndex",0);u(this,"storeKey",this.hasAttribute("store")?`action-form-${this.getAttribute("store")||this.id||this.form.id||y()}`:"");u(this,"persistedFields",[]);u(this,"watchers",[]);u(this,"storeGetFields");u(this,"storeListenFields");document.documentElement.classList.add("js");const r=this.form;r&&(this.hasAttribute("novalidate")&&r.setAttribute("novalidate",""),this.steps.forEach((e,s)=>{e.dataset.index=String(s),s===0&&e.classList.add("first","active"),s===this.steps.length-1&&e.classList.add("last")}),this.addEventListener("af-step",e=>{var l,o,n,c;const s=e;let t=this.stepIndex;typeof((l=s.detail)==null?void 0:l.step)=="number"?t=s.detail.step:(o=s.detail)!=null&&o.direction&&(this.log("step",(n=s.detail)==null?void 0:n.direction),t=t+((c=s.detail)==null?void 0:c.direction)),t=Math.max(0,Math.min(t,this.steps.length-1)),this.stepIndex=t;let i=0;Array.from(this.steps).forEach(f=>{f.style.display!=="none"?(f.dataset.index=String(i),i++):f.dataset.index="",i-1===t?(f.classList.add("active"),this.stepIndex=t):f.classList.remove("active")})}),this.hasAttribute("auto-error")&&(this.querySelectorAll("[required],[pattern],[type=phone],[type=email],[type=url]").forEach(t=>{var n;let i=t.id||"";const l=r.querySelector(`af-error[for="${i}"]`),o=(n=t.closest("label"))==null?void 0:n.querySelector("af-error");if(!l&&!o){const c=document.createElement("af-error");c.textContent=t.dataset.error||"",i||(i=`${t.name||t.tagName.toLowerCase()}-${Math.random().toString(36).substring(2,9)}`,t.setAttribute("id",i)),c.setAttribute("for",i),t.after(c),this.log(`Added Error Message for ${t.tagName.toLowerCase()}[${t.name}] #${i}`)}}),this.querySelectorAll("fieldset[data-group]").forEach(t=>{let i=t.id||"";if(!t.querySelector(`af-error[for="${i}"]`)){i||(i=`${t.name||"fieldset"}-${Math.random().toString(36).substring(2,9)}`,t.setAttribute("id",i));const n=document.createElement("af-error");n.setAttribute("for",i),n.textContent=t.dataset.error||"",t.append(n)}if(!t.querySelector("af-group-count")){const n=document.createElement("af-group-count");n.style.display="none",t.append(n)}})),this.enhanceElements(),this.addEventListener("change",e=>{const s=e.target;if(s instanceof HTMLElement&&s.matches("input, textarea, select, af-group-count")){const t=s,i=t.getAttribute("aria-describedby");if(i){const o=document.getElementById(i);if(o!=null&&o.matches("af-error")){const n=o,c=t.checkValidity();n.showError(!c)}}const l=this.watchers.filter(o=>o.name===t.name);if(l.length>0&&this.checkWatchers(l),this.storeKey){const o=localStorage.getItem(this.storeKey)||"{}";if(o&&t.name){const n=JSON.parse(o);if(t instanceof HTMLInputElement&&["checkbox","radio"].includes(t.type)){const c=n[t.name]instanceof Array?n[t.name]:[];t.checked?c.push(t.value):c.splice(c.indexOf(t.value),1),n[t.name]=c}else n[t.name]=t.value;localStorage.setItem(this.storeKey,JSON.stringify(n))}}if(m(t)&&t.dataset.storeSet){const o=t.dataset.storeSet.split(".");let n=t.value;if(o.length>1){const c=JSON.parse(localStorage.getItem(o[0])||"{}");n=JSON.stringify({...c,[o[1]]:t.value})}localStorage.setItem(o[0],n)}}}),this.querySelectorAll("button[type=reset]").forEach(e=>{e.addEventListener("click",s=>{s.preventDefault(),s.stopPropagation(),this.form.reset(),this.restoreForm()})}),this.addEventListener("submit",e=>{var t;if(r.checkValidity())this.resetStore();else{e.preventDefault(),console.error("Form validation failed");const i=r.querySelector("input:invalid, select:invalid, textarea:invalid, af-group-count[validity=false]");if(i){const l=i.closest("af-step");if(l&&this.dispatchEvent(new CustomEvent("af-step",{detail:{step:Number(l.dataset.index)}})),this.log("invalidField",i),i.matches("af-group-count")){const o=(t=i.closest("fieldset"))==null?void 0:t.querySelector("input, select, textarea");o==null||o.focus()}else i.focus();i.dispatchEvent(new Event("change",{bubbles:!0}))}}}),window.addEventListener("storage",e=>{this.log("storage",e,e.key),this.storeListenFields&&Array.from(this.storeListenFields).filter(t=>{var i;return m(t)&&((i=t.dataset.storeGet)==null?void 0:i.split(".")[0])===e.key}).forEach(t=>this.updateStoreField(t)),this.hasAttribute("store-listen")&&e.key===this.storeKey&&this.restoreFieldValues()}))}restoreForm(){this.resetStore(),this.updateStoreFields(this.storeGetFields),this.restoreFieldValues(),this.querySelectorAll("af-error[invalid]").forEach(a=>{a.showError(!1)}),this.checkWatchers(),this.dispatchEvent(new CustomEvent("af-step",{detail:{step:0}}))}resetStore(){const r=localStorage.getItem(this.storeKey);if(r&&this.persistedFields.length>0){const a=JSON.parse(r);Object.keys(a).forEach(e=>{this.persistedFields.includes(e)||delete a[e]}),localStorage.setItem(this.storeKey,JSON.stringify(a))}else localStorage.removeItem(this.storeKey)}updateStoreFields(r){r.forEach(a=>{this.updateStoreField(a)})}updateStoreField(r){if(m(r)){const a=r.dataset.storeGet;if(!a)return;const e=a.split("."),s=localStorage.getItem(e[0]);if(s)if(S(s)&&e.length>1){const t=JSON.parse(s)[e[1]];t&&(r.value=String(t))}else r.value=s}}enhanceElements(){this.storeGetFields=this.querySelectorAll("[data-store-get]"),this.storeListenFields=this.querySelectorAll("[data-store-get][data-store-listen]"),this.storeGetFields.length>0&&this.updateStoreFields(this.storeGetFields),this.storeKey&&this.restoreFieldValues(),this.querySelectorAll("[data-if],[data-text]").forEach(e=>{const s=e.dataset.if||e.dataset.text,t=e.dataset.ifValue,i=e.dataset.ifNotValue,l=e.dataset.ifRegex,o=l?new RegExp(l):void 0;s&&this.watchers.push({name:s,if:!!e.dataset.if,text:!!e.dataset.text,value:t,notValue:i,regex:o,el:e})}),this.checkWatchers();const a=this.querySelectorAll("[data-persist]");this.persistedFields=Array.from(a).map(e=>m(e)?e.name:"")}restoreFieldValues(){const r=localStorage.getItem(this.storeKey);if(!r)return;const a=JSON.parse(r);typeof a=="object"&&Object.keys(a).forEach(e=>{this.querySelectorAll(`[name="${e}"]`).forEach(t=>{m(t)&&!t.matches("[type=hidden]")&&(t instanceof HTMLInputElement&&["checkbox","radio"].includes(t.type)&&a[e]instanceof Array?t.checked=a[e].includes(t.value):t.value=String(a[e]))})})}checkWatchers(r=this.watchers){this.log("checkWatchers",r);const a=this.querySelector("form");if(!a||r.length===0)return;const e=new FormData(a);r.forEach(s=>{const t=e.getAll(s.name);if(s.text&&(s.el.textContent=t.join(", ")),s.if){let i=t.some(l=>typeof l=="string"&&(s.value||s.regex)?l===s.value||s.regex&&s.regex.test(l):!!l);s.notValue&&t.length!==0&&i&&(i=t.every(l=>l!==s.notValue)),this.show(s.el,i),s.el.matches("af-step")&&this.dispatchEvent(new CustomEvent("af-step"))}})}show(r,a){a?(r.style.display="",r.removeAttribute("disabled")):(r.style.display="none",r.setAttribute("disabled","")),r.dispatchEvent(new Event("change",{bubbles:!0}))}log(...r){this.hasAttribute("debug")&&console.log(...r)}}customElements.define("action-form",v);
//# sourceMappingURL=action-form.js.map
