import { LightningElement, api, track } from 'lwc';
import { getObjectNameFromId } from './accountTeamDisplayContainerHelper';

export default class AccountTeamDisplayContainer extends LightningElement {
    @api recordId;
    @api error;

    @track objectType;

    async connectedCallback(){
        console.log(this.recordId); 
        let result = await getObjectNameFromId(this.recordId);
        this.objectType = result.objectName;
        this.error = result.error;
        console.log('Object type: ' + this.objectType);
        console.log('Error: ' + this.error);
        
    } 
}