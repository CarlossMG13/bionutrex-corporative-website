const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testAdminAPI() {
  try {
    console.log('🔐 Intentando login...');
    
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@bionutrex.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // Test admin endpoint
    console.log('\n📋 Probando endpoint de admin...');
    const adminResponse = await axios.get(`${API_URL}/home-sections/admin/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Endpoint de admin funciona');
    console.log(`📊 Número de secciones: ${adminResponse.data.length}`);
    
    if (adminResponse.data.length > 0) {
      console.log('\n📝 Primeras secciones:');
      adminResponse.data.slice(0, 2).forEach((section, index) => {
        console.log(`  ${index + 1}. ${section.title} (${section.sectionKey}) - Active: ${section.active}`);
      });
    }
    
    // Test update endpoint
    if (adminResponse.data.length > 0) {
      const firstSection = adminResponse.data[0];
      console.log(`\n🔄 Probando actualización de: ${firstSection.title}`);
      
      const formData = new FormData();
      formData.append('title', firstSection.title);
      formData.append('content', firstSection.content);
      formData.append('active', (!firstSection.active).toString());
      formData.append('order', firstSection.order.toString());
      
      try {
        const updateResponse = await axios.put(`${API_URL}/home-sections/${firstSection.id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('✅ Update funciona correctamente');
        console.log(`   Active cambiado de ${firstSection.active} a ${updateResponse.data.active}`);
      } catch (updateError) {
        console.log('❌ Error en update:', updateError.response?.data?.error || updateError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
}

testAdminAPI();