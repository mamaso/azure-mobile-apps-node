// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var helpers = require('../helpers');

module.exports = function (tableConfig, columns) {
    var tableName = helpers.formatTableName(tableConfig.schema || 'dbo', tableConfig.name),
        newColumns = columns.map(function (column) {
            return column.sql || '[' + column.name + '] ' + column.type + ' NULL';
        });

    if(newColumns.length > 0)
        return {
            sql: "ALTER TABLE " + tableName + " ADD " + newColumns.join(',')
        };
    else
        return { noop: true };
};
