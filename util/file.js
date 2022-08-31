const fs=require('fs');

const deleteFile=(filePath)=>{
    fs.unlink(filePath,(err)=>{
        if(err){
            throw new(err);
        }

    })

}
exports.deleteFile=deleteFile;