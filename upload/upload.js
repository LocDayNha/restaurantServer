const {upload_firebase} = require('../routes/utils/multerConfig')
const multer = require('multer')

function uploadFile(req, res, next) {
    const uploadFiles = upload_firebase.fields([{ name: 'image' }]);

    uploadFiles(req, res, function (err) {
        try {

            if (err instanceof multer.MulterError) {
                console.log("Uploading images to server error(api)", err);
                // A Multer error occurred when uploading.
                return res.status(500).json({ error: err })
            } else if (err) {
                console.log("Uploading images to server error(api)", err);

                // An unknown error occurred when uploading.
                return res.status(500).json({ error: err })

            }
            console.log('aaaaaaaaa')
            next()
        } catch (error) {
            console.log("MULTER UPLOAD ERROR: ",error);

            return res.status(500).json({ error: error })

        }
        // Everything went fine. 
    })
}
module.exports = { uploadFile }
