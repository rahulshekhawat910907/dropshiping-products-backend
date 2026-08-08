const router = require("express").Router()

const {createCategory,getAllCategory , getSingleCategory , updateCategory , deleteCategory} = require("../controller/categorycontroller")

const {admin , protect} = require("../middleware/auth")


router.post("/create", admin , protect, createCategory)
router.get("/all" , getAllCategory)
router.get("/single/:id" , getSingleCategory)
router.put("/update/:id" ,protect,admin , updateCategory)
router.delete("/delete/:id" ,protect,admin, deleteCategory)

module.exports = router