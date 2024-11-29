const Video = require('../models/Video');
const s3 = require('../config/s3');

// Subir video
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const { file } = req;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `videos/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadResult = await s3.upload(params).promise();
    
    const video = new Video({
      title: file.originalname,
      url: uploadResult.Location,
      key: uploadResult.Key,
      size: file.size,
      type: file.mimetype
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error('Error en uploadVideo:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los videos
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un video específico
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    // Eliminar de S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: video.key
    };

    await s3.deleteObject(deleteParams).promise();
    
    // Eliminar de la base de datos
    await video.remove();
    
    res.json({ message: 'Video eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar información del video
exports.updateVideo = async (req, res) => {
  try {
    const { title } = req.body;
    
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    video.title = title || video.title;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};