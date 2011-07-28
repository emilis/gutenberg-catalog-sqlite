/*
    Copyright 2010 Emilis Dambauskas

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

/**
 * Initialization: registers sqlite driver with java.sql.DriverManager.
 */
if (!registered) {

    // Register Sqlite driver:
    var sqlite_driver = new org.sqlite.JDBC() 
    var driver_manager = java.sql.DriverManager
    driver_manager.registerDriver(sqlite_driver)

    // Get data types:
    var Types = java.sql.Types;

    // Save registered state:
    var registered = true;
}


var log = require("ringo/logging").getLogger(module.id);


exports.config = {};
exports.last_connection = false;

//----------------------------------------------------------------------------

/**
 * Constructor. Connects to a database specified by configuration.
 *
 * @param Object config DB configuration options (filename, [useUnicode, characterEncoding, start_query]).
 */
exports._constructor = function(config) {
    log.info("_constructor()", uneval(config));

    this.config = config;
    this.last_connection = false;

    this.connect();
}

/**
 * Connects to a Sqlite database.
 *
 * @return java.sql.Connection
 */
exports.connect = function($filename) {

    if (!$filename || $filename == undefined) {
        if (this.last_connection && this.last_connection.isValid(0)) {
            return this.last_connection;
        }
        $filename = this.config.filename;
    }

    // get connection:
    var url = "jdbc:sqlite:" + $filename;

    this.last_connection = driver_manager.getConnection(url);
    log.info("connect()", this.last_connection, url);

    if (this.config.start_query != undefined) {
        var stmt = this.last_connection.createStatement();
        stmt.execute(this.config.start_query);
        stmt.close();
    }

    return this.last_connection;
}


/**
 * Closes Sqlite connection.
 *
 * @param optional java.sql.Connection Connection to close. Uses last_connection if not specified.
 * @return void
 */
exports.close = function(conn) {
    conn = this.getConnection(conn);
    return conn.close();
}


/**
 * Returns either provided connection or this.last_connection. Reconnects this.last_connection if needed.
 *
 * @param optional java.sql.Connection Connection object.
 */
exports.getConnection = function(conn) {

    if (conn == undefined) {
        conn = this.last_connection;
        if (conn === false || conn.isClosed())
            conn = this.connect();
    }
    return conn;
}



/**
 * Queries Sqlite database and returns a resultset.
 *
 * @param string $query Sqlite query string.
 * @param optional java.sql.Connection
 * @return mixed java.sql.ResultSet or int updated row count or false.
 */
exports.query = function(sql, conn) {

    conn = this.getConnection(conn);
    log.debug(conn, "query()", sql);

    var stmt = conn.createStatement();

    if (stmt.execute(sql)) {
        var rs = stmt.getResultSet();
        return rs;
    } else {
        var result = stmt.getUpdateCount();
        if (result > -1) {
            var rowid = this.get_one("select last_insert_rowid()");
            if (rowid)
                result = rowid;
        } else {
            result = false;
        }

        stmt.close();
        return result;
    }
}


/**
 * Queries Sqlite database using a PreparedStatement interface.
 *
 * @param string sql SQL query string.
 * @param Array params Parameters for the SQL query.
 * @return mixed java.sql.ResultSet or int updated row count or false.
 */
exports.prepared_query = function(sql, params, conn) {

    conn = this.getConnection(conn);
    log.debug(conn, "prepared_query()", sql, params.length);

    var pStmt = conn.prepareStatement(sql) //, java.sql.Statement.RETURN_GENERATED_KEYS);

    for (var i=0; i<params.length; i++) {
        if (params[i] === null || params[i] === false) {
            pStmt.setNull(i+1, java.sql.Types.VARCHAR);
        } else {
            pStmt.setString(i+1, params[i]);
        }
    }

    if (pStmt.execute()) {
        return pStmt.getResultSet();
    } else {
        var result = pStmt.getUpdateCount();
        if (result > -1) {
            var rowid = this.get_one("select last_insert_rowid()");
            if (rowid)
                result = rowid;
        } else {
            result = false;
        }

        pStmt.close();
        return result;
    }
}


/**
 * Returns active row as an object from a resultset.
 *
 * @param java.sql.ResultSet
 * @return Object
 */
exports.get_row = function(rs) {

    if (typeof(rs) == "string")
        rs = this.query(rs);
    if (!rs)
        return false;
    if (rs.isClosed())
        return [];

    var row = {};
    var rs_meta = rs.getMetaData();
    var column_count = rs_meta.getColumnCount();

    for (var i=1;i<=column_count; i++) {
        row[rs_meta.getColumnLabel(i)] = this.get_column_value(rs, i, rs_meta); //new java.lang.String(rs.getBytes(i), "UTF-8");
    }

    return row;
}


