// Test para verificar imágenes en la consola del navegador
console.log('🔍 Testing image loading...');

const images = [
  '/images/MethImage.jpg',
  '/images/heroSection-img.jpg', 
  '/images/img1-grid-product.jpg',
  '/images/img2-grid-product.jpg',
  '/images/img3-grid-product.jpg'
];

async function testImageLoading() {
  const results = [];
  
  for (const imagePath of images) {
    try {
      const img = new Image();
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve({ 
          path: imagePath, 
          status: 'success',
          dimensions: { width: img.width, height: img.height }
        });
        img.onerror = () => reject({ 
          path: imagePath, 
          status: 'error' 
        });
      });
      
      img.src = imagePath;
      const result = await Promise.race([
        loadPromise,
        new Promise((_, reject) => setTimeout(() => reject({
          path: imagePath,
          status: 'timeout'
        }), 3000))
      ]);
      
      results.push(result);
      console.log(`✅ ${imagePath} - ${result.dimensions.width}x${result.dimensions.height}`);
    } catch (error) {
      results.push(error);
      console.log(`❌ ${error.path} - ${error.status}`);
    }
  }
  
  const successful = results.filter(r => r.status === 'success').length;
  console.log(`\n📊 Results: ${successful}/${images.length} images loaded successfully`);
  
  if (successful === images.length) {
    console.log('🎉 All images are working correctly!');
  } else {
    console.log('⚠️ Some images failed to load');
  }
  
  return results;
}

// Copy this to browser console and run: testImageLoading()
console.log('📋 Run this command in browser console: testImageLoading()');