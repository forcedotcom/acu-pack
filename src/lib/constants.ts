import os = require('os');

export default class Constants {
  public static readonly PLUGIN_NAME = 'acu-pack';
  public static readonly DEFAULT_XML_NAMESPACE = 'http://soap.sforce.com/2006/04/metadata';
  // public static readonly METADATA_COVERAGE_REPORT_URL = 'https://mdcoverage.secure.force.com/services/apexrest/report';
  public static readonly METADATA_COVERAGE_REPORT_URL =
    'https://dx-extended-coverage.my.salesforce-sites.com/services/apexrest/report';
  public static readonly DEFAULT_PACKAGE_NAME = 'package.xml';
  public static readonly DEFAULT_PACKAGE_PATH = 'manifest/' + Constants.DEFAULT_PACKAGE_NAME;
  public static readonly SFDX_DESCRIBE_METADATA = 'sfdx force:mdapi:describemetadata';
  public static readonly SFDX_APEX_EXECUTE = 'sfdx force:apex:execute';
  public static readonly SFDX_SOURCE_RETRIEVE = 'sfdx force:source:retrieve';
  public static readonly SFDX_PROJECT_CREATE = 'sfdx force:project:create';
  public static readonly SFDX_MDAPI_LISTMETADATA = 'sfdx force:mdapi:listmetadata';
  public static readonly SFDX_SCHEMA_DESCRIBE = 'sfdx force:schema:sobject:describe';
  public static readonly SFDX_DATA_UPSERT = 'sfdx force:data:bulk:upsert';
  public static readonly SFDX_DATA_STATUS = 'sfdx force:data:bulk:status';
  public static readonly SFDX_ORG_DISPLAY = 'sfdx force:org:display';
  public static readonly SFDX_SOURCE_STATUS = 'sfdx force:source:status';
  public static readonly SFDX_CONFIG_GET = 'sfdx config:get';
  public static readonly SFDX_CONFIG_SET = 'sfdx config:set';
  public static readonly SFDX_CONFIG_DEFAULT_USERNAME = 'defaultusername';
  public static readonly SFDX_CONFIG_MAX_QUERY_LIMIT = 'maxQueryLimit';
  public static readonly SFDX_PERMISSION_APEX_CLASS = 'ApexClass';
  public static readonly SFDX_PERMISSION_APEX_PAGE = 'ApexPage';
  public static readonly SFDX_PERMISSION_CUSTOM_APP = 'CustomApplication';
  public static readonly SFDX_PERMISSION_CUSTOM_OBJ = 'CustomObject';
  public static readonly SFDX_PERMISSION_CUSTOM_FIELD = 'CustomField';
  public static readonly SFDX_PERMISSION_CUSTOM_TAB = 'CustomTab';
  public static readonly SFDX_PERMISSION_SET = 'PermissionSet';
  public static readonly SFDX_PERMISSION_PROFILE = 'Profile';
  public static readonly SFDX_PERMISSION_RECORD_TYPE = 'RecordType';
  public static readonly SFDX_PERMISSION_LAYOUT = 'Layout';
  public static readonly SFDX_DATA_QUERY = 'sfdx force:data:soql:query';
  public static readonly DEFAULT_PROJECT_FILE_NAME = 'sfdx-project.json';
  public static readonly DEFAULT_SFDC_LOGIN_URL = 'https://login.salesforce.com';
  public static readonly DEFAULT_PACKAGE_VERSION = '49.0';
  public static readonly ENOENT = 'ENOENT';
  public static readonly CONTENT_TYPE_APPLICATION = 'application/octetstream';
  public static readonly HEADERS_CONTENT_TYPE = 'content-type';
  public static readonly METADATA_FILE_SUFFIX = '-meta.xml';
  public static readonly HTTP_STATUS_REDIRECT = [301];
  public static readonly EOL = os.EOL;
  public static readonly CR = '\r';
  public static readonly LF = '\n';
}
