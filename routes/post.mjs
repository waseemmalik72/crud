import express from "express";
// import { nanoid } from "nanoid";
import { client } from "../mongodb.mjs";
import { ObjectId } from "mongodb";
const router = express.Router();

const db = client.db("Cruddb");
const col = db.collection("Manager");

router.post("/post", async (req, res, next) => {
  if (!req.body.title || !req.body.text) {
    res.status(403);
    res.send(`Sorry Required Parameter is Missing Type something like this {
            title: "type title",
            text: "type text",
        }`);
    return;
  }

  try {
    let posts = {
      email: req.body.decoded.email,
      title: req.body.title,
      text: req.body.text,
    };

    const p = await col.insertOne(posts);
    console.log(req.body);
    console.log(posts._id);
    res.send("Post Created");
  } catch (e) {
    console.log("error inserting mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

router.get("/post", async (req, res, next) => {
  console.log(req.cookies);
  let cursor = col.find({}).sort({ _id: -1 }).limit(100);

  try {
    let result = await cursor.toArray();
    res.send(result);
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

router.get(`/post/:postId`, async (req, res, next) => {
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  // let cursor = col.find({price: {$lte: 77}});
  // let cursor = col.find({
  //     $or: [
  //         { _id: req.params.postId },
  //         { title: "dfsdfsdfsdf" }
  //     ]
  // });

  try {
    let cursor = await col.findOne({ _id: new ObjectId(req.params.postId) });
    res.send(cursor);
  } catch (error) {
    res.status(500).send("server error, please try later");
  }
});

router.delete("/post/:postId", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`post id must be a valid id`);
    return;
  }

  // let myId = req.params.postId;
  // let objectId = new ObjectId(myId);

  try {
    let deletePost = await col.findOneAndDelete({
      _id: new ObjectId(req.params.postId),
    });
    if (deletePost.value) {
      console.log("deleteResponse: ", deletePost);
      res.send("your data has been successfully deleted");
    } else {
      res.send("post not found with id " + req.params.postId);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("an error occurred while deleting post");
  }
});

router.put("/post/:postId", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send("your id is not valid");
    return;
  }

  if (!req.body.text && !req.body.title) {
    res.status(403)
      .send(`required parameter missing, atleast one key is required.
        example put body: 
        PUT     /api/v1/post/:postId
        {
            title: "updated title",
            text: "updated text"
        }
        `);
    return;
  }

  try {
    let update = await col.updateOne(
      { _id: new ObjectId(req.params.postId) },
      {
        $set: {
          title: req.body.title,
          text: req.body.text,
        },
      }
    );
    if (update.upsertedId) {
      res.send("your Data has been successfully Update");
    } else {
      res.send("Your id is not correct");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("an error occurred while updating post");
  }
});

export default router;
