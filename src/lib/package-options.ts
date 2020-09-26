export class PackageOptions {
    public excludeMetadataTypes: string[] = [];
    public skipFileNamePattern: string;
    public packageApiVersionOverride: string = '48.0';
    public customObjectNamePattern: string = '__';
    public sfdxLogLevel: string = 'WARN';

    public loadDefaults() {
        this.excludeMetadataTypes = [
            'ActionLinkGroupTemplate',
            'AnalyticSnapshot',
            'AnimationRule',
            'ApexTestSuite',
            'AuthProvider',
            'CallCenter',
            'CaseSubjectParticle',
            'ChannelLayout',
            'ChatterExtension',
            'CleanDataService',
            'CMSConnectSource',
            'CommunityTemplateDefinition',
            'CommunityThemeDefinition',
            'CspTrustedSite',
            'CustomApplicationComponent',
            'CustomFeedFilter',
            'CustomHelpMenuSection',
            'CustomNotificationType',
            'Document',
            'EclairGeoData',
            'EmbeddedServiceBranding',
            'EmbeddedServiceConfig',
            'EmbeddedServiceFlowConfig',
            'EmbeddedServiceMenuSettings',
            'ExternalDataSource',
            'ExternalServiceRegistration',
            'FlowCategory',
            'FlowDefinition',
            'GlobalValueSetTranslation',
            'HomePageComponent',
            'Letterhead',
            'LightningBolt',
            'LightningMessageChannel',
            'LightningOnboardingConfig',
            'ManagedContentType',
            'MobileApplicationDetail',
            'MutingPermissionSet',
            'MyDomainDiscoverableLogin',
            'NamedCredential',
            'OauthCustomScope',
            'PermissionSetGroup',
            'PlatformCachePartition',
            'PlatformEventChannel',
            'PlatformEventChannelMember',
            'PostTemplate',
            'Prompt',
            'RecommendationStrategy',
            'RedirectWhitelistUrl',
            'Role',
            'Scontrol',
            'SiteDotCom',
            'StandardValueSet',
            'StandardValueSetTranslation',
            'SynonymDictionary',
            'TransactionSecurityPolicy'
        ];
        this.skipFileNamePattern = 'topicsForObjects/sma__|topicsForObjects/ltngsharing__|topicsForObjects/SDOC__|topicsForObjects/SSign__';
    }
}
