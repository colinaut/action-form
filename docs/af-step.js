var g=Object.defineProperty;var m=(o,n,t)=>n in o?g(o,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[n]=t;var c=(o,n,t)=>(m(o,typeof n!="symbol"?n+"":n,t),t);class f extends HTMLElement{constructor(){var t;super();c(this,"shadow");c(this,"actionForm",this.closest("action-form"));this.shadow=this.attachShadow({mode:"open"}),(t=this.actionForm)!=null&&t.steps&&(this.actionForm.addEventListener("af-step",()=>{this.render()}),this.render(),this.shadow.addEventListener("click",e=>{const s=e.target;if(s instanceof HTMLButtonElement&&s.matches(".step")&&!s.disabled){const i=Number(s.dataset.index||0);this.dispatchEvent(new CustomEvent("af-step",{bubbles:!0,composed:!0,detail:{step:i}})),this.render()}}))}get stepIndex(){var t;return((t=this.actionForm)==null?void 0:t.stepIndex)||0}render(){var a,r,u;if(!((a=this.actionForm)!=null&&a.steps))return;const t=Array.from(this.actionForm.steps).filter(l=>l.style.display!=="none").length,e=((r=this.actionForm)==null?void 0:r.stepIndex)||0,s=e/(t-1)*100,i="<style>:host{display:grid;position:relative;align-items:center;--step-border-size:.22em;--step-bg:white;--step-text:inherit;--inactive:lightgray;--active:lightseagreen;--invalid:coral;--valid:var(--active);--valid-bg:var(--active);--valid-text:white}.progress{background:var(--active);height:.5em;grid-row:-1/1;grid-column:-1/1}nav{margin:0;padding:0;list-style:none;display:flex;justify-content:space-between;grid-row:-1/1;grid-column:-1/1}.bg{background:var(--inactive);height:.5em;grid-row:-1/1;grid-column:-1/1}.step{border:var(--step-border-size) solid var(--inactive);border-radius:100%;width:2em;height:2em;line-height:1.65em;text-align:center;background:var(--step-bg);font-size:.9em;position:relative;z-index:1;padding:0;margin:0;cursor:pointer;color:var(--step-text)}.valid:has(~ .active){border-color:var(--valid);background:var(--valid-bg);color:var(--valid-text)}.step:disabled{opacity:1;cursor:not-allowed}.active{border-color:var(--active)}.step:not(.valid):has(~ .active){border-color:var(--invalid)}</style>";this.shadow.innerHTML=`${i}
        <div class="bg" part="bg"></div>
        <div class="progress" part="progress" style="width: ${s}%;"></div>
        <nav part="nav">
        ${Array.from((u=this.actionForm)==null?void 0:u.steps).filter(l=>l.style.display!=="none").map((l,d)=>{const h=d===e?"active":"",p=l.valid?"valid":"",v=this.hasAttribute("enable-all")||e>d?"":"disabled",b=l.getAttribute("progress-title")||"";return`<button type="button" part="step ${p} ${h}" ${v} title="${b}" class="step ${p} ${h}" ${h&&'aria-current="step"'} aria-label="Step ${d+1}" data-index="${d}">${d+1}</button>`}).join("")}
        </nav>
        `}}customElements.define("af-progress",f);class y extends HTMLElement{constructor(){super();c(this,"shadow");c(this,"this");c(this,"buttons");const t=this.attachInternals();this.shadow=t.shadowRoot,this.this=this.shadow||this;const e=this.closest("action-form");e&&(this.buttons=e.stepButtons||["Prev","Next","Submit"],this.this.addEventListener("change",s=>{console.log("af-step change isValid",s.target,this.isValid),this.valid=this.isValid}),this.this.addEventListener("click",s=>{const i=s.target;if(i instanceof HTMLButtonElement){const a=i.dataset.direction;a&&this.buttons.indexOf(a)<2&&this.step(a)}}))}get valid(){return this.hasAttribute("valid")}set valid(t){t?this.setAttribute("valid",""):this.removeAttribute("valid")}get isValid(){const t=this.querySelector("af-group-count");let e=!0;return t&&(e=t.validity),e&&this.querySelectorAll(":invalid").length===0}step(t=this.buttons[1]){if(t===this.buttons[1]){const e=this.querySelectorAll("input, select, textarea, af-group-count");if(!Array.from(e).every(i=>{const a=i.checkValidity();if(i.dispatchEvent(new Event("change",{bubbles:!0})),!a)if(i.matches("af-group-count")){const r=this.querySelector("input, select, textarea");r==null||r.focus()}else i.focus();return a}))return}this.dispatchEvent(new CustomEvent("af-step",{bubbles:!0,detail:{direction:t}}))}connectedCallback(){if(this.valid=this.isValid,!(this.this.querySelector("slot[name=footer]")||this.this.querySelector("[slot=footer]"))){const e=document.createElement("nav");e.classList.add("af-step-nav"),e.setAttribute("part","step-nav"),e.setAttribute("aria-label","Step Navigation");const s=r=>`<button type="button" class="af-step-${r.toLowerCase()}" data-direction="${r}" part="step-btn">${r}</button>`,i=this.classList.contains("first")?"<span></span>":s(this.buttons[0]),a=this.classList.contains("last")?`<button type="submit" part="submit">${this.buttons[2]}</button>`:s(this.buttons[1]);e.innerHTML=`${i}${a}`,this.this.appendChild(e)}}}customElements.define("af-step",y);
//# sourceMappingURL=af-step.js.map
