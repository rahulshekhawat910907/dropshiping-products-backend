const User = require("../models/user")
const jwt = require("jsonwebtoken")

const protect = async(req,res , next)=>{
try {
    let token;
    if(
        req.headers.authorization && req.headers.authorization.startsWith("Bearer")
    ){
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token){
        return res.json({
            success:false,
            message: "Access denied. No token provided."
        })
    }
 const decoded = jwt.verify(token , process.env.JWT_SECRET)

 const user = await User.findById(decoded.id)
 if(!user){
       return res.json({
            success:false,
            message: "user not found."
        })
 }
 req.user = user

 next()
} catch (error) {
      return res.json({
      success: false,
      message: "Invalid or expired token.",
    });
}
}


//admin

const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

module.exports = {
    admin,
    protect
}