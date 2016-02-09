// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var helpers = require('../helpers');

module.exports = function (tableConfig, databaseColumns, updatedColumns) {
    var tableName = helpers.formatTableName(tableConfig.schema || 'dbo', tableConfig.name),
        newColumns = newColumnSql();

    if(newColumns.length > 0)
        return {
            sql: "ALTER TABLE " + tableName + " ADD " + newColumns.join(',')
        };
    else
        return { noop: true };

    function newColumnSql() {
        return updatedColumns.reduce(function (sql, column) {
            if(!databaseColumns.some(function (existing) { return existing.name.toLowerCase() === column.name.toLowerCase() })) {
                databaseColumns.push(column);
                sql.push(column.sql || '[' + column.name + '] ' + column.type + ' NULL');
            }
            return sql;
        }, []);
    }
};
