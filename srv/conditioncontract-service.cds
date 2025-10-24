using {com.bayer.SXTENDER.ccma} from '../db/schema';

service ConditionContract @(requires:['f_tndr_cag_admin','f_tndr_cag_ccma_user','f_tndr_cag_technical_user','authenticated-user']){


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
    entity ContractItemGUID                       as projection on ccma.ContractItemGUID;
    entity ConditionContractsLog                   as projection on ccma.ConditionContractsLog;
    entity CustomerHierarchy                      as projection on ccma.CustomerHierarchy;


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
            fcc.InstituteID,
            fcc.Division,
            pci.ConditionType,
            pci.YD02,
            pci.YD06,
            pci.YP10,
            ccm.UoM,
            ccm.PackFactor,
            pci.RequestedVolume,
            ccm.CCMContractStartDate as ConditionValidityStartDate,
            ccm.CCMContractEndDate as ConditionValidityEndDate,
            ccm.OfferPrice as ConditionRateAmount,
            mat.MaterialNumber as Product,
            fcc.SAPID,
            fcc.ExternalID,
            fcc.Reference,
            fcc.TenderID,
            fcc.ContractType
    }

 entity ContractRebatePayloadView as select from FastConditionContracts as fcc 
    inner join CCMContract as ccm on ccm.FastConditionContracts.ID = fcc.ID
    inner join PriceConditionRebate as pcr
        on pcr.ProductCode = ccm.ProductCode and fcc.OfferID = pcr.OfferID
    left outer join MaxDiscountView as mdv
        on mdv.ProductCode = pcr.ProductCode and mdv.OfferID = pcr.OfferID {
    key fcc.ID as FastConditionContractID,
    key ccm.ID as CCMContractID,
    key ccm.ProductCode,
        ccm.CCMCustomer.AssortmentReference,
        fcc.ContractStartDate as CndnContrValidFrom,
        fcc.ContractEndDate as CndnContrValidTo,
        fcc.CustomerID as Customer,
        fcc.Division,
        pcr.PriceConditionDiscountCondition.Volume,
        pcr.PriceConditionDiscountCondition.Discount,
        mdv.MaxDiscount,
        pcr.YP00,
        pcr.ConfidentialPrice,
        pcr.SettlementDescription,
        pcr.Tax,
        pcr.RoyalDecree,
        pcr.Liquidation,
        pcr.RefundDate,
        pcr.PriceConditionCode,
        pcr.MarketIncentiveID,
        ccm.CCMContractStartDate as ConditionValidityStartDate,
        ccm.CCMContractEndDate as ConditionValidityEndDate,
        ccm.OfferPrice as ConditionRateAmount,
        ccm.EANUPCCode,
        fcc.SAPID,
        fcc.ExternalID,
        fcc.Reference,
        fcc.TenderID,
        fcc.ContractType
}

entity MaxDiscountView as select from PriceConditionRebate {
    key ProductCode,
    key OfferID,
    max(PriceConditionRebate.PriceConditionDiscountCondition.Discount) as MaxDiscount: Double
}
group by ProductCode, OfferID;

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
            rebate.PriceConditionCode,
            rebate.MarketIncentiveID,
            rebate.MarketIncentiveDescription
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

entity IdentifyExistingContract as select from FastConditionContracts as fcc 
    inner join CCMContract as ccm on ccm.FastConditionContracts.ID = fcc.ID 
    inner join CCMMaterial as mat on mat.CCMContract.ID = ccm.ID and mat.ActiveRecord = 1{
            fcc.ID as FastConditionContractID,
            ccm.ID as CCMContractID,
            ccm.ContractNumber,
            ccm.PreviousContractNumber,
            ccm.ItemGUID,
            ccm.Expired,
            ccm.ProductCode,
            ccm.CCMCustomer.AssortmentReference,
            ccm.CCMCustomer.InstituteID,
            fcc.ContractStartDate as CndnContrValidFrom,
            fcc.ContractEndDate as CndnContrValidTo,
        key fcc.CustomerID as Customer,
            fcc.Division,
            ccm.CCMContractStartDate as ConditionValidityStartDate,
            ccm.CCMContractEndDate as ConditionValidityEndDate,
            ccm.OfferPrice as ConditionRateAmount,
        key mat.MaterialNumber as Product,
            fcc.SAPID,
            fcc.ExternalID,
            fcc.Reference,
            fcc.TenderID,
            fcc.OfferID,
            fcc.ContractType
}where ccm.ContractNumber is not null
  and ccm.Expired = false and ccm.Cancelled = false
  and ccm.CCMContractEndDate >= CURRENT_DATE;

