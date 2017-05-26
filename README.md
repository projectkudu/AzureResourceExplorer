# ARMExplorer
This project has dependencies on OAuth authentication.

## Instructions
1. Clone this repository to your local drive.
2. Open `ARMExplorer.sln` with VS 2012+ and compile.

### Create AAD application
1. Go to [Azure Portal](https://manage.windowsazure.com/) while logged in as an Org ID (i.e. not MSA) and create AAD Application. You may create an application on existing AAD directory or a new directory altogether.
1. Select `Add an application my organization is developing`
1. Enter any name for application name.
1. Select `WEB APPLICATION AND/OR WEB API`
1. Enter `https://localhost:44306/` as `SIGN ON URL`
1. For `APP ID URL`, enter something like `https://davidebboslingshot.onmicrosoft.com/`.
1. Once created, click `CONFIGURE` tab
1. On `Permission to other applications`, add `Windows Azure Service Management API` and check `Access Azure Service Management` for `Delegated Permissions` and save.

### Fix AADClientId and AADClientSecret in codes
1. Copy `CLIENT ID` and paste it in [this line](https://github.com/projectkudu/ARMExplorer/blob/master/Modules/ARMOAuthModule.cs#L38), replacing `Environment.GetEnvironmentVariable("AADClientId")`.
2. On `Keys` section, create a client secret. Copy the key and paste it in the same file, replacing `Environment.GetEnvironmentVariable("AADClientSecret")`.


Test with localhost
1. Build the solution using VS.
1. Starting running it in the debugger (F5).
1. In browser, it should redirect to login page.
1. Enter AAD account and password.
  Note: try account that is not in the same directly as the application.
  Note: currently this does not work with MSA account.
1. You should be prompt with OAuth allow/deny page, do accept it.

### Test ARM apis
1. `https://localhost:44306/api/token` - show current token details.
2. `https://localhost:44306/api/tenants` - show all tenants (AAD directory) user belongs to.
3. and so on..

### Test with Azure Websites
1. Create Azure Websites with local git publishing enabled
2. Add the site https url as the reply URL for AAD application
3. Deploy the website by pushing the repository
4. Set AADClientID and AADClientSecret appSettings
5. To test, simply browse to the website and append the query string "?repository=<url of your Git repository>"

### Running unit tests
1. Unit test support is still evolving and the tests are located under ng\test directory.
2. Tests are built using tsconfig.json file under ng folder.
3. You will need to have tsc and node installed before you can run the tests. You can use npm for this.
4. Navigate to ng directory and compile the files using 'tsc' and run the tests using 'node manageWithTests.js'
5. Remember to update the tsconfig.json file when adding new test files.

## Adding Swagger based specs

Swagger files can be found on https://github.com/Azure/azure-rest-api-specs. The raw file for Web Apps is [here](https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/arm-web/2015-08-01/swagger/service.json), and internally under `bin\Hosting\Azure\GeoMaster\Swagger\Service.json`. Also, [compute](https://github.com/Azure/azure-rest-api-specs/tree/master/arm-compute/2016-03-30/swagger) and [network](https://github.com/Azure/azure-rest-api-specs/tree/master/arm-network/2016-03-30/swagger).

```
cd Tools
npm install
For multi file swagger API
  copy [Path to folder containing swagger specs]
  node ConvertSwaggerToExplorerSpecs.js -d FolderPath > ..\App_Data\JsonSpecs\Microsoft.Web.json
For single file swagger API
  copy [Path to swagger spec]
  node ConvertSwaggerToExplorerSpecs.js -f FilePath > ..\App_Data\JsonSpecs\Microsoft.Web.json
```
