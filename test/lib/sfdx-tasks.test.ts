import { expect } from '@salesforce/command/lib/test';
import { SfdxTasks } from '../../src/lib/sfdx-tasks';

describe('Sfdx Tasks Tests', () => {
  describe('getSourceTrackingStatus Tests', function () {
    
    it('Can Handle Null', function () {
      expect(SfdxTasks.getMapFromSourceTrackingStatus(null)).to.be.null;
    });
    it('Can Get Map', function () {
      const statuses = [
        {
          state: 'Remote Changed',
          fullName: 'Admin',
          type: 'Profile',
          filePath: 'force-app\\main\\default\\profiles\\Admin.profile-meta.xml'
        },
        {
          state: 'Remote Changed',
          fullName: 'Zip_Code__c-Zip Code Layout',
          type: 'Layout',
          filePath: 'force-app\\main\\default\\layouts\\Zip_Code__c-Zip Code Layout.layout-meta.xml'
        },
        {
          state: 'Remote Changed (Conflict)',
          fullName: 'Conflict Layout',
          type: 'Layout',
          filePath: 'force-app\\main\\default\\layouts\\Conflict Layout.layout-meta.xml'
        },
        {
          state: 'Remote Deleted',
          fullName: 'Zip_Code__c.My_Date__c',
          type: 'CustomField',
          filePath: 'force-app\\main\\default\\objects\\Zip_Code__c\\fields\\My_Date__c.field-meta.xml'
        }
      ];
      const results =  SfdxTasks.getMapFromSourceTrackingStatus(statuses);
      const map = results.map;
      const deletes = results.deletes;
      const conflicts = results.conflicts

      expect(map).to.not.be.null;
      expect(map).to.be.instanceOf(Map);
      expect(map.get('Profile')[0]).to.equal('Admin');
      
      expect(conflicts).to.be.instanceOf(Map);
      expect(conflicts.get('Layout')[0]).to.equal('Conflict Layout');

      expect(deletes).to.be.instanceOf(Map);
      expect(deletes.get('CustomField')[0]).to.equal('Zip_Code__c.My_Date__c');

      expect(map.get('Bogus')).to.be.undefined;
    });
  });
  describe('getDefaultOrgAlias Tests', function () {
    it('Can Get Default Org Alias',async function () {
      this.timeout(0);
      const orgAlias = await SfdxTasks.getDefaultOrgAlias();
      expect(orgAlias).to.not.be.null;
      expect(orgAlias.length).to.be.greaterThan(0);
    });
  });
});
