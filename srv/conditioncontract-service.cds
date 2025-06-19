using {com.bayer.SXTENDER.ccma} from '../db/schema';

service ConditionContract {

    entity FastConditionContracts     as projection on ccma.FastConditionContracts;
    entity CCMContract                as projection on ccma.CCMContract;
    entity CCMCustomer                as projection on ccma.CCMCustomer;
    entity CCMMaterial                as projection on ccma.CCMMaterial;
    entity CurrentInvoicePrice        as projection on ccma.CurrentInvoicePrice;
    entity PriceConditionInvoice      as projection on ccma.PriceConditionInvoice;
    entity PriceConditionRebate       as projection on ccma.PriceConditionRebate;
    entity PriceConditionFOC          as projection on ccma.PriceConditionFOC;
    entity APIDefinition              as projection on ccma.APIDefinition;
    entity APIBody                    as projection on ccma.APIBody;


    entity FastConditionContractsView as
        select from FastConditionContracts {
            *
        }

    entity CCMContractView as select from CCMContract as ccmcontract
        left join CCMCustomer as ccmcustomer on ccmcontract.ID = ccmcustomer.CCMContract.ID
        {
            key ccmcontract.ID as CCMContractID,
                ProductCode,
                ccmcontract.CountryCode,
                ccmcontract.ProductName,
                ccmcontract.NewMaterialNumber,
                ccmcontract.BrandID,
                ccmcontract.BrandName,
                ccmcontract.OfferPrice,
                ccmcontract.hasRappel,
                ccmcontract.hasFOC,
                ccmcontract.CCMContractStartDate,
                ccmcontract.CCMContractEndDate,
                ccmcontract.ContractNumber,
                ccmcontract.Synchronized,
                ccmcontract.Notified,
                ccmcontract.Extension,
                ccmcontract.ExtensionPeriod,
                ccmcontract.CreationDate,
                ccmcontract.FastConditionContracts.ID as FastConditionContractsID,
                ccmcustomer.InstituteName,
                ccmcustomer.InstituteType,
                ccmcustomer.InstituteID,
                ccmcustomer.CustomerID
        }

    function getBackendData() returns String;
}
