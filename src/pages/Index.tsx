import { useState } from "react";
import { ChevronDown, MapPin, Calendar, Music2, Mail } from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { GridOverlay, NoiseOverlay } from "@/components/glass/Overlays";

const movements = [
  { num: "I", desert: "Simpson Desert", country: "Australia", description: "Vast parallel dunes stretch to the horizon — meditative, cyclical textures open the work." },
  { num: "II", desert: "Badain Jaran Desert", country: "China", description: "Towering stationary megadunes and mysterious singing sands — resonant harmonics and spectral shimmer." },
  { num: "III", desert: "Lençóis Maranhenses", country: "Brazil", description: "White quartz dunes pooled with seasonal lagoons — lush, yearning string lines emerge from the texture." },
  { num: "IV", desert: "Sahara", country: "Algeria", description: "Endless ergs under an unrelenting sun — relentless rhythmic drive, the electronic climax of the arc." },
  { num: "V", desert: "Great Sand Dunes", country: "USA", description: "The tallest dunes in North America, flanked by snowmelt — resolution, stillness, and a final exhale." },
];

const Index = () => {
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  const calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=DUNES+Premiere+%E2%80%94+Luca+Robadey&dates=20260502T190000/20260502T210000&details=Premiere+of+DUNES+for+string+quintet+and+electronics+by+Luca+Robadey.+Live+performance+with+lighting+and+projections.&location=Studio+G,+San+Francisco+Conservatory+of+Music`;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}images/dunes-hero.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <GridOverlay className="z-0" />
        <NoiseOverlay className="z-0" />

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/20 via-transparent to-black/20" />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 border border-white/10 bg-[hsl(var(--glass-tint)/var(--glass-alpha-strong))]"
          style={{
            WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturation))",
            backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturation))",
          }}
        />

        <div className="relative z-20 flex w-full items-center justify-center">
          <div className="flex w-full max-w-[64rem] flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12 md:px-12 md:py-14">
            {/* Eyebrow */}
            <p
              className="mb-6 font-sans text-xs uppercase tracking-[0.35em] text-sand opacity-0 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Premiere &amp; Digital Release
            </p>

            {/* Title */}
            <h1
              className="font-dunes-title text-[clamp(5rem,18vw,15rem)] font-light leading-none tracking-tight text-cream opacity-0 animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              DUNES
            </h1>

            {/* Subtitle */}
            <p
              className="mt-4 font-display text-[clamp(1rem,3vw,1.6rem)] font-light italic text-sand-light opacity-0 animate-fade-up"
              style={{ animationDelay: "0.7s" }}
            >
              An EP for string quintet and electronics
            </p>

            {/* Composer */}
            <p
              className="mt-5 font-sans text-sm font-light uppercase tracking-widest text-cream/70 opacity-0 animate-fade-up"
              style={{ animationDelay: "0.95s" }}
            >
              Luca Robadey
            </p>

            {/* Event pill */}
            <div
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-sand/30 bg-background/20 px-5 py-2 font-sans text-xs text-sand opacity-0 animate-fade-in backdrop-blur-sm"
              style={{ animationDelay: "1.2s" }}
            >
              <Calendar className="h-3 w-3" />
              <span>May 2, 2026 · Studio G, SFCM</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 opacity-60">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-cream">Scroll</span>
          <ChevronDown className="h-4 w-4 text-sand animate-scroll-bounce" />
        </div>
      </section>

      {/* ── OVERVIEW ───────────────────────────────────────────── */}
      <section className="relative bg-background py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_0%,hsl(var(--primary)/0.22),transparent_60%)] opacity-70"
        />
        <GlassSurface
          variant="strong"
          className="relative w-full px-6 py-12 text-center [--glass-surface-radius:0px] sm:px-10 sm:py-14 md:px-12 md:py-16"
        >
          <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.3em] text-primary">About the Work</p>
          <h2 className="mb-10 font-display text-4xl font-light italic leading-snug text-foreground md:text-5xl">
            Five movements, one landscape.
          </h2>
          <div className="mx-auto mb-10 h-px w-full bg-primary/45" />
          <p className="mx-auto max-w-3xl font-sans text-base font-light leading-relaxed text-muted-foreground md:text-lg">
            <em>Dunes</em> is a 25-minute single-arc work for string quintet and electronics, synthesizing contemporary
            classical textures with pop clarity and EDM-scale production. Inspired by the geomorphology and scale of five
            dune systems across the globe, the piece translates natural processes into a visceral musical journey — moving
            from meditative ambient textures to lush, yearning strings and high-energy electronic climaxes.
          </p>
        </GlassSurface>
      </section>

      {/* ── MOVEMENTS ──────────────────────────────────────────── */}
      <section className="relative bg-card px-6 py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.3em] text-primary">Movements</p>
            <h2 className="font-display text-4xl font-light text-foreground md:text-5xl">Five Desert Systems</h2>
          </div>

          <ol className="space-y-4">
            {movements.map((m) => (
              <li key={m.num} className="transition-transform duration-300 hover:-translate-y-0.5">
                <GlassSurface className="[--glass-border-alpha:0.12] hover:[--glass-border-alpha:0.22] px-6 py-8 sm:px-7">
                  <div className="flex gap-6">
                    {/* Number */}
                    <span className="w-12 shrink-0 text-center font-display text-5xl font-light leading-none text-primary/40">
                      {m.num}
                    </span>
                    {/* Content */}
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="font-display text-2xl font-light text-foreground md:text-3xl">{m.desert}</span>
                        <span className="flex items-center gap-1 font-sans text-xs uppercase tracking-widest text-muted-foreground">
                          <MapPin className="h-3 w-3 text-primary" />
                          {m.country}
                        </span>
                      </div>
                      <p className="mt-1 font-sans text-sm font-light leading-relaxed text-muted-foreground">
                        {m.description}
                      </p>
                    </div>
                  </div>
                </GlassSurface>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── EVENT DETAILS ──────────────────────────────────────── */}
      <section className="relative bg-background px-6 py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.3em] text-primary">Performance</p>
            <h2 className="font-display text-4xl font-light text-foreground md:text-5xl">Event Details</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Main card */}
            <GlassSurface variant="strong" className="col-span-full p-8 md:p-10">
              <div className="grid gap-8 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-primary">Date</span>
                  <span className="font-display text-3xl font-light text-foreground">May 2, 2026</span>
                  <span className="font-sans text-xs text-muted-foreground">Time TBD</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-primary">Venue</span>
                  <span className="font-display text-2xl font-light text-foreground">Studio G</span>
                  <span className="font-sans text-xs text-muted-foreground">San Francisco Conservatory of Music</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-primary">Format</span>
                  <span className="font-display text-xl font-light text-foreground">Live with Lighting &amp; Projections</span>
                  <span className="font-sans text-xs text-muted-foreground">Premiere + Digital Release</span>
                </div>
              </div>

              <div className="mt-8 h-px bg-border" />

              <p className="mt-6 font-sans text-xs font-light text-muted-foreground">
                Supported by SFCM's Professional Development and Engagement Center
              </p>

              <a
                href={calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-sm border border-primary bg-transparent px-6 py-3 font-sans text-xs uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Calendar className="h-3.5 w-3.5" />
                Add to Calendar
              </a>
            </GlassSurface>
          </div>
        </div>
      </section>

      {/* ── RSVP ───────────────────────────────────────────────── */}
      <section
        className="relative px-6 py-28"
        style={{
          background: "linear-gradient(to bottom, hsl(var(--card)), hsl(var(--background)))",
        }}
      >
        <GlassSurface variant="strong" className="mx-auto max-w-lg px-8 py-10 text-center sm:px-10 sm:py-12">
          <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.3em] text-primary">Stay Informed</p>
          <h2 className="mb-4 font-display text-4xl font-light text-foreground md:text-5xl">Notify Me</h2>
          <p className="mb-10 font-sans text-sm font-light leading-relaxed text-muted-foreground">
            Be the first to know about tickets, the digital release, and updates about <em>Dunes</em>.
          </p>

          {submitted ? (
            <div className="px-2 py-2">
              <Music2 className="mx-auto mb-4 h-8 w-8 text-primary" />
              <p className="font-display text-2xl font-light italic text-foreground">You're on the list.</p>
              <p className="mt-2 font-sans text-sm text-muted-foreground">
                We'll reach out before tickets open and when <em>Dunes</em> drops digitally.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-sm border border-input bg-background/40 px-5 py-3.5 font-sans text-sm text-foreground placeholder-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-sm border border-input bg-background/40 px-5 py-3.5 font-sans text-sm text-foreground placeholder-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              {error && <p className="font-sans text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground transition-all duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Mail className="h-3.5 w-3.5" />
                Notify Me
              </button>
            </form>
          )}
        </GlassSurface>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="relative border-t border-border bg-background px-6 py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center">
          <p className="font-display text-2xl font-light italic text-foreground">Luca Robadey</p>
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest">
            MM Composition · San Francisco Conservatory of Music
          </p>
          {/* Streaming placeholder */}
          <GlassSurface className="w-fit px-4 py-2 [--glass-surface-radius:9999px] [--glass-surface-shadow:none]">
            <div className="flex items-center gap-3 font-sans text-[10px] uppercase tracking-widest text-muted-foreground/70">
              <span>Streaming links</span>
              <span>·</span>
              <span>Available at release</span>
            </div>
          </GlassSurface>
          <p className="font-sans text-[10px] text-muted-foreground/40">
            © {new Date().getFullYear()} Luca Robadey. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
