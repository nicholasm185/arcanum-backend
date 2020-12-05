var mongoose = require('mongoose');

var URL = "mongodb+srv://root:DeeZnkKwn03Z3qhb@cluster0.rbt3t.mongodb.net/arcanum?retryWrites=true&w=majority";

// mongoose.set('useCreateIndex', true);
// mongoose.set('useFindAndModify', false);

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