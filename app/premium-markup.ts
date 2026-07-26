import type {
  PortfolioCertificate,
  PortfolioContent,
  PortfolioProject,
} from "./lib/portfolio-content";
import type {
  PortfolioSiteContent,
  SectionHeading,
  SocialPlatform,
} from "./lib/site-content";
import {
  ARNOB_LINKEDIN_URL,
  createGmailComposeUrl,
  OPPORTUNITY_SUBJECT,
} from "./lib/contact-links";

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeExternalUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return escapeHtml(url.toString());
  } catch {
    return null;
  }
}

function safeMediaUrl(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) {
    return escapeHtml(value);
  }
  return safeExternalUrl(value);
}

function safeEmail(value: string) {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function replaceRange(
  markup: string,
  startToken: string,
  endToken: string,
  replacement: string,
) {
  const start = markup.indexOf(startToken);
  const end = markup.indexOf(endToken, start + startToken.length);
  if (start < 0 || end < 0 || end <= start) return markup;
  return `${markup.slice(0, start)}${replacement}\n${markup.slice(end)}`;
}

function replaceInclusive(
  markup: string,
  startToken: string,
  endToken: string,
  replacement: string,
) {
  const start = markup.indexOf(startToken);
  const end = markup.indexOf(endToken, start + startToken.length);
  if (start < 0 || end < 0 || end <= start) return markup;
  return `${markup.slice(0, start)}${replacement}${markup.slice(end + endToken.length)}`;
}

function replaceSectionRange(
  markup: string,
  sectionId: string,
  nextSectionId: string,
  replacement: string,
) {
  return replaceRange(
    markup,
    `<section id="${sectionId}">`,
    `<section id="${nextSectionId}">`,
    replacement,
  );
}

function renderHeading(heading: SectionHeading) {
  return `<div class="sec-hd">
      <div class="sec-tag">${escapeHtml(heading.tag)}</div>
      <h2 class="sec-title">${escapeHtml(heading.title)} <span class="g">${escapeHtml(heading.accent)}</span></h2>
      <span class="draw-line"></span>
      <p class="sec-sub">${escapeHtml(heading.subtitle)}</p>
    </div>`;
}

const waves = {
  hero: `<div class="wave">
  <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,45 C360,90 1080,0 1440,45 L1440,90 L0,90 Z" fill="rgba(8,8,32,0.65)"/>
  </svg>
</div>`,
  about: `<div class="wave">
  <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,20 C480,90 960,0 1440,35 L1440,90 L0,90 Z" fill="rgba(13,13,43,0.55)"/>
  </svg>
</div>`,
  skills: `<div class="wave">
  <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,50 C300,10 1100,80 1440,20 L1440,90 L0,90 Z" fill="rgba(8,8,32,0.6)"/>
  </svg>
</div>`,
  dark: `<div class="wave">
  <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,60 C400,10 1000,80 1440,30 L1440,90 L0,90 Z" fill="rgba(8,8,32,0.6)"/>
  </svg>
</div>`,
  alternate: `<div class="wave">
  <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,30 C600,90 900,0 1440,50 L1440,90 L0,90 Z" fill="rgba(13,13,43,0.55)"/>
  </svg>
</div>`,
};

function renderMobileNavigation(site: PortfolioSiteContent) {
  const links = [
    ["01", "About", "about"],
    ["02", "Skills", "skills"],
    ["03", "Projects", "projects"],
    ["04", "Research", "research"],
    ["05", "Experience", "experience"],
    ["06", "Certs", "certifications"],
    ["07", "Contact", "contact"],
  ]
    .map(
      ([number, label, id]) =>
        `<a href="#${id}" data-close-mobile><span>${number}</span><strong>${label}</strong><i>↗</i></a>`,
    )
    .join("");

  return `<div class="mob-nav" id="mnav" aria-hidden="true">
  <div class="mob-nav-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
    <button type="button" class="mob-close" id="mclose" aria-label="Close navigation menu">
      <span aria-hidden="true">×</span>
    </button>
    <div class="mob-nav-header">
      <span class="mob-nav-kicker">Navigation</span>
      <h2 id="mobile-menu-title">Explore Portfolio</h2>
      <p><i></i> ${escapeHtml(site.hero.focusLine)}</p>
    </div>
    <div class="mob-nav-links" aria-label="Mobile navigation">${links}</div>
    <a class="mob-nav-cta" href="#contact" data-close-mobile>
      <span>Have an opportunity?</span>
      <strong>Let's Connect <i>↗</i></strong>
    </a>
  </div>
 </div>`;
}

function renderNavigation(site: PortfolioSiteContent) {
  const imageUrl =
    safeMediaUrl(site.hero.profileImageUrl) ?? "/img/profile.jpg";
  return `<nav id="navbar">
  <div style="display:flex; align-items:center; gap:10px;">
    <img src="${imageUrl}" alt="${escapeHtml(site.hero.name)}" style="width:34px; height:34px; border-radius:40%; object-fit:cover;">
    <div class="nav-logo" id="navLogo" data-text="EA">EA</div>
  </div>
  <ul class="nav-links">
    <li><a href="#about">About</a></li>
    <li><a href="#skills">Skills</a></li>
    <li><a href="#projects">Projects</a></li>
    <li><a href="#research">Research</a></li>
    <li><a href="#experience">Experience</a></li>
    <li><a href="#certifications">Certs</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <a href="#contact" class="nav-cta">Hire Me</a>
  <button type="button" id="hbg" class="hamburger" aria-label="Open navigation menu" aria-controls="mnav" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  ${renderMobileNavigation(site)}
</nav>`;
}

function renderHeroName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return escapeHtml(name);
  const last = parts.pop();
  return `${escapeHtml(parts.join(" "))}<br>${escapeHtml(last)}`;
}

