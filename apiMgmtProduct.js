const msRestAzure = require('ms-rest-azure');
const {URL} = require('url');
const uuidv4 = require('uuid/v4');

class ApiMgmtProduct {
    async getIdByName(credentials, productRef) {
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            'products' +
            '?api-version=2017-03-01');
        
        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);

        let options = {
            method: 'GET',
            url: url.href,
        };

        const result = await azureServiceClient.sendRequest(options)
        .catch( error => {
            throw new Error(`error getting product id for '${productRef.name}'; ${error}`);
        });

        let productId;
        for (let i = 0; i < result.value.length; i++) {
            const item = result.value[i];
            if (item.properties.displayName === productRef.name) {
                productId = item.name;
                break;
            }
        }
        return productId;
    };
    async createProduct(credentials, productRef, productContent) {
        let newProductId = uuidv4().replace(/-/g, "").slice(8);
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            `products/${newProductId}` +
            '?api-version=2017-03-01');
        
        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);

        const data = {
            "name": productRef.name,
            "description": productContent.description,
            "terms": productContent.terms,
            "subscriptionRequired": productContent.subscriptionRequired,
            "approvalRequired": productContent.approvalRequired,
            "subscriptionsLimit": productContent.subscriptionsLimit,
            "state": productContent.state,
        }

        let options = {
            method: 'PUT',
            url: url.href,
            body: data
        };

        const result = await azureServiceClient.sendRequest(options)
        .catch( error => {
            throw new Error(`error creating product '${productRef.name}'; ${error}`);
        });

        let productId = result.name;
        console.log(`create product '${productRef.name}' successfully`);
        return productId;
    };
    // update product properties
    async updateProduct(credentials, productRef, productContent) {
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            `products/${productRef.id}` +
            '?api-version=2017-03-01');
        
        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);

        const data = {
            "properties": {
                "displayName": productRef.name,
                "description": productContent.description,
                "terms": productContent.terms,
                "subscriptionRequired": productContent.subscriptionRequired,
                "approvalRequired": productContent.approvalRequired,
                "subscriptionsLimit": productContent.subscriptionsLimit,
                "state": productContent.state,
            }
        }

        const headers = {};
        headers['If-Match'] = '*';

        let options = {
            method: 'PATCH',
            url: url.href,
            headers,
            body: data
        };

        const result = await azureServiceClient.sendRequest(options)
        .catch( error => {
            throw new Error(`error updating properties for product '${productRef.name}'; ${error}`);
        });

        console.log(`update properties for product '${productRef.name}' successfully`);
    };
    // add/update api to the specific product
    async updateProductApi(credentials, productRef, api) {
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            `products/${productRef.id}/` +
            `apis/${api.id}` +
            '?api-version=2017-03-01');
        
        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);

        let options = {
            method: 'PUT',
            url: url.href
        };

        const result = await azureServiceClient.sendRequest(options)
        .catch( error => {
            throw new Error(`error setting api '${api.name}' to product '${productRef.name}'; ${error}`);
        });

        console.log(`set api '${api.name}' to product '${productRef.name}' successfully`);
    };
}

// export singlton
module.exports = new ApiMgmtProduct();