# make sure the script stops if one of the swaps failed
$ErrorActionPreference = "Stop"

Select-AzureSubscription -SubscriptionName "Websites migration" -Current

$ParametersObject = @{
	targetSlot = "staging"
}

Write-Host swapping bay site ....
Invoke-AzureResourceAction -ResourceGroupName Default-Web-MSFTWestUS -ResourceType Microsoft.Web/sites -ResourceName explorer-bay -Action slotsswap -Parameters $ParametersObject -ApiVersion 2015-08-01 -Force

Write-Host swapping blu site ....
Invoke-AzureResourceAction -ResourceGroupName Default-Web-MSFTEastUS -ResourceType Microsoft.Web/sites -ResourceName explorer-blu -Action slotsswap -Parameters $ParametersObject -ApiVersion 2015-08-01 -Force

Write-Host swapping db3 site ....
Invoke-AzureResourceAction -ResourceGroupName Default-Web-MSFTNorthEurope -ResourceType Microsoft.Web/sites -ResourceName explorer-db3 -Action slotsswap -Parameters $ParametersObject -ApiVersion 2015-08-01 -Force

Write-Host swapping hk1 site ....
Invoke-AzureResourceAction -ResourceGroupName Default-Web-MSFTEastAsia -ResourceType Microsoft.Web/sites -ResourceName explorer-hk1 -Action slotsswap -Parameters $ParametersObject -ApiVersion 2015-08-01 -Force

Write-Host Done Swapping all sites