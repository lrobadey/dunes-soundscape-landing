import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { GlassSurface } from "@/components/glass/GlassSurface";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <GlassSurface variant="strong" className="w-full max-w-md px-8 py-10 text-center">
        <h1 className="mb-3 font-display text-5xl font-light">404</h1>
        <p className="mb-6 font-sans text-sm font-light text-muted-foreground">Oops! Page not found.</p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-sm border border-primary bg-transparent px-5 py-3 font-sans text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Return to Home
        </a>
      </GlassSurface>
    </div>
  );
};

export default NotFound;
