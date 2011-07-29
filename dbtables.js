
// Requirements:
var config = require("config");
var db = require("ctl/DB/Sqlite");
var dbtable = require("ctl/objectfs/dbtable");
var objects = require("ringo/utils/objects");
var serializable = require("ctl/objectfs/serializable");


// Connect to DB:
db.connect(config.DATA_DIR + "/catalog.sqlite");


exports.begin_trans = function() {

    db.query("BEGIN TRANSACTION");
};

exports.end_trans = function() {

    db.query("COMMIT");

};


/**
 *
 */
function connect_table(name, methods) {

    methods = methods || {};

    var table = objects.clone(
        methods,
        objects.clone(dbtable, {})
    );
    table.connect(db, name);

    return table;
}


// --- Tables: ---

// simple:
var tables = [
    "files",
    "file_types",
    "ftypes2files",
    "multimedia_types",
    "language2book",
    "creators",
    "creators2books",
    "contributors",
    "contributors2books",
    "lcc_subjects",
    "lcc2books",
    "lcsh_subjects",
    "lcsh2books"];

for each (var t in tables) {
    exports[t] = connect_table(t);
}


// Books:

exports.books = connect_table("books", {

    fields: {
        id: true,
        etext_id: true,
        created: true,
        rights: true,
        title: true,
        mtype_id: true,
        data: true
    },

    serialize: function(data) {

        var ndata = {};
        ndata.data = data.data || {};
        for (var k in data) {
            if (this.fields[k]) {
                ndata[k] = data[k];
            } else {
                ndata.data[k] = data[k];
            }
        }
        ndata.data = JSON.stringify(ndata.data);

        return ndata;
    },

    unserialize: function(data) {

        if (data.data) {
            data.data = JSON.parse(data.data);
        }

        return data;
    }

});


serializable.upgradeExports(exports.books);