function renderRoleMarquee(roles: string[]) {
  const safeRoles = roles.length ? roles : ["ML Engineer"];
  const group = safeRoles
    .map((role) => `<span class="hero-role-item">${escapeHtml(role)}</span>`)
    .join("");
  return `<div
        class="hero-role-marquee"
        role="group"
        aria-label="${escapeHtml(safeRoles.join(", "))}"
      >
        <div class="hero-role-track" aria-hidden="true">
          <div class="hero-role-group">${group}</div>
          <div class="hero-role-group">${group}</div>
        </div>
      </div>`;
}

function renderHeroSection(site: PortfolioSiteContent) {
  const imageUrl =
    safeMediaUrl(site.hero.profileImageUrl) ?? "/img/profile.jpg";
  const stats = site.hero.stats
    .map(
      (stat) =>
        `<div class="stat-i"><div class="stat-n">${escapeHtml(stat.value)}</div><div class="stat-l">${escapeHtml(stat.label)}</div></div>`,
    )
    .join("");
  const positions = ["one", "two", "three", "four", "five", "six"];
  const labels = site.hero.orbitLabels
    .slice(0, positions.length)
    .map(
      (label, index) =>
        `<div class="orbit-label orbit-label-${positions[index]}"><strong>${escapeHtml(label.value)}</strong><span>${escapeHtml(label.label)}</span></div>`,
    )
    .join("");

  return `<section id="hero">
  <div class="hero-inner">
    <div>
      <div class="hero-badge">${escapeHtml(site.hero.badge)}</div>
      <h1 class="hero-name" id="heroName">
        <span id="heroNameInner">${renderHeroName(site.hero.name)}</span>
      </h1>
      ${renderRoleMarquee(site.hero.roles)}
      <p class="hero-tag">${escapeHtml(site.hero.tagline)}</p>
      <div class="hero-signals" aria-label="Professional focus">
        <span><i></i>${escapeHtml(site.hero.badge)}</span>
        <span>${escapeHtml(site.hero.location)}</span>
        <span>${escapeHtml(site.hero.focusLine)}</span>
      </div>
      <div class="hero-btns">
        <a href="#projects" class="btn-p">View Projects</a>
        <a href="#contact" class="btn-o">Get In Touch</a>
      </div>
      <div class="hero-stats">${stats}</div>
    </div>
    <div class="hero-vis">
      ${labels}
      <div class="hero-orb">
        <div class="hero-av">
          <img src="${imageUrl}" alt="${escapeHtml(site.hero.name)}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
        </div>
      </div>
    </div>
  </div>
</section>

${waves.hero}

`;
}

