var l=Object.defineProperty;var m=(s,e,t)=>e in s?l(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var n=(s,e,t)=>(m(s,typeof e!="symbol"?e+"":e,t),t);import"./action-form.js";import"./af-error.js";import"./af-step.js";import"./af-progress.js";import"./af-group-count.js";import"./af-text-count.js";class p extends HTMLElement{constructor(){super();n(this,"shadow");this.shadow=this.attachShadow({mode:"open"}),this.shadow.innerHTML="<button part='button'><slot>Toggle Steps</slot></button>",this.addEventListener("click",()=>{var t;(t=this.closest("action-form"))==null||t.classList.toggle("no-steps")})}}customElements.define("af-step-toggle",p);function u(s){return s.replace(/[-_](.)/g,function(e){return" "+e.charAt(1).toUpperCase()}).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./,function(e){return e.toUpperCase()})}class f extends HTMLElement{constructor(){super();n(this,"form");const t=this.closest("action-form");this.form=this.closest("form"),!(!t||!this.form)&&t.addEventListener("af-step",()=>{this.render()})}connectedCallback(){this.render()}getFormData(){if(!this.form)return;const t=new FormData(this.form);return console.log("formData",t),[...new Set(Array.from(t.keys()))].filter(o=>t.has(o)&&t.getAll(o).some(a=>a!=="")).map(o=>{const i=t.getAll(o).filter(c=>typeof c=="string");return{key:o,value:i}})}render(){const t=this.getFormData();this.innerHTML=`${t==null?void 0:t.map(r=>`<p><strong>${this.hasAttribute("title-case")?u(r.key):r.key}</strong>: ${r.value.map(o=>`<span>${o}</span>`).join("")}</p>`).join("")}`}}customElements.define("af-preview",f);
//# sourceMappingURL=index.js.map
