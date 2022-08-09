// import getObjectNameFromRecordId from "@salesforce/apex/AccountTeamMemberDisplayController.getObjectNameFromRecordId";

export async function getObjectNameFromId(recordId) { 
    console.log('Inside the helper function...');
    var error;
    var objectName;

    let query = {'recordId': recordId};

    await getObjectNameFromRecordId( query )
        .then(result => {
            console.debug('Result: ' + JSON.stringify(result));
            objectName = JSON.parse(JSON.stringify(result)); 
            error = '';
        })
        .catch(e => {
            error = e;
            objectName = '';
        }); 
    
    var returnObject = {
        'objectName':  objectName,
        'error':       error
    };
    return returnObject;
}

export default function something(){
    return 'something';
}