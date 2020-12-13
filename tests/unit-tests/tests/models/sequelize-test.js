'use strict';
const should = require('should'),
    fakeSequelize = require('../../../../tests/unit-tests/tests/models/fakeSequelize');

describe('Testing sequelize database table creation ', function () {
    let getWebHooksTables;
    before(() => {
        getWebHooksTables = fakeSequelize.init("sqlite");
    });

    it('Create client SQLITE ', function () {
        const db = "sqlite";
        const client = fakeSequelize.createClient(db);
        should(client.dialect).eql(db.toUpperCase());
        should(client.host).eql("129.5.5.5");
        should(client.storage).eql(db.toUpperCase());
    });
    it('Create client MySQL ', function () {
        const db = "mysql";
        const client = fakeSequelize.createClient(db);
        should(client.dialect).eql(db.toUpperCase());
        should(client.host).eql("129.5.5.5");
        should(client.storage).eql(undefined);
    });
    it('WebHook Tables ', function () {
        should(getWebHooksTables.tables_webhooks.WEBHOOKS_TABLE_NAME).eql('webhooks');
        should(getWebHooksTables.tables_webhooks.WEBHOOKS_EVENTS_TABLE_NAME).eql('webhook_events');
        should(getWebHooksTables.tables_webhooks.WEBHOOKS_EVENTS_MAPPING_TABLE_NAME).eql('webhook_events_mapping');
        should(getWebHooksTables.tables_webhooks.WEBHOOKS_JOBS_MAPPING_TABLE_NAME).eql('webhook_job_mapping');
    });
    it('Scheduler Tables ', function () {
        should(getWebHooksTables.tables_scheduler.EMAIL_TABLE_NAME).eql('email');
        should(getWebHooksTables.tables_scheduler.JOB_TABLE_NAME).eql('job');
    });
    it('Reports Tables ', function () {
        should(getWebHooksTables.tables_reports.STATS_TABLE_NAME).eql('stats');
        should(getWebHooksTables.tables_reports.SUBSCRIBER_TABLE_NAME).eql('subscriber');
        should(getWebHooksTables.tables_reports.REPORT_TABLE_NAME).eql('report');
    });
    it('Tests Tables ', function () {
        should(getWebHooksTables.tables_tests.TESTS_TABLE_NAME).eql('tests');
        should(getWebHooksTables.tables_tests.DSL_DEFINITION_TABLE_NAME).eql('dsl_definition');
        should(getWebHooksTables.tables_tests.BENCHMARK_TABLE_NAME).eql('benchmark');
    });
    it('Config Tables ', function () {
        should(getWebHooksTables.tables_config.CONFIG_TABLE_NAME).eql('config');
    });
    it('Processor Tables ', function () {
        should(getWebHooksTables.tables_processor.PROCESSOR_TABLE_NAME).eql('processor');
    });
    it('File Tables ', function () {
        should(getWebHooksTables.tables_file.FILE_TABLE_NAME).eql('file');
    });
    it('Other DB creation ', function () {
        const otherDb = fakeSequelize.init("mysql");
        should(otherDb.tables_file.FILE_TABLE_NAME).eql('file');
    });

});
