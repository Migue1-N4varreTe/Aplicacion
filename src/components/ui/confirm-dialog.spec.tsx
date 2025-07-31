import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmDialog, useConfirmDialog } from './confirm-dialog';
import React from 'react';

/**
 * Tests para ConfirmDialog component
 * Componente crítico para UX que reemplaza window.confirm()
 */
describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Test Title",
    description: "Test Description",
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with basic props', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('should render custom button texts', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirmar');
    fireEvent.click(confirmButton);
    
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onOpenChange when cancel button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should apply destructive styling when variant is destructive', () => {
    render(<ConfirmDialog {...defaultProps} variant="destructive" />);
    
    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton).toHaveClass('bg-red-600');
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    // AlertDialog debería tener role="dialog"
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Title debería estar asociado correctamente
    const title = screen.getByText('Test Title');
    expect(title).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });
});

/**
 * Tests para useConfirmDialog hook
 */
describe('useConfirmDialog hook', () => {
  // Componente de prueba para el hook
  const TestComponent: React.FC = () => {
    const { showConfirm, ConfirmDialog } = useConfirmDialog();

    const handleClick = () => {
      showConfirm({
        title: "Delete Item",
        description: "Are you sure?",
        onConfirm: () => {
          // Mock confirm action
        },
      });
    };

    return (
      <div>
        <button onClick={handleClick}>Show Confirm</button>
        <ConfirmDialog />
      </div>
    );
  };

  it('should show dialog when showConfirm is called', async () => {
    render(<TestComponent />);
    
    const showButton = screen.getByText('Show Confirm');
    fireEvent.click(showButton);
    
    await waitFor(() => {
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });
  });

  it('should hide dialog when cancel is clicked', async () => {
    render(<TestComponent />);
    
    // Show dialog
    const showButton = screen.getByText('Show Confirm');
    fireEvent.click(showButton);
    
    await waitFor(() => {
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });
    
    // Cancel dialog
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
    });
  });

  it('should hide dialog when confirm is clicked', async () => {
    render(<TestComponent />);
    
    // Show dialog
    const showButton = screen.getByText('Show Confirm');
    fireEvent.click(showButton);
    
    await waitFor(() => {
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });
    
    // Confirm dialog
    const confirmButton = screen.getByText('Confirmar');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
    });
  });

  it('should handle multiple showConfirm calls correctly', async () => {
    const TestMultipleComponent: React.FC = () => {
      const { showConfirm, ConfirmDialog } = useConfirmDialog();

      return (
        <div>
          <button 
            onClick={() => showConfirm({
              title: "First Dialog",
              description: "First description",
              onConfirm: () => {},
            })}
          >
            Show First
          </button>
          <button 
            onClick={() => showConfirm({
              title: "Second Dialog", 
              description: "Second description",
              onConfirm: () => {},
            })}
          >
            Show Second
          </button>
          <ConfirmDialog />
        </div>
      );
    };

    render(<TestMultipleComponent />);
    
    // Show first dialog
    fireEvent.click(screen.getByText('Show First'));
    await waitFor(() => {
      expect(screen.getByText('First Dialog')).toBeInTheDocument();
    });
    
    // Show second dialog (should replace first)
    fireEvent.click(screen.getByText('Show Second'));
    await waitFor(() => {
      expect(screen.getByText('Second Dialog')).toBeInTheDocument();
      expect(screen.queryByText('First Dialog')).not.toBeInTheDocument();
    });
  });
});
