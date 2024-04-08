var u=Object.defineProperty;var c=(a,i,t)=>i in a?u(a,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[i]=t;var r=(a,i,t)=>(c(a,typeof i!="symbol"?i+"":i,t),t);class p extends HTMLElement{constructor(){var n;super();r(this,"shadow");r(this,"this");r(this,"actionForm");r(this,"numberOfSteps");const t=this.attachInternals();this.shadow=t.shadowRoot,this.this=this.shadow||this;const e=this.closest("action-form");e&&(this.actionForm=e,this.numberOfSteps=((n=e.steps)==null?void 0:n.length)||0,this.this.addEventListener("change",()=>{console.log("af-step change isValid",this.isValid),this.valid=this.isValid}),this.this.addEventListener("click",o=>{const s=o.target;s instanceof HTMLButtonElement&&(s.matches(".af-step-next")?this.step("next"):s.matches(".af-step-prev")&&this.step("prev"))}),this.this.addEventListener("af-watcher",()=>{this.valid=this.isValid}))}get valid(){return this.hasAttribute("valid")}set valid(t){t?this.setAttribute("valid",""):this.removeAttribute("valid")}get active(){return this.hasAttribute("active")}set active(t){t?this.setAttribute("active",""):this.removeAttribute("active")}get isValid(){const t=this.querySelector("af-group-count");let e=!0;return t&&(e=t.validity),e&&this.querySelectorAll(":invalid").length===0}get thisStep(){var t;return((t=this.actionForm)==null?void 0:t.steps)&&Array.from(this.actionForm.steps).filter(e=>!e.hidden).indexOf(this)||0}get nextStep(){return this.thisStep+1<this.numberOfSteps?this.thisStep+1:null}get prevStep(){return this.thisStep-1>=0?this.thisStep-1:null}step(t="next"){const e=t==="next"?this.nextStep:this.prevStep;if(e!==null){if(t==="next"){const n=this.querySelectorAll("input, select, textarea, af-group-count");if(!Array.from(n).every(s=>{const l=s.checkValidity();if(s.dispatchEvent(new Event("change",{bubbles:!0})),!l)if(s.matches("af-group-count")){const h=this.querySelector("input, select, textarea");h==null||h.focus()}else s.focus();return l}))return}this.active=!1,this.dispatchEvent(new CustomEvent("af-step",{bubbles:!0,detail:{step:e}}))}}connectedCallback(){if(this.valid=this.isValid,!(this.this.querySelector("slot[name=footer]")||this.this.querySelector("[slot=footer]"))){const e=document.createElement("nav");e.classList.add("af-step-nav"),e.setAttribute("part","step-nav"),e.setAttribute("aria-label","Step Navigation");const n=s=>`<button type="button" class="af-step-${s.toLowerCase()}" part="step-btn">${s}</button>`,o='<button type="submit" part="submit">Submit</button>';e.innerHTML=`${this.prevStep!==null?n("Prev"):"<span></span>"}
            ${this.nextStep!==null?n("Next"):o}`,this.this.appendChild(e)}}}customElements.define("af-step",p);
//# sourceMappingURL=af-step.js.map
