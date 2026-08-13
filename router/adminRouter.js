
const router = require("express").Router();

const {adminDashboard} = require("../controller/adminDeshboard");
const {admin , protect} = require("../middleware/auth")
const { createAdmin }
= require("../controller/adminController");


router.get("/dashboard",protect ,admin , adminDashboard);

router.post("/create-admin", createAdmin);

module.exports = router;


