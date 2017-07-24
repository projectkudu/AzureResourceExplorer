export enum ARMUrlParts {
    Protocol,
    Blank,
    DomainName,
    SubscriptionsKey,
    SubscriptionsValue,
    ResourceGroupsKey,
    ResourceGroupsValue, // Urls with length <= ResourceGroupsValue will only include resourceId
    ProviderKey,
    ProviderValue, // start of resourcetype followed by 9(ResourceType1Name) , 11, 13, ... ( 8, 9 will always exist, 11, 13.. is optional)
    ResourceType1Name,
    ResourceType1Value // start of resourcename followed by 12, 14,...(12, 14,... is optional)
}