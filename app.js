let mode = 'single';
let currentPhoto = null;
let sessionPhotos = [];

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const thumbnails = document.getElementById('thumbnails');
const qrcodeDiv = document.getElementById('qrcode');

// Acesso à câmera com resolução máxima
navigator.mediaDevices.getUserMedia({ 
  video: { width: { ideal: 4096 }, height: { ideal: 2160 } } 
})
.then(stream => video.srcObject = stream)
.catch(err => console.error(err));

document.getElementById('singleMode').onclick = () => { mode='single'; resetUI(); }
document.getElementById('multiMode').onclick = () => { mode='multi'; resetUI(); }

document.getElementById('snap').onclick = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video,0,0,canvas.width,canvas.height);
  currentPhoto = canvas.toDataURL('image/png');

  if(mode==='multi'){
    sessionPhotos.push(currentPhoto);
    addThumbnail(currentPhoto);
  }
}

document.getElementById('retake').onclick = () => { currentPhoto=null; }

document.getElementById('send').onclick = async () => {
  if(!currentPhoto) return alert('Tire uma foto primeiro!');
  const link = await uploadPhoto(currentPhoto);
  generateQRCode(link);
}

document.getElementById('finishSession').onclick = async () => {
  if(sessionPhotos.length===0) return alert('Tire pelo menos 1 foto!');

  // Envia todas as fotos
  const uploadedUrls = [];
  for(const photo of sessionPhotos){
    const url = await uploadPhoto(photo);
    uploadedUrls.push(url);
  }

  // Cria HTML real da sessão
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Sua Sessão de Fotos</title>
      <style>
        body{font-family:sans-serif;text-align:center;}
        img{max-width:90%;margin:10px;border:2px solid #333;border-radius:10px;}
        .download-btn{display:block;margin:5px;padding:5px 10px;background:#333;color:white;text-decoration:none;border-radius:5px;}
      </style>
    </head>
    <body>
      <h1>Sua Sessão de Fotos</h1>
      ${uploadedUrls.map((url,i)=>`<div><img src="${url}"><a class="download-btn" href="${url}" download="foto_${i+1}.png">Baixar Foto ${i+1}</a></div>`).join('')}
      <a class="download-btn" id="downloadAll" href="#">Baixar Todas (ZIP)</a>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
      <script>
        document.getElementById('downloadAll').onclick = () => {
          const zip = new JSZip();
          ${uploadedUrls.map((url,i)=>`zip.file('foto_${i+1}.png', fetch("${url}").then(r=>r.blob()));`).join('')}
          zip.generateAsync({type:'blob'}).then(content=>{
            const a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download='todas_as_fotos.zip';
            a.click();
          });
        };
      </script>
    </body>
    </html>
  `;

  // Aqui você precisa criar a função real no servidor que receba este HTML e gere uma URL pública
  // Por enquanto, teste local com Blob (PC):
  const blob = new Blob([htmlContent], {type:'text/html'});
  const url = URL.createObjectURL(blob); 
  generateQRCode(url);
}

// Funções auxiliares
function addThumbnail(base64){
  const wrapper = document.createElement('div');
  wrapper.className='thumbnail-wrapper';
  const img = document.createElement('img'); img.src=base64;
  const icon = document.createElement('div'); icon.className='download-icon'; icon.innerHTML='⬇';
  icon.onclick=()=>downloadPhoto(base64, `foto.png`);
  wrapper.appendChild(img); wrapper.appendChild(icon);
  thumbnails.appendChild(wrapper);
}

function downloadPhoto(base64,name){
  const a=document.createElement('a'); a.href=base64; a.download=name; a.click();
}

function resetUI(){
  sessionPhotos=[]; thumbnails.innerHTML=''; qrcodeDiv.innerHTML=''; currentPhoto=null;
}

function generateQRCode(url){
  qrcodeDiv.innerHTML=''; new QRCode(qrcodeDiv,url);
}

async function uploadPhoto(base64){
  const response = await fetch('/.netlify/functions/uploadPhoto', {
    method:'POST', body:JSON.stringify({image:base64})
  });
  const data = await response.json();
  return data.url;
}
