/*
    Copyright 2011 Emilis Dambauskas

    This file is part of Gutenberg Catalog Converter to Sqlite.

    Gutenberg Catalog Converter is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Gutenberg Catalog Converter is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Gutenberg Catalog Converter.  If not, see <http://www.gnu.org/licenses/>.
*/

// Requirements:
var config = require("config");
var db = require("ctl/DB/Sqlite");
var dbtable = require("ctl/objectfs/dbtable");
var objects = require("ringo/utils/objects");
var serializable = require("ctl/objectfs/serializable");


// Connect to DB:
db.connect(config.DB.GutenbergCatalog);


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
    "lcsh2books",
    "quick_list"];

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
    },

    readFull: function(id) {

        var book = this.read(id);

        if (!book) {
            return false;
        }

        if (book.mtype_id) {
            book.mtype = exports.multimedia_types.read(book.mtype_id);
        } else {
            book.mtype = null;
        }

        book.languages = exports.language2book
            .list({book_id:id})
            .map(function(row) { return row.language; });


        book.files = exports.files
            .list({ etext_id: book.etext_id })
            .map(function(file) {
                    file.types = exports.file_types.list({
                        id: exports.ftypes2files
                            .list({ file_id: file.id })
                            .map(function (row) { return row.ftype_id; })
                    });
                    return file;
                }
            );


        book.creators = exports.creators.list({
            id: exports.creators2books
                    .list({book_id:id})
                    .map(function (row) { return row.creator_id ;})
            }
        );

        book.contributors = exports.contributors.list({
            id: exports.contributors2books
                    .list({book_id:id})
                    .map(function(row) { return row.contributor_id; })
            }
        );

        book.subjects = {
            lcc: [],
            lcsh: []
        };

        book.subjects.lcc = exports.lcc_subjects.list({
            id: exports.lcc2books
                    .list({book_id:id})
                    .map(function(row) { return row.lcc_id; })
            }
        );

        book.subjects.lcsh = exports.lcsh_subjects.list({
            id: exports.lcsh2books
                    .list({book_id:id})
                    .map(function(row) { return row.lcsh_id; })
            }
        );

        return book;

    }

});


serializable.upgradeExports(exports.books);
