import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background animate-fade-in px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          {/* <div className="w-full max-w-xs sm:max-w-sm md:max-w-md aspect-video rounded-xl flex items-center justify-center">
            <img
              src="https://http.cat/404"
              alt="404 Not Found Cat"
              className="object-contain w-full h-full rounded-xl"
              loading="lazy"
              style={{ background: "#fff" }}
            />
          </div> */}
          <TrendingUp className="h-12 w-12 text-primary mb-4" />
          <h1 className="text-5xl font-bold mb-2 text-primary">404</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Oops! Página não encontrada.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Não conseguimos encontrar o endereço{" "}
            <span className="font-mono">{location.pathname}</span>
          </p>
          <div className="flex gap-2 w-full">
            <Button className="flex-1" onClick={() => navigate("/")}>
              Voltar para o início
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Página anterior
            </Button>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};

export default NotFound;
