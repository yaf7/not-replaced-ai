"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Search, Zap, Clock, Brain, Target, ShieldCheck, 
  TriangleAlert, Database, Bot, Sparkles, Map,
  PenTool, BarChart2, Settings, Palette, Code, 
  MessageSquare, TrendingUp, Heart, Handshake, 
  Lightbulb, Shield, Eye, Share2, RotateCcw
} from "lucide-react";

// Types
interface AnalysisResult {
  profession_title: string;
  threat_level: {
    percentage: number;
    verdict: string;
    summary: string;
    timeline: string;
    sources?: string;
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
  const props = { size: 20, strokeWidth: 2 };
  switch (icon.toLowerCase()) {
    case "brain": return <Brain {...props} />;
    case "heart": return <Heart {...props} />;
    case "handshake": return <Handshake {...props} />;
    case "lightbulb": return <Lightbulb {...props} />;
    case "shield": return <Shield {...props} />;
    case "eye": return <Eye {...props} />;
    default: return <Sparkles {...props} />;
  }
}

function CategoryIcon({ category }: { category: string }) {
  const props = { size: 18, strokeWidth: 2 };
  switch (category.toLowerCase()) {
    case "content": return <PenTool {...props} />;
    case "analytics": return <BarChart2 {...props} />;
    case "automation": return <Settings {...props} />;
    case "design": return <Palette {...props} />;
    case "code": return <Code {...props} />;
    case "communication": return <MessageSquare {...props} />;
    case "research": return <Search {...props} />;
    case "marketing": return <TrendingUp {...props} />;
    default: return <Settings {...props} />;
  }
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

export default function Home() {
  const [profession, setProfession] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("notreplaced_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (newResult: AnalysisResult) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.profession_title !== newResult.profession_title);
      const newHistory = [newResult, ...filtered].slice(0, 5);
      localStorage.setItem("notreplaced_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

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
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }
        throw new Error("Analysis failed. Please try again.");
      }
      const data = await res.json();
      setResult(data);
      saveToHistory(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err: any) {
      setError(err.message || "Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [profession]);

  const loadFromHistory = (item: AnalysisResult) => {
    setResult(item);
    setProfession(item.profession_title);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

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
    const text = `My job as "${result.profession_title}" has a ${result.threat_level.percentage}% AI replacement risk.\n\nVerdict: ${result.threat_level.verdict}\n\nCheck yours at NotReplaced.ai`;
    if (navigator.share) {
      navigator.share({ title: "NotReplaced.ai", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return (
    <>
      <ParticlesBackground />
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* AI Disclosure Modal */}
      {showDisclosure && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(5,5,16,0.8)", backdropFilter: "blur(10px)" }}>
          <div className="glass-card fade-in" style={{ maxWidth: 600, width: "100%", padding: 32, position: "relative" }}>
            <button 
              onClick={() => setShowDisclosure(false)} 
              style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem" }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={28} color="#6366f1" /> Methodology Disclosure
            </h2>
            <div style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 12 }}>
              <p><strong>Hoobit Hacks 2026 Disclosure:</strong> To comply with the hackathon guidelines, this outlines exactly how AI is utilized within <em>NotReplaced.ai</em>.</p>
              
              <p><strong>1. Data Generation & Analysis</strong><br/>
              The core analysis engine uses the <strong>Google Gemini API</strong> (gemini-3-flash-preview). When a user enters a profession, it is sent to the LLM via a strictly formatted prompt. The threat percentages, required skills, and timelines are AI-generated estimations based on aggregated patterns from global economic trends, tech publications, and known automation capabilities.</p>
              
              <p><strong>2. Data Citations</strong><br/>
              To provide realistic context, Gemini is instructed to cite real-world studies (e.g., World Economic Forum, Goldman Sachs, or McKinsey reports) in the "Sources" section of the results. <em>Note: As these are LLM-generated summaries, specific percentages may be illustrative.</em></p>
              
              <p><strong>3. Development Process</strong><br/>
              This platform was architected and engineered by <strong>Deyafa Arsetya</strong>. AI was utilized during the coding phase (as permitted in the rules) to accelerate UI styling, SVG animations, and API route generation. <strong>AI was NOT used</strong> to conceptualize the core idea or write the presentation scripts.</p>
            </div>
            <button onClick={() => setShowDisclosure(false)} className="btn-primary" style={{ width: "100%", marginTop: 24 }}>Acknowledge</button>
          </div>
        </div>
      )}

      {/* Header Nav */}
      <nav style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 40px", display: "flex", justifyContent: "space-between", zIndex: 10 }}>
        <div style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "1px", display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={20} color="#6366f1" /> NotReplaced<span style={{ color: "#6366f1" }}>.ai</span>
        </div>
        <button 
          onClick={() => setShowDisclosure(true)}
          style={{ background: "transparent", border: "1px solid rgba(99,102,241,0.3)", color: "#e2e8f0", padding: "6px 16px", borderRadius: 99, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <ShieldCheck size={14} /> Methodology
        </button>
      </nav>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        {/* Hero Section */}
        <header style={{ textAlign: "center", padding: "100px 20px 40px", maxWidth: 800, margin: "0 auto" }}>
          <div className="fade-in">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 99, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: 24, fontSize: "0.85rem", color: "#94a3b8" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              Powered by Google Gemini
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
              <span style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                <Search size={20} />
              </span>
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
              style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}
            >
              {loading ? (
                <>
                  <Zap size={18} className="animate-pulse" />
                  <span className="scanning-text">Scanning your future...</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Analyze My Career
                </>
              )}
            </button>
          </div>

          {/* Recent History / Examples */}
          <div className="fade-in" style={{ marginTop: 24 }}>
            {history.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Recent Analyses</span>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => loadFromHistory(h)}
                      style={{
                        padding: "6px 14px", borderRadius: 99,
                        background: "rgba(34,211,238,0.06)",
                        border: "1px solid rgba(34,211,238,0.15)",
                        color: "#e2e8f0", fontSize: "0.8rem",
                        cursor: "pointer", transition: "all 0.3s ease",
                        display: "flex", alignItems: "center", gap: 6
                      }}
                    >
                      <Clock size={12} /> {h.profession_title}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
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
            )}
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
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", borderRadius: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
              <TriangleAlert size={18} /> {error}
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
                <button className="btn-share" onClick={shareResult} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Share2 size={16} /> Share Result
                </button>
                <button className="btn-share" onClick={() => { setResult(null); setProfession(""); }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <RotateCcw size={16} /> New Analysis
                </button>
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
                      <div className="section-icon" style={{ background: "rgba(239,68,68,0.1)" }}>
                        <TriangleAlert color="#ef4444" size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Threat Level</h3>
                        <span className={`verdict-badge ${getVerdictClass(result.threat_level.verdict)}`}>
                          {result.threat_level.verdict}
                        </span>
                      </div>
                    </div>
                    <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 12 }}>{result.threat_level.summary}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                        <Clock size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                          <strong style={{ color: "#e2e8f0" }}>Timeline: </strong>
                          {result.threat_level.timeline}
                        </p>
                      </div>
                      {result.threat_level.sources && (
                        <div style={{ display: "flex", gap: 12, padding: "8px 16px", borderRadius: 12, background: "rgba(16,185,129,0.05)", border: "1px dashed rgba(16,185,129,0.2)" }}>
                          <Database size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                          <p style={{ fontSize: "0.8rem", color: "#64748b", fontStyle: "italic" }}>
                            <strong>Data Intelligence:</strong> {result.threat_level.sources}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Co-Pilot */}
              <div className="result-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div className="section-icon" style={{ background: "rgba(34,211,238,0.1)" }}>
                    <Bot color="#22d3ee" size={20} />
                  </div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>AI Co-Pilot</h3>
                </div>
                <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 20, fontSize: "0.95rem" }}>
                  {result.ai_copilot.strategy}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.ai_copilot.tools.map((tool, i) => (
                    <div key={i} className="tool-badge" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ color: "#22d3ee", marginTop: 2 }}>
                        <CategoryIcon category={tool.category} />
                      </div>
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
                  <div className="section-icon" style={{ background: "rgba(168,85,247,0.1)" }}>
                    <Sparkles color="#a855f7" size={20} />
                  </div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Human Edge</h3>
                </div>
                <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 20, fontSize: "0.95rem", fontStyle: "italic" }}>
                  &ldquo;{result.human_edge.motivation}&rdquo;
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.human_edge.skills.map((skill, i) => (
                    <div key={i} className="skill-chip" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ color: "#a855f7", marginTop: 2 }}>
                        <SkillIcon icon={skill.icon} />
                      </div>
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
                  <div className="section-icon" style={{ background: "rgba(16,185,129,0.1)" }}>
                    <Map color="#10b981" size={20} />
                  </div>
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
            <div className="fade-in" style={{ textAlign: "center", marginTop: 40, padding: "20px", color: "#64748b", fontSize: "0.8rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Zap size={14} color="#6366f1" /> 
                Analysis powered by Google Gemini AI. Results are AI-generated estimates based on current industry trends.
              </div>
              <p style={{ marginTop: 4 }}>Engineered by <strong>Deyafa Arsetya</strong> ⚡ for <strong>Hoobit Hacks 2026</strong></p>
            </div>
          </div>
        )}

        {/* Footer when no result */}
        {!result && !loading && (
          <footer className="fade-in" style={{ textAlign: "center", padding: "60px 20px 40px", color: "#64748b" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 20 }}>
              {[
                { icon: <Zap size={32} color="#6366f1" />, label: "Instant Analysis", desc: "Results in seconds" },
                { icon: <Brain size={32} color="#22d3ee" />, label: "AI-Powered", desc: "Google Gemini" },
                { icon: <Target size={32} color="#10b981" />, label: "Data-Informed", desc: "Based on trends" },
              ].map((f, i) => (
                <div key={i} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ marginBottom: 12, opacity: 0.8 }}>{f.icon}</div>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem" }}>{f.label}</div>
                  <div style={{ fontSize: "0.8rem" }}>{f.desc}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.8rem" }}>
              Engineered by <strong>Deyafa Arsetya</strong> ⚡ for <strong>Hoobit Hacks 2026</strong>
            </p>
          </footer>
        )}
      </div>
    </>
  );
}
