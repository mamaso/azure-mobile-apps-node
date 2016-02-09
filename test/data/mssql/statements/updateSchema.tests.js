// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
// there should be more tests here, but SQL tests can be fragile
// full coverage should be provided by integration tests

var expect = require('chai').expect,
    mssql = require('mssql'),
    statements = require('../../../../src/data/mssql/statements');

describe('azure-mobile-apps.data.sql.statements', function () {
    describe('updateSchema', function () {
        var updateSchema = statements.updateSchema;

        it('generates simple statement', function () {
            var statement = updateSchema({ name: 'table' }, [{ name: 'text', type: 'NVARCHAR(MAX)' }]);
            expect(statement.sql).to.equal('ALTER TABLE [dbo].[table] ADD [text] NVARCHAR(MAX) NULL');
        });

        it('uses column sql property if exists', function () {
            var statement = updateSchema({ name: 'table' }, [{ name: 'text', type: 'NVARCHAR(MAX)', sql: '[text] NVARCHAR(15) NOT NULL' }]);
            expect(statement.sql).to.equal('ALTER TABLE [dbo].[table] ADD [text] NVARCHAR(15) NOT NULL');
        });
    });
});
