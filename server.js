const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos desde la carpeta build de React
app.use(express.static(path.join(__dirname, 'build')));

// Manejar cualquier solicitud enviando el index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});