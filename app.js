const lessons=[
  ["Introducción","¿Qué ocurre bajo una edificación?"],
  ["Carga, área y esfuerzo","σ = P/A"],
  ["Peso propio","σᵥ = γz"],
  ["Suelo estratificado","Variación de γ"],
  ["Sobrecarga superficial","Efecto de q"],
  ["Modelación","Ejercicio aplicado"]
];
const screens=[...document.querySelectorAll(".screen")];
const nav=document.getElementById("sideNav");
const dots=document.getElementById("dots");
const byId=id=>document.getElementById(id);
const prevBtn=byId("prevBtn"),nextBtn=byId("nextBtn"),animateBtn=byId("animateBtn"),loadPulse=byId("loadPulse"),soilArrows=byId("soilArrows"),miniLoadArrows=byId("miniLoadArrows"),miniContours=byId("miniContours"),objectivesBtn=byId("objectivesBtn"),objectivesDialog=byId("objectivesDialog"),closeDialog=byId("closeDialog"),fullBtn=byId("fullBtn");
let current=0;
lessons.forEach((l,i)=>{
  const b=document.createElement("button");
  b.className="nav-item"+(i===0?" active":"");
  b.innerHTML=`<span class="nav-num">${i+1}</span><span><b>${l[0]}</b><small>${l[1]}</small></span>`;
  b.onclick=()=>show(i); nav.appendChild(b);
  const d=document.createElement("button"); d.className="dot"+(i===0?" active":""); d.textContent=i+1; d.onclick=()=>show(i); dots.appendChild(d);
});
function show(i){
  current=Math.max(0,Math.min(screens.length-1,i));
  screens.forEach((s,n)=>s.classList.toggle("active",n===current));
  [...nav.children].forEach((b,n)=>b.classList.toggle("active",n===current));
  [...dots.children].forEach((b,n)=>b.classList.toggle("active",n===current));
  prevBtn.disabled=current===0; nextBtn.disabled=current===screens.length-1;
  if(current===1) drawPA();
  if(current===2) drawDepth();
  if(current===3) drawLayers();
  if(current===4) drawQ();
}
prevBtn.onclick=()=>show(current-1); nextBtn.onclick=()=>show(current+1);
addEventListener("keydown",e=>{if(e.key==="ArrowRight")show(current+1);if(e.key==="ArrowLeft")show(current-1)});
let anim=[];
animateBtn.onclick=()=>{
  if(anim.length){anim.forEach(a=>a.cancel());anim=[];soilArrows.classList.remove("running");animateBtn.textContent="▶ Animar carga";return}
  animateBtn.textContent="■ Detener";
  soilArrows.classList.add("running");
  anim.push(loadPulse.animate(
    [{transform:"translateX(-50%) translateY(-8px)",opacity:.45},{transform:"translateX(-50%) translateY(95px)",opacity:1},{transform:"translateX(-50%) translateY(-8px)",opacity:.45}],
    {duration:1100,iterations:Infinity,easing:"ease-in-out"}
  ));
  if(miniLoadArrows) anim.push(miniLoadArrows.animate(
    [{opacity:.35,transform:"translateY(-5px)"},{opacity:1,transform:"translateY(9px)"},{opacity:.35,transform:"translateY(-5px)"}],
    {duration:900,iterations:Infinity,easing:"ease-in-out"}
  ));
  if(miniContours) anim.push(miniContours.animate(
    [{opacity:.55,transform:"scale(.97)",transformOrigin:"210px 92px"},{opacity:1,transform:"scale(1.03)",transformOrigin:"210px 92px"},{opacity:.55,transform:"scale(.97)",transformOrigin:"210px 92px"}],
    {duration:1300,iterations:Infinity,easing:"ease-in-out"}
  ));
};
objectivesBtn.onclick=()=>objectivesDialog.showModal(); closeDialog.onclick=()=>objectivesDialog.close();
fullBtn.onclick=()=>document.documentElement.requestFullscreen?.();

const NS="http://www.w3.org/2000/svg";
function E(n,a={}){const e=document.createElementNS(NS,n);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));return e}
function T(svg,x,y,txt,a={}){const t=E("text",{x,y,fill:"#bcd0dd","font-size":13,...a});t.textContent=txt;svg.appendChild(t)}

