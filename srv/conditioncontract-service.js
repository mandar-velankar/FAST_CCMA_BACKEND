const cds = require('@sap/cds');
const moment = require("moment");
const axios = require('axios');
const qs = require("qs");
const Handlebars = require("handlebars");
const ServiceHelper = require('./utils/ServiceHelper');

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
                CCMContractID: CCMContractID, FastConditionContractID: FastCCMContractId, ProductCode: ProductCode
            }));
            const response = await createCCMContract(tx, 'ES', "ConditionContract", sourceData);
            const contractNumber = response?.data?.ConditionContract?.ConditionContractType?.ConditionContract;
            if (contractNumber) {
                console.log("Payload sent to SAP:", JSON.stringify(JSON.parse(response?.config?.data), null, 2));
                const contractInfo = await tx.run(SELECT.one.from(CCMContract).where({ ID: CCMContractID, ContractNumber: {"!=": null} }));
                if(contractInfo){
                    await tx.run(UPDATE(CCMContract).with({ PreviousContractNumber: contractInfo.ContractNumber}).where({ ID: CCMContractID }));
                }
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
        const staticBVHeader = {}; 

        for (const { Source, Target } of staticMappings) {
            const key = Target.split('.').pop();

            if (Target.includes('CndnContrConditionRecordType')) {
                staticConditionRecord[key] = Source;
            } else if (Target.includes('bvheader')) {
                staticBVHeader[key] = Source;
            } else {
                setNestedValue(finalResult, Target, Source);
            }
        }

        const conditionRecords = [];
        const bvheaderList = [];

        for (const row of sourceData) {
            const conditionRecord = { ...staticConditionRecord };
            const bvheaderEntry = { ...staticBVHeader };

            let conditionTypeValue = null;

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
                    conditionTypeValue = conditionTypeMap[value] || value;
                    value = conditionTypeValue;
                }

                if (field === 'YD02' && Target.endsWith('ConditionRateRatio')) {
                    value = value * 100;
                }

                const pathSegments = Target.split('.');
                const key = pathSegments[pathSegments.length - 1];

                if (Target.includes('CndnContrConditionRecordType')) {
                    if (conditionTypeValue === 'YP10') {
                        conditionRecord['ConditionCalculationType'] = 'C';
                        conditionRecord['ConditionQuantityUnit'] = 'PC';
                        conditionRecord['ConditionQuantityUnitISOCode'] = 'PCE';
                        conditionRecord['ConditionQuantity'] = row.RequestedVolume || 1;
                    }
                    conditionRecord[key] = value;
                } else if (Target.includes('bvheader')) {
                    bvheaderEntry[key] = value;
                } else {
                    setNestedValue(finalResult, Target, value);
                }
            }

            if (Object.keys(conditionRecord).length > 0) {
                if (conditionRecord.ConditionType === 'YP10') {
                    delete conditionRecord.ConditionRateRatioUnit;
                    delete conditionRecord.ConditionRateRatio;
                    delete conditionRecord.ConditionRateRatioUnitISOCode;
                }
                conditionRecords.push(conditionRecord);
            }
            
            if (row.AssortmentReference) {
                bvheaderEntry['FieldCombination'] = 'Y002';
            }

            if (Object.keys(bvheaderEntry).length > 0) {
                bvheaderList.push(bvheaderEntry);
            }

            if (row.YD06 !== undefined && row.YD06 !== null && row.YD06 !== 0) {
                const royalDecreeRecord = { ...staticConditionRecord };

                for (const { Source, Target } of dynamicMappings) {
                    const field = Source.replace('ContractPayloadView.', '');
                    if (!Target.includes('CndnContrConditionRecordType')) continue;

                    royalDecreeRecord['ConditionRateRatio'] = row.YD06 * 100;

                    if (row[field] !== undefined && row[field] !== null) {
                        const key = Target.split('.').pop();
                        royalDecreeRecord[key] = row[field];
                    }
                }

                royalDecreeRecord['ConditionType'] = 'YD06';
                conditionRecords.push(royalDecreeRecord);
            }
        }

        if (conditionRecords.length > 0) {
            setNestedValue(finalResult, 'ConditionContract.ConditionContractType._CndnContrCndnRecord', [
                "",
                { CndnContrConditionRecordType: conditionRecords }
            ]);
        }

        if (bvheaderList.length > 0) {
            setNestedValue(finalResult, 'ConditionContract.bvheader', bvheaderList);
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

    srv.on("sendFOCToInteractMail", async (req) => {
        try {
            const {FastCCMContractId, CCMContractID, ProductCode} = req.data;
            const recipients = [
                {
                    RecipientEmail: "commercialagreements_test@bayer.com",
                    RecipientName: "PCA Spain CH/ PH"
                },
                {
                    RecipientEmail: "commercialagreements_test.pt@bayer.com",
                    RecipientName: "PCA Portugal CH/ PH"
                }
            ];
            
            const fastbackendAPI = await cds.connect.to("FASTBACKEND_API");

            const fastContract = await SELECT.one.from(FastConditionContracts)
                .where({ ID: FastCCMContractId });
            const ccmcontract = await SELECT.one.from(CCMContract, cc => {
                cc`.*`,
                cc.CCMCustomer(cust => cust`.*`),
                cc.CCMMaterial(mat => mat`.*`),
                cc.PriceConditionFOC(foc => foc`.*`)
            }).where({
                ID: CCMContractID,
                ProductCode: ProductCode
            });
              
            await addOutgoingMail(fastbackendAPI, {
                data: {
                    fastContract,
                    ccmcontract
                }, 
                templateId: "SendFOCToInteractMail",
                subject: `FAST REF ${fastContract.OfferID} - QFHC (Sales org name) - Registro de productos gratuitos`,
                recipients
            },
            mapFOCInteractDataToMail);

            return "Mail saved successfully";
        } catch (error) {
            return req.reject(403, "Failed to send mail")
        }
    });

    const mapFOCInteractDataToMail = function (template, data, subject, recipients) {
        const recipientEmails = recipients.map(r => r.RecipientEmail).join(';');
        const focMaterials = data.ccmcontract.CCMMaterial.map(material => {
            const priceConditionFOC = data.ccmcontract.PriceConditionFOC.find(foc => 
                foc.OfferID === data.fastContract.OfferID && 
                foc.CountryCode === data.fastContract.CountryCode && 
                foc.ProductCode == material.ProductCode
            );

            return {
                MaterialNumber: material.MaterialNumber || "",
                FOCMaterialNumber: material.FOCMaterialNumber || "",
                FOCMinAmount: parseFloat(priceConditionFOC?.FOCMinAmount) || 0
            }
        });
        const base64Content = template?.MailTemplateFile?.content;
        const templateContent = base64Content ? Buffer.from(base64Content, 'base64') : null;

        return {
            CountryCode: data.fastContract.CountryCode,
            TenderID: data.fastContract.TenderID,
            OfferID: data.fastContract.OfferID,
            Sender: 'FAST-Admin@bayer.com',
            Recipients: recipientEmails,
            Subject: subject,
            MailBody: generateMailBody(templateContent, {
                data: { 
                    ccmcontract: {
                        ...data.ccmcontract,
                        CCMContractStartDate: data.ccmcontract.CCMContractStartDate ? ServiceHelper.formatDate(data.ccmcontract.CCMContractStartDate, 'YYYY-MM-DD','YYYY-MM-DD') : "",
                        CCMContractEndDate: data.ccmcontract.CCMContractEndDate ? ServiceHelper.formatDate(data.ccmcontract.CCMContractEndDate, 'YYYY-MM-DD','YYYY-MM-DD') : ""
                    }, 
                    materialNumber: data.ccmcontract.CCMMaterial?.[0]?.MaterialNumber || "",
                    focMaterials
                }
            }),
            Sent: false
        };
    }

    const addOutgoingMail = async function (api, { data, templateId, subject, recipients }, mappingCB) {
		const mailTemplate = await getMailTemplate(api, templateId);
		const mappedData = mappingCB(mailTemplate?.d, data, subject, recipients);
		return api.send({
            method: 'POST',
            path: `/v2/conditioncontracting/OutgoingMails`,
            data: mappedData
        });
	}

	

    const generateMailBody = function (content, data) {
        return Handlebars.compile("" + content)(data);
    }

    const getMailTemplate = async function (api, templateId) {
        try{
            const result = await api.send({
                method: 'GET',
                path: `/v2/conditioncontracting/MailTemplate(CountryCode='ES',Language='ES',TemplateId='${templateId}')?$expand=MailTemplateFile&$select=MailTemplateFile.content`
            });
            // const result = await fastbackendAPI.send({
            //     query: SELECT.one.from("ConditionContractService.MailTemplate")
            //     .columns('*', 'MailTemplateFile.title', 'MailTemplateFile.content')
            //     .where({ TemplateId: templateId })
            // })
            // const result = await fastbackendAPI.run(SELECT.one.from(MailTemplate)
			// .columns('*', 'MailTemplateFile.title', 'MailTemplateFile.content')
			// .where({ TemplateId: templateId }))
            return result;
        }catch(error){
            console.error("No mail template found");
            return;
        }
    }

    srv.on('createAllCCMContract', async (req) => {
        const tx = cds.tx(req);
        try {
            const { FastCCMContractId } = req.data;
            const sourceData = await tx.run(SELECT.from(ContractPayloadView).where({
                 FastConditionContractID: FastCCMContractId
            }));

            // Grouping the source data by ContractID
            const grouped = Object.values(
                sourceData.reduce((acc, item) => {
                  const key = item.CCMContractID;
                  if (!acc[key]) {
                    acc[key] = [];
                  }
                  acc[key].push(item);
                  return acc;
                }, {})
            );

            for (const ct of grouped) {
                const response = await createAllCCMContracts(tx, 'ES', "ConditionContract", ct);
                const contractNumber = response?.data?.ConditionContract?.ConditionContractType?.ConditionContract;
                if (contractNumber) {
                    const contractInfo = await tx.run(SELECT.one.from(CCMContract).where({ ID: ct[0].CCMContractID, ContractNumber: {"!=": null} }));
                    if(contractInfo){
                        await tx.run(UPDATE(CCMContract).with({ PreviousContractNumber: contractInfo.ContractNumber}).where({ ID: ct[0].CCMContractID }));
                    }
                    await tx.run(UPDATE(CCMContract).with({ ContractNumber: contractNumber, Synchronized: true }).where({ ID: ct[0].CCMContractID }));
                }
            }

            return req.reply("");
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

    async function createAllCCMContracts(tx, countryCode, resource, sourceData) {
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
    }
};
