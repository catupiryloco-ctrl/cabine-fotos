let mode = 'single';
let currentPhoto = null;
let sessionPhotos = [];

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const thumbnails = document.getElementById('thumbnails');
const qrcodeDiv = document.getElementById('qrcode');

// Acesso à câmera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

// Botões
document.getElementById('singleMode').onclick = () => { mode='single'; resetUI(); }
document.getElementById('multiMode').onclick = () => { mode='multi'; resetUI(); }

document.getElementById('snap').onclick = () => {
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
  const link = await uploadPhoto(currentPhoto); // Função upload para ImgBB
  generateQRCode(link);
}

document.getElementById('finishSession').onclick = () => {
  if(sessionPhotos.length===0) return alert('Tire pelo menos 1 foto!');
  const htmlContent = sessionPhotos.map((b64,i)=>`<img src="${b64}" style="width:90%;margin:10px;">`).join('');
  const blob = new Blob([htmlContent], {type:'text/html'});
  const url = URL.createObjectURL(blob);
  generateQRCode(url);
}

document.getElementById('downloadAll').onclick = () => {
  if(sessionPhotos.length===0) return alert('Nenhuma foto para baixar!');
  const zip = new JSZip();
  sessionPhotos.forEach((b64,i)=>{
    const imgData = b64.replace(/^data:image\/(png|jpg);base64,/, '');
    zip.file(`foto_${i+1}.png`, imgData, {base64:true});
  });
  zip.generateAsync({type:'blob'}).then(content=>{
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'todas_as_fotos.zip';
    a.click();
  });
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