function bindPA(pEl,aEl,pOutEl,aOutEl,resultEl,callback){
  const update=()=>{
    const P=+pEl.value,A=+aEl.value,s=P/A;
    pOutEl.textContent=P+" kN"; aOutEl.textContent=A.toFixed(1)+" m²"; resultEl.textContent=s.toFixed(1)+" kPa";
    callback?.(P,A,s);
  };
  pEl.oninput=aEl.oninput=update; update();
}
const p=byId("p"),a=byId("a"),pOut=byId("pOut"),aOut=byId("aOut"),stressOut=byId("stressOut"),stressMsg=byId("stressMsg"),stressBulb=byId("stressBulb");
const p2=byId("p2"),a2=byId("a2"),pOut2=byId("pOut2"),aOut2=byId("aOut2"),stressOut2=byId("stressOut2"),chartPA=byId("chartPA");
const g=byId("g"),z=byId("z"),gOut=byId("gOut"),zOut=byId("zOut"),svOut=byId("svOut"),chartDepth=byId("chartDepth");
const g1=byId("g1"),g2=byId("g2"),g1Out=byId("g1Out"),g2Out=byId("g2Out"),layer1Out=byId("layer1Out"),layer2Out=byId("layer2Out"),layerTotalOut=byId("layerTotalOut"),chartLayers=byId("chartLayers");
const q=byId("q"),qOut=byId("qOut"),qTotalOut=byId("qTotalOut"),chartQ=byId("chartQ");

bindPA(p,a,pOut,aOut,stressOut,(P,A,s)=>{
  stressMsg.textContent=A<3?"Área pequeña: la carga se concentra.":A>8?"Área amplia: el esfuerzo disminuye.":"Carga y área actúan conjuntamente.";
  stressBulb.style.width=Math.min(90,48+A*3)+"%";
});
bindPA(p2,a2,pOut2,aOut2,stressOut2,()=>drawPA());

