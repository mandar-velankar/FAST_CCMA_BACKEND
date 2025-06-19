namespace com.bayer.SXTENDER.ccma;
using { Currency, User, Country, managed, cuid, temporal } from '@sap/cds/common';

entity FastConditionContracts: cuid, managed {
  TenderID : String;
  OfferID  : String;
  CountryCode : String;
  InstituteID  : Integer;
  InstituteName: String;
  DistributorID: Integer;
  ContractStartDate: Date;
  ContractEndDate: Date;
  ContractType: String;
  CustomerID: Integer;
  Division: String;
  Reference: String;
  Status: String;
  Owner: String;
  BrandFilter: String;
  ProductFilter: String;
  Extension: Boolean;
  ExtensionPeriod: String;
  hasNewMaterialNumber: Boolean;
  hasActiveContracts: Boolean;
  hasUpdatedPVL: Boolean;
  hasUpdatedConfidentialPrice: Boolean;
  hasNetPriceAbovePVL: Boolean;
  hasNetPriceBelowFloorPrice: Boolean;
  hasExpiringSoonContracts: Boolean;
  hasExpiredContracts: Boolean;
  hasCancelledContracts: Boolean;
  hasContractsToBeSynchronized: Boolean;
  hasNewContracts: Boolean;
  CCMContract: Association to many CCMContract on CCMContract.FastConditionContracts = $self;
}

entity CCMContract: cuid, managed, temporal {
  ProductCode: String;
  CountryCode : String;
  ProductName: String;
  NewMaterialNumber: String;
  BrandID: String;
  BrandName: String;
  OfferPrice: Double;
  hasRappel: Boolean;
  hasFOC: Boolean;
  CCMContractStartDate: Date;
  CCMContractEndDate: Date;
  ContractNumber: String;
  Synchronized: Boolean;
  Notified: Boolean;
  Extension: Boolean;
  ExtensionPeriod: String;
  CreationDate: Date;
  CCMCustomer: Association to CCMCustomer on CCMCustomer.CCMContract = $self;
  CCMMaterial: Association to many CCMMaterial on CCMMaterial.CCMContract = $self;
  FastConditionContracts: Association to FastConditionContracts
}

entity CCMCustomer: cuid, managed, temporal{
  InstituteID: String;
  CustomerID: Integer;
  CountryCode: String;
  InstituteType: String;
  InstituteName: String;
  CCMContract: Association to CCMContract;
}

entity CCMMaterial: cuid, managed, temporal{
  CountryCode: String;
  ProductCode: String;
  MaterialNumber: String;
  FOCMaterialNumber: String;
  CCMContract: Association to CCMContract;
  CurrentInvoicePrice: Association to CurrentInvoicePrice on CurrentInvoicePrice.CCMMaterial = $self;
  PriceConditionInvoice: Association to PriceConditionInvoice on PriceConditionInvoice.ProductCode = ProductCode and PriceConditionInvoice.CountryCode = CountryCode;
  PriceConditionRebate:  Association to PriceConditionRebate on PriceConditionRebate.ProductCode = ProductCode and PriceConditionRebate.CountryCode = CountryCode;
  PriceConditionFOC: Association to PriceConditionFOC on PriceConditionFOC.ProductCode = ProductCode and PriceConditionFOC.CountryCode = CountryCode;
}
entity CurrentInvoicePrice: cuid, managed{
  ConditionType: String;
  CountryCode: String;
  SoldToParty: String;
  Material: String;
  YP00: Double;
  YP04: Double;
  YP10: Double;
  YD75: Double;
  YD30: Double;
  YD06: Double;
  YD02: Double;
  SapTax: Double;
  CCMMaterial: Association to CCMMaterial;
}

entity PriceConditionInvoice: cuid, managed, temporal{
  OfferID                             : String;
  ProductCode                         : Integer;
  ConditionType: String;
  CountryCode: String;
  YP00: Double;
  YP04: Double;
  YP10: Double;
  YD75: Double;
  YD30: Double;
  YD06: Double;
  YD02: Double;
  Tax: Double;
  ConfidentialPrice: Decimal;
  RoyalDecree                         : String;
  RoyalDecreeValue                    : Decimal;
  RoyalDecreeIncl                     : Boolean default false;
  NetPriceWithoutTaxAfterDeductionRD  : Decimal;
  NetPriceWithTaxAfterDeductionRD     : Decimal;
  NetPriceWithoutTax                  : Decimal;
  NetPriceWithTax                     : Decimal;
  MaximumPrice                        : Decimal;
  CCMMaterial: Association to CCMMaterial;
}

entity PriceConditionRebate: cuid, managed, temporal{
  OfferID                             : String;
  ProductCode                         : Integer;
  CountryCode                         : String;
  YP00: Double;
  ConfidentialPrice: Decimal;
  Tax: Double;
  RoyalDecree                         : String;
  Liquidation                         : String;
  RefundDate                          : Date;
  PriceConditionCode                  : String;
  CCMMaterial: Association to CCMMaterial;
  PriceConditionDiscountCondition: Association to many PriceConditionDiscountCondition on PriceConditionDiscountCondition.PriceConditionRebate = $self;
}

entity PriceConditionDiscountCondition: cuid, managed{
  Volume              : Integer;
  Discount            : Double;
  NetPriceWithoutTax  : Decimal;
  NetPriceWithTax     : Decimal;
  PriceConditionRebate      : Association to PriceConditionRebate;
}

entity PriceConditionFOC: cuid, managed, temporal{
  OfferID                             : String;
  CountryCode                         : String;
  ProductCode: Integer;
  FreeGoodsOther: Double;
  FreeGoodsOther_Step: Double;
  FreeGoodsOther_ABS_PCT: String(4);
  VAT: Double; 
  FOCMinAmount                        : Integer;
  FOCBonus                            : Decimal;
  PotentialGeneratedSavings           : Decimal;
  RoyalDecree                         : String;
  ADD_INCLUDE                         : String;
  CCMMaterial: Association to CCMMaterial;
}

entity APIDefinition: cuid, managed{
  Name: String;
  Source: String;
  Endpoint: String;
  APIBody: Association to many APIBody on APIBody.APIDefinition = $self;
}

entity APIBody: cuid, managed{
  Name: String;
  Type: String;
  Value: String;
  Children      : Association to many APIBody on Children.Parent = $self;
  Parent: Association to APIBody;
  APIDefinition: Association to APIDefinition;
}