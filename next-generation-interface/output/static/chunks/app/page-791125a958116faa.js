(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{469:function(e,t,s){Promise.resolve().then(s.bind(s,1049))},1049:function(e,t,s){"use strict";var n=s(7437),a=s(2265),r=s(2126);t.default=()=>{let[e,t]=(0,a.useState)(""),[s,l]=(0,a.useState)([]),[c,i]=(0,a.useState)(!1),[u,h]=(0,a.useState)(null),d=async t=>{t.preventDefault(),i(!0),h(null);try{let t=await r.Z.get("/api/search",{params:{query:e}});l(t.data)}catch(e){h("Error fetching search results")}finally{i(!1)}};return(0,n.jsxs)("div",{className:"search-component",children:[(0,n.jsxs)("form",{onSubmit:d,children:[(0,n.jsx)("input",{type:"text",value:e,onChange:e=>t(e.target.value),placeholder:"Enter search query"}),(0,n.jsx)("button",{type:"submit",children:"Search"})]}),c&&(0,n.jsx)("p",{children:"Loading..."}),u&&(0,n.jsx)("p",{children:u}),(0,n.jsx)("div",{className:"results",children:s.map((e,t)=>(0,n.jsxs)("div",{className:"result-item",children:[(0,n.jsx)("h3",{children:e.title}),(0,n.jsx)("p",{children:e.content})]},t))})]})}}},function(e){e.O(0,[126,971,23,744],function(){return e(e.s=469)}),_N_E=e.O()}]);