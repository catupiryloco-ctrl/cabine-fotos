const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body);
    const base64Image = body.image.replace(/^data:image\/png;base64,/, '');
    
    const API_KEY = 'SUA_API_KEY_IMGBB'; // Substitua pela sua chave do Imgbb

    const formData = new URLSearchParams();
    formData.append('image', base64Image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!data.success) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Falha no upload da imagem' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ url: data.data.url })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
