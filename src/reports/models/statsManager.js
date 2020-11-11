const uuid = require('uuid');
const _ = require('lodash');
const databaseConnector = require('./databaseConnector'),
    notifier = require('./notifier'),
    reportsManager = require('./reportsManager'),
    constants = require('../utils/constants'),
    testManager = require('../../tests/models/manager'),
    aggregateReportManager = require('./aggregateReportManager'),
    benchmarkCalculator = require('./benchmarkCalculator'),
    configHandler = require('../../configManager/models/configHandler'),
    configConsts = require('../../common/consts').CONFIG,
    reportUtil = require('../utils/reportUtil');

module.exports.postStats = async (report, stats) => {
    const statsParsed = JSON.parse(stats.data);
    const statsTime = statsParsed.timestamp;

    if (stats.phase_status === constants.SUBSCRIBER_DONE_STAGE || stats.phase_status === constants.SUBSCRIBER_ABORTED_STAGE) {
        await databaseConnector.updateSubscriber(report.test_id, report.report_id, stats.runner_id, stats.phase_status);
    } else {
        await updateSubscriberWithStatsInternal(report, stats);
    }

    if (stats.phase_status === constants.SUBSCRIBER_INTERMEDIATE_STAGE || stats.phase_status === constants.SUBSCRIBER_FIRST_INTERMEDIATE_STAGE) {
        await databaseConnector.insertStats(stats.runner_id, report.test_id, report.report_id, uuid(), statsTime, report.phase, stats.phase_status, stats.data);
    }
    await databaseConnector.updateReport(report.test_id, report.report_id, {
        phase: report.phase,
        last_updated_at: statsTime
    });
    report = await reportsManager.getReport(report.test_id, report.report_id);

    let reportBenchmark;
    if (reportUtil.isAllRunnersInExpectedPhase(report, constants.SUBSCRIBER_DONE_STAGE)) {
        reportBenchmark = await updateReportBenchmarkIfNeeded(report);
        const trends = await calculateTrends(report);
        await databaseConnector.insertTrends(trends);
    }

    notifier.notifyIfNeeded(report, stats, reportBenchmark);

    return stats;
};

async function calculateTrends(report) {
    // Todo get reports only in the last X days
    // duration/ arrival_rate
    const reports = await reportsManager.getReports(report.test_id);
    const relevantReports = filterRelevantReports(reports, report.arrival_rate, report.duration);

    const allAggregatedReport = [];

    const promises = relevantReports.map(async report => {
        const aggregatedReport = await aggregateReportManager.aggregateReport((report));
        allAggregatedReport.push(aggregatedReport);
    });

    await Promise.all(promises);

    const trends = [];
    allAggregatedReport.forEach(aggregatedReport => {
        trends.push({
            start_time: aggregatedReport.start_time,
            latency: aggregatedReport.aggregate.latency,
            rps: aggregatedReport.aggregate.rps;
        })
    })

    return trends;
}

function filterRelevantReports(reports, arrivalRate, duration) {

    const minimumDate = new Date();
    minimumDate.setDate(minimumDate.getDate() - configConsts.TREND_BACK_IN_DAYS);

    const relevantReports = reports.filter((report) => {
        const arrivalRateChange = Math.min(report.arrival_rate, arrivalRate) / Math.max(report.arrival_rate, arrivalRate);
        const durationRateChange = Math.min(report.duration, duration) / Math.max(report.duration, duration);
        return durationRateChange >= 0.9 && arrivalRateChange >= configConsts.TREND_TRESHOLD && report.start_time >= minimumDate;
    });
    return relevantReports;
}

async function updateSubscriberWithStatsInternal(report, stats) {
    const parseData = JSON.parse(stats.data);
    const subscriber = report.subscribers.find(subscriber => subscriber.runner_id === stats.runner_id);
    const {last_stats} = subscriber;
    if (last_stats && parseData.rps) {
        const lastTotalCount = _.get(last_stats, 'rps.total_count', 0);
        parseData.rps.total_count = lastTotalCount + parseData.rps.count;
    }
    await databaseConnector.updateSubscriberWithStats(report.test_id, report.report_id, stats.runner_id, stats.phase_status, JSON.stringify(parseData));
}

async function updateReportBenchmarkIfNeeded(report) {

    const config = await configHandler.getConfig();
    const configBenchmark = {
        weights: config[configConsts.BENCHMARK_WEIGHTS],
        threshold: config[configConsts.BENCHMARK_THRESHOLD]
    };
    const testBenchmarkData = await extractBenchmark(report.test_id);
    if (testBenchmarkData) {
        const reportAggregate = await aggregateReportManager.aggregateReport(report);
        const reportBenchmark = benchmarkCalculator.calculate(testBenchmarkData, reportAggregate.aggregate, configBenchmark.weights);
        const {data, score} = reportBenchmark;
        data[configConsts.BENCHMARK_THRESHOLD] = configBenchmark.threshold;
        await databaseConnector.updateReportBenchmark(report.test_id, report.report_id, score, JSON.stringify(data));
        return reportBenchmark;
    }
}

async function extractBenchmark(testId) {
    try {
        const testBenchmarkData = await testManager.getBenchmark(testId);
        return testBenchmarkData;
    } catch (e) {
        return undefined;
    }
}
