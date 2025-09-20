const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const finalizeBtn = document.getElementById('finalizeSession');
const photosContainer = document.getElementById('photosContainer');
const qrContainer = document.getElementById('qrContainer');

let photos = [];

// Acessa a webcam
navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 } })
  .then(stream => video.srcObject = stream)
  .catch(err => console.error("Erro ao acessar a câmera:", err));

// Tirar foto
takePhotoBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataURL = canvas.toDataURL('image/png');
  photos.push(dataURL);
  renderPhotos();
});

// Renderiza fotos capturadas
function renderPhotos() {
  photosContainer.innerHTML = '';
  photos.forEach((photo, index) => {
    const div = document.createElement('div');
    div.classList.add('photoWrapper');

    const img = document.createElement('img');
    img.src = photo;
    div.appendChild(img);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✖';
    removeBtn.addEventListener('click', () => {
      photos.splice(index, 1);
      renderPhotos();
    });
    div.appendChild(removeBtn);

    photosContainer.appendChild(div);
  });
}

// Finalizar sessão → envia para createSessionPage.js
finalizeBtn.addEventListener('click', async () => {
  if(photos.length === 0) return alert('Tire ao menos uma foto!');
  try {
    const response = await fetch('/.netlify/functions/createSessionPage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos })
    });
    const data = await response.json();
    qrContainer.innerHTML = '';
    QRCode.toCanvas(data.qrUrl, { width: 200 }, (err, canvas) => {
      if(err) console.error(err);
      qrContainer.appendChild(canvas);
    });
  } catch (err) {
    console.error("Erro ao criar sessão:", err);
  }
});
