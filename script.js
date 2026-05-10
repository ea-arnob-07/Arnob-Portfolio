/* =============================================
   js/script.js — Estiuk Arafat Arnob Portfolio
   BUGS: #6, #7, #8, #9 hidden inside
   ============================================= */

/* ── COMPONENT LOADER ── */
async function loadComponent(id, file) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Failed to load ${file}`);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  } catch (e) {
    console.error(e);
  }
}

async function loadAll() {
  // BUG #6 (Logic): Wrong component folder name — should be 'components/'
  // All component fetches will 404
  await loadComponent('nav-placeholder',            'header.html');
  await loadComponent('hero-placeholder',           'hero.html');
  await loadComponent('about-placeholder',          'about.html');
  await loadComponent('skills-placeholder',         'skills.html');
  await loadComponent('projects-placeholder',       'projects.html');
  await loadComponent('research-placeholder',       'research.html');
  await loadComponent('experience-placeholder',     'experience.html');
  await loadComponent('certifications-placeholder', 'certifications.html');
  await loadComponent('workshops-placeholder',      'workshops.html');
  await loadComponent('activities-placeholder',     'activities.html');
  await loadComponent('social-placeholder',         'social.html');
  await loadComponent('contact-placeholder',        'contact.html');

  // Init everything after components load
  initAll();
}

loadAll();

/* ── INIT ── */
function initAll() {
  initCursor();
  initScrollProgress();
  initTyping();
  initParticles();
  initBurstCanvas();
  initHeroName();
  initNavGlitch();
  initObservers();
  initNavActiveLink();
  initMobileNav();
  initForm();
}

/* ── CURSOR ── */
function initCursor() {
  const cur  = document.getElementById('cur');
  const ring = document.getElementById('cur-r');
  let mx=0, my=0, rx=0, ry=0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  (function anim() {
    rx += (mx - rx) * .11;
    ry += (my - ry) * .11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(anim);
  })();
}

/* ── SCROLL PROGRESS ── */
function initScrollProgress() {
  window.addEventListener('scroll', () => {
    const p = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    document.getElementById('sp').style.width = p + '%';
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ── TYPING ── */
function initTyping() {
  const titles = ['AI Enthusiast','ML Engineer','Data Scientist','XAI Researcher'];
  let ti=0, ci=0, del=false;
  const tel = document.getElementById('typed');

  // BUG #7 (Logic): typo in function name — calls itself as 'typ()' instead of 'type()'
  // This causes infinite ReferenceError: typ is not defined
  function type() {
    const t = titles[ti];
    if (!del) {
      ci++;
      tel.textContent = t.slice(0, ci);
      if (ci === t.length) { del = true; setTimeout(type, 1900); return; } // BUG HERE
    } else {
      ci--;
      tel.textContent = t.slice(0, ci);
      if (ci === 0) { del = false; ti = (ti + 1) % titles.length; }
    }
    setTimeout(type, del ? 55 : 88); // BUG HERE
  }
  setTimeout(type, 900);
}

/* ── PARTICLES BACKGROUND ── */
function initParticles() {
  const canvas = document.getElementById('pc');
  const ctx    = canvas.getContext('2d');
  let pts = [];

  function rsz() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  rsz();
  window.addEventListener('resize', rsz);

  for (let i=0; i<80; i++) pts.push({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    vx:(Math.random()-.5)*.27,     vy:(Math.random()-.5)*.27,
    r: Math.random()*1.3+.4,       a: Math.random()*.42+.07
  });

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pts.forEach((p,i) => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
      if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(79,142,247,${p.a})`; ctx.fill();
      for(let j=i+1;j<pts.length;j++){
        const q=pts[j], d=Math.hypot(p.x-q.x,p.y-q.y);
        if(d<115){
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
          ctx.strokeStyle=`rgba(79,142,247,${.1*(1-d/115)})`; ctx.lineWidth=.5; ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── BURST CANVAS ── */
function initBurstCanvas() {
  const bc   = document.getElementById('sec-burst');
  const bctx = bc.getContext('2d');
  bc.width = window.innerWidth; bc.height = window.innerHeight;
  window.addEventListener('resize', () => { bc.width=window.innerWidth; bc.height=window.innerHeight; });

  window.bursts = [];

  window.spawnBurst = function(x, y, color) {
    for(let i=0; i<38; i++){
      const angle = Math.random()*Math.PI*2;
      const speed = Math.random()*3.5+1;
      window.bursts.push({
        x, y,
        vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
        r:Math.random()*2.2+.5, a:1, color,
        decay:Math.random()*.025+.015
      });
    }
  };

  (function runBursts(){
    bctx.clearRect(0,0,bc.width,bc.height);
    window.bursts = window.bursts.filter(p => {
      p.x+=p.vx; p.y+=p.vy; p.vy+=.04; p.a-=p.decay;
      if(p.a<=0) return false;
      bctx.beginPath(); bctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      bctx.fillStyle = p.color.replace('A', p.a.toFixed(2));
      bctx.fill(); return true;
    });
    requestAnimationFrame(runBursts);
  })();
}

/* ── HERO NAME LETTER DROP ── */
function initHeroName() {
  const wrap = document.getElementById('heroNameInner');
  if(!wrap) return;
  const raw   = wrap.innerHTML;
  const parts = raw.split('<br>');
  let html = '';
  parts.forEach(part => {
    html += '<span style="display:block;white-space:nowrap;">';
    for(const c of part){
      if(c===' ') html += `<span class="hero-name-letter" style="display:inline-block;width:.3em;">&nbsp;</span>`;
      else        html += `<span class="hero-name-letter" style="display:inline-block;">${c}</span>`;
    }
    html += '</span>';
  });
  wrap.innerHTML = html;
  const letters = wrap.querySelectorAll('.hero-name-letter');
  letters.forEach((el,i) => {
    el.style.transitionDelay = (0.05 + i*.055) + 's';
    setTimeout(() => el.classList.add('land'), 400 + i*55);
  });
}

/* ── NAV LOGO GLITCH ── */
function initNavGlitch() {
  const logo = document.getElementById('navLogo');
  if(!logo) return;
  function run() {
    logo.classList.remove('glitch-run');
    void logo.offsetWidth;
    logo.classList.add('glitch-run');
    setTimeout(() => logo.classList.remove('glitch-run'), 420);
  }
  setInterval(run, 4000);
  logo.addEventListener('mouseenter', run);
}

/* ── OBSERVERS ── */
function initObservers() {
  // Burst colors per section
  const burstColors = {
    about:'rgba(0,229,255,A)', skills:'rgba(79,142,247,A)',
    projects:'rgba(0,229,255,A)', research:'rgba(168,85,247,A)',
    experience:'rgba(0,229,255,A)', certifications:'rgba(16,185,129,A)',
    workshops:'rgba(0,229,255,A)', activities:'rgba(168,85,247,A)',
    social:'rgba(79,142,247,A)', contact:'rgba(0,229,255,A)'
  };

  // Standard reveal
  const ro = new IntersectionObserver(es => {
    es.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold:.1 });
  document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-zoom').forEach(el=>ro.observe(el));

  // Stagger
  const staggerObs = new IntersectionObserver(es => {
    es.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('staggered');
        e.target.querySelectorAll('.stagger-child').forEach((c,i) => {
          const d = parseFloat(getComputedStyle(c).getPropertyValue('--d')) || i*0.1;
          c.style.transitionDelay = d + 's';
        });
      }
    });
  }, { threshold:.08 });
  document.querySelectorAll('.stagger-parent').forEach(el=>staggerObs.observe(el));

  // Skill bars
  const bobs = new IntersectionObserver(es => {
    es.forEach(e => {
      if(e.isIntersecting)
        e.target.querySelectorAll('.sk-fill').forEach(b => b.style.width = b.dataset.pct + '%');
    });
  }, { threshold:.25 });
  document.querySelectorAll('.sk-cat').forEach(el=>bobs.observe(el));

  // BUG #8 (Logic): sec-title words never split, so '.sec-title-word' never exists
  // wrapNodes() is defined locally but never called on document elements —
  // the querySelectorAll('.sec-title') loop is missing entirely
  // So sec-title-word spans are never created and title animation never runs.
  function wrapNodes(node) {
    if(node.nodeType===3){
      return node.textContent.replace(/(\S+)/g,'<span class="sec-title-word">$1</span>');
    } else if(node.nodeType===1){
      let out = `<${node.tagName.toLowerCase()}`;
      for(const a of node.attributes) out += ` ${a.name}="${a.value}"`;
      out += '>';
      for(const c of node.childNodes) out += wrapNodes(c);
      out += `</${node.tagName.toLowerCase()}>`;
      return out;
    }
    return '';
  }

  document.querySelectorAll('.sec-title').forEach(el => {
  el.innerHTML = wrapNodes(el);
});
  // Missing: document.querySelectorAll('.sec-title').forEach(el => { ... });

  // sec-hd observer
  const hdObs = new IntersectionObserver(es => {
    es.forEach(e => {
      if(!e.isIntersecting) return;
      const hd  = e.target;
      const sec = hd.closest('section[id]');
      const tag = hd.querySelector('.sec-tag');
      if(tag) setTimeout(() => tag.classList.add('drawn'), 80);
      const dl = hd.querySelector('.draw-line');
      if(dl) setTimeout(() => dl.classList.add('drawn'), 220);
      const sub = hd.querySelector('.sec-sub');
      if(sub) setTimeout(() => sub.classList.add('vis'), 340);
      const words = hd.querySelectorAll('.sec-title-word');
      words.forEach((w,i) => setTimeout(() => w.classList.add('vis'), 100+i*80));
      if(sec){
        const rect = hd.getBoundingClientRect();
        const col  = burstColors[sec.id] || 'rgba(0,229,255,A)';
        setTimeout(() => window.spawnBurst(rect.left+rect.width/2, rect.top+rect.height/2, col), 150);
      }
      hdObs.unobserve(hd);
    });
  }, { threshold:.3 });
  document.querySelectorAll('.sec-hd').forEach(el=>hdObs.observe(el));
}

