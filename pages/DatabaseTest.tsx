import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Loader2, Database, Server } from 'lucide-react';

interface DatabaseTestResult {
  status: string;
  message: string;
  connected: boolean;
  tablesExist: boolean;
  storeCount?: number;
  adminAccess?: boolean;
  timestamp?: string;
  nextSteps?: string[];
  error?: string;
}

const DatabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<DatabaseTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<any>(null);

  const testDatabaseConnection = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/test/db-test');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testHealthEndpoint = async () => {
    try {
      const response = await fetch('/api/health');
      const result = await response.json();
      return result;
    } catch (err) {
      throw new Error('Backend API not responding');
    }
  };

  const createDatabaseSchema = async () => {
    setCreating(true);
    setCreateResult(null);
    setError(null);

    try {
      const response = await fetch('/api/setup/create-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setCreateResult(result);

      // Refresh the test result after creation
      if (result.success) {
        setTimeout(() => {
          testDatabaseConnection();
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testDatabaseConnection();
  }, []);

  const getStatusIcon = (status: string, connected?: boolean) => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'connected_no_tables':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string, connected?: boolean) => {
    if (loading) return <Badge variant="secondary">Testing...</Badge>;
    
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'connected_no_tables':
        return <Badge variant="secondary">Setup Needed</Badge>;
      case 'error':
      default:
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Database className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Database Connection Test</h1>
      </div>

      <div className="grid gap-6">
        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>Supabase Connection Status</span>
              {testResult && getStatusBadge(testResult.status, testResult.connected)}
            </CardTitle>
            <CardDescription>
              Testing connection to La Económica database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(testResult?.status || '', testResult?.connected)}
              <span className="font-medium">
                {loading ? 'Testing connection...' : 
                 testResult?.message || 
                 error || 
                 'Click test to check connection'}
              </span>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {testResult && testResult.status === 'connected_no_tables' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Database is connected but tables need to be created. 
                  Please set up the database schema.
                </AlertDescription>
              </Alert>
            )}

            {testResult && testResult.status === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Database is fully operational and ready to use!
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={testDatabaseConnection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results Card */}
        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Detailed information about the database connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Connected:</span>
                    <Badge variant={testResult.connected ? "default" : "destructive"}>
                      {testResult.connected ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tables Exist:</span>
                    <Badge variant={testResult.tablesExist ? "default" : "secondary"}>
                      {testResult.tablesExist ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  {testResult.adminAccess !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Admin Access:</span>
                      <Badge variant={testResult.adminAccess ? "default" : "destructive"}>
                        {testResult.adminAccess ? "Yes" : "No"}
                      </Badge>
                    </div>
                  )}
                  
                  {testResult.storeCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Store Records:</span>
                      <Badge variant="secondary">
                        {testResult.storeCount}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span>
                    <div className="mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {testResult.status}
                      </code>
                    </div>
                  </div>
                  
                  {testResult.timestamp && (
                    <div className="text-sm">
                      <span className="font-medium">Tested:</span>
                      <div className="mt-1 text-xs text-gray-600">
                        {new Date(testResult.timestamp).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {testResult.nextSteps && testResult.nextSteps.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Next Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {testResult.nextSteps.map((step, index) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Setup Instructions Card */}
        {testResult && testResult.status === 'connected_no_tables' && (
          <Card>
            <CardHeader>
              <CardTitle>Database Setup Required</CardTitle>
              <CardDescription>
                Your database is connected but needs the schema to be created
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">🚀 Automatic Setup (Recommended)</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Let us create the database schema automatically
                    </p>
                    <Button
                      onClick={createDatabaseSchema}
                      disabled={creating}
                      className="w-full"
                      variant="default"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Schema...
                        </>
                      ) : (
                        'Create Database Schema'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">📝 Manual Setup</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>
                        Go to your <a
                          href="https://app.supabase.com/project/evyslzzekjrskeyparqn/sql"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Supabase SQL Editor
                        </a>
                      </li>
                      <li>Copy SQL from <code>code/database/schema.sql</code></li>
                      <li>Paste and execute in the editor</li>
                      <li>Test connection again</li>
                    </ol>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The schema will create all necessary tables for La Económica including
                  users, products, sales, inventory, and more.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Creation Result Card */}
        {createResult && (
          <Card>
            <CardHeader>
              <CardTitle className={createResult.success ? "text-green-600" : "text-orange-600"}>
                {createResult.success ? "✅ Schema Created!" : "⚠️ Partial Setup"}
              </CardTitle>
              <CardDescription>
                {createResult.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {createResult.success && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-800">🎉 Success!</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                    <li>✅ {createResult.tablesCreated?.length || 0} tables created</li>
                    {createResult.defaultData?.store && <li>✅ Default store configured</li>}
                    {createResult.defaultData?.categories && <li>✅ Product categories added</li>}
                    {createResult.defaultData?.adminUser && <li>✅ Admin user created</li>}
                  </ul>

                  {createResult.adminCredentials && (
                    <div className="mt-4 p-3 bg-green-100 rounded border-l-4 border-green-500">
                      <h5 className="font-medium text-green-800">🔑 Admin Credentials:</h5>
                      <p className="text-sm text-green-700">
                        Email: <code>{createResult.adminCredentials.email}</code><br/>
                        Password: <code>{createResult.adminCredentials.password}</code>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!createResult.success && createResult.manualInstructions && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-orange-800">Manual Setup Required</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700">
                    {createResult.manualInstructions.map((instruction: string, index: number) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              )}

              {createResult.tablesCreated && createResult.tablesCreated.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tables Created:</h4>
                  <div className="flex flex-wrap gap-2">
                    {createResult.tablesCreated.map((table: string) => (
                      <Badge key={table} variant="secondary">{table}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {createResult.errors && createResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Errors:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                    {createResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Success Card */}
        {testResult && testResult.status === 'success' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">🎉 Database Ready!</CardTitle>
              <CardDescription>
                Your database is fully configured and operational
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-green-800">What's Available:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                  <li>✅ All database tables created</li>
                  <li>✅ Default store configured</li>
                  <li>✅ Categories set up</li>
                  <li>✅ Admin user ready (admin@laeconomica.com)</li>
                  <li>✅ Backend API connected</li>
                  <li>✅ Ready for production use</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DatabaseTest;
