var d=Object.defineProperty;var r=(o,e,t)=>e in o?d(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var n=(o,e,t)=>(r(o,typeof e!="symbol"?e+"":e,t),t);class a extends HTMLElement{constructor(){super();n(this,"shadow");this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["foo"]}get foo(){return this.getAttribute("foo")||""}set foo(t){typeof t=="string"&&this.setAttribute("foo",t)}connectedCallback(){this.render()}attributeChangedCallback(t,s,i){}render(){const t="<div><slot>Hello World</slot></div>",s="<style></style>";this.shadow.innerHTML=`${s}${t}`}}customElements.define("web-component-shadow-dom-js",a);
//# sourceMappingURL=web-component-shadow-dom-ts.js.map
