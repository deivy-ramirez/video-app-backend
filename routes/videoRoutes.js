const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const upload = require('../middlewares/upload');

// Ruta para subir video
router.post('/upload', upload.single('video'), videoController.uploadVideo);

// Ruta para obtener todos los videos
router.get('/', videoController.getVideos);

// Ruta para obtener un video específico
router.get('/:id', videoController.getVideo);

// Ruta para eliminar un video
router.delete('/:id', videoController.deleteVideo);

// Ruta para actualizar información del video
router.put('/:id', videoController.updateVideo);

module.exports = router;