const msRestAzure = require('ms-rest-azure');
const fs = require('fs');
const apiMgmtProduct = require('./apiMgmtProduct');
const apiMgmtApi = require('./apiMgmtApi');
const path = require('path');
const jsYaml = require('js-yaml');

const PRODUCT_FILENAME = 'configuration.json';


/******* log in **********/
const login = async () => {
    console.log('logging in');

    const loginType = process.env.loginType;
    const loginId = process.env.loginId;
    const loginSecret = process.env.loginSecret;

    let response;
    if (loginType === 'sp') {
        // https://github.com/Azure/azure-sdk-for-node/blob/66a255dd882762e93e5b9b92ba63ebb222962d59/runtime/ms-rest-azure/lib/login.js#L414
        response = await msRestAzure.loginWithServicePrincipalSecret(loginId, loginSecret, process.env.loginTenantId);
    } else {
        // https://github.com/Azure/azure-sdk-for-node/blob/66a255dd882762e93e5b9b92ba63ebb222962d59/runtime/ms-rest-azure/index.d.ts#L376
        response = await msRestAzure.loginWithUsernamePassword(loginId, loginSecret, {domain: process.env.loginTenantId});
    }

    console.log('login successful');

    return response;
};
/******* log in **********/

/**
 * get the product configuration file from the dirctory
 * @param dirPath
 * @returns productFile
 */
const getProductConfig = async (productName, dirPath) => {
    try {
        let productFile = jsYaml.safeLoad(fs.readFileSync(`${dirPath}/${PRODUCT_FILENAME}`, 'utf8'));
        return productFile;
    } catch (error) {
        throw new Error(`product ${productName} missing ${PRODUCT_FILENAME} file`);
    };
};

/**
 * get ids of apis in product configuration file
 * @param credentials 
 * @param apis 
 * @returns apiIds
 */
const getApiIds = async (credentials, apis) => {
    if (apis.length > 0) {
        let apisRef = [];

        for (i = 0; i < apis.length; i++) {
            let apiId = await apiMgmtApi.getIdByName(credentials, apis[i]);
            if(!apiId) {
                throw new Error(`api ${apis[i]} not found, create API before running this pkg`);
            }
            apisRef.push({ id: `${apiId}`, name: `${apis[i]}` });
        };
        return apisRef;
    };
};

/**
 * Processes the /resources/products dir
 * @param credentials
 * @param dirPath
 * @returns {Promise.<*>}
 */
const processProductsDir = async (credentials, dirPath) => {
    const promises = [];
    fs.readdirSync(dirPath).forEach(item => {
        const itemAbsPath = `${dirPath}/${item}`;
        const itemStat = fs.statSync(itemAbsPath);

        if (itemStat.isDirectory()) {
            promises.push(
                processProductDir(credentials, itemAbsPath)
            );
        }
    });
    return Promise.all(promises);
};

/**
 * Processes a /resources/products/{product-name} dir
 * @param credentials
 * @param dirPath
 * @returns {Promise.<*>}
 */
const processProductDir = async (credentials, dirPath) => {
    const promises = [];
    const items = fs.readdirSync(dirPath);

    
    if (items.length > 0) {
        const productName = path.basename(dirPath);
        const productFile = await getProductConfig(productName, dirPath);
        
        const productRef = {
            name: productName
        }

        let productId = await apiMgmtProduct.getIdByName(credentials, productRef);
        if(!productId) {
            productId = await apiMgmtProduct.createProduct(credentials, productRef, productFile);
        };

        productRef.id = productId;

        // get API ids
        const apisRef = await getApiIds(credentials, productFile.apis);

        // update product apis
        if(apisRef) {
            apisRef.forEach( api => {
                promises.push(
                    apiMgmtProduct.updateProductApi(
                        credentials,
                        productRef,
                        api
                    )
                )
            })
        };

        // update product
        promises.push(
            apiMgmtProduct.updateProduct(
                credentials, 
                productRef, 
                productFile
            )
        );
    };
    return Promise.all(promises);
};


/**
 * Sets productsDir by walking the /resources dir tree
 * @param credentials
 * @returns {Promise.<*>}
 */
const setProducts = async (credentials) => {
    const promises = [];
    const dirPath = '/resources';
    fs.readdirSync(dirPath).forEach(item => {
        const itemAbsPath = `${dirPath}/${item}`;

        if (item === 'products') {
            promises.push(processProductsDir(credentials, itemAbsPath));
        }
    });
    return Promise.all(promises);
};

login()
    .then(credentials => setProducts(credentials))
    .catch(error => {
        console.log(error);
        process.exit(1)
    });