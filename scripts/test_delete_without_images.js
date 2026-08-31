async function testDeleteWithoutImages() {
  try {
    const res = await fetch('http://localhost:8000/api/admin/products/without-images', {
      method: 'DELETE'
    });
    console.log('STATUS:', res.status, res.statusText);
    const data = await res.json();
    console.log('RESPONSE:', data);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

testDeleteWithoutImages();
