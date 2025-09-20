let sessionPhotos = [];
const thumbnails = document.getElementById('thumbnails');
const captureBtn = document.getElementById('capture');
const finalizeBtn = document.getElementById('finalize');
const qrCodeContainer = document.getElementById('qrCode');

// Tirar foto
captureBtn.onclick = async () => {
  const video = document.getElementById('video');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;  // mantém resolução máxima da webcam
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  sessionPhotos.push(dataUrl);
  addThumbnail(dataUrl, sessionPhotos.length - 1);
};

// Adicionar miniatura com X para deletar
function addThumbnail(base64, index) {
  const wrapper = document.createElement('div');
  wrapper.className = 'thumbnail-wrapper';

  const img = document.createElement('img');
  img.src = base64;

  const icon = document.createElement('div');
  icon.className = 'delete-icon';
  icon.innerHTML = '❌';
  icon.onclick = () => {
    sessionPhotos.splice(index, 1);
    thumbnails.removeChild(wrapper);
  };

  wrapper.appendChild(img);
  wrapper.appendChild(icon);
  thumbnails.appendChild(wrapper);
}

// Finalizar Sessão → criar página e gerar QR Code
finalizeBtn.onclick = async () => {
  if (!sessionPhotos.length) return alert('Nenhuma foto selecionada!');
  qrCodeContainer.innerHTML = 'Gerando QR Code...';
  try {
    const res = await fetch('/.netlify/functions/createSessionPage', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({photos: sessionPhotos})
    });
    const data = await res.json();
    qrCodeContainer.innerHTML = '';
    new QRCode(qrCodeContainer, data.url);  // QR Code aponta para página gerada
  } catch (e) {
    console.error(e);
    qrCodeContainer.innerHTML = 'Erro ao gerar QR Code';
  }
};