function renderAboutSection(site: PortfolioSiteContent) {
  const paragraphs = site.about.paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  const highlights = site.about.highlights
    .map(
      (highlight) =>
        `<div class="hl-item"><div class="hl-dot"></div>${escapeHtml(highlight)}</div>`,
    )
    .join("");
  const info = site.about.info
    .map((item) => {
      const value =
        item.kind === "email" && safeEmail(item.value)
          ? `<a href="mailto:${escapeHtml(item.value.trim())}">${escapeHtml(item.value)}</a>`
          : item.kind === "status"
            ? `<span class="online-dot"></span>${escapeHtml(item.value)}`
            : escapeHtml(item.value);
      return `<div class="info-item">
              <span class="info-lbl">${escapeHtml(item.label)}</span>
              <span class="info-val">${value}</span>
            </div>`;
    })
    .join("");

  return `<section id="about">
  <div class="container">
    ${renderHeading(site.about.heading)}
    <div class="about-grid">
      <div class="reveal-l">
        <div class="about-text">${paragraphs}</div>
        <div class="about-hl">${highlights}</div>
      </div>
      <div class="reveal-r">
        <div class="about-card"><div class="info-grid">${info}</div></div>
      </div>
    </div>
  </div>
</section>

${waves.about}

`;
}

function renderSkillsSection(site: PortfolioSiteContent) {
  const tabs = site.skills.groups
    .map(
      (group, index) =>
        `<button class="stab${index === 0 ? " active" : ""}" data-tab="${escapeHtml(group.id)}">${escapeHtml(group.label)}</button>`,
    )
    .join("");
  const panels = site.skills.groups
    .map((group, groupIndex) => {
      const categories = group.categories
        .map((category, categoryIndex) => {
          const skills = category.skills
            .map((skill) => {
              const level = Math.max(0, Math.min(100, Number(skill.level) || 0));
              return `<div class="sk-row">
              <div class="sk-lbl"><span class="sk-nm">${escapeHtml(skill.name)}</span><span class="sk-pc">${level}%</span></div>
              <div class="sk-track"><div class="sk-fill" data-pct="${level}"></div></div>
            </div>`;
            })
            .join("");
          const chips = category.chips.length
            ? `<div class="ml-chips" style="margin-top:14px;">${category.chips
                .map(
                  (chip) =>
                    `<span class="ml-chip p">${escapeHtml(chip)}</span>`,
                )
                .join("")}</div>`
            : "";
          return `<div class="sk-cat reveal"${categoryIndex ? ` style="transition-delay:${Math.min(categoryIndex * 0.1, 0.5)}s"` : ""}>
          <div class="cat-ic">${escapeHtml(category.icon)}</div>
          <div class="cat-t">${escapeHtml(category.title)}</div>
          <div class="sk-bars">${skills}</div>
          ${chips}
        </div>`;
        })
        .join("");
      const chipsRow = group.chips.length
        ? `<div class="models-row reveal">
        <div class="models-row-lbl">${escapeHtml(group.chipsLabel)}</div>
        <div class="ml-chips">${group.chips
          .map(
            (chip, index) =>
              `<span class="ml-chip${index >= 6 && index <= 9 ? " p" : ""}">${escapeHtml(chip)}</span>`,
          )
          .join("")}</div>
      </div>`
        : "";
      return `<div class="skills-panel${groupIndex === 0 ? " active" : ""}" id="tab-${escapeHtml(group.id)}">
      <div class="skills-grid">${categories}</div>
      ${chipsRow}
    </div>`;
    })
    .join("");

  return `<section id="skills">
  <div class="container">
    ${renderHeading(site.skills.heading)}
    <div class="skills-tabs reveal">${tabs}</div>
    ${panels}
  </div>
</section>

${waves.skills}

`;
}

