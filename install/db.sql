DROP TABLE IF EXISTS multimedia_types;
CREATE TABLE multimedia_types(
    id integer primary key autoincrement,
    name varchar(255) not null unique
);
;
DROP TABLE IF EXISTS books;
CREATE TABLE books(
    id integer primary key autoincrement,
    etext_id integer not null unique,
    created char(10) not null default '1970-01-01',
    rights char(1) not null default 'C',
    mtype_id int null references multimedia_types(id) on delete set null,
    title varchar(255) null,
    data text
);
;
DROP TABLE IF EXISTS language2book;
CREATE TABLE language2book(
    book_id int not null references books(id) on delete cascade,
    language varchar(3) not null,
    primary key(book_id, language)
);
;
DROP TABLE IF EXISTS files;
CREATE TABLE files(
    id integer primary key autoincrement,
    etext_id int not null references books(etext_id) on delete set null,
    size int not null,
    modified char(10) not null,
    charset varchar(16),
    url varchar(255) not null unique
);
;
DROP TABLE IF EXISTS file_types;
CREATE TABLE file_types(
    id integer primary key autoincrement,
    name varchar(64) not null unique
);
;
DROP TABLE IF EXISTS ftypes2files;
CREATE TABLE ftypes2files(
    id integer primary key autoincrement,
    file_id int not null references files(id) on delete cascade,
    ftype_id int not null references file_types(id) on delete cascade,
    unique(file_id, ftype_id)
);
;
DROP TABLE IF EXISTS creators;
CREATE TABLE creators(
    id integer primary key autoincrement,
    name varchar(255) not null unique
);
;
DROP TABLE IF EXISTS creators2books;
CREATE TABLE creators2books(
    id integer primary key autoincrement,
    book_id int not null references books(id) on delete cascade,
    creator_id int not null references creators(id) on delete cascade,
    unique(book_id, creator_id)
);
;
DROP TABLE IF EXISTS contributors;
CREATE TABLE contributors(
    id integer primary key autoincrement,
    name varchar(255) unique
);
;
DROP TABLE IF EXISTS contributors2books;
CREATE TABLE contributors2books(
    id integer primary key autoincrement,
    book_id int not null references books(id) on delete cascade,
    contributor_id int not null references contributors(id) on delete cascade,
    role varchar(16),
    unique(book_id, contributor_id, role)
);
;
DROP TABLE IF EXISTS lcc_subjects;
CREATE TABLE lcc_subjects(
    id integer primary key autoincrement,
    name varchar(16) unique
);
;
DROP TABLE IF EXISTS lcc2books;
CREATE TABLE lcc2books(
    id integer primary key autoincrement,
    book_id int not null references books(id) on delete cascade,
    lcc_id int not null references lcc_subjects(id) on delete cascade,
    unique(book_id, lcc_id)
);
;
DROP TABLE IF EXISTS lcsh_subjects;
CREATE TABLE lcsh_subjects(
    id integer primary key autoincrement,
    name text not null unique
);
;
DROP TABLE IF EXISTS lcsh2books;
CREATE TABLE lcsh2books(
    id integer primary key autoincrement,
    book_id int not null references books(id) on delete cascade,
    lcsh_id int not null references lcsh_subjects(id) on delete cascade,
    unique(book_id, lcsh_id)
);



DROP INDEX IF EXISTS books_created;
CREATE INDEX books_created on books(created);
DROP INDEX IF EXISTS books_rights;
CREATE INDEX books_rights on books(rights);
DROP INDEX IF EXISTS files_modified;
CREATE INDEX files_modified on files(modified);
DROP INDEX IF EXISTS files_charset;
CREATE INDEX files_charset on files(charset);
DROP INDEX IF EXISTS contributors_roles;
CREATE INDEX contributors_roles on contributors2books(role, contributor_id);
DROP INDEX IF EXISTS file_type;
CREATE UNIQUE INDEX file_type on ftypes2files (file_id ASC, ftype_id ASC);
DROP INDEX IF EXISTS file_etext_id;
CREATE INDEX file_etext_id on files (etext_id ASC);
DROP INDEX IF EXISTS book_etext_id;
CREATE UNIQUE INDEX book_etext_id on books (etext_id ASC);
DROP INDEX IF EXISTS creators2books_ids;
CREATE UNIQUE INDEX creators2books_ids on creators2books (book_id ASC, creator_id ASC);
DROP INDEX IF EXISTS creator_name;
CREATE INDEX creator_name on creators (name ASC);

DROP VIEW IF EXISTS quick_list;
CREATE VIEW quick_list AS select books.*, 
	language2book.language,
	creators.name as creator,
	file_types.name as file_type,
	files.charset as file_encoding,
	files.url as file_url,
    files.modified as file_modified
from 
	books, language2book,
	files, ftypes2files, file_types,
	creators, creators2books
where
	books.id=language2book.book_id
	and files.etext_id=books.etext_id
	and files.id=ftypes2files.file_id
	and ftypes2files.ftype_id=file_types.id
	and creators2books.book_id=books.id
	and creators.id=creators2books.creator_id;
