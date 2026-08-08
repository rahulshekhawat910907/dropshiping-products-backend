const router = require("express").Router()

const {admin , protect} = require("../middleware/auth")

const {sendOtp, verifyOtp ,totalUser  , profile , updateprofile , deleteProfile} =  require("../controller/userController")

router.post("/send" , sendOtp)
router.post("/verify" , verifyOtp)

//admin
router.get("/all",protect,admin , totalUser)

//profile
router.get("/profile/:id" , protect , profile)
router.put("/update/:id" , protect , updateprofile)
router.delete("/delete/:id" , protect ,admin , deleteProfile)


//admin role
// router.post("/role" , admin)

module.exports = router