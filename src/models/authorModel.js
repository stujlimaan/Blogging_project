const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
    {
        fname: {
            type: String,
            required: "First name is required",
            trim:true
        },
        lname: {
            type: String,
            required: "last name is required",
            trim:true
        },
        title: {
            type:String,
            enum: ["Mr", "Mrs", "Miss"],
            required:"Title is required"
        },
        email: {
            type: String,
            unique: true,
            required: "email address is required",
            trim:true,
            lowercase:true,
            unique:true,
            validate:{
                validator:function(email){
                   return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
                },message:"please provide valid email address",
                isAsync:false
            }

        },
        password: {
            type: String,
            required: "password is required",
            trim :true
        }
    }
,
{ timestamps: true });


module.exports = mongoose.model('author', authorSchema)