function renderRecruiterSection(site: PortfolioSiteContent) {
  const content = site.recruiter;
  const proof = content.proofPoints
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  const linkedIn = site.social.platforms.find(
    (platform) => platform.kind === "linkedin",
  );
  const linkedInUrl =
    safeExternalUrl(linkedIn?.url) ?? ARNOB_LINKEDIN_URL;

  return `<section id="why-hire">
  <div class="container">
    ${renderHeading(content.heading)}
    <div class="hire-grid stagger-parent">
      <article class="hire-card hire-card-wide stagger-child">
        <div class="hire-card-index">01 / CORE VALUE</div>
        <h3>${escapeHtml(content.coreTitle)}</h3>
        <p>${escapeHtml(content.coreDescription)}</p>
        <div class="hire-proof-list">${proof}</div>
      </article>
      <article class="hire-card hire-metric-card stagger-child" style="--d:.1s">
        <div class="hire-card-index">02 / CONSISTENCY</div>
        <div class="hire-metric">${escapeHtml(content.cgpaValue)}<span>${escapeHtml(content.cgpaLabel)}</span></div>
        <p>${escapeHtml(content.cgpaDescription)}</p>
      </article>
      <article class="hire-card hire-metric-card stagger-child" style="--d:.2s">
        <div class="hire-card-index">03 / RESEARCH</div>
        <div class="hire-metric">${escapeHtml(content.researchValue)}<span>${escapeHtml(content.researchLabel)}</span></div>
        <p>${escapeHtml(content.researchDescription)}</p>
      </article>
      <article class="hire-card hire-card-accent stagger-child" style="--d:.3s">
        <div class="hire-card-index">04 / GROWTH</div>
        <h3>${escapeHtml(content.growthTitle)}</h3>
        <p>${escapeHtml(content.growthDescription)}</p>
        <div class="hire-mini-stat"><strong>${escapeHtml(content.recognitionValue)}</strong><span>${escapeHtml(content.recognitionLabel)}</span></div>
      </article>
    </div>
    <div class="hire-cta reveal">
      <div>
        <span class="hire-cta-kicker">${escapeHtml(content.ctaKicker)}</span>
        <h3>${escapeHtml(content.ctaTitle)}</h3>
      </div>
      <div class="hire-cta-actions">
        <a class="btn-p magnetic" href="${linkedInUrl}" target="_blank" rel="noopener">Start a Conversation</a>
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
}

function renderProjectCard(
  project: PortfolioProject,
  index: number,
  githubFallback: string,
) {
  const githubUrl = safeExternalUrl(project.github_url) ?? githubFallback;
  const liveUrl = safeExternalUrl(project.live_url);
  const delay = Math.min(index * 0.12, 0.72).toFixed(2);
  const tags = project.tags
    .map(
      (tag, tagIndex) =>
        `<span class="ptag${tagIndex >= 3 ? " p" : ""}">${escapeHtml(tag)}</span>`,
    )
    .join("");
  const features = project.features
    .map((feature) => `<li>${escapeHtml(feature)}</li>`)
    .join("");
  const secondaryAction = liveUrl
    ? `<a href="${liveUrl}" target="_blank" rel="noopener">Live Demo ↗</a>`
    : '<a href="#contact">Discuss Project</a>';

  return `<div class="proj-card stagger-child" style="--d:${delay}s">
        <div class="proj-num">${String(index + 1).padStart(2, "0")} &nbsp;/&nbsp; ${escapeHtml(project.category)}</div>
        <h3 class="proj-title">${escapeHtml(project.title)}</h3>
        <p class="proj-desc">${escapeHtml(project.description)}</p>
        <div class="proj-tags">${tags}</div>
        <ul class="proj-feats">${features}</ul>
        <div class="project-actions">
          <span>Case study ${String(index + 1).padStart(2, "0")}</span>
          <div>
            <a href="${githubUrl}" target="_blank" rel="noopener">Explore GitHub ↗</a>
            ${secondaryAction}
          </div>
        </div>
      </div>`;
}

function renderProjectsSection(
  projects: PortfolioProject[],
  site: PortfolioSiteContent,
) {
  const github =
    site.social.platforms.find((platform) => platform.kind === "github")?.url ??
    "https://github.com/ea-arnob-07";
  const githubFallback =
    safeExternalUrl(github) ?? "https://github.com/ea-arnob-07";
  const cards = projects.length
    ? projects
        .map((project, index) =>
          renderProjectCard(project, index, githubFallback),
        )
        .join("")
    : `<div class="proj-card stagger-child dynamic-empty-card">
        <div class="proj-num">NEW WORK IN PROGRESS</div>
        <h3 class="proj-title">The next case study is being prepared.</h3>
        <p class="proj-desc">Fresh engineering and research work will appear here soon.</p>
      </div>`;

  return `<section id="projects">
  <div class="container">
    ${renderHeading(site.projectsHeading)}
    <div class="proj-grid stagger-parent">${cards}</div>
  </div>
</section>

${waves.alternate}

`;
}

function renderResearchSection(site: PortfolioSiteContent) {
  const items = site.research.items
    .map(
      (item, index) => `<div class="res-card stagger-child"${index ? ` style="--d:${Math.min(index * 0.15, 0.75)}s"` : ""}>
        <div class="res-status">${escapeHtml(item.status)}</div>
        <h3 class="res-title">${escapeHtml(item.title)}</h3>
        <p class="res-desc">${escapeHtml(item.description)}</p>
        <div class="res-tags">${item.tags
          .map((tag) => `<span class="rtag">${escapeHtml(tag)}</span>`)
          .join("")}</div>
      </div>`,
    )
    .join("");
  return `<section id="research">
  <div class="container">
    ${renderHeading(site.research.heading)}
    <div class="res-grid stagger-parent">${items}</div>
  </div>
</section>

${waves.dark}

`;
}

function renderExperienceSection(site: PortfolioSiteContent) {
  const items = site.experience.items
    .map(
      (item) => `<div class="tl-item">
        <div class="tl-dot">${escapeHtml(item.icon)}</div>
        <div class="tl-body">
          <div class="tl-date">${escapeHtml(item.period)}</div>
          <div class="tl-role">${escapeHtml(item.role)}</div>
          <div class="tl-org">${escapeHtml(item.organization)}</div>
          <div class="tl-desc">${escapeHtml(item.description)}</div>
        </div>
      </div>`,
    )
    .join("");
  return `<section id="experience">
  <div class="container">
    ${renderHeading(site.experience.heading)}
    <div class="timeline reveal">${items}</div>
  </div>
</section>

${waves.dark}

`;
}

function renderCertificateCard(
  certificate: PortfolioCertificate,
  index: number,
) {
  const credentialUrl = safeExternalUrl(certificate.credential_url);
  const delay = Math.min(index * 0.15, 0.75).toFixed(2);
  const badgeClass = /award|champion/i.test(certificate.badge) ? " aw" : "";
  const dateLabel = certificate.issued_on
    ? ` · ${escapeHtml(certificate.issued_on)}`
    : "";
  const content = `<div class="cert-ic">${escapeHtml(certificate.icon || "🎯")}</div>
        <div class="cert-body">
          <div class="cert-nm">${escapeHtml(certificate.name)}</div>
          <div class="cert-iss">${escapeHtml(certificate.issuer)}${dateLabel}</div>
          <div class="cert-bdg${badgeClass}">${escapeHtml(certificate.badge)}</div>
        </div>`;

  return credentialUrl
    ? `<a class="cert-card dynamic-cert-link stagger-child" style="--d:${delay}s" href="${credentialUrl}" target="_blank" rel="noopener" aria-label="View ${escapeHtml(certificate.name)} credential">${content}</a>`
    : `<div class="cert-card stagger-child" style="--d:${delay}s">${content}</div>`;
}

function renderCertificationsSection(
  certificates: PortfolioCertificate[],
  site: PortfolioSiteContent,
) {
  const cards = certificates.length
    ? certificates.map(renderCertificateCard).join("")
    : `<div class="cert-card stagger-child dynamic-empty-card">
        <div class="cert-ic">✦</div>
        <div class="cert-body">
          <div class="cert-nm">New credentials are on the way.</div>
          <div class="cert-iss">Updates will appear here soon.</div>
        </div>
      </div>`;
  return `<section id="certifications">
  <div class="container">
    ${renderHeading(site.certificatesHeading)}
    <div class="cert-grid stagger-parent">${cards}</div>
  </div>
</section>

`;
}

function renderWorkshopSection(site: PortfolioSiteContent) {
  const points = site.workshop.points
    .map(
      (point) => `<div class="ws-pt">
          <div class="ws-pt-ic">${escapeHtml(point.icon)}</div>
          <p>${escapeHtml(point.text)}</p>
        </div>`,
    )
    .join("");
  return `<section id="workshops">
  <div class="container">
    ${renderHeading(site.workshop.heading)}
    <div class="ws-card reveal">
      <div class="ws-hd">
        <div class="ws-ic">${escapeHtml(site.workshop.icon)}</div>
        <div class="ws-meta">
          <h3>${escapeHtml(site.workshop.title)}</h3>
          <p>${escapeHtml(site.workshop.subtitle)}</p>
        </div>
      </div>
      <div class="ws-pts">${points}</div>
    </div>
  </div>
</section>
`;
}

function renderActivitiesSection(site: PortfolioSiteContent) {
  const cards = site.activities.items
    .map(
      (item, index) => `<div class="act-card stagger-child"${index ? ` style="--d:${Math.min(index * 0.15, 0.75)}s"` : ""}>
        <div class="act-ic">${escapeHtml(item.icon)}</div>
        <div class="act-t">${escapeHtml(item.title)}</div>
        <div class="act-d">${escapeHtml(item.description)}</div>
      </div>`,
    )
    .join("");
  return `<section id="activities">
  <div class="container">
    ${renderHeading(site.activities.heading)}
    <div class="act-grid stagger-parent">${cards}</div>
  </div>
</section>

${waves.alternate}

`;
}

const socialIcons = {
  github:
    '<svg viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  facebook:
    '<svg viewBox="0 0 24 24" fill="white"><path d="M24 12.073C24 5.405 18.627 0 12 0 5.373 0 0 5.405 0 12.073c0 6.027 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.247h3.328l-.532 3.49h-2.796v8.437C19.612 23.093 24 18.1 24 12.073z"/></svg>',
};

const platformColor = {
  github: "#58a6ff",
  linkedin: "#70b5f9",
  facebook: "#74a8fc",
};

const platformBadgeStyle = {
  github:
    "background:rgba(240,246,252,.07);color:#f0f6fc;border:1px solid rgba(240,246,252,.15);",
  linkedin:
    "background:rgba(10,102,194,.12);color:#70b5f9;border:1px solid rgba(10,102,194,.3);",
  facebook:
    "background:rgba(24,119,242,.1);color:#74a8fc;border:1px solid rgba(24,119,242,.25);",
};

function renderSocialCard(platform: SocialPlatform, index: number) {
  const url = safeExternalUrl(platform.url) ?? "#contact";
  const color = platformColor[platform.kind];
  return `<a href="${url}" target="_blank" rel="noopener" class="soc-card ${platform.kind} stagger-child"${index ? ` style="--d:${Math.min(index * 0.15, 0.6)}s"` : ""}>
        <div class="soc-badge" style="${platformBadgeStyle[platform.kind]}">${escapeHtml(platform.badge)}</div>
        <div class="soc-icon-wrap">${socialIcons[platform.kind]}</div>
        <div class="soc-name" style="color:${color};">${escapeHtml(platform.name)}</div>
        <div class="soc-handle">${escapeHtml(platform.handle)}</div>
        <div class="soc-desc">${escapeHtml(platform.description)}</div>
        <div class="soc-btn" style="margin-bottom:24px;">View Profile ↗</div>
        <div class="soc-stat">
          <div class="soc-stat-item"><div class="soc-stat-n">${escapeHtml(platform.firstStatValue)}</div><div class="soc-stat-l">${escapeHtml(platform.firstStatLabel)}</div></div>
          <div class="soc-stat-item"><div class="soc-stat-n">${escapeHtml(platform.secondStatValue)}</div><div class="soc-stat-l">${escapeHtml(platform.secondStatLabel)}</div></div>
        </div>
      </a>`;
}

function renderSocialSection(site: PortfolioSiteContent) {
  const cards = site.social.platforms.map(renderSocialCard).join("");
  return `<section id="social">
  <div class="container">
    ${renderHeading(site.social.heading)}
    <div class="social-cards stagger-parent">${cards}</div>
  </div>
</section>

`;
}

function renderMap(site: PortfolioSiteContent) {
  return `<div class="map-wrap reveal">
          <svg viewBox="0 0 420 190" width="100%" height="190" xmlns="http://www.w3.org/2000/svg" style="display:block;">
            <defs><radialGradient id="mapGlow" cx="49%" cy="46%" r="30%"><stop offset="0%" stop-color="rgba(0,229,255,0.12)"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs>
            <rect width="420" height="190" fill="#08082a"/>
            <g stroke="rgba(79,142,247,0.07)" stroke-width="1">
              <line x1="0" y1="38" x2="420" y2="38"/><line x1="0" y1="76" x2="420" y2="76"/><line x1="0" y1="114" x2="420" y2="114"/><line x1="0" y1="152" x2="420" y2="152"/>
              <line x1="84" y1="0" x2="84" y2="190"/><line x1="168" y1="0" x2="168" y2="190"/><line x1="252" y1="0" x2="252" y2="190"/><line x1="336" y1="0" x2="336" y2="190"/>
            </g>
            <path d="M185,28 L218,26 L245,38 L260,58 L264,82 L256,106 L240,126 L226,140 L210,148 L195,142 L180,126 L168,104 L165,78 L169,54 Z" fill="rgba(79,142,247,0.065)" stroke="rgba(79,142,247,0.2)" stroke-width="1.2"/>
            <circle cx="212" cy="92" r="22" fill="url(#mapGlow)"/><circle cx="212" cy="92" r="12" fill="rgba(0,229,255,0.07)"/>
            <g class="map-pin-grp"><circle cx="212" cy="86" r="10" fill="none" stroke="rgba(0,229,255,0.45)" stroke-width="1.5"/><circle cx="212" cy="86" r="5" fill="#00e5ff"/><line x1="212" y1="96" x2="212" y2="106" stroke="#00e5ff" stroke-width="1.5" stroke-linecap="round"/><circle cx="212" cy="107" r="2" fill="rgba(0,229,255,0.35)"/></g>
            <circle cx="212" cy="92" r="14" fill="none" stroke="rgba(0,229,255,0.28)" stroke-width="1"><animate attributeName="r" values="10;24;10" dur="3.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0;0.5" dur="3.2s" repeatCount="indefinite"/></circle>
            <text x="232" y="84" fill="#00e5ff" font-family="Space Grotesk,sans-serif" font-size="12" font-weight="600">${escapeHtml(site.contact.locationCity)}</text>
            <text x="232" y="98" fill="#9da8c7" font-family="Space Grotesk,sans-serif" font-size="9.5">${escapeHtml(site.contact.locationCountry)}</text>
            <text x="18" y="180" fill="rgba(79,142,247,0.3)" font-size="7.5" font-family="JetBrains Mono,monospace">${escapeHtml(site.contact.coordinates)}</text>
          </svg>
        </div>`;
}

function renderContactSection(site: PortfolioSiteContent) {
  const email = safeEmail(site.contact.email);
  const mailHref = email ? `mailto:${escapeHtml(email)}` : "#contact";
  return `<section id="contact">
  <div class="container">
    ${renderHeading(site.contact.heading)}
    <div class="contact-grid">
      <div class="reveal-l">
        <div class="contact-left">
          <h3>${escapeHtml(site.contact.title)}</h3>
          <p>${escapeHtml(site.contact.description)}</p>
        </div>
        <div class="contact-items">
          <a href="${mailHref}" class="ci"><div class="ci-ic">@</div><div><div class="ci-lbl">Email</div><div class="ci-val">${escapeHtml(site.contact.email)}</div></div></a>
          <div class="ci"><div class="ci-ic">#</div><div><div class="ci-lbl">Phone</div><div class="ci-val">${escapeHtml(site.contact.phone)}</div></div></div>
          <div class="ci"><div class="ci-ic">U</div><div><div class="ci-lbl">University</div><div class="ci-val">${escapeHtml(site.contact.university)}</div></div></div>
        </div>
        ${renderMap(site)}
      </div>
      <div class="reveal-r">
        <div class="contact-form">
          <div class="fg"><label>Your Name</label><input type="text" placeholder="${escapeHtml(site.contact.formNamePlaceholder)}"></div>
          <div class="fg"><label>Email Address</label><input type="email" placeholder="${escapeHtml(site.contact.formEmailPlaceholder)}"></div>
          <div class="fg"><label>Subject</label><input type="text" placeholder="${escapeHtml(site.contact.formSubjectPlaceholder)}"></div>
          <div class="fg"><label>Message</label><textarea placeholder="${escapeHtml(site.contact.formMessagePlaceholder)}"></textarea></div>
          <button class="btn-send" id="sendBtn">Send Message</button>
        </div>
      </div>
    </div>
  </div>
</section>

`;
}

function footerSocialLink(platform: SocialPlatform) {
  const url = safeExternalUrl(platform.url);
  if (!url) return "";
  const shortClass =
    platform.kind === "github"
      ? "gh"
      : platform.kind === "linkedin"
        ? "li"
        : "fb";
  return `<a href="${url}" target="_blank" rel="noopener" class="sl ${shortClass}" title="${escapeHtml(platform.name)}">${socialIcons[platform.kind].replace('fill="white"', 'fill="currentColor"')}</a>`;
}

function renderFooter(site: PortfolioSiteContent) {
  const email = safeEmail(site.contact.email);
  const links = site.social.platforms.map(footerSocialLink).join("");
  const emailLink = email
    ? `<a href="${escapeHtml(createGmailComposeUrl({ to: email, subject: OPPORTUNITY_SUBJECT }))}" target="_blank" rel="noopener" class="sl em" title="Email with Gmail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg></a>`
    : "";
  return `<footer>
  <div class="f-inner">
    <div class="f-logo">${escapeHtml(site.footer.name)}</div>
    <div class="social-links">${links}${emailLink}</div>
    <p class="f-text">${escapeHtml(site.footer.tagline)}</p>
    <p class="f-text" style="margin-top:6px;font-size:.76rem;">${escapeHtml(site.footer.copyright)}</p>
  </div>
</footer>`;
}

