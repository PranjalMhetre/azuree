const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  try {
    const connectionString = process.env.DIARY_STORAGE_CONNECTION;
    if (!connectionString) {
      context.res = { status: 500, body: { message: "DIARY_STORAGE_CONNECTION not set" } };
      return;
    }

    const tableClient = new TableClient(connectionString, "DiaryEntries");
    const iter = tableClient.listEntities();
    const results = [];
    for await (const e of iter) {
      results.push({
        Description: e.Description || "",
        Latitude: e.Latitude || "",
        Longitude: e.Longitude || "",
        PhotoURL: e.PhotoURL || "",
        Timestamp: e.Timestamp || ""
      });
    }
    // latest first
    results.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

    context.res = { status: 200, body: results };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { message: err.message || String(err) } };
  }
};
