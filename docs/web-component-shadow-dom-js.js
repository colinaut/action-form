class o extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["foo"]}get foo(){return this.getAttribute("foo")||""}set foo(e){typeof e=="string"&&this.setAttribute("foo",e)}connectedCallback(){this.render()}attributeChangedCallback(e,t,n){}render(){const e="<div><slot>Hello World</slot></div>",t="<style></style>";this.shadow.innerHTML=`${t}${e}`}}customElements.define("web-component-shadow-dom-ts",o);
//# sourceMappingURL=web-component-shadow-dom-js.js.map
