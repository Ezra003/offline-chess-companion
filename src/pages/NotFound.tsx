import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-fade-in-up">
        <div className="text-7xl mb-4">♟</div>
        <h1 className="text-6xl font-bold mb-2 bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          This square doesn't exist on the board.
        </p>
        <Button asChild className="bg-primary hover:brightness-110 transition-all hover:scale-105">
          <a href="/">Return to Game</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
