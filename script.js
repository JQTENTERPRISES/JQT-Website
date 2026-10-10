document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

/* ==========================================================================
   Motion. Three things, each built from something Chris pointed at.
   ========================================================================== */
(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function(id){ return document.getElementById(id); };

  /* --- 1. headlines resolve word by word, blurred to sharp --------------
     The Pulamax reference: text arrives motion blurred and resolves sharp,
     one word at a time, never the whole line at once. */
  document.querySelectorAll('h1, h2').forEach(function(el){
    if (el.querySelector('.w')) return;
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function(w, i){
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = w;
      span.style.transitionDelay = (i * 55) + 'ms';
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('rv-head');
  });

  /* --- 2. reveals -------------------------------------------------------
     Blocks carry .rv. Headlines reveal themselves. Nothing can be stranded
     invisible: anything already on screen shows on the first frame, and a
     deadline shows the rest whatever happens. */
  document.querySelectorAll('.section .intro, .problem-grid, .proof-shell, .build-list, .steps, .cta-band .wrap')
    .forEach(function(el){ el.classList.add('rv'); });

  var targets = [].slice.call(document.querySelectorAll('.rv, .rv-head'));
  function show(el){ el.classList.add('in'); }

  if (!('IntersectionObserver' in window) || RM) {
    targets.forEach(show);
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function(el){ io.observe(el); });
    requestAnimationFrame(function(){
      targets.forEach(function(el){
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) show(el);
      });
    });
    setTimeout(function(){ targets.forEach(show); }, 2500);
  }

  /* --- 3. the symptom tiles roll per character on hover -----------------
     The Framer Egress CONTACT button: two stacked copies of each character
     in a 1em window, staggered, the window slides on hover. */
  document.querySelectorAll('.problem').forEach(function(el){
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.setAttribute('tabindex', '0');
    el.textContent = '';
    var wrap = document.createElement('span');
    wrap.className = 'roll';
    wrap.setAttribute('aria-hidden', 'true');
    [].forEach.call(text, function(ch, i){
      var col = document.createElement('span');
      col.className = 'col';
      col.style.transitionDelay = (i * 16) + 'ms';
      for (var k = 0; k < 2; k++) {
        var c = document.createElement('span');
        c.className = 'ch';
        c.textContent = ch === ' ' ? ' ' : ch;
        col.appendChild(c);
      }
      wrap.appendChild(col);
    });
    el.appendChild(wrap);
  });
})();

/* The dashboard window lies flat when you reach it, and the status chips
   arrive after it. Same reveal gate as everything else. */
(function(){
  var stage=document.querySelector('.kept-stage');
  if(!stage) return;
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){
    stage.classList.add('in'); return;
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ stage.classList.add('in'); io.disconnect(); } });
  },{threshold:.25});
  io.observe(stage);
  setTimeout(function(){ stage.classList.add('in'); },2500);
})();

/* SEASONAL JQT MARK (automatic by date, mark only)
   Lifted from the live site unchanged. Every month has a reason, so the mark
   is coloured all 365 days rather than the 73 it used to cover. */
