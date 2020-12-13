
module.exports = {
    init,
    createClient
};

function init(db) {
    const client = createClient(db);
    webHooks(client);
    scheduler(client);
    reports(client);
    tests(client);
    config(client);
    processor(client);
    file(client);

    return client;
}


function createClient(dialect) {
    const options = {
        dialect: dialect.toUpperCase(),
        logging: false,
        host: "129.5.5.5",
        define: {
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    };

    if (options.dialect === 'SQLITE') {
        options.storage = options.dialect;
    }

    return options;
}


function webHooks(client) {
    const tables = {
        WEBHOOKS_TABLE_NAME: 'webhooks',
        WEBHOOKS_EVENTS_TABLE_NAME: 'webhook_events',
        WEBHOOKS_EVENTS_MAPPING_TABLE_NAME: 'webhook_events_mapping',
        WEBHOOKS_JOBS_MAPPING_TABLE_NAME: 'webhook_job_mapping',
    };
    client.tables_webhooks = tables;
}

function scheduler(client) {
    const tables = {
        EMAIL_TABLE_NAME: "email",
        JOB_TABLE_NAME: "job"
    };
    client.tables_scheduler = tables;
}

function reports(client) {
    const tables = {
        STATS_TABLE_NAME: 'stats',
        SUBSCRIBER_TABLE_NAME: 'subscriber',
        REPORT_TABLE_NAME: 'report',
    };
    client.tables_reports = tables;
}

function tests(client) {
    const tables = {
        TESTS_TABLE_NAME: 'tests',
        DSL_DEFINITION_TABLE_NAME: 'dsl_definition',
        BENCHMARK_TABLE_NAME: 'benchmark',
    };
    client.tables_tests = tables;
}

function config(client) {
    const tables = {
        CONFIG_TABLE_NAME: 'config',
    };
    client.tables_config = tables;
}

function processor(client) {
    const tables = {
        PROCESSOR_TABLE_NAME: 'processor',
    };
    client.tables_processor = tables;
}

function file(client) {
    const tables = {
        FILE_TABLE_NAME: 'file',
    };
    client.tables_file = tables;
}
