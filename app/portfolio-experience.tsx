"use client";

import {
  animate,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import {
  ARNOB_EMAIL,
  ARNOB_LINKEDIN_URL,
  createGmailComposeUrl,
  OPPORTUNITY_SUBJECT,
} from "./lib/contact-links";
import { fallbackPortfolioContent } from "./lib/portfolio-content";
import {
  fetchPublishedPortfolioContent,
  supabase,
} from "./lib/supabase";
import { portfolioMarkup } from "./portfolio-markup";
import { buildPremiumPortfolioMarkup } from "./premium-markup";

type MovingParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  tone: number;
};

function safeProfileLink(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : fallback;
  } catch {
    return fallback;
  }
}

function ThreeParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const particleCount = 96;
    const linkDistance = 138;
    const createParticles = (): MovingParticle[] =>
      Array.from({ length: particleCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0004,
        vy: (Math.random() - 0.5) * 0.0004,
        phase: Math.random() * Math.PI * 2,
        tone: Math.floor(Math.random() * 3),
      }));

    const runCanvasFallback = () => {
      const context = canvas.getContext("2d");
      if (!context) return;

      const particles = createParticles();
      const pointColors = ["0,229,255", "56,139,253", "129,92,246"];
      let width = 1;
      let height = 1;
      let frame = 0;

      const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
      };
      const draw = () => {
        context.clearRect(0, 0, width, height);
        const now = reduceMotion ? 0 : performance.now() * 0.0011;

        particles.forEach((particle, index) => {
          if (!reduceMotion) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            if (particle.x < 0) particle.x = 1;
            if (particle.x > 1) particle.x = 0;
            if (particle.y < 0) particle.y = 1;
            if (particle.y > 1) particle.y = 0;
          }

          const x = particle.x * width;
          const y = particle.y * height;
          const pulse = reduceMotion
            ? 0.78
            : 0.72 + Math.sin(now + particle.phase) * 0.2;

          if (index % 9 === 0) {
            context.shadowBlur = 10;
            context.shadowColor = `rgba(${pointColors[particle.tone]},.72)`;
          }
          context.beginPath();
          context.arc(x, y, index % 9 === 0 ? 1.65 : 1.05, 0, Math.PI * 2);
          context.fillStyle = `rgba(${pointColors[particle.tone]},${pulse})`;
          context.fill();
          context.shadowBlur = 0;

          for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
            const other = particles[otherIndex];
            const otherX = other.x * width;
            const otherY = other.y * height;
            const distance = Math.hypot(x - otherX, y - otherY);
            if (distance >= linkDistance) continue;
            const lineTone = pointColors[(particle.tone + other.tone) % pointColors.length];
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(otherX, otherY);
            context.strokeStyle = `rgba(${lineTone},${0.16 * (1 - distance / linkDistance)})`;
            context.lineWidth = 0.55;
            context.stroke();
          }
        });
        frame = requestAnimationFrame(draw);
      };

      resize();
      window.addEventListener("resize", resize);
      draw();
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", resize);
      };
    };

    const webglContext =
      canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!webglContext) return runCanvasFallback();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        context: webglContext as WebGLRenderingContext,
      });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1);
    const particles = createParticles();
    const palette = [
      new THREE.Color(0x00e5ff),
      new THREE.Color(0x388bfd),
      new THREE.Color(0x815cf6),
    ];

    const pointPositions = new Float32Array(particles.length * 3);
    const pointColors = new Float32Array(particles.length * 3);
    particles.forEach((particle, index) => {
      const color = palette[particle.tone];
      pointColors[index * 3] = color.r;
      pointColors[index * 3 + 1] = color.g;
      pointColors[index * 3 + 2] = color.b;
    });
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(pointPositions, 3),
    );
    pointGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(pointColors, 3),
    );
    const points = new THREE.Points(
      pointGeometry,
      new THREE.PointsMaterial({
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.88,
        size: 1.8,
        sizeAttenuation: false,
        transparent: true,
        vertexColors: true,
      }),
    );
    scene.add(points);

    const maxPairs = (particles.length * (particles.length - 1)) / 2;
    const linePositions = new Float32Array(maxPairs * 6);
    const lineColors = new Float32Array(maxPairs * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3),
    );
    lineGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(lineColors, 3),
    );
    const lines = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.13,
        transparent: true,
        vertexColors: true,
      }),
    );
    scene.add(lines);

    let width = 1;
    let height = 1;
    let animationFrame = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      camera.left = 0;
      camera.right = width;
      camera.top = 0;
      camera.bottom = height;
      camera.updateProjectionMatrix();
    };

    const draw = () => {
      const pointArray = pointGeometry.attributes.position.array as Float32Array;
      const lineColorArray = lineGeometry.attributes.color.array as Float32Array;
      let lineIndex = 0;

      particles.forEach((particle, index) => {
        if (!reduceMotion) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < 0) particle.x = 1;
          if (particle.x > 1) particle.x = 0;
          if (particle.y < 0) particle.y = 1;
          if (particle.y > 1) particle.y = 0;
        }

        pointArray[index * 3] = particle.x * width;
        pointArray[index * 3 + 1] = particle.y * height;
        pointArray[index * 3 + 2] = 0;
      });

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const ax = a.x * width;
          const ay = a.y * height;
          const bx = b.x * width;
          const by = b.y * height;
          if (Math.hypot(ax - bx, ay - by) >= linkDistance) continue;

          linePositions[lineIndex] = ax;
          linePositions[lineIndex + 1] = ay;
          linePositions[lineIndex + 2] = 0;
          linePositions[lineIndex + 3] = bx;
          linePositions[lineIndex + 4] = by;
          linePositions[lineIndex + 5] = 0;

          const colorA = palette[a.tone];
          const colorB = palette[b.tone];
          lineColorArray[lineIndex] = colorA.r;
          lineColorArray[lineIndex + 1] = colorA.g;
          lineColorArray[lineIndex + 2] = colorA.b;
          lineColorArray[lineIndex + 3] = colorB.r;
          lineColorArray[lineIndex + 4] = colorB.g;
          lineColorArray[lineIndex + 5] = colorB.b;
          lineIndex += 6;
        }
      }

      pointGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineIndex / 3);
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      pointGeometry.dispose();
      lineGeometry.dispose();
      (points.material as THREE.Material).dispose();
      (lines.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, [reduceMotion]);

  return <canvas ref={canvasRef} id="pc" aria-hidden="true" />;
}

