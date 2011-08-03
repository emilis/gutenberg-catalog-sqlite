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


// Set up require paths:
require.paths.push(module.directory);

// requirements:
var fs = require("fs");

// add all jars:
var jar_dir = module.directory + "/jars/";
for each (var fname in fs.list(jar_dir)) {
    addToClasspath(jar_dir + fname);
}


// --- Main: ---

exports.run = function() {
    
    // paths:
    var data_dir = module.directory + "/data";
    var catalog_file = data_dir + "/catalog.rdf";
    var db = data_dir + "/catalog.sqlite";

    // vars:
    var parser = require("ctl/sax_parser");
    var gutenberg_handler = require("gutenberg_handler");

    // parse:
    parser.setContentHandler(gutenberg_handler);
    parser.setFileName(catalog_file);
    parser.parse();

    print("Parsing finished.");
}

exports.header = function() {

    print("Gutenberg Catalog Converter to Sqlite  Copyright (C) 2011 Emilis Dambauskas");
    print("This program comes with ABSOLUTELY NO WARRANTY; for details see LICENSE.txt.");
    print("This is free software, and you are welcome to redistribute it under certain conditions; see LICENSE.txt for details.");
}


if (require.main == module) {
    exports.header();
    print(new Date());
    exports.run();
    print(new Date());
}
