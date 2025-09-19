const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const { imageBase64, name } = JSON.parse(event.body);
    const API_KEY = '1bb4b4844bd82d98383633c97390016f'; // sua chave ImgBB

    // 1️⃣ Upload para ImgBB
    const formData = new URLSearchParams();
    formData.append('image', imageBase64);
    formData.append('name', name);
    formData.append('expiration', '604800'); // 7 dias

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const result = await res.json();

    if (!result.success) {
      return { statusCode: 500, body: JSON.stringify({ success: false, error: result }) };
    }

    const imgLink = result.data.url;

    // 2️⃣ Criar página dinâmica via query string
    // A URL real será o próprio site + query param
    const pageURL = `https://SEU-SITE.netlify.app/photo.html?img=${encodeURIComponent(imgLink)}&name=${encodeURIComponent(name)}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, pageURL })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
