import { MulterModuleOptions } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig: MulterModuleOptions = {
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  },
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit per file
  },
  // donde ctm guardo esta wea
  storage: diskStorage({
    destination: process.cwd() + "/uploads/",
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e3);
      const extension = extname(file.originalname)
      const newFilename = file.filename + '-' +  uniqueSuffix + extension;
      callback(null, newFilename);
    },
  }),
};