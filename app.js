import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQUGfOQB5v49PqwujEDIEgbZIAuDJeEow",
  authDomain: "descuentos-c64eb.firebaseapp.com",
  projectId: "descuentos-c64eb",
  storageBucket: "descuentos-c64eb.firebasestorage.app",
  messagingSenderId: "631933876003",
  appId: "1:631933876003:web:acbc00c91befc61ded7e96"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);
const loginPanel=$("loginPanel"), chatPanel=$("chatPanel"), statusEl=$("status");
const roomKeyInput=$("roomKey"), enterRoom=$("enterRoom"), loginError=$("loginError");
const messagesEl=$("messages"), form=$("messageForm"), input=$("messageInput");
const sendButton=$("sendButton"), counter=$("counter"), copyLink=$("copyLink");

let currentUser=null, roomId=null, unsubscribe=null;

function cleanRoomId(value){
  return value.trim().replace(/[^A-Za-z0-9_-]/g,"").slice(0,64);
}

function formatDate(ts){
  if(!ts) return "ahora";
  const d=ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("es-BO",{dateStyle:"short",timeStyle:"short"});
}

function renderMessage(data){
  const box=document.createElement("article");
  box.className="message"+(data.uid===currentUser?.uid?" mine":"");
  const p=document.createElement("p");
  p.textContent=data.text||"";
  const time=document.createElement("time");
  time.textContent=formatDate(data.createdAt);
  box.append(p,time);
  return box;
}

function listenToRoom(){
  if(unsubscribe) unsubscribe();
  messagesEl.innerHTML="";
  loginError.textContent="";

  // No usamos orderBy de Firestore: cargamos los documentos y ordenamos
  // en el navegador. Esto evita problemas de índices o timestamps.
  const ref=collection(db,"rooms",roomId,"messages");
  unsubscribe=onSnapshot(query(ref),snapshot=>{
    const docs=[];
    snapshot.forEach(doc=>{
      docs.push({id:doc.id,...doc.data()});
    });

    docs.sort((a,b)=>{
      const at=a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bt=b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return at-bt;
    });

    messagesEl.innerHTML="";
    docs.forEach(data=>messagesEl.appendChild(renderMessage(data)));
    messagesEl.scrollTop=messagesEl.scrollHeight;
  },error=>{
    console.error("Firestore read error:",error);
    loginError.textContent="Error leyendo mensajes: "+(error.code||"revisa las reglas de Firestore");
  });
}

async function enter(){
  const key=cleanRoomId(roomKeyInput.value);
  if(key.length<8){
    loginError.textContent="Usa una clave de al menos 8 caracteres.";
    return;
  }
  if(!currentUser){
    loginError.textContent="Espera a que Firebase termine de conectar.";
    return;
  }

  // La clave queda solamente en memoria. NO se coloca en la URL.
  roomId=key;
  history.replaceState(null,"",location.pathname+location.search);

  loginError.textContent="";
  loginPanel.classList.add("hidden");
  chatPanel.classList.remove("hidden");
  statusEl.textContent="Conversación privada";
  listenToRoom();
}

enterRoom.addEventListener("click",enter);
roomKeyInput.addEventListener("keydown",e=>{if(e.key==="Enter")enter();});
input.addEventListener("input",()=>counter.textContent=`${input.value.length}/2000`);

form.addEventListener("submit",async e=>{
  e.preventDefault();
  const text=input.value.trim();
  if(!text||!roomId||!currentUser)return;

  sendButton.disabled=true;
  try{
    await addDoc(collection(db,"rooms",roomId,"messages"),{
      text,
      uid:currentUser.uid,
      createdAt:serverTimestamp()
    });
    input.value="";
    counter.textContent="0/2000";
    input.focus();
  }catch(error){
    console.error("Firestore write error:",error);
    alert("No se pudo enviar el mensaje: "+(error.code||"error desconocido"));
  }finally{
    sendButton.disabled=false;
  }
});

copyLink.addEventListener("click",async()=>{
  // Solo copia la página, nunca la clave.
  try{
    await navigator.clipboard.writeText(location.origin+location.pathname+location.search);
    copyLink.textContent="Enlace copiado";
    setTimeout(()=>copyLink.textContent="Copiar enlace",1500);
  }catch{
    alert("Copia manualmente la dirección de esta página.");
  }
});

onAuthStateChanged(auth,user=>{
  currentUser=user;
  statusEl.textContent=user?"Listo":"Conectando…";
});

signInAnonymously(auth).catch(error=>{
  console.error("Anonymous auth error:",error);
  statusEl.textContent="Error de conexión";
  loginError.textContent="No se pudo iniciar la sesión anónima. Revisa Authentication > Anonymous.";
});
