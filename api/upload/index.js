const { BlobServiceClient } = require("@azure/storage-blob");
const { TableServiceClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");

module.exports = async function (context, req) {
  try {
    const { description, lat, lon, filename, data } = req.body || {};
    if (!data) {
      context.res = { status: 400, body: { message: "Missing file data" } };
      return;
    }

    const connectionString = process.env.DIARY_STORAGE_CONNECTION;
    if (!connectionString) {
      context.res = { status: 500, body: { message: "DIARY_STORAGE_CONNECTION not set" } };
      return;
    }

    // Blob upload
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient("photos");
    // ensure container exists
    await containerClient.createIfNotExists({ access: "container" });
    const blobName = `${uuidv4()}-${filename || "upload.jpg"}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const buffer = Buffer.from(data, "base64");
    await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: "image/jpeg" } });
    const photoUrl = blockBlobClient.url;

    // Table metadata
    const tableService = TableServiceClient.fromConnectionString(connectionString);
    try { await tableService.createTable("DiaryEntries"); } catch (e) { /* ignore if exists */ }
    const tableClient = tableService.getTableClient("DiaryEntries");
    const entry = {
      partitionKey: "Diary",
      rowKey: uuidv4(),
      Description: description || "",
      Latitude: lat || "",
      Longitude: lon || "",
      PhotoURL: photoUrl,
      Timestamp: new Date().toISOString()
    };
    await tableClient.createEntity(entry);

    context.res = { status: 200, body: { status: "ok", photo_url: photoUrl } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { message: err.message || String(err) } };
  }
};
