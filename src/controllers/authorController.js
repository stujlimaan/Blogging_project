const AuthorModel = require("../models/authorModel")
const emailValidator = require('express-validator')
const jwt=require('jsonwebtoken');


const isValid=function(value){
    if(typeof value === "undefined" || value==="null") return false
    if(typeof value === "string" && value.trim().length===0) return false
    return true
}

const isValidTitle=function(title){
    return ["Mr","Mrs","Miss"].indexOf(title) !== -1
}

const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length > 0
}

const createAuthor = async function (req, res) {
    try {
        let requestBody = req.body

        if(!isValidRequestBody(requestBody)){
            res.status(400).send({status:false,message:'invalid request parameter please provide author id'})
            return
        }



        const { fname,lname,email,password,title } = requestBody

        //start validator
        if(!isValid(fname)){
            res.status(400).send({status:false,message:"fname is required"})
            return
        }

        if(!isValid(lname)){
            res.status(400).send({status:false,message:"lname is required"})
            return 
        }

        if(!isValid(title)){
            res.status(400).send({status:false,message:"title is required"})
            return
        }

        if(!isValidTitle(title)){
            res.status(400).send({status:false,message:"title is mr mrs miss"})
            return
        }

        if(!isValid(email)){
            res.status(400).send({status:false,message:"email is required"})
        }

        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
            res.status(400).send({status:false,message:"email is required"})
            return
        }

        if(!isValid(password)){
            res.status(400).send({status:false,message:"password is required"})
            return
        }

        const isEmailAlreadyUsed=await AuthorModel.find({email})
        if(!isEmailAlreadyUsed){
            res.status(400).send({status:false,message:`${email} email is already used`})
            return
        }

        const authorData={fname,lname,email,password,title}
        const newAuthor  = await AuthorModel.create(authorData)
        res.status(201).send({status:true,data:newAuthor})
       
    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}



const login=async function(req,res){
    try{


        const requestBody = req.body;

        //validation start
        const {email,password}=requestBody;

        if(!isValid(email)){
            res.status(400).send({status:false,message:"email is required"})
        }


        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
            res.status(400).send({status:false,message:"email should be valid is required"})
            return
        }

        if(!isValid(password)){
            res.status(400).send({status:false,message:"password is required"})
        }
        
        
        //validation ends

        let author= await AuthorModel.findOne({email,password})

        if(!author){
            return res.status(401).send({status:false,message:"login credentials failed"})
        }

        let token = jwt.sign(
            {authorId:author._id.toString(),
            iat:Math.floor(Date.now()/1000),
            exp:Math.floor(Date.now()/1000)*10*60*60

            },
        "tujliman");
        res.header("x-api-key",token)
        // res.status(200).send(token)
        res.status(200).send({status:"author logged in",token:token})

    }catch(err){
        return res.status(500).send({msg:err.message})
    }

}

// module.exports.createAuthor = createAuthor
// module.exports.login=login

module.exports={
    createAuthor,login
}