const Sequelize = require('sequelize');

module.exports.up = async (query, DataTypes) => {
    const jobsTable = await query.describeTable('reports');

    if (!jobsTable.tag) {
        await query.addColumn(
            'reports', 'trends',
            Sequelize.DataTypes.TEXT('long'));
    }
};

module.exports.down = async (query, DataTypes) => {
    await query.removeColumn('reports', 'trends');
};
