gsap.registerPlugin(ScrollTrigger);
window.addEventListener("scroll",function(){var n=document.getElementById("nav");window.scrollY>50?n.classList.add("scrolled"):n.classList.remove("scrolled");});
var tl=gsap.timeline({delay:0.2});
tl.to(".powered-tag",{opacity:1,y:0,duration:0.6,ease:"power2.out"})
.to(".hero-headline",{opacity:1,y:0,duration:0.7,ease:"power3.out"},"-=0.2")
.to(".hero-sub",{opacity:1,y:0,duration:0.6,ease:"power2.out"},"-=0.3")
.to(".hero-actions",{opacity:1,y:0,duration:0.6,ease:"power2.out"},"-=0.3")
.to(".hero-dashboard",{opacity:1,duration:0.8,ease:"power2.out"},"-=0.4")
.to(".scroll-hint",{opacity:1,duration:0.6},"-=0.2");
document.querySelectorAll(".reveal").forEach(function(el){ScrollTrigger.create({trigger:el,start:"top 85%",onEnter:function(){el.classList.add("visible");}});});
emailjs.init("Yw-AiHfGeUoivNr5S");
var form=document.getElementById("contactForm");
if(form){form.addEventListener("submit",function(e){
e.preventDefault();
var btn=form.querySelector("button");
btn.textContent="Sending...";btn.disabled=true;
var inputs=form.querySelectorAll("input,textarea");
var now=new Date().toLocaleString();
var p={name:(inputs[0]?inputs[0].value:"")+" ("+(inputs[1]?inputs[1].value:"")+") - "+(inputs[2]?inputs[2].value:""),message:inputs[3]?inputs[3].value:"",time:now};
emailjs.send("service_dkzf00m","template_19hynmp",p)
.then(function(){btn.textContent="Message Sent";btn.style.background="#4ade80";btn.style.color="#000";form.reset();
setTimeout(function(){btn.textContent="Send Message";btn.style.background="";btn.style.color="";btn.disabled=false;},3000);})
.catch(function(){btn.textContent="Error - Try Again";btn.style.background="#ef4444";btn.disabled=false;
setTimeout(function(){btn.textContent="Send Message";btn.style.background="";},3000);});});}