entity ExistingContractInfo as select from FastConditionContracts as fcc 
    inner join CCMContract as ccm on ccm.FastConditionContracts.ID = fcc.ID {
        key fcc.ID as FastConditionContractID,
        key ccm.ID as CCMContractID,
        ccm.ContractNumber,
        fcc.ContractStartDate as CndnContrValidFrom,
        fcc.ContractEndDate as CndnContrValidTo,
        ccm.CCMContractStartDate as ConditionValidityStartDate,
        ccm.CCMContractEndDate as ConditionValidityEndDate
}where ccm.ContractNumber is not null and ccm.CCMContractEndDate < CURRENT_DATE and ccm.Cancelled = false and ccm.Expired = false;

function getInstituteData() returns String;
function getESUsers() returns String;
function getUserCountries() returns String;
action   createCCMContract(FastCCMContractId : UUID, CCMContractID : UUID, ProductCode : String) returns String;
action   createAllCCMContract(FastCCMContractId : UUID) returns String;
action   sendFOCToInteractMail(FastCCMContractId : UUID, CCMContractID : UUID, ProductCode : String) returns String;
action   terminateCCMContract(FastCCMContractId : UUID, CCMContractID : UUID, ProductCode : String, TerminationDate: Date, CancellationNote: String) returns String;
action   getSAPSalesOrderSimulation(CCMContractID: UUID) returns String;
action   ignoreCurrentCCMPrice(CCMContractID: UUID) returns String;

entity BrandsView as select from CCMContract {
    key BrandID,
        BrandName
}where BrandID is not null
    and BrandName is not null
group by BrandID,
    BrandName;

entity BrandProductsView as select from CCMContract {
    key BrandID,
    key ProductCode,
    ProductName
}where BrandID is not null
and ProductCode is not null
and ProductName is not null
group by BrandID,
    ProductCode,
    ProductName;


entity ExistingContractInvoicePrices as select from FastConditionContracts as fcc 
    inner join CCMContract as ccm on ccm.FastConditionContracts.ID = fcc.ID 
    inner join CCMMaterial as mat on mat.CCMContract.ID = ccm.ID and mat.ActiveRecord = 1{
            fcc.ID as FastConditionContractID,
            ccm.ID as CCMContractID,
            ccm.ContractNumber,
            ccm.Expired,
            ccm.ProductCode,
            ccm.CCMCustomer.InstituteID,
            fcc.ContractStartDate as CndnContrValidFrom,
            fcc.ContractEndDate as CndnContrValidTo,
        key fcc.CustomerID as Customer,
            ccm.CCMContractStartDate as ConditionValidityStartDate,
            ccm.CCMContractEndDate as ConditionValidityEndDate,
        key mat.MaterialNumber as Product,
            fcc.TenderID,
            fcc.OfferID,
            fcc.ContractType,
            ccm.PriceConditionInvoice.YP00,
            ccm.PriceConditionInvoice.YP04,
            ccm.PriceConditionInvoice.YP10,
            ccm.PriceConditionInvoice.YD75,
            ccm.PriceConditionInvoice.YD30,
            ccm.PriceConditionInvoice.YD06,
            ccm.PriceConditionInvoice.YD02,
            ccm.PriceConditionInvoice.Tax,
            ccm.PriceConditionInvoice.ConfidentialPrice,
            ccm.PriceConditionInvoice.RoyalDecree,
            ccm.PriceConditionInvoice.RoyalDecreeValue,
            ccm.PriceConditionInvoice.RoyalDecreeIncl,
            ccm.PriceConditionInvoice.NetPriceWithoutTaxAfterDeductionRD,
            ccm.PriceConditionInvoice.NetPriceWithTaxAfterDeductionRD,
            ccm.PriceConditionInvoice.NetPriceWithoutTax,
            ccm.PriceConditionInvoice.NetPriceWithTax,
            ccm.PriceConditionInvoice.MaximumPrice,
            ccm.PriceConditionInvoice.RentalPrice,
            ccm.PriceConditionInvoice.AnnualValue,
}where ccm.ContractNumber is not null
  and ccm.Expired = false
  and fcc.ContractEndDate >= CURRENT_DATE;

