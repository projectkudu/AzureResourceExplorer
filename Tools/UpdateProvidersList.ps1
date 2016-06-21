Write-Host 'Getting list of Providers from Subscription ANTPS05 SubID 1402be24-4f35-4ab7-a212-2cd496ebdf14...'

$ProvidersJson = ARMClient.exe get /subscriptions/1402be24-4f35-4ab7-a212-2cd496ebdf14/providers?api-version=2014-04-01 

$ProvidersJson = [string]$ProvidersJson

$Providers = ConvertFrom-Json -InputObject $ProvidersJson

Write-Host 'Found resource providers, ordering based on ID...'
$Providers.value = $Providers.value | Sort-Object id

# for some reason the Depth of the object needs to be passed as a parameter! 1000 as a large depth
$Result = ConvertTo-Json -InputObject $Providers -Depth 1000

Write-Host 'Writing to file ..\App_Data\ProvidersSpecs\ProvidersList.json...'

Out-File -FilePath ..\App_Data\ProvidersSpecs\ProvidersList.json -InputObject $Result