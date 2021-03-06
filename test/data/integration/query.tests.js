// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var queries = require('../../../src/query'),
    config = require('../../appFactory').configuration().data,
    expect = require('chai').use(require('chai-subset')).expect;

describe('azure-mobile-apps.data.integration.query', function () {
    var index = require('../../../src/data/' + config.provider),
        data = index(config),
        cleanUp = require('../' + config.provider + '/integration.cleanUp'),
        table = {
            name: 'query',
            columns: { string: 'string', number: 'number', bool: 'boolean', date: 'date' },
            seed: [
                { id: 1, string: 'one', number: 1, bool: 1, date: new Date(2016, 0, 1) },
                { id: 2, string: 'two', number: 2, bool: 0, date: new Date(2016, 0, 2) },
                { id: 3, string: 'three', number: 3, bool: 1, date: new Date(2016, 0, 3) },
                { id: 4, string: 'four', number: 4, bool: 0, date: new Date(2016, 0, 4) },
                { id: 5, string: 'five', number: 5, bool: 1, date: new Date(2016, 0, 5) },
                { id: 6, string: 'six', number: 6, bool: 0, date: new Date(2016, 0, 6) },
            ]
        },
        operations;

    before(function (done) {
        operations = data(table);
        operations.initialize().then(function (inserted) { }).then(done, done);
    });

    after(function (done) {
        cleanUp(config, table).then(done, done);
    });

    it("supports equality hashes", function () {
        return operations.read(queries.create('query').where({ number: 1 }))
            .then(function (results) {
                expect(results).to.containSubset([{ bool: true, id: '1', number: 1, string: 'one', date: new Date(2016, 0, 1) }]);
            });
    });

    it("supports filter functions", function () {
        return operations.read(queries.create('query').where(function () { return this.number == 2 }))
            .then(function (results) {
                expect(results).to.containSubset([{ bool: false, id: '2', number: 2, string: 'two', date: new Date(2016, 0, 2) }]);
            });
    });

    it("supports OData expressions", function () {
        return operations.read(queries.create('query').where('number eq 3'))
            .then(function (results) {
                expect(results).to.containSubset([{ bool: true, id: '3', number: 3, string: 'three', date: new Date(2016, 0, 3) }]);
            });
    });

    it("selects columns", function () {
        return operations.read(queries.create('query').where({ number: 1 }).select('id, string'))
            .then(function (results) {
                expect(results).to.containSubset([{ id: '1', string: 'one' }]);
            });
    });

    it("returns total count if requested", function () {
        return operations.read(queries.create('query').where('number eq 3').includeTotalCount())
            .then(function (results) {
                expect(results).to.containSubset([{ bool: true, id: '3', number: 3, string: 'three', date: new Date(2016, 0, 3) }]);
                expect(results.totalCount).to.equal(1);
            });
    });

    it("returns total count for filter", function () {
        return operations.read(queries.create('query').take(1).includeTotalCount())
            .then(function (results) {
                expect(results).to.containSubset([{ bool: true, id: '1', number: 1, string: 'one', date: new Date(2016, 0, 1) }]);
                expect(results.totalCount).to.equal(6);
            });
    });

    it("supports dates in equality hashes", function () {
        return operations.read(queries.create('query').where({ date: new Date(2016, 0, 2) }))
            .then(function (results) {
                expect(results).to.containSubset([{ bool: false, id: '2', number: 2, string: 'two', date: new Date(2016, 0, 2) }]);
            });
    });

    it("supports dates in filter functions", function () {
        return operations.read(queries.create('query').where(function () { return this.date >= new Date(2016, 0, 5) }))
            .then(function (results) {
                expect(results).to.containSubset([
                    { bool: true, id: '5', number: 5, string: 'five', date: new Date(2016, 0, 5) },
                    { bool: false, id: '6', number: 6, string: 'six', date: new Date(2016, 0, 6) }
                ]);
            });
    });
});