(function(){
  var html=document.documentElement;
  var SEASONS=[
   {name:"New Year",           from:[1,1],  to:[1,6],   a:"#C9A227", b:"#2E3A46"},
   {name:"Winter",             from:[1,7],  to:[2,12],  a:"#5B7FA6", b:"#9FB6C9"},
   {name:"Valentines",         from:[2,13], to:[2,15],  a:"#C0392B", b:"#8E2F5F"},
   {name:"Late winter",        from:[2,16], to:[3,16],  a:"#5B7FA6", b:"#7D8B99"},
   {name:"St Patricks",        from:[3,15], to:[3,18],  a:"#1E7B47", b:"#C9A227"},
   {name:"Easter and Spring",  from:[3,19], to:[4,30],  a:"#8E6FC4", b:"#4FA372"},
   {name:"Late spring",        from:[5,1],  to:[5,24],  a:"#4FA372", b:"#7FA6CE"},
   {name:"Memorial Day",       from:[5,25], to:[5,31],  a:"#B22234", b:"#3C3B6E"},
   {name:"Early summer",       from:[6,1],  to:[6,25],  a:"#2E8B8B", b:"#C9A227"},
   {name:"Independence Day",   from:[6,26], to:[7,6],   a:"#B22234", b:"#3C3B6E"},
   {name:"High summer",        from:[7,7],  to:[8,31],  a:"#E08A2E", b:"#2E8B8B"},
   {name:"Early autumn",       from:[9,1],  to:[10,23], a:"#B5651D", b:"#6B8E3D"},
   {name:"Halloween",          from:[10,24],to:[10,31], a:"#EE7600", b:"#18181A"},
   {name:"November",           from:[11,1], to:[11,19], a:"#8C6239", b:"#6B8E3D"},
   {name:"Thanksgiving",       from:[11,20],to:[11,29], a:"#BF5700", b:"#5C4033"},
   {name:"Early December",     from:[11,30],to:[12,9],  a:"#2E3A46", b:"#5B7FA6"},
   {name:"Christmas",          from:[12,10],to:[12,31], a:"#C8102E", b:"#146B3A"}
  ];
  var STANDING={name:"Standing",a:"#3D5A7A",b:"#3D5A7A"};
  function seasonFor(d){
    var m=d.getMonth()+1, day=d.getDate();
    for(var i=0;i<SEASONS.length;i++){
      var s=SEASONS[i], fm=s.from[0], fd=s.from[1], tm=s.to[0], td=s.to[1];
      var aft=m>fm||(m===fm&&day>=fd), bef=m<tm||(m===tm&&day<=td);
      if(fm<=tm?(aft&&bef):(aft||bef)) return s;
    }
    return STANDING;
  }
  var s=seasonFor(new Date());
  html.style.setProperty('--mark1', s.a);
  html.style.setProperty('--mark2', s.b);
})();

/* The hero grid fades in once on load. */
(function(){
  var hero=document.querySelector('.hero');
  if(!hero) return;
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ hero.classList.add('grid-in'); });
  });
})();

/* Capability cards expand. The arrow is the control, not decoration. */
(function(){
  var cards=[].slice.call(document.querySelectorAll('.build-row'));
  if(!cards.length) return;
  cards.forEach(function(card){
    var btn=card.querySelector('.bc-go'), panel=card.querySelector('.bc-more');
    if(!btn||!panel) return;
    panel.hidden=false;               /* the panel is collapsed by CSS, not hidden */
    btn.addEventListener('click',function(){
      var open=card.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
      if(open){
        cards.forEach(function(o){
          if(o!==card&&o.classList.contains('open')){
            o.classList.remove('open');
            var b=o.querySelector('.bc-go');
            if(b) b.setAttribute('aria-expanded','false');
          }
        });
      }
    });
  });
})();


/* Homepage video hero: restrained scroll response, no scrubbed playback. */
(function(){
  var hero=document.querySelector('.video-hero');
  if(!hero) return;
  var nav=document.querySelector('.nav');
  var video=hero.querySelector('.hero-video');
  var copy=hero.querySelector('.hero-copy');
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking=false;

  if(reduced&&video){
    video.pause();
    video.removeAttribute('autoplay');
  }

  function paint(){
    ticking=false;
    var y=Math.max(0,window.scrollY||0);
    var h=Math.max(1,hero.offsetHeight);
    var p=Math.min(1,y/h);
    if(nav) nav.classList.toggle('scrolled',y>42);
    if(!reduced){
      if(video) video.style.transform='scale('+(1.015+p*.055)+') translateY('+(p*2.2)+'%)';
      if(copy){
        copy.style.transform='translateY('+(-p*48)+'px)';
        copy.style.opacity=String(Math.max(.22,1-p*1.05));
      }
    }
  }
  function onScroll(){
    if(!ticking){ticking=true;requestAnimationFrame(paint);}
  }
  paint();
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll,{passive:true});
})();


/* ==========================================================================
   HERO MEDIA DELIVERY
   The <video> elements ship with no source at all. Nothing is requested until
   this decides one is wanted, which is the only way to make reduced motion
   and Save Data cost zero bytes: a hidden or paused <video> with a <source>
   still downloads. Verified: a display:none autoplay video fired three
   requests for the 97 MB master before this change.

   Masters live outside the deployed tree as archival source and are never
   served. Only the derivatives in assets/ ship.
   ========================================================================== */
