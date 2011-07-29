-- Books --

drop table if exists multimedia_types;
create table multimedia_types(
    id integer primary key autoincrement,
    name varchar(255) not null unique
);

drop table if exists books;
create table books(
    id integer primary key autoincrement,
    etext_id integer not null unique,
    created char(10) not null default '1970-01-01',
    rights char(1) not null default 'C',
    mtype_id int null references multimedia_types(id) on delete set null,
    title varchar(255) null,
    data text
);

drop index if exists books_created;
create index if not exists books_created on books(created);

drop index if exists books_rights;
create index if not exists books_rights on books(rights);


drop table if exists language2book;
create table language2book(
    book_id int not null references books(id) on delete cascade,
    language varchar(3) not null,
    primary key(book_id, language)
);


-- Files --

drop table if exists files;
create table files(
    id integer primary key autoincrement,
    etext_id int not null references books(etext_id) on delete set null,
    size int not null,
    modified char(10) not null,
    charset varchar(16),
    url varchar(255) not null unique
);

drop index if exists files_modified;
create index if not exists files_modified on files(modified);

drop index if exists files_charset;
create index if not exists files_charset on files(charset);



drop table if exists file_types;
create table file_types(
    id integer primary key autoincrement,
    name varchar(64) not null unique
);

drop table if exists ftypes2files;
create table ftypes2files(
    id integer primary key autoincrement,
    file_id int not null references files(id) on delete cascade,
    ftype_id int not null references file_types(id) on delete cascade,
    unique(file_id, ftype_id)
);


-- Creators, Contributors --

drop table if exists creators;
create table creators(
    id integer primary key autoincrement,
    name varchar(255) not null unique
);

drop table if exists creators2books;
create table creators2books(
    id integer primary key autoincrement,
    book_id int not null references books(id) on delete cascade,
    creator_id int not null references creators(id) on delete cascade,
    unique(book_id, creator_id)
);

drop table if exists contributors;
create table contributors(
    id integer primary key autoincrement,
    name varchar(255) unique
);

drop table if exists contributors2books;
create table contributors2books(
    id integer primary key autoincrement,
    book_id int not null references books(id) on delete cascade,
    contributor_id int not null references contributors(id) on delete cascade,
    role varchar(16),
    unique(book_id, contributor_id, role)
);

drop index if exists contributors_roles;
create index if not exists contributors_roles on contributors2books(role, contributor_id);

-- Subjects (categories) --

drop table if exists lcc_subjects;
create table lcc_subjects(
    id integer primary key autoincrement,
    name varchar(16) unique
);

drop table if exists lcc2books;
create table lcc2books(
    id integer primary key autoincrement,
    book_id int not null references books(id) on delete cascade,
    lcc_id int not null references lcc_subjects(id) on delete cascade,
    unique(book_id, lcc_id)
);

drop table if exists lcsh_subjects;
create table lcsh_subjects(
    id integer primary key autoincrement,
    name text not null unique
);

drop table if exists lcsh2books;
create table lcsh2books(
    id integer primary key autoincrement,
    book_id int not null references books(id) on delete cascade,
    lcsh_id int not null references lcsh_subjects(id) on delete cascade,
    unique(book_id, lcsh_id)
);
