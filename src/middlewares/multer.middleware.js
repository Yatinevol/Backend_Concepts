import multer from "multer";

const storage = multer.diskStorage({
    // so this file option in-between is provided by the multer, that's why we use it.
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      
      
      cb(null, file.originalname)
    }
  })
  
 export const upload = multer({ 
    storage

 })