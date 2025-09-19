const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const btn = document.getElementById('takePhoto');
const fotoResult = document.getElementById('fotoResult');
const qrCodeDiv = document.getElementById('qrCode');

let fotoCounter = 1;

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => console.error('Erro ao acessar câmera:', err));

btn.addEventListener('click', async () => {
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const base64 = canvas.toDataURL('image/png').split(',')[1];
  fotoResult.src = canvas.toDataURL('image/png');

  try {
    const res = await fetch('/.netlify/functions/uploadPhoto', {
      method: 'POST',
      body: JSON.stringify({
        imageBase64: base64,
        name: 'foto' + fotoCounter
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (data.success) {
      const pageURL = data.pageURL;
      console.log(`Página da foto${fotoCounter}:`, pageURL);

      qrCodeDiv.innerHTML = '';
      const qrImg = document.createElement('img');
      QRCode.toDataURL(pageURL, { width: 200 })
        .then(url => {
          qrImg.src = url;
          qrCodeDiv.appendChild(qrImg);
        });

      fotoCounter++;
    } else {
      console.error('Erro na função serverless:', data.error);
      alert('Erro ao processar a foto. Veja o console.');
    }

  } catch (err) {
    console.error('Erro no fetch da função:', err);
    alert('Erro ao enviar a foto. Veja o console.');
  }
});
