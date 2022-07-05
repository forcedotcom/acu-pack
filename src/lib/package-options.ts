import { OptionsBase } from './options';

export class PackageOptions extends OptionsBase {
    private static CURRENT_VERSION: number = 1.0;

    public excludeMetadataTypes: string[] = [];

    public loadDefaults(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
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
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    protected get currentVersion(): number {
        return PackageOptions.CURRENT_VERSION;
    }

}
