# Cloud Diary (Azure Static Web App)

This repo contains:

- React frontend (root)
- Node Azure Functions (in /api) for upload and list
- Uses an Azure Storage account (set DIARY_STORAGE_CONNECTION app setting to the storage connection string)

Deployment:
1. Push this repo to GitHub.
2. Create an Azure Static Web App, connect to this repo + branch.
3. Set the `DIARY_STORAGE_CONNECTION` configuration in your Static Web App to your storage account connection string.
4. Ensure the storage account has a container named `photos` (public blob access if you want direct image URLs).
