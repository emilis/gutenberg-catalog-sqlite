
// Set up require and JAR paths:
addToClasspath(module.directory + "/jars/");
require.paths.push(module.directory);



// --- Main: ---

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


