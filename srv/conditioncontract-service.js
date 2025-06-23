const cds = require('@sap/cds');
const moment = require("moment");


module.exports = (srv) => {

    const {
		FastConditionContracts, CCMContract, CCMCustomer, CCMMaterial, PriceConditionInvoice,APIDefinition, APIBody
	} = cds.entities("om.bayer.SXTENDER.ccma");

    srv.on('getBackendData', async(req)=>{
        const fastbackendAPI = await cds.connect.to("FASTBACKEND_API");
        const resultpost = await fastbackendAPI.send({
            method: 'GET', path: `/v2/conditioncontracting/getBackendData?CountryCode=%27ES%27`
        });
        return JSON.stringify(resultpost);
    })

    srv.before(['UPDATE', 'CREATE'], async (req) => {
        const contractStartDateExists = Object.prototype.hasOwnProperty.call(req.data, "CCMContractStartDate");
        const contractEndDateExists = Object.prototype.hasOwnProperty.call(req.data, "CCMContractEndDate");
        contractStartDateExists && !req.data.CCMContractStartDate && req.error({ code: 404, message: "Contract Start Date is required.", target: "CCMContractStartDate" });
        contractEndDateExists && !req.data.CCMContractEndDate && req.error({ code: 404, message: "Contract End Date is required.", target: "CCMContractEndDate" });
        
        if (contractStartDateExists && contractEndDateExists) {
            if(!moment(req.data.CCMContractStartDate).isBefore(req.data.CCMContractEndDate))
                req.error({ code: 404, message: "Contract Start Date should be before the Contract End Date.", target: "CCMContractStartDate" });
        }
    })

    srv.on('createCCMContract', async (req) => {
        const tx = cds.tx(req);
        const { fastCCMContractID, ccmContractID, productCode} = req.data;
        const fastCCMContract = await tx.run(SELECT.one.from(FastConditionContracts).where({
					ID: fastCCMContractID
				}));
    });
};
