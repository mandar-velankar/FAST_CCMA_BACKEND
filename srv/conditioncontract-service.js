const cds = require('@sap/cds');
const moment = require("moment");
const axios = require('axios');
const qs = require("qs");

const {
    FastConditionContracts,
    CCMContract,
    CCMCustomer,
    CCMMaterial,
    PriceConditionInvoice,
    APIDefinition,
    APIBody,
    ContractPayloadView,
    APIConfigOAuth
} = cds.entities("ConditionContract");


module.exports = (srv) => {

    srv.on('getBackendData', async (req) => {
        const fastbackendAPI = await cds.connect.to("FASTBACKEND_API");
        const resultpost = await fastbackendAPI.send({
            method: 'GET', path: `/v2/conditioncontracting/getBackendData?CountryCode=%27ES%27`
        });
        return JSON.stringify(resultpost);
    })

    srv.before(['UPDATE', 'CREATE'], "CCMContractDetailView", async (req) => {
        const contractStartDateExists = Object.prototype.hasOwnProperty.call(req.data, "CCMContractStartDate");
        const contractEndDateExists = Object.prototype.hasOwnProperty.call(req.data, "CCMContractEndDate");
        contractStartDateExists && !req.data.CCMContractStartDate && req.error({ code: 404, message: "Contract Start Date is required.", target: "CCMContractStartDate" });
        contractEndDateExists && !req.data.CCMContractEndDate && req.error({ code: 404, message: "Contract End Date is required.", target: "CCMContractEndDate" });

        if (contractStartDateExists && contractEndDateExists) {
            if (!moment(req.data.CCMContractStartDate).isBefore(req.data.CCMContractEndDate))
                req.error({ code: 404, message: "Contract Start Date should be before the Contract End Date.", target: "CCMContractStartDate" });
        }
    })

    srv.on('createCCMContract', async (req) => {
        const tx = cds.tx(req);
        try {
            const { FastCCMContractId, CCMContractID, ProductCode } = req.data;
            const sourceData = await tx.run(SELECT.from(ContractPayloadView).where({
                FastConditionContractID: FastCCMContractId
            }));
            const response = await createCCMContract(tx, 'ES', "ConditionContract", sourceData);
            const contractNumber = response?.data?.ConditionContract?.ConditionContractType?.ConditionContract;
            if (contractNumber) {
                await tx.run(UPDATE(CCMContract).with({ ContractNumber: contractNumber, Synchronized: true }).where({ID: CCMContractID}));
            }
            console.log("Response from SAP:", response.data);
            return req.reply("CCM Contract " + contractNumber + " created successfully into SAP");
        } catch (error) {
            let statusCode = 500;
            let userMessage = "Unexpected server error. Please contact the application support team.";

            if (error.response?.data) {
                console.error("SAP Error Response:", error.response.data);
                const sapError = error.response.data;

                userMessage = sapError?.error?.message?.value ||
                    sapError?.error?.innererror?.errordetails?.[0]?.message ||
                    sapError?.fault?.faultstring ||
                    "An error occurred while communicating with SAP.";

                userMessage = `SAP Error: ${userMessage}. Please contact the SAP support team.`;

                statusCode = error.response.status || 502;
            }
            else if (error.code && error.message) {
                console.error("App Error:", error.message);
                userMessage = error.message;
                statusCode = typeof error.code === 'number' ? error.code : 500;
            }
            else {
                console.error("Unhandled Error:", error);
            }

            return req.reject(statusCode, userMessage);
        }
    });

    async function createCCMContract(tx, countryCode, resource, sourceData) {
        try {
            const apiConfig = await tx.run(SELECT.one.from(APIDefinition).where({ Provider: 'ConditionContract', CountryCode: countryCode, Resource: resource }));
            const apiBodyMappings = await tx.run(SELECT.from(APIBody).where({ APIDefinition_ID: apiConfig.ID }));
            if (!apiBodyMappings) {
                throw new Error("ERR_MISSING_PARAMETER:API body Mappings not found");
            }
            const body = buildPayloadFromMappings(sourceData, apiBodyMappings);
            if (!body) {
                throw new Error("ERR_MISSING_PARAMETER:API Body not found");
            }
            const oauthAuth = await tx.run(SELECT.one.from(APIConfigOAuth, apiConfig.OAuth_ID));
            const url = `${apiConfig.Host}${apiConfig.BasePath}${apiConfig.ResourcePath}`;

            const oauthCredentials = await getBearerToken(oauthAuth);

            return axios({
                method: 'post',
                url: url,
                headers: {
                    'Authorization': `Bearer ${oauthCredentials.data.access_token}`,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(body)
            });
        } catch (error) {
            throw error
        }
    }

    async function getBearerToken(oauthAuth) {

        if (oauthAuth.OAuthProvider && oauthAuth.ClientID && oauthAuth.ClientSecret && oauthAuth.Scope) {
            console.log(`Calling ${oauthAuth.OAuthProvider}`);
            return axios({
                method: 'post',
                url: oauthAuth.OAuthProvider,
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${oauthAuth.ClientID}:${oauthAuth.ClientSecret}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept-Encoding': 'gzip, deflate',
                    'accept': 'application/json'
                },
                data: qs.stringify({
                    'grant_type': oauthAuth.GrantType,
                    'scope': oauthAuth.Scope
                })/*, when testing locally, comment out the proxy
					proxy: {
						host: priceAgreementApi.ProxyHost,
						port: priceAgreementApi.ProxyPort
					}*/
            });
        }

        throw Error("Missing OAUTH config parameters");
    };

    function getValueByPath(obj, path) {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }

    function createNestedObject(path, value) {
        const keys = path.split('.');
        return keys.reduceRight((acc, key) => ({ [key]: acc }), value);
    }

    function deepMerge(target, source) {
        for (const key of Object.keys(source)) {
            if (
                source[key] instanceof Object &&
                key in target &&
                target[key] instanceof Object &&
                !Array.isArray(source[key]) &&
                !Array.isArray(target[key])
            ) {
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    function buildPayloadFromMappings(sourceData, apiBodyMappings) {
        const finalResult = {};
        const sourceRow = sourceData[0]; // Assuming single row for now
        const salesGroupMap = {
            Pharma: 'PH',
            Radiology: 'RD'
        };
        const conditionType = {
            DescuentoComercial: 'YD02',
            PrecioNeto: 'YP10'
        }
        for (const { Source, Target } of apiBodyMappings) {
            let value;

            // If source is dynamic (from ContractPayloadView), fetch from data
            if (Source.startsWith('ContractPayloadView.')) {
                const field = Source.replace('ContractPayloadView.', '');
                value = sourceRow[field];
                if (
                    field === 'Division' &&
                    Target === 'ConditionContract.ConditionContractType.SalesGroup'
                ) {
                    value = salesGroupMap[value] || value;
                }
                if (
                    field === 'ConditionType' &&
                    Target === 'ConditionContract.ConditionContractType._CndnContrCndnRecord.CndnContrConditionRecordType.ConditionType'
                ) {
                    value = conditionType[value] || value;
                }
                if (Target.includes('CndnContrConditionRecordType')) {
                    const lastKey = Target.split('.').pop();
                    if (lastKey === 'ConditionQuantity') {
                        value = Number(value) || 0;
                    } else if (
                        lastKey === 'ConditionRateAmount' ||
                        lastKey === 'ConditionRateRatio'
                    ) {
                        value = Number(value) || 0;
                    }
                }
                if (field === 'Customer' && Target.includes('BusVolSelectionCriteriaType.Customer')) {
                    value = String(value);
                }
            } else {
                // Otherwise it's a static value like "YP01" or "0"
                value = Source;
            }

            if (value !== undefined) {
                const nestedObject = createNestedObject(Target, value);
                deepMerge(finalResult, nestedObject);
            }
        }

        return finalResult;
    }

    srv.before(['UPDATE', 'CREATE'], "CCMContractInformationDetailView", async (req) => {
        const contractStartDateExists = Object.prototype.hasOwnProperty.call(req.data, "ContractStartDate");
        const contractEndDateExists = Object.prototype.hasOwnProperty.call(req.data, "ContractEndDate");
        contractStartDateExists && !req.data.ContractStartDate && req.error({ code: 404, message: "Contract Start Date is required.", target: "ContractStartDate" });
        contractEndDateExists && !req.data.ContractEndDate && req.error({ code: 404, message: "Contract End Date is required.", target: "ContractEndDate" });

        if (contractStartDateExists && contractEndDateExists) {
            if (!moment(req.data.ContractStartDate).isBefore(req.data.ContractEndDate))
                req.error({ code: 404, message: "Contract Start Date should be before the Contract End Date.", target: "ContractStartDate" });
        }
    })
};
