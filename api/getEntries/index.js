const { TableClient, AzureSASCredential } = require("@azure/data-tables");

module.exports = async function (context, req) {
    try {
        const accountName = process.env.STORAGE_ACCOUNT_NAME;
        const sasToken = process.env.STORAGE_SAS_TOKEN;
        const tableName = "DiaryEntries";

        const tableClient = new TableClient(
            `https://${accountName}.table.core.windows.net`,
            tableName,
            new AzureSASCredential(sasToken)
        );

        let entries = [];
        for await (const entity of tableClient.listEntities()) {
            entries.push(entity);
        }

        context.res = {
            status: 200,
            body: entries
        };
    } catch (err) {
        context.log.error(err);
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};