/**
 * Returns an array of all rows in a resultset. Rows are represented as objects with field values.
 *
 * @param java.sql.ResultSet
 * @return Array
 */
exports.get_all = function(rs) {

    if (typeof(rs) == "string")
        rs = this.query(rs);
    if (!rs)
        return false;
    if (rs.isClosed() || !rs.isBeforeFirst())
        return [];

    var all = [];

    var rs_meta = rs.getMetaData();
    var column_count = rs_meta.getColumnCount();
    
    var column_names = [];
    for (var ci=1; ci<=column_count; ci++)
        column_names[ci] = rs_meta.getColumnLabel(ci);

    while (rs.next()) {
        var row = {};
        for (var ci=1; ci<=column_count; ci++) {
            row[column_names[ci]] = this.get_column_value(rs, ci, rs_meta);
        }
        all.push(row);
    }

    rs.getStatement().close();

    return all;
}


/**
 * Returns an iterator over all rows in a resultset.
 * @param {String|java.sql.ResultSet} rs Query or ResultSet.
 * @return Iterator.
 * @type Iterator
 */
exports.get_iterator = function(rs) {

    // Sqlite JDBC documentation suggests closing resultsets as fast as possible.
    // Therefore this is just a wrapper around get_all().
    for each (var row in this.get_all(rs)) {
        yield row;
    }
}


/**
 * Returns an array of all values in one resultset column.
 * 
 * @param java.sql.ResultSet
 * @param int
 * @return Array
 */
exports.get_col = function(rs, ci) {

    if (typeof(rs) == "string")
        rs = this.query(rs);
    if (!rs)
        return false;
    if (rs.isClosed() || !rs.isBeforeFirst())
        return [];

    if (ci === undefined)
        ci = 1;

    var all = [];
    var rs_meta = rs.getMetaData();

    if (ci > rs_meta.getColumnCount())
        return [];
    
    while (rs.next()) {
        all.push( this.get_column_value(rs, ci) );
    }

    rs.getStatement().close();

    return all;
}


/**
 * Returns the value of the first column in the first row of the given ResultSet.
 *
 * @param java.sql.ResultSet
 * @return String
 */
exports.get_one = function(rs) {

    if (typeof(rs) == "string")
        rs = this.query(rs);
    if (!rs)
        return false;

    if (rs.isClosed())
        var result = false;
    
    if (!rs.isFirst() && !(rs.isBeforeFirst() && rs.next()))
        var result = false;
    else
        var result = this.get_column_value(rs, 1);

    rs.getStatement().close();
    return result;
}


/**
 * Returns the value of the given column in the given ResultSet rs.
 *
 * @param java.sql.ResultSet
 * @param int/string column name or number
 * @param optional java.sql.ResultSetMetaData
 * @return mixed
 */
exports.get_column_value = function(rs, column, meta) {
    
    meta = meta || rs.getMetaData();

    var type = meta.getColumnType(column);
    var result = null;
    
    // Note: Types variable declared at the beginning of this module.
    switch (type) {
        case Types.NULL:
            return null;
            break;

        case Types.BIGINT:
        case Types.INTEGER:
        case Types.SMALLINT:
        case Types.TINYINT:
            result = rs.getLong(column);
            return rs.wasNull() ? null : result;
            break;
        
        case Types.BLOB:
        case Types.CHAR:
        case Types.CLOB:
        case Types.DATE:
        case Types.LONGVARCHAR:
        case Types.VARCHAR:
        case Types.BINARY:
        case Types.VARBINARY:
        case Types.LONGVARBINARY:
            result = rs.getBytes(column);
            if (rs.wasNull()) {
                return "";
            } else {
                return "" + new String(new java.lang.String(result, "UTF-8"));
            }
            break;

        case Types.BOOLEAN:
            result = rs.getBoolean(column);
            return rs.wasNull() ? null : result;
            break;

        case Types.DECIMAL:
        case Types.DOUBLE:
        case Types.FLOAT:
        case Types.NUMERIC:
        case Types.REAL:
            result = rs.getDouble(column);
            return rs.wasNull() ? null : result;
            break;

        case Types.ARRAY:
            result = rs.getArray(column);
            return rs.wasNull() ? null : result;
            break;

        case Types.JAVA_OBJECT:
        case Types.OTHER:
            result = rs.getObject(column);
            return rs.wasNull() ? null : result;
            break;

        case Types.TIME:
        case Types.TIMESTAMP:
            result = rs.getString(column);
            return rs.wasNull() ? null : result;
            break;

        default:
            log.debug("get_column_value()", "Unknown type", type);
            result = rs.getBinaryStream(column);
            return rs.wasNull() ? null : result;
    }
}