entity CurrentCCMPricingView as select from CCMContract as ccmcontract
    inner join FastConditionContracts as fcc
        on fcc.ID = ccmcontract.FastConditionContracts.ID
    inner join PriceConditionInvoice as invoice
        on ccmcontract.ProductCode = invoice.ProductCode and fcc.OfferID = invoice.OfferID
    left join CurrentInvoicePrice as currentPrice
        on currentPrice.CCMContract.ID = ccmcontract.ID{
    key ccmcontract.ID,
    ccmcontract.CountryCode,
    ifnull(currentPrice.ConditionType, invoice.ConditionType) as ConditionType: String,
    ifnull(currentPrice.Currency, invoice.Currency) as Currency: String,
    ifnull(currentPrice.YP00, invoice.YP00) as YP00: Double,
    ifnull(currentPrice.YP04, invoice.YP04) as YP04: Double,
    ifnull(currentPrice.YP10, invoice.YP10) as YP10: Double,
    ifnull(currentPrice.YD75, invoice.YD75) as YD75: Double,
    ifnull(currentPrice.YD30, invoice.YD30) as YD30: Double,
    ifnull(currentPrice.YD06, invoice.YD06) as YD06: Double,
    ifnull(currentPrice.YD02, invoice.YD02) as YD02: Double,
    ifnull(currentPrice.Tax, invoice.Tax) as Tax: Double,
    ifnull(currentPrice.ConfidentialPrice, invoice.ConfidentialPrice) as ConfidentialPrice: Double,
    ifnull(currentPrice.RoyalDecree, invoice.RoyalDecree) as RoyalDecree: String,
    ifnull(currentPrice.RoyalDecreeValue, invoice.RoyalDecreeValue) as RoyalDecreeValue: Decimal,
    ifnull(currentPrice.RoyalDecreeIncl, invoice.RoyalDecreeIncl) as RoyalDecreeIncl: Boolean,
    ifnull(currentPrice.NetPriceWithoutTaxAfterDeductionRD, invoice.NetPriceWithoutTaxAfterDeductionRD) as NetPriceWithoutTaxAfterDeductionRD: Decimal,
    ifnull(currentPrice.NetPriceWithTaxAfterDeductionRD, invoice.NetPriceWithTaxAfterDeductionRD) as NetPriceWithTaxAfterDeductionRD: Decimal,
    ifnull(currentPrice.NetPriceWithoutTax, invoice.NetPriceWithoutTax) as NetPriceWithoutTax: Decimal,
    ifnull(currentPrice.NetPriceWithTax, invoice.NetPriceWithTax) as NetPriceWithTax: Decimal,
    ifnull(currentPrice.MaximumPrice, invoice.MaximumPrice) as MaximumPrice: Decimal,
    ifnull(currentPrice.RequestedVolume, invoice.RequestedVolume) as RequestedVolume: Integer,
    ifnull(currentPrice.RentalPrice, invoice.RentalPrice) as RentalPrice: Double,  
    ifnull(currentPrice.MonthlyRentPerUnit, invoice.MonthlyRentPerUnit) as MonthlyRentPerUnit: Double,
    ifnull(currentPrice.AnnualValue, invoice.AnnualValue) as AnnualValue: Double
}
}
