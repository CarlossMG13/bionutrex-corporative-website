// Test script para probar el endpoint
async function testMediaLibraryEndpoint() {
  const BACKEND_URL = 'http://localhost:3001';
  
  try {
    console.log('Testing backend endpoint...');
    
    const response = await fetch(`${BACKEND_URL}/api/uploads/list`);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Raw response text:', text);
      
      if (text.trim()) {
        try {
          const fileNames = JSON.parse(text);
          console.log('Parsed JSON:', fileNames);
          console.log('Test PASSED! ✅');
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.log('Test FAILED! ❌');
        }
      } else {
        console.log('Empty response, but that is OK');
        console.log('Test PASSED! ✅');
      }
    } else {
      console.error('Response not OK:', response.status);
      console.log('Test FAILED! ❌');
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    console.log('Test FAILED! ❌');
  }
}

// Run test
testMediaLibraryEndpoint();