const express = require("express");
const app = express();
const aws = require("aws-sdk")
const multer = require("multer")
const uuid = require('uuid/v4')
const accessKeyId = ""
const secretAccessKey = ""
const bucketName = ""
const dynamoDB = new aws.DynamoDB.DocumentClient({
    region: "us-east-2",
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
});
const s3 = new aws.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json({extended:false}));
app.set("view engine","ejs");
app.set("views","./views");
app.listen(5000,(err)=>{
    if(err)
        console.log("loi" + err);
    else
        console.log("server running 5000");
});
// get sinh vien
app.get("/",(req,res) =>{
    const params = {
        TableName : "SinhVien",
    };
    dynamoDB.scan(params,(err,data)=>{
        if(err){
            console.log(JSON.stringify(err,null,2));
        }else{
            res.render("index",{
                dataSV: data.Items,
            });
        }
    });
});
// upload to S3
const storage =  multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, '')
    }
});
const upload = multer({storage}).single('anh')
// them sinh vien 
app.post("/themSinhVien",upload,(req,res) =>{
    let myFile = req.file.originalname.split(".")
    const fileType = myFile[myFile.length - 1]
    const {maSV,tenSV,ngaySinh} = req.body;
    const paramsUploadImg = {
        Bucket: bucketName,  
        Key: `${uuid()}.${fileType}`,
        Body: req.file.buffer
    }
    console.log("name:" + paramsUploadImg.Key)
    s3.upload(paramsUploadImg, (error, data) => {
        if(error){
            res.status(500).send(error)
        }
    })
    const locationImg = `https://${bucketName}.s3.amazonaws.com/${paramsUploadImg.Key}`
    const sinhVien = {
        id :1,
        maSV : maSV,
        tenSV : tenSV,
        ngaySinh : ngaySinh,
        avatar : locationImg
    }
    const paramsAddSinhVien = {
        TableName : "SinhVien",
        Item:sinhVien
    };
    dynamoDB.put(paramsAddSinhVien,(err,data)=>{
        if(err)
            console.log(JSON.stringify(err,null,2));
        else
            res.redirect("/");
    });
})
// delete sinh vien
app.post("/deleteSinhVien",(req,res)=>{
    const {id,maSV} = req.body;

    console.log(maSV);
    const paramsDeleteSinhVien = {
        TableName : "SinhVien",
        Key:{
            id : parseInt(id),
            maSV : maSV
        }
    };
    dynamoDB.delete(paramsDeleteSinhVien,(err,data)=>{
        if(err)
            console.log(JSON.stringify(err,null,2));
        else   
            res.redirect("/");
    });
})
app.post("/updateForm",(req,res)=>{
    const {id,maSV,tenSV,ngaySinh,anh} = req.body;
    const sinhVien = {
        id :id,
        maSV : maSV,
        tenSV : tenSV,
        ngaySinh : ngaySinh,
        avatar : anh
    }
    res.render("formupdate",{
        sinhvien : sinhVien
    });
});
// update sinh vien
app.post("/updateSinhVien",upload,(req,res)=>{
    const {id,maSV,tenSV,ngaySinh} = req.body;
    let myFile = req.file.originalname.split(".");
    const fileName = myFile[myFile.length - 1];
    const paramsUploadImg = {
        Bucket : bucketName,
        Key : `${uuid()}.${fileName}`,
        Body : req.file.buffer
    }
    s3.upload(paramsUploadImg,(error,data)=>{
        if(error)
            console.log(JSON.stringify(error,null,2));
    });
    const avatar = `https://${bucketName}.s3.amazonaws.com/${paramsUploadImg.Key}`
    const paramsUpdateSinhVien = {
        TableName : "SinhVien",
        Key:{
            "id" : parseInt(id),
            "maSV" : maSV,
        },
        UpdateExpression: "set #tenSV=:ten ,#ngaySinh=:ns ,#avatar=:ava",
        ExpressionAttributeNames: {
        "#tenSV": "tenSV",
        "#ngaySinh": "ngaySinh",
        "#avatar": "avatar",
        },
        ExpressionAttributeValues: {
        ":ten": tenSV,
        ":ns": ngaySinh,
        ":ava": avatar,
        },
        ReturnValues: "UPDATED_NEW",
    };
    dynamoDB.update(paramsUpdateSinhVien,(error,data)=>{
        if(error){
            console.log(JSON.stringify(error,null,2));
        }
        else{
            res.redirect("/");
        }
    });
});
//delete sinh vien 
app.post("/deleteSinhVien",(req,res)=>{
    const {id,maSV} = req.body;
    const paramsDeleteSinhVien = {
        TableName : "SinhVien",
        Key : {
            id : parseInt(id),
            maSV : maSV
        },
    };
    dynamoDB.delete(params,(error,data)=>{
        if(error){
            console.log(JSON.stringify(error,null,2));
        }
        else{
            res.redirect("/");
        }
    });
});