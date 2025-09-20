const fetch = require('node-fetch');

exports.handler = async function(event) {
  const body = JSON.parse(event.body);
  const image = body.image.replace(/^data:image\/png;base64,/, '');
  const key = '1bb4b4844bd82d98383633c97390016f'; // Substitua aqui
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`,{
    method:'POST',
    body: new URLSearchParams({image})
  });
  const data = await response.json();
  return { statusCode:200, body: JSON.stringify({url:data.data.url}) };
}
