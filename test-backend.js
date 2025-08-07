import http from 'http';

const testBackend = () => {
  console.log('🔍 Iniciando verificación del backend...');
  
  // Test health endpoint
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('✅ Health check response:', data);
      console.log('✅ Backend verification completed successfully!');
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error('❌ Backend verification failed:', e.message);
    process.exit(1);
  });

  req.setTimeout(5000, () => {
    console.error('❌ Backend verification timeout');
    req.destroy();
    process.exit(1);
  });

  req.end();
};

setTimeout(testBackend, 2000); // Wait 2 seconds for server to start
