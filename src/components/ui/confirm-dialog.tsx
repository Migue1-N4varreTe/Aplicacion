import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
}

/**
 * Componente de diálogo de confirmación accesible que reemplaza window.confirm()
 * 
 * @param open - Estado del diálogo (abierto/cerrado)
 * @param onOpenChange - Función para cambiar el estado del diálogo
 * @param title - Título del diálogo
 * @param description - Descripción/mensaje del diálogo
 * @param confirmText - Texto del botón de confirmación (default: "Confirmar")
 * @param cancelText - Texto del botón de cancelar (default: "Cancelar")
 * @param onConfirm - Función a ejecutar al confirmar
 * @param variant - Variante visual del botón de confirmación
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  variant = "default",
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : undefined
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/**
 * Hook para usar un diálogo de confirmación de manera simple
 * 
 * @returns {object} Objeto con showConfirm función y ConfirmDialog component
 * 
 * @example
 * const { showConfirm, ConfirmDialog } = useConfirmDialog();
 * 
 * const handleDelete = () => {
 *   showConfirm({
 *     title: "Eliminar elemento",
 *     description: "¿Estás seguro?",
 *     onConfirm: () => deleteItem(),
 *   });
 * };
 * 
 * return (
 *   <>
 *     <button onClick={handleDelete}>Eliminar</button>
 *     <ConfirmDialog />
 *   </>
 * );
 */
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  } | null>(null);

  const showConfirm = (newConfig: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }) => {
    setConfig(newConfig);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    config?.onConfirm();
    setIsOpen(false);
    setConfig(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setConfig(null);
  };

  const ConfirmDialogComponent = () => {
    if (!config) return null;

    return (
      <ConfirmDialog
        open={isOpen}
        onOpenChange={handleCancel}
        title={config.title}
        description={config.description}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        onConfirm={handleConfirm}
        variant={config.variant}
      />
    );
  };

  return {
    showConfirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
};
