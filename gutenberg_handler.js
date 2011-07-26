

var texts = [];
var curText = false;

var files = [];
var curFile = false;

var charMode = "";


exports.startElement = function (namespaceURI, localName, qName, atts) {

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


