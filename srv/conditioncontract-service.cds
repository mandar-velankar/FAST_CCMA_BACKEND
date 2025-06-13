using {com.bayer.SXTENDER.ccma} from '../db/schema';

service ConditionContract {
    
    entity FastConditionContracts as projection on ccma.FastConditionContracts;
    entity CCMContract as projection on ccma.CCMContract;
    entity CCMCustomer as projection on ccma.CCMCustomer;
    entity CCMMaterial as projection on ccma.CCMMaterial;
    entity CurrentInvoicePrice as projection on ccma.CurrentInvoicePrice;
    entity PriceConditionInvoice as projection on ccma.PriceConditionInvoice;
    entity PriceConditionRebate as projection on ccma.PriceConditionRebate;
    entity PriceConditionFOC as projection on ccma.PriceConditionFOC;
    entity APIDefinition as projection on ccma.APIDefinition;
    entity APIBody as projection on ccma.APIBody;

    function getBackendData()returns String;
}
