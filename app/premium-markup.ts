const whyHireSection = `
<section id="why-hire">
  <div class="container">
    <div class="sec-hd">
      <div class="sec-tag">Why Arnob — Recruiter Snapshot</div>
      <h2 class="sec-title">Research mindset. <span class="g">Builder energy.</span></h2>
      <span class="draw-line"></span>
      <p class="sec-sub">A focused mix of academic consistency, practical engineering, and explainable AI research.</p>
    </div>

    <div class="hire-grid stagger-parent">
      <article class="hire-card hire-card-wide stagger-child">
        <div class="hire-card-index">01 / CORE VALUE</div>
        <h3>I turn complex technical problems into clear, working systems.</h3>
        <p>From machine-learning experiments to database-backed software and compiler tooling, I care about both how a system performs and how clearly its decisions can be understood.</p>
        <div class="hire-proof-list">
          <span>Explainable AI</span>
          <span>Applied ML</span>
          <span>Software Engineering</span>
          <span>Technical Communication</span>
        </div>
      </article>

      <article class="hire-card hire-metric-card stagger-child" style="--d:.1s">
        <div class="hire-card-index">02 / CONSISTENCY</div>
        <div class="hire-metric">4.00<span>/ 4.00 CGPA</span></div>
        <p>Strong academic performance backed by continuous hands-on learning.</p>
      </article>

      <article class="hire-card hire-metric-card stagger-child" style="--d:.2s">
        <div class="hire-card-index">03 / RESEARCH</div>
        <div class="hire-metric">02<span>active research works</span></div>
        <p>Working on transparent AI for healthcare and multi-modal evaluation.</p>
      </article>

      <article class="hire-card hire-card-accent stagger-child" style="--d:.3s">
        <div class="hire-card-index">04 / GROWTH</div>
        <h3>Curious across disciplines.</h3>
        <p>Research, systems programming, IoT, media, and competitive problem-solving shape a broader product perspective.</p>
        <div class="hire-mini-stat"><strong>10+</strong><span>certifications and recognitions</span></div>
      </article>
    </div>

    <div class="hire-cta reveal">
      <div>
        <span class="hire-cta-kicker">Open to internships, research and AI projects</span>
        <h3>Looking for someone who learns fast and builds thoughtfully?</h3>
      </div>
      <div class="hire-cta-actions">
        <a class="btn-p magnetic" href="https://www.linkedin.com/in/estiuk-arafat-arnob-0350ba34a" target="_blank" rel="noopener">Start a Conversation</a>
        <a class="btn-o magnetic" href="#contact">Contact Details</a>
      </div>
    </div>
  </div>
</section>

<div class="wave premium-wave">
  <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,36 C360,86 1030,8 1440,46 L1440,90 L0,90 Z"/>
  </svg>
</div>
`;

const heroSignals = `
      <div class="hero-signals" aria-label="Professional focus">
        <span><i></i>Open to Opportunities</span>
        <span>Dhaka, Bangladesh</span>
        <span>AI · ML · DS · XAI</span>
      </div>

      <div class="hero-btns">`;

const heroRoleMarquee = `
      <div
        class="hero-role-marquee"
        role="group"
        aria-label="ML Engineer, Data Scientist, XAI Researcher, AI Enthusiast"
      >
        <div class="hero-role-track" aria-hidden="true">
          <div class="hero-role-group">
            <span class="hero-role-item">ML Engineer</span>
            <span class="hero-role-item">Data Scientist</span>
            <span class="hero-role-item">XAI Researcher</span>
            <span class="hero-role-item">AI Enthusiast</span>
          </div>
          <div class="hero-role-group">
            <span class="hero-role-item">ML Engineer</span>
            <span class="hero-role-item">Data Scientist</span>
            <span class="hero-role-item">XAI Researcher</span>
            <span class="hero-role-item">AI Enthusiast</span>
          </div>
        </div>
      </div>`;

