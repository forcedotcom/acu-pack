import { expect } from '@salesforce/command/lib/test';
import Access from '../../../../src/commands/acu-pack/admin/user/access'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSetupEntityAccessCallBack = async (id: string, label: string): Promise<any> => {
    return Promise.resolve(
        [{
            Id:'1',
            SetupEntityId: id,
            ParentId: 'PermissionSet1'
        },
        {
            Id:'2',
            SetupEntityId: id,
            ParentId: 'PermissionSet2'
        },
        {
            Id:'3',
            SetupEntityId: id,
            ParentId: 'PermissionSet3'
        }]
    );
}

const getPermissionSetAssignmentCallback = async (id: string, label: string): Promise<any[]> => {
    return Promise.resolve(
        [{
            Id:'1',
            PermissionSetId: id,
            PermissionSet: {
                Label: label,
                ProfileId: 'ProfileId1',
                Profile: {
                    Name: 'Name1'
                }
            },
            AssigneeId: 'AssigneeId1',
            Assignee: {
                Username: 'Username1'
            },
            ExpirationDate: 'ExpirationDate1'
        },
        {
            Id:'2',
            PermissionSetId: id,
            PermissionSet: {
                Label: label,
                ProfileId: 'ProfileId2',
                Profile: {
                    Name: 'Name2'
                }
            },
            AssigneeId: 'AssigneeId2',
            Assignee: {
                Username: 'Username2'
            },
            ExpirationDate: 'ExpirationDate2'
        },
        {
            Id:'3',
            PermissionSetId: id,
            PermissionSet: {
                Label: label,
                ProfileId: 'ProfileId3',
                Profile: {
                    Name: 'Name3'
                }
            },
            AssigneeId: 'AssigneeId3',
            Assignee: {
                Username: 'Username3'
            },
            ExpirationDate: 'ExpirationDate3'
        }]
    );
}

describe('App Access Tests', function () {
  describe('Test Xml Merge', () => {
    it('Can Get Access', async function () {
        const appMenuItems = [
            {
                Id: 'AppId1',
                ApplicationId: 'ApplicationId1', 
                Name: 'AppName1', 
                Label: 'AppLabel1'
            },
            {
                Id: 'AppId2',
                ApplicationId: 'ApplicationId2', 
                Name: 'AppName2', 
                Label: 'AppLabel2'
            }
        ];
        const permissionSetMap = new Map<string,any>();
        permissionSetMap.set('PermissionSet1', {
            Id: 'PermissionSet1',
            Label: 'PermissionSetLabel1'
        });
        permissionSetMap.set('PermissionSet2', {
            Id: 'PermissionSet2',
            Label: 'PermissionSetLabel2'
        });
        
        const results = await Access.getAppAccess(
            appMenuItems,
            permissionSetMap,
            getSetupEntityAccessCallBack,
            getPermissionSetAssignmentCallback
        );
        expect(results).not.null;
        expect(results.size).to.not.equal(0);
        for(const appLabel of results.keys()) {
            const accesses = results.get(appLabel);
            for( const access of accesses ){
                expect(access.PermissionSetId === 'PermissionSet1' || access.PermissionSetId === 'PermissionSet2');
            }
        }
    });
  });
});
