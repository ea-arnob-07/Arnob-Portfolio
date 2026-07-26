"use client";

import {
  animate,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { type MouseEvent as ReactMouseEvent, useEffect, useRef } from "react";
import * as THREE from "three";
import { portfolioMarkup } from "./portfolio-markup";

type MovingParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  tone: number;
};

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
  const contentRef = useRef<HTMLDivElement>(null);
  const burstCanvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 35,
    mass: 0.2,
    stiffness: 200,
  });

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
    root.querySelectorAll<HTMLAnchorElement>(".nav-links a").forEach((link) => {
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

    if (target.closest("#hbg")) {
      mobileNav?.classList.add("open");
      return;
    }
    if (target.closest("#mclose") || target.closest("[data-close-mobile]")) {
      mobileNav?.classList.remove("open");
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
      sendButton.textContent = "Message Sent ✓";
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
    });

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

    const typed = root.querySelector<HTMLElement>("#typed");
    if (typed) {
      const titles = [
        "AI Enthusiast",
        "ML Engineer",
        "Data Scientist",
        "XAI Researcher",
      ];
      let titleIndex = 0;
      let characterIndex = 0;
      let deleting = false;
      const type = () => {
        const title = titles[titleIndex];
        characterIndex += deleting ? -1 : 1;
        typed.textContent = title.slice(0, characterIndex);
        if (!deleting && characterIndex === title.length) {
          deleting = true;
          schedule(type, 1900);
          return;
        }
        if (deleting && characterIndex === 0) {
          deleting = false;
          titleIndex = (titleIndex + 1) % titles.length;
        }
        schedule(type, deleting ? 55 : 88);
      };
      schedule(type, 900);
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

  return (
    <motion.main
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div id="cur" aria-hidden="true" />
      <div id="cur-r" aria-hidden="true" />
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
      <div
        ref={contentRef}
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: portfolioMarkup }}
      />
    </motion.main>
  );
}
