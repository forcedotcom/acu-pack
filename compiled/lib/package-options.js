"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageOptions = void 0;
const options_1 = require("./options");
class PackageOptions extends options_1.OptionsBase {
    constructor() {
        super(...arguments);
        this.excludeMetadataTypes = [];
    }
    loadDefaults() {
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
            }
            catch (err) {
                reject(err);
            }
        });
    }
    get currentVersion() {
        return PackageOptions.CURRENT_VERSION;
    }
}
exports.PackageOptions = PackageOptions;
PackageOptions.CURRENT_VERSION = 1.0;
//# sourceMappingURL=package-options.js.map