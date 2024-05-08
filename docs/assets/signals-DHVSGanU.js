const n=[];function f(t){const e=new Set;return[()=>{const c=n[n.length-1];return c&&e.add(c),t},c=>{t=c;for(const o of e)o.execute()}]}function a(t){const e={execute(){n.push(e),t(),n.pop()}};e.execute()}export{f as a,a as c};
//# sourceMappingURL=signals-DHVSGanU.js.map
