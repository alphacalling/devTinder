const { MongoClient, ObjectId } = require("mongodb");

// taX0mDSDZ4jmhYBQ

const url =
  "mongodb+srv://vikaspandey490:taX0mDSDZ4jmhYBQ@cluster0.edxnl.mongodb.net/";

// const uri = "mongodb://localhost:27017";
const client = new MongoClient(url);
const database = "myProject";

const data = {
  firstName: "Hulla",
  lastName: "Pandey",
  city: "Delhi",
};
const data1 = {
  firstName: "Tulla",
  lastName: "Pandey",
  city: "Noida",
};

const data2 = [
  {
    firstName: "Mulla",
    lastName: "Ahmad",
    city: "Lucknow",
  },
  {
    firstName: "Lulla",
    lastName: "Pandey",
    city: "Ayodhya",
  },
];

async function run() {
  await client.connect();
  console.log("database connected successfully");
  const myData = client.db(database);
  const myCollection = myData.collection("Students");
  const query1 = { lastName: "Pandey" };
  const updateDoc = {
    $set: {
      firstName: "Natasha",
      lastName: "Zoolie",
      city: "Canbara",
    },
  };
  const filter = {
    firstName: "Tulla",
  };

  const options = {
    upsert: true,
  };

  // const findResult = await myCollection.insertOne(data1);
  // const findResult = await myCollection.insertMany(data2);
  // const findResult = await myCollection.insertOne({firstName:"Zoya", lastName:"Khan", city:"Ottawa"})
  const findResult = await myCollection.find().toArray();
  // const findResult = await myCollection.findOne(query1);
  // const findResult = await myCollection.deleteOne({_id: new ObjectId("6799239499a0c02fd7e41fa4")})
  // const findResult = await myCollection.deleteOne({lastName:"Pandey"})
  // const findResult = await myCollection.updateOne(filter, updateDoc, options);
  // const findResult = await myCollection.countDocuments({lastName:"Pandey"})
  console.log("Result......", findResult);

  return "done";
}

run()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
console.log("Helloo");
