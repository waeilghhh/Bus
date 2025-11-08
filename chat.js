const chat = document.getElementById('chat');
const txt = document.getElementById('txt');
const send = document.getElementById('send');

function addMsg(text, cls){
  const d = document.createElement('div');
  d.className = 'msg ' + cls;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

send.addEventListener('click', doSend);
txt.addEventListener('keydown', e => { if(e.key==='Enter') doSend(); });

async function doSend() {
  const value = txt.value.trim();
  if(!value) return;

  addMsg(value, 'user');
  txt.value = '';
  addMsg('⏳ جاري المعالجة...', 'bot');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ prompt: value })
    });

    const data = await res.json();
    if(chat.lastChild && chat.lastChild.textContent.includes('⏳')) 
        chat.removeChild(chat.lastChild);

    if(data.error) addMsg('❌ ' + data.error, 'bot'); 
    else addMsg(data.reply, 'bot');

  } catch(err) {
    if(chat.lastChild && chat.lastChild.textContent.includes('⏳')) 
        chat.removeChild(chat.lastChild);
    addMsg('❌ فشل الاتصال بالخادم.', 'bot');
    console.error(err);
  }
}
