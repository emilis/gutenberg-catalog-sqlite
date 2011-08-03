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


var dbtables = require("./sqlite-tables");

var cache = {
    multimedia_types: {},
    file_types: {},
    lcc_subjects: {},
    lcsh_subjects: {},
    creators: {},
    contributors: {}
};


var sha1 = java.security.MessageDigest.getInstance("SHA1");
function str_digest(str) {
    return sha1.digest(str.toByteString()).reduce(
            function(s, c) { return s + String.fromCharCode(c); }
        );
}

function loadIdByName(table, name) {

    var digest = str_digest(name);
    if (cache[table][digest]) {
        return cache[table][digest];
    } else {
        return cache[table][digest] = dbtables[table].write(false, { name: name });
    }
}


function getFileTypeAndCharset(type, url) {

    var result = {
        type: "unknown",
        charset: false
    };

    // get charset:
    if (type.indexOf(";") !== -1) {
        type = type.split(";");
        result.type = type[0].trim();
        for each (var t in type) {
            if (t.indexOf('charset="') !== -1) {
                t = t.split('"');
                result.charset = t[1].trim();
            }
        }
    } else {
        result.type = type;
        if (url.indexOf("utf8") !== -1) {
            result.charset = "utf-8";
        }
    }

    return result;
}


function getContributorAndRole(str) {

    if (str.indexOf("[") !== -1) {
        str = str.split("[");
        return {
            name: str[0].trim(),
            role: str[1].split("]")[0].trim()
        };
    } else {
        return {
            name: str,
            role: "unknown"
        };
    }
}

exports.path = [];
exports.pathStr = "";

exports.book = false;
exports.file = false;
exports.str = false;

/**
 *
 */
exports.startDocument = function() {

    dbtables.begin_trans();
};

/**
 *
 */
exports.endDocument = function() {

    dbtables.end_trans();

};


/**
 *
 */
exports.startElement = function(namespaceURI, localName, qName, atts) {

    this.path.push(qName);
    this.pathStr = "/" + this.path.join("/");

    //print("startElement", this.pathStr, atts.getLength());

    switch (this.pathStr) {

    case "/rdf:RDF/pgterms:etext":

        this.book = {
            etext_id: atts.getValue("rdf:ID").replace("etext", ""),
            data: {}
        };
        this.book.id = dbtables.books.write(false, this.book);
        break;

    case "/rdf:RDF/pgterms:etext/dc:rights":

        if (atts.getLength() > 0 && atts.getIndex("rdf:resource") != -1) {
            this.book.rights = "G";
        }
        break;

    case "/rdf:RDF/pgterms:file":

        //print("FILE", atts.getValue("rdf:about"));
        this.file = {
            url: atts.getValue("rdf:about").replace("http://www.gutenberg.org", ""),
            types: []
        };
        break;

    case "/rdf:RDF/pgterms:file/dcterms:isFormatOf":

        this.file.etext_id = atts.getValue("rdf:resource").replace("#etext", "");
        break;
    }
};


/**
 *
 */
exports.endElement = function(namespaceURI, localName, qName) {

    if (qName != this.path.pop()) {
        throw Error("Last closed element does not match last opened element.");
    }

    //print("endElement", this.pathStr);
    
    switch (this.pathStr) {

    case "/rdf:RDF/pgterms:etext":

        dbtables.books.write(this.book.id, this.book);
        this.book = false;
        break;

    case "/rdf:RDF/pgterms:file":

        var types = this.file.types;
        delete this.file.types;

        var file_id = dbtables.files.write(false, this.file);
        
        types.map(function(ftype_id) {
                dbtables.ftypes2files.write(false, {
                        file_id: file_id,
                        ftype_id: ftype_id
                });
        });

        this.file = false;
        break;
    }

    this.str = this.str.trim();
    if (this.str) {
        this.endString(this.str);
    }
    // Clear character data:
    this.str = "";

    // Important: update pathStr
    this.pathStr = "/" + this.path.join("/");


};


/**
 *
 */
exports.characters = function(ch, start, length) {

    //print("characters", this.pathStr, start, length);

    this.str += new java.lang.String(ch, start, length);
    //var str = "" + new java.lang.String(ch, start, length);
}


/**
 *
 */
