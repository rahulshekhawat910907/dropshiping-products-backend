
const router = require("express").Router();

const {adminDashboard} = require("../controller/adminDeshboard");
const {admin , protect} = require("../middleware/auth")


router.get("/dashboard",protect ,admin , adminDashboard);

module.exports = router;
