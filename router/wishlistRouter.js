const router = require("express").Router()

const {AddToWishlist , getWishlist , removeFromWishlist} = require("../controller/wishlistController")
const { protect} = require("../middleware/auth")


router.post("/create" ,protect , AddToWishlist)
router.get("/all" ,protect  , getWishlist)
router.delete("/delete/:productId" ,protect , removeFromWishlist)


module.exports = router;
