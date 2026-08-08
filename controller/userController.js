const User  = require("../models/user")
const jwt = require("jsonwebtoken");

// Send OTP
const sendOtp = async (req, res) => {
  try {
    const {name, phone } = req.body;

    if ( !name ||!phone) {
      return res.json({
        success: false,
        message: "Phone number is required",
      });
    }

    const exist = await User.findOne({phone})
    if(exist){
        return res.json({
            sucess:false,
            message:"your number already exist"
        })
    }

    const user = await User.create({
        phone,
        name
    })
    // Static OTP
    const otp = "123456";

    return res.json({
      success: true,
      message: "OTP sent successfully",
      otp,
      user
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Verify OTP & Login
const verifyOtp = async (req, res) => {
  try {
    const {id} =req.body
    const { otp } = req.body 

    if ( !otp) {
      return res.json({
        success: false,
        message: " OTP are required",
      });
    }

    const user = await User.findOne({id})
    if(!user){
      return res.json({
        success:false,
        message:"user not found"
      })
    }

    if (otp !== "123456") {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const token = jwt.sign(
  {
    id: user._id.toString(),
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);
    return res.json({
      success: true,
      message: "Login Successful",
token , 
user
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const totalUser = async(req,res)=>{
  try {
    const user = await User.find().sort({createAt: -1})

    res.json({
      success:true,
      user
    })
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

// const admin = async (req, res) => {
//   try {
//     const { role } = req.body ||{}

//     if (!role) {
//       return res.json({
//         success: false,
//         message: "Role is required",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Role received successfully",
//       role,
//     });

//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const profile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const updateprofile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name , phone } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const { id } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
    sendOtp,
    verifyOtp,
    // admin,
    profile,
    updateprofile,
    deleteProfile , 
totalUser
}