exports.endString = function(str) {

    switch (this.pathStr) {

    // --- Books: ---
    case "/rdf:RDF/pgterms:etext/dc:alternative":
    case "/rdf:RDF/pgterms:etext/dc:alternative/rdf:Bag/rdf:li":

        this.book.data.alternative = this.book.data.alternative || [];
        this.book.data.alternative.push(str);
        break;

    case "/rdf:RDF/pgterms:etext/dc:created/dcterms:W3CDTF/rdf:value":

        this.book.created = str;
        break;

    case "/rdf:RDF/pgterms:etext/dc:description":
    case "/rdf:RDF/pgterms:etext/dc:description/rdf:Bag/rdf:li":

        this.book.data.description = this.book.data.description || [];
        this.book.data.description.push(str);
        break;

    case "/rdf:RDF/pgterms:etext/dc:rights":

        this.book.rights = "C";
        break;

    case "/rdf:RDF/pgterms:etext/dc:tableOfContents":

        this.book.data.tableOfContents = str;
        break;

    case "/rdf:RDF/pgterms:etext/dc:title":

        //print(uneval(this.book));
        this.book.data.title = this.book.data.title || [];
        this.book.data.title.push(str);
        break;

    case "/rdf:RDF/pgterms:etext/pgterms:friendlytitle":

        this.book.title = str;
        break;

    // --- Related to books: ---

    case "/rdf:RDF/pgterms:etext/dc:language/dcterms:ISO639-2/rdf:value":
    case "/rdf:RDF/pgterms:etext/dc:language/rdf:Bag/rdf:li/dcterms:ISO639-2/rdf:value":

        dbtables.language2book.write(false, {
                book_id: this.book.id,
                language: str
                });
        break;

    case "/rdf:RDF/pgterms:etext/dc:type/pgterms:category/rdf:value":

        this.book.mtype_id = loadIdByName("multimedia_types", str);
        break;

    case "/rdf:RDF/pgterms:etext/dc:subject/dcterms:LCC/rdf:value":
    case "/rdf:RDF/pgterms:etext/dc:subject/rdf:Bag/rdf:li/dcterms:LCC/rdf:value":

        dbtables.lcc2books.write(false, {
                book_id: this.book.id,
                lcc_id: loadIdByName("lcc_subjects", str)
        });
        break;

    case "/rdf:RDF/pgterms:etext/dc:subject/dcterms:LCSH/rdf:value":
    case "/rdf:RDF/pgterms:etext/dc:subject/rdf:Bag/rdf:li/dcterms:LCSH/rdf:value":

        //print("LCSH", this.book.id, loadIdByName("lcsh_subjects", str), str);
        dbtables.lcsh2books.write(false, {
                book_id: this.book.id,
                lcsh_id: loadIdByName("lcsh_subjects", str)
        });
        break;

    case "/rdf:RDF/pgterms:etext/dc:contributor":
    case "/rdf:RDF/pgterms:etext/dc:contributor/rdf:Bag/rdf:li":

        if (str) {
            var contributor = getContributorAndRole(str);
            dbtables.contributors2books.write(false, {
                    book_id: this.book.id,
                    contributor_id: loadIdByName("contributors", contributor.name),
                    role: contributor.role
            });
        }
        break;

    case "/rdf:RDF/pgterms:etext/dc:creator":
    case "/rdf:RDF/pgterms:etext/dc:creator/rdf:Bag/rdf:li":

        dbtables.creators2books.write(false, {
                book_id: this.book.id,
                creator_id: loadIdByName("creators", str)
        });
        break;


    // --- Files: ---

    case "/rdf:RDF/pgterms:file/dcterms:extent":

        this.file.size = parseInt(str, 10);
        break;

    case "/rdf:RDF/pgterms:file/dcterms:modified/dcterms:W3CDTF/rdf:value":

        this.file.modified = str;
        break;

    case "/rdf:RDF/pgterms:file/dc:format/dcterms:IMT/rdf:value":

        var tc = getFileTypeAndCharset(str, this.file.url);
        this.file.charset = this.file.charset || tc.charset;
        this.file.types.push(loadIdByName("file_types", tc.type));
        break;


    }

};


/*

    switch (qName) {

    case "pgterms:file":
        curFile = {
            url: atts.getValue("rdf:about").replace("http://www.gutenberg.org", "")
        };
        break;

    case "dcterms:isFormatOf":
        curFile && (curFile.etext = parseInt(
                atts.getValue("rdf:resource")
                    .replace("#etext", ""),
                10));
        break;

    case "dc:format":
        if (curFile) {
            charMode = "dc:format";
            curFile.type = "";
        }
        break;

    case "dcterms:extent":
        if (curFile) {
            charMode = "dcterms:extent";
            curFile.size = "";
        }
        break;

    case "dcterms:modified":
        if (curFile) {
            charMode = "dcterms:modified";
            curFile.modified = "";
        }
        break;
                
    }
};
*/

/*
exports.endElement = function (namespaceURI, localName, qName) {

    switch (qName) {

        case "pgterms:file":
            // get charset:
            if (curFile.type.indexOf(";") !== -1) {
                var type = curFile.type.split(";");
                curFile.type = type[0].trim();
                for each (var t in type) {
                    if (t.indexOf('charset="') !== -1) {
                        t = t.split('"');
                        curFile.charset = t[1].trim();
                    }
                }
            } else if (curFile.url.indexOf("utf8") !== -1) {
                curFile.charset = "utf-8";
            } else {
                curFile.charset = "";
            }
            files.push(curFile);
            curFile = false;
            break;

        case "dc:format":
            if (curFile) {
                charMode = false;
                curFile.type = curFile.type.trim();
            }
            break;

        case "dcterms:extent":
            if (curFile) {
                charMode = false;
                curFile.size = parseInt(curFile.size.trim(), 10);
            }
            break;

        case "dcterms:modified":
            if (curFile) {
                charMode = false;
                curFile.modified = curFile.modified.trim();
            }
            break;

    }
};


exports.characters = function(ch, start, length) {

    switch (charMode) {

        case "dc:format":
            curFile.type += new java.lang.String(ch, start, length);
            break;

        case "dcterms:extent":
            curFile.size += new java.lang.String(ch, start, length);
            break;

        case "dcterms:modified":
            curFile.modified += new java.lang.String(ch, start, length);
            break;
    }
};

exports.getFiles = function() {
    return files;
};
*/

