const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// this is midlewiere
app.use(cors());
app.use(express.json());

// This is from database

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://mk-social-commerce:20Z62Rg1rRkkkecD@cluster0.6rdkwh0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    console.log("Database connected");

    const userCollection = client.db("mk-social-commerce").collection("user");

    //get all user
    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });
    // this is for user collection
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);

      res.send(result);
    });

    //get specific user
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    // this is make admin
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // limit dashboard access
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin });
    });
  } finally {
  }
}
run().catch(console.dir);

// basic setup code
app.get("/", (req, res) => {
  res.send("Hello from Kamao app!");
});

app.listen(port, () => {
  console.log(`kamao listening on port ${port}`);
});

// mk-social-commerce
// 20Z62Rg1rRkkkecD
