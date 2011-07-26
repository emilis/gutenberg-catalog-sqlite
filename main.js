
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

function main() {
    return;
    // paths:
    var data_dir = module.directory + "/data";
    var catalog_file = data_dir + "/catalog.rdf";
    var db = data_dir + "/catalog.sqlite";

    // vars:
    var parser = require("ctl/sax_parser");
    var gutenberg_handler = require("gutenberg_handler")

    // parse:
    parser.setContentHandler(gutenberg_handler);
    parser.setFileName(catalog_dile);
    parser.parse();

    print("Parsing finished.");
}


