import express from "express";
import { client } from "../mongodb.mjs";
import jwt from "jsonwebtoken";
import { stringToHash, verifyHash, validateHash } from "bcrypt-inzi";
import { ObjectId } from "mongodb";

const col = client.db("Cruddb").collection("user");

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  if (
    !req.body?.firstName ||
    !req.body?.lastName ||
    !req.body?.email ||
    !req.body?.password
  ) {
    res.status(403)
      .send(`Sorry Required Parameter is Missing Type something like this {
            firstName: "Waseem",
            lastName: "Malik",
            email: "someone@email.com",
            password: "********"
        }`);
    return;
  }

  // TODO validate email

  req.body.email = req.body.email.toLowerCase();

  try {
    let result = await col.findOne({ email: req.body.email });
    if (!result) {
      const passwordHash = await stringToHash(req.body.password);
      console.log(passwordHash);

      let inputUserData = await col.insertOne({
        //mongodb added ObjectId
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: passwordHash,
        createdDateAt: new Date(),
      });

      console.log("inputUserData ", inputUserData);
      res.send({ message: "your successfully Signup" });
      return;
    } else {
      res.status(403).send({
        message: "user already exist with this email",
      });
    }
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

router.post("/login", async (req, res, next) => {
  // res.status(200).send("You'r Successfully Login", new Date());

  if (!req.body.email || !req.body.password) {
    res.status(403)
      .send(`Sorry Required Parameter is Missing Type something like this {
                email: "someone@email.com",
                password: "********"
            }`);
    return;
  }

  req.body.email = req.body.email.toLowerCase();

  try {
    let result = await col.findOne({ email: req.body.email });
    if (!result) {
      res.status(403).send({
        message: "email and password incorrect",
      });
      return;
    } else {
      let matchPassword = await verifyHash(req.body.password, result.password);

      if (matchPassword) {
        const token = jwt.sign(
          {
            isAdmin: false,
            email: req.body.email,
            firstName: result.firstName,
            lastName: result.lastName,
          },
          process.env.SECRET,
          {
            expiresIn: 300,
          }
        );
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          // expires: new Date(Date.now() + 15000)
        });

        res.send({ message: "login successfully" });
      } else {
        res.status(401).send({
          message: "email and password incorrect",
        });
      }
      return;
    }
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

export default router;
