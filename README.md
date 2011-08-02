# Gutenberg Catalog Converter to Sqlite

This program transforms data from [Project Gutenberg](http://gutenberg.org/) [catalog.rdf](http://www.gutenberg.org/wiki/Gutenberg:Feeds) file into a Sqlite database.

## Usage:

    $ ./install.sh
    $ ./update.sh
    $ ./run.sh

*Note:* this program will take _minutes_ to complete the conversion (5-15 min. on my machines).

The resulting database will be in <code>data/catalog.sqlite</code>.

### Example output:

<http://emilis.info/other/gutenberg-catalog.sqlite.bz2> (22 MB)

## Requirements:

- Linux or other *nix (sh,tar,wget,bunzip2)
- Java

## License

This is free software, and you are welcome to redistribute it under certain conditions; see LICENSE.txt for details.

## Credits

... go to [RingoJS](http://ringojs.org/) team for the platform I find more and more useful.

## Contact

Emilis Dambauskas <emilis.d@gmail.com>