/* ── ACTIVE NAV LINK ── */
function initNavActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let c = '';
    sections.forEach(s => { if(window.scrollY >= s.offsetTop - 220) c = s.id; });
    navAs.forEach(a => a.classList.toggle('active-link', a.getAttribute('href') === '#'+c));
  }, { passive:true });
}

/* ── MOBILE NAV ── */
function initMobileNav() {
  document.getElementById('hbg').addEventListener('click', () =>
    document.getElementById('mnav').classList.add('open'));
  document.getElementById('mclose').addEventListener('click', closeMN);
}
function closeMN() { document.getElementById('mnav').classList.remove('open'); }

/* ── TABS ── */
function showTab(id, btn) {
  document.querySelectorAll('.skills-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  btn.classList.add('active');
  // BUG #9 (Logic): setTimeout delay is 0 — bars animate before panel is visible,
  // so the CSS transition fires while display is still 'none' and width never animates
  setTimeout(() => {
    document.getElementById('tab-'+id).querySelectorAll('.sk-fill').forEach(b => {
      b.style.width = '0';
      requestAnimationFrame(() => b.style.width = b.dataset.pct + '%');
    });
  }, 0); // should be 40ms
}

/* ── FORM ── */
function initForm() {
  document.getElementById('sendBtn').addEventListener('click', function(){
    this.textContent = 'Message Sent ✓';
    this.style.background = 'linear-gradient(135deg,#10b981,#059669)';
    setTimeout(() => { this.textContent='Send Message'; this.style.background=''; }, 3200);
  });
}