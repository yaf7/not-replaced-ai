"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Types
interface AnalysisResult {
  profession_title: string;
  threat_level: {
    percentage: number;
    verdict: string;
    summary: string;
    timeline: string;
  };
  ai_copilot: {
    tools: { name: string; description: string; category: string }[];
    strategy: string;
  };
  human_edge: {
    skills: { name: string; description: string; icon: string }[];
    motivation: string;
  };
  survival_roadmap: { phase: string; action: string; detail: string }[];
}

// Icon components
function SkillIcon({ icon }: { icon: string }) {
  const icons: Record<string, string> = {
    brain: "🧠", heart: "❤️", handshake: "🤝",
    lightbulb: "💡", shield: "🛡️", eye: "👁️",
  };
  return <span>{icons[icon] || "⭐"}</span>;
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, string> = {
    Content: "📝", Analytics: "📊", Automation: "⚙️",
    Design: "🎨", Code: "💻", Communication: "💬",
    Research: "🔍", Marketing: "📈",
  };
  return <span>{icons[category] || "🔧"}</span>;
}

// Threat gauge SVG component
function ThreatGauge({ percentage, verdict }: { percentage: number; verdict: string }) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPct / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(percentage), 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getColor = (pct: number) => {
    if (pct <= 20) return "#10b981";
    if (pct <= 40) return "#22d3ee";
    if (pct <= 60) return "#eab308";
    if (pct <= 80) return "#f97316";
    return "#ef4444";
  };

  const color = getColor(percentage);

  return (
    <div className="threat-gauge-container">
      <div className="pulse-ring" style={{ borderColor: color }} />
      <svg viewBox="0 0 200 200" width="200" height="200">
        <circle cx="100" cy="100" r={radius} className="threat-gauge-bg" />
        <circle
          cx="100" cy="100" r={radius}
          className="threat-gauge-fill"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
        />
        <text x="100" y="92" textAnchor="middle" className="threat-percentage">
          {animatedPct}%
        </text>
        <text x="100" y="118" textAnchor="middle" className="threat-label" fill={color}>
          {verdict}
        </text>
      </svg>
    </div>
  );
}

// Particles background
function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize", handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}

// Counter animation hook
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => requestAnimationFrame(animate), 400);
    return () => clearTimeout(timer);
  }, [target, duration]);
  return count;
}

