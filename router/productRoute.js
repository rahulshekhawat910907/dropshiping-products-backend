const router = require("express").Router()
const {  productCreate, getAllProducts, getSingleProduct, updateProduct,  deleteProduct,} = require("../controller/productcontroller")


const {admin , protect} = require("../middleware/auth")



router.post("/create", protect,admin , productCreate)
router.get("/all" , getAllProducts)
router.get("/single/:id" , getSingleProduct)
router.put("/update/:id",protect ,admin , updateProduct)
router.delete("/delete/:id",protect ,admin , deleteProduct)

module.exports = router