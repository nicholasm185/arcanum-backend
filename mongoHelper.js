const { MongoClient } = require('mongodb');
/**
 * Print the names of all available databases
 * @param {MongoClient} client A MongoClient that is connected to a cluster
 */
async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function find(client){
    const cursor = client.collection('records').find()
    console.log(cursor);
}

module.exports = { listDatabases };