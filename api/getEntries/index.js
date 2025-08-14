const { TableClient, AzureSASCredential } = require("@azure/data-tables");

module.exports = async function (context, req) {
  try {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
    const tableName = process.env.AZURE_TABLE_NAME;

    const client = new TableClient(
      `https://${accountName}.table.core.windows.net`,
      tableName,
      new AzureSASCredential(sasToken)
    );

    let entries = [];
    for await (const entity of client.listEntities()) {
      entries.push(entity);
    }

    context.res = {
      status: 200,
      body: entries
    };
  } catch (err) {
    context.log.error("Error fetching entries:", err);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch entries" }
    };
  }
};
