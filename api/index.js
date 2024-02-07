const express= require('express');
const cors= require('cors');
const mongoose = require('mongoose');
const User= require('./models/User');
const Post= require('./models/Post');
const bcrypt =require('bcryptjs');//password encryption
const app= express();
const jwt= require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer=require('multer');
const uploadMiddleware= multer({dest: 'uploads/'});
const fs=require('fs');


const salt=bcrypt.genSaltSync(10);//padding to password
const secret='assdhjkllghjkkhhasdfghhhbnmxcvnnjkfgh';


app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://blog:gPAkEicVa1BGMUNf@cluster0.yxqhfmb.mongodb.net/?retryWrites=true&w=majority');
app.post('/register',async (req,res)=>{
    const {username,password}=req.body;
    try{
        const userDoc= await User.create({
            username,
            password:bcrypt.hashSync(password,salt)
        });// this return our newly create user document so storing it
        res.json(userDoc);
    }
    catch(e){
        res.status(400).json(e);
    }
});

app.post('/login',async (req,res)=>{
    const {username,password}=req.body;
    const userDoc= await User.findOne({username});
    const passOk=bcrypt.compareSync(password,userDoc.password);//comparing password store in db ans user entry

    if(passOk){
        //logged in ->need to send token for session

        //creation of token (username,secret key)=>2 parameters--->sending this as a cookie rather json back
        jwt.sign({username,id:userDoc._id,}, secret, {}, (err,token)=>{
            if(err) throw err;
            res.cookie('token',token).json({
                id:userDoc._id,
                username,
            });
        });
    }
    else{
        res.status(400).json('wrong credentials');
    }
});

app.get('/profile', (req,res)=>{    // it will get request profile and it will return profile information
    const {token}= req.cookies;     // trying to read this token which we can only read using secret key means at backend side
     jwt.verify(token, secret, {}, (err,info)=>{//iat= issused at= when the token has created(helping in validating token older than some kind of date)
        if(err)throw err;
        res.json(info);
     });   
});

app.post('/logout', (req,res)=>{
    res.cookie('token', '').json('ok');
})

app.post('/post', uploadMiddleware.single('file'),async (req,res)=>{//files stores in uploads folder with the name like (c5dd2aed67fe4e8f54fd135ab6de2db6) 
    //adding extenion .jpeg to original file name so that we can open it
    const{originalname,path}=req.file;   //originalname- '2.jpg' saved as in this pc
    const parts=originalname.split('.');     //{"part":["2","jpg"]}
    const ext=parts[parts.length-1];
    //renaming uploaded file with name+ext
    const newPath=path+'.'+ext;
    fs.renameSync(path, newPath);
    
    const {token}= req.cookies;     // trying to read this token which we can only read using secret key means at backend side
    jwt.verify(token, secret, {},async (err,info)=>{//iat= issused at= when the token has created(helping in validating token older than some kind of date)
    if(err)throw err;
    //saving everthing user uploaded while creating blog- title,summary,content,file to a database(so that we need new model)
    const {title,summary,content}=req.body;
    const postDoc =await Post.create({
        title, summary, content, cover:newPath, author:info.id,
    });
    res.json(postDoc);
    }); 
});

app.put('/post',uploadMiddleware.single('file'),async (req,res)=>{
    let newPath=null;
    if(req.file)//if image uploads is being edited -apply same steps while creating post
    {
        const{originalname,path}=req.file;   
        const parts=originalname.split('.');     
        const ext=parts[parts.length-1];
        newPath=path+'.'+ext;
        fs.renameSync(path, newPath);
    }
    //before we change the post we need to send the cookie>>>why?
    const {token}= req.cookies;     
    jwt.verify(token, secret, {},async (err,info)=>{//verifying cookie
    if(err)throw err;

    //verified successfully then need to match userid with author id -permit to make changes 
    const {id,title,summary,content}=req.body;
    const postDoc =await Post.findById(id);
    const isAuthor=JSON.stringify(postDoc.author)===JSON.stringify(info.id);//author is type of objectID for better comparsion we need to json stringify
    if(!isAuthor)
    return res.status(400).json('you are not the author');

    await postDoc.updateOne({
        title, summary, content,cover:newPath? newPath:postDoc.cover,
    });

    res.json(postDoc);
    }); 
});

app.get('/post',async (req,res)=>{//get request is default so we dont need to define method on feh inside our react app
    res.json(
        await Post.find()
        .populate('author',['username'])
        .sort({createAt:-1})
        .limit(20)
    );
})

app.get('/post/:id',async(req,res)=>{
    const {id}=req.params;
    const postDoc= await Post.findById(id).populate('author',['username']);
    res.json(postDoc);
})
 
app.listen(4000);