const mobileNavigation = `
 <div class="mob-nav" id="mnav" aria-hidden="true">
  <div class="mob-nav-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
    <button type="button" class="mob-close" id="mclose" aria-label="Close navigation menu">
      <span aria-hidden="true">×</span>
    </button>

    <div class="mob-nav-header">
      <span class="mob-nav-kicker">Navigation</span>
      <h2 id="mobile-menu-title">Explore Portfolio</h2>
      <p><i></i> AI · ML · DS · XAI</p>
    </div>

    <div class="mob-nav-links" aria-label="Mobile navigation">
      <a href="#about" data-close-mobile><span>01</span><strong>About</strong><i>↗</i></a>
      <a href="#skills" data-close-mobile><span>02</span><strong>Skills</strong><i>↗</i></a>
      <a href="#projects" data-close-mobile><span>03</span><strong>Projects</strong><i>↗</i></a>
      <a href="#research" data-close-mobile><span>04</span><strong>Research</strong><i>↗</i></a>
      <a href="#experience" data-close-mobile><span>05</span><strong>Experience</strong><i>↗</i></a>
      <a href="#certifications" data-close-mobile><span>06</span><strong>Certs</strong><i>↗</i></a>
      <a href="#contact" data-close-mobile><span>07</span><strong>Contact</strong><i>↗</i></a>
    </div>

    <a class="mob-nav-cta" href="#contact" data-close-mobile>
      <span>Have an opportunity?</span>
      <strong>Let's Connect <i>↗</i></strong>
    </a>
  </div>
 </div>`;

const orbitLabels = `
    <div class="hero-vis">
      <div class="orbit-label orbit-label-one"><strong>4.00</strong><span>CGPA</span></div>
      <div class="orbit-label orbit-label-two"><strong>XAI</strong><span>Researcher</span></div>
      <div class="orbit-label orbit-label-three"><strong>ML</strong><span>Engineer</span></div>
      <div class="orbit-label orbit-label-four"><strong>Data</strong><span>Scientist</span></div>
      <div class="orbit-label orbit-label-five"><strong>Software</strong><span>Developer</span></div>
      <div class="orbit-label orbit-label-six"><strong>AI</strong><span>Enthusiast</span></div>
      <div class="hero-orb">`;

function enhanceProjectSection(markup: string) {
  const projectStart = markup.indexOf('<section id="projects">');
  const researchStart = markup.indexOf('<section id="research">');
  if (projectStart < 0 || researchStart < 0 || researchStart <= projectStart) {
    return markup;
  }

  const beforeProjects = markup.slice(0, projectStart);
  const projectSection = markup.slice(projectStart, researchStart);
  const afterProjects = markup.slice(researchStart);
  let projectNumber = 0;
  const enhancedProjects = projectSection.replace(
    /<\/ul>\s*<\/div>/g,
    () => {
      projectNumber += 1;
      return `</ul>
        <div class="project-actions">
          <span>Case study 0${projectNumber}</span>
          <div>
            <a href="https://github.com/ea-arnob-07?tab=repositories" target="_blank" rel="noopener">Explore GitHub ↗</a>
            <a href="#contact">Discuss Project</a>
          </div>
        </div>
      </div>`;
    },
  );

  return `${beforeProjects}${enhancedProjects}${afterProjects}`;
}

export function buildPremiumPortfolioMarkup(markup: string) {
  const withMobileMenuTrigger = markup.replace(
    'id="hbg" class="hamburger" aria-label="Menu"',
    'id="hbg" class="hamburger" aria-label="Open navigation menu" aria-controls="mnav" aria-expanded="false"',
  );
  const withMobileNavigation = withMobileMenuTrigger.replace(
    / <div class="mob-nav" id="mnav">[\s\S]*?<\/div>\n<\/nav>/,
    `${mobileNavigation}\n</nav>`,
  );
  const withRoleMarquee = withMobileNavigation.replace(
    `      <div class="hero-title-wrap">
        <span id="typed"></span>
        <span class="cblink"></span>
      </div>`,
    heroRoleMarquee,
  );
  const withHeroSignals = withRoleMarquee.replace(
    '      <div class="hero-btns">',
    heroSignals,
  );
  const withOrbitLabels = withHeroSignals.replace(
    '    <div class="hero-vis">\n      <div class="hero-orb">',
    orbitLabels,
  );
  const withHireSection = withOrbitLabels.replace(
    '<section id="projects">',
    `${whyHireSection}\n<section id="projects">`,
  );

  return enhanceProjectSection(withHireSection);
}
