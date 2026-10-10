/* Lead forms. Posts to /api/lead (the jqt-lead Worker, same origin).
   A form opts in with data-lead="<type>"; data-next sends the visitor on after
   a successful submission; data-remember keeps their own details in this
   browser so the next form does not ask twice. Nothing goes in the URL. */
(function(){
  var WHO='jqt_lead', ATTR='jqt_attr';
  function load(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function drop(k){try{localStorage.removeItem(k)}catch(e){}}
  var MSG={required:'Required.',invalid:'Check this one.'};

  Array.prototype.forEach.call(document.querySelectorAll('form[data-lead]'),function(form){
    var wrap=form.closest('.lead-wrap')||form.parentNode;
    var t0=Date.now(), busy=false;
    var btn=form.querySelector('button[type=submit]');
    var status=form.querySelector('.lead-status');
    var who=load(WHO);

    function el(n){return form.elements[n]}
    function setVal(n,v){var e=el(n);if(!e||!v)return;
      if(e.length!==undefined&&e.tagName!=='SELECT'){Array.prototype.forEach.call(e,function(r){r.checked=(r.value===v)})}else{e.value=v}}
    function val(n){var e=el(n);if(!e)return'';
      if(e.length!==undefined&&e.tagName!=='SELECT'){var c=Array.prototype.filter.call(e,function(r){return r.checked})[0];return c?c.value:''}
      return(e.value||'').trim()}

    // Prefill from this visitor's own earlier submission.
    if(who){
      ['name','email','company','role','rooms'].forEach(function(n){setVal(n,who[n])});
      var line=form.querySelector('[data-known-name]');
      var complete=who.name&&who.email&&who.company&&who.role&&(!el('rooms')||who.rooms);
      if(line&&complete&&form.hasAttribute('data-remember')){
        line.textContent=who.name.split(' ')[0]+', '+who.company;
        form.setAttribute('data-known','');
      }
    }
    var notYou=form.querySelector('[data-not-you]');
    if(notYou)notYou.addEventListener('click',function(){
      drop(WHO);
      ['name','email','company'].forEach(function(n){if(el(n))el(n).value=''});
      if(el('role'))el('role').selectedIndex=0;
      if(el('rooms'))Array.prototype.forEach.call(el('rooms'),function(r){r.checked=false});
      form.removeAttribute('data-known');
      if(el('name'))el('name').focus();
    });

    // A field stops shouting the moment it is touched.
    form.addEventListener('input',function(ev){
      var f=ev.target.closest&&ev.target.closest('.field[data-bad]');
      if(f){f.removeAttribute('data-bad');var m=f.querySelector('.err');if(m)m.textContent=''}
    });
    function clearErrors(){
      Array.prototype.forEach.call(form.querySelectorAll('.field[data-bad]'),function(f){f.removeAttribute('data-bad')});
      Array.prototype.forEach.call(form.querySelectorAll('.field .err'),function(e){e.textContent=''});
      if(status){status.textContent='';status.className='lead-status'}
    }
    function mark(errors){
      var firstBad=null;
      Object.keys(errors).forEach(function(n){
        var e=el(n);if(!e)return;
        var node=e.length!==undefined&&e.tagName!=='SELECT'?e[0]:e;
        var f=node.closest('.field');if(!f)return;
        f.setAttribute('data-bad','');
        var m=f.querySelector('.err');if(m)m.textContent=MSG[errors[n]]||MSG.invalid;
        if(!firstBad)firstBad=node;
      });
      form.removeAttribute('data-known');
      if(firstBad)firstBad.focus();
    }
    function local(){
      var errors={};
      if(val('name').length<2)errors.name='required';
      if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(val('email')))errors.email=val('email')?'invalid':'required';
      if(val('company').length<2)errors.company='required';
      if(el('role')&&!val('role'))errors.role='required';
      if(el('rooms')&&!val('rooms'))errors.rooms='required';
      if(el('message')&&el('message').required&&val('message').length<5)errors.message='required';
      return errors;
    }
    function fail(text){
      busy=false;btn.disabled=false;
      if(status){status.className='lead-status bad';status.innerHTML=text}
    }

    form.addEventListener('submit',function(ev){
      ev.preventDefault();
      if(busy)return;
      clearErrors();
      var errors=local();
      if(Object.keys(errors).length){mark(errors);return}
      busy=true;btn.disabled=true;
      var data={
        type:form.getAttribute('data-lead'),
        name:val('name'),email:val('email'),company:val('company'),role:val('role'),rooms:val('rooms'),
        message:val('message'),website:val('website'),elapsed:Date.now()-t0,
        attr:load(ATTR)||{},page:location.pathname
      };
      var next=form.getAttribute('data-next');
      var fallback=' Or write to <a href="mailto:hello@jqtenterprises.com">hello@jqtenterprises.com</a>.'+
        (next?' <a href="'+next+'">Open The Rowan anyway</a>.':'');
      fetch('/api/lead',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return{status:r.status,j:j}})})
        .then(function(res){
          if(res.status===200&&res.j.ok){
            if(form.hasAttribute('data-remember')||who)save(WHO,{name:data.name,email:data.email,company:data.company,role:data.role,rooms:data.rooms||(who&&who.rooms)||''});
            if(next){location.href=next;return}
            var done=wrap.querySelector('[data-done-email]');if(done)done.textContent=data.email;
            wrap.setAttribute('data-done','');
            var h=wrap.querySelector('.lead-done');if(h){h.setAttribute('tabindex','-1');h.focus()}
            return;
          }
          if(res.status===422&&res.j.fields){busy=false;btn.disabled=false;mark(res.j.fields);return}
          if(res.status===429)return fail('Too many tries from this connection. Give it a minute.'+fallback);
          fail('That did not go through.'+fallback);
        })
        .catch(function(){fail('No connection.'+fallback)});
    });
  });
})();
