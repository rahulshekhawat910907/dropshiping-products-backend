require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error.message));


  //router

  //userRouter
  const userRoute = require("./router/userRoute")
  app.use("/api/user" , userRoute)

  //category
  const CategoryRouter = require("./router/categoryRoute")
  app.use("/api/category" , CategoryRouter)

  //product
    const productRouter = require("./router/productRoute")
  app.use("/api/product" , productRouter)

//wishlist
const wishlistRoute = require("./router/wishlistRouter")
app.use("/api/wishlist" , wishlistRoute)

//cart
const cartRoute = require("./router/cartRoute")
app.use("/api/cart" , cartRoute)


//admin deshboard
const adminRouter = require("./router/adminRouter");
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


