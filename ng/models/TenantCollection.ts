class TenantCollection {

    private tenants: ITenantDetails[];
    private selectedTenant: ITenantDetails;

    constructor(private repository: ArmClientRepository) {
        this.tenants = [];
    }

    getTenants() {
        return this.tenants;
    }

    getSelectedTenant() {
        return this.selectedTenant;
    }

    async buildTenants() {
        let tenantsResponse = await this.repository.getTenants();
        let tenantsData: any[] = tenantsResponse.data;

        this.tenants = tenantsData.map(tenant => {
            return {
                name: tenant.DisplayName + " (" + tenant.DomainName + ")",
                id: tenant.TenantId,
                current: tenant.Current
            };
        });
        this.selectedTenant = this.tenants[this.tenants.indexOfDelegate(tenant => tenant.current)];
    }
}