export function buildPremiumPortfolioMarkup(
  markup: string,
  content?: PortfolioContent,
) {
  if (!content) return markup;

  const { site } = content;
  let rendered = replaceRange(
    markup,
    '<nav id="navbar">',
    '<section id="hero">',
    renderNavigation(site),
  );
  rendered = replaceSectionRange(
    rendered,
    "hero",
    "about",
    renderHeroSection(site),
  );
  rendered = replaceSectionRange(
    rendered,
    "about",
    "skills",
    renderAboutSection(site),
  );
  rendered = replaceSectionRange(
    rendered,
    "skills",
    "projects",
    `${renderSkillsSection(site)}${renderRecruiterSection(site)}`,
  );
  rendered = replaceSectionRange(
    rendered,
    "projects",
    "research",
    renderProjectsSection(content.projects, site),
  );
  rendered = replaceSectionRange(
    rendered,
    "research",
    "experience",
    renderResearchSection(site),
  );
  rendered = replaceSectionRange(
    rendered,
    "experience",
    "certifications",
    renderExperienceSection(site),
  );
  rendered = replaceSectionRange(
    rendered,
    "certifications",
    "workshops",
    renderCertificationsSection(content.certificates, site),
  );
  rendered = replaceSectionRange(
    rendered,
    "workshops",
    "activities",
    renderWorkshopSection(site),
  );
  rendered = replaceSectionRange(
    rendered,
    "activities",
    "social",
    renderActivitiesSection(site),
  );
  rendered = replaceSectionRange(
    rendered,
    "social",
    "contact",
    renderSocialSection(site),
  );
  rendered = replaceRange(
    rendered,
    '<section id="contact">',
    "<footer>",
    renderContactSection(site),
  );
  return replaceInclusive(
    rendered,
    "<footer>",
    "</footer>",
    renderFooter(site),
  );
}
