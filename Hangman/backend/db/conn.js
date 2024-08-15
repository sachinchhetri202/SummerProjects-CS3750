const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.ATLAS_URI;

let _db;
module.exports = {
    connectToServer: function(callback) {
        // Create a MongoClient with a MongoClientOptions object to set the Stable API version
        const client = new MongoClient(uri, {
            serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
            }
        });

        async function run() {
            try {
            // Connect the client to the server (optional starting in v4.7)
            await client.connect();
            // Send a ping to confirm a successful connection
            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
            //mongo creates table if doesnt exist
            _db = client.db("HangmanWords");
            console.log("connected to HangmanWords");
        } finally {
            // Ensures that the client will close when you finish/error
            //await client.close();
            }
        }
        run().catch(console.dir);
    },
    getDb: function() {
        return _db;
    }
};