function wrapSectionTitleWords(element: Element) {
  if (element.querySelector(".sec-title-word")) return;

  const wrapNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? "").replace(
        /(\S+)/g,
        '<span class="sec-title-word">$1</span>',
      );
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      const attributes = Array.from(child.attributes)
        .map((attribute) => ` ${attribute.name}="${attribute.value}"`)
        .join("");
      const content = Array.from(child.childNodes).map(wrapNode).join("");
      return `<${child.tagName.toLowerCase()}${attributes}>${content}</${child.tagName.toLowerCase()}>`;
    }

    return "";
  };

  element.innerHTML = Array.from(element.childNodes).map(wrapNode).join("");
}

function revealVisibleContent(root: HTMLElement) {
  const inView = (element: Element, threshold = 0.92) => {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight * threshold && rect.bottom > 0;
  };

  root
    .querySelectorAll<HTMLElement>(
      ".reveal:not(.visible),.reveal-l:not(.visible),.reveal-r:not(.visible),.reveal-zoom:not(.visible)",
    )
    .forEach((element) => {
      if (inView(element)) element.classList.add("visible");
    });

  root
    .querySelectorAll<HTMLElement>(".stagger-parent:not(.staggered)")
    .forEach((element) => {
      if (!inView(element)) return;
      element.querySelectorAll<HTMLElement>(".stagger-child").forEach((child, index) => {
        const delay =
          Number.parseFloat(getComputedStyle(child).getPropertyValue("--d")) ||
          index * 0.1;
        child.style.transitionDelay = `${delay}s`;
      });
      element.classList.add("staggered");
    });

  root.querySelectorAll<HTMLElement>(".sk-cat").forEach((element) => {
    if (!inView(element)) return;
    element.querySelectorAll<HTMLElement>(".sk-fill").forEach((bar) => {
      bar.style.width = `${bar.dataset.pct ?? 0}%`;
    });
  });

  root
    .querySelectorAll<HTMLElement>(".sec-hd:not([data-revealed])")
    .forEach((heading) => {
      if (!inView(heading, 0.82)) return;
      heading.dataset.revealed = "true";
      window.setTimeout(
        () => heading.querySelector(".sec-tag")?.classList.add("drawn"),
        80,
      );
      window.setTimeout(
        () => heading.querySelector(".draw-line")?.classList.add("drawn"),
        220,
      );
      window.setTimeout(
        () => heading.querySelector(".sec-sub")?.classList.add("vis"),
        340,
      );
      heading.querySelectorAll<HTMLElement>(".sec-title-word").forEach((word, index) => {
        word.style.transitionDelay = `${0.1 + index * 0.08}s`;
        word.classList.add("vis");
      });
    });
}

