# ARMExplorer
This project has dependencies on OAuth authentication.

## Instructions
1. Clone this repository to your local drive.
2. Open `ARMExplorer.sln` with VS 2017+ and compile.

### Create AAD application
1. Go to [Azure Portal](https://manage.windowsazure.com/) while logged in as an Org ID (i.e. not MSA) and create AAD Application. You may create an application on existing AAD directory or a new directory altogether.
1. Select 'Azure Active Directory' and then 'App registrations' and click 'New application registration'
1. Enter any name for application name.
1. Select `WEB APPLICATION AND/OR WEB API`
1. Enter `https://localhost:44300/` as `SIGN ON URL`
1. For `APP ID URL`, enter something like `https://davidebboslingshot.onmicrosoft.com/`.
1. Once created, click `Settings` tab
1. On `Required permissions`, add `Windows Azure Service Management API` and check `Access Azure Service Management` for `Delegated Permissions` and save.
1. In 'Reply URLs' add 'https://localhost:44300/manage'

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

## Swagger specs
Swagger files can be found at https://github.com/Azure/azure-rest-api-specs. For web apps the specs can be found internally under bin\Hosting\Azure\GeoMaster\Swagger\Service.json

## Adding Swagger specs

Swagger files for all ARM providers are under App_Data/SwaggerSpecs. To update specs for any provider, locate the folder corresponding to the specific provider under SwaggerSpecs and do the following:
1. To update an API in an existing file replace the old file contents with the latest specs. 
2. To move API to a new file, you will have to delete the old API from the existing file apart from adding the new file(s). 
3. To delete an API , remove the API from existing files.
4. To add new API, copy the new files to the provider folder.
5. To add new provider, create a new folder for the provider under SwaggerSpecs and place all your files inside the folder. 
6. When adding new files, make sure you include them in the csproj file. Ex: https://github.com/projectkudu/AzureResourceExplorer/blob/526106d2690bfadee6125a9e5c9b36ac1381d485/ARMExplorer.csproj#L193

Create a pull request with your changes.


