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
                await tx.run(UPDATE(CCMContract).with({ ContractNumber: contractNumber, Synchronized: true }).where({ ID: CCMContractID }));
            }
            console.log("Response from SAP:", response.data);
            return req.reply("CCM Contract " + contractNumber + " created successfully into SAP");
        } catch (error) {
            let statusCode = 500;
            let userMessage = "Unexpected server error. Please contact the application support team.";

            if (error.response?.data) {
                console.error("SAP Error Response:", error.response.data);
                const sapError = error.response.data;

                userMessage =
                    sapError?.error?.message?.value ||
                    sapError?.error?.innererror?.errordetails?.[0]?.message ||
                    sapError?.fault?.faultstring ||
                    sapError?.Exception_Details?.Exception_Message ||
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

    function setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                current[key] = value;
            } else {
                if (!current[key]) current[key] = {};
                current = current[key];
            }
        });
    }

    function buildPayloadFromMappings(sourceData, apiBodyMappings) {
        const finalResult = {};

        const salesGroupMap = { Pharma: 'PH', Radiology: 'RD' };
        const conditionTypeMap = {
            DescuentoComercial: 'YD02',
            PrecioNeto: 'YP10',
        };

        const staticMappings = apiBodyMappings.filter(m => !m.Source.startsWith('ContractPayloadView.'));
        const dynamicMappings = apiBodyMappings.filter(m => m.Source.startsWith('ContractPayloadView.'));

        const staticConditionRecord = {};
        const staticBusVolSelection = {};

        for (const { Source, Target } of staticMappings) {
            const key = Target.split('.').pop();

            if (Target.includes('CndnContrConditionRecordType')) {
                staticConditionRecord[key] = Source;
            } else if (Target.includes('BusVolSelectionCriteriaType')) {
                staticBusVolSelection[key] = Source;
            } else {
                setNestedValue(finalResult, Target, Source);
            }
        }

        const conditionRecords = [];
        const busVolSelectionCriteria = [];

        for (const row of sourceData) {
            const conditionRecord = { ...staticConditionRecord };
            const busVolSelection = { ...staticBusVolSelection };

            for (const { Source, Target } of dynamicMappings) {
                const field = Source.replace('ContractPayloadView.', '');
                let value = row[field];

                if (value === undefined || value === null) continue;

                if (field === 'Division' && Target === 'ConditionContract.ConditionContractType.SalesGroup') {
                    value = salesGroupMap[value] || value;
                    setNestedValue(finalResult, Target, value);
                    continue;
                }

                if (field === 'ConditionType' && Target.includes('ConditionType')) {
                    value = conditionTypeMap[value] || value;
                }

                // Apply transformation only for DescuentoComercial's ConditionRateRatio
                if (field === 'DescuentoComercial' && Target.endsWith('ConditionRateRatio')) {
                    value = value * 100;
                }

                const pathSegments = Target.split('.');
                const key = pathSegments[pathSegments.length - 1];

                if (Target.includes('CndnContrConditionRecordType')) {
                    conditionRecord[key] = value;
                } else if (Target.includes('BusVolSelectionCriteriaType')) {
                    busVolSelection[key] = value;
                } else {
                    setNestedValue(finalResult, Target, value);
                }
            }

            if (Object.keys(conditionRecord).length > 0) {
                conditionRecords.push({ CndnContrConditionRecordType: conditionRecord });
            }

            if (Object.keys(busVolSelection).length > 0) {
                busVolSelectionCriteria.push({ BusVolSelectionCriteriaType: busVolSelection });
            }

            // === Handle RoyalDecree as an additional condition record ===
            if (row.RoyalDecree !== undefined && row.RoyalDecree !== null) {
                const royalDecreeRecord = { ...staticConditionRecord };

                for (const { Source, Target } of dynamicMappings) {
                    const field = Source.replace('ContractPayloadView.', '');
                    if (!Target.includes('CndnContrConditionRecordType')) continue;

                    if (field === 'RoyalDecree') {
                        royalDecreeRecord['ConditionRateRatio'] = row.RoyalDecree * 100;
                        continue;
                    }

                    if (row[field] !== undefined && row[field] !== null) {
                        const key = Target.split('.').pop();
                        royalDecreeRecord[key] = row[field];
                    }
                }

                royalDecreeRecord['ConditionType'] = 'YD06';
                conditionRecords.push({ CndnContrConditionRecordType: royalDecreeRecord });
            }
        }

        if (conditionRecords.length > 0) {
            setNestedValue(finalResult, 'ConditionContract.ConditionContractType._CndnContrCndnRecord', conditionRecords);
        }

        if (busVolSelectionCriteria.length > 0) {
            setNestedValue(finalResult, 'ConditionContract.ConditionContractType._CndnContrBusVolSelCriteria', busVolSelectionCriteria);
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
