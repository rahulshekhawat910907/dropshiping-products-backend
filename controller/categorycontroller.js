const Category = require("../models/category")

const createCategory = async (req ,res)=>{
    try {
        const {name , slug , image , description} = req.body
        if(!name ||!slug ||!image ||!description){
            return res.json({
                success:false,
                message:"all fields are required"
            })
        }

        const exist = await Category.findOne({
            name,
            slug
        })
        if(exist){
            return res.json({
                success:false,
                message:"category already exist"
            })
        }
        const category = await Category.create({
            name,
            image,
            slug,
            description
        });

     return res.json({
    success:true,
    message:" Category create successFully",
    category 
})

    } catch (error) {
       return res.json({
        success:false,
        message:error.message
       }) 
    }
}


const getAllCategory = async (req , res) =>{
    try {
  const category = await Category.find().sort({ createdAt: -1 });
        res.json({
            success:true,
            count:category.length,
            category
        })
    
    } catch (error) {
         return res.json({
        success:false,
        message:error.message
       }) 
    }
}

const getSingleCategory = async (req , res)=>{
    try {
        const category = await  Category.findById(req.params.id)
        if(!category){
            return res.json({
                success:false,
                message:"category not found",
            })
        }
        res.json({
            success:true,
            category
        })
    } catch (error) {
         return res.json({
        success:false,
        message:error.message
       }) 
    }
}

const updateCategory = async (req , res)=>{
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true,
                runValidators: true,
            }
        )
        if(!category){
             return res.json({
        success:false,
        message:"category not found"
       }) 
        }

        res.json({
        success:true,
        category
       }) 
    } catch (error) {
         return res.json({
        success:false,
        message:error.message
       }) 
    }
}

const deleteCategory = async (req,res)=>{
    try {
        const category = await Category.findByIdAndDelete(req.params.id)
        if(!category){
             return res.json({
        success:false,
        message:"Category not found"
       }) 
        }
        res.json({
            success:true,
            message:"Category delete successFully"
        })
    } catch (error) {
         return res.json({
        success:false,
        message:error.message
       }) 
    }
}

module.exports = {
    createCategory,
    getAllCategory,
    getSingleCategory,
    updateCategory,
    deleteCategory
}