import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class MobileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Mobile Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('🔴 Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-gray-900">
                Algo salió mal
              </h1>
              <p className="text-gray-600 text-sm">
                La aplicación encontró un error inesperado. Intenta recargar la página.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={this.handleReload}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar aplicación
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </Button>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left text-xs bg-gray-100 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Detalles técnicos
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 text-red-600 whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support Info */}
            <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-lg">
              Si el problema persiste, intenta:
              <ul className="mt-2 space-y-1 text-left">
                <li>• Cerrar y abrir la aplicación</li>
                <li>• Limpiar la caché del navegador</li>
                <li>• Verificar tu conexión a internet</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MobileErrorBoundary;
