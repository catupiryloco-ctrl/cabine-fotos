const fetch = require('node-fetch');
const fs = require('fs');
const archiver = require('archiver');

exports.handler = async function(event, context) {
  try {
    const { photos } = JSON.parse(event.body);
    if (!photos || !photos.length) return { statusCode: 400, body: 'Nenhuma foto' };

    // Gerar HTML da sessão
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Suas Fotos</title>
      <style>
        body { font-family:sans-serif; text-align:center; padding:20px; }
        img { max-width:90%; max-height:80vh; display:block; margin: 0 auto; }
        button { padding:10px 20px; font-size:16px; margin-top:10px; cursor:pointer; }
      </style>
    </head>
    <body>
      <h1>Suas Fotos</h1>
      <div id="carousel">
        ${photos.map((p,i)=>`<img src="${p}" ${i>0?'style="display:none"':''}>`).join('')}
      </div>
      <button id="prev">⬅️</button>
      <button id="next">➡️</button>
      <button id="downloadAll">Baixar Fotos</button>
      <script>
        let idx=0;
        const imgs=document.querySelectorAll('#carousel img');
        document.getElementById('next').onclick=()=>{ imgs[idx].style.display='none'; idx=(idx+1)%imgs.length; imgs[idx].style.display='block'; };
        document.getElementById('prev').onclick=()=>{ imgs[idx].style.display='none'; idx=(idx-1+imgs.length)%imgs.length; imgs[idx].style.display='block'; };
        document.getElementById('downloadAll').onclick=()=>{
          const zip = new JSZip();
          imgs.forEach((img,i)=>{ zip.file('foto'+(i+1)+'.png', fetch(img.src).then(r=>r.blob())); });
          zip.generateAsync({type:'blob'}).then(blob=>{ saveAs(blob,'fotos.zip'); });
        };
      </script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.11.0/jszip.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
    </body>
    </html>
    `;

    // Salvar HTML em Netlify /tmp e retornar como URL temporária
    const filename = `/tmp/session_${Date.now()}.html`;
    fs.writeFileSync(filename, htmlContent);
    // Como não podemos servir /tmp direto, podemos usar uma solução:
    // - Salvar no GitHub Pages / Netlify deploy programático / ou retornar base64 da página
    // Aqui retornamos base64 que pode ser aberto com data:text/html;base64, na prática usaríamos deploy real
    const base64 = Buffer.from(htmlContent).toString('base64');
    return {
      statusCode: 200,
      body: JSON.stringify({ url: `data:text/html;base64,${base64}` })
    };
  } catch(e) {
    console.error(e);
    return { statusCode: 500, body: 'Erro interno' };
  }
};
