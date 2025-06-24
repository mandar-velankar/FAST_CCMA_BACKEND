using {com.bayer.SXTENDER.ccma} from '../db/schema';

service ConditionContract {

    entity FastConditionContracts           as projection on ccma.FastConditionContracts;
    entity CCMContract                      as projection on ccma.CCMContract;
    entity CCMCustomer                      as projection on ccma.CCMCustomer;
    entity CCMMaterial                      as projection on ccma.CCMMaterial;
    entity CurrentInvoicePrice              as projection on ccma.CurrentInvoicePrice;
    entity PriceConditionInvoice            as projection on ccma.PriceConditionInvoice;
    entity PriceConditionRebate             as projection on ccma.PriceConditionRebate;
    entity PriceConditionFOC                as projection on ccma.PriceConditionFOC;
    entity APIDefinition                    as projection on ccma.APIDefinition;
    entity APIConfigOAuth                   as projection on ccma.APIConfigOAuth;
    entity APIBody                          as projection on ccma.APIBody;


    entity FastConditionContractsView       as
        select from FastConditionContracts {
            *
        }

    entity CCMContractView                  as
        select from CCMContract as ccmcontract
        left join CCMCustomer as ccmcustomer
            on ccmcontract.ID = ccmcustomer.CCMContract.ID
        {
            key ccmcontract.ID                        as CCMContractID,
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
        };

    entity CCMContractInformationDetailView as projection on FastConditionContracts;

    entity CCMContractProductsView          as
        projection on CCMContract {
            *,
            FastConditionContracts.ID as FastConditionContractsID,
            CCMCustomer.InstituteName,
            CCMCustomer.InstituteType
        };

    entity CCMContractDetailView            as
        select from CCMContract {
            *
        };

    entity ContractPayloadView              as
        select from FastConditionContracts as fcc{
            key fcc.ID                   as FastConditionContractID,
            fcc.ContractStartDate    as CndnContrValidFrom,
            fcc.ContractEndDate      as CndnContrValidTo,
            fcc.CustomerID           as Customer,
            fcc.Division,
            fcc.CCMContract.CCMMaterial.PriceConditionInvoice.ConditionType        as ConditionType,
            fcc.CCMContract.CCMContractStartDate as ConditionValidityStartDate,
            fcc.CCMContract.CCMContractEndDate   as ConditionValidityEndDate,
            fcc.CCMContract.OfferPrice           as ConditionRateAmount,
            fcc.CCMContract.CCMMaterial.MaterialNumber       as Product
        }

    function getBackendData()                                                                        returns String;
    action   createCCMContract(FastCCMContractId : UUID, CCMContractID : UUID, ProductCode : String) returns String;
}
