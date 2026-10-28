import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs'
import config from '../config';


cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
});



export const sendImageToCloudinary = (path: string, imageName: string): Promise<string> => {

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            path,
            {
                public_id: imageName
            },
            function (error, result) {
                if (error) {
                    return reject(error)
                }
                if (!result) {
                    return reject(new Error('No response from Cloudinary'))
                }
                fs.unlink(path, (error) => {
                    if (error) {
                        console.warn('Failed to delete local file:', error)
                    }
                    resolve(result.secure_url)
                })
            }
        )

    })

}


// multer 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.cwd() + '/uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

export const upload = multer({ storage: storage })