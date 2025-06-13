const cds = require('@sap/cds');


module.exports = (srv) => {

    srv.on('getBackendData', async(req)=>{
        const fastbackendAPI = await cds.connect.to("FASTBACKEND_API");
        const resultpost = await fastbackendAPI.send({
            method: 'GET', path: `/v2/conditioncontracting/getBackendData?CountryCode=%27ES%27`
        });
        return JSON.stringify(resultpost);
    })
};