window.JQTHero = (function(){
  function reduced(){
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function saveData(){
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return !!(c && c.saveData === true);
  }
  function wantsMobile(){
    /* the phone derivative is 1280 wide, so anything up to a large tablet
       viewport is still being oversupplied by the desktop file */
    return !!(window.matchMedia && window.matchMedia('(max-width: 900px)').matches);
  }

  function attach(video, opts){
    if(!video) return null;
    opts = opts || {};
    if(reduced() || saveData()){
      video.removeAttribute('autoplay');
      return null;                       /* poster only, zero video requests */
    }
    var src = wantsMobile()
      ? video.getAttribute('data-hero-src-mobile')
      : video.getAttribute('data-hero-src-desktop');
    if(!src) return null;

    video.preload = 'auto';
    video.src = src;
    video.load();
    if(opts.autoplay !== false){
      var p = video.play();
      if(p && p.catch) p.catch(function(){});
    }
    return src;
  }

  return { attach: attach, reduced: reduced, saveData: saveData, wantsMobile: wantsMobile };
})();

/* the homepage hero loops the whole clip, so it can start as soon as it has one */
(function(){
  var v = document.querySelector('.hero-video:not(#keptHeroVideo)');
  if(v) window.JQTHero.attach(v);
})();

/* MOBILE NAVIGATION
   Desktop nav remains untouched. On phone widths, expose the hidden nav links
   behind a compact three-bar menu and mirror the existing destinations. */
(function(){
  var nav=document.querySelector('.nav');
  if(!nav) return;
  var navIn=nav.querySelector('.nav-in');
  var links=nav.querySelector('.nav-links');
  if(!navIn||!links) return;

  var button=document.createElement('button');
  button.className='mobile-menu-toggle';
  button.type='button';
  button.setAttribute('aria-label','Open navigation');
  button.setAttribute('aria-expanded','false');
  button.innerHTML='<span></span><span></span><span></span>';

  var menu=document.createElement('div');
  menu.className='mobile-menu';
  menu.setAttribute('aria-hidden','true');

  links.querySelectorAll('a').forEach(function(a){
    menu.appendChild(a.cloneNode(true));
  });

  var cta=nav.querySelector('.nav-cta');
  navIn.insertBefore(button,cta||null);
  nav.appendChild(menu);

  function close(){
    nav.classList.remove('mobile-open');
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-label','Open navigation');
    menu.setAttribute('aria-hidden','true');
  }

  button.addEventListener('click',function(){
    var open=!nav.classList.contains('mobile-open');
    nav.classList.toggle('mobile-open',open);
    button.setAttribute('aria-expanded',open?'true':'false');
    button.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    menu.setAttribute('aria-hidden',open?'false':'true');
  });

  menu.addEventListener('click',function(e){
    if(e.target.closest('a')) close();
  });

  document.addEventListener('keydown',function(e){
    if(e.key==='Escape') close();
  });

  addEventListener('resize',function(){
    if(innerWidth>900) close();
  },{passive:true});
})();


/* ATTRIBUTION
   First touch within 30 days, kept in this browser only and sent with a lead
   form so Attio knows which link produced the lead. A link carrying UTM tags
   starts a new touch. Nothing here leaves the device until a form is sent. */
(function(){
  try{
    var KEY='jqt_attr',q=new URLSearchParams(location.search),cur=JSON.parse(localStorage.getItem(KEY)||'null');
    var tags=['utm_source','utm_medium','utm_campaign','utm_content'];
    var tagged=tags.some(function(k){return q.get(k)});
    if(cur&&!(Date.now()-Date.parse(cur.first_seen)<30*864e5))cur=null;
    if(cur&&!tagged)return;
    var ref='';
    if(document.referrer){var h=new URL(document.referrer).hostname;if(h&&h!==location.hostname)ref=h}
    var a={landing_page:location.pathname,referrer:ref,first_seen:new Date().toISOString()};
    tags.forEach(function(k){a[k]=(q.get(k)||'').slice(0,160)});
    localStorage.setItem(KEY,JSON.stringify(a));
  }catch(e){}
})();
