import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import "dotenv/config";
const __dirname = path.resolve();

const app = express();
const port = 3000;
app.use(express.json());
app.use(cookieParser());

import authRouter from "./routes/auth.mjs";
import postRouter from "./routes/post.mjs";

app.use("/api/v1", authRouter);
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  const token = req.cookies.token;

  try {
    let decoded = jwt.verify(token, process.env.SECRET);
    console.log(decoded);
    let issue = Math.floor(Date.now() / 1000);
    let expire = decoded.exp;
    console.log(expire, issue);
    req.body.decoded = {
      isAdmin: decoded.isAdmin,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
    };
    console.log(req.body);
    next();
  } catch (err) {
    res.status(401).send({ message: "invalid token" });
  }
});

app.use("/api/v1", postRouter);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});

// Environment variable "PORT" ka value "3000" set kiya gaya hai.
// const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
