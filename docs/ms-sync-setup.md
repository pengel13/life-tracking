# Microsoft Sync Setup Guide

This guide walks you through creating an Azure AD app registration so Life OS can access your Outlook email and Teams messages.

---

## 1. Create the Azure AD app registration

1. Go to [portal.azure.com](https://portal.azure.com) and sign in.
2. Search for **Azure Active Directory** and open it.
3. In the left menu click **App registrations** → **New registration**.
4. Fill in:
   - **Name:** `Life OS Sync`
   - **Supported account types:** select **Accounts in any organizational directory (Any Azure AD directory - Multitenant)**
   - **Redirect URI:** choose **Web** and enter `http://localhost:3001/api/sync/accounts/callback`
5. Click **Register**.

After registration, note down the **Application (client) ID** — you'll need it shortly.

---

## 2. Create a client secret

1. In your new app, go to **Certificates & secrets** → **Client secrets** → **New client secret**.
2. Give it a description (e.g. `life-os-local`) and choose an expiry.
3. Click **Add**.
4. **Copy the Value immediately** — it is only shown once.

---

## 3. Add API permissions

1. Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated permissions**.
2. Add the following permissions:
   - `Mail.Read` — read Outlook inbox messages
   - `Chat.Read` — read Teams personal chats
   - `ChannelMessage.Read.All` — read Teams channel messages *(requires admin consent per tenant — see below)*
   - `User.Read` — read the signed-in user's profile
   - `offline_access` — get refresh tokens for background sync

---

## 4. Configure your local environment

Add these to `server/.env`:

```env
AZURE_CLIENT_ID=<Application (client) ID from Step 1>
AZURE_CLIENT_SECRET=<Secret value from Step 2>
AZURE_REDIRECT_URI=http://localhost:3001/api/sync/accounts/callback
```

---

## 5. For Railway deployment

After deploying, add the production URL as a second redirect URI:

1. Go to **Authentication** in your app registration.
2. Under **Web** → **Redirect URIs**, add `https://<your-railway-app>.railway.app/api/sync/accounts/callback`.

Update the env var on Railway:
```
AZURE_REDIRECT_URI=https://<your-railway-app>.railway.app/api/sync/accounts/callback
```

---

## 6. Admin consent for Teams channel messages (per tenant)

`ChannelMessage.Read.All` requires an IT administrator at each organization to grant consent.

For each work tenant that you want to sync channel messages from, the tenant's admin needs to visit:

```
https://login.microsoftonline.com/<tenant-id>/adminconsent?client_id=<your-client-id>
```

Replace `<tenant-id>` with the organization's tenant ID (visible in Azure AD → Overview as the "Tenant ID").

**If admin consent is not granted:** Life OS will still sync your personal Teams chats (`Chat.Read` does not require admin consent). Channel messages are simply skipped for that tenant, with a log message:
```
warn: channel sync skipped for tenant <id> — admin consent missing
```

---

## 7. Connect your accounts in Life OS

Once the app registration is configured:

1. Open Life OS and navigate to **⚙ Sync** in the sidebar.
2. Click **Connect account** for each Microsoft account you want to sync.
3. Follow the OAuth login flow in the browser popup.
4. After connecting, set up **Routing rules** to decide which area and column incoming messages land in.

Life OS syncs automatically every 5 minutes.
