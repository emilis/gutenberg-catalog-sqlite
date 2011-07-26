-- Books --

drop table if exists multimedia_types;
create table multimedia_types(
    mtype_id integer primary key autoincrement,
    name varchar(255) not null unique
);

drop table if exists books;
create table books(
    book_id integer primary key autoincrement,
    created char(10) not null,
    rights char(1) not null default 'C',
    mtype_id int null references multimedia_types(mtype_id) on delete set null,
    title varchar(255) null,
    data text
);

drop index if exists books_created;
create index if not exists books_created on books(created);

drop index if exists books_rights;
create index if not exists books_rights on books(rights);


drop table if exists language2book;
create table language2book(
    book_id int not null references books(book_id) on delete cascade,
    language varchar(3) not null,
    primary key(book_id, language)
);


-- Files --

drop table if exists files;
create table files(
    file_id integer primary key autoincrement,
    book_id int not null references books(book_id) on delete set null,
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
    ftype_id integer primary key autoincrement,
    name varchar(64) not null unique
);

drop table if exists ftypes2files;
create table ftypes2files(
    ftype2file_id integer primary key autoincrement,
    file_id int not null references files(file_id) on delete cascade,
    ftype_id int not null references file_types(ftype_id) on delete cascade,
    unique(file_id, ftype_id)
);


-- Creators, Contributors --

drop table if exists creators;
create table creators(
    creator_id integer primary key autoincrement,
    name varchar(255) not null unique
);

drop table if exists creators2books;
create table creators2books(
    creator2book_id integer primary key autoincrement,
    book_id int not null references books(book_id) on delete cascade,
    creator_id int not null references creators(creator_id) on delete cascade,
    unique(book_id, creator_id)
);

drop table if exists contributors;
create table contributors(
    contributor_id integer primary key autoincrement,
    name varchar(255) unique
);

drop table if exists contributors2books;
create table contributors2books(
    contributor2book_id integer primary key autoincrement,
    book_id int not null references books(book_id) on delete cascade,
    contributor_id int not null references contributors(contributor_id) on delete cascade,
    role varchar(16),
    unique(book_id, contributor_id, role)
);

drop index if exists contributors_roles;
create index if not exists contributors_roles on contributors2books(role, contributor_id);

-- Subjects (categories) --

drop table if exists lcc_subjects;
create table lcc_subjects(
    lcc_id integer primary key autoincrement,
    name varchar(16) unique
);

drop table if exists lcc2books;
create table lcc2books(
    lcc2book_id integer primary key autoincrement,
    book_id int not null references books(book_id) on delete cascade,
    lcc_id int not null references lcc_subjects(lcc_id) on delete cascade,
    unique(book_id, lcc_id)
);

drop table if exists lcsh_subjects;
create table lcsh_subjects(
    lcsh_id integer primary key autoincrement,
    name text not null unique
);

drop table if exists lcsh2books;
create table lcsh2books(
    lcsh2book_id integer primary key autoincrement,
    book_id int not null references books(book_id) on delete cascade,
    lcsh_id int not null references lcsh_subjects(lcsh_id) on delete cascade,
    unique(book_id, lcsh_id)
);
