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
    CurrentInvoicePrice,
    CustomerHierarchy,
    ConditionContractsLog,
    ContractNewMaterialNumberPayloadView
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

    const API_CONFIG_TTL = 7 * 24 * 60 * 60 * 1000;    // 7 days - Config rarely changes
    const INSTITUTE_TTL  = 24 * 60 * 60 * 1000;        // 24 hours - Daily refresh sufficient
    const TOKEN_BUFFER   = 60 * 1000;                  // 1 min before expiry
    const OAUTH_FALLBACK = 30 * 60 * 1000;             // 30 min fallback
    
    let instituteCache = null;
    let lastFetchTime = 0;
    const apiConfigCache = new Map();
    const apiBodyCache = new Map();
    const oauthTokenCache = new Map();

    async function getOrCacheAPIConfig(tx, provider, countryCode, resource, name) {
        const key = `${provider}:${countryCode}:${resource}:${name}`;
        const cached = apiConfigCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp < API_CONFIG_TTL)) {
            return cached.data;
        }
        
        const apiConfig = await tx.run(
            SELECT.one.from(APIDefinition).where({
                Provider: provider,
                CountryCode: countryCode,
                Resource: resource,
                Name: name
            })
        );
        
        if (apiConfig) {
            apiConfigCache.set(key, {
                data: apiConfig,
                timestamp: Date.now()
            });
        }
        
        return apiConfig;
    }

    async function getOrCacheAPIBody(tx, apiDefId) {
        const cached = apiBodyCache.get(apiDefId);
        
        if (cached && (Date.now() - cached.timestamp < API_CONFIG_TTL)) {
            return cached.data;
        }
        
        const data = await tx.run(
            SELECT.from(APIBody).where({ APIDefinition_ID: apiDefId })
        );
        
        apiBodyCache.set(apiDefId, {
            data: data,
            timestamp: Date.now()
        });
        
        return data;
    }
    
    async function getOrCacheOAuthToken(tx, oauthId, countryCode) {
        const key = `oauth:${oauthId}:${countryCode}`;
        const cached = oauthTokenCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp < cached.ttl)) {
            return cached.data;
        }
        
        const oauthAuth = await tx.run(
            SELECT.one.from(APIConfigOAuth, oauthId)
        );
        
        const oauthCredentials = await getBearerToken(oauthAuth);
        const accessToken = oauthCredentials.data.access_token;
        
        const expiresInMs = (oauthCredentials.data.expires_in || OAUTH_FALLBACK / 1000) * 1000;
        const safeTTL = Math.max(expiresInMs - TOKEN_BUFFER, 60 * 1000);
        
        oauthTokenCache.set(key, {
            data: accessToken,
            timestamp: Date.now(),
            ttl: safeTTL
        });
        
        return accessToken;
    }

    async function fetchInstituteData() {
        const now = Date.now();
        
        if (instituteCache && (now - lastFetchTime < INSTITUTE_TTL)) {
            return instituteCache;
        }
        
        const fastbackendAPI = await cds.connect.to("FASTBACKEND_API");
        const response = await fastbackendAPI.send({
            method: 'GET',
            path: `/v2/conditioncontracting/getInstituteData`
        });
        
        instituteCache = response?.d?.candidateInstituteData || [];
        lastFetchTime = now;
        
        return instituteCache;
    }

    async function preprocessContracts(tx, sourceData) {

        const candidates = await fetchInstituteData();

        const [contracts, customerHierarchy] = await Promise.all([
            tx.run(SELECT.from(IdentifyExistingContract)),
            tx.run(SELECT.from(CustomerHierarchy))
        ]);

        const candidateMap = new Map();

        for (const c of candidates) {
            const keys = [
                String(c.CandidateInstituteID).trim(),
                String(c.BaseInstituteID).trim()
            ];

            for (const key of keys) {
                if (!candidateMap.has(key)) {
                    candidateMap.set(key, []);
                }
                candidateMap.get(key).push(c);
            }
        }

        const enrichedContracts = contracts.flatMap(contract => {
            const matches = candidateMap.get(String(contract.InstituteID).trim()) || [];

            return matches.map(match => ({
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

        return classifyContracts(sourceData, uniqueContracts, customerHierarchy);
        
    }
  
    function classifyContracts(sourceData, enrichedContracts, customerHierarchy) {
        if (!sourceData.length) return [];

        const newOffer = sourceData[0];
        const { ProductCode, InstituteID, AssortmentReference } = newOffer;

        // Filter once, reuse throughout
        const relevantContracts = enrichedContracts.filter(c => c.ProductCode === ProductCode);

        if (relevantContracts.length === 0) {
            return [{ sourceData, case: "NO_MATCH" }];
        }

        // Pre-build hierarchy lookup for access instead of repeated filters
        const hierarchyByInstitute = new Map();
        const hierarchyByParent = new Map();

        customerHierarchy.forEach(h => {
            if (h.InstituteID) {
                if (!hierarchyByInstitute.has(h.InstituteID)) {
                    hierarchyByInstitute.set(h.InstituteID, []);
                }
                hierarchyByInstitute.get(h.InstituteID).push(h);
            }

            if (h.ParentInstituteID) {
                if (!hierarchyByParent.has(h.ParentInstituteID)) {
                    hierarchyByParent.set(h.ParentInstituteID, []);
                }
                hierarchyByParent.get(h.ParentInstituteID).push(h);
            }
        });

        const results = [];

        // CASE_1 and CASE_2 only apply when the incoming offer has NO
        // AssortmentReference. When AssortmentReference is present, only
        // CASE_3 / CASE_5 are relevant classifications.
        if (!AssortmentReference) {
            // CASE 1: Single-customer with matching candidate + base
            const case1Contracts = relevantContracts.filter(
                c => c.candidateInstitute === InstituteID && c.baseInstitute === InstituteID
            );
            if (case1Contracts.length) {
                results.push({ sourceData, case: "CASE_1", contracts: case1Contracts });
            }

            // CASE 2: Child with existing parent contract
            const hierarchyCase2 = hierarchyByInstitute.get(String(InstituteID));
            if (hierarchyCase2) {
                const childIDs = new Set(hierarchyCase2.map(h => h.InstituteID));
                const case2Contracts = relevantContracts.filter(
                    c => c.AssortmentReference !== null &&
                        c.candidateType === "CHILD" &&
                        childIDs.has(String(c.candidateInstitute))
                );
                if (case2Contracts.length) {
                    results.push({ sourceData, case: "CASE_2", contracts: case2Contracts });
                }
            }
        }

        // CASE 3 & 5: Only check if AssortmentReference exists
        if (AssortmentReference) {
            // CASE 3: Assortment reference matches
            const case3Contracts = relevantContracts.filter(
                c => c.AssortmentReference === AssortmentReference
            );
            if (case3Contracts.length) {
                results.push({ sourceData, case: "CASE_3", contracts: case3Contracts });
            }

            // CASE 5: Parent with child contracts
            const hierarchyCase5 = hierarchyByParent.get(String(InstituteID));
            if (hierarchyCase5) {
                const childIDs = new Set(hierarchyCase5.map(h => h.InstituteID));
                const case5Contracts = relevantContracts.filter(
                    c => childIDs.has(String(c.InstituteID))
                );
                if (case5Contracts.length) {
                    results.push({ sourceData, case: "CASE_5", contracts: case5Contracts });
                }
            }
        }

        // Fallback: unclassified
        if (results.length === 0) {
            results.push({ sourceData, case: "UNCLASSIFIED", contracts: relevantContracts });
        }

        return results;
    }

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
            } else if(newStart < existingStart && newEnd < existingStart){
                return "CREATE_NEW";
            } else{
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

    async function processContractsForCreation(tx, processedCases) {
        const invoiceResults = [];
        const updatedContracts = [];

        console.log(`[START] Processing ${processedCases.length} contract cases`);
        const startTime = moment();

        const updateOperations = [];

        // Keyed by offer identity so creation only ever happens ONCE per
        // offer, no matter how many items (same case or different cases)
        // independently decide a creation is needed for it.
        const creationByOffer = new Map(); // key: `${CCMContractID}|${OfferID}|${ProductCode}`

        // Precedence order for resolving the same contract appearing under
        // multiple cases (e.g. matched via SELF and CHILD institute relationships).
        // Lower number = higher precedence = wins.
        const CASE_PRECEDENCE = { CASE_1: 1, CASE_2: 2, CASE_3: 3, CASE_5: 4 };

        const getContractKey = (contract) => `${contract.CCMContractID}|${contract.ContractNumber}`;
        const getOfferKey = (newOffer) => `${newOffer?.CCMContractID}|${newOffer?.OfferID}|${newOffer?.ProductCode}`;

        // ===== PASS 1: determine the winning case for every overlapping contract =====
        // A contract can appear in more than one processedCases item (same
        // CCMContractID + ContractNumber under different case classifications,
        // e.g. matched via SELF and CHILD institute relationships).
        // Only the highest-precedence case should ever process that contract;
        // the other case(s) must ignore it entirely.
        const contractWinningCase = new Map(); // key: `${CCMContractID}|${ContractNumber}` -> caseType

        for (const item of processedCases) {
            const { case: caseType, contracts = [] } = item;

            if (!CASE_PRECEDENCE[caseType]) {
                continue; // NO_MATCH / UNCLASSIFIED / unknown types don't participate in precedence
            }

            for (const contract of contracts) {
                if (!contract?.CCMContractID || !contract?.ContractNumber) {
                    continue; // can't establish identity, leave it alone
                }

                const key = getContractKey(contract);
                const currentWinner = contractWinningCase.get(key);

                if (!currentWinner || CASE_PRECEDENCE[caseType] < CASE_PRECEDENCE[currentWinner]) {
                    contractWinningCase.set(key, caseType);
                }
            }
        }

        // Helper: queue a creation, merging with any existing queued creation
        // for the same offer identity instead of allowing a second CREATE to fire.
        const queueCreation = (offerKey, op) => {
            const existing = creationByOffer.get(offerKey);

            if (!existing) {
                creationByOffer.set(offerKey, op);
                return;
            }

            console.log(
                `[DEDUPE] Merging duplicate creation for offer ${offerKey} ` +
                `(cases: ${existing.caseType} + ${op.caseType})`
            );

            // If either side needs a customer exclusion, the merged result must
            // exclude too — otherwise the surviving op could be a plain CREATE
            // that recreates a contract the other branch intended to exclude.
            const mergedExcludeMap = new Map(
                [...(existing.excludeCustomers || []), ...(op.excludeCustomers || [])]
                    .map(e => [e.customer, e])
            );

            creationByOffer.set(offerKey, {
                ...existing,
                type: mergedExcludeMap.size > 0 ? 'CREATE_EXCLUDE' : 'CREATE',
                excludeCustomers: mergedExcludeMap.size > 0 ? Array.from(mergedExcludeMap.values()) : null
            });
        };

        // ===== PASS 2: main processing, using the precedence result to filter contracts =====
        for (const item of processedCases) {
            const { sourceData, case: caseType, contracts = [] } = item;
            const newOffer = sourceData[0];
            const offerKey = getOfferKey(newOffer);

            const uniqueContractsAll = Array.from(
                new Map(contracts.map(c => [c.CCMContractID, c])).values()
            );

            const hadContractsOriginally = uniqueContractsAll.length > 0;

            // Drop any contract that lost precedence to a different case.
            const uniqueContracts = uniqueContractsAll.filter(contract => {
                if (!contract?.CCMContractID || !contract?.ContractNumber) {
                    return true; // no identity to compare, don't touch it
                }
                const key = getContractKey(contract);
                const winner = contractWinningCase.get(key);
                return !winner || winner === caseType;
            });

            // If this item originally had contracts but ALL of them were claimed
            // by a higher-precedence case elsewhere, this item is fully superseded.
            // It must be skipped outright — NOT routed to the NO_MATCH/UNCLASSIFIED
            // creation branch, which would otherwise still create a duplicate.
            if (hadContractsOriginally && uniqueContracts.length === 0) {
                console.log(
                    `[DEDUPE] Skipping case ${caseType} for offer ${offerKey} — ` +
                    `all contracts already claimed by a higher-precedence case`
                );
                continue;
            }

            // ===== NO MATCH / UNCLASSIFIED =====
            if (!uniqueContracts.length || ["NO_MATCH", "UNCLASSIFIED"].includes(caseType)) {
                queueCreation(offerKey, {
                    type: 'CREATE',
                    caseType,
                    sourceData,
                    excludeCustomers: null
                });
                continue;
            }

            // ===== CASE_5 =====
            if (caseType === "CASE_5") {
                const contractActions = uniqueContracts.map(contract => ({
                    contract,
                    action: decideContractAction(contract, newOffer)
                }));

                const updateAndCreate = contractActions.filter(a => a.action === "UPDATE_AND_CREATE_NEW");
                const createOnly = contractActions.filter(a => a.action === "CREATE_NEW");

                let excludeCustomers = [];
                let hasTenderToCommercialUpdate = false;

                if (updateAndCreate.length > 0) {
                    const excludeMap = new Map();

                    for (const { contract } of updateAndCreate) {
                        const newType = newOffer?.ContractType;
                        const existingType = contract?.ContractType;

                        if (newType === "Tender" && existingType === "Commercial Agreement" && contract.ContractNumber) {
                            hasTenderToCommercialUpdate = true;
                            updateOperations.push({ caseType, contract, newOffer });
                        } else {
                            if (contract?.ContractNumber && contract?.Customer) {
                                if (!excludeMap.has(contract.Customer)) {
                                    excludeMap.set(contract.Customer, {
                                        customer: contract.Customer,
                                        validfrom: `${contract.ConditionValidityStartDate}T00:00:00`,
                                        validto: `${contract.ConditionValidityEndDate}T00:00:00`
                                    });
                                }
                            }
                        }
                    }

                    excludeCustomers = Array.from(excludeMap.values());
                }

                const shouldCreate = updateAndCreate.length > 0 || createOnly.length > 0;

                if (shouldCreate) {
                    queueCreation(offerKey, {
                        type: !hasTenderToCommercialUpdate && excludeCustomers.length > 0
                            ? 'CREATE_EXCLUDE'
                            : 'CREATE',
                        caseType,
                        sourceData,
                        excludeCustomers: !hasTenderToCommercialUpdate && excludeCustomers.length > 0
                            ? excludeCustomers
                            : null
                    });
                }

                continue;
            }

            // ===== CASE_1, CASE_2, CASE_3 =====
            let shouldCreate = false;

            for (const contract of uniqueContracts) {
                const action = decideContractAction(contract, newOffer);

                if (action !== "NO_ACTION") {
                    shouldCreate = true;

                    if (action === "UPDATE_AND_CREATE_NEW") {
                        if (contract?.ContractNumber) {
                            updateOperations.push({
                                caseType,
                                contract,
                                newOffer
                            });
                        }
                    }
                }
            }

            if (shouldCreate) {
                queueCreation(offerKey, {
                    type: 'CREATE',
                    caseType,
                    sourceData,
                    excludeCustomers: null
                });
            }
        }

        const creationOperations = Array.from(creationByOffer.values());

        // ===== EXECUTE UPDATES =====
        if (updateOperations.length > 0) {
            console.log(`[UPDATES] Executing ${updateOperations.length} contract updates in parallel`);

            const updateResults = await Promise.all(
                updateOperations.map(op =>
                    executeContractUpdate(tx, op.caseType, op.contract, op.newOffer)
                )
            );

            updateResults
                .filter(Boolean)
                .forEach(contractNumber => updatedContracts.push(contractNumber));
        }

        // ===== EXECUTE CREATIONS =====
        if (creationOperations.length > 0) {
            console.log(`[CREATIONS] Executing ${creationOperations.length} contract creations in parallel`);

            const creationResults = await Promise.all(
                creationOperations.map(op => {
                    if (op.type === 'CREATE_EXCLUDE') {
                        return createCCMContractExcludeCustomer(
                            tx,
                            "ES",
                            "ConditionContract",
                            op.sourceData,
                            op.excludeCustomers
                        );
                    } else {
                        return createCCMContract(
                            tx,
                            "ES",
                            "ConditionContract",
                            op.sourceData
                        );
                    }
                })
            );

            invoiceResults.push(...creationResults.filter(Boolean));
        }

        const endTime = moment();
        console.log(`[END] Processed ${processedCases.length} cases in ${endTime.diff(startTime, 'milliseconds')}ms`);
        console.log(`[STATS] Updates: ${updateOperations.length}, Creations: ${creationOperations.length}`);

        return { invoiceResults, updatedContracts };
    }

    async function executeContractUpdate(tx, caseType, contract, newOffer) {
            if (!contract?.ContractNumber) {
                return null;
            }
    
            const runUpdate = async () => {
                if (caseType === "CASE_2") {
                    const success = await excludeChildCustomer(tx, contract, newOffer);
                    return success ? contract.ContractNumber : null;
                }
                const success = await updateExistingContract(tx, contract, newOffer);
                return success ? contract.ContractNumber : null;
            };
    
        try {
            return await runUpdate();
        } catch (error) {
            console.error(`[executeContractUpdate] Failed for contract ${contract?.ContractNumber}:`, error.message);
            const operation = caseType === "CASE_2" ? "excluding customer from" : "updating";
            error.message = `Contract creation was aborted because ${operation} existing contract ${contract.ContractNumber} failed. `
                            + `Please review the contract in SAP and try again. (Technical detail: ${error.message})`;
            tx.run(
                INSERT.into(ConditionContractsLog).entries({
                    ContractNumber: contract.ContractNumber,
                    ContractType: contract.ContractType,
                    ContractReference: caseType,
                    PayloadType: 'executeContractUpdate_ERROR',
                    PayloadToSAP: JSON.stringify(error.payload ?? {}),
                    ErrorMessage: error.message,
                    Synchronized: false,
                    createdAt: new Date().toISOString(),
                    createdBy: tx.context.user.id,
                    CCMContractID: contract.CCMContractID
                })
            ).catch(logErr => console.warn('Failed to write error log for [executeContractUpdate] step:', logErr.message));
            throw error;
        }
    }

    async function createCCMContractExcludeCustomer(tx, countryCode, resource, sourceData, excludeCustomers) {
        let body;
        try {
            const apiConfig = await getOrCacheAPIConfig(tx, 'ConditionContract', countryCode, resource, 'InvoicePrice');
    
            if (!apiConfig) {
                throw new Error("ERR_MISSING_PARAMETER:API Definition not found");
            }
    
            // Filter mappings in memory instead of DB query
            const apiBodyMappings = await getOrCacheAPIBody(tx, apiConfig.ID);
            
            if (!apiBodyMappings.length) {
                throw new Error("ERR_MISSING_PARAMETER:API body Mappings not found");
            }
    
            body = buildPayloadFromMappings(sourceData, apiBodyMappings);
            
            if (!body) {
                throw new Error("ERR_MISSING_PARAMETER:API Body not found");
            }

            //update Payload to exclude customer
            body = updatePayloadToExcludeCustomers(body, excludeCustomers);
    
            const accessToken = await getOrCacheOAuthToken(tx, apiConfig.OAuth_ID, countryCode);
            const url = `${apiConfig.Host}${apiConfig.BasePath}${apiConfig.ResourcePath}`;
    
            return axios({
                method: 'post',
                url: url,
                timeout: 120000,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                data: body
            });
        } catch (error) {
            error.payload = body;
            throw error
        }
    }

    function updatePayloadToExcludeCustomers(payload, excludeCustomers) {
        excludeCustomers.forEach(c => {
            payload.ConditionContract.bvheader.push({
                FieldCombination: "Y001",
                ConditionDocument: "",
                incl_excl: "E",
                customer: c.customer,
                validfrom: c.validfrom,
                validto: c.validto
            });
        });

        return payload;
    }

    async function updateExistingContract(tx, contract, newOffer) {

        const existingEnd = contract.ConditionValidityEndDate;
        const newStart = newOffer.ConditionValidityStartDate;
    
        if (existingEnd < newStart) {
            console.log(`Skipping update: contract ${contract.ContractNumber} ended before new offer start date`);
            return false;
        }
    
        const prevDay = d => new Date(new Date(d).setDate(new Date(d).getDate() - 1)).toISOString().slice(0, 10);
    
        const { response, body } = await handleExistingContract(tx, 'ES', "ConditionContract", {
            ExistingContractNumber: contract.ContractNumber,
            ExpireDate: prevDay(newOffer.ConditionValidityStartDate),
            OfferID: contract.OfferID,
            EANUPCCode: contract.EANUPCCode
        });
    
        if (response?.status !== 200) {
            const error = new Error(`Update of ExistingContract failed for ${contract.ContractNumber}`);
            error.payload = body;
            throw error;
        }
    
        console.log(`Existing contract ${contract.ContractNumber} updated successfully`);
    
        // Batch updates - single call
        const logInsert = {
            ContractNumber: contract.ContractNumber,
            ContractType: contract.ContractType,
            ContractReference: contract.ContractReference,
            PayloadType: 'UpdateExistingInvoiceContract',
            PayloadToSAP: JSON.stringify(body),
            Synchronized: true,
            createdAt: new Date().toISOString(),
            createdBy: tx.context.user.id,
            CCMContractID: contract.CCMContractID
        };
    
        // Run both updates in parallel but don't block return
        Promise.all([
            tx.run(INSERT.into(ConditionContractsLog).entries(logInsert)),
            tx.run(UPDATE(CCMContract).with({ CCMContractEndDate: prevDay(newOffer.ConditionValidityStartDate), UpdatedContractNumber: contract.ContractNumber }).where({ ID: contract.CCMContractID }))
        ]).catch(err => console.warn('Batch update failed:', err.message));
    
        return true;
    }

    async function handleExistingContract(tx, countryCode, resource, sourceData) {
        let body;
        try {
            const apiConfig = await getOrCacheAPIConfig(tx, 'ConditionContract', countryCode, resource, 'UpdateExistingInvoiceContract');
            
            if (!apiConfig) {
                throw new Error("ERR_MISSING_PARAMETER:API Definition not found");
            }
    
            const apiBodyMappings = await getOrCacheAPIBody(tx, apiConfig.ID);
    
            if (!apiBodyMappings || apiBodyMappings.length === 0) {
                throw new Error("ERR_MISSING_PARAMETER:API body Mappings not found");
            }
    
            body = buildExistingUpdatePayloadFromMappings(sourceData, apiBodyMappings);
    
            if (!body) {
                throw new Error("ERR_MISSING_PARAMETER:API Body not found");
            }
    
            const accessToken = await getOrCacheOAuthToken(tx, apiConfig.OAuth_ID, countryCode);
            const url = `${apiConfig.Host}${apiConfig.BasePath}${apiConfig.ResourcePath}`;
    
            const response = await axios({
                method: 'patch',
                url: url,
                timeout: 60000,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                data: body
            });
    
            return { response, body };
        } catch (error) {
            error.payload = body;
            throw error;
        }
    }

    async function excludeChildCustomer(tx, contract, newOffer) {
        try {
                const customer = await tx.run(
                    SELECT.one.from(CCMCustomer).where({ CCMContract_ID: contract.CCMContractID })
                );
        
                if (!customer) {
                    throw new Error(`No customer found for contract ${contract.ContractNumber}`);
                }
        
                const excludedCustomer = await tx.run(
                    SELECT.one.from(CustomerHierarchy).where({
                        CCMCustomer_ID: customer.ID,
                        CustomerID: newOffer.Customer,
                        Excluded: true
                    })
                );
        
                if (excludedCustomer) {
                    console.log(`Customer ${newOffer.Customer} already excluded for contract ${contract.ContractNumber}`);
                    
                    // Async log - don't block
                    tx.run(INSERT.into(ConditionContractsLog).entries({
                        ContractNumber: contract.ContractNumber,
                        ContractType: contract.ContractType,
                        ContractReference: contract.ContractReference,
                        PayloadType: 'UpdateExistingInvoiceContract_ExcludeCustomer',
                        createdAt: new Date().toISOString(),
                        createdBy: tx.context.user.id,
                        ErrorMessage: `Customer ${newOffer.Customer} already excluded for contract ${contract.ContractNumber}`,
                        CCMContractID: contract.CCMContractID
                    })).catch(err => console.warn('Log insert failed:', err.message));
                    
                    return false;
                }
        
                const { response, body } = await handleExcludeChildCustomer(tx, 'ES', "ConditionContract", {
                    ExistingContractNumber: contract.ContractNumber,
                    customer: newOffer.Customer,
                    validfrom: newOffer.ConditionValidityStartDate,
                    validto: newOffer.ConditionValidityEndDate
                });
        
                const batchText = response?.data ?? "";
        
                if (batchText.includes("HTTP/1.1 400")) {
                    const msgMatch = batchText.match(/<message[^>]*>([\s\S]*?)<\/message>/);
                    const errMessage = msgMatch ? msgMatch[1] : "Unknown SAP error";
                    const codeMatch = batchText.match(/<code[^>]*>([\s\S]*?)<\/code>/);
                    const errCode = codeMatch ? codeMatch[1] : "UNKNOWN_ERROR";
        
                    const error = new Error(`SAP Batch Error for ${contract.ContractNumber}: [${errCode}] ${errMessage}`);
                    error.payload = body;
                    throw error;
                }
        
                const itemGuidMatch = batchText.match(/<d:itemguid>([^<]+)<\/d:itemguid>/i) ?? batchText.match(/itemguid=guid'([^']+)'/i);
                const itemGUID = itemGuidMatch ? itemGuidMatch[1] : null;
        
                // Batch all database operations
                const dbOperations = [
                    tx.run(INSERT.into(ConditionContractsLog).entries({
                        ContractNumber: contract.ContractNumber,
                        ContractType: contract.ContractType,
                        ContractReference: contract.ContractReference,
                        PayloadType: 'UpdateExistingInvoiceContract_ExcludeCustomer',
                        PayloadToSAP: JSON.stringify(body),
                        Synchronized: true,
                        createdAt: new Date().toISOString(),
                        createdBy: tx.context.user.id,
                        CCMContractID: contract.CCMContractID
                    })),
                    tx.run(UPDATE(CustomerHierarchy).with({ Excluded: true }).where({
                        CCMCustomer_ID: customer.ID,
                        CustomerID: newOffer.Customer
                    })),
                    tx.run(UPDATE(CCMContract).with({ UpdatedContractNumber: contract.ContractNumber }).where({
                        ID: contract.CCMContractID
                    })),                    
                    itemGUID ? tx.run(INSERT.into(ContractItemGUID).entries({
                        ConditionDocument: contract.ContractNumber,
                        CustomerID: newOffer.Customer,
                        ItemGUID: itemGUID,
                        CCMContract_ID: contract.CCMContractID
                    })) : Promise.resolve()
                ];
        
                await Promise.all(dbOperations);
                console.log(`Existing contract ${contract.ContractNumber} updated successfully`);
        
                return true;
        } catch (error) {
            console.error('excludeChildCustomer error:', error.message);
            throw error;
        }
    }

    async function handleExcludeChildCustomer(tx, countryCode, resource, sourceData) {
        let body;
        try {
            const apiConfig = await getOrCacheAPIConfig(tx, 'ConditionContract', countryCode, resource, 'ExcludeCustomerExistingInvoiceContract');
            
            if (!apiConfig) {
                throw new Error("ERR_MISSING_PARAMETER:API Definition not found");
            }
    
            const apiBodyMappings = await getOrCacheAPIBody(tx, apiConfig.ID);
    
            if (!apiBodyMappings || apiBodyMappings.length === 0) {
                throw new Error("ERR_MISSING_PARAMETER:API body Mappings not found");
            }
    
            body = buildExcludeCustomerPayloadFromMappings(sourceData, apiBodyMappings);
    
            if (!body) {
                throw new Error("ERR_MISSING_PARAMETER:API Body not found");
            }
    
            const accessToken = await getOrCacheOAuthToken(tx, apiConfig.OAuth_ID, countryCode);
            const url = `${apiConfig.Host}${apiConfig.BasePath}${apiConfig.ResourcePath}`;
    
            const response = await axios({
                method: 'post',
                url: url,
                timeout: 60000,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                data: body
            });
    
            return { response, body };
        } catch (error) {
            error.payload = body;
            throw error;
        }
    }

    srv.on('createCCMContract', async (req) => {
        const tx = cds.tx(req);
        let startTime, endTime;

        const logTime = (label, start, end) => {
            console.log(`${label} | Duration: ${end.diff(start, 'milliseconds')} ms`);
        };
        try {
            startTime = moment();
            console.log("TOTAL createCCMContract START:", startTime.format());

            const { FastCCMContractId, CCMContractID, ProductCode } = req.data;
            const today = new Date().toISOString().split("T")[0];

            console.log("Fetching all required data...");
            let s = moment();
    
            const [
                existingContractInfo,
                sourceData,
                rebateSourceData,
                rebateSettlementData,
                customerHierarchy
            ] = await Promise.all([
                tx.run(
                    SELECT.from(ExistingContractInfo)
                        .columns('CCMContractID', 'FastConditionContractID')
                ),
                tx.run(
                    SELECT.from(ContractPayloadView)
                        .where({ CCMContractID, FastConditionContractID: FastCCMContractId, ProductCode })
                ),
                tx.run(
                    SELECT.from(ContractRebatePayloadView)
                        .where({ CCMContractID, FastConditionContractID: FastCCMContractId, ProductCode })
                ),
                tx.run(
                    SELECT.from(SettlementsDate).where({ CCMContractID })
                ),
                tx.run(
                    SELECT.from(CustomerHierarchy).where({ CCMContractID })
                )
            ]);
    
            let e = moment();
            logTime("Fetch All Required Data", s, e);

            if (existingContractInfo.length > 0) {
                console.log("Expire Existing Contracts...");
                s = moment();
    
                const updates = existingContractInfo.flatMap(info => [
                    UPDATE(CCMContract)
                        .with({ Expired: true })
                        .where({ ID: info.CCMContractID }),
                    UPDATE(FastConditionContracts)
                        .with({ hasExpiredContracts: true })
                        .where({ ID: info.FastConditionContractID })
                ]);
    
                // Execute all updates in batch
                await Promise.all(updates.map(query => tx.run(query)));
    
                e = moment();
                logTime("Expire Existing Contracts", s, e);
            }

            if (rebateSourceData.length > 0) {
                console.log("Validate Settlement Calendar...");
                s = moment();
                validateSettlementCalendar({rebateSourceData, settlementData: rebateSettlementData });
                e = moment();
                logTime("Validate Settlement Calendar", s, e);
            }

            // Skip invoice contract creation if ConditionType is PVL
            const isPVLContract = sourceData.some(d => d.ConditionType === 'PVL' || d.ConditionType === 'Rental');
            
            console.log("Prepare Rebate Contracts...");
            s = moment();
            let rebatePromise = [];
            if(rebateSourceData.length > 0){
                const apiConfig = await getOrCacheAPIConfig(
                    tx,
                    'ConditionContract',
                    'ES',
                    'ConditionContract',
                    'Rebate'
                );

                const apiBodyMappings = await getOrCacheAPIBody(tx, apiConfig.ID);

                const accessToken = await getOrCacheOAuthToken(
                    tx,
                    apiConfig.OAuth_ID,
                    'ES'
                );

                const rebateConfig = {
                    apiConfig,
                    apiBodyMappings,
                    accessToken
                };
                rebatePromise = await Promise.all(
                    rebateSettlementData.map(settle =>
                            createRebateContract(
                                rebateConfig,
                                rebateSourceData,
                                {
                                    fromDate: settle.FromDate,
                                    toDate: settle.ToDate,
                                    SettlementID: settle.SettlementID
                                },
                                customerHierarchy
                            )
                        )
                );
            }
            e = moment();
            logTime("Prepare Rebate Contracts", s, e);

            let invoicePromise = Promise.resolve({ invoiceResults: [], updatedContracts: [] });

            if (!isPVLContract) {
                console.log("Preprocess + Process Invoice...");
                s = moment();
                // Preprocess and handle invoice contracts only if not PVL
                const processedData = await preprocessContracts(tx, sourceData);
                invoicePromise = processContractsForCreation(tx, processedData);
                e = moment();
                logTime("Preprocess + Process Invoice", s, e);
            } else {
                console.log("Skipping invoice contract creation (PVL ConditionType detected).");
            }

            //const invoicePromise = createCCMContract(tx, 'ES', "ConditionContract", sourceData);
            console.log("Parallel Execution...");
            s = moment();
            const [{ invoiceResults, updatedContracts}, rebateResponses] = await Promise.all([invoicePromise, rebatePromise]);
            e = moment();
            logTime("Parallel Execution (SAP Calls)", s, e);            

            console.log("Process Results...");
            s = moment();            
            let createdInvoiceContracts = [];
            let excludedMatched = [];

            const dbOps = [];
            const logs = [];

            if (Array.isArray(invoiceResults) && invoiceResults.length > 0) {

                // Fetch once
                const [contractInfo] = await Promise.all([
                    tx.run(
                        SELECT.one.from(CCMContract)
                            .where({ ID: CCMContractID, ContractNumber: { "!=": null } })
                    )
                ]);

                // Build lookup map
                const hierarchyMap = new Map();
                for (const ch of customerHierarchy) {
                    hierarchyMap.set(String(ch.CustomerID), ch);
                }

                for (const invoiceResult of invoiceResults) {
                    if (!invoiceResult) continue;

                    const contractNumber = invoiceResult?.data?.ConditionContract;
                    const contractReference = invoiceResult?.data?.ExternalDocumentReferenceID;

                    if (!contractNumber) continue;

                    createdInvoiceContracts.push(contractNumber);

                    const payload = typeof invoiceResult?.config?.data === "string"
                        ? invoiceResult.config.data
                        : JSON.stringify(invoiceResult.config.data);

                    // Contract updates
                    if (contractInfo?.ContractNumber) {
                        dbOps.push(
                            UPDATE(CCMContract)
                                .with({ PreviousContractNumber: contractInfo.ContractNumber, Expired: false })
                                .where({ ID: CCMContractID })
                        );
                    }

                    dbOps.push(
                        UPDATE(CCMContract)
                            .with({
                                ContractNumber: contractNumber,
                                ContractReferene: contractReference,
                                Synchronized: true,
                                Expired: false,
                                CreationDate: today
                            })
                            .where({ ID: CCMContractID }),

                        UPDATE(FastConditionContracts)
                            .with({ hasActiveContracts: true })
                            .where({ ID: FastCCMContractId })
                    );

                    logs.push({
                        ContractNumber: contractNumber,
                        ContractReference: contractReference,
                        PayloadType: 'Invoice',
                        PayloadToSAP: payload,
                        Synchronized: true,
                        createdAt: new Date().toISOString(),
                        createdBy: req.user.id,
                        CCMContractID
                    });

                    // Excluded customers (no DB call)
                    let bvheaders = Array.isArray(invoiceResult?.data?.bvheader)
                        ? invoiceResult.data.bvheader
                        : [invoiceResult?.data?.bvheader];

                    const excludedCustomers = bvheaders
                        .filter(h => h?.incl_excl === "E" && h?.customer)
                        .map(h => ({ customer: String(h.customer), itemGUID: h.itemguid }));

                    for (const cust of excludedCustomers) {
                        const match = hierarchyMap.get(cust.customer);

                        if (match) {
                            excludedMatched.push(cust.customer);

                            dbOps.push(
                                UPDATE(CustomerHierarchy).set({ Excluded: true }).where({ ID: match.ID , CustomerID: cust.customer }),
                                INSERT.into(ContractItemGUID).entries({
                                    ConditionDocument: contractNumber,
                                    CustomerID: cust.customer,
                                    ItemGUID: cust.itemGUID,
                                    CCMContract_ID: CCMContractID
                                })
                            );
                        }
                    }
                }
            }
                  
            // Process Rebate Responses
            if (Array.isArray(rebateResponses) && rebateResponses.length > 0) {
                for (const rebateResp of rebateResponses) {
                    const contractNumber = rebateResp?.data?.ConditionContract;
                    const ref = rebateResp?.data?.ExternalDocumentReferenceID;

                    if (!contractNumber || !ref) continue;

                    const settlement = rebateSettlementData.find(s => s.SettlementID === ref);
                    if (!settlement) continue;

                    dbOps.push(
                        UPDATE(SettlementsDate)
                            .with({
                                RebateContractNumber: contractNumber,
                                Synchronized: true,
                                CreationDate: today
                            })
                            .where({ SettlementID: settlement.SettlementID })
                    );

                    logs.push({
                        ContractNumber: contractNumber,
                        ContractReference: ref,
                        PayloadType: 'Rebate',
                        PayloadToSAP: JSON.stringify(rebateResp.config.data),
                        Synchronized: true,
                        createdAt: new Date().toISOString(),
                        createdBy: req.user.id,
                        CCMContractID: settlement.CCMContractID
                    });
                }
            }

            if (logs.length) {
                dbOps.push(INSERT.into(ConditionContractsLog).entries(logs));
            }

            if (dbOps.length) {
                await Promise.all(dbOps.map(q => tx.run(q)));
            }
            e = moment();
            logTime("Process Results", s, e);

            // Compose success message
            let invoiceMsg = createdInvoiceContracts.length ? `CCM Invoice Contract(s): ${createdInvoiceContracts.join(", ")}` : "No Invoice Contracts";

            let updatedMsg = updatedContracts.length ? `Updated Contracts: ${updatedContracts.join(", ")}` : "";

            let excludedMsg = excludedMatched.length ? `Following customers were excluded while creating contract: ${excludedMatched.join(", ")}` : "";

            let rebateMsg = `${rebateResponses.length} Rebate Contract${rebateResponses.length !== 1 ? "s" : ""}`;

            const successMessage = [invoiceMsg, excludedMsg, updatedMsg, rebateMsg].filter(Boolean).join(" + ");

            endTime = moment();
            console.log("TOTAL createCCMContract END:", endTime.format());
            logTime("TOTAL createCCMContract", startTime, endTime);

            return req.reply(`${successMessage} created/updated successfully into SAP`);
        } catch (error) {
            let statusCode = 500;
            error.request = req;
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
                    error.inputPayload = inputPayload;
                } else {
                    console.error('No InputPayload found in the SAP error response');
                }
                statusCode = error.response.status || 502;
            }
            else if (error.message) {
                console.error("App Error:", error.message);
                userMessage = error.message;
                statusCode = typeof error.code === 'number' ? error.code : 500;
            }
            else {
                console.error("Unhandled Error:", error);
            }
            error.message = userMessage;
            logError(error);
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

    async function createRebateContract(config, sourceData, rebateSettlementData, customerHierarchy) {
        let body;

        try {
            const { apiConfig, apiBodyMappings, accessToken } = config;

            body = buildRebatePayloadFromMappings(
                sourceData,
                apiBodyMappings,
                customerHierarchy
            );

            if (!body) {
                throw new Error("ERR_MISSING_PARAMETER:API Body not found");
            }

            body = updatePayloadWithDates(
                body,
                rebateSettlementData.fromDate,
                rebateSettlementData.toDate,
                rebateSettlementData.SettlementID
            );

            const url = `${apiConfig.Host}${apiConfig.BasePath}${apiConfig.ResourcePath}`;

            return axios({
                method: 'post',
                url,
                timeout: 120000,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                data: body
            });

        } catch (error) {
            error.payload = body;
            throw error;
        }
    }

    async function createCCMContract(tx, countryCode, resource, sourceData) {
        let body;
        try {
            const apiConfig = await getOrCacheAPIConfig(tx, 'ConditionContract', countryCode, resource, 'InvoicePrice');
    
            if (!apiConfig) {
                throw new Error("ERR_MISSING_PARAMETER:API Definition not found");
            }
    
            // Filter mappings in memory instead of DB query
            const apiBodyMappings = await getOrCacheAPIBody(tx, apiConfig.ID);
            
            if (!apiBodyMappings.length) {
                throw new Error("ERR_MISSING_PARAMETER:API body Mappings not found");
            }
    
            body = buildPayloadFromMappings(sourceData, apiBodyMappings);
            
            if (!body) {
                throw new Error("ERR_MISSING_PARAMETER:API Body not found");
            }
    
            const accessToken = await getOrCacheOAuthToken(tx, apiConfig.OAuth_ID, countryCode);
            const url = `${apiConfig.Host}${apiConfig.BasePath}${apiConfig.ResourcePath}`;
    
            return axios({
                method: 'post',
                url: url,
                timeout: 120000,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                data: body
            });
        } catch (error) {
            error.payload = body;
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

    function buildExcludeCustomerPayloadFromMappings(sourceData, apiBodyMappings) {
        const finalResult = {};
        let bvheaderEntry = {};

        for (const { Source, Target } of apiBodyMappings) {

            if (Target.includes("ConditionContract.bvheader")) {

                if (!finalResult.ConditionContract) finalResult.ConditionContract = {};
                if (!Array.isArray(finalResult.ConditionContract.bvheader)) {
                    finalResult.ConditionContract.bvheader = [];
                }

                if (Target.endsWith("ConditionContract.bvheader.ConditionDocument")) {
                    bvheaderEntry.ConditionDocument = sourceData.ExistingContractNumber;
                    continue;
                }

                if (Target.endsWith("ConditionContract.bvheader.FieldCombination")) {
                    bvheaderEntry.FieldCombination = Source;
                    continue;
                }

                if (Target.endsWith("ConditionContract.bvheader.incl_excl")) {
                    bvheaderEntry.incl_excl = Source;
                    continue;
                }

                if (Target.endsWith("ConditionContract.bvheader.customer")) {
                    bvheaderEntry.customer = sourceData.customer;
                    continue;
                }

                if (Target.endsWith("ConditionContract.bvheader.validfrom")) {
                    bvheaderEntry.validfrom = `${sourceData.validfrom}T00:00:00`;
                    continue;
                }

                if (Target.endsWith("ConditionContract.bvheader.validto")) {
                    bvheaderEntry.validto = `${sourceData.validto}T00:00:00`;
                    continue;
                }

            } else {
                // Other fields set normally via mapping
                setNestedValue(finalResult, Target, "");
            }
        }

        if (Object.keys(bvheaderEntry).length > 0) {
            finalResult.ConditionContract.bvheader.push(bvheaderEntry);
        }

        return finalResult;
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

            if (Target.endsWith("ConditionContract.ConditionContractType.ExternalDocumentReferenceID")) {
                setNestedValue(finalResult, Target, `${sourceData.OfferID}_${sourceData.EANUPCCode}`);
                continue;
            }

            setNestedValue(finalResult, Target, "");

        }

        return finalResult;
    }


    function buildRebatePayloadFromMappings(sourceData, apiBodyMappings, customerHierarchy) {
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

            if (firstRow.MaxDiscount != null) {
                conditionRecord.ConditionRateRatio = parseFloat((firstRow.MaxDiscount * 100).toFixed(3));
            }

            conditionRecords.push(conditionRecord);
        }

        // --- Build YRS1 with scales from ALL rows ---
        const yrs1Record = { ...conditionRecords[0], ConditionType: 'YRS1' };

        // --- Apply MaxDiscount override on YRS1 ---
        if (sourceData[0].MaxDiscount != null) {
            yrs1Record.ConditionRateRatio = parseFloat((sourceData[0].MaxDiscount * 100).toFixed(3));
        }

        // --- Apply PriceConditionCode override on YRS1 ---
        if (sourceData[0].PriceConditionCode) {
            yrs1Record.PricingScaleType = scaleTypes[sourceData[0].PriceConditionCode] || sourceData[0].PriceConditionCode;
        }

        if (yrs1Record.PricingScaleType === 'D') {
            yrs1Record.ConditionType = "YRSI";
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
                        scaleObj.ConditionRateRatio = parseFloat((sRow.Discount * 100).toFixed(3));
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
                // if(sourceData[0].ContractType.toLowerCase() === 'tender'){
                //     value = "CO-".concat(sourceData[0].Reference.replace(/ /g,'-'));
                // }
                // // Commercial Agreement
                // if(sourceData[0].ContractType.toLowerCase() === 'commercial agreement'){
                //     value = "OF-".concat(sourceData[0].TenderID); 
                // }

                value = `${sourceData[0].OfferID}_${sourceData[0].EANUPCCode}`

                setNestedValue(finalResult, Target, value);
                continue;
            }
        }

        if (sourceData[0].AssortmentReference) {
            const customerID = customerHierarchy[0]?.CustomerID || "";
            finalResult.ConditionContract.ConditionContractType.CndnContrType = 'YR04';
            finalResult.ConditionContract.ConditionContractType.CndnContrProcVar = 'YR04';
            finalResult.ConditionContract.ConditionContractType.Customer = customerID;
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
        let bvheaderEntry = null;

        for (let i = 0; i < sourceData.length; i++) {
            const row = sourceData[i];

            const conditionRecord = { ...staticConditionRecord };

            //create BVHeader once (first row)
            if (i === 0) {
                bvheaderEntry = { ...staticBVHeader };
            }

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
                    if (row.ContractType.toLowerCase() === 'tender') {
                        value = "CO-".concat(row.Reference.replace(/ /g, '-'));
                    }
                    if (row.ContractType.toLowerCase() === 'commercial agreement') {
                        value = "OF-".concat(row.TenderID);
                    }
                    value = value?.substring(0, 30);
                    setNestedValue(finalResult, Target, value);
                    continue;
                }

                if (field === 'SAPID' && Target === 'ConditionContract.ConditionContractType.ExternalDocumentReferenceID') {
                    value = `${row.OfferID}_${row.EANUPCCode}`;
                    value = value?.substring(0, 30);
                    setNestedValue(finalResult, Target, value);
                    continue;
                }

                if (field === 'ConditionType' && Target.includes('ConditionType')) {
                    conditionTypeValue = value === 'PrecioNeto'
                        ? (row?.PriceConditionCode === 'YP11' ? 'YP11' : 'YP10')
                        : conditionTypeMap[value] || value;
                    value = conditionTypeValue;
                }

                if (field === 'YD02' && Target.endsWith('ConditionRateRatio')) {
                    value = parseFloat((value * 100).toFixed(3));
                }

                /**
                 * Fix floating-point precision issues during SAP condition contract synchronization.
                 *
                 * Example:
                 * 8.04 * 10000 may result in 80399.99999999999 instead of 80400
                 * due to JavaScript IEEE 754 floating-point arithmetic.
                 *
                 * This caused SAP OData validation error:
                 * (/IWCOR/CX_OD_EDM_FACET_ERROR/005056A509B11ED1BDCCCC5E8168819D)
                 * Value '80399.99999999999' violates facet information 'Scale=9'
                 * [HTTP/1.1 400 Bad Request]
                 *
                 * Number.EPSILON + toFixed(6) removes floating-point artifacts
                 * while preserving business precision up to 6 decimals.
                 */
                if (field === 'YP10' && Target.endsWith('ConditionRateAmount')) {

                    const factor = row.UoM === 'Pack' ? 1 : row.PackFactor;

                    value = Number(
                        ((value * factor * 10000) + Number.EPSILON).toFixed(6)
                    );
                }

                const key = Target.split('.').pop();

                if (Target.includes('CndnContrConditionRecordType')) {
                    if (conditionTypeValue === 'YP10' || conditionTypeValue === 'YP11') {
                        conditionRecord['ConditionCalculationType'] = 'C';
                        conditionRecord['ConditionQuantityUnit'] = 'PC';
                        conditionRecord['ConditionQuantityUnitISOCode'] = 'PCE';
                        conditionRecord['ConditionQuantity'] = 10000;
                    }
                    conditionRecord[key] = value;

                // APPLY BVHEADER ONLY ONCE
                } else if (Target.includes('bvheader') && i === 0) {
                    bvheaderEntry[key] = value;
                } else {
                    setNestedValue(finalResult, Target, value);
                }
            }

            // condition records (unchanged)
            if (Object.keys(conditionRecord).length > 0) {
                if (conditionRecord.ConditionType === 'YD02') {
                    delete conditionRecord.ConditionRateAmount;
                }
                if (conditionRecord.ConditionType === 'YP10' || conditionRecord.ConditionType === 'YP11') {
                    delete conditionRecord.ConditionRateRatioUnit;
                    delete conditionRecord.ConditionRateRatio;
                    delete conditionRecord.ConditionRateRatioUnitISOCode;
                }
                conditionRecords.push(conditionRecord);
            }

            // apply assortment logic only once
            if (i === 0 && row.AssortmentReference) {
                bvheaderEntry['FieldCombination'] = 'Y002';
                delete bvheaderEntry['customer'];
            }
        }

        // condition records
        if (conditionRecords.length > 0) {
            setNestedValue(finalResult, 'ConditionContract.ConditionContractType._CndnContrCndnRecord', [
                "",
                { CndnContrConditionRecordType: conditionRecords }
            ]);
        }

        setNestedValue(finalResult, 'ConditionContract.conditioncontract', {});

        //bvheader
        if (bvheaderEntry && Object.keys(bvheaderEntry).length > 0) {
            setNestedValue(finalResult, 'ConditionContract.bvheader', [bvheaderEntry]);
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

            return result;
        }catch(error){
            console.error("No mail template found");
            return;
        }
    }

    srv.on('createAllCCMContract', async (req) => {
        const tx = cds.tx(req);
        const today = new Date().toISOString().split("T")[0];
        let startTime, endTime;

        const logTime = (label, start, end) => {
            console.log(`${label} | Duration: ${end.diff(start, 'milliseconds')} ms`);
        };

        try {

            startTime = moment();
            console.log("TOTAL createAllCCMContract START:", startTime.format());
            const { FastCCMContractId } = req.data;

            console.log("Fetching all required data...");
            let s = moment();
            // Fetch ALL upfront
            const {
                existingContractInfo,
                sourceData,
                rebateSourceData,
                rebateSettlementData
            } = await fetchContractContext(tx, FastCCMContractId);

            let e = moment();
            logTime("Fetch All Required Data", s, e);

            console.log("Expire Existing Contracts...");
            s = moment();            
            // Expire in batch
            await expireContracts(tx, existingContractInfo);

            e = moment();
            logTime("Expire Existing Contracts", s, e);

            // Validate once
            if (rebateSourceData.length) {
                console.log("Validate Settlement Calendar...");
                s = moment();                
                validateSettlementCalendar({rebateSourceData, settlementData: rebateSettlementData });
                e = moment();
                logTime("Validate Settlement Calendar", s, e);                
            }

            console.log("Pre-group source data...");
            s = moment();              
            // Pre-group source data
            const grouped = Object.values(
                sourceData.reduce((acc, item) => {
                    (acc[item.CCMContractID] ||= []).push(item);
                    return acc;
                }, {})
            );
            e = moment();
            logTime("Pre-group source data", s, e);


            console.log("Pre-fetch shared DB data ONCE...");
            s = moment();               
            // Pre-fetch shared DB data ONCE
            const allCCMIds = grouped.map(g => g[0].CCMContractID);

            const [contractInfos, customerHierarchyAll] = await Promise.all([
                tx.run(SELECT.from(CCMContract).where({ ID: { in: allCCMIds } })),
                tx.run(SELECT.from(CustomerHierarchy).where({ CCMContractID: { in: allCCMIds } }))
            ]);

            const contractInfoMap = new Map(contractInfos.map(c => [c.ID, c]));
            const hierarchyByContract = new Map();

            customerHierarchyAll.forEach(h => {
                if (!hierarchyByContract.has(h.CCMContractID)) {
                    hierarchyByContract.set(h.CCMContractID, { list: [], byCustomer: new Map() });
                }
                const entry = hierarchyByContract.get(h.CCMContractID);
                entry.list.push(h);
                entry.byCustomer.set(String(h.CustomerID), h);
            });
            e = moment();
            logTime("Pre-fetch shared DB data ONCE", s, e);

            console.log("Prepare Rebate Contracts...");
            s = moment();            
            let rebatePromise = [];
            if(rebateSourceData.length > 0){
                const apiConfig = await getOrCacheAPIConfig(
                    tx,
                    'ConditionContract',
                    'ES',
                    'ConditionContract',
                    'Rebate'
                );

                const apiBodyMappings = await getOrCacheAPIBody(tx, apiConfig.ID);

                const accessToken = await getOrCacheOAuthToken(
                    tx,
                    apiConfig.OAuth_ID,
                    'ES'
                );

                const rebateConfig = {
                    apiConfig,
                    apiBodyMappings,
                    accessToken
                };

                const rebateMap = rebateSourceData.reduce((acc, r) => {
                    (acc[r.CCMContractID] ||= []).push(r);
                    return acc;
                }, {});

                rebatePromise = await Promise.all(
                    rebateSettlementData.map(settle => {
                        const filtered = rebateMap[settle.CCMContractID] || [];

                        //Pass scoped hierarchy list for this contract
                        const contractHierarchy = hierarchyByContract.get(settle.CCMContractID)?.list || [];

                        return createRebateContract(
                            rebateConfig,
                            filtered,
                            {
                                fromDate: settle.FromDate,
                                toDate: settle.ToDate,
                                SettlementID: settle.SettlementID
                            },
                            contractHierarchy
                        );
                    })
                );
            }
            e = moment();
            logTime("Prepare Rebate Contracts", s, e);

            console.log("Preprocess + Process Invoice...");
            s = moment();
            const invoicePromises = grouped.map(async (group) => {
                const isPVL = group.some(d => d.ConditionType === 'PVL' || d.ConditionType === 'Rental');
                if (isPVL) return { invoiceResults: [], updatedContracts: [] };

                const processed = await preprocessContracts(tx, group);
                return processContractsForCreation(tx, processed);
            });
            e = moment();
            logTime("Preprocess + Process Invoice", s, e);

            console.log("Parallel Execution...");
            s = moment();
            const [invoiceResponses, rebateResponses] = await Promise.all([
                Promise.all(invoicePromises),
                rebatePromise
            ]);
            e = moment();
            logTime("Parallel Execution (SAP Calls)", s, e); 

            // BATCH DB OPERATIONS
            const dbOps = [];
            const logs = [];

            let createdInvoiceContracts = [];
            let updatedContractsAll = [];
            let excludedMatched = [];

            console.log("Process Results...");
            s = moment();   
            for (let i = 0; i < invoiceResponses.length; i++) {
                const { invoiceResults = [], updatedContracts = [] } = invoiceResponses[i];
                const CCMContractID = grouped[i][0].CCMContractID;

                updatedContractsAll.push(...updatedContracts);

                const contractInfo = contractInfoMap.get(CCMContractID);

                for (const res of invoiceResults) {
                    if (!res) continue;

                    const contractNumber = res?.data?.ConditionContract;
                    const contractReference = res?.data?.ExternalDocumentReferenceID;

                    if (!contractNumber) continue;

                    createdInvoiceContracts.push(contractNumber);

                    const payload = typeof res.config.data === 'string'
                        ? res.config.data
                        : JSON.stringify(res.config.data);

                    // Contract updates
                    if (contractInfo?.ContractNumber) {
                        dbOps.push(
                            UPDATE(CCMContract)
                                .with({ PreviousContractNumber: contractInfo.ContractNumber, Expired: false })
                                .where({ ID: CCMContractID })
                        );
                    }

                    dbOps.push(
                        UPDATE(CCMContract).with({
                            ContractNumber: contractNumber,
                            ContractReferene: contractReference,
                            Synchronized: true,
                            Expired: false,
                            CreationDate: today
                        }).where({ ID: CCMContractID }),

                        UPDATE(FastConditionContracts)
                            .with({ hasActiveContracts: true })
                            .where({ ID: FastCCMContractId })
                    );

                    logs.push({
                        ContractNumber: contractNumber,
                        ContractReference: contractReference,
                        PayloadType: 'Invoice',
                        PayloadToSAP: payload,
                        Synchronized: true,
                        createdAt: new Date().toISOString(),
                        createdBy: req.user.id,
                        CCMContractID
                    });

                    // Excluded customers
                    let bvheaders = Array.isArray(res?.data?.bvheader)
                        ? res.data.bvheader
                        : [res?.data?.bvheader];

                    const excludedCustomers = bvheaders
                        .filter(h => h?.incl_excl === "E" && h?.customer)
                        .map(h => ({ customer: String(h.customer), itemGUID: h.itemguid }));
                    
                    const { byCustomer } = hierarchyByContract.get(CCMContractID) ?? { byCustomer: new Map() };

                    for (const cust of excludedCustomers) {
                        const match = byCustomer.get(cust.customer);

                        if (match) {
                            excludedMatched.push(cust.customer);

                            dbOps.push(
                                UPDATE(CustomerHierarchy)
                                    .set({ Excluded: true })
                                    .where({ ID: match.ID, CustomerID: cust.customer }),

                                INSERT.into(ContractItemGUID).entries({
                                    ConditionDocument: contractNumber,
                                    CustomerID: cust.customer,
                                    ItemGUID: cust.itemGUID,
                                    CCMContract_ID: CCMContractID
                                })
                            );
                        }
                    }
                }
            }

            // Rebate batch
            rebateResponses.forEach(resp => {
                const contractNumber = resp?.data?.ConditionContract;
                const ref = resp?.data?.ExternalDocumentReferenceID;

                if (!contractNumber || !ref) return;

                const settlement = rebateSettlementData.find(s => s.SettlementID === ref);
                if (!settlement) return;

                dbOps.push(
                    UPDATE(SettlementsDate)
                        .with({
                            RebateContractNumber: contractNumber,
                            Synchronized: true,
                            CreationDate: today
                        })
                        .where({ SettlementID: settlement.SettlementID })
                );

                logs.push({
                    ContractNumber: contractNumber,
                    ContractReference: ref,
                    PayloadType: 'Rebate',
                    PayloadToSAP: JSON.stringify(resp.config.data),
                    Synchronized: true,
                    createdAt: new Date().toISOString(),
                    createdBy: req.user.id,
                    CCMContractID: settlement.CCMContractID
                });
            });

            if (logs.length) {
                dbOps.push(INSERT.into(ConditionContractsLog).entries(logs));
            }

            if (dbOps.length) {
                await Promise.all(dbOps.map(q => tx.run(q)));
            }

            e = moment();
            logTime("Process Results", s, e);

            endTime = moment();
            console.log("TOTAL createAllCCMContract END:", endTime.format());
            logTime("TOTAL createAllCCMContract", startTime, endTime);
            // Response
            return req.reply(
                `${createdInvoiceContracts.length ? `Invoice: ${createdInvoiceContracts.join(", ")}` : "No Invoice"} + ` +
                `${updatedContractsAll.length ? `Updated: ${updatedContractsAll.join(", ")}` : ""} + ` +
                `${excludedMatched.length ? `Excluded: ${excludedMatched.join(", ")}` : ""} + ` +
                `${rebateResponses.length} Rebate`
            );

        } catch (error) {
            let statusCode = 500;
            error.request = req;
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
                    error.inputPayload = inputPayload;
                } else {
                    console.error('No InputPayload found in the SAP error response');
                }
                statusCode = error.response.status || 502;
            }
            else if (error.message) {
                console.error("App Error:", error.message);
                userMessage = error.message;
                statusCode = typeof error.code === 'number' ? error.code : 500;
            }
            else {
                console.error("Unhandled Error:", error);
            }
            error.message = userMessage;
            logError(error);
            return req.reject(statusCode, userMessage);
        }
    });

    async function fetchContractContext(tx, FastCCMContractId) {
        const [
            existingContractInfo,
            sourceData,
            rebateSourceData
        ] = await Promise.all([
            tx.run(SELECT.from(ExistingContractInfo)),
            tx.run(SELECT.from(ContractPayloadView).where({ FastConditionContractID: FastCCMContractId })),
            tx.run(SELECT.from(ContractRebatePayloadView).where({ FastConditionContractID: FastCCMContractId }))
        ]);

        const rebateContractIDs = [...new Set(rebateSourceData.map(r => r.CCMContractID))];

        const rebateSettlementData = rebateContractIDs.length
            ? await tx.run(SELECT.from(SettlementsDate).where({ CCMContractID: { in: rebateContractIDs } }))
            : [];

        return { existingContractInfo, sourceData, rebateSourceData, rebateSettlementData };
    }

    async function expireContracts(tx, existingContractInfo) {
        if (!existingContractInfo?.length) return;

        const contractIDs = existingContractInfo.map(i => i.CCMContractID);
        const fastIDs = existingContractInfo.map(i => i.FastConditionContractID);

        await Promise.all([
            tx.run(UPDATE(CCMContract).with({ Expired: true }).where({ ID: { in: contractIDs } })),
            tx.run(UPDATE(FastConditionContracts).with({ hasExpiredContracts: true }).where({ ID: { in: fastIDs } }))
        ]);
    }

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
            const userCountryMap = new Map();
            for (const user of userCountries) {
                if (!userCountryMap.has(user.CWID)) {
                    userCountryMap.set(user.CWID, new Set());
                }
                userCountryMap.get(user.CWID).add(user.CountryCode);
            }

            const exclusiveESCWIDs = new Set(
            [...userCountryMap.entries()]
                .filter(([_, countries]) => countries.size === 1 && countries.has('ES'))
                .map(([CWID]) => CWID)
            );

            // Filter original list — keep only users whose CWID is in the exclusive ES list
            let exclusiveESUsers = userCountries.filter(user => exclusiveESCWIDs.has(user.CWID));

            exclusiveESUsers = Array.from(
                new Map(exclusiveESUsers.map(user => [user.CWID, user])).values()
            );

            exclusiveESUsers.sort((a, b) =>
                a.UserName.localeCompare(b.UserName, 'en', { sensitivity: 'base' })
            );

            return exclusiveESUsers;

        }catch(error){
                return req.reject(403, "Failed to fetch user countries")
        }
    });

    srv.on('terminateCCMContract', async (req) => {
        const tx = cds.tx(req);
        try {
            const { FastCCMContractId, CCMContractID, ProductCode, TerminationDate, CancellationNote } = req.data;
            
            const sourceData = await tx.run(SELECT.one.from(CCMContract).where({ID: CCMContractID}));
            console.log("Process Terminate Contracts");
            const {response, body} = await handleExistingContract(tx, 'ES', "ConditionContract", {ExistingContractNumber: sourceData.ContractNumber,ExpireDate: TerminationDate});
            
            if (response?.status !== 200) {
                throw new Error(`Termination of ExistingContract failed for ${sourceData.ContractNumber}`);
            }

            console.log(`Contract ${sourceData.ContractNumber} terminated successfully. End date updated to ${TerminationDate} in SAP.`);
            const inserts = {
                ContractNumber    : sourceData.ContractNumber,
                ContractType      : sourceData.ContractType,
                ContractReference : sourceData.ContractReference,        
                PayloadType       : 'TerminateInvoiceContract',         
                PayloadToSAP      : JSON.stringify(body),
                Synchronized      : true,    
                createdAt         : new Date().toISOString(),
                createdBy         : req.user.id,
                CCMContractID     : CCMContractID
            }
            await tx.run(INSERT.into(ConditionContractsLog).entries(inserts));
            await tx.run(UPDATE(CCMContract).with({ CCMContractEndDate: TerminationDate, CancellationComment: CancellationNote, Cancelled: true}).where({ ID: CCMContractID }));
            await tx.run(UPDATE(FastConditionContracts).with({ hasCancelledContracts: true}).where({ ID: FastCCMContractId }));

            return req.reply(`Contract ${sourceData.ContractNumber} terminated successfully. End date updated to ${TerminationDate} in SAP.`);

        } catch (error) {
            let statusCode = 500;
            error.request = req;
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
                    error.inputPayload = inputPayload;
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
            error.message = userMessage;
            logError(error);
            return req.reject(statusCode, userMessage);
        }
    });


    srv.on("getSAPSalesOrderSimulation", async (req) => {
        const tx = cds.tx(req);

        try {
            const { CCMContractID } = req.data;
            let customerID = null;
            const ccmContract = await tx.run(SELECT.one.from(CCMContract).columns('*', 'CCMCustomer.AssortmentReference', 'CCMCustomer.CustomerID', 'CCMCustomer.InstituteType').where({ ID: CCMContractID }));
            const fastContractPrice = await tx.run(SELECT.one.from(PriceConditionInvoice).where({ CCMContract_ID: CCMContractID }));
            const material = await tx.run(SELECT.one.from(CCMMaterial).columns('MaterialNumber').where({
                    CCMContract_ID: CCMContractID,
                    ActiveRecord: 1
                })
            );
            const currentInvoicePrice = await tx.run(SELECT.one.from(CurrentInvoicePrice).where({
                CCMContract_ID: req.data.CCMContractID
            }));

            if (!ccmContract || !material) return req.reject(404, "Contract is not found");
            customerID = ccmContract?.CCMCustomer_CustomerID;
            if(ccmContract?.CCMCustomer_AssortmentReference !== null){
                const ccmContractHire = await tx.run(SELECT.one.from(CustomerHierarchy).where({ CCMContractID: CCMContractID }));
                customerID = ccmContractHire?.CustomerID;
            }
            const masterPrice = await getProductMasterPrice(ccmContract?.CountryCode, ccmContract?.ProductCode);
            const body = updateSAPSalesOrderSimulationRequestBody(customerID, material?.MaterialNumber);
            const response = await getSAPSalesOrderSimulation(tx, ccmContract?.CountryCode, "SalesOrderSimulation", body);

            const pricingElements = response.data.d.to_Item.results[0].to_PricingElement.results;
            if (!pricingElements) {
                return req.reject(404, "No Pricing Exist in SAP");
            }
            
            const {mappedData, priceUpdateStatuses} = mapPricingElementsToDbFormat(pricingElements, fastContractPrice, CCMContractID, material?.MaterialNumber, ccmContract, masterPrice);

            if (!mappedData.ConditionType) {
                return req.reject(422, "SAP response does not match any FAST ConditionType");
            }
            
            if(currentInvoicePrice){
                await tx.run(UPDATE(CurrentInvoicePrice).with(mappedData).where({ID: currentInvoicePrice.ID}));
            }else{
                await tx.run(INSERT.into(CurrentInvoicePrice).entries(mappedData));
            }

            await tx.run(UPDATE(FastConditionContracts).with({ ...priceUpdateStatuses }).where({ ID: ccmContract.FastConditionContracts_ID }));

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

    function mapPricingElementsToDbFormat(pricingElements, fastContractPrice, CCMContractID, materialNumber, contract, masterPrice) {
		const result = {
            ConditionType: fastContractPrice.ConditionType,
            Currency: "EUR",
            CountryCode: contract?.CountryCode,
            SoldToParty: contract?.CCMCustomer_CustomerID,
            Material: materialNumber,
            YP00: fastContractPrice.YP00,
            YP04: fastContractPrice.YP04,
            YP10: fastContractPrice.YP10,
            YD75: fastContractPrice.YD75,
            YD30: fastContractPrice.YD30,
            YD06: fastContractPrice.YD06,
            YD02: fastContractPrice.YD02,
            SapTax: fastContractPrice.SapTax,
            Tax: fastContractPrice.Tax || null,
            ConfidentialPrice: fastContractPrice.ConfidentialPrice,
            RoyalDecree: fastContractPrice.RoyalDecree || null,
            RoyalDecreeValue: fastContractPrice.RoyalDecreeValue || null,
            RoyalDecreeIncl: fastContractPrice.RoyalDecreeIncl || null,
            NetPriceWithoutTaxAfterDeductionRD: fastContractPrice.NetPriceWithoutTaxAfterDeductionRD,
            NetPriceWithTaxAfterDeductionRD: fastContractPrice.NetPriceWithTaxAfterDeductionRD,
            NetPriceWithoutTax: fastContractPrice.NetPriceWithoutTax,
            NetPriceWithTax: fastContractPrice.NetPriceWithTax,
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
                const sapTax = parseFloat(ConditionAmount || 0);
                result.SapTax = sapTax ? (UoM === "Pack" ? (sapTax / 10000) : (sapTax / 10000 / packFactor)) : 0;
            }


            if (PricingProcedureStep === "306") {
                const netPriceWithoutTax = parseFloat(ConditionAmount || 0);
			    result.NetPriceWithoutTax = netPriceWithoutTax ? (UoM === "Pack" ? (netPriceWithoutTax / 10000) : (netPriceWithoutTax / 10000 / packFactor)) : 0;
            }
		}
	
		// Assign the condition values
		const YP00 = conditions["YP00"]?.ConditionAmount || 0;
        const YP04 = conditions["YP04"]? Math.abs(conditions["YP04"].ConditionAmount) : 0;
		//const YP04 = conditions["YP04"] ? Math.abs(conditions["YP04"].ConditionRateValue) / 100 : 0;
		const YP10 = conditions["YP10"]?.ConditionAmount ?? null;
		const YD02 = conditions["YD02"] ? Math.abs(conditions["YD02"].ConditionRateValue) / 100 : 0;
		const YD06 = conditions["YD06"] ? Math.abs(conditions["YD06"].ConditionRateValue) / 100 : 0;
		const YD75 = conditions["YD75"]?.ConditionAmount ?? null;
		const YD30 = conditions["YD30"]?.ConditionAmount ?? 0;

        /** YP04 coming via OrderSimulate is neither confidential discount nor confidential price. 
		 * It is the reduction amount from YP00. 
		 * However we are still using YP04 as a 'ConfidentialDiscount' on CurrentPricing and NewPricing Section on UI, 
		 * as adding separate field for 'ConfidentialDiscount' could potentially cause regressions*/
        result.YP00 = YP00 ? UoM === 'Pack' ? (YP00 / 10000) : (YP00 / 10000 / packFactor) : 0;
        YP04 = YP04 ? UoM === 'Pack' ? (YP04 / 10000) : (YP04 / 10000 / packFactor) : 0;
        result.YP04 = (YP04 / result.YP00);
		result.ConfidentialPrice = YP04 ? result.YP00 - YP04 : result.YP00;
        const isPVLUpdated = !!(result.YP00 && fastContractPrice?.YP00 !== YP00);
        const isConfidentialPriceUpdated = !!(YP04 && fastContractPrice?.ConfidentialPrice !== result.ConfidentialPrice);
        
        result.YP00 = isPVLUpdated ? result.YP00 : fastContractPrice.YP00;
        result.YP04 = isConfidentialPriceUpdated ? result.YP04 : fastContractPrice.YP04;
        result.ConfidentialPrice = isConfidentialPriceUpdated ? result.ConfidentialPrice : result.YP00;

        const useConfidential = result.YP04 !== 0;
        const basePrice = useConfidential ? result.ConfidentialPrice : result.YP00;

        result.YD75 = (basePrice - result.YP10) / basePrice;
    
        // Mapped values for NETPRICE fields
        result.NetPriceWithoutTax = fastContractPrice.ConditionType === "DescuentoComercial" ? result.ConfidentialPrice * (1 - result.YD02 - result.YD06) : null;  
        result.NetPriceWithTax = fastContractPrice.ConditionType === "DescuentoComercial" ? result.NetPriceWithoutTax * (1 + result.Tax) : result.NetPriceWithTax;  

	
        const priceUpdateStatuses = {
            "hasUpdatedPVL": Number(result.YP00) !== Number(fastContractPrice.YP00),
            "hasUpdatedConfidentialPrice": Number(result.ConfidentialPrice) !== Number(fastContractPrice.ConfidentialPrice),
            "hasNetPriceAbovePVL": false,
            "hasNetPriceBelowFloorPrice": false
        }

        const prafFields = {
            "Private Account": "PRAF_Private",
            "Public Account": "PRAF_Public"
        }

        const praf = masterPrice ? masterPrice[prafFields[contract.CCMCustomer_InstituteType]] : 0;
        const prafValue = contract.UoM === 'Pack' ? praf : (praf / contract.PackFactor);

        const netPrice = result.YD06 ? applyDiscounts(result.YP10, result.YD06) : result.YP10;
        let priceCheckbasePrice = result.YP00;

        // Compare PRaF value vs Floor Price
        priceUpdateStatuses.hasNetPriceBelowFloorPrice = prafValue > netPrice;

        if (YP04 > 0) {
            priceUpdateStatuses.hasNetPriceAbovePVL = netPrice > result.ConfidentialPrice;
            priceCheckbasePrice = result.ConfidentialPrice;
        }else {
            priceUpdateStatuses.hasNetPriceAbovePVL = netPrice > result.YP00;
            priceCheckbasePrice = result.YP00;
        }

        const discountedPrice = result.YD06
            ? applyDiscounts(priceCheckbasePrice, result.YD02, result.YD06)
            : applyDiscounts(priceCheckbasePrice, result.YD02);

        priceUpdateStatuses.hasNetPriceBelowFloorPrice = prafValue > discountedPrice;
	
		return {
            mappedData: result,
            priceUpdateStatuses
        };
	}

    function applyDiscounts(price, ...discounts) {
        const totalDiscount = discounts.reduce((sum, d) => sum + (d || 0), 0);
        return price * (1 - totalDiscount);
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

                await tx.run(UPDATE(FastConditionContracts).with({ 
                    hasUpdatedPVL: false,
                    hasUpdatedConfidentialPrice: false,
                    hasNetPriceAbovePVL: false,
                    hasNetPriceBelowFloorPrice: false 
                }).where({ ID: contract.FastConditionContracts_ID }));
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
            YP00: pricing.YP00,
            YP04: pricing.YP04,
            YD75: pricing.YD75,
            ConfidentialPrice: pricing.ConfidentialPrice,
            NetPriceWithoutTax: pricing.NetPriceWithoutTax,
            NetPriceWithTax: pricing.NetPriceWithTax
        }
    }
    
    async function getProductMasterPrice(countryCode, productCode) {
        const fastbackendAPI = await cds.connect.to("FASTBACKEND_API");
        const response = await fastbackendAPI.send({
            method: 'GET',
            path: `/v2/conditioncontracting/MasterPrices?$filter=CountryCode eq '${countryCode}' and ProductPackId eq ${productCode}`,
        });

        return response?.d[0];
    }

    srv.on('getUserCountries', async (req) => {
        const tx = cds.tx(req);
        try {
            let userCountries = await getUserCountries();
            // Filter for the logged-in user's CWID
            console.log("Requesting user countries for CWID:", req.user.id);
            userCountries = userCountries.filter((c) => c.CWID === req.user.id);
            console.log("Filtered user countries for the requesting user:", userCountries);
            return userCountries;
        }catch(error){
            return req.reject(403, "Failed to fetch user countries")
        }
    });

    function logError(err) {
        cds.spawn(async (tx) => {
            const inserts = {            
                PayloadToSAP      : err.payload ? JSON.stringify(err.payload) : JSON.stringify(err.inputPayload),
                Synchronized      : false,    
                createdAt         : new Date().toISOString(),
                createdBy         : err.request.user.id,
                ErrorMessage     : err.message,
                CCMContractID: err.request.data.CCMContractID
            }
            await tx.run(INSERT.into(ConditionContractsLog).entries(inserts));
        })
    }

    srv.getSAPSalesOrderSimulationRequestBody = getSAPSalesOrderSimulationRequestBody;

    srv.on("addNewMaterialNumberToExistingContract", async (req) => {
        try {
            const {FastCCMContractId} = req.data;
            const tx = cds.tx(req);
            const contracts = await tx.run(SELECT.from(CCMContract).where({FastConditionContracts_ID: FastCCMContractId}));
            const sourceData = await tx.run(SELECT.from(ContractNewMaterialNumberPayloadView).where({
                CCMContractID: {in: contracts.map(contract => contract.ID)}, FastConditionContractID: FastCCMContractId
            }));
            const contractNumbers = [
                ...new Set(
                    sourceData
                    .map(el => el.ContractNumber)
                    .filter(Boolean)
                )
            ];

            const sapResponses = [];

            if (Array.isArray(sourceData) && sourceData.length === 0) req.reject(403, "No Maetrials found");

            for (let cn of contractNumbers) {
                const filteredSourceData = sourceData.filter(sd => sd.ContractNumber === cn);
                const sapResponse = await addNewMaterNumberToExistingContract(tx, 'ES', "ConditionContract", filteredSourceData);
                if (!sapResponse) req.reject(403, "No response received from SAP");
                sapResponses.push(sapResponse.data);
            }

            const result = await prepareContractUpdateResponse(sapResponses, FastCCMContractId, contracts);
            

            return req.reply(JSON.stringify(result));

        } catch (error) {
            let statusCode = 500;
            error.request = req;
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
                    error.inputPayload = inputPayload;
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
            error.message = userMessage;
            logError(error);
            return req.reject(statusCode, userMessage);
        }
    })

    async function addNewMaterNumberToExistingContract (tx, countryCode, resource, sourceData) {
        let body;
        try {
            const apiConfig = await tx.run(SELECT.one.from(APIDefinition).where({ Provider: 'ConditionContract', CountryCode: countryCode, Resource: resource, Name: 'AddNewMaterialNumbersToExistingContracts' }));
            const apiBodyMappings = await tx.run(SELECT.from(APIBody).where({ APIDefinition_ID: apiConfig.ID }));
            if (!apiBodyMappings) {
                throw new Error("ERR_MISSING_PARAMETER:API body Mappings not found");
            }
            body = buildNewMaterialNumberPayloadFromMappings(sourceData, apiBodyMappings);
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
            error.payload = body;
            throw error
        }
    }

    function buildNewMaterialNumberPayloadFromMappings (sourceData, apiBodyMappings) {
        const finalResult = {};

        const conditionTypeMap = {
            DescuentoComercial: 'YD02',
            PrecioNeto: 'YP10',
        };

        const staticMappings = apiBodyMappings.filter(m => !m.Source.startsWith('ContractNewMaterialNumberPayloadView.'));
        const dynamicMappings = apiBodyMappings.filter(m => m.Source.startsWith('ContractNewMaterialNumberPayloadView.'));

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
                const field = Source.replace('ContractNewMaterialNumberPayloadView.', '');
                let value = row[field];

                if (value === undefined || value === null) continue;

                if (field === 'ConditionType' && Target.includes('ConditionType')) {
                    conditionTypeValue = value === 'PrecioNeto' ? (row?.PriceConditionCode === 'YP11' ? 'YP11' : 'YP10') : conditionTypeMap[value] || value;
                    value = conditionTypeValue;
                }

                if (field === 'YD02' && Target.endsWith('ConditionRateRatio')) {
                    value = parseFloat((value * 100).toFixed(3));
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
                    if (conditionTypeValue === 'YP10' || conditionTypeValue === 'YP11') {
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
                if (conditionRecord.ConditionType === 'YP10' || conditionRecord.ConditionType === 'YP11') {
                    delete conditionRecord.ConditionRateRatioUnit;
                    delete conditionRecord.ConditionRateRatio;
                    delete conditionRecord.ConditionRateRatioUnitISOCode;
                }
                conditionRecords.push(conditionRecord);
            }
            
            if (Object.keys(bvheaderEntry).length > 0) {
                bvheaderList.push(bvheaderEntry);
            }
        }

        if (conditionRecords.length > 0) {
            setNestedValue(finalResult, 'ConditionContract.ConditionContractType._CndnContrCndnRecord', [
                "",
                { CndnContrConditionRecordType: conditionRecords }
            ]);
        }

        setNestedValue(finalResult, 'ConditionContract.conditioncontract', {});
        setNestedValue(finalResult, 'ConditionContract.bvheader', "");

        return finalResult;
    }

    function parseSapODataV4Batch(batchText) {
        const results = [];

        const responses = batchText.split(/HTTP\/1\.1\s+/).slice(1);

        for (const r of responses) {
            // --- FIX 1: clean status line ---
            const statusLine = r.slice(0, r.indexOf('\n')).trim();
            const statusMatch = statusLine.match(/^(\d{3})\s+([A-Za-z ]+)/);
            if (!statusMatch) continue;

            const statusCode = Number(statusMatch[1]);
            const statusText = statusMatch[2];
            const isError = statusCode >= 400;

            // --- JSON extraction (unchanged, safe) ---
            let body;
            const jsonStart = r.indexOf('{');
            if (jsonStart !== -1) {
                const boundaryIndex = r.indexOf('\n--', jsonStart);
                const jsonBlock =
                    boundaryIndex !== -1 ? r.slice(jsonStart, boundaryIndex) : r.slice(jsonStart);

                const lastBrace = jsonBlock.lastIndexOf('}');
                if (lastBrace !== -1) {
                    try {
                        body = JSON.parse(jsonBlock.slice(0, lastBrace + 1));
                    } catch {
                        body = undefined;
                    }
                }
            }

            // --- ERROR HANDLING ---
            if (isError && body?.error) {
                const e = body.error;

                // 1️⃣ ALWAYS push parent error first
                if (e.message) {
                    results.push({
                    statusCode,
                    statusText,
                    success: false,
                    message: e.message,
                    code: e.code,
                    target: e.target,
                    contentId: e['@SAP__core.ContentID'],
                    body: e
                    });
                }

                // 2️⃣ Push each detail as separate error
                if (Array.isArray(e.details)) {
                    for (const d of e.details) {
                        results.push({
                            statusCode,
                            statusText,
                            success: false,
                            message: d.message,
                            code: d.code,
                            target: d.target,
                            contentId: d['@SAP__core.ContentID'],
                            body: d
                        });
                    }
                }

                continue;
            }

            // --- SUCCESS ---
            results.push({
                statusCode,
                statusText,
                success: true,
                message: statusText,
                body
            });
        }

        return results;
    }



    async function prepareContractUpdateResponse (sapResponseData, FastCCMContractId, contracts) {
        const promises = [];
        const parsedBatchResponses = [];

        for (let sapResponse of sapResponseData) {
            const batchResponses = parseSapODataV4Batch(sapResponse);
            parsedBatchResponses.push(batchResponses);
        }
        const flatParsedBatchResponses = parsedBatchResponses.flat();
        const allRequestsSucceded = flatParsedBatchResponses.every(el => el.success);

        if (allRequestsSucceded) {
            promises.push(UPDATE(FastConditionContracts).with({ hasNewMaterialNumber: false }).where({ ID: FastCCMContractId }));
        }

        for (let br of flatParsedBatchResponses) {
            if (br.success) {
                const existingContract = contracts.find(contract => contract.ContractNumber === br?.body?.ConditionContract);
                
                br.message = `Material: ${br?.body?.Product} added to the contract: ${br?.body?.ConditionContract}`;

                contracts.forEach(ctr => {
                    if (ctr.ID === existingContract.ID) {
                        ctr.NewMaterialNumber = ctr.NewMaterialNumber.split(',').filter(el => el != br?.body?.Product).join(',');
                    }
                })
                promises.push(UPDATE(CCMMaterial).with({ isNewMaterialNumber: false }).where({ CCMContract_ID: existingContract.ID, MaterialNumber:  br?.body?.Product}));
            }
        }

        promises.push(contracts.map(ctr => {
            return UPDATE(CCMContract).with({ NewMaterialNumber: ctr.NewMaterialNumber }).where({ ID: ctr.ID });
        }))

        await Promise.all(promises.flat());
        return flatParsedBatchResponses;
    }

    function validateSettlementCalendar({rebateSourceData, settlementData}) {
        // No rebate → no settlement needed → do nothing
        if (!Array.isArray(rebateSourceData) || rebateSourceData.length === 0) {
            return;
        }

        const settlementByContract = new Map(
            settlementData.map(s => [s.CCMContractID, s])
        );

        for (const row of rebateSourceData) {
            const hasSettlement = settlementByContract.has(row.CCMContractID);

            if (!hasSettlement) {
                const msg = `Please apply the settlement dates, as Rappels are included in the contract. Contract creation cannot proceed until the settlement dates are applied.`;
                const err = new Error(msg);
                err.code = 400;
                throw err;     
            }
        }
    }

    // =====================
    // CACHE INVALIDATION
    // =====================
    
    function invalidateAPI() {
        apiConfigCache.clear();
        apiBodyCache.clear();
        console.log(`Cache cleared for all resources`);
    }
 
    function invalidateInstituteCache() {
        instituteCache = null;
        lastFetchTime = 0;
        console.log(`Cache invalidated for institute`);
    }
    
    // =====================
    // CACHE STATS (MONITORING)
    // =====================
    function getCacheStats() {
        const stats = {
            apiConfigSize: apiConfigCache.size,
            apiBodySize: apiBodyCache.size,
            oauthTokenSize: oauthTokenCache.size,
            instituteCached: instituteCache ? instituteCache.length : 0,
            lastInstituteSync: lastFetchTime ? new Date(lastFetchTime).toISOString() : null,
            ttls: {
                API_CONFIG_TTL: '7 days',
                INSTITUTE_TTL: '24 hours',
                TOKEN_BUFFER: '1 min'
            },
            timestamp: new Date().toISOString()
        };

        return JSON.stringify(stats, null, 2);
    }

    srv.on('getCacheStats', (req) => {
        console.log('[CACHE SERVICE] Getting cache stats');
        return getCacheStats();
    });
    
    //Invalidate all caches
    srv.on('invalidateAPI', (req) => {
        console.log('[CACHE SERVICE] Invalidating all caches');
        invalidateAPI();
        
        return 'API caches cleared';
    });
    
    //Invalidate institute cache
    srv.on('invalidateInstitute', (req) => {
        console.log('[CACHE SERVICE] Invalidating institute cache');
        invalidateInstituteCache();
        
        return 'Institute cache cleared';
    });
    
    //Refresh institute data
    srv.on('refreshInstitute', async (req) => {
        console.log('[CACHE SERVICE] Refreshing institute data');
        
        try {
            const data = await fetchInstituteData();
            return `Institute data refreshed. Total: ${data.length} items`;
        } catch (error) {
            console.error('[CACHE SERVICE] Error refreshing institute:', error);
            return `Error: ${error.message}`;
        }
    });
};
