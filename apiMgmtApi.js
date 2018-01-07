const msRestAzure = require('ms-rest-azure');
const {URL} = require('url');

class ApiMgmtApi {
    async getIdByName(credentials, apiName) {
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            `apis` +
            '?api-version=2017-03-01');

        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);

        let options = {
            method: 'GET',
            url: url.href,
        };

        const result = await azureServiceClient.sendRequest(options)
        .catch( error => {
            throw new Error(`error getting api id for '${apiName}'; ${error}`);
        });

        let apiId;
        for (let i = 0; i < result.value.length; i++) {
            const item = result.value[i];
            if (item.properties.displayName === apiName) {
                apiId = item.name;
                break;
            }
        }
        return apiId;
    }
}

// export singleton
module.exports = new ApiMgmtApi();