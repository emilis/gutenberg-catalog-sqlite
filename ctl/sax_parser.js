/*
    Copyright 2011 Emilis Dambauskas

    This file is part of Cheap Tricks Library for RingoJS.

    Cheap Tricks Library is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Cheap Tricks Library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Cheap Tricks Library.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
 * Simple SAX parser.
 *
 * Example:
 *
 *  var parser = require("ctl/sax_parser");
 *  parser.setFile("example.xml");
 *  parser.setContentHandler({ startElement: function(namespaceURI, localName, qName, atts) { print(qName); } });
 *  parser.parse();
 *
 */

// Requirements:
var fs = require("fs");

// Instance vars:
exports.file_name = false;
exports.contentHandler = false;


/**
 *
 */
exports.setFileName = function(file_name) {

    if (!fs.exists(file_name)) {
        throw Error("File " + file_name + " does not exist.");
    }

    this.file_name = file_name;
};


/**
 *
 */
exports.setContentHandler = function(contentHandler) {

    if (!contentHandler.startElement || !contentHandler.endElement || !contentHandler.characters) {
        throw Error("contentHandler needs at least startElement(), endElement() or characters() properties.");
    }

    this.contentHandler = contentHandler;
};




/**
 *
 */
exports.parse = function() {

    if (!this.file_name) {
        throw Error("Please supply a file name before parsing.");
    }
    if (!this.contentHandler) {
        throw Error("Please supply a contentHandler before parsing.");
    }

    var reader = new org.xml.sax.helpers.ParserAdapter(
        new org.xml.sax.helpers.XMLReaderAdapter());

    if (this.contentHandler) {
        reader.setContentHandler(
            new org.xml.sax.ContentHandler(this.contentHandler));
    }

    var input_source = false;
    if (this.file_name) {
        input_source = new org.xml.sax.InputSource(
            new java.io.FileInputStream(this.file_name));
    }

    return reader.parse(input_source);
};


