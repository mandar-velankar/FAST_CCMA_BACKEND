const cds = require('@sap/cds');


module.exports = (srv) => {

    srv.on('getBackendData', async(req)=>{
        const fastbackendAPI = await cds.connect.to("FASTBACKEND_API");
        const resultpost = await fastbackendAPI.send({
            method: 'GET', path: `/v2/conditioncontracting/getBackendData?CountryCode=%27ES%27`
        });
        return JSON.stringify(resultpost);
    })

    srv.before(['UPDATE', 'CREATE'], async (req) => {
        Object.prototype.hasOwnProperty.call(req.data, "CCMContractStartDate") && !req.data.CCMContractStartDate && req.error({ code: 404, message: "Contract Start Date is required.", target: "CCMContractStartDate" });
        Object.prototype.hasOwnProperty.call(req.data, "CCMContractEndDate") && !req.data.CCMContractEndDate && req.error({ code: 404, message: "Contract End Date is required.", target: "CCMContractEndDate" });
    })
};
