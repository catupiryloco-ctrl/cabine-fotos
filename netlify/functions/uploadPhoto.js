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

    // 2️⃣ Criar página HTML de download
    const htmlPage = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Sua Foto</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 50px; }
          img { max-width: 90%; height: auto; border: 2px solid #333; margin-bottom: 20px; }
          button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Sua Foto</h1>
        <img src="${imgLink}" alt="Sua Foto">
        <br><br>
        <a href="${imgLink}" download="${name}.png">
          <button>Baixar Foto</button>
        </a>
      </body>
      </html>
    `;

    // 3️⃣ Retornar a página como data URL para QR Code
    const encodedPage = Buffer.from(htmlPage).toString('base64');
    const pageURL = `data:text/html;base64,${encodedPage}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, pageURL })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
