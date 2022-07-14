const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// this is uploading sheet file
const render = require("xlsx");
const file = render.readFile("./task.xlsx");
const profitFile = render.readFile("./profitlink.xlsx");

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
    const profitLinkCollection = client
      .db("mk-social-commerce")
      .collection("profit-link");
    const queryLinkCollection = client
      .db("mk-social-commerce")
      .collection("query-link");

    const fullLinkCollection = client
      .db("mk-social-commerce")
      .collection("full-link");

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

    //sheet data upload for all brands
    app.get("/upload", async (req, res) => {
      const sheets = file.SheetNames;
      const data = [];
      for (let i = 0; i < sheets.length; i++) {
        const sheetName = sheets[i];
        const sheetData = render.utils.sheet_to_json(file.Sheets[sheetName]);
        sheetData.forEach((a) => {
          data.push(a);
        });
      }
      res.send(data);
    });

    //Sheet data upload in backend and also save in mongodb database
    app.put("/profitlink", async (req, res) => {
      const sheets = profitFile.SheetNames;
      const data = [];
      for (let i = 0; i < sheets.length; i++) {
        const sheetName = sheets[i];
        const sheetData = render.utils.sheet_to_json(
          profitFile.Sheets[sheetName]
        );
        sheetData.forEach((a) => {
          data.push(a);
        });
      }
      const options = { ordered: true };
      const result = await profitLinkCollection.insertMany(data, options);

      res.send(result);
    });

    //get all data from database for profit link
    app.get("/profitlink", async (req, res) => {
      const result = await profitLinkCollection.find().toArray();
      res.send(result);
    });

    // add query link
    app.post("/querylink", async (req, res) => {
      const link = req.body;
      const result = await queryLinkCollection.insertOne(link);
      res.send(result);
    });
    //updating quary link with user id from firebase
    // app.put("/querylink", async (req, res) => {
    //   const userId = req.body;
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: userId,
    //   };
    //   const result = await userCollection.updateOne(filter, updateDoc, options);

    //   res.send(result);
    // });
    // add query link
    app.get("/querylink/:userid", async (req, res) => {
      const userid = req.params.userid;
      console.log(userid);
      const result = await queryLinkCollection.find().toArray();
      const data = result.pop();

      // const user = await userCollection.find().toArray();
      // const userID = user[0]._id;
      // console.log(userID);
      // const ID = userID.split(" ")[1];

      const mainLink = data.mainLink;
      const token = data.token;
      const fullLink = mainLink + `&aff_trace_key=${token}` + `&u_id=${userid}`;
      console.log(fullLink);
      res.send(fullLink);
      // const full = fullLinkCollection.insertOne(fullLink);
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
