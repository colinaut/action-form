var w=Object.defineProperty;var M=(i,n,t)=>n in i?w(i,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[n]=t;var d=(i,n,t)=>(M(i,typeof n!="symbol"?n+"":n,t),t);const A=[];function E(i){const n=new Set;return[()=>{const s=A[A.length-1];return s&&n.add(s),i},s=>{i=s;for(const c of n)c.execute()}]}function p(i){const n={execute(){A.push(n),i(),A.pop()}};n.execute()}class $ extends HTMLElement{constructor(){super();d(this,"actionForm");const t=this.closest("action-form");t&&(this.actionForm=t,this.addEventListener("change",()=>{this.valid=this.isValid}),this.addEventListener("click",e=>{const s=e.target;if(s instanceof HTMLButtonElement){const c=s.dataset.direction||"next";(c==="next"||c==="prev")&&t.steps[c]()}}),p(()=>{console.log("🫨 create effect: af-step: update button text"),t.steps.stepsLength(),this.setButtonTexts()}))}get valid(){return this.hasAttribute("valid")}set valid(t){t?this.setAttribute("valid",""):this.removeAttribute("valid")}get isValid(){return this.querySelectorAll(":invalid").length===0}getStepTitle(t){var s;let e=t==="next"?this.nextElementSibling:this.previousElementSibling;return e&&e instanceof HTMLElement&&e.style.display==="none"&&(e=t==="next"?e.nextElementSibling:e.previousElementSibling),e&&e.matches("af-step")?e.dataset.title||((s=this.actionForm)==null?void 0:s.dataset[t])||t.replace(/^\w/,c=>c.toUpperCase()):""}get submit(){var t;return((t=this.actionForm)==null?void 0:t.dataset.submit)||"Submit"}connectedCallback(){this.valid=this.isValid;const t=document.createElement("nav");t.classList.add("af-step-nav"),t.setAttribute("part","step-nav"),t.setAttribute("aria-label","Step Navigation");const e=(s="next")=>{const c=this.getStepTitle(s);return c?`<button type="button" class="af-step-${s}" data-direction="${s}" part="step-btn ${s}">${c}</button>`:s==="next"?`<button type="submit" part="submit">${this.submit}</button>`:"<span></span>"};t.innerHTML=`${e("prev")}${e("next")}`,this.appendChild(t)}setButtonTexts(){this.querySelectorAll(".af-step-nav button[data-direction]").forEach(t=>{(t.dataset.direction==="next"||t.dataset.direction==="prev")&&(t.textContent=this.getStepTitle(t.dataset.direction))})}}class H extends HTMLElement{constructor(){super();d(this,"shadow");d(this,"actionForm");this.shadow=this.attachShadow({mode:"open"});const t=this.closest("action-form");t&&t.steps.all.length>0&&(this.actionForm=t,this.shadow.addEventListener("click",e=>{const s=e.target;if(this.actionForm&&s instanceof HTMLButtonElement&&s.matches(".step")&&!s.disabled){const c=Number(s.dataset.index||0);t.steps.set(c)}}),p(()=>{const e=t.steps.stepsLength(),s=t.steps.stepIndex();console.log("🫨 create effect: af-progress: rerender",e,s),this.render(e,s)}))}render(t,e){const s=e/(t-1)*100,c="<style>:host{display:grid;position:relative;align-items:center;--step-border-size:.22em;--step-bg:white;--step-text:inherit;--inactive:lightgray;--active:lightseagreen;--invalid:coral;--valid:var(--active);--valid-bg:var(--active);--valid-text:white}.progress{background:var(--active);height:.5em;grid-row:-1/1;grid-column:-1/1}nav{margin:0;padding:0;list-style:none;display:flex;justify-content:space-between;grid-row:-1/1;grid-column:-1/1}.bg{background:var(--inactive);height:.5em;grid-row:-1/1;grid-column:-1/1}.step{border:var(--step-border-size) solid var(--inactive);border-radius:100%;width:2em;height:2em;line-height:1.65em;text-align:center;background:var(--step-bg);font-size:.9em;position:relative;z-index:1;padding:0;margin:0;cursor:pointer;color:var(--step-text)}.valid:has(~ .active){border-color:var(--valid);background:var(--valid-bg);color:var(--valid-text)}.step:disabled{opacity:1;cursor:not-allowed}.active{border-color:var(--active)}.step:not(.valid):has(~ .active){border-color:var(--invalid)}</style>";this.shadow.innerHTML=`${c}
        <div class="bg" part="bg"></div>
        <div class="progress" part="progress" style="width: ${s}%;"></div>
        <nav part="nav">
        ${Array.from(this.actionForm.steps.getVisible()).map((u,h)=>{const r=h===e?"active":"",a=u.valid?"valid":"",o=this.hasAttribute("enable-all")||e>h?"":"disabled",l=u.dataset.title||"";return`<button type="button" part="step ${a} ${r}" ${o} title="${l}" class="step ${a} ${r}" ${r&&'aria-current="step"'} aria-label="Step ${h+1}" data-index="${h}">${h+1}</button>`}).join("")}
        </nav>
        `}}function L(i=""){return`${i?i+"-":""}${Math.random().toString(36).substring(2,9)}`}function y(i){return!!i&&(i instanceof HTMLInputElement||i instanceof HTMLTextAreaElement||i instanceof HTMLSelectElement)}function S(i){return!!i&&(y(i)||i.matches("af-field-group"))}function I(i){if(i instanceof HTMLInputElement)switch(i.type){case"checkbox":case"radio":return i.checked?i.value:"";default:return i.value}return i.value||""}class q extends HTMLElement{constructor(){super();d(this,"target",null);d(this,"shadow",this.attachShadow({mode:"open"}))}addAria(t){if(S(t)){const e=t.getAttribute("aria-describedby")||this.getAttribute("id")||L(t.id);this.setAttribute("id",e),t.setAttribute("aria-describedby",e)}}connectedCallback(){var s;this.style.visibility="hidden";const t=this.getAttribute("for")||"",e=t?document.getElementById(t):(s=this.closest("label"))==null?void 0:s.querySelector("input, select, textarea");S(e)&&(this.addAria(e),this.render())}static get observedAttributes(){return["data-invalid"]}attributeChangedCallback(t,e,s){t==="data-invalid"&&(s==="pattern"||s==="required")&&this.render(s)}render(t="required"){const e={required:"<slot>Required</slot>",pattern:'<slot name="pattern">Not filled in properly</slot>'};this.shadow.innerHTML=e[t]}}class F extends HTMLElement{constructor(){var t;super();d(this,"shadow",this.attachShadow({mode:"open"}));d(this,"internals",this.attachInternals());d(this,"name",this.getAttribute("name")||L("af-field-group"));this.render(),this.checkValidity(),this.addEventListener("change",e=>{e.target!==this&&(this.checkValidity(),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})))}),(t=this.closest("form"))==null||t.addEventListener("formdata",e=>{e.formData.append(this.name,this.value)})}get min(){return Number(this.getAttribute("min")||0)}get max(){return Number(this.getAttribute("max")||1/0)}get value(){let t=[];const e=this.querySelectorAll("input, select, textarea");return t=Array.from(e).filter(s=>s instanceof HTMLInputElement&&["checkbox","radio"].includes(s.type)?s.checked:s.checkValidity()&&s.value),String(t.length)}focus(){const t=this.querySelector("input, select, textarea");t&&t.focus()}checkValidity(){this.setAttribute("value",this.value);const t=Number(this.value),e=t>=this.min&&t<=this.max;return this.setValidity(e),e}setValidity(t){const e=t?{}:{customError:!0},s=t?"":"Value is out of range";this.internals.setValidity(e,s),this.setAttribute("validity",String(t))}render(){this.shadow.innerHTML="<slot></slot>"}}d(F,"formAssociated",!0);class V extends HTMLElement{constructor(){var t;super();d(this,"afFieldGroup",this.closest("af-field-group"));this.render(),(t=this.afFieldGroup)==null||t.addEventListener("change",()=>this.render())}get value(){var t;return((t=this.afFieldGroup)==null?void 0:t.value)||"0"}render(){this.innerHTML=this.value}}function k(i){return i.replace(/[-_](.)/g,function(n){return" "+n.charAt(1).toUpperCase()}).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./,function(n){return n.toUpperCase()})}class C extends HTMLElement{constructor(){super(...arguments);d(this,"actionForm")}connectedCallback(){const t=this.closest("action-form");if(t&&t instanceof T){if(this.actionForm=t,!t.querySelector("form"))return;p(()=>{this.render(this.actionForm.data.getForm())})}}get ignore(){var t;return((t=this.getAttribute("ignore"))==null?void 0:t.split(","))||[]}render(t){const e=s=>s.map(c=>typeof c=="string"?c:"FILE").toString();t&&!Array.isArray(t)&&(this.innerHTML=`<ul>${Object.entries(t).filter(([s])=>!this.ignore.includes(s)).map(([s,c])=>`<li><strong>${this.hasAttribute("title-case")?k(s):s}</strong>: ${e(c)}</li>`).join("")}</ul>`)}}class N extends HTMLElement{getNumber(n){const t=Number(n.getAttribute("maxlength")||1/0);this.textContent=String(this.hasAttribute("remaining")?t-n.value.length:n.value.length)}connectedCallback(){var e;const n=this.getAttribute("for"),t=n?document.getElementById(n):(e=this.closest("label"))==null?void 0:e.querySelector("input, textarea");(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement)&&(this.getNumber(t),t.addEventListener("input",()=>this.getNumber(t)))}}function B(i){const n=new Map,[t,e]=E(r());function s(){e(r())}function c(a){const o=h(a);if(n.has(a))n.get(a).set(o);else{const[l,m]=E(o);n.set(a,{get:l,set:m})}}function u(a){var o;return(o=n.get(a))==null?void 0:o.get()}function h(a){return new FormData(i).getAll(a)}function r(){const a=new FormData(i).keys(),o={};return Array.from(a).forEach(l=>{o[l]=h(l)}),o}return{get:u,set:c,getForm:t,setForm:s,getValues:h,formDataObject:r}}function O(i){const[n,t]=E(0),[e,s]=E(h()[0]),[c,u]=E(h().length);function h(){return Array.from(i).filter(f=>f.style.display!=="none")}function r(){u(h().length)}function a(f=0){t(f),s(h()[f])}function o(f=0){const v=n(),g=Math.max(0,Math.min(v+f,h().length-1));g!==v&&a(g)}function l(){o(-1)}function m(){const f=e().querySelector(":invalid:not(fieldset)");f instanceof HTMLElement?(f.focus(),f.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))):o(1)}return{all:i,getVisible:h,currentStep:e,stepIndex:n,stepsLength:c,updateSteps:r,set:a,move:o,prev:l,next:m}}class T extends HTMLElement{constructor(){super();d(this,"form",this.querySelector("form")||null);d(this,"store",this.getAttribute("store"));d(this,"persistedFields",[]);d(this,"data",B(this.form));d(this,"steps",O(this.querySelectorAll("af-step")));d(this,"createEffect",p);const t=this.form;if(t){this.hasAttribute("novalidate")&&t.setAttribute("novalidate",""),this.persistedFields=Array.from(this.querySelectorAll("[data-persist]")).filter(r=>y(r)),this.store&&this.restoreFieldValues(),window.addEventListener("storage",r=>{this.log("storage",r,r.key),this.hasAttribute("store-listen")&&r.key===this.store&&this.restoreFieldValues()}),p(()=>{const r=this.steps.currentStep();this.steps.all.forEach(a=>{a===r?a.classList.add("active"):a.classList.remove("active")})});const e=Array.from(this.querySelectorAll("af-field-group")),s=Array.from(this.querySelectorAll("[required],[pattern],[type=phone],[type=email],[type=url],[minlength],[maxlength]"));[...e,...s].forEach(r=>{r.id||(r.id=L(`${r.tagName.toLowerCase()}${r.name?`-${r.name}`:""}`))}),this.hasAttribute("auto-error")&&(s.forEach(r=>{var l;if(r.hasAttribute("aria-describedby"))return;const a=t.querySelector(`af-error[for="${r.id}"]`),o=(l=r.closest("label"))==null?void 0:l.querySelector("af-error");!a&&!o&&(r.after(this.createAfError(r)),this.log(`Added Error Message for ${r.id}`))}),e.forEach(r=>{if(r.hasAttribute("aria-describedby"))return;r.querySelector(`af-error[for="${r.id}"]`)||(r.append(this.createAfError(r)),this.log(`Added Error Message for ${r.id}`))})),new Set([...e,...Array.from(t.elements)].map(r=>r.getAttribute("name")||"").filter(r=>r)).forEach(r=>{this.data.set(r)}),t.addEventListener("change",r=>{const a=r.target;a instanceof HTMLElement&&(a.name&&(this.data.set(a.name),this.data.setForm()),this.store&&localStorage.setItem(this.store,JSON.stringify(this.data.formDataObject())))}),[...s,...e].forEach(r=>{p(()=>{const a=r.getAttribute("name");a&&this.data.get(a),this.toggleError(r)})}),this.querySelectorAll("[data-if],[data-text]").forEach(r=>{if(r instanceof HTMLElement){const a=r.dataset.if,o=r.dataset.text;p(()=>{if(this.log("🫨 create effect: action-form: enhance elements"),a){const l=this.data.get(a);if(l){const m=r.dataset.ifValue,f=r.dataset.ifNotValue,v=r.dataset.ifRegex,g=v?new RegExp(v):void 0;if(m||f||g){const x=l.some(b=>typeof b=="string"&&(m&&b===m||g&&g.test(b)))&&l.every(b=>typeof b=="string"&&(!f||b!==f));this.show(r,x)}else this.show(r,!!l.some(x=>!!x))}}if(o){const l=this.data.get(o);l&&(r.textContent=l==null?void 0:l.toString())}})}}),this.querySelectorAll("button[type=reset]").forEach(r=>{r.addEventListener("click",a=>{a.preventDefault(),this.persistedFields.forEach(o=>y(o)?o.dataset.persist=o.value:null),this.form.reset(),this.persistedFields.forEach(o=>y(o)&&typeof o.dataset.persist=="string"?o.value=o.dataset.persist:null),this.restoreForm()})}),this.addEventListener("submit",r=>{if(t.checkValidity())this.restoreForm();else{r.preventDefault();const o=this.form.querySelector(":invalid:not(fieldset)");if(o&&o instanceof HTMLElement){const l=o.closest("af-step"),m=this.steps.getVisible().findIndex(f=>f===l);if(m!==-1)this.steps.set(m),this.steps.next();else throw new Error(`Invalid field: ${o.id}`)}}})}}createAfError(t){const e=document.createElement("af-error");if(e.setAttribute("for",t.id),e.textContent=t.dataset.error||"",t.dataset.errorPattern){const s=document.createElement("span");s.setAttribute("slot","pattern"),s.textContent=t.dataset.errorPattern,e.append(s)}return e}toggleError(t){const e=document.getElementById(t.getAttribute("aria-describedby")||"");e&&typeof t.checkValidity=="function"&&(t.checkValidity()?this.resetError(t,e):(e.style.visibility="visible",t.setAttribute("aria-invalid","true"),e.dataset.invalid=I(t)===""?"required":"pattern"))}resetError(t,e){t.removeAttribute("aria-invalid"),e.style.visibility="hidden",e.removeAttribute("data-invalid")}restoreForm(){this.resetStore(),this.querySelectorAll("[aria-invalid]").forEach(e=>{if(S(e)){const s=document.getElementById(e.getAttribute("aria-describedby")||"");s&&this.resetError(e,s)}})}resetStore(){if(!this.store)return;const t=localStorage.getItem(this.store);if(t&&this.persistedFields.length>0){const e=JSON.parse(t);Object.keys(e).forEach(s=>{this.persistedFields.every(c=>c.name!==s)&&delete e[s]}),localStorage.setItem(this.store,JSON.stringify(e))}else localStorage.removeItem(this.store)}restoreFieldValues(){if(!this.store)return;const t=localStorage.getItem(this.store);if(!t||t==="undefined")return;const e=JSON.parse(t);typeof e=="object"&&Object.keys(e).forEach(s=>{this.querySelectorAll(`[name="${s}"]`).forEach(u=>{y(u)&&!u.matches("[type=hidden]")&&(u instanceof HTMLInputElement&&["checkbox","radio"].includes(u.type)?u.checked=e[s].includes(u.value):u.value=String(e[s]))})})}show(t,e){e?(t.style.display="",t.removeAttribute("disabled")):(t.style.display="none",t.setAttribute("disabled","")),t.dispatchEvent(new Event("change",{bubbles:!0})),t.matches("af-step")&&this.steps.updateSteps(),t.matches("fieldset")&&t.querySelectorAll("input, select, textarea, af-field-group").forEach(c=>{this.data.getValues(c.name).some(u=>u)&&this.data.set(c.name)})}log(...t){this.hasAttribute("debug")&&console.log(...t)}}customElements.define("action-form",T);customElements.define("af-error",q);customElements.define("af-step",$);customElements.define("af-progress",H);customElements.define("af-field-group",F);customElements.define("af-field-group-count",V);customElements.define("af-text-count",N);customElements.define("af-preview",C);
//# sourceMappingURL=action-form.js.map
