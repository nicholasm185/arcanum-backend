var mongoose = require('mongoose');

var URL = "mongodb+srv://root:DeeZnkKwn03Z3qhb@cluster0.rbt3t.mongodb.net/arcanum?retryWrites=true&w=majority";

// var URL = process.env.MONGO_URL
// var username = process.env.MONGO_USERNAME
// var pass = process.env.MONGO_PASS
// var db = process.env.MONGO_DB_NAME

// console.log("mongodb://"+URL+":27017/"+db);

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

// mongoose.connect("mongodb://"+URL+":27017/"+db, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     "auth": {
//         "authSource": "admin"
//     },
//     "user": username,
//     "pass": pass
// });

mongoose.connect(URL, {
    useNewUrlParser: true,
    useCreateIndex: true
});

var db = mongoose.connection;

db.on('error', () => {
    console.log("error occured in db");
});

db.on('open', () => {
    console.log("db connection made successfully");
});