var statements = require('./statements'),
    execute = require('./execute'),
    helpers = require('./helpers'),
    promises = require('../../utilities/promises');

module.exports = function (configuration) {
    var columnCache = {};

    var api = {
         getMissingColumns: function (table, item) {
            return execute(configuration, statements.getColumns(table))
                .then(function (databaseColumns) {
                    columnCache[table.name] = columnDefinitions(table, databaseColumns, item);
                    return diffColumns(columnCache[table.name], databaseColumns);
                });
        },
        
        get: function (table) {
            if (columnCache[table.name]) {
                return promises.resolved(columnCache[table.name]);
            } else {
                return api.getMissingColumns(table)
                    .then(function () {
                        return columnCache[table.name];
                    });
            }
        }
    };

    return api;
}

function diffColumns(all, database) {
    return all.reduce(function (diff, column) {
        if(!database.some(function (dbColumn) { return column.name.toLowerCase() === dbColumn.name.toLowerCase() })) {
            database.push(column);
            diff.push(column);
        }
        return diff;
    }, []);
}

function columnDefinitions(tableConfig, existingColumns, item) {
    var definitions = [];

    if (item) {
        Object.keys(item).forEach(function (property) {
            definitions.push({ name: property, type: helpers.getSqlType(item[property], false) });
        });
    }

    var mergeColumns = function (column) {
        definitions = definitions.filter(function (columnDefinition) {
            return columnDefinition.name != column.name;
        });
        definitions.push(column);
    };

    helpers.getSystemPropertyColumns().forEach(mergeColumns);

    if (tableConfig.columns) {
        Object.keys(tableConfig.columns).map(function (name) {
            return {
                name: name,
                type: helpers.getPredefinedColumnType(tableConfig.columns[name])
            };
        }).forEach(mergeColumns);
    }

    existingColumns.forEach(mergeColumns);

    return definitions;
}