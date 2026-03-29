import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <SEOHead title="Puslapis nerastas | AUTOPASKOLOS.LT" noindex={true} />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Puslapis nerastas</p>
        <a href="/" className="text-primary underline hover:text-primary/80">
          Grįžti į pradžią
        </a>
      </div>
    </div>
  );
};

export default NotFound;