export default function Home() {
  const [profession, setProfession] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const analyze = useCallback(async () => {
    if (!profession.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession: profession.trim() }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      setError("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [profession]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) analyze();
  };

  const getVerdictClass = (verdict: string) => {
    const map: Record<string, string> = {
      SAFE: "verdict-safe", "LOW RISK": "verdict-low",
      MODERATE: "verdict-moderate", "HIGH RISK": "verdict-high",
      CRITICAL: "verdict-critical",
    };
    return map[verdict] || "verdict-moderate";
  };

  const shareResult = () => {
    if (!result) return;
    const text = `🤖 My job as "${result.profession_title}" has a ${result.threat_level.percentage}% AI replacement risk!\n\nVerdict: ${result.threat_level.verdict}\n\nCheck yours at NotReplaced.ai`;
    if (navigator.share) {
      navigator.share({ title: "NotReplaced.ai", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  const animatedPct = useCountUp(result?.threat_level.percentage ?? 0);

  return (
    <>
      <ParticlesBackground />
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        {/* Hero Section */}
        <header style={{ textAlign: "center", padding: "80px 20px 40px", maxWidth: 800, margin: "0 auto" }}>
          <div className="fade-in">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 99, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: 24, fontSize: "0.85rem", color: "#94a3b8" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              Powered by Google Gemini AI
            </div>
          </div>

          <h1 className="fade-in" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Will AI{" "}
            <span style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Replace
            </span>{" "}
            You?
          </h1>

          <p className="fade-in" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)", color: "#94a3b8", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Enter your profession and discover your AI threat level, the tools you should master, and the human skills that make you irreplaceable.
          </p>

          {/* Input Section */}
          <div className="fade-in" style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem", opacity: 0.5 }}>🔍</span>
              <input
                id="profession-input"
                className="input-field"
                style={{ paddingLeft: 52 }}
                type="text"
                placeholder='e.g. "Junior Graphic Designer" or "Accountant"'
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </div>
            <button
              id="analyze-button"
              className="btn-primary"
              onClick={analyze}
              disabled={loading || !profession.trim()}
            >
              {loading ? (
                <span className="scanning-text">⚡ Scanning your future...</span>
              ) : (
                "⚡ Analyze My Career"
              )}
            </button>
          </div>

          {/* Example chips */}
          <div className="fade-in" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 20 }}>
            {["Software Engineer", "Accountant", "Graphic Designer", "Teacher", "Doctor"].map((ex) => (
              <button
                key={ex}
                onClick={() => setProfession(ex)}
                style={{
                  padding: "6px 14px", borderRadius: 99,
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.15)",
                  color: "#94a3b8", fontSize: "0.8rem",
                  cursor: "pointer", transition: "all 0.3s ease",
                  fontFamily: "'Outfit', sans-serif",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(99,102,241,0.15)"; (e.target as HTMLElement).style.color = "#e2e8f0"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "rgba(99,102,241,0.06)"; (e.target as HTMLElement).style.color = "#94a3b8"; }}
              >
                {ex}
              </button>
            ))}
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div className="loader">
              <div className="loader-dot" />
              <div className="loader-dot" />
              <div className="loader-dot" />
            </div>
            <p className="scanning-text" style={{ fontSize: "1.1rem", fontWeight: 500 }}>
              Analyzing with AI...
            </p>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 8 }}>
              Scanning industry data & AI trends
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ display: "inline-block", padding: "16px 32px", borderRadius: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
              ⚠️ {error}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef} style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 80px" }}>
            {/* Profession Title */}
            <div className="fade-in" style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8 }}>
                Analysis for{" "}
                <span style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {result.profession_title}
                </span>
              </h2>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <button className="btn-share" onClick={shareResult}>📤 Share Result</button>
                <button className="btn-share" onClick={() => { setResult(null); setProfession(""); }}>🔄 New Analysis</button>
              </div>
            </div>

            {/* Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 24 }}>

              {/* Card 1: Threat Level */}
              <div className="result-card" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 32, justifyContent: "center" }}>
                  <ThreatGauge percentage={result.threat_level.percentage} verdict={result.threat_level.verdict} />
                  <div style={{ flex: 1, minWidth: 250 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div className="section-icon" style={{ background: "rgba(239,68,68,0.1)" }}>⚠️</div>
                      <div>
                        <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Threat Level</h3>
                        <span className={`verdict-badge ${getVerdictClass(result.threat_level.verdict)}`}>
                          {result.threat_level.verdict}
                        </span>
                      </div>
                    </div>
                    <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 12 }}>{result.threat_level.summary}</p>
                    <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                      <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                        <strong style={{ color: "#e2e8f0" }}>📅 Timeline: </strong>
                        {result.threat_level.timeline}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Co-Pilot */}
              <div className="result-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div className="section-icon" style={{ background: "rgba(34,211,238,0.1)" }}>🤖</div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>AI Co-Pilot</h3>
                </div>
                <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 20, fontSize: "0.95rem" }}>
                  {result.ai_copilot.strategy}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.ai_copilot.tools.map((tool, i) => (
                    <div key={i} className="tool-badge" style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <CategoryIcon category={tool.category} />
                      <div>
                        <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem" }}>{tool.name}</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: 2 }}>{tool.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Human Edge */}
              <div className="result-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div className="section-icon" style={{ background: "rgba(168,85,247,0.1)" }}>✨</div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Human Edge</h3>
                </div>
                <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 20, fontSize: "0.95rem", fontStyle: "italic" }}>
                  &ldquo;{result.human_edge.motivation}&rdquo;
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.human_edge.skills.map((skill, i) => (
                    <div key={i} className="skill-chip">
                      <span style={{ fontSize: "1.3rem", marginTop: 2 }}><SkillIcon icon={skill.icon} /></span>
                      <div>
                        <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem" }}>{skill.name}</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: 2 }}>{skill.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Survival Roadmap */}
              <div className="result-card" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div className="section-icon" style={{ background: "rgba(16,185,129,0.1)" }}>🗺️</div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Survival Roadmap</h3>
                </div>
                <div>
                  {result.survival_roadmap.map((item, i) => (
                    <div key={i} className="roadmap-item">
                      <div className="roadmap-dot">{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                          {item.phase}
                        </div>
                        <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{item.action}</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer disclaimer */}
            <div className="fade-in" style={{ textAlign: "center", marginTop: 40, padding: "20px", color: "#64748b", fontSize: "0.8rem" }}>
              <p>⚡ Analysis powered by Google Gemini AI. Results are AI-generated estimates based on current industry trends.</p>
              <p style={{ marginTop: 4 }}>Built for <strong>Hoobit Hacks 2026</strong> — AI Apocalypse Theme</p>
            </div>
          </div>
        )}

        {/* Footer when no result */}
        {!result && !loading && (
          <footer className="fade-in" style={{ textAlign: "center", padding: "60px 20px 40px", color: "#64748b" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 20 }}>
              {[
                { icon: "⚡", label: "Instant Analysis", desc: "Results in seconds" },
                { icon: "🧠", label: "AI-Powered", desc: "Google Gemini" },
                { icon: "🎯", label: "Personalized", desc: "Tailored advice" },
              ].map((f, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem" }}>{f.label}</div>
                  <div style={{ fontSize: "0.8rem" }}>{f.desc}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.8rem" }}>
              Built for <strong>Hoobit Hacks 2026</strong> — AI Apocalypse Theme
            </p>
          </footer>
        )}
      </div>
    </>
  );
}
