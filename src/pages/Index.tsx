import { useState } from "react";
import { ChevronDown, MapPin, Calendar, Music2, Mail } from "lucide-react";

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
        style={{ backgroundImage: "url('/images/dunes-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          {/* Eyebrow */}
          <p
            className="mb-6 font-sans text-xs uppercase tracking-[0.35em] text-sand opacity-0 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Premiere &amp; Digital Release
          </p>

          {/* Title */}
          <h1
            className="font-display text-[clamp(5rem,18vw,15rem)] font-light leading-none tracking-tight text-cream opacity-0 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            DUNES
          </h1>

          {/* Subtitle */}
          <p
            className="mt-4 font-display text-[clamp(1rem,3vw,1.6rem)] font-light italic text-sand-light opacity-0 animate-fade-up"
            style={{ animationDelay: "0.7s" }}
          >
            EP for String Quintet and Electronics
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
            className="mt-8 flex items-center gap-2 rounded-full border border-sand/40 bg-black/40 px-5 py-2 font-sans text-xs text-sand opacity-0 animate-fade-in backdrop-blur-sm"
            style={{ animationDelay: "1.2s" }}
          >
            <Calendar className="h-3 w-3" />
            <span>May 2, 2026 · Studio G, SFCM</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-cream">Scroll</span>
          <ChevronDown className="h-4 w-4 text-sand animate-scroll-bounce" />
        </div>
      </section>

      {/* ── OVERVIEW ───────────────────────────────────────────── */}
      <section className="relative bg-background px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.3em] text-primary">About the Work</p>
          <h2 className="mb-8 font-display text-4xl font-light italic leading-snug text-foreground md:text-5xl">
            A landscape in five movements
          </h2>
          <div className="h-px w-16 bg-primary mx-auto mb-8 opacity-60" />
          <p className="font-sans text-base font-light leading-relaxed text-muted-foreground">
            <em>Dunes</em> is a 25-minute single-arc work for string quintet and electronics, synthesizing contemporary
            classical textures with pop clarity and EDM-scale production. Inspired by the geomorphology and scale of five
            dune systems across the globe, the piece translates natural processes into a visceral musical journey — moving
            from meditative ambient textures to lush, yearning strings and high-energy electronic climaxes.
          </p>
        </div>
      </section>

      {/* ── MOVEMENTS ──────────────────────────────────────────── */}
      <section className="relative bg-card px-6 py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.3em] text-primary">Movements</p>
            <h2 className="font-display text-4xl font-light text-foreground md:text-5xl">Five Desert Systems</h2>
          </div>

          <ol className="space-y-0">
            {movements.map((m, i) => (
              <li
                key={m.num}
                className="group flex gap-6 border-t border-border py-8 last:border-b transition-colors duration-300 hover:bg-secondary/30 px-4"
              >
                {/* Number */}
                <span className="font-display text-5xl font-light text-primary/40 leading-none transition-colors duration-300 group-hover:text-primary/70 shrink-0 w-12 text-center">
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
                  <p className="mt-1 font-sans text-sm font-light leading-relaxed text-muted-foreground">{m.description}</p>
                </div>
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
            <div className="col-span-full rounded-sm border border-border bg-card p-8 md:p-10">
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
                className="mt-6 inline-flex items-center gap-2 rounded-sm border border-primary bg-transparent px-6 py-3 font-sans text-xs uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
              >
                <Calendar className="h-3.5 w-3.5" />
                Add to Calendar
              </a>
            </div>
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
        <div className="mx-auto max-w-lg text-center">
          <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.3em] text-primary">Stay Informed</p>
          <h2 className="mb-4 font-display text-4xl font-light text-foreground md:text-5xl">Notify Me</h2>
          <p className="mb-10 font-sans text-sm font-light leading-relaxed text-muted-foreground">
            Be the first to know about tickets, the digital release, and updates about <em>Dunes</em>.
          </p>

          {submitted ? (
            <div className="rounded-sm border border-primary/40 bg-card px-8 py-10">
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
                className="w-full rounded-sm border border-border bg-card px-5 py-3.5 font-sans text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary"
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-sm border border-border bg-card px-5 py-3.5 font-sans text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary"
              />
              {error && <p className="font-sans text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground transition-all duration-300 hover:opacity-90"
              >
                <Mail className="h-3.5 w-3.5" />
                Notify Me
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background px-6 py-12">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center">
          <p className="font-display text-2xl font-light italic text-foreground">Luca Robadey</p>
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest">
            MM Composition · San Francisco Conservatory of Music
          </p>
          {/* Streaming placeholder */}
          <div className="flex items-center gap-3 font-sans text-[10px] uppercase tracking-widest text-muted-foreground/50">
            <span>Streaming links</span>
            <span>·</span>
            <span>Available at release</span>
          </div>
          <p className="font-sans text-[10px] text-muted-foreground/40">
            © {new Date().getFullYear()} Luca Robadey. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
