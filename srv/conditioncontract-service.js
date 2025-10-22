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
    ContractRebatePayloadView,
    SettlementsDate,
    APIConfigOAuth,
    ContractItemGUID,
    IdentifyExistingContract,
    ExistingContractInfo,
    CurrentInvoicePrice
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

    async function fetchInstituteData() {
        const fastbackendAPI = await cds.connect.to("FASTBACKEND_API");
        const response = await fastbackendAPI.send({
            method: 'GET',
            path: `/v2/conditioncontracting/getInstituteData`
        });

        const institutes = response?.d?.candidateInstituteData || [];
        return institutes.map(item => ({
            ...item
        }));
    }

    async function preprocessContracts(tx, sourceData) {

        const candidates = await fetchInstituteData();

        const contracts = await tx.run(
            SELECT.from(IdentifyExistingContract)
        );

        const enrichedContracts = contracts.flatMap(contract => {
            return candidates
                .filter(c =>
                    String(c.CandidateInstituteID).trim() === String(contract.InstituteID).trim() ||
                    String(c.BaseInstituteID).trim() === String(contract.InstituteID).trim()
                )
                .map(match => ({
                ...contract,
                candidateType: match.RelationType,
                baseInstitute: match.BaseInstituteID,
                candidateInstitute: match.CandidateInstituteID
                }));
        });

        const uniqueContracts = Array.from(
            new Map(enrichedContracts.map(c => [
                [
                    c.CCMContractID,
                    c.ContractNumber,
                    c.Product,
                    c.InstituteID,
                    c.baseInstitute,
                    c.candidateInstitute
                ].join('|'),c])).values());

        return classifyContracts(sourceData, uniqueContracts);
        
    }

    /*function classifyContracts(sourceData, enrichedContracts) {
        
        if (!sourceData.length) return [];

        // take first record just for matching (all have same InstituteID anyway)
        const newOffer = sourceData[0];
        // 1. Find contracts related to this offer via hierarchy (SELF/PARENT/CHILD)
        const relatedContracts = enrichedContracts.filter(contract => {
            return (
                contract.candidateInstitute === newOffer.InstituteID || // SELF / CHILD / PARENT
                contract.baseInstitute === newOffer.InstituteID        // newOffer is the base of contract
            );
        });

        if (relatedContracts.length === 0) {
            return [{ sourceData, case: "NO_MATCH" }];
        }

        // 2. Extract institute sets
        const newOfferIds = [newOffer.InstituteID, ...(newOffer.childInstitutes || [])]; // all institutes in new offer
        const contractIds = relatedContracts
            .map(c => c.candidateInstitute) // all candidate institutes from contracts
            .filter((v, i, a) => a.indexOf(v) === i); // unique

        // 3. CASES

        // Case 1: Single customer exact match
        if (newOfferIds.length === 1 && contractIds.length === 1 && newOfferIds[0] === contractIds[0]) {
            return [{ sourceData, case: "CASE_1", contracts: relatedContracts }];
        }

        // Case 2: New single customer matches existing assortment
        if (newOfferIds.length === 1 && contractIds.length > 1) {
            return [{ sourceData, case: "CASE_2", contracts: relatedContracts }];
        }

        // Case 3: Matching contract on same assortment (all institutes match exactly)
        if (arraysEqual(newOfferIds.sort(), contractIds.sort())) {
            return [{ sourceData, case: "CASE_3", contracts: relatedContracts }];
        }

        // Case 4: Overlapping customers in different assortments
        if (newOfferIds.some(id => contractIds.includes(id)) && !arraysEqual(newOfferIds.sort(), contractIds.sort())) {
            return [{ sourceData, case: "CASE_4", contracts: relatedContracts }];
        }

        // Case 5: Single customer in new assortment matches existing single contract
        if (newOfferIds.length > 1 && contractIds.length === 1 && contractIds[0] === newOffer.baseInstitute) {
            return [{ sourceData, case: "CASE_5", contracts: relatedContracts }];
        }

        return [{ sourceData, case: "UNCLASSIFIED", contracts: relatedContracts }];
    }*/
    
    function classifyContracts(sourceData, enrichedContracts) {
        if (!sourceData.length) return [];

        // use first record just for matching
        const newOffer = sourceData[0];

        const { ProductCode, InstituteID, AssortmentReference } = newOffer;

        // filter contracts only on same ProductCode
        const relevantContracts = enrichedContracts.filter(
            c => c.ProductCode === ProductCode
        );

        if (relevantContracts.length === 0) {
            return { sourceData, case: "NO_MATCH" };
        }

        // ---- CASE 1 ----
        // contract is single-customer with candidate + base = newOffer.InstituteID
        const case1Contracts = relevantContracts.filter(
            c =>
                c.candidateInstitute === InstituteID &&
                c.baseInstitute === InstituteID
        );
        if (case1Contracts.length > 0) {
            return { sourceData, case: "CASE_1", contracts: case1Contracts };
        }

        // ---- CASE 2 ----
        // New offer has a single InstituteID (child), check if that child belongs to any parent assortment
        const parentsOfChild = enrichedContracts
            .filter(c => c.candidateInstitute === InstituteID && c.candidateType === "CHILD")
            .map(c => c.baseInstitute);

        const case2Contracts = relevantContracts.filter(
            c => parentsOfChild.includes(c.InstituteID)
        );

        if (case2Contracts.length > 0) {
            return { sourceData, case: "CASE_2", contracts: case2Contracts };
        }

        // ---- CASE 3 ----
        // assortment reference matches on both new offer and contract
        const case3Contracts = relevantContracts.filter(
            c => c.AssortmentReference && c.AssortmentReference === AssortmentReference
        );
        if (case3Contracts.length > 0) {
            return { sourceData, case: "CASE_3", contracts: case3Contracts };
        }

        // ---- CASE 4 ----
        // (ignored for now)
        // const case4Contracts = ...
        // return [{ sourceData, case: "CASE_4", contracts: case4Contracts }];

        // ---- CASE 5 ----
        // newOffer.InstituteID is parent -> check if any child institute already has a contract
        const childrenOfParent = enrichedContracts
            .filter(c => c.baseInstitute === InstituteID && c.candidateType === "CHILD")
            .map(c => c.candidateInstitute);

        const case5Contracts = relevantContracts.filter(
            c => childrenOfParent.includes(c.InstituteID)
        );

        if (case5Contracts.length > 0) {
            return { sourceData, case: "CASE_5", contracts: case5Contracts };
        }

        return { sourceData, case: "UNCLASSIFIED", contracts: relevantContracts };
    }

    // // helper function to compare arrays
    // function arraysEqual(a, b) {
    //     if (a.length !== b.length) return false;
    //     return a.every((v, i) => v === b[i]);
    // }

    function decideContractAction(existingContract, newOffer) {
        const existingType = existingContract.ContractType;
        const newType = newOffer.ContractType;

        const existingStart = existingContract.ConditionValidityStartDate;
        const existingEnd   = existingContract.ConditionValidityEndDate;
        const newStart      = newOffer.ConditionValidityStartDate;
        const newEnd        = newOffer.ConditionValidityEndDate;

        // Case 1: Existing = Tender, New = Tender
        if (existingType === "Tender" && newType === "Tender") {
            return "CREATE_NEW";
        }

        // Case 2: Existing = Commercial Agreement, New = Tender
        if (existingType === "Commercial Agreement" && newType === "Tender") {
            if (newStart <= existingEnd) {
                return "UPDATE_AND_CREATE_NEW"; 
            } else {
                return "CREATE_NEW";
            }
        }

        // Case 3: Existing = Tender, New = Commercial Agreement
        if (existingType === "Tender" && newType === "Commercial Agreement") {
            if (newStart > existingEnd) {
                return "CREATE_NEW";
            } else {
                return "NO_ACTION";
            }
        }

        // Case 4: Existing = Commercial Agreement, New = Commercial Agreement
        if (existingType === "Commercial Agreement" && newType === "Commercial Agreement") {
            if (newStart <= existingEnd) {
                return "UPDATE_AND_CREATE_NEW"; 
            } else {
                return "CREATE_NEW";
            }
        }

        return "CREATE_NEW";
    }

    async function processContractsForCreation(tx, processedData) {
        const { sourceData, case: caseType, contracts } = processedData;
        const newOffer = sourceData[0];

        let lastResponse = null;
        const updatedContracts = [];
        const skippedContracts = [];

        if (caseType === "CASE_1" || caseType === "CASE_3") {
            for (const contract of contracts) {
                const action = decideContractAction(contract, newOffer);

                if (action === "CREATE_NEW") {
                    console.log("Process Invoice Contracts");
                    lastResponse = await createCCMContract(tx, 'ES', "ConditionContract", sourceData);
                } else if (action === "UPDATE_AND_CREATE_NEW") {
                    console.log("Process Update of Existing Contracts");
                    const updated = await updateExistingContract(tx, contract, newOffer);
                    if (updated) {
                        updatedContracts.push(contract.ContractNumber);
                    } else {
                        skippedContracts.push(contract.ContractNumber); 
                    }
                    console.log("Process Invoice Contracts");
                    lastResponse = await createCCMContract(tx, 'ES', "ConditionContract", sourceData);
                }
            }
        } else if (caseType === "NO_MATCH" || caseType === "UNCLASSIFIED") {
            // No previous match → always create new
            console.log("Process Invoice Contracts");
            lastResponse = await createCCMContract(tx, 'ES', "ConditionContract", sourceData);
        }

        return {
            lastResponse: lastResponse || null,
            updatedContracts,
            skippedContracts
        };
    }

    async function updateExistingContract(tx, contract, newOffer) {

        const existingEnd = contract.ConditionValidityEndDate;
        const newStart   = newOffer.ConditionValidityStartDate;

        // Skip update if the contract already ended before the new contract starts
        if (existingEnd < newStart) {
            console.log(`Skipping update: contract ${contract.ContractNumber} ended before new offer start date`);
            return false;
        }
        
        const prevDay = d => new Date(new Date(d).setDate(new Date(d).getDate() - 1)).toISOString().slice(0, 10);

        const response = await handlExistingContract(tx,'ES',"ConditionContract",{ExistingContractNumber: contract.ContractNumber,ExpireDate: prevDay(newOffer.ConditionValidityStartDate)});

        if (response?.status !== 200) {
            throw new Error(`Update of ExistingContract failed for ${contract.ContractNumber}`);
        }

        console.log(`Existing contract ${contract.ContractNumber} updated successfully`);
        await tx.run(UPDATE(CCMContract).with({ CCMContractEndDate: prevDay(newOffer.ConditionValidityStartDate)}).where({ ID: contract.CCMContractID }));

        return true;
    }


    srv.on('createCCMContract', async (req) => {
        const tx = cds.tx(req);
        try {
            const { FastCCMContractId, CCMContractID, ProductCode } = req.data;
            //Expire Existing Contracts
            console.log("Expire Existing Contracts");
            const existingContractInfo = await tx.run(SELECT.from(ExistingContractInfo));
            if(existingContractInfo && existingContractInfo.length > 0){
                for(const info of existingContractInfo){
                    await tx.run(UPDATE(CCMContract).with({ Expired: true}).where({ ID: info.CCMContractID }));
                }
            }
            //Fetch Source Data
            const sourceData = await tx.run(SELECT.from(ContractPayloadView).where({
                CCMContractID: CCMContractID, FastConditionContractID: FastCCMContractId, ProductCode: ProductCode
            }));
            const rebateSourceData = await tx.run(SELECT.from(ContractRebatePayloadView).where({
                CCMContractID: CCMContractID, FastConditionContractID: FastCCMContractId, ProductCode: ProductCode
            }));

            const rebateSettlementData = await tx.run(SELECT.from(SettlementsDate).where({
                CCMContractID: CCMContractID
            }));

            // Skip invoice contract creation if ConditionType is PVL
            const isPVLContract = sourceData.some(d => d.ConditionType === 'PVL');

            //Process Rebate Contracts
            console.log("Process Rebate Contracts");
            const rebatePromise = rebateSourceData.length > 0
                ? Promise.all(
                    rebateSettlementData.map(async (settle) => {
                        const fromDate = settle.FromDate;
                        const toDate = settle.ToDate;
                        const SettlementID = settle.SettlementID;

                        // Pass dates into createRebateContract
                        return createRebateContract(tx,'ES',"ConditionContract",rebateSourceData,{ fromDate, toDate, SettlementID});
                    })
                ) : Promise.resolve([]);

            let invoicePromise = Promise.resolve({ lastResponse: null, updatedContracts: [], skippedContracts: [] });

            if (!isPVLContract) {
                // Preprocess and handle invoice contracts only if not PVL
                const processedData = await preprocessContracts(tx, sourceData);
                invoicePromise = processContractsForCreation(tx, processedData);
            } else {
                console.log("Skipping invoice contract creation (PVL ConditionType detected).");
            }

            //const invoicePromise = createCCMContract(tx, 'ES', "ConditionContract", sourceData);

            const [{ lastResponse: invoiceResult, updatedContracts, skippedContracts }, rebateResponses] = await Promise.all([invoicePromise, rebatePromise]);

            if (invoiceResult) {
                const contractNumber = invoiceResult?.data?.ConditionContract;
                if (contractNumber) {
                    console.log("Payload sent to SAP:", JSON.stringify(typeof invoiceResult?.config?.data === "string" ? JSON.parse(invoiceResult.config.data) : invoiceResult?.config?.data, null, 2));
                    const contractInfo = await tx.run(SELECT.one.from(CCMContract).where({ ID: CCMContractID, ContractNumber: {"!=": null} }));
                    if(contractInfo){
                        await tx.run(UPDATE(CCMContract).with({ PreviousContractNumber: contractInfo.ContractNumber, Expired: false}).where({ ID: CCMContractID }));
                    }
                    await tx.run(UPDATE(CCMContract).with({ ContractNumber: contractNumber, Synchronized: true, Expired: false}).where({ ID: CCMContractID }));
                }

                let bvheaders = invoiceResult?.data?.bvheader || [];
                if (!Array.isArray(bvheaders)) {
                    bvheaders = [bvheaders]; 
                }

                if (bvheaders.length) {
                    const inserts = bvheaders.map((bvh) => ({
                        CCMContract_ID: CCMContractID,
                        ConditionDocument: bvh.ConditionDocument,
                        CustomerID: bvh.customer,
                        FieldCombination: bvh.FieldCombination,
                        ItemGUID: bvh.itemguid,
                        createdAt: new Date(),
                        createdBy: req.user.id,
                    }));

                    await tx.run(INSERT.into(ContractItemGUID).entries(inserts));
                }
                console.log("Invoice response from SAP:", invoiceResult?.data);
            }else{
                console.log("No invoice contract created.");
            }
            // Process Rebate Responses
            if (Array.isArray(rebateResponses)) {
                for (const rebateResp of rebateResponses) {
                    const rebateContractNumber = rebateResp?.data?.ConditionContract;
                    const externalDocRefID = rebateResp?.data?.ExternalDocumentReferenceID;

                    if (rebateContractNumber && externalDocRefID) {
                        // Find the matching settlement row
                        const settlement = rebateSettlementData.find(s => s.SettlementID === externalDocRefID);

                        if (settlement) {
                            await tx.run(
                                UPDATE(SettlementsDate)
                                    .with({ RebateContractNumber: rebateContractNumber, Synchronized: true })
                                    .where({ SettlementID: settlement.SettlementID })
                            );

                            console.log("Rebate payload sent to SAP:", JSON.stringify(typeof rebateResp?.config?.data === "string" ? JSON.parse(rebateResp.config.data) : rebateResp?.config?.data, null, 2));
                            console.log("Rebate response from SAP:", rebateResp?.data);
                        } else {
                            console.warn(`No matching settlement found for ExternalDocumentReferenceID: ${externalDocRefID}`);
                        }
                    }
                }
            }
            // Compose success message
            let invoiceMsg = invoiceResult?.data?.ConditionContract ? `CCM Invoice Contract ${invoiceResult.data.ConditionContract}` : "No Invoice Contract";

            let updatedMsg = updatedContracts.length ? `Updated Contracts: ${updatedContracts.join(", ")}` : "";

            let skippedMsg = skippedContracts.length ? `Skipped Contracts (ended before new offer): ${skippedContracts.join(", ")}` : "";

            let rebateMsg = `${rebateResponses.length} Rebate Contract${rebateResponses.length !== 1 ? "s" : ""}`;

            const successMessage = [invoiceMsg, updatedMsg, skippedMsg, rebateMsg].filter(Boolean).join(" + ");

            return req.reply(`${successMessage} created/updated successfully into SAP`);

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
                const inputPayload =
                    error?.response?.data?.Exception_Details?.InputPayload ||
                    error?.response?.data?.error?.innererror?.errordetails?.[0]?.InputPayload ||
                    null;

                if (inputPayload) {
                    console.error('Input Payload sent to SAP:');
                    console.error(
                    typeof inputPayload === 'string' ? inputPayload : JSON.stringify(inputPayload, null, 2));
                } else {
                    console.error('No InputPayload found in the SAP error response');
                }
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

    function updatePayloadWithDates(payload, fromDate, toDate, SettlementID) {
        // Replace top-level contract dates
        payload.ConditionContract.ConditionContractType.CndnContrValidFrom = fromDate;
        payload.ConditionContract.ConditionContractType.CndnContrValidTo = toDate;
        payload.ConditionContract.ConditionContractType.CndnContrSourceDoc = SettlementID;
        payload.ConditionContract.ConditionContractType.ExternalDocumentReferenceID = SettlementID;

        // Replace in each condition record
        const condRecords = payload.ConditionContract.ConditionContractType._CndnContrCndnRecord?.[1]?.CndnContrConditionRecordType || [];
        condRecords.forEach(rec => { rec.ConditionValidityStartDate = fromDate; 
            rec.ConditionValidityEndDate = toDate;
        });

        return payload;
    }

    async function createRebateContract(tx, countryCode, resource, sourceData, rebateSettlementData) {
        try {
            const apiConfig = await tx.run(SELECT.one.from(APIDefinition).where({ Provider: 'ConditionContract', CountryCode: countryCode, Resource: resource, Name: 'Rebate' }));
            const apiBodyMappings = await tx.run(SELECT.from(APIBody).where({ APIDefinition_ID: apiConfig.ID }));
            if (!apiBodyMappings) {
                throw new Error("ERR_MISSING_PARAMETER:API body Mappings not found");
            }
            let body = buildRebatePayloadFromMappings(sourceData, apiBodyMappings, rebateSettlementData);
            if (!body) {
                throw new Error("ERR_MISSING_PARAMETER:API Body not found");
            }
            // Update dates according to settlement period
            body = updatePayloadWithDates(body, rebateSettlementData.fromDate, rebateSettlementData.toDate, rebateSettlementData.SettlementID);

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

    async function createCCMContract(tx, countryCode, resource, sourceData) {
        try {
            const apiConfig = await tx.run(SELECT.one.from(APIDefinition).where({ Provider: 'ConditionContract', CountryCode: countryCode, Resource: resource, Name: 'InvoicePrice' }));
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

    async function handlExistingContract(tx, countryCode, resource, sourceData) {
        try {
            const apiConfig = await tx.run(SELECT.one.from(APIDefinition).where({ Provider: 'ConditionContract', CountryCode: countryCode, Resource: resource, Name: 'UpdateExistingInvoiceContract' }));
            const apiBodyMappings = await tx.run(SELECT.from(APIBody).where({ APIDefinition_ID: apiConfig.ID }));
            if (!apiBodyMappings) {
                throw new Error("ERR_MISSING_PARAMETER:API body Mappings not found");
            }
            const body = buildExistingUpdatePayloadFromMappings(sourceData, apiBodyMappings);
            if (!body) {
                throw new Error("ERR_MISSING_PARAMETER:API Body not found");
            }
            const oauthAuth = await tx.run(SELECT.one.from(APIConfigOAuth, apiConfig.OAuth_ID));
            const url = `${apiConfig.Host}${apiConfig.BasePath}${apiConfig.ResourcePath}`;

            const oauthCredentials = await getBearerToken(oauthAuth);

            return axios({
                method: 'patch',
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

    function buildExistingUpdatePayloadFromMappings(sourceData, apiBodyMappings) {
        const finalResult = {};

        for (const { Source, Target } of apiBodyMappings) {

            if (Target.endsWith("ConditionContract.ConditionContractType.ConditionContract")) {
                setNestedValue(finalResult, Target, sourceData.ExistingContractNumber);
                continue;
            }

            if (Target.endsWith("ConditionContract.ConditionContractType.CndnContrValidTo")) {
                setNestedValue(finalResult, Target, sourceData.ExpireDate);
                continue;
            }

            setNestedValue(finalResult, Target, "");

        }

        return finalResult;
    }


    function buildRebatePayloadFromMappings(sourceData, apiBodyMappings, rebateSettlementData) {
        const finalResult = {};
        const salesGroupMap = { "Consumer Health": 'CH', Pharma: 'PH', Radiology: 'RD' };
        const scaleTypes = {YAW2: 'D', YAW1: 'A'};

        // split static vs dynamic
        const staticMappings = apiBodyMappings.filter(m => !m.Source.startsWith('ContractRebatePayloadView.'));
        const dynamicMappings = apiBodyMappings.filter(m => m.Source.startsWith('ContractRebatePayloadView.'));

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

        let conditionRecord = { ...staticConditionRecord };
        const conditionRecords = [];
        const bvheaderList = [];

        // --- Build YRA1 from first row only ---
        if (sourceData.length > 0) {
            const firstRow = sourceData[0];
            for (const { Source, Target } of dynamicMappings) {
                const field = Source.replace('ContractRebatePayloadView.', '');
                let value = firstRow[field];
                if (value === undefined || value === null) continue;
                const key = Target.split('.').pop();

                if (Target.includes('CndnContrConditionRecordType')) {
                    conditionRecord[key] = value;
                } else if (Target.includes('bvheader')) {
                    continue;
                } else if (Target.includes('CndnContrConditionRecordScaleType')) {
                    continue;
                } else {
                    setNestedValue(finalResult, Target, value);
                }
            }

            // --- Force YRA1 ---
            conditionRecord.ConditionType = 'YRA1';

            // --- Apply PriceConditionCode to YRA1 ---
            if (firstRow.PriceConditionCode) {
                conditionRecord.PricingScaleType = scaleTypes[firstRow.PriceConditionCode] || firstRow.PriceConditionCode;
            }

            conditionRecords.push(conditionRecord);
        }

        // --- Build YRS1 with scales from ALL rows ---
        const yrs1Record = { ...conditionRecords[0], ConditionType: 'YRS1' };

        // --- Apply MaxDiscount override on YRS1 ---
        if (sourceData[0].MaxDiscount != null) {
            yrs1Record.ConditionRateRatio = Math.round(sourceData[0].MaxDiscount * 100 * 100) / 100;
        }

        // --- Apply PriceConditionCode override on YRS1 ---
        if (sourceData[0].PriceConditionCode) {
            yrs1Record.PricingScaleType = scaleTypes[sourceData[0].PriceConditionCode] || sourceData[0].PriceConditionCode;
        }

        yrs1Record._CndnContrScCndnRecord = [
            "",
            {
                CndnContrConditionRecordScaleType: sourceData.map((sRow, idx) => {
                    const scaleObj = {};
                    for (const { Source, Target } of apiBodyMappings) {
                        if (!Target.includes('CndnContrConditionRecordScaleType')) continue;
                        const key = Target.split('.').pop();
                        if (key === 'ConditionScaleLine') {
                            scaleObj[key] = idx + 1;
                            continue;
                        }
                        if (Source.startsWith('ContractRebatePayloadView.')) {
                            const field = Source.replace('ContractRebatePayloadView.', '');
                            scaleObj[key] = sRow[field] ?? "";
                        } else {
                            scaleObj[key] = Source;
                        }
                    }

                    // --- Apply Discount override on each scale line ---
                    if (sRow.Discount != null) {
                        scaleObj.ConditionRateRatio = Math.round(sRow.Discount * 100 * 100) / 100;
                    }

                    // --- Apply PriceConditionCode override on each scale line ---
                    if (sRow.PriceConditionCode) {
                        scaleObj.PricingScaleType = scaleTypes[sRow.PriceConditionCode] || sRow.PriceConditionCode;
                    }

                    return scaleObj;
                })
            }
        ];

        conditionRecords.push(yrs1Record);

        // --- Fields to remove ---
        const removeFromYRA1Only = [
            'PricingScaleBasis',
            'CndnScaleQuantityUnitISOCode',
            'ConditionScaleQuantityUnit'
            //'ConditionRateRatio'
        ];

        const removeFromBoth = [
            'ConditionScaleLine',
            'CndnScaleQuantityUnitSAPCode',
            'ConditionRateRatioUnitSAPCode',
            'ConditionScaleQuantity'
        ];

        // --- Cleanup YRA1 ---
        [...removeFromYRA1Only, ...removeFromBoth].forEach(f => delete conditionRecords[0][f]);

        // --- Cleanup YRS1 ---
        removeFromBoth.forEach(f => delete conditionRecords[1][f]);

            // --- BV headers ---
        const bvheaderEntry = { ...staticBVHeader };
        for (const { Source, Target } of dynamicMappings) {
            if (!Target.includes('bvheader')) continue;
            const field = Source.replace('ContractRebatePayloadView.', '');
            let value = sourceData[0][field];
            if (value === undefined || value === null) continue;
            const key = Target.split('.').pop();
            bvheaderEntry[key] = value;
        }

        if (sourceData[0].AssortmentReference) {
            bvheaderEntry['FieldCombination'] = 'Y002';
            delete bvheaderEntry['customer'];

            bvheaderList.push(bvheaderEntry);

            bvheaderList.push({
                FieldCombination: "Y047",
                ConditionDocument: "",
                incl_excl: "I",
                EANUPCCode: sourceData[0].EANUPCCode
            });
        }else {
            bvheaderEntry['FieldCombination'] = 'Y001';

            bvheaderList.push(bvheaderEntry);

            bvheaderList.push({
                FieldCombination: "Y047",
                ConditionDocument: "",
                incl_excl: "I",
                EANUPCCode: sourceData[0].EANUPCCode
            });
        }

        for (const { Source, Target } of dynamicMappings) {
            const field = Source.replace('ContractRebatePayloadView.', '');
            let value = sourceData[0][field];

            if (value === undefined || value === null) continue;

            if (field === 'Division' && Target === 'ConditionContract.ConditionContractType.SalesGroup') {
                value = salesGroupMap[value] || value;
                setNestedValue(finalResult, Target, value);
                continue;
            }

            if (field === 'SAPID' && Target === 'ConditionContract.ConditionContractType.CndnContrSourceDoc') {
                if(sourceData[0].ContractType.toLowerCase() === 'tender'){
                    value = "CO-".concat(sourceData[0].Reference.replace(/ /g,'-'));
                }
                // Commercial Agreement
                if(sourceData[0].ContractType.toLowerCase() === 'commercial agreement'){
                    value = "OF-".concat(sourceData[0].TenderID); 
                }
                setNestedValue(finalResult, Target, value);
                continue;
            }

            if (field === 'SAPID' && Target === 'ConditionContract.ConditionContractType.ExternalDocumentReferenceID') {
                if(sourceData[0].ContractType.toLowerCase() === 'tender'){
                    value = "CO-".concat(sourceData[0].Reference.replace(/ /g,'-'));
                }
                // Commercial Agreement
                if(sourceData[0].ContractType.toLowerCase() === 'commercial agreement'){
                    value = "OF-".concat(sourceData[0].TenderID); 
                }
                setNestedValue(finalResult, Target, value);
                continue;
            }
        }

        if (sourceData[0].AssortmentReference) {
            finalResult.ConditionContract.ConditionContractType.CndnContrType = 'YR04';
            finalResult.ConditionContract.ConditionContractType.CndnContrProcVar = 'YR04';
        }else {
            delete finalResult.ConditionContract.ConditionContractType.Customer;
        }
        
        // --- Final assembly ---
        if (conditionRecords.length > 0) {
            setNestedValue(finalResult, 'ConditionContract.ConditionContractType._CndnContrCndnRecord', [
                "",
                { CndnContrConditionRecordType: conditionRecords }
            ]);
        }

        setNestedValue(finalResult, 'ConditionContract.conditioncontract', {
            "MarketIncentiveID": sourceData[0]?.MarketIncentiveID || "10.10.730.40"
        });

        if (bvheaderList.length > 0) {
            setNestedValue(finalResult, 'ConditionContract.bvheader', bvheaderList);
        }

        return finalResult;
    }



    function buildPayloadFromMappings(sourceData, apiBodyMappings) {
        const finalResult = {};

        const salesGroupMap = { "Consumer Health": 'CH', Pharma: 'PH', Radiology: 'RD' };
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

                if (field === 'SAPID' && Target === 'ConditionContract.ConditionContractType.CndnContrSourceDoc') {
                    if(row.ContractType.toLowerCase() === 'tender'){
                        value = "CO-".concat(row.Reference.replace(/ /g,'-'));
                    }
                    // Commercial Agreement
                    if(row.ContractType.toLowerCase() === 'commercial agreement'){
                        value = "OF-".concat(row.TenderID); 
                    }
                    setNestedValue(finalResult, Target, value);
                    continue;
                }

                if (field === 'SAPID' && Target === 'ConditionContract.ConditionContractType.ExternalDocumentReferenceID') {
                    if(row.ContractType.toLowerCase() === 'tender'){
                        value = "CO-".concat(row.Reference.replace(/ /g,'-'));
                    }
                    // Commercial Agreement
                    if(row.ContractType.toLowerCase() === 'commercial agreement'){
                        value = "OF-".concat(row.TenderID); 
                    }
                    setNestedValue(finalResult, Target, value);
                    continue;
                }

                if (field === 'ConditionType' && Target.includes('ConditionType')) {
                    conditionTypeValue = conditionTypeMap[value] || value;
                    value = conditionTypeValue;
                }

                if (field === 'YD02' && Target.endsWith('ConditionRateRatio')) {
                    value = Math.round(value * 100 * 100) / 100;
                }

                if (field === 'YP10' && Target.endsWith('ConditionRateAmount')) {
                    if(row.UoM === 'Pack'){
                        value = value * 10000;
                    } else {
                        value = value * row.PackFactor * 10000;
                    }
                }

                const pathSegments = Target.split('.');
                const key = pathSegments[pathSegments.length - 1];

                if (Target.includes('CndnContrConditionRecordType')) {
                    if (conditionTypeValue === 'YP10') {
                        conditionRecord['ConditionCalculationType'] = 'C';
                        conditionRecord['ConditionQuantityUnit'] = 'PC';
                        conditionRecord['ConditionQuantityUnitISOCode'] = 'PCE';
                        conditionRecord['ConditionQuantity'] = 10000;
                    }
                    conditionRecord[key] = value;
                } else if (Target.includes('bvheader')) {
                    bvheaderEntry[key] = value;
                } else {
                    setNestedValue(finalResult, Target, value);
                }
            }

            if (Object.keys(conditionRecord).length > 0) {
                if (conditionRecord.ConditionType === 'YD02') {
                    delete conditionRecord.ConditionRateAmount;
                }
                if (conditionRecord.ConditionType === 'YP10') {
                    delete conditionRecord.ConditionRateRatioUnit;
                    delete conditionRecord.ConditionRateRatio;
                    delete conditionRecord.ConditionRateRatioUnitISOCode;
                }
                conditionRecords.push(conditionRecord);
            }
            
            if (row.AssortmentReference) {
                bvheaderEntry['FieldCombination'] = 'Y002';
                delete bvheaderEntry['customer'];
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
                delete royalDecreeRecord['ConditionRateAmount'];
                conditionRecords.push(royalDecreeRecord);
            }
        }

        if (conditionRecords.length > 0) {
            setNestedValue(finalResult, 'ConditionContract.ConditionContractType._CndnContrCndnRecord', [
                "",
                { CndnContrConditionRecordType: conditionRecords }
            ]);
        }

        setNestedValue(finalResult, 'ConditionContract.conditioncontract', {});

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
            console.log("Expire Existing Contracts");
            // --- EXPIRE existing contracts (applies to all products) ---
            const existingContractInfo = await tx.run(SELECT.from(ExistingContractInfo));
            if (existingContractInfo && existingContractInfo.length > 0) {
                for (const info of existingContractInfo) {
                    await tx.run(UPDATE(CCMContract).with({ Expired: true }).where({ ID: info.CCMContractID }));
                }
            }

            const sourceData = await tx.run(SELECT.from(ContractPayloadView).where({
                 FastConditionContractID: FastCCMContractId
            }));

            const rebateSourceData = await tx.run(SELECT.from(ContractRebatePayloadView).where({
                FastConditionContractID: FastCCMContractId
            }));

            const rebateContractIDs = [...new Set(rebateSourceData.map(item => item.CCMContractID))];

            const rebateSettlementData = await tx.run(SELECT.from(SettlementsDate).where({
                CCMContractID: {in: rebateContractIDs}
            }));

            console.log("Process Rebate Contracts");
            const rebatePromise = rebateSourceData.length > 0
            ? Promise.all(rebateSettlementData.map(async (settle) => {
                const fromDate = settle.FromDate;
                const toDate = settle.ToDate;
                const SettlementID = settle.SettlementID;

                const filteredRebateData = rebateSourceData.filter(r => r.CCMContractID === settle.CCMContractID);

                // Pass dates into createRebateContract
                return createRebateContract(
                    tx,
                    'ES',
                    "ConditionContract",
                    filteredRebateData,
                    { fromDate, toDate, SettlementID }
                );
            })) : Promise.resolve([]);


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

            const invoicePromises = grouped.map(async (group) => {
                const CCMContractID = group[0].CCMContractID;

                // Skip invoice contract creation if PVL (any row in the group)
                const isPVLContract = group.some(d => d.ConditionType === 'PVL');
                if (isPVLContract) {
                    console.log(`Skipping CCMContractID ${CCMContractID}: PVL ConditionType detected.`);
                    return { lastResponse: null, updatedContracts: [], skippedContracts: [] };
                }

                // Preprocess and process creation (these helpers should return an object:
                // { lastResponse, updatedContracts: [], skippedContracts: [] })
                const processedData = await preprocessContracts(tx, group);
                return processContractsForCreation(tx, processedData);
            });
            
            const [invoiceResponses, rebateResponses] = await Promise.all([
                Promise.all(invoicePromises),
                rebatePromise
            ]);

            const updatedContractsAll = [];
            const skippedContractsAll = [];
            let invoiceCount = 0;
            
            for (let i = 0; i < invoiceResponses.length; i++) {
                const result = invoiceResponses[i] || { lastResponse: null, updatedContracts: [], skippedContracts: [] };
                const invoiceResult = result.lastResponse;
                const updatedContracts = result.updatedContracts || [];
                const skippedContracts = result.skippedContracts || [];
                const contractGroup = grouped[i];
                const CCMContractID = contractGroup[0].CCMContractID;

                // collect for final message
                updatedContractsAll.push(...updatedContracts);
                skippedContractsAll.push(...skippedContracts);

                if (invoiceResult) {
                    const contractNumber = invoiceResult?.data?.ConditionContract;
                    if (contractNumber) {
                        invoiceCount++;
                        console.log(`Payload sent to SAP (CCMContractID: ${CCMContractID}):`, JSON.stringify(JSON.parse(invoiceResult?.config?.data), null, 2));
                        const contractInfo = await tx.run(SELECT.one.from(CCMContract).where({ ID: CCMContractID, ContractNumber: { "!=": null } }));
                        if (contractInfo) {
                            await tx.run(UPDATE(CCMContract).with({ PreviousContractNumber: contractInfo.ContractNumber, Expired: false }).where({ ID: CCMContractID }));
                        }
                        await tx.run(UPDATE(CCMContract).with({ ContractNumber: contractNumber, Synchronized: true, Expired: false }).where({ ID: CCMContractID }));
                    }

                    let bvheaders = invoiceResult?.data?.bvheader || [];
                    if (!Array.isArray(bvheaders)) bvheaders = [bvheaders];

                    if (bvheaders.length) {
                        const inserts = bvheaders.map((bvh) => ({
                            CCMContract_ID: CCMContractID,
                            ConditionDocument: bvh.ConditionDocument,
                            CustomerID: bvh.customer,
                            FieldCombination: bvh.FieldCombination,
                            ItemGUID: bvh.itemguid,
                            createdAt: new Date(),
                            createdBy: req.user.id,
                        }));
                        await tx.run(INSERT.into(ContractItemGUID).entries(inserts));
                    }

                    console.log("Invoice response from SAP:", invoiceResult?.data);
                    if (updatedContracts.length) console.log("Updated Contracts:", updatedContracts);
                    if (skippedContracts.length) console.log("Skipped Contracts:", skippedContracts);
                }else {
                    console.log(`No invoice contract created for CCMContractID: ${CCMContractID}`);
                }
            }

            // --- Handle rebate responses
            if (Array.isArray(rebateResponses)) {
                for (const rebateResp of rebateResponses) {
                    const rebateContractNumber = rebateResp?.data?.ConditionContract;
                    const externalDocRefID = rebateResp?.data?.ExternalDocumentReferenceID;
                    if (rebateContractNumber && externalDocRefID) {
                        const settlement = rebateSettlementData.find(s => s.SettlementID === externalDocRefID);
                        if (settlement) {
                            await tx.run(
                                UPDATE(SettlementsDate)
                                    .with({ RebateContractNumber: rebateContractNumber, Synchronized: true })
                                    .where({ SettlementID: settlement.SettlementID })
                            );
                            console.log("Rebate payload sent to SAP:", JSON.stringify(rebateResp?.config?.data, null, 2));
                            console.log("Rebate response from SAP:", rebateResp?.data);
                        } else {
                            console.warn(`No matching settlement found for ExternalDocumentReferenceID: ${externalDocRefID}`);
                        }
                    }
                }
            }

            let invoiceMsg = invoiceResult?.data?.ConditionContract ? `CCM Invoice Contract ${invoiceResult.data.ConditionContract}` : "No Invoice Contract";

            let updatedMsg = updatedContracts.length ? `Updated Contracts: ${updatedContracts.join(", ")}` : "";

            let skippedMsg = skippedContracts.length ? `Skipped Contracts (ended before new offer): ${skippedContracts.join(", ")}` : "";

            let rebateMsg = `${rebateResponses.length} Rebate Contract${rebateResponses.length !== 1 ? "s" : ""}`;

            const successMessage = [invoiceMsg, updatedMsg, skippedMsg, rebateMsg].filter(Boolean).join(" + ");

            return req.reply(`${successMessage} created/updated successfully into SAP`);
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
                const inputPayload =
                    error?.response?.data?.Exception_Details?.InputPayload ||
                    error?.response?.data?.error?.innererror?.errordetails?.[0]?.InputPayload ||
                    null;

                if (inputPayload) {
                    console.error('Input Payload sent to SAP:');
                    console.error(
                    typeof inputPayload === 'string' ? inputPayload : JSON.stringify(inputPayload, null, 2));
                } else {
                    console.error('No InputPayload found in the SAP error response');
                }
            } else if (error.code && error.message) {
                console.error("App Error:", error.message);
                userMessage = error.message;
                statusCode = typeof error.code === 'number' ? error.code : 500;
            } else {
                console.error("Unhandled Error:", error);
            }

            return req.reject(statusCode, userMessage);
        }
    });

    srv.after("READ", "BrandsView", (data) => {
        data.unshift({
            BrandID: "All_Brands",
            BrandName: "All"
        });
    });

    srv.after("READ", "BrandProductsView", (data) => {
        if (data && data.length > 0) {
            const deduped = Array.from(
                new Map(data.map(item => [item.ProductCode, item])).values()
            );

            // clear original array and push deduped items back
            data.splice(0, data.length, ...deduped);
        }

        data.unshift({
            BrandID: "All_Brands",
            ProductCode: "All_Products",
            ProductName: "All"
        });
    });

    async function getUserCountries() {
        const fastbackendAPI = await cds.connect.to("FASTBACKEND_API");
        const response = await fastbackendAPI.send({
            method: 'GET',
            path: `/v2/conditioncontracting/getUserCountries`
        });

        const userCountries = response?.d?.userCountries || [];
        return userCountries.map(item => ({
            ...item
        }));
    }

    srv.on('getESUsers', async (req) => {
        const tx = cds.tx(req);
        try {
            const userCountries = await getUserCountries();
            const grouped = userCountries.reduce((acc, user) => {
                const { CWID, CountryCode } = user;
                acc[CWID] = acc[CWID] || { entries: [] };
                acc[CWID].entries.push(user);
                acc[CWID].countries = acc[CWID].entries.map(e => e.CountryCode);
                return acc;
            }, {});

            // Keep users who have exactly one country and it's 'ES'
            const exclusiveESUsers = Object.values(grouped).filter(g => g.countries.length === 1 && g.countries[0] === 'ES').flatMap(g => g.entries);

            return exclusiveESUsers;

        }catch(error){
                return req.reject(403, "Failed to fetch user countries")
        }
    });

    srv.on('terminateCCMContract', async (req) => {
        const tx = cds.tx(req);
        try {
            const { FastCCMContractId, CCMContractID, ProductCode, TerminationDate, CancellationNote } = req.data;
            
            const sourceData = await tx.run(SELECT.from(CCMContract).where({ID: CCMContractID}));
            console.log("Process Terminate Contracts");
            const response = await handlExistingContract(tx, 'ES', "ConditionContract", {ExistingContractNumber: sourceData.ContractNumber,ExpireDate: TerminationDate});
            
            if (response?.status !== 200) {
                throw new Error(`Termination of ExistingContract failed for ${sourceData.ContractNumber}`);
            }

            console.log(`Contract ${sourceData[0].ContractNumber} terminated successfully. End date updated to ${TerminationDate} in SAP.`);
            await tx.run(UPDATE(CCMContract).with({ CCMContractEndDate: TerminationDate, CancellationComment: CancellationNote, Cancelled: true}).where({ ID: CCMContractID }));

            return req.reply(`Contract ${sourceData[0].ContractNumber} terminated successfully. End date updated to ${TerminationDate} in SAP.`);

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
                const inputPayload =
                    error?.response?.data?.Exception_Details?.InputPayload ||
                    error?.response?.data?.error?.innererror?.errordetails?.[0]?.InputPayload ||
                    null;

                if (inputPayload) {
                    console.error('Input Payload sent to SAP:');
                    console.error(
                    typeof inputPayload === 'string' ? inputPayload : JSON.stringify(inputPayload, null, 2));
                } else {
                    console.error('No InputPayload found in the SAP error response');
                }
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


    srv.on("getSAPSalesOrderSimulation", async (req) => {
        const tx = cds.tx(req);

        try {
            const { CCMContractID } = req.data;
            const ccmContract = await tx.run(SELECT.one.from(CCMContract).columns('*', 'CCMCustomer.CustomerID').where({ ID: CCMContractID }));
            const material = await tx.run(SELECT.one.from(CCMMaterial).columns('MaterialNumber').where({
                    CCMContract_ID: CCMContractID, // adjust FK name to your model
                    ActiveRecord: 1
                })
            );
            const currentInvoicePrice = await tx.run(SELECT.one.from(CurrentInvoicePrice).where({
                CCMContract_ID: req.data.CCMContractID
            }));

            if (!ccmContract || !material) return req.reject(404, "Contract is not found");

            const body = updateSAPSalesOrderSimulationRequestBody(ccmContract?.CCMCustomer_CustomerID , material?.MaterialNumber);
            const response = await getSAPSalesOrderSimulation(tx, ccmContract?.CountryCode, "SalesOrderSimulation", body);

            const pricingElements = response.data.d.to_Item.results[0].to_PricingElement.results;
            if (!pricingElements) {
                return req.reject(404, "No Pricing Exist in SAP");
            }
            
            const mappedData = mapPricingElementsToDbFormat(pricingElements, CCMContractID, ccmContract?.CCMCustomer_CustomerID , material?.MaterialNumber, ccmContract?.CountryCode, ccmContract?.PackFactor, ccmContract?.UoM);

            if (!mappedData.ConditionType) {
                return req.reject(422, "SAP response does not match any FAST ConditionType");
            }
            
            if(currentInvoicePrice){
                await tx.run(UPDATE(CurrentInvoicePrice).with(mappedData).where({ID: currentInvoicePrice.ID}));
            }else{
                await tx.run(INSERT.into(CurrentInvoicePrice).entries(mappedData));
            }

            return req.reply("Current Pricing were received from SAP");
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

    function updateSAPSalesOrderSimulationRequestBody (customerID, materialNumber) {
        let body = getSAPSalesOrderSimulationRequestBody();
        if (!body) {
            return false;
        }

		body["SoldToParty"] = customerID;
        body["to_Item"][0]["Material"] = materialNumber;
        return body;
    }

    async function getSAPSalesOrderSimulation (tx, countryCode, resource, body) {
        const apiConfig = await tx.run(SELECT.one.from(APIDefinition).where({ Provider: 'SAPSalesOrderSimulation', CountryCode: countryCode, Resource: resource, Name: 'SAPSalesOrderSimulation' }));
        const oauthAuth = await tx.run(SELECT.one.from(APIConfigOAuth, apiConfig.OAuth_ID));
        if (!oauthAuth) {
            throw new Error("ERR_MISSING_PARAMETER:API body Mappings not found");
        }

        if (!body) {
            throw new Error("ERR_MISSING_PARAMETER:body");
        }
        

        const url = `${apiConfig?.Host}${apiConfig?.BasePath}${apiConfig?.ResourcePath}`;

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

    function mapPricingElementsToDbFormat(pricingElements, CCMContractID, customerID, materialNumber, countryCode, packFactor, UoM) {
		const result = {
            ConditionType: null,
            Currency: "EUR",
            CountryCode: countryCode,
            SoldToParty: customerID,
            Material: materialNumber,
            YP00: 0,
            YP04: 0,
            YP10: null,
            YD75: null,
            YD30: 0,
            YD06: 0,
            YD02: 0,
            SapTax: 0,
            Tax: 0,
            ConfidentialPrice: 0,
            RoyalDecree: "No",
            RoyalDecreeValue: 0,
            RoyalDecreeIncl: true,
            NetPriceWithoutTaxAfterDeductionRD: null,
            NetPriceWithTaxAfterDeductionRD: null,
            NetPriceWithoutTax: null,
            NetPriceWithTax: null,
            CCMContract_ID: CCMContractID
		};
	
		const conditions = {};
	
		// Iterate through the pricing elements to collect necessary conditions
		for (const elem of pricingElements) {
            const { ConditionType, PricingProcedureStep, ConditionRateValue, ConditionAmount, ConditionQuantity } = elem;
	
            if (ConditionType) {
                conditions[ConditionType] = {
                    ConditionRateValue: parseFloat(ConditionRateValue || 0),
                    ConditionAmount: parseFloat(ConditionAmount || 0),
                    ConditionQuantity: parseFloat(ConditionQuantity || 1) 
                };
            }
        
            // Handle PricingProcedureStep-specific values
            if (PricingProcedureStep === "330") {
                result.SAPTAX = parseFloat(ConditionRateValue) / 10000 || 0;
            }
        
            if (PricingProcedureStep === "332") {
                // if(conditions["YP10"]){
                // 	result.SAPPriceWithTax = parseFloat((ConditionAmount * conditions["YP10"]?.ConditionQuantity) || 0);
                // }else{
                // 	result.SAPPriceWithTax = parseFloat(ConditionAmount || 0);
                // }
                result.SAPPriceWithTax = parseFloat(ConditionRateValue || 0);
            }

            if (PricingProcedureStep === "306") {
                result.NETPRICEWITHOUTTAX = parseFloat(ConditionAmount || 0);
            }
		}
	
		// Assign the condition values
		const YP00 = conditions["YP00"]?.ConditionRateValue || 0;
		const YP04 = conditions["YP04"] ? Math.abs(conditions["YP04"].ConditionRateValue) / 100 : 0;
		const YP10 = conditions["YP10"]?.ConditionRateValue ?? null;
		const YD02 = conditions["YD02"] ? Math.abs(conditions["YD02"].ConditionRateValue) / 100 : 0;
		const YD06 = conditions["YD06"] ? Math.abs(conditions["YD06"].ConditionRateValue) / 100 : 0;
		const YD75 = conditions["YD75"]?.ConditionAmount ?? null;
		const YD30 = conditions["YD30"]?.ConditionRateValue ?? 0;
	
		

		result.YP00 = YP00 ? UoM === 'Pack' ? YP00 : (YP00 / packFactor) : 0;
		result.YP04 = YP04;
		result.ConfidentialPrice = YP04 ? result.YP00 * (1 - YP04) : result.YP00;
		result.YD02 = YD02;
		result.RoyalDecree = YD06 ? "Yes" : "No";
		result.YD06 = YD06;

		result.RoyalDecreeIncl = YD06 ? false : true;
		result.YD30 = YD30;
		result.YP10 = YP10 ? UoM === 'Pack' ? (YP10 / 10000) : (YP10 / 10000 / packFactor) : null;
		result.RoyalDecreeValue = YD06 && YP10 ? YD06 * result.YP10 : 0;

		const useConfidential = YP04 !== 0;
		const basePrice = useConfidential ? result.ConfidentialPrice : result.YP00;

		result.YD75 = (basePrice - result.YP10) / basePrice;
	
		// Mapped values for NETPRICE fields
		result.NetPriceWithoutTaxAfterDeductionRD = result.YP10 ? (YD06 ? result.YP10 * (1 - YD06) : result.YP10) : null;
		result.NetPriceWithTaxAfterDeductionRD = (YD02 || YD30) ? result.SAPPriceWithTax : null;
		result.NetPriceWithoutTax = YD02 ? result.ConfidentialPrice * (1 - result.YD02) * (1 - result.YD06) : null;  
		result.NetPriceWithTax = result.SAPPriceWithTax;
	
		// Determine the condition type
		if (YP10) {
			result.ConditionType = "PrecioNeto";
		} else if (YD02) {
			result.ConditionType = "DescuentoComercial";
		} else if (YP00) {
			result.ConditionType = "PVL";
		} else {
			result.ConditionType = null;
		}
	
		return result;
	}

    function getSAPSalesOrderSimulationRequestBody () {
        return {
			"SalesOrderType": "YCOR",
			"SalesOrganization": "QFHC",
			"SoldToParty": "900000352",
			"to_Pricing": {},
			"to_Item": [
				{
					"Material": "66040304",
					"RequestedQuantity": "10000",
					"to_PricingElement": []
				}
			]
		}
    }

    srv.on("ignoreCurrentCCMPrice", async (req) => {
        const tx = cds.tx(req);
        try { 
            const { CCMContractID } = req.data;
            const currentCCMPrice = await tx.run(SELECT.one.from(CurrentInvoicePrice).where({ CCMContract_ID: CCMContractID }));
            const contract = await tx.run(SELECT.one.from(CCMContract).columns("*", "FastConditionContracts.OfferID").where({ ID: CCMContractID }));
            
            if (!currentCCMPrice || !contract) return req.reject(404, "Current contract price is not found");

            const mappedCurrentCCMPrice = mapCurrentCCMPrice(currentCCMPrice);

            if (mappedCurrentCCMPrice) {
                await tx.run(UPDATE(PriceConditionInvoice).with(mappedCurrentCCMPrice).where({ 
                    OfferID: contract.FastConditionContracts_OfferID,
                    ProductCode: contract.ProductCode
                 }));
            }
            return "Current CCM price applied successfully."
        } catch (error) {
            let statusCode = 500;
            let userMessage = "Unexpected server error. Please contact the application support team.";
            
            if (error.code && error.message) {
                console.error("App Error:", error.message);
                userMessage = error.message;
                statusCode = typeof error.code === 'number' ? error.code : 500;
            }				
            else {
                console.error("Unhandled Error:", error);
            }
            
            return req.reject(statusCode, userMessage);
        }
    })

    function mapCurrentCCMPrice (pricing) {
        return {
            ConditionType: pricing.ConditionType,
            YP00: pricing.YP00,
            YP04: pricing.YP04,
            YP10: pricing.YP10,
            YD75: pricing.YD75,
            YD30: pricing.YD30,
            YD06: pricing.YD06,
            YD02: pricing.YD02,
            SapTax: pricing.SapTax,
            Tax: pricing.Tax,
            ConfidentialPrice: pricing.ConfidentialPrice,
            RoyalDecree: pricing.RoyalDecree,
            RoyalDecreeValue: pricing.RoyalDecreeValue,
            RoyalDecreeIncl: pricing.RoyalDecreeIncl,
            NetPriceWithoutTaxAfterDeductionRD: pricing.NetPriceWithoutTaxAfterDeductionRD,
            NetPriceWithTaxAfterDeductionRD: pricing.NetPriceWithTaxAfterDeductionRD,
            NetPriceWithoutTax: pricing.NetPriceWithoutTax,
            NetPriceWithTax: pricing.NetPriceWithTax
        }
    }

    srv.on('getUserCountries', async (req) => {
        const tx = cds.tx(req);
        try {
            let userCountries = await getUserCountries();
            // Filter for the logged-in user's CWID
            userCountries = userCountries.filter((c) => c.CWID === req.user.id);

            return userCountries;
        }catch(error){
            return req.reject(403, "Failed to fetch user countries")
        }
    });
};
