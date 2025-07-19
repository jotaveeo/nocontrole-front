
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryLimit {
  id: string;
  name: string;
  spent: number;
  budget: number;
  percentage: number;
  remaining: number;
  transactions: number;
  status: "safe" | "warning" | "exceeded";
}

interface EditLimitDialogProps {
  editingLimitCategory: CategoryLimit | null;
  limitValue: number;
  setLimitValue: (value: number) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditLimitDialog = ({
  editingLimitCategory,
  limitValue,
  setLimitValue,
  onClose,
  onSubmit
}: EditLimitDialogProps) => {
  if (!editingLimitCategory) return null;

  return (
    <Dialog open={!!editingLimitCategory} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Editar Limite - {editingLimitCategory.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="limit-value">Valor do Limite (R$)</Label>
            <Input
              id="limit-value"
              type="number"
              min={1}
              step="0.01"
              value={limitValue}
              onChange={(e) => setLimitValue(Number(e.target.value))}
              placeholder="1000.00"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Limite mensal para esta categoria
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Limite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
