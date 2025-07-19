import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  to?: string;
  className?: string;
  label?: string;
  "aria-label"?: string;
}

export const BackButton = ({
  to,
  className = "",
  label = "Voltar",
  "aria-label": ariaLabel,
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`${className}`}
      aria-label={ariaLabel || label}
      type="button"
    >
      <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
      <span className="sr-only">{ariaLabel || label}</span>
      <span aria-hidden="true">{label}</span>
    </Button>
  );
};
