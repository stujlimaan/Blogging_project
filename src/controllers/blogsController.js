const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorModel")
const { send, type } = require("express/lib/response")
const mongoose = require('mongoose')

//CREATEBLOG-

const isValid=function(value){
    if(typeof value === "undefined" || value==="null") return false
    if(typeof value === "string" && value.trim().length === 0) return false
    return
}

const isValidrequestBody=function(requestBody){
    return (Object.keys(requestBody).length > 0)
    
}

const isValidObjectId=function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}


const createBlog = async function (req, res) {
    try {

        const requestBody=req.body

    if(!isValidrequestBody(requestBody)){
        return res.status(400).send({status:false,message:"please provide blog details"})
    }

    const {title,category,subcategory,body,tags,isPublished,authorId}=requestBody

    if(isValid(title)){
        return res.status(400).send({status:false,message:"blog title is required"})
    }

    if(isValid(category)){
        return res.status(400).send({status:false,message:"category is required"})
    }

    if(isValid(body)){
        return res.status(400).send({status:false,message:"body is required"})
    }

    if(isValid(authorId)){
        return res.status(400).send({status:false,message:"authorid is required"})
    }

    if(!isValidObjectId(authorId)){
        return res.status(400).send({status:false,message:`${authorId} author is not valid`})
    }


        let author = await authorModel.findById(authorId)
        if (!author) return res.status(400).send('The request is not valid as no author is present with  given author id')

        let publishedAt

        const blogData={
            title,body,authorId,category,
            isPublished:isPublished?isPublished:false,
            publishedAt:publishedAt?new Date():null
        }

        if(tags){
            if(Array.isArray(tags)){
                blogData['tags']=[...tags]
            }
            if(Object.prototype.toString.call(tags)===["object string"]){
                blogData['tags']=[tags]
            }
        }
       if(subcategory){
           if(Array.isArray(subcategory)){
               blogData['subcategory']=[...subcategory]
           }
           if(Object.prototype.toString.call(subcategory)===["object string"]){
               blogData['subcategory']=[subcategory]
           }
       }

        let createdBlog = await blogModel.create(blogData)
        res.status(201).send({status:true,message:"new blog created successfully" ,data: createdBlog })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}

//GETBLOG-

const getblogs = async function (req, res) {

    try {

        const filterQuery={isDeleted:false,deletedAt:null,isPublished:true}
        const queryParams=req.query;

        if(isValidrequestBody(queryParams)){

            if(isValid(authorId) && isValidObjectId(authorId) ){
                filterQuery['authorId']=authorId
            }

            if(isValid(category)){
                filterQuery['category']=category.trim()
            }

            if(isValid(tags)){
                const tagsArr=tags.trim().split(',').map(tag=>tag.trim());
                filterQuery['tags']={$all:tagsArr}
            }

            if(isValid(subcategory)){
                const subArr=subcategory.trim().split(',').map(sub=>sub.trim());
                filterQuery['subcategory']={$all:subArr}
            }
        

            let data = await blogModel.find(filterQuery)
            // res.send(data)
            if (data.length == 0) {
                return res.status(404).send({ status: false, msg: "no blogs " });
            } else {
                res.status(200).send({ status: true, message: "Successfully fetched all blogs", data: data })
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}



//UPDATEBLOG-

const updateBlog = async function (req, res) {

    try {

        const requestBody=req.body;
        const params=req.params
        const blogId=params.blogId
        const authorIdFromToken=req.authorId

        if(!isValidObjectId(blogId)){
            return res.status(400).send({status:false,message:`${blogId} is not valid`})
        }

        if(!isValidObjectId(authorIdFromToken)){
            return res.status(400).send({status:false,message:`${authorIdFromToken} is not valid`})
        }


        // let blogId = req.params.blogId;
        let blog = await blogModel.findOne({ _id: blogId,isDeleted:false,deletedAt:null });

        if (!blog) {
            return res.status(404).send({ status: false, msg: "No such blog exists" });
        }

        if(blog.authorId.toString() !== authorIdFromToken){
            return res.status(401).send({status:false,message:"unauthorizsed access owner info does not match"})
        }

        if(!isValidrequestBody(requestBody)){
            return res.status(200).send({status:true,message:"no parameters pass blog unmodified",data:blog})
        }

        const {title,body,tags,category,subcategory,isPublished}=requestBody
        const updatedblog={};

        if(isValid(title)){
            if(Object.prototype.hasOwnProperty.call(updatedblog,'$set')) updatedblog['$set']={}
            updatedblog['$set']['title']=title
        }

        if(isValid(body)){
            if(Object.prototype.hasOwnProperty.call(updatedblog,'$set')) updatedblog['$set']={}
            updatedblog['$set']['body']=body
        }

        if(isValid(category)){
            if(Object.prototype.hasOwnProperty.call(updatedblog,'$set')) updatedblog['$set']={}
            updatedblog['$set']['category']=category
        }

        if(isPublished!==undefined){
            if(Object.prototype.hasOwnProperty.call(updatedblog,'$set')) updatedblog['$set']={}
            updatedblog['$set']['isPublished']=isPublished
            updatedblog['$set']['publishedAt']=isPublished?new Date():null
            
        }

        if(tags){
            if(Object.prototype.hasOwnProperty.call(updatedblog,'$addToset')) updatedblog['$addToset']={}
            if(Array.isArray(tags)){
            updatedblog['$addToset']['tags']={$each:[...tags]}

            }
            if(typeof tags === "string"){
            updatedblog['$addToset']['tags']=tags

            }
            
        }

        if(subcategory){
            if(Object.prototype.hasOwnProperty.call(updatedblog,'$addToset')) updatedblog['$addToset']={}
            if(Array.isArray(subcategory)){
            updatedblog['$addToset']['tags']={$each:[...subcategory]}

            }
            if(typeof tags === "string"){
            updatedblog['$addToset']['subcategory']=subcategory

            }
            
        }

        let updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, updatedblog, { new: true })

        res.status(200).send({ status: true,message:"updated ", data: updatedBlog });
    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}

//DELETEBLOG-

const deleteUser = async function (req, res) {

    try {

        const requestBody=req.body;
        const params=req.params
        const blogId=params.blogId
        const authorIdFromToken=req.authorId

        if(!isValidObjectId(blogId)){
            return res.status(400).send({status:false,message:`${blogId} is not valid`})
        }

        if(!isValidObjectId(authorIdFromToken)){
            return res.status(400).send({status:false,message:`${authorIdFromToken} is not valid`})
        }


        // let blogId = req.params.blogId;
        let blog = await blogModel.findOne({ _id: blogId,isDeleted:false,deletedAt:null });

        if (!blog) {
            return res.status(404).send({ status: false, msg: "No such blog exists" });
        }

        if(blog.authorId.toString() !== authorIdFromToken){
            return res.status(401).send({status:false,message:"unauthorizsed access owner info does not match"})
        }

        if(!isValidrequestBody(requestBody)){
            return res.status(200).send({status:true,message:"no parameters pass blog unmodified",data:blog})
        }


        // let blogId = req.params.blogId;
        // let blog = await blogModel.findById(blogId);

        // if (!blog) {
        //     res.status(401).send("No such blog exists");
        // }
        let deletedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true,deletedAt:new Date() } });
        return res.status(201).send({ status: true, data: deletedBlog });
    }

    catch (err) { res.status(500).send({ msg: "Error", error: err.message }) }
};


const deleteSpecificItem = async function (req, res) {
    try {


        const filterQuery={isDeleted:false,deletedAt:null,isPublished:true}
        const queryParams=req.query;

        if(isValidrequestBody(queryParams)){

            if(isValid(authorId) && isValidObjectId(authorId) ){
                filterQuery['authorId']=authorId
            }

            if(isValid(category)){
                filterQuery['category']=category.trim()
            }

            if(isValid(tags)){
                const tagsArr=tags.trim().split(',').map(tag=>tag.trim());
                filterQuery['tags']={$all:tagsArr}
            }

            if(isValid(subcategory)){
                const subArr=subcategory.trim().split(',').map(sub=>sub.trim());
                filterQuery['subcategory']={$all:subArr}
            }
        
            let blogs = await blogModel.find(filterQuery)

            if (blogs.length == 0) {
                return res.status(404).send({ status: false, msg: "no blogs " });
            } 

            const idsoftobedeleted=blogs.map(blog=>{
                if(blog.authorId.toString()===authorIdFromToken) return blog._id
            })

            if(idsoftobedeleted.length===0){
                return res.status(404).send({status:false,message:"mo data fpund"})
            }

        // const data = req.query
        // console.log(data)
        // console.log(Object.keys(data))
        // if (Object.keys(data) == 0) return res.status(400).send({ status: false, msg: "No input provided" })
        const deleteBYquery = await blogModel.updateMany({_id:{$in:idsoftobedeleted}}, { isDeleted: true, deletedAt: new Date() }, { new: true })
        // if (!deleteBYquery) return res.status(404).send({ status: false, msg: "no such blog found" })
         res.status(200).send({ status: true, msg: deleteBYquery })
                
    }
}
    catch (err) {
        res.status(500).send({ status: false, message: "Something went wrong", Error: err });
    }
}



module.exports.updateBlog = updateBlog
module.exports.deleteUser = deleteUser
module.exports.createBlog = createBlog
module.exports.getblogs = getblogs
module.exports.deleteSpecificItem=deleteSpecificItem