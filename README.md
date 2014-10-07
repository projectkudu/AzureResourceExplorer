ARMOAuth
========
This demonstrates OAuth workflow where users grant access to their ARM (Azure Resource Management) to third party site.

Instructions
============
1. Clone this repository to your local drive.
2. Open `ARMOAuth.sln` with VS 2012+ and compile.

Create AAD application
======================
1. Goto [Azure Portal](https://manage.windowsazure.com/) and create AAD Application.  You may create an application on existing AAD directory or a new directory altogether.
2. Select `Add an application my organization is developing`
3. Enter any name for application name.
4. Select `WEB APPLICATION AND/OR WEB API`
5. Enter `https://localhost:44300/` as `SIGN ON URL` 
6. Enter `https://<tenant-name>/` as `APP ID URL`.  For instance, `https://mytenant.onmicrosoft.com/`.
7. Once created, click `CONFIGURE` tab
8. Select YES for `APPLICATION IS MULTI-TENANT` and save.
10. On `Permission to other applications`, add `Windows Azure Management API` and check `Access Azure Service Management` for `Delegated Permissions` and save.

Fix AADClientId and AADClientSecret in codes
============================================
1. Copy `CLIENT ID` and paste it in [this line](https://github.com/suwatch/ARMOAuth/blob/master/Modules/ARMOAuthModule.cs#L26).
2. On `Keys` section, create a client secret. Copy the key and paste it in [this line](https://github.com/suwatch/ARMOAuth/blob/master/Modules/ARMOAuthModule.cs#L31).


Test with localhost
===================
1. On VS, start the `ARMOAuth.sln` in debugger (F5).
2. On browser, it should redirect to login page.
3. Enter AAD account and password.  
  Note: try account that is not in the same directly as the application.  
  Note: currently this does not work with MSA account.
4. You should be prompt with OAuth allow/deny page, do accept it.

Test ARM apis
=============
1. `https://localhost:44300/token` - show current token details.
2. `https://localhost:44300/tenants` - show all tenants (AAD directory) user belongs to.
3. `https://localhost:44300/tenants/<tenant-id>` - to switch tenant.
4. `https://localhost:44300/subscriptions` - list subscriptions.
5. `https://localhost:44300/subscriptions/<sub-id>/resourceGroups` - list resourceGroups for a subscription.
6. `https://localhost:44300/subscriptions/<sub-id>/resourceGroups/<resource>/providers/Microsoft.Web/sites` - list sites.
7. and so on.. 

Test with Azure Websites
========================
1. Create Azure Websites with local git publishing enabled
2. Add the site https url as the reply URL for AAD application
3. Deploy the website by pushing the repository
4. Set AADClientID and AADClientSecret appSettings
5. To test, simply browse to the website

Any issue, do let me know.
