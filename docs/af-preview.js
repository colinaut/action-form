var c=Object.defineProperty;var a=(r,e,t)=>e in r?c(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var s=(r,e,t)=>(a(r,typeof e!="symbol"?e+"":e,t),t);import{A as m}from"./action-form.js";import{c as f}from"./assets/signals-DHVSGanU.js";import"./af-field-group.js";function l(r){return r.replace(/[-_](.)/g,function(e){return" "+e.charAt(1).toUpperCase()}).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./,function(e){return e.toUpperCase()})}class u extends HTMLElement{constructor(){super(...arguments);s(this,"actionForm")}connectedCallback(){const t=this.closest("action-form");if(t&&t instanceof m){if(this.actionForm=t,!t.querySelector("form"))return;f(()=>{this.render(this.actionForm.data.getForm())})}}get ignore(){var t;return((t=this.getAttribute("ignore"))==null?void 0:t.split(","))||[]}render(t){const o=i=>i.map(n=>typeof n=="string"?n:"FILE").toString();t&&!Array.isArray(t)&&(this.innerHTML=`<ul>${Object.entries(t).filter(([i])=>!this.ignore.includes(i)).map(([i,n])=>`<li><strong>${this.hasAttribute("title-case")?l(i):i}</strong>: ${o(n)}</li>`).join("")}</ul>`)}}customElements.define("af-preview",u);
//# sourceMappingURL=af-preview.js.map