function axes(svg,maxX,maxY,xTitle,yTitle){
  svg.innerHTML=""; const L=82,Tp=34,W=630,H=370,x=v=>L+v/maxX*W,y=v=>Tp+v/maxY*H;
  svg.appendChild(E("rect",{x:0,y:0,width:800,height:500,rx:18,fill:"#071522"}));
  for(let i=0;i<=5;i++){const xv=maxX*i/5,yv=maxY*i/5;
    svg.appendChild(E("line",{x1:x(xv),y1:Tp,x2:x(xv),y2:Tp+H,stroke:"#18344b"}));
    svg.appendChild(E("line",{x1:L,y1:y(yv),x2:L+W,y2:y(yv),stroke:"#18344b"}));
    T(svg,x(xv),Tp+H+24,Math.round(xv),{"text-anchor":"middle"}); T(svg,L-12,y(yv)+4,yv.toFixed(0),{"text-anchor":"end"});
  }
  svg.appendChild(E("line",{x1:L,y1:Tp,x2:L,y2:Tp+H,stroke:"#dbe9f1","stroke-width":2}));
  svg.appendChild(E("line",{x1:L,y1:Tp+H,x2:L+W,y2:Tp+H,stroke:"#dbe9f1","stroke-width":2}));
  T(svg,L+W/2,474,xTitle,{"text-anchor":"middle","font-size":15,"font-weight":700,fill:"#eef7fc"});
  T(svg,22,Tp+H/2,yTitle,{"text-anchor":"middle","font-size":15,"font-weight":700,fill:"#eef7fc",transform:`rotate(-90 22 ${Tp+H/2})`});
  return{x,y,L,Tp,W,H};
}
function point(svg,a,xv,yv,label){
  svg.appendChild(E("circle",{cx:a.x(xv),cy:a.y(yv),r:9,fill:"#ffb547",stroke:"#071522","stroke-width":4}));
  const bx=Math.min(a.x(xv)+14,610),by=Math.max(a.y(yv)-42,20);
  svg.appendChild(E("rect",{x:bx,y:by,width:132,height:34,rx:9,fill:"#0d2940",stroke:"#315a78"}));
  T(svg,bx+66,by+22,label,{"text-anchor":"middle","font-weight":700,fill:"#fff"});
}
function drawPA(){
  const P=+p2.value,A=+a2.value,s=P/A,svg=chartPA,aX=axes(svg,12,1200,"Área A (m²)","Esfuerzo σ (kPa)");
  let d=""; for(let x=1;x<=12;x+=.25){const y=P/x;d+=(x===1?"M":"L")+aX.x(x)+" "+aX.y(Math.min(1200,y))+" "}
  svg.appendChild(E("path",{d,fill:"none",stroke:"#31c8ff","stroke-width":7,"stroke-linecap":"round"})); point(svg,aX,A,s,s.toFixed(1)+" kPa");
}
function drawDepth(){
  const G=+g.value,Z=+z.value,S=G*Z;gOut.textContent=G+" kN/m³";zOut.textContent=Z.toFixed(1)+" m";svOut.textContent=S.toFixed(1)+" kPa";
  const aX=axes(chartDepth,220,10,"Esfuerzo vertical σᵥ (kPa)","Profundidad z (m)");
  chartDepth.appendChild(E("path",{d:`M${aX.x(0)} ${aX.y(0)} L${aX.x(G*10)} ${aX.y(10)}`,fill:"none",stroke:"#31c8ff","stroke-width":7}));point(chartDepth,aX,S,Z,S.toFixed(1)+" kPa");
}
g.oninput=z.oninput=drawDepth;drawDepth();
function drawLayers(){
  const G1=+g1.value,G2=+g2.value,s1=G1*2,s2=G2*3,total=s1+s2;
  g1Out.textContent=G1;g2Out.textContent=G2;layer1Out.textContent=s1.toFixed(0)+" kPa";layer2Out.textContent=s2.toFixed(0)+" kPa";layerTotalOut.textContent=total.toFixed(0)+" kPa";
  const aX=axes(chartLayers,140,5,"Esfuerzo acumulado σᵥ (kPa)","Profundidad z (m)");
  chartLayers.appendChild(E("rect",{x:aX.L,y:aX.y(0),width:aX.W,height:aX.y(2)-aX.y(0),fill:"#b8894d",opacity:.14}));
  chartLayers.appendChild(E("rect",{x:aX.L,y:aX.y(2),width:aX.W,height:aX.y(5)-aX.y(2),fill:"#6d4a31",opacity:.18}));
  chartLayers.appendChild(E("path",{d:`M${aX.x(0)} ${aX.y(0)} L${aX.x(s1)} ${aX.y(2)} L${aX.x(total)} ${aX.y(5)}`,fill:"none",stroke:"#31c8ff","stroke-width":7,"stroke-linejoin":"round"}));point(chartLayers,aX,total,5,total.toFixed(0)+" kPa");
}
g1.oninput=g2.oninput=drawLayers;drawLayers();
function drawQ(){
  const Q=+q.value,total=Q+90;qOut.textContent=Q+" kPa";qTotalOut.textContent=total+" kPa";
  const aX=axes(chartQ,330,10,"Esfuerzo vertical σᵥ (kPa)","Profundidad z (m)");
  chartQ.appendChild(E("path",{d:`M${aX.x(0)} ${aX.y(0)} L${aX.x(180)} ${aX.y(10)}`,fill:"none",stroke:"#71899b","stroke-width":4,"stroke-dasharray":"10 8"}));
  chartQ.appendChild(E("path",{d:`M${aX.x(Q)} ${aX.y(0)} L${aX.x(Q+180)} ${aX.y(10)}`,fill:"none",stroke:"#31c8ff","stroke-width":7}));point(chartQ,aX,total,5,total+" kPa");
}
q.oninput=drawQ;drawQ();drawPA();show(0);

if("serviceWorker" in navigator){addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))}

const answerArea=byId("answerArea"),answerStress=byId("answerStress"),checkModel=byId("checkModel"),modelFeedback=byId("modelFeedback");
if(checkModel){
  checkModel.onclick=()=>{
    const A=Number(String(answerArea.value).replace(",","."));
    const S=Number(String(answerStress.value).replace(",","."));
    const okA=Math.abs(A-7.5)<0.05;
    const okS=Math.abs(S-120)<0.15;
    modelFeedback.className="model-feedback "+(okA&&okS?"ok":"bad");
    modelFeedback.innerHTML=okA&&okS
      ? "<b>Correcto:</b> A = 7.5 m² y σ = 120 kPa. Eso significa que cada m² transmite en promedio 120 kN al terreno."
      : "<b>Revisa:</b> primero calcula A = largo × ancho y luego aplica σ = P/A.";
  };
}
