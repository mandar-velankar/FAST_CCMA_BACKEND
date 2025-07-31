using {com.bayer.SXTENDER.ccma} from '../db/schema';

service ConditionContract {

    entity FastConditionContracts                 as projection on ccma.FastConditionContracts;
    entity CCMContract                            as projection on ccma.CCMContract;
    entity CCMCustomer                            as projection on ccma.CCMCustomer;
    entity CCMMaterial                            as projection on ccma.CCMMaterial;
    entity CurrentInvoicePrice                    as projection on ccma.CurrentInvoicePrice;
    entity PriceConditionInvoice                  as projection on ccma.PriceConditionInvoice;
    entity PriceConditionRebate                   as projection on ccma.PriceConditionRebate;
    entity PriceConditionDiscountCondition        as projection on ccma.PriceConditionDiscountCondition;
    entity PriceConditionFOC                      as projection on ccma.PriceConditionFOC;
    entity SettlementsDate                        as projection on ccma.SettlementsDate;
    entity APIDefinition                          as projection on ccma.APIDefinition;
    entity APIConfigOAuth                         as projection on ccma.APIConfigOAuth;
    entity APIBody                                as projection on ccma.APIBody;


    entity FastConditionContractsView             as
        select from FastConditionContracts {
            *
        }

    entity CCMContractView                        as
        select from FastConditionContracts {
            key ID as FastConditionContractsID,
                CCMContract.ProductCode,
                CCMContract.CountryCode,
                CCMContract.ProductName,
                CCMContract.NewMaterialNumber,
                CCMContract.BrandID,
                CCMContract.BrandName,
                CCMContract.OfferPrice,
                CCMContract.hasRappel,
                CCMContract.hasFOC,
                CCMContract.CCMContractStartDate,
                CCMContract.CCMContractEndDate,
                CCMContract.ContractNumber,
                CCMContract.PreviousContractNumber,
                CCMContract.Synchronized,
                CCMContract.Notified,
                CCMContract.Extension,
                CCMContract.ExtensionPeriod,
                CCMContract.CreationDate,
                CCMContract.CCMCustomer.InstituteName,
                CCMContract.CCMCustomer.InstituteType,
                CCMContract.CCMCustomer.InstituteID,
                CCMContract.CCMCustomer.CustomerID
        };

    entity CCMContractInformationDetailView       as projection on FastConditionContracts;

    entity CCMContractProductsView                as
        projection on CCMContract {
            *,
            FastConditionContracts.ID as FastConditionContractsID,
            CCMCustomer.InstituteName,
            CCMCustomer.InstituteType
        };

    entity CCMContractInformationDetailDetailView as projection on CCMContract;

    // entity ContractPayloadView              as
    //     select from FastConditionContracts as fcc {
    //         key fcc.ID                                                          as FastConditionContractID,
    //             fcc.CCMContract.ID                                             as CCMContractID,
    //             fcc.ContractStartDate                                           as CndnContrValidFrom,
    //             fcc.ContractEndDate                                             as CndnContrValidTo,
    //             fcc.CustomerID                                                  as Customer,
    //             fcc.Division,
    //             fcc.CCMContract.CCMMaterial.PriceConditionInvoice.ConditionType as ConditionType,
    //             fcc.CCMContract.CCMMaterial.PriceConditionInvoice.YD06,
    //             fcc.CCMContract.CCMMaterial.PriceConditionInvoice.YP10,
    //             fcc.CCMContract.CCMContractStartDate                            as ConditionValidityStartDate,
    //             fcc.CCMContract.CCMContractEndDate                              as ConditionValidityEndDate,
    //             fcc.CCMContract.OfferPrice                                      as ConditionRateAmount,
    //             fcc.CCMContract.CCMMaterial.MaterialNumber                      as Product
    //     }group by fcc.ID,
    //             fcc.CCMContract.ID,
    //             fcc.CCMContract.ProductCode,
    //             fcc.ContractStartDate,
    //             fcc.ContractEndDate,
    //             fcc.CustomerID,
    //             fcc.Division,
    //             fcc.CCMContract.CCMMaterial.PriceConditionInvoice.ConditionType,
    //             fcc.CCMContract.CCMMaterial.PriceConditionInvoice.YD06,
    //             fcc.CCMContract.CCMMaterial.PriceConditionInvoice.YP10,
    //             fcc.CCMContract.CCMContractStartDate,
    //             fcc.CCMContract.CCMContractEndDate,
    //             fcc.CCMContract.OfferPrice,
    //             fcc.CCMContract.CCMMaterial.MaterialNumber;

    entity ContractPayloadView as select from FastConditionContracts as fcc 
        inner join CCMContract as ccm on ccm.FastConditionContracts.ID = fcc.ID 
        inner join CCMMaterial as mat on mat.CCMContract.ID = ccm.ID and mat.ActiveRecord = 1
        left outer join PriceConditionInvoice as pci 
            on pci.ProductCode = mat.ProductCode and fcc.OfferID = pci.OfferID{
        key fcc.ID as FastConditionContractID,
        key ccm.ID as CCMContractID,
        key ccm.ProductCode,
            ccm.CCMCustomer.AssortmentReference,
            fcc.ContractStartDate as CndnContrValidFrom,
            fcc.ContractEndDate as CndnContrValidTo,
            fcc.CustomerID as Customer,
            fcc.Division,
            pci.ConditionType,
            pci.YD02,
            pci.YD06,
            pci.YP10,
            pci.RequestedVolume,
            ccm.CCMContractStartDate as ConditionValidityStartDate,
            ccm.CCMContractEndDate as ConditionValidityEndDate,
            ccm.OfferPrice as ConditionRateAmount,
            mat.MaterialNumber as Product,
            fcc.SAPID
    }


entity CCMContractPricingFormView                  as
    select from CCMContract as ccmcontract
    inner join FastConditionContracts as fcc
        on fcc.ID = ccmcontract.FastConditionContracts.ID
    inner join PriceConditionInvoice as invoice
        on ccmcontract.ProductCode = invoice.ProductCode and fcc.OfferID = invoice.OfferID
    {
        key ccmcontract.ID as CCMContractID,
            invoice.ConditionType,
            invoice.CountryCode,
            invoice.YP00,
            invoice.YP04,
            invoice.YP10,
            invoice.YD75,
            invoice.YD30,
            invoice.YD06,
            invoice.YD02,
            invoice.Tax,
            invoice.ConfidentialPrice,
            invoice.RoyalDecree,
            invoice.RoyalDecreeValue,
            invoice.RoyalDecreeIncl,
            invoice.NetPriceWithoutTaxAfterDeductionRD,
            invoice.Currency,
            invoice.Region,
            invoice.NetPriceWithTaxAfterDeductionRD,
            invoice.NetPriceWithoutTax,
            invoice.NetPriceWithTax,
            invoice.MaximumPrice,
            invoice.RequestedVolume,
            invoice.RentalPrice,
            invoice.MonthlyRentPerUnit,
            invoice.AnnualValue
    }

entity CCMContractFOCTableView                     as
    select from CCMContract as ccmcontract
    inner join FastConditionContracts as fcc
        on fcc.ID = ccmcontract.FastConditionContracts.ID
    inner join PriceConditionFOC as foc
        on ccmcontract.ProductCode = foc.ProductCode and fcc.OfferID = foc.OfferID
    {
        key ccmcontract.ID as CCMContractID,
            ccmcontract.ProductName,
            foc.OfferID,
            foc.CountryCode,
            foc.ProductCode,
            foc.FreeGoodsOther,
            foc.FreeGoodsOther_Step,
            foc.FreeGoodsOther_ABS_PCT,
            foc.VAT,
            foc.FOCMinAmount,
            foc.FOCBonus,
            foc.PotentialGeneratedSavings,
            foc.RoyalDecree,
            foc.ADD_INCLUDE
    }

entity CCMContractRebateFormView                   as
    select from CCMContract as ccmcontract
    inner join FastConditionContracts as fcc
        on fcc.ID = ccmcontract.FastConditionContracts.ID
    inner join PriceConditionRebate as rebate
        on ccmcontract.ProductCode = rebate.ProductCode and fcc.OfferID = rebate.OfferID
    {
        key ccmcontract.ID as CCMContractID,
            rebate.ID as PriceConditionRebateID: UUID,
            rebate.OfferID,
            rebate.ProductCode,
            rebate.CountryCode,
            rebate.YP00,
            rebate.ConfidentialPrice,
            rebate.SettlementDescription,
            rebate.Tax,
            rebate.RoyalDecree,
            rebate.Liquidation,
            rebate.RefundDate,
            rebate.PriceConditionCode
    }

entity CCMContractRebateDiscountConditionTableView as
    select from PriceConditionDiscountCondition as descond
    inner join PriceConditionRebate as rebate
        on descond.PriceConditionRebate.ID = rebate.ID
    inner join CCMContract as ccmcontract
        on ccmcontract.ProductCode = rebate.ProductCode
    {
        key descond.ID,
            rebate.ID as PriceConditionRebateID: UUID,
            descond.Discount,
            descond.Volume,
            descond.NetPriceWithoutTax,
            descond.NetPriceWithTax,
            rebate.Tax
    } group by descond.ID,
            rebate.ID,
            descond.Discount,
            descond.Volume,
            descond.NetPriceWithoutTax,
            descond.NetPriceWithTax,
            rebate.Tax;


function getBackendData()                                                                        returns String;
action   createCCMContract(FastCCMContractId : UUID, CCMContractID : UUID, ProductCode : String) returns String;
action   createAllCCMContract(FastCCMContractId : UUID) returns String;
action   sendFOCToInteractMail(FastCCMContractId : UUID, CCMContractID : UUID, ProductCode : String) returns String;
}
