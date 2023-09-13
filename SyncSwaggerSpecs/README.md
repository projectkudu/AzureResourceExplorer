# SyncSwaggerSpecs
SyncSwaggerSpecs is made for updating swagger spec automatically

## How work
1. GitHub Action execute SyncSwaggerSpecs
2. SyncSwaggerSpecs updates Swagger spec files from https://github.com/Azure/azure-rest-api-specs
3. GitHub Action send a pull request

## Update swagger strategy
- Target is "Microsoft.*" only
- Target is already managed swagger files
- Copy only stable api version(Do not get preview api version)
