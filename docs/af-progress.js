var h=Object.defineProperty;var g=(r,e,t)=>e in r?h(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var l=(r,e,t)=>(g(r,typeof e!="symbol"?e+"":e,t),t);class b extends HTMLElement{constructor(){var t;super();l(this,"shadow");l(this,"actionForm",this.closest("action-form"));this.shadow=this.attachShadow({mode:"open"}),(t=this.actionForm)!=null&&t.steps&&(this.actionForm.addEventListener("af-step",()=>{console.log("af-step listener called"),this.render()}),this.render(),this.shadow.addEventListener("click",n=>{const i=n.target;if(i instanceof HTMLButtonElement&&i.matches(".step")&&!i.disabled){const o=Number(i.dataset.index||0);this.dispatchEvent(new CustomEvent("af-step",{bubbles:!0,composed:!0,detail:{step:o}})),this.render()}}))}get stepIndex(){var t;return((t=this.actionForm)==null?void 0:t.stepIndex)||0}render(){var i,o;if(!((i=this.actionForm)!=null&&i.steps))return;const t=this.stepIndex/(Array.from(this.actionForm.steps).filter(s=>!s.hidden).length-1)*100,n="<style>:host{display:grid;position:relative;align-items:center;--step-border-size:.22em;--step-bg:white;--step-text:inherit;--inactive:lightgray;--active:lightseagreen;--invalid:coral;--valid:var(--active);--valid-bg:var(--active);--valid-text:white}.progress{background:var(--active);height:.5em;grid-row:-1/1;grid-column:-1/1}nav{margin:0;padding:0;list-style:none;display:flex;justify-content:space-between;grid-row:-1/1;grid-column:-1/1}.bg{background:var(--inactive);height:.5em;grid-row:-1/1;grid-column:-1/1}.step{border:var(--step-border-size) solid var(--inactive);border-radius:100%;width:2em;height:2em;line-height:1.65em;text-align:center;background:var(--step-bg);font-size:.9em;position:relative;z-index:1;padding:0;margin:0;cursor:pointer;color:var(--step-text)}.valid:has(~ .active){border-color:var(--valid);background:var(--valid-bg);color:var(--valid-text)}.step:disabled{opacity:1;cursor:not-allowed}.active{border-color:var(--active)}.step:not(.valid):has(~ .active){border-color:var(--invalid)}</style>";this.shadow.innerHTML=`${n}
        <div class="bg" part="bg"></div>
        <div class="progress" part="progress" style="width: ${t}%;"></div>
        <nav part="nav">
        ${Array.from((o=this.actionForm)==null?void 0:o.steps).filter(s=>!s.hidden).map((s,a)=>{const d=a===this.stepIndex?"active":"",c=s.valid?"valid":"",v=this.hasAttribute("enable-all")||this.stepIndex>a?"":"disabled",p=s.getAttribute("progress-title")||"";return`<button type="button" part="step ${c} ${d}" ${v} title="${p}" class="step ${c} ${d}" ${d&&'aria-current="step"'} aria-label="Step ${a+1}" data-index="${a}">${a+1}</button>`}).join("")}
        </nav>
        `}}customElements.define("af-progress",b);
//# sourceMappingURL=af-progress.js.map
