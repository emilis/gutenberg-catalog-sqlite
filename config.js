
exports.DATA_DIR = module.directory + "/data";

exports.DB = {
    GutenbergCatalog: exports.DATA_DIR + "/catalog.sqlite"
};


exports.gutenberg = {
    catalog_rdf: exports.DATA_DIR + "/catalog.rdf",
    DB: exports.DB.GutenbergCatalog
};
