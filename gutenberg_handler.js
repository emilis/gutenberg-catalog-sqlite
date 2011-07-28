
var dbtables = require("dbtables");



exports.path = [];
exports.pathStr = ""


exports.startDocument = function() {

    dbtables.begin_trans();
};

exports.endDocument = function() {

    dbtables.end_trans();

};

exports.startElement = function (namespaceURI, localName, qName, atts) {

    this.path.push(qName);
    this.pathStr = this.path.join("/");

    switch (qName) {

    case "pgterms:etext":

        this.etext = {
            book_id: atts.getValue("rdf:ID").replace("etext", "")
        };
        dbtables.books.write(false, this.etext);
        break;

    case "pgterms:file":

        this.file = {
            url: atts.getValue("rdf:about").replace("http://www.gutenberg.org", "")
        };
       break;
    }
};


/**
 *
 */
exports.endElement = function (namespaceURI, localName, qName) {

    if (qName != this.path.pop()) {
        throw Error("Last closed element does not match last opened element.");
    }
    this.pathStr = this.path.join("/");

    switch (this.pathStr) {

    case "pgterms:etext":
    case "pgterms:file":

        this.etext = false;
        this.file = false;
        break;
    }
};

exports.characters = function(ch, start, length) {

    var str = "" + new java.lang.String(ch, start, length);

    switch (this.pathStr) {

    case "pgterms:etext/dc:created":
        this.etext.created = str;
        break;

    case "pgterms:file/dcterms:extent":
        this.file.size = parseInt(str, 10);
        break;

    case "pgterms:file/dcterms:modified":
        this.file.modified = str;
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