export function PortfolioExperience() {
  const [portfolioContent, setPortfolioContent] = useState(
    fallbackPortfolioContent,
  );
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const portfolioMarkupWithAssetPaths = useMemo(
    () =>
      portfolioMarkup.replaceAll(
        "/img/profile.jpg",
        `${basePath}/img/profile.jpg`,
      ),
    [basePath],
  );
  const contentWithAssetPaths = useMemo(() => {
    const profileImageUrl = portfolioContent.site.hero.profileImageUrl;
    const resolvedProfileImageUrl =
      profileImageUrl.startsWith("/") &&
      !profileImageUrl.startsWith(`${basePath}/`)
        ? `${basePath}${profileImageUrl}`
        : profileImageUrl;

    return {
      ...portfolioContent,
      site: {
        ...portfolioContent.site,
        hero: {
          ...portfolioContent.site.hero,
          profileImageUrl: resolvedProfileImageUrl,
        },
      },
    };
  }, [basePath, portfolioContent]);
  const premiumPortfolioMarkup = useMemo(
    () =>
      buildPremiumPortfolioMarkup(
        portfolioMarkupWithAssetPaths,
        contentWithAssetPaths,
      ),
    [contentWithAssetPaths, portfolioMarkupWithAssetPaths],
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const burstCanvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 35,
    mass: 0.2,
    stiffness: 200,
  });

  useEffect(() => {
    let isActive = true;

    const loadContent = async () => {
      try {
        const content = await fetchPublishedPortfolioContent();
        if (isActive) setPortfolioContent(content);
      } catch {
        // Keep the verified built-in portfolio content until Supabase is ready.
      }
    };

    const refreshVisibleContent = () => {
      if (document.visibilityState === "visible") void loadContent();
    };
    const refreshFromAdmin = () => void loadContent();
    const refreshFromStorage = (event: StorageEvent) => {
      if (event.key === "arnob-portfolio-content-version") {
        void loadContent();
      }
    };
    const contentChannel = supabase
      .channel("portfolio-public-content")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_site_content",
        },
        refreshFromAdmin,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_projects",
        },
        refreshFromAdmin,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_certificates",
        },
        refreshFromAdmin,
      )
      .subscribe();

    void loadContent();
    const refreshTimer = window.setInterval(loadContent, 30_000);
    window.addEventListener("focus", loadContent);
    window.addEventListener(
      "arnob-portfolio-content-updated",
      refreshFromAdmin,
    );
    window.addEventListener("storage", refreshFromStorage);
    document.addEventListener("visibilitychange", refreshVisibleContent);

    return () => {
      isActive = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", loadContent);
      window.removeEventListener(
        "arnob-portfolio-content-updated",
        refreshFromAdmin,
      );
      window.removeEventListener("storage", refreshFromStorage);
      document.removeEventListener("visibilitychange", refreshVisibleContent);
      void supabase.removeChannel(contentChannel);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", () => {
    const root = contentRef.current;
    if (!root) return;
    root
      .querySelector<HTMLElement>("#navbar")
      ?.classList.toggle("scrolled", window.scrollY > 60);

    let current = "";
    root.querySelectorAll<HTMLElement>("section[id]").forEach((section) => {
      if (window.scrollY >= section.offsetTop - 220) current = section.id;
    });
    root
      .querySelectorAll<HTMLAnchorElement>(".nav-links a, .mob-nav-links a")
      .forEach((link) => {
        link.classList.toggle(
          "active-link",
          link.getAttribute("href") === `#${current}`,
        );
      });
    revealVisibleContent(root);
  });

  const handleContentClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    const mobileNav = contentRef.current?.querySelector<HTMLElement>("#mnav");
    const mobileMenuTrigger =
      contentRef.current?.querySelector<HTMLButtonElement>("#hbg");
    const setMobileMenuOpen = (isOpen: boolean) => {
      mobileNav?.classList.toggle("open", isOpen);
      mobileNav?.setAttribute("aria-hidden", String(!isOpen));
      mobileMenuTrigger?.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("mobile-menu-open", isOpen);
    };

    if (target.closest("#hbg")) {
      setMobileMenuOpen(true);
      return;
    }
    if (
      target === mobileNav ||
      target.closest("#mclose") ||
      target.closest("[data-close-mobile]")
    ) {
      setMobileMenuOpen(false);
    }

    const tabButton = target.closest<HTMLButtonElement>("[data-tab]");
    if (tabButton && contentRef.current) {
      const id = tabButton.dataset.tab;
      if (!id) return;
      contentRef.current
        .querySelectorAll(".skills-panel")
        .forEach((panel) => panel.classList.remove("active"));
      contentRef.current
        .querySelectorAll(".stab")
        .forEach((button) => button.classList.remove("active"));
      const panel =
        contentRef.current.querySelector<HTMLElement>(`#tab-${id}`);
      panel?.classList.add("active");
      tabButton.classList.add("active");
      window.setTimeout(() => {
        panel?.querySelectorAll<HTMLElement>(".sk-fill").forEach((bar) => {
          bar.style.width = "0";
          requestAnimationFrame(() => {
            bar.style.width = `${bar.dataset.pct ?? 0}%`;
          });
        });
        if (contentRef.current) revealVisibleContent(contentRef.current);
      }, 40);
      return;
    }

    const sendButton = target.closest<HTMLButtonElement>("#sendBtn");
    if (sendButton) {
      const form = sendButton.closest<HTMLElement>(".contact-form");
      const inputs = form?.querySelectorAll<HTMLInputElement>("input");
      const message = form?.querySelector<HTMLTextAreaElement>("textarea");
      const name = inputs?.[0]?.value.trim() ?? "";
      const email = inputs?.[1]?.value.trim() ?? "";
      const subject = inputs?.[2]?.value.trim() || OPPORTUNITY_SUBJECT;
      const body = message?.value.trim() ?? "";

      if (!name || !email || !body) {
        sendButton.textContent = "Please complete name, email & message";
        sendButton.classList.add("needs-input");
        window.setTimeout(() => {
          sendButton.textContent = "Send Message";
          sendButton.classList.remove("needs-input");
        }, 2600);
        return;
      }

      const mailBody = [
        `Hello Arnob,`,
        "",
        body,
        "",
        `Full Name: ${name}`,
        `Email Address: ${email}`,
      ].join("\n");
      const contactEmail =
        portfolioContent.site.contact.email.trim() || ARNOB_EMAIL;
      const gmailUrl = createGmailComposeUrl({
        to: contactEmail,
        subject,
        body: mailBody,
      });
      window.location.href = gmailUrl;
      sendButton.textContent = "Opening Gmail…";
      sendButton.style.background = "linear-gradient(135deg,#10b981,#059669)";
      window.setTimeout(() => {
        sendButton.textContent = "Send Message";
        sendButton.style.background = "";
      }, 3200);
    }
  };

  useEffect(() => {
    const root = contentRef.current;
    const burstCanvas = burstCanvasRef.current;
    if (!root || !burstCanvas) return;

    const cleanupCallbacks: Array<() => void> = [];
    const timeouts = new Set<number>();
    const schedule = (callback: () => void, delay: number) => {
      const timeout = window.setTimeout(() => {
        timeouts.delete(timeout);
        callback();
      }, delay);
      timeouts.add(timeout);
      return timeout;
    };

    const navbar = root.querySelector<HTMLElement>("#navbar");
    const cursor = document.querySelector<HTMLElement>("#cur");
    const cursorRing = document.querySelector<HTMLElement>("#cur-r");
    const spotlight = document.querySelector<HTMLElement>("#cursor-spotlight");
    const heroOrb = root.querySelector<HTMLElement>(".hero-orb");
    const finePointer =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let ringX = 0;
    let ringY = 0;
    let cursorFrame = 0;

    const onPointerMove = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (spotlight) {
        spotlight.style.setProperty("--spot-x", `${event.clientX}px`);
        spotlight.style.setProperty("--spot-y", `${event.clientY}px`);
      }
      if (heroOrb && finePointer) {
        const horizontal = event.clientX / window.innerWidth - 0.5;
        const vertical = event.clientY / window.innerHeight - 0.5;
        heroOrb.style.setProperty("--orb-x", `${horizontal * 12}px`);
        heroOrb.style.setProperty("--orb-y", `${vertical * 9}px`);
        heroOrb.style.setProperty("--orb-rx", `${vertical * -3.2}deg`);
        heroOrb.style.setProperty("--orb-ry", `${horizontal * 4.2}deg`);
      }
    };
    const moveCursor = () => {
      cursorX += (mouseX - cursorX) * 0.4;
      cursorY += (mouseY - cursorY) * 0.4;
      ringX += (mouseX - ringX) * 0.11;
      ringY += (mouseY - ringY) * 0.11;
      if (cursor) {
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
      }
      if (cursorRing) {
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
      }
      cursorFrame = requestAnimationFrame(moveCursor);
    };
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    moveCursor();
    cleanupCallbacks.push(() => {
      document.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(cursorFrame);
      heroOrb?.style.removeProperty("--orb-x");
      heroOrb?.style.removeProperty("--orb-y");
      heroOrb?.style.removeProperty("--orb-rx");
      heroOrb?.style.removeProperty("--orb-ry");
    });

    if (finePointer) {
      const tiltCards = Array.from(
        root.querySelectorAll<HTMLElement>(".proj-card,.hire-card"),
      );
      tiltCards.forEach((card) => {
        const onCardMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          card.style.setProperty("--card-x", `${x * 100}%`);
          card.style.setProperty("--card-y", `${y * 100}%`);
          card.style.transform = `perspective(950px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-6px)`;
        };
        const onCardLeave = () => {
          card.style.removeProperty("transform");
          card.style.setProperty("--card-x", "50%");
          card.style.setProperty("--card-y", "50%");
        };
        card.addEventListener("pointermove", onCardMove);
        card.addEventListener("pointerleave", onCardLeave);
        cleanupCallbacks.push(() => {
          card.removeEventListener("pointermove", onCardMove);
          card.removeEventListener("pointerleave", onCardLeave);
        });
      });

      const magneticElements = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".magnetic,.btn-p,.btn-o,.nav-cta,.btn-send,#recruiter-rail a",
        ),
      );
      magneticElements.forEach((element) => {
        const onMagneticMove = (event: PointerEvent) => {
          const rect = element.getBoundingClientRect();
          const x = event.clientX - (rect.left + rect.width / 2);
          const y = event.clientY - (rect.top + rect.height / 2);
          element.style.transform = `translate3d(${x * 0.13}px,${y * 0.16}px,0)`;
        };
        const onMagneticLeave = () => {
          element.style.removeProperty("transform");
        };
        element.addEventListener("pointermove", onMagneticMove);
        element.addEventListener("pointerleave", onMagneticLeave);
        cleanupCallbacks.push(() => {
          element.removeEventListener("pointermove", onMagneticMove);
          element.removeEventListener("pointerleave", onMagneticLeave);
        });
      });
    }

    const heroName = root.querySelector<HTMLElement>("#heroNameInner");
    if (heroName && !heroName.querySelector(".hero-name-letter")) {
      const lines = heroName.innerHTML.split(/<br\s*\/?>/i);
      heroName.innerHTML = lines
        .map(
          (line) =>
            `<span style="display:block;white-space:nowrap">${Array.from(line)
              .map((character) =>
                character === " "
                  ? '<span class="hero-name-letter" style="display:inline-block;width:.3em">&nbsp;</span>'
                  : `<span class="hero-name-letter" style="display:inline-block">${character}</span>`,
              )
              .join("")}</span>`,
        )
        .join("");

      heroName
        .querySelectorAll<HTMLElement>(".hero-name-letter")
        .forEach((letter, index) => {
          animate(
            letter,
            {
              opacity: [0, 1],
              transform: [
                "translateY(60px) rotateX(-90deg)",
                "translateY(0px) rotateX(0deg)",
              ],
            },
            {
              delay: 0.4 + index * 0.055,
              duration: 0.5,
              ease: [0.2, 0.8, 0.2, 1],
            },
          );
        });
    }

    const logo = root.querySelector<HTMLElement>("#navLogo");
    if (logo) {
      const runGlitch = () => {
        logo.classList.remove("glitch-run");
        void logo.offsetWidth;
        logo.classList.add("glitch-run");
        schedule(() => logo.classList.remove("glitch-run"), 420);
      };
      const glitchInterval = window.setInterval(runGlitch, 4000);
      logo.addEventListener("mouseenter", runGlitch);
      cleanupCallbacks.push(() => {
        window.clearInterval(glitchInterval);
        logo.removeEventListener("mouseenter", runGlitch);
      });
    }

    const burstContext = burstCanvas.getContext("2d");
    type Burst = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
      decay: number;
    };
    let bursts: Burst[] = [];
    let burstFrame = 0;
    const resizeBurst = () => {
      burstCanvas.width = window.innerWidth;
      burstCanvas.height = window.innerHeight;
    };
    const spawnBurst = (x: number, y: number, color: string) => {
      for (let index = 0; index < 38; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1;
        bursts.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.2 + 0.5,
          alpha: 1,
          color,
          decay: Math.random() * 0.025 + 0.015,
        });
      }
    };
    const renderBursts = () => {
      if (burstContext) {
        burstContext.clearRect(
          0,
          0,
          burstCanvas.width,
          burstCanvas.height,
        );
        bursts = bursts.filter((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.04;
          particle.alpha -= particle.decay;
          if (particle.alpha <= 0) return false;
          burstContext.beginPath();
          burstContext.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2,
          );
          burstContext.fillStyle = particle.color.replace(
            "A",
            particle.alpha.toFixed(2),
          );
          burstContext.fill();
          return true;
        });
      }
      burstFrame = requestAnimationFrame(renderBursts);
    };
    resizeBurst();
    renderBursts();
    window.addEventListener("resize", resizeBurst);
    cleanupCallbacks.push(() => {
      window.removeEventListener("resize", resizeBurst);
      cancelAnimationFrame(burstFrame);
    });

    root.querySelectorAll(".sec-title").forEach(wrapSectionTitleWords);

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 },
    );
    root
      .querySelectorAll(".reveal,.reveal-l,.reveal-r,.reveal-zoom")
      .forEach((element) => revealObserver.observe(element));

    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("staggered");
          entry.target
            .querySelectorAll<HTMLElement>(".stagger-child")
            .forEach((child, index) => {
              const delay =
                Number.parseFloat(
                  getComputedStyle(child).getPropertyValue("--d"),
                ) || index * 0.1;
              child.style.transitionDelay = `${delay}s`;
            });
        });
      },
      { threshold: 0.08 },
    );
    root
      .querySelectorAll(".stagger-parent")
      .forEach((element) => staggerObserver.observe(element));

    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target
            .querySelectorAll<HTMLElement>(".sk-fill")
            .forEach((bar) => {
              bar.style.width = `${bar.dataset.pct ?? 0}%`;
            });
        });
      },
      { threshold: 0.25 },
    );
    root
      .querySelectorAll(".sk-cat")
      .forEach((element) => barObserver.observe(element));

    const burstColors: Record<string, string> = {
      about: "rgba(0,229,255,A)",
      skills: "rgba(79,142,247,A)",
      "why-hire": "rgba(118,86,255,A)",
      projects: "rgba(0,229,255,A)",
      research: "rgba(168,85,247,A)",
      experience: "rgba(0,229,255,A)",
      certifications: "rgba(16,185,129,A)",
      workshops: "rgba(0,229,255,A)",
      activities: "rgba(168,85,247,A)",
      social: "rgba(79,142,247,A)",
      contact: "rgba(0,229,255,A)",
    };
    const headingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const heading = entry.target;
          const section = heading.closest<HTMLElement>("section[id]");
          schedule(
            () => heading.querySelector(".sec-tag")?.classList.add("drawn"),
            80,
          );
          schedule(
            () => heading.querySelector(".draw-line")?.classList.add("drawn"),
            220,
          );
          schedule(
            () => heading.querySelector(".sec-sub")?.classList.add("vis"),
            340,
          );
          heading.querySelectorAll(".sec-title-word").forEach((word, index) => {
            schedule(() => word.classList.add("vis"), 100 + index * 80);
          });
          if (section) {
            const rect = heading.getBoundingClientRect();
            schedule(
              () =>
                spawnBurst(
                  rect.left + rect.width / 2,
                  rect.top + rect.height / 2,
                  burstColors[section.id] ?? "rgba(0,229,255,A)",
                ),
              150,
            );
          }
          headingObserver.unobserve(heading);
        });
      },
      { threshold: 0.3 },
    );
    root
      .querySelectorAll(".sec-hd")
      .forEach((element) => headingObserver.observe(element));
    cleanupCallbacks.push(() => {
      revealObserver.disconnect();
      staggerObserver.disconnect();
      barObserver.disconnect();
      headingObserver.disconnect();
    });

    navbar?.classList.toggle("scrolled", window.scrollY > 60);
    requestAnimationFrame(() => revealVisibleContent(root));

    return () => {
      cleanupCallbacks.forEach((cleanup) => cleanup());
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      timeouts.clear();
    };
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const mobileNav = contentRef.current?.querySelector<HTMLElement>("#mnav");
      const mobileMenuTrigger =
        contentRef.current?.querySelector<HTMLButtonElement>("#hbg");
      mobileNav?.classList.remove("open");
      mobileNav?.setAttribute("aria-hidden", "true");
      mobileMenuTrigger?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("mobile-menu-open");
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("mobile-menu-open");
    };
  }, []);

  const githubUrl = safeProfileLink(
    portfolioContent.site.social.platforms.find(
      (platform) => platform.kind === "github",
    )?.url,
    "https://github.com/ea-arnob-07",
  );
  const linkedInUrl = safeProfileLink(
    portfolioContent.site.social.platforms.find(
      (platform) => platform.kind === "linkedin",
    )?.url,
    ARNOB_LINKEDIN_URL,
  );
  const facebookUrl = safeProfileLink(
    portfolioContent.site.social.platforms.find(
      (platform) => platform.kind === "facebook",
    )?.url,
    "https://www.facebook.com/share/1JD8Gt7NK7/?mibextid=wwXIfr",
  );
  const contactEmail =
    portfolioContent.site.contact.email.trim() || ARNOB_EMAIL;
  const gmailComposeUrl = createGmailComposeUrl({
    to: contactEmail,
    subject: OPPORTUNITY_SUBJECT,
  });

  return (
    <motion.main
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div id="cur" aria-hidden="true" />
      <div id="cur-r" aria-hidden="true" />
      <div id="cursor-spotlight" aria-hidden="true" />
      <motion.div
        id="sp"
        aria-hidden="true"
        style={{
          scaleX: smoothProgress,
          transformOrigin: "0% 50%",
          width: "100%",
        }}
      />
      <ThreeParticleBackground />
      <canvas ref={burstCanvasRef} id="sec-burst" aria-hidden="true" />
      <motion.div
        className="blob blob-1"
        aria-hidden="true"
        animate={{
          x: [0, 50, -35, 0],
          y: [0, -35, 25, 0],
          scale: [1, 1.08, 0.93, 1],
        }}
        transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="blob blob-2"
        aria-hidden="true"
        animate={{
          x: [0, -35, 50, 0],
          y: [0, 25, -35, 0],
          scale: [1, 0.93, 1.08, 1],
        }}
        transition={{ duration: 28, ease: "easeInOut", repeat: Infinity }}
      />
      <aside id="recruiter-rail" aria-label="Quick contact links">
        <span>CONNECT</span>
        <a
          href={gmailComposeUrl}
          target="_blank"
          rel="noopener"
          className="rail-link gmail"
          aria-label="Email Arnob with Gmail"
          title="Gmail"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.691 2.28 24 3.434 24 5.457Z"
            />
          </svg>
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener"
          className="rail-link github"
          aria-label="Arnob on GitHub"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10Z"
            />
          </svg>
        </a>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener"
          className="rail-link linkedin"
          aria-label="Arnob on LinkedIn"
          title="LinkedIn"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"
            />
          </svg>
        </a>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener"
          className="rail-link facebook"
          aria-label="Arnob on Facebook"
          title="Facebook"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M24 12.073C24 5.405 18.627 0 12 0 5.373 0 0 5.405 0 12.073c0 6.027 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.247h3.328l-.532 3.49h-2.796v8.437C19.612 23.093 24 18.1 24 12.073Z"
            />
          </svg>
        </a>
      </aside>
      <div
        className="portfolio-content"
        ref={contentRef}
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: premiumPortfolioMarkup }}
      />
    </motion.main>
  );
}
