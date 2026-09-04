# Buzón privado v3

Esta versión corrige dos problemas de la versión anterior:

1. La clave YA NO aparece en la URL.
2. La lectura de mensajes no depende de `orderBy()` de Firestore; los documentos se cargan y ordenan en el navegador.

## Firebase
Proyecto configurado:
- projectId: descuentos-c64eb
- Authentication Anonymous: debe estar activado.
- Firestore: debe estar creado.

Publicar en Firestore > Rules el contenido de `firestore.rules`.

## GitHub Pages
Subir:
- index.html
- style.css
- app.js
- firestore.rules
- .nojekyll

En Settings > Pages:
Deploy from a branch > main > / (root).

## Funcionamiento
La URL será solamente la dirección del sitio:
https://TUUSUARIO.github.io/TUREPOSITORIO/

La clave se escribe en la página y permanece únicamente en memoria del navegador. No se guarda en la URL ni en localStorage.

## Importante
Esta versión no proporciona cifrado de extremo a extremo. Firebase puede recibir el contenido de los mensajes en texto legible. No usar para información de alto riesgo.
