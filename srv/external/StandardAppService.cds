/* checksum : 940cbb38df55e243297f98a264805ebb */
@cds.external : true
@m.IsDefaultEntityContainer : 'true'
service StandardAppService {};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryTemplate {
  key CountryCode : LargeString not null;
  key Application : LargeString not null;
  key Page : LargeString not null;
  key ProductScope : LargeString not null;
  @cds.ambiguous : 'missing on condition?'
  Template : Association to many StandardAppService.Template {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Template {
  key ID : UUID not null;
  Title : LargeString;
  Description : LargeString;
  Service : LargeString;
  Type : LargeString;
  CountryTemplate_CountryCode : LargeString;
  CountryTemplate_Application : LargeString;
  CountryTemplate_Page : LargeString;
  CountryTemplate_ProductScope : LargeString;
  Table_ID : UUID;
  Form_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  CountryTemplate : Association to StandardAppService.CountryTemplate {  };
  @cds.ambiguous : 'missing on condition?'
  Tabs : Association to many StandardAppService.Tab {  };
  @cds.ambiguous : 'missing on condition?'
  Table : Association to StandardAppService.Table on Table.ID = Table_ID;
  @cds.ambiguous : 'missing on condition?'
  Form : Association to StandardAppService.Form on Form.ID = Form_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Tab {
  key ID : UUID not null;
  Title : LargeString;
  TitleLocale : LargeString;
  Description : LargeString;
  Icon : LargeString;
  Template_ID : UUID;
  XMLView_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  Template : Association to StandardAppService.Template on Template.ID = Template_ID;
  @cds.ambiguous : 'missing on condition?'
  XMLView : Association to StandardAppService.XMLView on XMLView.ID = XMLView_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.XMLView {
  key ID : UUID not null;
  ViewName : LargeString;
  Description : LargeString;
  @cds.ambiguous : 'missing on condition?'
  Tables : Association to many StandardAppService.Table {  };
  @cds.ambiguous : 'missing on condition?'
  Forms : Association to many StandardAppService.Form {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Table {
  key ID : UUID not null;
  Title : LargeString;
  Description : LargeString;
  TableID : LargeString;
  Entity : LargeString;
  XMLView_ID : UUID;
  Columns_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  XMLView : Association to StandardAppService.XMLView on XMLView.ID = XMLView_ID;
  @cds.ambiguous : 'missing on condition?'
  Columns : Composition of many StandardAppService.Column;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Form {
  key ID : UUID not null;
  Title : LargeString;
  TitleLocale : LargeString;
  Description : LargeString;
  FormID : LargeString;
  Entity : LargeString;
  XMLView_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  XMLView : Association to StandardAppService.XMLView on XMLView.ID = XMLView_ID;
  @cds.ambiguous : 'missing on condition?'
  FormContainers : Association to many StandardAppService.FormContainer {  };
  @cds.ambiguous : 'missing on condition?'
  Layout : Association to many StandardAppService.Layout {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.FormContainer {
  key ID : UUID not null;
  Title : LargeString;
  TitleLocale : LargeString;
  Form_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  Form : Association to StandardAppService.Form on Form.ID = Form_ID;
  @cds.ambiguous : 'missing on condition?'
  FormElements : Association to many StandardAppService.FormElement {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.FormElement {
  key ID : UUID not null;
  Label : LargeString;
  LabelLocale : LargeString;
  Visible : Boolean;
  FormContainer_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  FormContainer : Association to StandardAppService.FormContainer on FormContainer.ID = FormContainer_ID;
  @cds.ambiguous : 'missing on condition?'
  Controls : Association to many StandardAppService.Control {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Column {
  key ID : UUID not null;
  Title : LargeString;
  TitleLocale : LargeString;
  Description : LargeString;
  Importance : LargeString;
  Rank : Integer;
  IsValueHelpKey : Boolean;
  IsValueHelpText : Boolean;
  Table_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  Table : Association to StandardAppService.Table on Table.ID = Table_ID;
  @cds.ambiguous : 'missing on condition?'
  Control : Association to StandardAppService.Control {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Layout {
  key ID : UUID not null;
  Type : LargeString;
  Form_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  Form : Association to StandardAppService.Form on Form.ID = Form_ID;
  @cds.ambiguous : 'missing on condition?'
  Properties : Association to many StandardAppService.Properties {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Control {
  key ID : UUID not null;
  Type : LargeString;
  ParentID : UUID;
  @cds.ambiguous : 'missing on condition?'
  Properties : Association to many StandardAppService.Properties {  };
  @cds.ambiguous : 'missing on condition?'
  ValueHelp : Association to StandardAppService.ValueHelp {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Properties {
  key ID : UUID not null;
  Name : LargeString;
  Value : LargeString;
  IsBinding : Boolean;
  ParentID : UUID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ValueHelp {
  key ID : UUID not null;
  Title : LargeString;
  Type : LargeString;
  ParentID : UUID;
  Searchable : Boolean;
  SelectedField : many StandardAppService.UITemplates_com_bayer_SXTENDER_templates_SelectedField not null;
  Table_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  Table : Association to StandardAppService.Table on Table.ID = Table_ID;
  @cds.ambiguous : 'missing on condition?'
  Filters : Association to many StandardAppService.Filter {  };
  @cds.ambiguous : 'missing on condition?'
  StaticValues : Association to many StandardAppService.StaticValue {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Filter {
  key ID : UUID not null;
  Path : LargeString;
  Operator : LargeString;
  Value1 : LargeString;
  Value2 : LargeString;
  ValueHelp_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  ValueHelp : Association to StandardAppService.ValueHelp on ValueHelp.ID = ValueHelp_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.StaticValue {
  key ID : UUID not null;
  CountryCode : LargeString;
  KeyID : String(40);
  ValueText : String(40);
  ValueHelp_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  ValueHelp : Association to StandardAppService.ValueHelp on ValueHelp.ID = ValueHelp_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PropertiesView {
  key ControlID : UUID not null;
  Type : LargeString;
  FieldName : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ProductScopeView {
  key FormID : UUID not null;
  CountryCode : LargeString;
  ProductScope : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MandatoryFieldsView {
  key Section : LargeString not null;
  key CountryCode : LargeString not null;
  key ProductScope : LargeString not null;
  Label : LargeString;
  Field : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.FullPropertiesView {
  key ControlID : UUID not null;
  Type : LargeString;
  FieldName : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.FormFieldsView {
  key Section : LargeString not null;
  key CountryCode : LargeString not null;
  key ProductScope : LargeString not null;
  Label : LargeString;
  Field : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.FastConditionContracts {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  TenderID : LargeString;
  OfferID : LargeString;
  CountryCode : LargeString;
  InstituteID : Integer;
  InstituteName : LargeString;
  DistributorID : Integer;
  @sap.display.format : 'Date'
  ContractStartDate : Date;
  @sap.display.format : 'Date'
  ContractEndDate : Date;
  ContractType : LargeString;
  CustomerID : LargeString;
  Division : LargeString;
  Reference : LargeString;
  Status : LargeString;
  Owner : LargeString;
  BrandFilter : LargeString;
  ProductFilter : LargeString;
  Extension : Boolean;
  ExtensionPeriod : LargeString;
  hasNewMaterialNumber : Boolean;
  hasActiveContracts : Boolean;
  hasUpdatedPVL : Boolean;
  hasUpdatedConfidentialPrice : Boolean;
  hasNetPriceAbovePVL : Boolean;
  hasNetPriceBelowFloorPrice : Boolean;
  hasExpiringSoonContracts : Boolean;
  hasExpiredContracts : Boolean;
  hasCancelledContracts : Boolean;
  hasContractsToBeSynchronized : Boolean;
  hasNewContracts : Boolean;
  CCMContract_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  CCMContract : Composition of many StandardAppService.CCMContract;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CCMContract {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validFrom : Timestamp;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validTo : Timestamp;
  ProductCode : LargeString;
  CountryCode : LargeString;
  ProductName : LargeString;
  UoM : LargeString;
  NewMaterialNumber : LargeString;
  BrandID : LargeString;
  BrandName : LargeString;
  OfferPrice : Double;
  hasRappel : LargeString;
  hasFOC : LargeString;
  @sap.display.format : 'Date'
  CCMContractStartDate : Date;
  @sap.display.format : 'Date'
  CCMContractEndDate : Date;
  PreviousContractNumber : LargeString;
  ContractNumber : LargeString;
  Synchronized : Boolean;
  Notified : Boolean;
  Extension : Boolean;
  ExtensionPeriod : LargeString;
  @sap.display.format : 'Date'
  CreationDate : Date;
  CCMMaterial_ID : UUID;
  PriceConditionInvoice_ID : UUID;
  PriceConditionRebate_ID : UUID;
  PriceConditionFOC_ID : UUID;
  FastConditionContracts_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  CCMCustomer : Composition of StandardAppService.CCMCustomer on CCMCustomer.CCMContract_ID = ID;
  @cds.ambiguous : 'missing on condition?'
  CCMMaterial : Composition of many StandardAppService.CCMMaterial;
  @cds.ambiguous : 'missing on condition?'
  CurrentInvoicePrice : Composition of StandardAppService.CurrentInvoicePrice on CurrentInvoicePrice.CCMContract_ID = ID;
  @cds.ambiguous : 'missing on condition?'
  PriceConditionInvoice : Composition of StandardAppService.PriceConditionInvoice on PriceConditionInvoice.ID = PriceConditionInvoice_ID;
  @cds.ambiguous : 'missing on condition?'
  PriceConditionRebate : Composition of StandardAppService.PriceConditionRebate on PriceConditionRebate.ID = PriceConditionRebate_ID;
  @cds.ambiguous : 'missing on condition?'
  PriceConditionFOC : Composition of many StandardAppService.PriceConditionFOC;
  @cds.ambiguous : 'missing on condition?'
  FastConditionContracts : Association to StandardAppService.FastConditionContracts on FastConditionContracts.ID = FastConditionContracts_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.BrandsInTender {
  key TENDERID : String(50) not null;
  key BRANDID : String(50) not null;
  key OFFERID : String(30) not null;
  COUNTRYCODE : LargeString not null;
  BRANDNAME : String(100);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.TenderFormView {
  key TenderID : String(50) not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  CountryCode : LargeString not null;
  ToolID : Integer;
  TenderNo : Integer;
  CloneTenderID : String(50);
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(50);
  Active : Integer;
  Classification : String(50);
  BiddingTypeLevel1 : String(50);
  BiddingTypeLevel2 : String(50);
  BiddingTypeLevel3 : String(50);
  HighValue : Boolean;
  @sap.display.format : 'Date'
  OfferStartDate : Date;
  IbizID : String(50);
  PublicNotice : LargeString;
  TenderName : String(250);
  InstituteID : Integer not null;
  TenderChannel : String(255);
  GroupPurchasing : Integer;
  @sap.display.format : 'Date'
  PublicationDate : Date;
  @sap.display.format : 'Date'
  BidDueDate : Date;
  @sap.display.format : 'Date'
  AwardDate : Date;
  @sap.display.format : 'Date'
  NextPublicationDye : Date;
  ContractLength : Integer;
  ContractExtenseion : Integer;
  TenderStatus : String(255);
  ManualSaveStatus : String(50);
  FoldersCreated : Integer;
  TENDER_TYPE_ID : Integer;
  CONTRACT_TYPE_ID : Integer;
  SALES_TYPE_ID : Integer;
  TENDER_ORIGIN_ID : Integer;
  PROCUREMENT_METHOD_ID : LargeString;
  PROCUREMENT_REASON : LargeString;
  CONTENT : String(500);
  PORTAL : LargeString;
  TENDER_TYPE_2_ID : Integer;
  SAPID : LargeString;
  ExternalID : LargeString;
  AlternativeID : Integer;
  IbizLicitaID : Integer;
  Liciedital : LargeString;
  Purpose : LargeString;
  ParticiationType : LargeString;
  ParticipationIntention : LargeString;
  @sap.display.format : 'Date'
  TerminationDate : Date;
  @sap.display.format : 'Date'
  EffectiveDate : Date;
  @sap.display.format : 'Date'
  ExpiryDate : Date;
  @sap.display.format : 'Date'
  OfferValidity : Date;
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  InstituteType : String(50);
  InstituteName : String(500);
  DirectTender : Boolean;
  State : LargeString;
  ParentInstituteID : Integer;
  External_InstituteId : String(50);
  Address : String(500);
  CustomerID : Integer;
  ProvinceName : LargeString;
  City : String(255);
  CifCode : String(50);
  RegionalHealthSystem : String(50);
  CG1_Description : LargeString;
  CG2_Description : LargeString;
  Region : String(50);
  @cds.ambiguous : 'missing on condition?'
  Institute : Association to StandardAppService.SalesReportInstitutesView {  };
  @cds.ambiguous : 'missing on condition?'
  Offer : Association to many StandardAppService.OfferFormView {  };
  @cds.ambiguous : 'missing on condition?'
  Criteria : Association to many StandardAppService.PT_TMAWRDCR {  };
  @cds.ambiguous : 'missing on condition?'
  Brands : Association to many StandardAppService.BrandsInTender {  };
  @cds.ambiguous : 'missing on condition?'
  NextOfferId : Association to StandardAppService.TenderOffers on NextOfferId.TENDERID = TenderID;
  @cds.ambiguous : 'missing on condition?'
  TenderValue : Association to StandardAppService.TenderOffers on TenderValue.TENDERID = TenderID;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  BankGuarantees : Association to StandardAppService.BankGuarantees {  };
  @cds.ambiguous : 'missing on condition?'
  User : Association to StandardAppService.Users on User.UserID = SubmittedBy;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryRegionsTableView {
  key ID : UUID not null;
  CountryCode : LargeString;
  Name : LargeString;
  RegionCode : LargeString;
  @cds.ambiguous : 'missing on condition?'
  Tenders : Composition of many StandardAppService.Tenders_in_Regions on Tenders.RegionID = ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMAWRDCR {
  key TENDERID : String(50) not null;
  key Active : Integer not null;
  key AwardCriteria : String(100) not null;
  COUNTRYCODE : LargeString;
  @sap.display.format : 'Date'
  SUBMITTEDON : Date;
  Submittedby : String(100);
  Weight : Double;
  @cds.ambiguous : 'missing on condition?'
  Tender : Association to StandardAppService.TenderFormView on Tender.TenderID = TENDERID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.AppConfig {
  key ID : UUID not null;
  CountryCode : LargeString;
  Environment : String(10);
  ApplicationName : String(40);
  Control : String(100);
  URL : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.AwardCriteriaTableView {
  key CountryCode : LargeString not null;
  key TenderID : String(50) not null;
  key Criteria : LargeString not null;
  Weight : Double;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.TenderMasterView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  CountryCode : LargeString not null;
  Classification : String(50);
  TenderName : String(250);
  createdBy : String(255);
  DistributorName : String(500);
  InstituteName : String(500);
  InstituteID : Integer;
  VALUE : Double;
  STATUS : String(255);
  TableStatus : String(255);
  @sap.display.format : 'Date'
  PublicationDate : Date;
  @sap.display.format : 'Date'
  InternalBidDueDate : Date;
  @sap.display.format : 'Date'
  BidDueDate : Date;
  BrandID : LargeString;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  modifiedBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  createdByName : String(100);
  modifiedByName : String(100);
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  @sap.display.format : 'Date'
  EffectiveDate : Date;
  @sap.display.format : 'Date'
  ExpiryDate : Date;
  Custom_String_1 : LargeString;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  Offer_Custom_String_1 : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.InstitutesView {
  key CountryCode : LargeString not null;
  key InstituteID : Integer not null;
  CustomerID : LargeString;
  InstituteName : String(500);
  InstituteType : String(50);
  Address : String(500);
  ContactNo : String(50);
  Fax : String(50);
  ContactPerson : String(100);
  ActiveRecord : String(10);
  Comment : String(500);
  City : String(255);
  INSTITUTE_HIERARCHY_ID : Integer;
  State : LargeString;
  MercadoPublicoIssuer : LargeString;
  RegionID : LargeString;
  ProvinceID : LargeString;
  CifCode : String(50);
  RegionalHealthSystem : String(50);
  VatCode : String(50);
  TaxCode : String(50);
  CustomerGroup : LargeString;
  ApplicableTaxRate : String(2);
  INCOTerms : String(500);
  PaymentTerms : String(500);
  ForAllBrands : Boolean;
  DirectTender : Boolean;
  ContactEmail : String(100);
  CNPJ : LargeString;
  Shortname : LargeString;
  KAM_Territory : LargeString;
  External_InstituteId : String(50);
  Class : Integer;
  SAPGroupId : LargeString;
  CG1_Description : LargeString;
  CG2_Description : LargeString;
  CG1_Code : LargeString;
  CG2_Code : LargeString;
  InstituteRelationID : Integer;
  ParentInstituteID : Integer;
  HieraryParentInstituteID : Integer not null;
  HierarchyInstituteID : Integer not null;
  Territory : LargeString;
  IsKAM : Boolean;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  Children : Association to many StandardAppService.PT_TMINSHIER {  };
  @cds.ambiguous : 'missing on condition?'
  Region : Association to StandardAppService.CountryRegionsTableView on Region.ID = RegionID;
  @cds.ambiguous : 'missing on condition?'
  Parent : Association to StandardAppService.SalesReportInstitutesView {  };
  @cds.ambiguous : 'missing on condition?'
  Institute : Association to StandardAppService.SalesReportInstitutesView {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ClassifiactionsView {
  key ID : UUID not null;
  COUNTRY_CODE : LargeString not null;
  CLASSIFICATION : String(50);
  CountryCode : LargeString;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = COUNTRY_CODE;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryInstituteTypeView {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  ChannelName : String(30);
  ChannelCountry : LargeString;
  CountryCode : LargeString;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = ChannelCountry;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryTenderNo {
  key COUNTRY_CODE : LargeString not null;
  NEXT_TENDER_NO : Integer;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.TenderOffers {
  key TENDERID : String(50) not null;
  NEXTOFFERID : Integer;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMOFRS {
  key OfferID : String(30) not null;
  TenderID : String(50) not null;
  CountryCode : LargeString not null;
  TenderOfferNo : Integer;
  RevisedOfferNo : Integer;
  ActiveOffer : Integer;
  CloneOfferID : String(255);
  @sap.display.format : 'Date'
  CreationDate : Date;
  @sap.display.format : 'Date'
  SubmissionDate : Date;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Active : Integer;
  DistributorID : Integer;
  @sap.display.format : 'Date'
  InternalBidDueDate : Date;
  SellingCompany : String(3);
  ProductCount : Integer;
  Currency : String(255);
  ManualSaveStatus : String(3);
  WholesaleOffer : String(3);
  Comment : String(500);
  OfferRevisionSplitNo : Integer;
  @sap.display.format : 'Date'
  NewOfferDueDate : Date;
  ContinuationOfferNo : Integer;
  APPROVALS_SENT : Integer;
  FOCType : String(255);
  DEFAULT_FOC_ABS_PCT : String(4);
  Division : LargeString;
  ProfitabilityStartMnth : Integer;
  ProfitabilityAgrDur : Integer;
  ProfitabilityYrlyMntCost : Double;
  ProfitabilityDiscRate : Double;
  ProfitabilityGrowthRate : Double;
  IbizWorkflowID : Integer;
  isDirectIbizOpportunity : Boolean;
  PreviousIbizWorkflowID : Integer;
  TenderDistributorID : Integer;
  BusinessUnit : LargeString;
  Responded : Integer;
  @sap.display.format : 'Date'
  DistributorDeadline : Date;
  DistributorComments : LargeString;
  ChannelSwitched : Boolean;
  DecisionSharedWithIBIZ : Boolean;
  isIBIZNotified : Boolean;
  AffiliateOffer : Boolean;
  QuotationInstituteID : Integer;
  DifferentAwardPriceParentOfferID : String(30);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  @cds.ambiguous : 'missing on condition?'
  Tender : Association to StandardAppService.TenderFormView on Tender.TenderID = TenderID;
  @cds.ambiguous : 'missing on condition?'
  Distributor : Association to StandardAppService.PT_TMDIST {  };
  @cds.ambiguous : 'missing on condition?'
  Product : Association to many StandardAppService.ProductPricesCheckView {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatusTable : Association to StandardAppService.PT_TMTNOFST {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatus : Association to StandardAppService.OfferStatus on OfferStatus.OFFER_ID = OfferID;
  @cds.ambiguous : 'missing on condition?'
  Quotation : Association to StandardAppService.PT_TMQUTO {  };
  @cds.ambiguous : 'missing on condition?'
  Signatories : Association to many StandardAppService.CountryLegalEntitySignatories {  };
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMTNOFST {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key Active : Integer not null;
  CountryCode : LargeString;
  STATUS : String(255);
  TableStatus : String(255);
  @sap.display.format : 'Date'
  Date : Date;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMINST {
  key CountryCode : LargeString not null;
  key InstituteID : Integer not null;
  CustomerID : Integer;
  InstituteName : String(500);
  InstituteType : String(50);
  Address : String(500);
  ContactNo : String(50);
  Fax : String(50);
  ContactPerson : String(100);
  ActiveRecord : String(10);
  Comment : String(500);
  City : String(255);
  INSTITUTE_HIERARCHY_ID : Integer;
  State : LargeString;
  MercadoPublicoIssuer : LargeString;
  RegionID : LargeString;
  ProvinceID : LargeString;
  CifCode : String(50);
  RegionalHealthSystem : String(50);
  VatCode : String(50);
  TaxCode : String(50);
  CustomerGroup : LargeString;
  ApplicableTaxRate : String(2);
  INCOTerms : String(500);
  PaymentTerms : String(500);
  ForAllBrands : Boolean;
  DirectTender : Boolean;
  ContactEmail : String(100);
  CNPJ : LargeString;
  Shortname : LargeString;
  KAM_Territory : LargeString;
  External_InstituteId : String(50);
  Class : Integer;
  SAPGroupId : LargeString;
  CG1_Description : LargeString;
  CG2_Description : LargeString;
  CG1_Code : LargeString;
  CG2_Code : LargeString;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  Children : Association to many StandardAppService.PT_TMINSHIER {  };
  @cds.ambiguous : 'missing on condition?'
  Region : Association to StandardAppService.CountryRegionsTableView on Region.ID = RegionID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMINSHIER {
  key ParentInstituteID : Integer not null;
  key InstituteID : Integer not null;
  InstituteRelationID : Integer;
  ActiveRecord : String(10) not null;
  @cds.ambiguous : 'missing on condition?'
  Parent : Association to StandardAppService.SalesReportInstitutesView {  };
  @cds.ambiguous : 'missing on condition?'
  Institute : Association to StandardAppService.SalesReportInstitutesView {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMTEND {
  key TenderID : String(50) not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  CountryCode : LargeString not null;
  ToolID : Integer;
  TenderNo : Integer;
  CloneTenderID : String(50);
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(50);
  Active : Integer;
  Classification : String(50);
  BiddingTypeLevel1 : String(50);
  BiddingTypeLevel2 : String(50);
  BiddingTypeLevel3 : String(50);
  HighValue : Boolean;
  @sap.display.format : 'Date'
  OfferStartDate : Date;
  IbizID : String(50);
  PublicNotice : LargeString;
  TenderName : String(250);
  InstituteID : Integer not null;
  TenderChannel : String(255);
  GroupPurchasing : Integer;
  @sap.display.format : 'Date'
  PublicationDate : Date;
  @sap.display.format : 'Date'
  BidDueDate : Date;
  @sap.display.format : 'Date'
  AwardDate : Date;
  @sap.display.format : 'Date'
  NextPublicationDye : Date;
  ContractLength : Integer;
  ContractExtenseion : Integer;
  TenderStatus : String(255);
  ManualSaveStatus : String(50);
  FoldersCreated : Integer;
  TENDER_TYPE_ID : Integer;
  CONTRACT_TYPE_ID : Integer;
  SALES_TYPE_ID : Integer;
  TENDER_ORIGIN_ID : Integer;
  PROCUREMENT_METHOD_ID : LargeString;
  PROCUREMENT_REASON : LargeString;
  CONTENT : String(500);
  PORTAL : LargeString;
  TENDER_TYPE_2_ID : Integer;
  SAPID : LargeString;
  ExternalID : LargeString;
  AlternativeID : Integer;
  IbizLicitaID : Integer;
  Liciedital : LargeString;
  Purpose : LargeString;
  ParticiationType : LargeString;
  ParticipationIntention : LargeString;
  @sap.display.format : 'Date'
  TerminationDate : Date;
  @sap.display.format : 'Date'
  EffectiveDate : Date;
  @sap.display.format : 'Date'
  ExpiryDate : Date;
  @sap.display.format : 'Date'
  OfferValidity : Date;
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  @cds.ambiguous : 'missing on condition?'
  Institute : Association to StandardAppService.SalesReportInstitutesView {  };
  @cds.ambiguous : 'missing on condition?'
  Offer : Association to many StandardAppService.OfferFormView {  };
  @cds.ambiguous : 'missing on condition?'
  Criteria : Association to many StandardAppService.PT_TMAWRDCR {  };
  @cds.ambiguous : 'missing on condition?'
  Brands : Association to many StandardAppService.BrandsInTender {  };
  @cds.ambiguous : 'missing on condition?'
  NextOfferId : Association to StandardAppService.TenderOffers on NextOfferId.TENDERID = TenderID;
  @cds.ambiguous : 'missing on condition?'
  TenderValue : Association to StandardAppService.TenderOffers on TenderValue.TENDERID = TenderID;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  BankGuarantees : Association to StandardAppService.BankGuarantees {  };
  @cds.ambiguous : 'missing on condition?'
  User : Association to StandardAppService.Users on User.UserID = SubmittedBy;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMDIST {
  key CountryCode : LargeString not null;
  key DistributorID : Integer not null;
  DistributorName : String(500);
  Address : String(500);
  ContactNo : String(500);
  Fax : String(500);
  ContactPerson : String(500);
  ActiveRecord : String(10);
  CONTACT_EMAIL : String(100);
  City : LargeString;
  State : LargeString;
  TaxCode : LargeString;
  CNPJ : LargeString;
  CustomerID : Integer;
  Shortname : LargeString;
  CommissionRate : Double;
  INCOTerms : String(500);
  PaymentTerms : String(500);
  ForAllBrands : Boolean;
  ClaimEligible : LargeString;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  DistributorDivision : Composition of many StandardAppService.DistributorDivision;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMOFPR {
  key OfferID : String(30) not null;
  key Active : Integer not null;
  key ProductCode : Integer not null;
  key LotID : Integer not null;
  TenderID : String(50) not null;
  CountryCode : LargeString;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Reference : String(255);
  AlternateOfferYN : String(255);
  RequestedVolume : Integer;
  UnitPerPack : String(255);
  SampleYN : String(255);
  SampleQuantity : Integer;
  DocumentsRequired : String(255);
  FirstShipment : String(255);
  NoofLots : Integer;
  IntervalBetweenShipments : Integer;
  NoOfTier : Integer;
  DiscOrOffer : String(255);
  PaymentTerms : String(255);
  DistributorID : Integer;
  SNo : Integer;
  ActiveProduct : Integer;
  Comment : String(500);
  INCOTerms : String(500);
  SORTER : Integer;
  DEFAULT_COMMISSION_RATE : Double;
  SUPPLY_UPDATE : Integer;
  PAYMENT_UPDATE : Integer;
  Line : LargeString;
  DeliveryConditions : LargeString;
  MinInvoiceAmount : Double;
  PricingPolicyCluster : LargeString;
  OfferType : LargeString;
  AnticipatedRequestedQuantity : String(25);
  MaxPrice : Double;
  Channel : LargeString;
  WorkflowProductID : Integer;
  IbizWorkflowID : Integer;
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  @cds.ambiguous : 'missing on condition?'
  Offer : Association to StandardAppService.OfferFormView on Offer.OfferID = OfferID;
  @cds.ambiguous : 'missing on condition?'
  SKU : Association to StandardAppService.ProductPack on SKU.PRODUCTPACKID = ProductCode;
  @cds.ambiguous : 'missing on condition?'
  SKUCountry : Association to StandardAppService.CountryProductPackView on SKUCountry.PRODUCTPACKID = ProductCode and SKUCountry.COUNTRYCODE = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  Price : Association to StandardAppService.PT_TMBDPR {  };
  @cds.ambiguous : 'missing on condition?'
  Deliveries : Association to many StandardAppService.DeliveryTrackingDetailView {  };
  @cds.ambiguous : 'missing on condition?'
  PriceCondition : Composition of many StandardAppService.PriceCondition;
  @cds.ambiguous : 'missing on condition?'
  ContractInfomation : Association to many StandardAppService.ContractInfomation {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMQUTO {
  key OfferID : String(30) not null;
  key Active : Integer not null;
  @sap.display.format : 'Date'
  key OfferDate : Date not null;
  TenderID : String(50);
  CountryCode : LargeString;
  DistributorID : Integer;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  @sap.display.format : 'Date'
  OfferValidity : Date;
  DelayInSubmission : String(50);
  AS1 : String(255);
  AS2 : String(255);
  DeliveryTerms : String(5000);
  I_Q_1 : String(255);
  I_Q_2 : String(255);
  I_Q_3 : String(255);
  Comment : LargeString;
  UPDATED : Integer;
  @sap.display.format : 'Date'
  EffectiveDate : Date;
  @sap.display.format : 'Date'
  ExpiryDate : Date;
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  @cds.ambiguous : 'missing on condition?'
  Offer : Association to StandardAppService.OfferFormView on Offer.OfferID = OfferID;
  @cds.ambiguous : 'missing on condition?'
  Signatory1 : Association to StandardAppService.CountryLegalEntitySignatories {  };
  @cds.ambiguous : 'missing on condition?'
  Signatory2 : Association to StandardAppService.CountryLegalEntitySignatories {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMBDPR {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key Active : Integer not null;
  key ActiveTier : Integer not null;
  key LotID : Integer not null;
  TenderID : String(50) not null;
  CountryCode : LargeString not null;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Tier : Integer;
  VolumeFrom : Integer;
  VolumeTo : Integer;
  RegPrice : Double;
  FOC : Double;
  FOCStep : Double;
  FOCType : String(255);
  Discount : Double;
  OfferPrice : Double;
  Deductions : Double;
  StandardDiscount : Double;
  AdditionalDiscount : Double;
  NetofferPrice : Double;
  BusinessCasePrice : Double;
  WholesalePrice : String(50);
  COGS : Double;
  SpotRate : Double;
  BudgetRate : Double;
  Scenario : Integer;
  FOC_ABS_PCT : String(4);
  FOC_Bundled_1 : Double;
  FOC_ABS_PCT_Bundled_1 : String(4);
  FOCProduct_Bundled_1 : Integer;
  NetPrice : Double;
  NetPrice_OfPaid : Double;
  PRICE_UPDATE : Integer;
  Deductions_ABS_PCT : String(4);
  @cds.ambiguous : 'missing on condition?'
  Bundled_1_SKU : Association to StandardAppService.ProductPack on Bundled_1_SKU.PRODUCTPACKID = FOCProduct_Bundled_1;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.OfferFormView {
  key OfferID : String(30) not null;
  TenderID : String(50) not null;
  CountryCode : LargeString not null;
  TenderOfferNo : Integer;
  RevisedOfferNo : Integer;
  ActiveOffer : Integer;
  CloneOfferID : String(255);
  @sap.display.format : 'Date'
  CreationDate : Date;
  @sap.display.format : 'Date'
  SubmissionDate : Date;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Active : Integer;
  DistributorID : Integer;
  @sap.display.format : 'Date'
  InternalBidDueDate : Date;
  SellingCompany : String(3);
  ProductCount : Integer;
  Currency : String(255);
  ManualSaveStatus : String(3);
  WholesaleOffer : String(3);
  Comment : String(500);
  OfferRevisionSplitNo : Integer;
  @sap.display.format : 'Date'
  NewOfferDueDate : Date;
  ContinuationOfferNo : Integer;
  APPROVALS_SENT : Integer;
  FOCType : String(255);
  DEFAULT_FOC_ABS_PCT : String(4);
  Division : LargeString;
  ProfitabilityStartMnth : Integer;
  ProfitabilityAgrDur : Integer;
  ProfitabilityYrlyMntCost : Double;
  ProfitabilityDiscRate : Double;
  ProfitabilityGrowthRate : Double;
  IbizWorkflowID : Integer;
  isDirectIbizOpportunity : Boolean;
  PreviousIbizWorkflowID : Integer;
  TenderDistributorID : Integer;
  BusinessUnit : LargeString;
  Responded : Integer;
  @sap.display.format : 'Date'
  DistributorDeadline : Date;
  DistributorComments : LargeString;
  ChannelSwitched : Boolean;
  DecisionSharedWithIBIZ : Boolean;
  isIBIZNotified : Boolean;
  AffiliateOffer : Boolean;
  QuotationInstituteID : Integer;
  DifferentAwardPriceParentOfferID : String(30);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  OfferStatus : String(255);
  @sap.display.format : 'Date'
  OfferDueDate : Date;
  InstituteID : Integer;
  Channel : String(255);
  TenderName : String(250);
  @cds.ambiguous : 'missing on condition?'
  Tender : Association to StandardAppService.TenderFormView on Tender.TenderID = TenderID;
  @cds.ambiguous : 'missing on condition?'
  Distributor : Association to StandardAppService.PT_TMDIST {  };
  @cds.ambiguous : 'missing on condition?'
  Product : Association to many StandardAppService.ProductPricesCheckView {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatusTable : Association to StandardAppService.PT_TMTNOFST {  };
  @cds.ambiguous : 'missing on condition?'
  Quotation : Association to StandardAppService.PT_TMQUTO {  };
  @cds.ambiguous : 'missing on condition?'
  Signatories : Association to many StandardAppService.CountryLegalEntitySignatories {  };
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryProductPackView {
  key COUNTRYCODE : LargeString not null;
  key PRODUCTPACKID : Integer not null;
  COUNTRYPRODUCTPACKID : Integer;
  COUNTRYOFORIGIN : String(120);
  SHELFLIFE : Integer;
  REGISTERED : Integer;
  ACTIVERECORD : String(10);
  MANUFACTURER : String(500);
  Presentation_2 : String(1000);
  VTATax : Double;
  COMMENT : String(255);
  GOV_CODE : String(255);
  CODE1 : String(255);
  CODE2 : String(255);
  CODE3 : String(255);
  QTY_THRESHOLD : Integer;
  BU : String(255);
  GPP_GOVERNED : String(10);
  LAP_CURRENCY : String(5);
  LAP : Double;
  LAP_UNIT : String(15);
  PRAF_ID : String(50);
  PRAF_COMMENTS : String(255);
  @sap.display.format : 'Date'
  RegistrationDate : Date;
  @sap.display.format : 'Date'
  RegistrationValidUntil : Date;
  ProductScope : String(100);
  ProductGroup : LargeString;
  OutSourcedStatus : LargeString;
  EAN : LargeString;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = COUNTRYCODE;
  @cds.ambiguous : 'missing on condition?'
  Origin : Association to StandardAppService.Country on Origin.CountryCode = COUNTRYOFORIGIN;
  @cds.ambiguous : 'missing on condition?'
  ProductPack : Association to StandardAppService.ProductPack on ProductPack.PRODUCTPACKID = PRODUCTPACKID;
  @cds.ambiguous : 'missing on condition?'
  ProductPackSKU : Association to many StandardAppService.PT_TMSKUPRDPCK on ProductPackSKU.CountryCode = COUNTRYCODE and ProductPackSKU.ProductPackID = PRODUCTPACKID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.DistinctProductScopeView {
  key ProductScope : String(100) not null;
  CountryCode : LargeString not null;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.OfferProductsTableView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  CountryCode : LargeString;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Active : Integer not null;
  Reference : String(255);
  AlternateOfferYN : String(255);
  RequestedVolume : Integer;
  UnitPerPack : String(255);
  SampleYN : String(255);
  SampleQuantity : Integer;
  DocumentsRequired : String(255);
  FirstShipment : String(255);
  NoofLots : Integer;
  IntervalBetweenShipments : Integer;
  NoOfTier : Integer;
  DiscOrOffer : String(255);
  PaymentTerms : String(255);
  DistributorID : Integer;
  SNo : Integer;
  ActiveProduct : Integer;
  Comment : String(500);
  INCOTerms : String(500);
  SORTER : Integer;
  DEFAULT_COMMISSION_RATE : Double;
  SUPPLY_UPDATE : Integer;
  PAYMENT_UPDATE : Integer;
  Line : LargeString;
  DeliveryConditions : LargeString;
  MinInvoiceAmount : Double;
  PricingPolicyCluster : LargeString;
  OfferType : LargeString;
  AnticipatedRequestedQuantity : String(25);
  MaxPrice : Double;
  Channel : LargeString;
  LotID : Integer;
  WorkflowProductID : Integer;
  IbizWorkflowID : Integer;
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  ProductPackName : String(100);
  UoM : String(255);
  NetPrice : Double;
  TotalAmount : Double;
  Currency : String(255);
  Region : String(50);
  @sap.display.format : 'Date'
  RegistrationValidUntil : Date;
  ContractDuration_1 : Integer;
  OfferPrice_1 : Double;
  ContractDuration_2 : Integer;
  OfferPrice_2 : Double;
  ContractDuration_3 : Integer;
  OfferPrice_3 : Double;
  NetPriceFOC : Double;
  cogsUoM : Double;
  GrossSales : Double;
  GrossProfit : Double;
  GrossMargin : Double;
  ProductType : String(50);
  @cds.ambiguous : 'missing on condition?'
  Offer : Association to StandardAppService.OfferFormView on Offer.OfferID = OfferID;
  @cds.ambiguous : 'missing on condition?'
  SKU : Association to StandardAppService.ProductPack on SKU.PRODUCTPACKID = ProductCode;
  @cds.ambiguous : 'missing on condition?'
  SKUCountry : Association to StandardAppService.CountryProductPackView on SKUCountry.PRODUCTPACKID = ProductCode and SKUCountry.COUNTRYCODE = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  Price : Association to StandardAppService.PT_TMBDPR {  };
  @cds.ambiguous : 'missing on condition?'
  Deliveries : Association to many StandardAppService.DeliveryTrackingDetailView {  };
  @cds.ambiguous : 'missing on condition?'
  PriceCondition : Composition of many StandardAppService.PriceCondition;
  @cds.ambiguous : 'missing on condition?'
  ContractInfomation : Association to many StandardAppService.ContractInfomation {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.OfferProductsDetailView {
  key OfferID : String(30) not null;
  key Active : Integer not null;
  key ProductCode : Integer not null;
  key LotID : Integer not null;
  TenderID : String(50) not null;
  CountryCode : LargeString;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Reference : String(255);
  AlternateOfferYN : String(255);
  RequestedVolume : Integer;
  UnitPerPack : String(255);
  SampleYN : String(255);
  SampleQuantity : Integer;
  DocumentsRequired : String(255);
  FirstShipment : String(255);
  NoofLots : Integer;
  IntervalBetweenShipments : Integer;
  NoOfTier : Integer;
  DiscOrOffer : String(255);
  PaymentTerms : String(255);
  DistributorID : Integer;
  SNo : Integer;
  ActiveProduct : Integer;
  Comment : String(500);
  INCOTerms : String(500);
  SORTER : Integer;
  DEFAULT_COMMISSION_RATE : Double;
  SUPPLY_UPDATE : Integer;
  PAYMENT_UPDATE : Integer;
  Line : LargeString;
  DeliveryConditions : LargeString;
  MinInvoiceAmount : Double;
  PricingPolicyCluster : LargeString;
  OfferType : LargeString;
  AnticipatedRequestedQuantity : String(25);
  MaxPrice : Double;
  Channel : LargeString;
  WorkflowProductID : Integer;
  IbizWorkflowID : Integer;
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  MoleculeName : String(255);
  Code1 : String(255);
  Code2 : String(255);
  Code3 : String(255);
  ProductGenericName : String(500);
  Gov_Code : String(255);
  PRODUCTPACKNAME : String(100);
  BU : String(255);
  @sap.display.format : 'Date'
  RegistrationValidUntil : Date;
  BrandName : String(100);
  PACKFACTOR : Double;
  InstituteName : String(500);
  TenderClassification : String(50);
  ACTIVE_MATERIAL_NUMBERS : LargeString;
  INACTIVE_MATERIAL_NUMBERS : LargeString;
  VwBudgetedProfitability : Double;
  ProductType : String(50);
  @cds.ambiguous : 'missing on condition?'
  Offer : Association to StandardAppService.OfferFormView on Offer.OfferID = OfferID;
  @cds.ambiguous : 'missing on condition?'
  SKU : Association to StandardAppService.ProductPack on SKU.PRODUCTPACKID = ProductCode;
  @cds.ambiguous : 'missing on condition?'
  SKUCountry : Association to StandardAppService.CountryProductPackView on SKUCountry.PRODUCTPACKID = ProductCode and SKUCountry.COUNTRYCODE = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  Price : Association to StandardAppService.PT_TMBDPR {  };
  @cds.ambiguous : 'missing on condition?'
  Deliveries : Association to many StandardAppService.DeliveryTrackingDetailView {  };
  @cds.ambiguous : 'missing on condition?'
  PriceCondition : Composition of many StandardAppService.PriceCondition;
  @cds.ambiguous : 'missing on condition?'
  ContractInfomation : Association to many StandardAppService.ContractInfomation {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.OfferProductsTotalForOffer {
  key OfferID : String(30) not null;
  OfferTotal : Double;
  Currency : String(3);
  Region : String(50);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Country {
  key CountryCode : LargeString not null;
  CountryName : String(50);
  ApprovalType : Integer;
  LocalCurrency : String(3);
  ReportingCurrency : String(3);
  CountryID : Integer;
  Region : String(50);
  COMMENT : String(255);
  @cds.ambiguous : 'missing on condition?'
  CountryPacks : Association to many StandardAppService.CountryProductPackView on CountryPacks.COUNTRYCODE = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  Institutes : Association to many StandardAppService.SalesReportInstitutesView on Institutes.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  ProductPackSKUs : Association to many StandardAppService.PT_TMSKUPRDPCK on ProductPackSKUs.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  LegalEntitySignatories : Association to many StandardAppService.CountryLegalEntitySignatories on LegalEntitySignatories.COUNTRY_CODE = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  Approvers : Association to many StandardAppService.ApproverList on Approvers.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  Distributors : Association to many StandardAppService.PT_TMDIST on Distributors.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  User : Association to StandardAppService.NotificationUserList {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Users {
  key UserID : String(50) not null;
  ToolIdentity : String(20);
  ToolID : Integer;
  UserName : String(100);
  LoginTime : String(255);
  CWID : String(12);
  UserEmail : String(255);
  Role : String(100);
  ContactNumber : String(20);
  BU : LargeString;
  mediaType : LargeString;
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
  @cds.ambiguous : 'missing on condition?'
  Countries : Association to many StandardAppService.NotificationUserList {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.UserCountries {
  key CWID : String(5) not null;
  key CountryCode : LargeString not null;
  ActiveRecord : String(3);
  UserName : String(100);
  UserEmail : String(255);
  @cds.ambiguous : 'missing on condition?'
  User : Association to StandardAppService.Users {  };
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.UsersPerCountry {
  key CWID : String(5) not null;
  key CountryCode : LargeString not null;
  ActiveRecord : String(3);
  UserName : String(100);
  @cds.ambiguous : 'missing on condition?'
  User : Association to StandardAppService.Users {  };
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.UsersHavingOneCountry {
  key CWID : String(5) not null;
  CountryCode : LargeString;
  numberOfCountries : Integer;
  UserName : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryTenderBrands {
  key COUNTRYCODE : LargeString not null;
  key BRANDID : String(50) not null;
  BRANDNAME : String(100);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryStatusses {
  key CountryCode : LargeString not null;
  key Status : String(60) not null;
  Sorter : Integer;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Divisions {
  key DivisionId : String(50) not null;
  DivisionName : String(100);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MasterDistributors {
  key DistributorID : Integer not null;
  CountryCode : LargeString not null;
  DistributorName : String(500);
  Address : String(500);
  ContactNo : String(500);
  Fax : String(500);
  CONTACT_EMAIL : String(100);
  ContactPerson : String(500);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MasterInstitutes {
  key InstituteID : Integer not null;
  key CountryCode : LargeString not null;
  GroupName : LargeString;
  CustomerID : Integer;
  InstituteName : String(500);
  InstituteType : String(50);
  AllowsDirect : LargeString;
  Address : String(500);
  ContactNo : String(50);
  Fax : String(50);
  ContactPerson : String(100);
  Comment : String(500);
  City : String(255);
  GroupID : LargeString;
  INSTITUTE_HIERARCHY_ID : Integer;
  INSTITUTE_HIERARCHY : String(50);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryLegalEntity {
  key CountryCode : LargeString not null;
  key LegalEntityCode : String(3) not null;
  LegalEntityName : String(300);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMAPPRST {
  key OfferId : String(30) not null;
  key productcode : Integer not null;
  key ApproverEmailID : String(100) not null;
  key Active : Integer not null;
  @odata.Type : 'Edm.DateTimeOffset'
  key Statustime : DateTime not null;
  key ApproverType : String(200) not null;
  key LotID : Integer not null;
  TenderID : String(50);
  CountryCode : LargeString;
  ApprovalContent : String(100);
  ApproverTypeSection : Integer;
  ApprovalStatus : String(100);
  ApproverName : String(100);
  SenderComment : String(500);
  ApproverComment : String(500);
  Hierarchy : Integer;
  AP_ID : String(10);
  RestoreKey : String(100);
  Submittedby : String(100);
  @sap.display.format : 'Date'
  ApproverDate : Date;
  FLOW_ID : String(255);
  REQUIRED_ACTION : String(12);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.StandardTenderPriceConditionView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionSpecialPriceView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
  Margin : Double;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionWithMaximumPriceView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
  Margin : Double;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionPriceView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  Currency : String(255);
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionDiscountView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  Currency : String(255);
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionTaiwanPriceView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionTaiwanDiscountView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionNLPriceView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionNLDiscountView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionPriceWithFOCView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  Currency : String(255);
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionDiscountWithFOCView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  Currency : String(255);
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionClassification {
  key ID : UUID not null;
  CountryCode : LargeString;
  ConditionType : LargeString;
  Classification : LargeString;
  InstituteType : LargeString;
  Division : LargeString;
  ProductType : LargeString;
  isMain : Boolean;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.FreeGoodsOther {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  ProductPackId : Integer;
  FreeGoodsOther : Double;
  FreeGoodsOther_Step : Double;
  FreeGoodsOther_ABS_PCT : String(4);
  VAT : Double;
  ProductPricing_ID : UUID;
  ProductPricing_OfferID : LargeString;
  ProductPricing_ProductCode : Integer;
  ProductPricing_CountryCode : LargeString;
  ProductPricing_LotID : Integer;
  FOCMinAmount : Integer;
  @sap.variable.scale : 'true'
  FOCBonus : Decimal;
  @sap.variable.scale : 'true'
  PotentialGeneratedSavings : Decimal;
  RoyalDecree : LargeString;
  ADD_INCLUDE : LargeString;
  PriceCondition_ID : UUID;
  ProductPackName : LargeString;
  @cds.ambiguous : 'missing on condition?'
  ProductPack : Association to many StandardAppService.ProductPack {  };
  @cds.ambiguous : 'missing on condition?'
  Materials : Association to many StandardAppService.PT_TMSKUPRDPCK {  };
  @cds.ambiguous : 'missing on condition?'
  PriceCondition : Association to StandardAppService.PriceCondition on PriceCondition.ID = PriceCondition_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.InstituteDistributorBrandProduct {
  key COUNTRY_CODE : LargeString not null;
  key INSTITUTE_ID : Integer not null;
  key DISTRIBUTOR_ID : Integer not null;
  key BRAND_ID : String(50) not null;
  key PRODUCT_ID : Integer not null;
  key LEGAL_ENTITY_CODE : String(3) not null;
  key CHANNEL : String(11) not null;
  INSTITUTE_NAME : String(500);
  DISTRIBUTOR_NAME : String(500);
  BRAND_NAME : String(100);
  PRODUCT_NAME : String(100);
  INCO_TERMS : String(500);
  PAYMENT_TERMS : String(500);
  COMMISSION_RATE : Double;
  COUNTRY_OF_ORIGIN : String(120);
  COGS : Double;
  PACKFACTOR : Integer;
  DIVISION : LargeString;
  SKUS : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.TenderChannel {
  key ID : UUID not null;
  CountryCode : LargeString not null;
  ChannelName : LargeString;
  DirectTender : Boolean;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.OfferValidation {
  key OFFERID : String(30) not null;
  OFFERSTATUSPATH : String(124) not null;
  TENDERID : String(50) not null;
  CLASSIFICATION : String(50) not null;
  TENDER_REFERENCE : String(753);
  PROCUREMENT_REASON : LargeString;
  INSTITUTENAME : String(500);
  INSTITUTE_ADDRESS : String(500);
  INSTITUTE_TYPE : String(50);
  INSTITUTE_STATE : LargeString;
  INSTITUTE_REGION : LargeString;
  INSTITUTE_PROVINCE : LargeString;
  INSTITUTE_CIFCODE : String(50);
  INSTITUTE_REGIONALHEALTHSYSTEM : String(50);
  INSTITUTE_CUSTOMER_GROUP : String(50);
  EXTERNAL_INSTITUTEID : String(50);
  INSTITUTECITY : String(255);
  TENDERCONTACT : LargeString;
  QUOTATIONINSTITUTENAME : String(500);
  QUOTATIONINSTITUTECITY : String(255);
  QUOTATIONINSTITUTECUSTOMERID : Integer;
  TAXCODE : String(50);
  VATCODE : String(50);
  CUSTOMER_CODE : Integer;
  DIVISION : String(100);
  @sap.display.format : 'Date'
  OFFERDATE : Date;
  @sap.display.format : 'Date'
  OFFERVALIDITY : Date not null;
  @sap.display.format : 'Date'
  EffectiveDate : Date;
  @sap.display.format : 'Date'
  ExpiryDate : Date;
  COUNTRYCODE : LargeString not null;
  SELLINGCOMPANY : String(300);
  SELLINGCOMPANYBANK : String(5000);
  SELLING_COMPANY_AS1 : String(300);
  SELLING_COMPANY_AS1_NAMEI : String(255);
  SELLING_COMPANY_AS1_TITLEI : String(255);
  SELLING_COMPANY_AS2_NAMEI : String(255);
  SELLING_COMPANY_AS2_TITLEI : String(255);
  SELLING_COMPANY_AS2 : String(300);
  E_SIGNATURE1 : Boolean;
  E_SIGNATURE2 : Boolean;
  CURRENCY : String(255);
  AMOUNT_IN_NUMBERS : Double;
  AMOUNT_IN_WORDS : String(1024);
  NET_AMOUNT_IN_NUMBERS : Double;
  NET_AMOUNT_IN_WORDS : String(1024);
  NET_OFFER_AMOUNT_IN_NUMBERS : Double;
  NET_OFFER_AMOUNT_IN_WORDS : String(1024);
  AMOUNT_IN_NUMBERS_VAT : Double;
  AMOUNT_IN_WORDS_VAT : String(1024);
  VAT_TOTAL : Double;
  LETTERHEAD : String(5000);
  DISTRIBUTORNAME : String(500);
  DISTRIBUTORADDRESS : String(5000);
  DISTRIBUTORPHONE : String(500);
  DISTRIBUTORFAX : String(500);
  DISTRIBUTORCONTACT : String(500);
  DISTRIBUTOREMAIL : String(500);
  @sap.display.format : 'Date'
  PUBLICATION_DATE : Date;
  @sap.display.format : 'Date'
  BID_DUE_DATE : Date;
  TENDER_SUBMITTED_BY : LargeString;
  REMARKS : String(5000);
  CUSTOM_REMARKS : LargeString not null;
  DELIVERYTERMS : String(5000);
  PAYMENTTERMS : String(5000);
  SHIPMENTTERMS : String(5000);
  IS_LOWEST : Integer not null;
  IS_DEFAULT_TERMS : Integer not null;
  NEW_APPROVAL : Integer;
  IN_POLICY : Boolean;
  BUDGET_RATE : Double;
  SPOT_RATE : Double;
  EXTERNAL_ID : LargeString;
  SAP_ID : LargeString;
  TENDER_TYPE : LargeString;
  CREATED_BY_USER_EMAIL : String(500);
  CREATED_BY_USER_ROLE : String(100);
  CREATED_BY_USER_CONTACTNUMBER : String(20);
  CONTENT : String(500);
  Submitted : Boolean;
  TenderChannel : String(255);
  ContractLength : Integer;
  ContractExtenseion : Integer;
  NumberOfExtension : Integer;
  ClientComment : LargeString;
  Comment : LargeString;
  Regions : LargeString;
  @sap.display.format : 'Date'
  InternalDueDate : Date;
  @sap.display.format : 'Date'
  ExpectedAwardDate : Date;
  Unitofvalidityperiod : LargeString;
  DeliveryDue : Integer;
  Unitofdeliverydue : LargeString;
  QuotationDeliverymethod : LargeString;
  QuotationRecipientname : LargeString;
  QuotationRecipientcontact : LargeString;
  @sap.display.format : 'Date'
  Expectdatetoreceivethedocument : Date;
  RequestorPphoneNnumber : Integer;
  BayerRepresentativeName : LargeString;
  BayerRepresentativePhoneNumber : Integer;
  @sap.display.format : 'Date'
  PeriodOfBankGauranteeStart : Date;
  @sap.display.format : 'Date'
  PeriodOfBankGauranteeEnd : Date;
  BGValueBaht : Double;
  TenderAnnouncementReference : LargeString;
  Contract_Length1 : Integer;
  Contract_Length2 : Integer;
  Contract_Length3 : Integer;
  ContractLenghtUnit : LargeString;
  AttentionTo : LargeString;
  @sap.display.format : 'Date'
  QuotationDate : Date;
  @sap.display.format : 'Date'
  InternalBidDueDate : Date;
  Tender_Custom_Integer_1 : Integer;
  Tender_Custom_Integer_2 : Integer;
  Tender_Custom_Integer_3 : Integer;
  Tender_Custom_Integer_4 : Integer;
  Tender_Custom_Integer_5 : Integer;
  Tender_Custom_Integer_6 : Integer;
  Tender_Custom_Integer_7 : Integer;
  Tender_Custom_Integer_8 : Integer;
  Tender_Custom_Integer_9 : Integer;
  Tender_Custom_Integer_10 : Integer;
  Tender_Custom_String_1 : LargeString;
  Tender_Custom_String_2 : LargeString;
  Tender_Custom_String_3 : LargeString;
  Tender_Custom_String_4 : LargeString;
  Tender_Custom_String_5 : LargeString;
  Tender_Custom_String_6 : LargeString;
  Tender_Custom_String_7 : LargeString;
  Tender_Custom_String_8 : LargeString;
  Tender_Custom_String_9 : LargeString;
  Tender_Custom_String_10 : LargeString;
  Tender_Custom_String_11 : LargeString;
  Tender_Custom_String_12 : LargeString;
  Tender_Custom_String_13 : LargeString;
  Tender_Custom_String_14 : LargeString;
  Tender_Custom_String_15 : LargeString;
  Tender_Custom_String_16 : LargeString;
  Tender_Custom_String_17 : LargeString;
  Tender_Custom_String_18 : LargeString;
  Tender_Custom_String_19 : LargeString;
  Tender_Custom_String_20 : LargeString;
  Tender_Custom_Double_1 : Double;
  Tender_Custom_Double_2 : Double;
  Tender_Custom_Double_3 : Double;
  Tender_Custom_Double_4 : Double;
  Tender_Custom_Double_5 : Double;
  Tender_Custom_Double_6 : Double;
  Tender_Custom_Double_7 : Double;
  Tender_Custom_Double_8 : Double;
  Tender_Custom_Double_9 : Double;
  Tender_Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Tender_Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Tender_Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Tender_Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Tender_Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Tender_Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Tender_Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Tender_Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Tender_Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Tender_Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Tender_Custom_Date_10 : Date;
  Tender_Custom_Boolean_1 : Boolean;
  Tender_Custom_Boolean_2 : Boolean;
  Tender_Custom_Boolean_3 : Boolean;
  Tender_Custom_Boolean_4 : Boolean;
  Tender_Custom_Boolean_5 : Boolean;
  Tender_Custom_Boolean_6 : Boolean;
  Tender_Custom_Boolean_7 : Boolean;
  Tender_Custom_Boolean_8 : Boolean;
  Tender_Custom_Boolean_9 : Boolean;
  Tender_Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Tender_Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Tender_Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Tender_Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Tender_Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Tender_Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Tender_Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Tender_Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Tender_Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Tender_Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Tender_Custom_Datetime_10 : DateTime;
  Offer_Custom_Integer_1 : Integer;
  Offer_Custom_Integer_2 : Integer;
  Offer_Custom_Integer_3 : Integer;
  Offer_Custom_Integer_4 : Integer;
  Offer_Custom_Integer_5 : Integer;
  Offer_Custom_Integer_6 : Integer;
  Offer_Custom_Integer_7 : Integer;
  Offer_Custom_Integer_8 : Integer;
  Offer_Custom_Integer_9 : Integer;
  Offer_Custom_Integer_10 : Integer;
  Offer_Custom_String_1 : LargeString;
  Offer_Custom_String_2 : LargeString;
  Offer_Custom_String_3 : LargeString;
  Offer_Custom_String_4 : LargeString;
  Offer_Custom_String_5 : LargeString;
  Offer_Custom_String_6 : LargeString;
  Offer_Custom_String_7 : LargeString;
  Offer_Custom_String_8 : LargeString;
  Offer_Custom_String_9 : LargeString;
  Offer_Custom_String_10 : LargeString;
  Offer_Custom_String_11 : LargeString;
  Offer_Custom_String_12 : LargeString;
  Offer_Custom_String_13 : LargeString;
  Offer_Custom_String_14 : LargeString;
  Offer_Custom_String_15 : LargeString;
  Offer_Custom_String_16 : LargeString;
  Offer_Custom_String_17 : LargeString;
  Offer_Custom_String_18 : LargeString;
  Offer_Custom_String_19 : LargeString;
  Offer_Custom_String_20 : LargeString;
  Offer_Custom_String_21 : LargeString;
  Offer_Custom_String_22 : LargeString;
  Offer_Custom_String_23 : LargeString;
  Offer_Custom_String_24 : LargeString;
  Offer_Custom_String_25 : LargeString;
  Offer_Custom_String_26 : LargeString;
  Offer_Custom_String_27 : LargeString;
  Offer_Custom_String_28 : LargeString;
  Offer_Custom_String_29 : LargeString;
  Offer_Custom_String_30 : LargeString;
  Offer_Custom_Double_1 : Double;
  Offer_Custom_Double_2 : Double;
  Offer_Custom_Double_3 : Double;
  Offer_Custom_Double_4 : Double;
  Offer_Custom_Double_5 : Double;
  Offer_Custom_Double_6 : Double;
  Offer_Custom_Double_7 : Double;
  Offer_Custom_Double_8 : Double;
  Offer_Custom_Double_9 : Double;
  Offer_Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Offer_Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Offer_Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Offer_Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Offer_Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Offer_Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Offer_Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Offer_Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Offer_Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Offer_Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Offer_Custom_Date_10 : Date;
  Offer_Custom_Boolean_1 : LargeString;
  Offer_Custom_Boolean_2 : LargeString;
  Offer_Custom_Boolean_3 : LargeString;
  Offer_Custom_Boolean_4 : LargeString;
  Offer_Custom_Boolean_5 : LargeString;
  Offer_Custom_Boolean_6 : LargeString;
  Offer_Custom_Boolean_7 : LargeString;
  Offer_Custom_Boolean_8 : LargeString;
  Offer_Custom_Boolean_9 : LargeString;
  Offer_Custom_Boolean_10 : LargeString;
  @odata.Type : 'Edm.DateTimeOffset'
  Offer_Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Offer_Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Offer_Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Offer_Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Offer_Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Offer_Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Offer_Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Offer_Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Offer_Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Offer_Custom_Datetime_10 : DateTime;
  Quotation_Custom_Integer_1 : Integer;
  Quotation_Custom_Integer_2 : Integer;
  Quotation_Custom_Integer_3 : Integer;
  Quotation_Custom_Integer_4 : Integer;
  Quotation_Custom_Integer_5 : Integer;
  Quotation_Custom_Integer_6 : Integer;
  Quotation_Custom_Integer_7 : Integer;
  Quotation_Custom_Integer_8 : Integer;
  Quotation_Custom_Integer_9 : Integer;
  Quotation_Custom_Integer_10 : Integer;
  Quotation_Custom_String_1 : LargeString;
  Quotation_Custom_String_2 : LargeString;
  Quotation_Custom_String_3 : LargeString;
  Quotation_Custom_String_4 : LargeString;
  Quotation_Custom_String_5 : LargeString;
  Quotation_Custom_String_6 : LargeString;
  Quotation_Custom_String_7 : LargeString;
  Quotation_Custom_String_8 : LargeString;
  Quotation_Custom_String_9 : LargeString;
  Quotation_Custom_String_10 : LargeString;
  Quotation_Custom_String_11 : LargeString;
  Quotation_Custom_String_12 : LargeString;
  Quotation_Custom_String_13 : LargeString;
  Quotation_Custom_String_14 : LargeString;
  Quotation_Custom_String_15 : LargeString;
  Quotation_Custom_String_16 : LargeString;
  Quotation_Custom_String_17 : LargeString;
  Quotation_Custom_String_18 : LargeString;
  Quotation_Custom_String_19 : LargeString;
  Quotation_Custom_String_20 : LargeString;
  Quotation_Custom_Double_1 : Double;
  Quotation_Custom_Double_2 : Double;
  Quotation_Custom_Double_3 : Double;
  Quotation_Custom_Double_4 : Double;
  Quotation_Custom_Double_5 : Double;
  Quotation_Custom_Double_6 : Double;
  Quotation_Custom_Double_7 : Double;
  Quotation_Custom_Double_8 : Double;
  Quotation_Custom_Double_9 : Double;
  Quotation_Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Quotation_Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Quotation_Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Quotation_Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Quotation_Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Quotation_Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Quotation_Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Quotation_Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Quotation_Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Quotation_Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Quotation_Custom_Date_10 : Date;
  Quotation_Custom_Boolean_1 : Boolean;
  Quotation_Custom_Boolean_2 : Boolean;
  Quotation_Custom_Boolean_3 : Boolean;
  Quotation_Custom_Boolean_4 : Boolean;
  Quotation_Custom_Boolean_5 : Boolean;
  Quotation_Custom_Boolean_6 : Boolean;
  Quotation_Custom_Boolean_7 : Boolean;
  Quotation_Custom_Boolean_8 : Boolean;
  Quotation_Custom_Boolean_9 : Boolean;
  Quotation_Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Quotation_Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Quotation_Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Quotation_Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Quotation_Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Quotation_Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Quotation_Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Quotation_Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Quotation_Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Quotation_Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Quotation_Custom_Datetime_10 : DateTime;
  NLHospitalManagerEmail : LargeString;
  NLHospitalManagerContactNumber : LargeString;
  TotalPNM_Value : Double;
  @cds.ambiguous : 'missing on condition?'
  ApproverTypes : Association to many StandardAppService.ApproverTypes {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.OfferProductValidation {
  key OFFER_ID : String(30) not null;
  key PRODUCTID : Integer not null;
  key LOTID : Integer not null;
  TENDER_ID : String(30);
  COUNTRY_CODE : LargeString;
  DIVISION : String(100);
  BRANDID : String(50);
  BRANDNAME : String(100);
  PRODUCT_UNIT_NAME : String(100);
  SKU : Integer;
  CODE : String(255);
  PRODUCTNAME : String(102);
  PRODUCTGENERICNAME : String(500);
  PACKSIZE : Double not null;
  DOSAGE : Double;
  UOM : String(10);
  COUNTRYOFORIGIN : String(120);
  MANUFACTURER : String(500);
  SHELFLIFE : Integer;
  PRESENTATION : String(50);
  VAT : Double;
  VAT_IN_WORDS : LargeString;
  PRODUCT_COMMENT : String(784);
  UNIT : String(255);
  PAID_VOLUME : Double;
  TOTAL_VOLUME : Double;
  SORTER : Integer;
  CURRENCY : String(255);
  REQUESTED_QUANTITY : String(567);
  SHIPMENT_TERMS : String(317);
  PAYMENT_TERMS : String(255);
  DELIVERY_TERMS : String(500);
  SAMPLES : Integer;
  SAMPLES_UNIT : Integer;
  SAMPLES_PACK : Integer;
  REGISTERED_PRICE : Double;
  REGISTERED_PRICE_IN_WORDS : LargeString;
  OFFER_PRICE : Double;
  FOC : String(25);
  FOC_ABS_PCT_STP : LargeString;
  TOTAL_QUANTITY_UNITS : Double;
  FOC_QUANTITY_UNITS : Double;
  PAID_QUANTITY_UNITS : Double;
  REQ_PRICE_UNIT_OFFER_CURRENCY : Double;
  REQ_PRICE_UNIT_OFFER_CURRENCY_VAT : Double;
  REQ_PRICE_PACK_OFFER_CURRENCY : Double;
  REQ_PRICE_UNIT_EUR_BUDGET : Double;
  REQ_PRICE_UNIT_EUR_SPOT : Double;
  NET_PRICE_UNIT_OFFER_CURRENCY : Double;
  NET_PRICE_UNIT_OFFER_CURRENCY_IN_WORDS : LargeString;
  NET_PRICE_UNIT_OFFER_CURRENCY_VAT : Double;
  NET_PRICE_UNIT_OFFER_CURRENCY_VAT_IN_WORDS : LargeString;
  NET_PRICE_PACK_OFFER_CURRENCY : Double;
  NET_PRICE_PACK_OFFER_CURRENCY_IN_WORDS : LargeString;
  NET_PRICE_PACK_OFFER_CURRENCY_VAT : Double;
  NET_PRICE_PACK_OFFER_CURRENCY_VAT_IN_WORDS : LargeString;
  NET_PRICE_UNIT_EUR_BUDGET : Double;
  NET_PRICE_UNIT_EUR_SPOT : Double;
  NET_OFFER_PRICE : Double;
  NET_PRICE : Double;
  ADDITIONAL_DISCOUNT : Double;
  ADDITIONAL_DISCOUNT_IN_WORDS : LargeString;
  MAX_PRICE_NHS_PP : Double;
  MAX_PRICE_NHS_PP_IN_WORDS : LargeString;
  MAX_PRICE_NHS_PU : Double;
  MAX_PRICE_NHS_PU_IN_WORDS : LargeString;
  MAX_PRICE_NHS_PU_WITH_VAT : Double;
  MAX_PRICE_NHS_PU_WITH_VAT_IN_WORDS : LargeString;
  CONTRACT_START_DATE : LargeString;
  NET_OFFER_PRICE_IN_WORDS : LargeString;
  CUSTOMER_ID : Integer;
  COGS : Double;
  COGS_EUR_UNIT : Double;
  COGS_EUR_PACK : Double;
  GROSS_SALES_OFFER_CURRENCY : Double;
  GROSS_SALES_OFFER_CURRENCY_IN_WORDS : LargeString;
  GROSS_SALES_OFFER_CURRENCY_VAT : Double;
  GROSS_SALES_OFFER_CURRENCY_VAT_IN_WORDS : LargeString;
  VAT_TOTAL : Double;
  NET_SALES_OFFER_CURRENCY : Double;
  NET_SALES_OFFER_CURRENCY_IN_WORDS : LargeString;
  NET_SALES_EUR_BUDGET : Double;
  NET_SALES_EUR_SPOT : Double;
  GROSS_MARGIN_EUR_BUDGET : Double;
  GROSS_MARGIN_EUR_SPOT : Double;
  GROSS_PROFIT_EUR_BUDGET : Double;
  GROSS_PROFIT_EUR_SPOT : Double;
  IS_LOWEST : Integer not null;
  IS_DEFAULT_TERMS : Integer not null;
  IS_REGISTERED : Integer not null;
  IS_ALTERNATIVE_QUOTED : Integer not null;
  IS_ALTERNATIVE_REQUESTED : Integer not null;
  NEW_APPROVAL : Integer;
  BUDGETED_PROFITABILITY : Double;
  UK_BUDGETED_PROFITABILITY : Double;
  CHANNEL : LargeString;
  ACT_PROFITABILITY : Double;
  IN_POLICY : Boolean;
  MOLECULE_NAME : LargeString;
  FOC_STEP : Double;
  OFFER_PRICE_VAT : Double;
  BUDGET_RATE : Double;
  SPOT_RATE : Double;
  BUSINESS_CASE_PRICE : Double;
  WARRANTY : Double;
  AGREEMENTDURATION : Integer;
  MONTHLYRENT : Double;
  MONTHLYRENT_IN_WORDS : LargeString;
  MONTHSPERINVOICE : Integer;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  CONTRACTSTARTDATE : Timestamp;
  VALUEOFDEVICES : Double;
  STATUSOFDEVICE : LargeString;
  MINCONTRACTUAL : Double;
  MINANNPURCH : Double;
  OFFER_TYPE : LargeString;
  ACTIVERECORD : String(10);
  HLEVEL6_CODE : String(50);
  PCI_NAME : String(255);
  ACTIVE_SUBSTANCE : String(50);
  PRODUCT_TYPE : String(50);
  SKUCOUNTRY_ACTIVERECORD : String(10);
  PRESENTATION_2 : String(1000);
  GOV_CODE : String(255);
  CODE1 : String(255);
  CODE2 : String(255);
  CODE3 : String(255);
  QTY_THRESHOLD : Integer;
  ProductClass : String(2);
  ProductDescription : String(255);
  FINAL_DISCOUNT : Double;
  FINAL_DISCOUNT_IN_WORDS : String(255);
  PRODUCT_FULL_DESCRIPTION : String(255);
  LINE : LargeString;
  REFERENCE : String(255);
  IBIZWORKFLOWID : Integer;
  DISTRIBUTORID : LargeString;
  DistributorName : String(500);
  Address : String(500);
  City : LargeString;
  AwardedPrice : Double;
  InstituteID : Integer not null;
  @sap.display.format : 'Date'
  EARLIEST_DATE : Date;
  Comment : LargeString;
  PackSizeRequired : Integer;
  @sap.variable.scale : 'true'
  Price0 : Decimal;
  @sap.variable.scale : 'true'
  Price1 : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level2Discount1 : Double;
  Level2Discount2 : Double;
  AnnualDiscount_Percentage : Double;
  NegotiationPrice : Double;
  PricingPolicyValue : Double;
  FreeGoodsQuantity : Double;
  FreeGoodsOther_Step : Double;
  FreeGoodsOther_ABS_PCT : String(4);
  FOC_PRODUCTPACKNAME : LargeString;
  ADD_INCLUDE : LargeString;
  Level3Discount1 : Double;
  Level1Discount1 : Double;
  Region : String(50);
  AlternateOfferYN : String(255);
  NET_OFFER_SALES_OFFER_CURRENCY : Double;
  NET_OFFER_SALES_OFFER_CURRENCY_IN_WORDS : LargeString;
  FOCInfoText : LargeString;
  ContractDuration_1 : Double;
  ContractDuration_2 : Double;
  ContractDuration_3 : Double;
  OfferPrice_1 : Double;
  OfferPrice_2 : Double;
  OfferPrice_3 : Double;
  Discount_1 : Double;
  Discount_2 : Double;
  Discount_3 : Double;
  ItemNumber : Integer;
  NLPriceConditionType : LargeString;
  Product_Custom_Integer_1 : Integer;
  Product_Custom_Integer_2 : Integer;
  Product_Custom_Integer_3 : Integer;
  Product_Custom_Integer_4 : Integer;
  Product_Custom_Integer_5 : Integer;
  Product_Custom_Integer_6 : Integer;
  Product_Custom_Integer_7 : Integer;
  Product_Custom_Integer_8 : Integer;
  Product_Custom_Integer_9 : Integer;
  Product_Custom_Integer_10 : Integer;
  Product_Custom_String_1 : LargeString;
  Product_Custom_String_2 : LargeString;
  Product_Custom_String_3 : LargeString;
  Product_Custom_String_4 : LargeString;
  Product_Custom_String_5 : LargeString;
  Product_Custom_String_6 : LargeString;
  Product_Custom_String_7 : LargeString;
  Product_Custom_String_8 : LargeString;
  Product_Custom_String_9 : LargeString;
  Product_Custom_String_10 : LargeString;
  Product_Custom_String_11 : LargeString;
  Product_Custom_String_12 : LargeString;
  Product_Custom_String_13 : LargeString;
  Product_Custom_String_14 : LargeString;
  Product_Custom_String_15 : LargeString;
  Product_Custom_String_16 : LargeString;
  Product_Custom_String_17 : LargeString;
  Product_Custom_String_18 : LargeString;
  Product_Custom_String_19 : LargeString;
  Product_Custom_String_20 : LargeString;
  Product_Custom_Double_1 : Double;
  Product_Custom_Double_2 : Double;
  Product_Custom_Double_3 : Double;
  Product_Custom_Double_4 : Double;
  Product_Custom_Double_5 : Double;
  Product_Custom_Double_6 : Double;
  Product_Custom_Double_7 : Double;
  Product_Custom_Double_8 : Double;
  Product_Custom_Double_9 : Double;
  Product_Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Product_Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Product_Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Product_Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Product_Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Product_Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Product_Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Product_Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Product_Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Product_Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Product_Custom_Date_10 : Date;
  Product_Custom_Boolean_1 : Boolean;
  Product_Custom_Boolean_2 : Boolean;
  Product_Custom_Boolean_3 : Boolean;
  Product_Custom_Boolean_4 : Boolean;
  Product_Custom_Boolean_5 : Boolean;
  Product_Custom_Boolean_6 : Boolean;
  Product_Custom_Boolean_7 : Boolean;
  Product_Custom_Boolean_8 : Boolean;
  Product_Custom_Boolean_9 : Boolean;
  Product_Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Product_Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Product_Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Product_Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Product_Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Product_Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Product_Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Product_Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Product_Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Product_Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Product_Custom_Datetime_10 : DateTime;
  Delivery_Custom_Integer_1 : Integer;
  Delivery_Custom_Integer_2 : Integer;
  Delivery_Custom_Integer_3 : Integer;
  Delivery_Custom_Integer_4 : Integer;
  Delivery_Custom_Integer_5 : Integer;
  Delivery_Custom_Integer_6 : Integer;
  Delivery_Custom_Integer_7 : Integer;
  Delivery_Custom_Integer_8 : Integer;
  Delivery_Custom_Integer_9 : Integer;
  Delivery_Custom_Integer_10 : Integer;
  Delivery_Custom_String_1 : LargeString;
  Delivery_Custom_String_2 : LargeString;
  Delivery_Custom_String_3 : LargeString;
  Delivery_Custom_String_4 : LargeString;
  Delivery_Custom_String_5 : LargeString;
  Delivery_Custom_String_6 : LargeString;
  Delivery_Custom_String_7 : LargeString;
  Delivery_Custom_String_8 : LargeString;
  Delivery_Custom_String_9 : LargeString;
  Delivery_Custom_String_10 : LargeString;
  Delivery_Custom_String_11 : LargeString;
  Delivery_Custom_String_12 : LargeString;
  Delivery_Custom_String_13 : LargeString;
  Delivery_Custom_String_14 : LargeString;
  Delivery_Custom_String_15 : LargeString;
  Delivery_Custom_String_16 : LargeString;
  Delivery_Custom_String_17 : LargeString;
  Delivery_Custom_String_18 : LargeString;
  Delivery_Custom_String_19 : LargeString;
  Delivery_Custom_String_20 : LargeString;
  Delivery_Custom_Double_1 : Double;
  Delivery_Custom_Double_2 : Double;
  Delivery_Custom_Double_3 : Double;
  Delivery_Custom_Double_4 : Double;
  Delivery_Custom_Double_5 : Double;
  Delivery_Custom_Double_6 : Double;
  Delivery_Custom_Double_7 : Double;
  Delivery_Custom_Double_8 : Double;
  Delivery_Custom_Double_9 : Double;
  Delivery_Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Delivery_Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Delivery_Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Delivery_Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Delivery_Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Delivery_Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Delivery_Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Delivery_Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Delivery_Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Delivery_Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Delivery_Custom_Date_10 : Date;
  Delivery_Custom_Boolean_1 : Boolean;
  Delivery_Custom_Boolean_2 : Boolean;
  Delivery_Custom_Boolean_3 : Boolean;
  Delivery_Custom_Boolean_4 : Boolean;
  Delivery_Custom_Boolean_5 : Boolean;
  Delivery_Custom_Boolean_6 : Boolean;
  Delivery_Custom_Boolean_7 : Boolean;
  Delivery_Custom_Boolean_8 : Boolean;
  Delivery_Custom_Boolean_9 : Boolean;
  Delivery_Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Delivery_Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Delivery_Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Delivery_Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Delivery_Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Delivery_Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Delivery_Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Delivery_Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Delivery_Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Delivery_Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Delivery_Custom_Datetime_10 : DateTime;
  TenderResults_Custom_Integer_1 : Integer;
  TenderResults_Custom_Integer_2 : Integer;
  TenderResults_Custom_Integer_3 : Integer;
  TenderResults_Custom_Integer_4 : Integer;
  TenderResults_Custom_Integer_5 : Integer;
  TenderResults_Custom_Integer_6 : Integer;
  TenderResults_Custom_Integer_7 : Integer;
  TenderResults_Custom_Integer_8 : Integer;
  TenderResults_Custom_Integer_9 : Integer;
  TenderResults_Custom_Integer_10 : Integer;
  TenderResults_Custom_String_1 : LargeString;
  TenderResults_Custom_String_2 : LargeString;
  TenderResults_Custom_String_3 : LargeString;
  TenderResults_Custom_String_4 : LargeString;
  TenderResults_Custom_String_5 : LargeString;
  TenderResults_Custom_String_6 : LargeString;
  TenderResults_Custom_String_7 : LargeString;
  TenderResults_Custom_String_8 : LargeString;
  TenderResults_Custom_String_9 : LargeString;
  TenderResults_Custom_String_10 : LargeString;
  TenderResults_Custom_String_11 : LargeString;
  TenderResults_Custom_String_12 : LargeString;
  TenderResults_Custom_String_13 : LargeString;
  TenderResults_Custom_String_14 : LargeString;
  TenderResults_Custom_String_15 : LargeString;
  TenderResults_Custom_String_16 : LargeString;
  TenderResults_Custom_String_17 : LargeString;
  TenderResults_Custom_String_18 : LargeString;
  TenderResults_Custom_String_19 : LargeString;
  TenderResults_Custom_String_20 : LargeString;
  TenderResults_Custom_Double_1 : Double;
  TenderResults_Custom_Double_2 : Double;
  TenderResults_Custom_Double_3 : Double;
  TenderResults_Custom_Double_4 : Double;
  TenderResults_Custom_Double_5 : Double;
  TenderResults_Custom_Double_6 : Double;
  TenderResults_Custom_Double_7 : Double;
  TenderResults_Custom_Double_8 : Double;
  TenderResults_Custom_Double_9 : Double;
  TenderResults_Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  TenderResults_Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  TenderResults_Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  TenderResults_Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  TenderResults_Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  TenderResults_Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  TenderResults_Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  TenderResults_Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  TenderResults_Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  TenderResults_Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  TenderResults_Custom_Date_10 : Date;
  TenderResults_Custom_Boolean_1 : Boolean;
  TenderResults_Custom_Boolean_2 : Boolean;
  TenderResults_Custom_Boolean_3 : Boolean;
  TenderResults_Custom_Boolean_4 : Boolean;
  TenderResults_Custom_Boolean_5 : Boolean;
  TenderResults_Custom_Boolean_6 : Boolean;
  TenderResults_Custom_Boolean_7 : Boolean;
  TenderResults_Custom_Boolean_8 : Boolean;
  TenderResults_Custom_Boolean_9 : Boolean;
  TenderResults_Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  TenderResults_Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  TenderResults_Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  TenderResults_Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  TenderResults_Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  TenderResults_Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  TenderResults_Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  TenderResults_Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  TenderResults_Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  TenderResults_Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  TenderResults_Custom_Datetime_10 : DateTime;
  CompetitorResult_Custom_Integer_1 : Integer;
  CompetitorResult_Custom_Integer_2 : Integer;
  CompetitorResult_Custom_Integer_3 : Integer;
  CompetitorResult_Custom_Integer_4 : Integer;
  CompetitorResult_Custom_Integer_5 : Integer;
  CompetitorResult_Custom_Integer_6 : Integer;
  CompetitorResult_Custom_Integer_7 : Integer;
  CompetitorResult_Custom_Integer_8 : Integer;
  CompetitorResult_Custom_Integer_9 : Integer;
  CompetitorResult_Custom_Integer_10 : Integer;
  CompetitorResult_Custom_String_1 : LargeString;
  CompetitorResult_Custom_String_2 : LargeString;
  CompetitorResult_Custom_String_3 : LargeString;
  CompetitorResult_Custom_String_4 : LargeString;
  CompetitorResult_Custom_String_5 : LargeString;
  CompetitorResult_Custom_String_6 : LargeString;
  CompetitorResult_Custom_String_7 : LargeString;
  CompetitorResult_Custom_String_8 : LargeString;
  CompetitorResult_Custom_String_9 : LargeString;
  CompetitorResult_Custom_String_10 : LargeString;
  CompetitorResult_Custom_String_11 : LargeString;
  CompetitorResult_Custom_String_12 : LargeString;
  CompetitorResult_Custom_String_13 : LargeString;
  CompetitorResult_Custom_String_14 : LargeString;
  CompetitorResult_Custom_String_15 : LargeString;
  CompetitorResult_Custom_String_16 : LargeString;
  CompetitorResult_Custom_String_17 : LargeString;
  CompetitorResult_Custom_String_18 : LargeString;
  CompetitorResult_Custom_String_19 : LargeString;
  CompetitorResult_Custom_String_20 : LargeString;
  CompetitorResult_Custom_Double_1 : Double;
  CompetitorResult_Custom_Double_2 : Double;
  CompetitorResult_Custom_Double_3 : Double;
  CompetitorResult_Custom_Double_4 : Double;
  CompetitorResult_Custom_Double_5 : Double;
  CompetitorResult_Custom_Double_6 : Double;
  CompetitorResult_Custom_Double_7 : Double;
  CompetitorResult_Custom_Double_8 : Double;
  CompetitorResult_Custom_Double_9 : Double;
  CompetitorResult_Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  CompetitorResult_Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  CompetitorResult_Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  CompetitorResult_Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  CompetitorResult_Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  CompetitorResult_Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  CompetitorResult_Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  CompetitorResult_Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  CompetitorResult_Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  CompetitorResult_Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  CompetitorResult_Custom_Date_10 : Date;
  CompetitorResult_Custom_Boolean_1 : Boolean;
  CompetitorResult_Custom_Boolean_2 : Boolean;
  CompetitorResult_Custom_Boolean_3 : Boolean;
  CompetitorResult_Custom_Boolean_4 : Boolean;
  CompetitorResult_Custom_Boolean_5 : Boolean;
  CompetitorResult_Custom_Boolean_6 : Boolean;
  CompetitorResult_Custom_Boolean_7 : Boolean;
  CompetitorResult_Custom_Boolean_8 : Boolean;
  CompetitorResult_Custom_Boolean_9 : Boolean;
  CompetitorResult_Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  CompetitorResult_Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  CompetitorResult_Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  CompetitorResult_Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  CompetitorResult_Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  CompetitorResult_Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  CompetitorResult_Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  CompetitorResult_Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  CompetitorResult_Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  CompetitorResult_Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  CompetitorResult_Custom_Datetime_10 : DateTime;
  TenderAnnouncementReference : LargeString;
  NLStaticField1 : LargeString;
  NLStaticField2 : LargeString;
  PL_VolumeInPacks : Double;
  PNM_VALUE : Double;
  MaxNetPricePerPack : Double;
  @cds.ambiguous : 'missing on condition?'
  FreeGoodsOther : Association to many StandardAppService.FreeGoodsOther {  };
  @cds.ambiguous : 'missing on condition?'
  PriceConditionCurrentSectionTaiwan : Association to many StandardAppService.PriceConditionCurrentSectionTaiwanView {  };
  @cds.ambiguous : 'missing on condition?'
  ProductPack : Association to many StandardAppService.ProductPack {  };
  @cds.ambiguous : 'missing on condition?'
  Materials : Association to many StandardAppService.PT_TMSKUPRDPCK {  };
  @cds.ambiguous : 'missing on condition?'
  ApproverTypes : Association to many StandardAppService.ApproverTypes {  };
  @cds.ambiguous : 'missing on condition?'
  PriceCondition : Composition of many StandardAppService.PriceCondition;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryLegalEntitySignatories {
  key LEGAL_ENTITY_CODE : String(3) not null;
  key COUNTRY_CODE : LargeString not null;
  key AUTHORIZED_SIGNATORY : String(5000) not null;
  key CountryCode : LargeString not null;
  NAME : String(5000);
  TITLE : String(5000);
  SORTER : Integer;
  SIGNATORY : Integer;
  DIVISION : String(50);
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = COUNTRY_CODE;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ApproverList {
  key CountryCode : LargeString not null;
  key ApproverType : String(200) not null;
  key Division : String(200) not null;
  key ApproverEmailID : String(200) not null;
  key BU : LargeString not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  ApproverID : String(100);
  ApproverName : String(200);
  Enabled : Boolean;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ApproverTypes {
  key ApproverType : String(200) not null;
  key CountryCode : LargeString not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  Hierarchy : Integer;
  ValidationType : Integer;
  ValidationType2 : Integer;
  Enabled : Boolean;
  @cds.ambiguous : 'missing on condition?'
  CountryApprovers : Association to many StandardAppService.ApproverList {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.OfferProductOfferStatus {
  key OfferId : String(30) not null;
  key ApproverType : String(200) not null;
  TenderID : String(50) not null;
  CountryCode : LargeString not null;
  ApprovalContent : String(13);
  ApproverTypeSection : Integer;
  REQUIRED_ACTION : String(12);
  ApprovalStatus : String(100) not null;
  ApproverName : String(100);
  ApproverEmailID : String(100);
  SenderComment : String(500);
  ApproverComment : String(500);
  Active : Integer not null;
  Hierarchy : Integer;
  AP_ID : String(10);
  RestoreKey : String(100);
  @odata.Type : 'Edm.DateTimeOffset'
  Statustime : DateTime;
  Submittedby : String(100);
  @sap.display.format : 'Date'
  ApproverDate : Date;
  Division : String(200) not null;
  FLOW_ID : String(255);
  CountryName : String(255);
  UserName : String(255);
  UserEmail : String(255);
  send : String(3);
  @cds.ambiguous : 'missing on condition?'
  ApproverList : Association to many StandardAppService.ApproverList {  };
  @cds.ambiguous : 'missing on condition?'
  ApproverTypes : Association to many StandardAppService.ApproverTypes {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ProductPricesCheckView {
  key OfferID : String(30) not null;
  Active : Integer not null;
  allProductPricesSet : Boolean;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.AwardedProducts {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  TenderID : String(50);
  CountryCode : LargeString;
  InstituteID : Integer;
  ContractNo : String(50);
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Active : Integer;
  ErrorInSubmission : String(255);
  Outcome : String(255);
  AwardedCompany : String(255);
  AwardedProduct : String(255);
  AwardedPrice : Double;
  Currency : String(255);
  AwardedQty : Integer;
  UoM : String(255);
  Reason : String(255);
  Comment : String(255);
  AwardedTier : Integer;
  @sap.display.format : 'Date'
  ExtensionDate : Date;
  ExtensionNotes : LargeString;
  AwardLetterNo : LargeString;
  AwardDelibNo : LargeString;
  @sap.display.format : 'Date'
  DeliveryDate : Date;
  @sap.display.format : 'Date'
  ResultDate : Date;
  @sap.display.format : 'Date'
  AwardDate : Date;
  AwardActing : LargeString;
  Appeal : LargeString;
  InfoNeeded : LargeString;
  TotalAwardedValue : Double;
  @sap.display.format : 'Date'
  ContractStartDate : Date;
  @sap.display.format : 'Date'
  ContractEndDate : Date;
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  LotID : Integer;
  SORTER : Integer;
  @cds.ambiguous : 'missing on condition?'
  CompetitorResult : Association to many StandardAppService.CompetitorResultsTableView {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.OfferProducts {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key LotID : Integer not null;
  key Active : Integer not null;
  TenderID : String(50) not null;
  CountryCode : LargeString;
  SORTER : Integer;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.AwardedProductFormView {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key LotID : Integer not null;
  TenderID : String(50);
  CountryCode : LargeString;
  InstituteID : Integer;
  ContractNo : String(50);
  Outcome : String(255);
  ErrorInSubmission : String(255);
  AwardedCompany : String(255);
  AwardedProduct : String(255);
  AwardedPrice : Double;
  Currency : String(255);
  AwardedQty : Integer;
  UoM : String(255);
  Reason : String(255);
  Comment : String(255);
  Active : Integer not null;
  FreeGoodsOther : Double;
  FreeGoodsOther_ABS_PCT : String(4);
  FreeGoodsOther_Step : Double;
  ADD_INCLUDE : LargeString;
  FOC : LargeString;
  RequestedVolume : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  TotalAwardedValue : Double;
  priceconditionID : UUID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MasterCountryOutComes {
  key CountryCode : LargeString not null;
  key Outcome : String(60) not null;
  Sorter : Integer;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MasterOutComeReasons {
  key TenderOutcomeReasons : String(255) not null;
  key Outcome : String(4) not null;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MasterCountryCurrencies {
  key CountryCode : LargeString not null;
  key Currency : String(3) not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  Sorter : Integer;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.StandardDivisions {
  key ID : UUID not null;
  CountryCode : LargeString not null;
  DivisionCode : String(40);
  DivisionName : String(40);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.OfferStatus {
  key OFFER_ID : String(30) not null;
  STATUS : String(255);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ProductPack {
  key PRODUCTPACKID : Integer not null;
  PRODUCTPACKNAME : String(100);
  PRESENTATION : String(50);
  UOM : String(10);
  ACTIVERECORD : String(10);
  HLEVEL6_CODE : String(50);
  CONCENTRATION : Double;
  PACKFACTOR : Double;
  PCIName : String(255);
  MoleculeName : String(255);
  ACTIVE_SUBSTANCE : String(50);
  ProductType : String(50);
  ProductClass : String(10);
  ProductDescription : LargeString;
  ProductFullDescription : LargeString;
  Nucleus : String(100);
  ProductGenericName : String(500);
  Bundle : Integer;
  OuterCarton : Integer;
  CalculationFactorIRP : Double;
  @cds.ambiguous : 'missing on condition?'
  CountryPacks : Association to many StandardAppService.CountryProductPackView on CountryPacks.PRODUCTPACKID = PRODUCTPACKID;
  @cds.ambiguous : 'missing on condition?'
  ProductPackSKUs : Association to many StandardAppService.PT_TMSKUPRDPCK on ProductPackSKUs.ProductPackID = PRODUCTPACKID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceCondition {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  CountryCode : LargeString;
  OfferID : LargeString;
  ProductCode : Integer;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  Discount : Decimal;
  RoyalDecree : LargeString;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  @sap.variable.scale : 'true'
  MaximumPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  PriceConditionCode : LargeString;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  ReferencePriceAgreement : UUID;
  LotID : Integer;
  @sap.variable.scale : 'true'
  PriceList : Decimal;
  @sap.variable.scale : 'true'
  ICMSTax : Decimal;
  TaxExemption : LargeString;
  @sap.variable.scale : 'true'
  PriceAfterTaxExemtion : Decimal;
  CAP : LargeString;
  @sap.variable.scale : 'true'
  PriceAfterCap : Decimal;
  @sap.variable.scale : 'true'
  CommercialProposal : Decimal;
  @sap.variable.scale : 'true'
  TaxEqualization : Decimal;
  @sap.variable.scale : 'true'
  Invoive : Decimal;
  @sap.variable.scale : 'true'
  ICMS : Decimal;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  Price0 : Decimal;
  Level1Discount1 : Double;
  Level1Discount2 : Double;
  Level1Discount3 : Double;
  @sap.variable.scale : 'true'
  Price1 : Decimal;
  Level2Discount1 : Double;
  Level2Discount2 : Double;
  Level2Discount3 : Double;
  @sap.variable.scale : 'true'
  Price2 : Decimal;
  Level3Discount1 : Double;
  Level3Discount2 : Double;
  Level3Discount3 : Double;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  PriceConditionClassification_ID : UUID;
  PriceAgreement_ID : UUID;
  Settlement_ID : String(10);
  IsPricingUnlocked : Boolean;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  CurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MarketIncentiveID : LargeString;
  @cds.ambiguous : 'missing on condition?'
  DiscountCondition : Composition of many StandardAppService.DiscountCondition on DiscountCondition.PriceCondition_ID = ID;
  @cds.ambiguous : 'missing on condition?'
  PriceConditionClassification : Association to StandardAppService.PriceConditionClassification on PriceConditionClassification.ID = PriceConditionClassification_ID;
  @cds.ambiguous : 'missing on condition?'
  FreeGoodsOther : Composition of many StandardAppService.FreeGoodsOther on FreeGoodsOther.PriceCondition_ID = ID;
  @cds.ambiguous : 'missing on condition?'
  Settlement : Association to StandardAppService.Settlements on Settlement.ID = Settlement_ID;
  @cds.ambiguous : 'missing on condition?'
  NLPriceConditions : Association to many StandardAppService.NLPriceConditions on NLPriceConditions.PriceCondition_ID = ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryBrands {
  key COUNTRY_CODE : LargeString not null;
  key BRAND_ID : String(50) not null;
  BRAND_NAME : String(500);
  DIVISION : String(500);
  BU : String(255);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CountryBrandProducts {
  key COUNTRY_CODE : LargeString not null;
  key PRODUCT_ID : Integer not null;
  COUNTRYCODE : LargeString not null;
  ACTIVERECORD : String(10);
  DIVISION : String(100);
  BRAND_ID : String(50);
  BRAND_NAME : String(100);
  PRODUCT_UNIT_ID : String(50);
  PRODUCT_UNIT_NAME : String(100);
  PRODUCTPACKID : Integer;
  PRODUCT_NAME : String(100);
  PACK_SIZE : Double;
  DOSAGE : Double;
  UOM : String(10);
  COUNTRY_OF_ORIGIN : String(120);
  MANUFACTURER : String(500);
  SHELFLIFE : Integer;
  PRESENTATION : String(50);
  VAT : Double;
  REGISTERED : Integer;
  REGISTERED_VALUE : Integer;
  COMMENT : String(255);
  COGS : Double;
  GOV_CODE : String(255);
  CODE1 : String(255);
  CODE2 : String(255);
  CODE3 : String(255);
  QTY_THRESHOLD : Integer;
  BU : String(255);
  @sap.display.format : 'Date'
  RegistrationDate : Date;
  @sap.display.format : 'Date'
  RegistrationValidUntil : Date;
  OutSourcedStatus : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CompetitorResultsTableView {
  key OFFERID : String(30) not null;
  key PRODUCTCODE : Integer not null;
  key LOTID : Integer not null;
  key AWARDEDCOMPANY : String(255) not null;
  key AWARDEDPRODUCT : String(255) not null;
  OUTCOME : String(255);
  REQUESTEDVOLUME : Integer;
  AWARDEDPRICE : Double;
  CURRENCY : String(3);
  AWARDEDQTY : Integer;
  UOM : String(255);
  REASON : String(255);
  COMMENT : String(255);
  @sap.display.format : 'Date'
  LASTUPDATE : Date;
  UPDATEDBY : String(255);
  DELETED : Integer;
  TOTALAWARDEDVALUE : Double;
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MasterCompetitors {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  CountryCode : LargeString;
  ProductCode : Integer;
  CompetitorProduct : String(300);
  CompetitorCompany : String(300);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MasterCompetitorProducts {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  CountryCode : LargeString;
  ProductCode : Integer;
  CompetitorProduct : String(300);
  CompetitorCompany : String(300);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.WordTemplate {
  key templateId : Integer not null;
  name : String(100);
  filename : String(250);
  mediaType : LargeString;
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.WordTemplateCountry {
  key countryCode : LargeString not null;
  key templateId : Integer not null;
  name : String(100);
  filename : String(250);
  @cds.ambiguous : 'missing on condition?'
  WordTemplates : Association to StandardAppService.WordTemplate on WordTemplates.templateId = templateId;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.WordAttachments {
  key offerId : String(50) not null;
  key templateId : Integer not null;
  mediaType : LargeString;
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ExcelTemplate {
  key templateId : Integer not null;
  name : String(100);
  filename : String(250);
  mediaType : LargeString;
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ExcelTemplateCountry {
  key countryCode : LargeString not null;
  key templateId : Integer not null;
  name : String(100);
  filename : String(250);
  @cds.ambiguous : 'missing on condition?'
  ExcelTemplates : Association to StandardAppService.ExcelTemplate on ExcelTemplates.templateId = templateId;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ExcelAttachments {
  key offerId : String(50) not null;
  key templateId : Integer not null;
  mediaType : LargeString;
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.DeliveryProductTableView {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  TenderID : String(50) not null;
  CountryCode : LargeString;
  AwardedProduct : String(255);
  AwardedQty : Integer;
  SumOfDeliveredAmount : Double;
  DeliveredPercentage : Double;
  Region : String(50);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.DeliveryTrackingDetailView {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key SNo : Integer not null;
  key LotID : Integer not null;
  TenderID : String(50);
  CountryCode : LargeString;
  InstituteID : Integer;
  SKUCode : Integer;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Active : Integer not null;
  LocalOrDirectDelivery : String(255);
  PlannedInAPO : String(255);
  @sap.display.format : 'Date'
  RequestedDeliveryDate : Date;
  RequestedQuantity : Double;
  @sap.display.format : 'Date'
  ActualDeliveryDate : Date;
  ActualDeliveryQuantity : Double;
  Penalty : String(255);
  PenaltyValue : Double;
  Currency : String(4);
  PenaltyReason : String(255);
  UndertakingLetters : String(4);
  Compensated : String(4);
  CompensationComment : String(255);
  PaidOrFree : String(255);
  PO : String(255);
  InvoiceNo : String(255);
  Contract : LargeString;
  @sap.display.format : 'Date'
  PoDate : Date;
  ActualDeliveredProduct : String(100);
  ActualDeliveredProductQty : Double;
  LocalDeliveryNoteNo : String(255);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  @cds.ambiguous : 'missing on condition?'
  Institute : Association to StandardAppService.SalesReportInstitutesView {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PdfEmail {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  URL : LargeString;
  TenderID : String(50);
  OfferID : String(30);
  TenderInstitute : String(500);
  OfferInstitute : String(500);
  UserEmail : String(255);
  UserName : String(100);
  Sent : Boolean;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ChildInstitutes {
  key ParentInstituteID : Integer not null;
  key InstituteID : Integer not null;
  key CountryCode : LargeString not null;
  QuotationInstituteID : LargeString;
  InstituteName : String(500);
  PaymentTerms : String(500);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ChildInstitutesView {
  key ParentInstituteID : Integer not null;
  key InstituteID : Integer not null;
  key CountryCode : LargeString not null;
  QuotationInstituteID : LargeString;
  InstituteName : String(500);
  PaymentTerms : String(500);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PakistanMasterDistributors {
  key InstituteID : Integer not null;
  key BU : LargeString not null;
  key CountryCode : LargeString not null;
  DistributorID : Integer;
  DistributorName : String(500);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ProductBrand {
  key PRODUCTPACKID : Integer not null;
  HLEVEL6_CODE : String(50);
  HLEVEL4_NAME : String(100);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.InstitutesInBranchWithParent {
  InstituteID : Integer not null;
  ParentInstituteID : Integer not null;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.InstituteInBranchView {
  key InstituteID : Integer not null;
  key InstituteName : String(500) not null;
  ParentInstituteID : Integer not null;
  PaymentTerms : String(500);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.StandardTenderHistory {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key CountryCode : LargeString not null;
  key INSTITUTE_ID : Integer not null;
  Region : String(50);
  Currency : String(255);
  @sap.display.format : 'Date'
  CreationDate : Date;
  NetofferPriceBDPR : Double;
  NetPriceBDPR : Double;
  UnitPerPack : String(255);
  TENDER_NAME : String(250);
  @sap.display.format : 'Date'
  OFFER_DATE : Date;
  @sap.display.format : 'Date'
  EffectiveDate : Date;
  @sap.display.format : 'Date'
  ExpiryDate : Date;
  INSTITUTE_NAME : String(500);
  PRODUCT_NAME : String(100);
  OfferPriceBDPR : Double;
  RequestedVolume : Integer;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  Price0 : Decimal;
  Level1Discount1 : Double;
  Level1Discount2 : Double;
  Level1Discount3 : Double;
  @sap.variable.scale : 'true'
  Price1 : Decimal;
  Level2Discount1 : Double;
  Level2Discount2 : Double;
  Level2Discount3 : Double;
  @sap.variable.scale : 'true'
  Price2 : Decimal;
  Level3Discount1 : Double;
  Level3Discount2 : Double;
  Level3Discount3 : Double;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  AnnualDiscountForBranch : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  PriceConditionCode : LargeString;
  PRICE_CONDITION : LargeString;
  @sap.variable.scale : 'true'
  DISCOUNT : Decimal;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  NegotiationPrice : Double;
  AwardedPrice : Double;
  OfferStatus : String(255);
  FOC : String(3);
  OUTCOME : String(10);
  TotalAmount : Double;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.StandardTenderHistorySpain {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key INSTITUTE_ID : Integer not null;
  TENDER_NAME : String(250);
  @sap.display.format : 'Date'
  OFFER_DATE : Date;
  INSTITUTE_NAME : String(500);
  PRODUCT_NAME : String(100);
  PACK_PRICE : Double;
  UNIT_PRICE : Double;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  FOC : String(10);
  RAPPEL : String(10);
  @sap.variable.scale : 'true'
  CONFIDENTIAL_PRICE : Decimal;
  PriceConditionCode : LargeString;
  PRICE_CONDITION : LargeString;
  ROYALDECREE : LargeString;
  DISCOUNT : Double;
  CONFIDENTIAL_DISCOUNT : Double;
  OUTCOME : String(10);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionCurrentSectionTaiwanView {
  key ProductCode : Integer not null;
  key INSTITUTE_ID : Integer not null;
  Currency : String(255);
  @sap.variable.scale : 'true'
  Price0 : Decimal;
  @sap.variable.scale : 'true'
  Price1 : Decimal;
  Level2Discount1 : Double;
  Level2Discount2 : Double;
  @sap.variable.scale : 'true'
  Price2 : Decimal;
  AnnualDiscountForBranch : Double;
  Level3Discount1 : Double;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  AwardedPrice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  NegotiationPrice : Double;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CSVAttachment {
  key Zuellig : Boolean not null;
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.TaiwanFASTData {
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PT_TMSKUPRDPCK {
  key CountryCode : LargeString not null;
  key ActiveRecord : String(10) not null;
  key ProductPackID : Integer not null;
  key SKUCode : Integer not null;
  CountrySKUID : Integer;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  ProductPack : Association to StandardAppService.ProductPack on ProductPack.PRODUCTPACKID = ProductPackID;
  @cds.ambiguous : 'missing on condition?'
  CountryProductPack : Association to StandardAppService.CountryProductPackView on CountryProductPack.COUNTRYCODE = CountryCode and CountryProductPack.PRODUCTPACKID = ProductPackID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ContractInfomation {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  OfferID : LargeString;
  CountryCode : LargeString;
  ProductCode : Integer;
  InstituteID : Integer;
  InstituteName : LargeString;
  ContractDuration : Double;
  @sap.display.format : 'Date'
  ContractStartDate : Date;
  @sap.display.format : 'Date'
  ContractEndDate : Date;
  Active : Boolean;
  @cds.ambiguous : 'missing on condition?'
  OfferProduct : Association to StandardAppService.PT_TMOFPR {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MailTemplates {
  key CountryCode : LargeString not null;
  key Language : String(2) not null;
  key TemplateId : String(100) not null;
  @cds.ambiguous : 'missing on condition?'
  MailTemplateFile : Association to StandardAppService.MailTemplateFiles on MailTemplateFile.templateId = TemplateId;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MailTemplateFiles {
  key templateId : String(100) not null;
  title : String(100);
  filename : String(250);
  mediaType : LargeString;
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Outbox {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  CountryCode : LargeString;
  TenderID : String(50);
  OfferID : String(30);
  Sender : LargeString;
  Recipients : LargeString;
  Subject : LargeString;
  MailBody : LargeString;
  Sent : Boolean;
  RecipientCC : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.StandardTenderFOCInformation {
  key OfferID : String(30) not null;
  key CountryCode : LargeString not null;
  TenderID : String(50) not null;
  ProductCode : Integer not null;
  ProductPackId : Integer;
  Currency : String(255);
  MainProductName : String(100);
  FOCProductName : String(100);
  Bonus : LargeString;
  MinOrderQty : Double;
  Type : String(4);
  ADD_INCLUDE : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.NotificationUserList {
  key CountryCode : LargeString not null;
  key CWID : String(5) not null;
  ActiveRecord : String(3);
  Role : String(100);
  UserName : String(100);
  UserEmail : String(255);
  @cds.ambiguous : 'missing on condition?'
  User : Association to StandardAppService.Users {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.InstitutesInGroup {
  key InstituteID : Integer not null;
  CountryCode : LargeString not null;
  InstituteType : String(50);
  InstituteName : String(500);
  ParentInstituteID : Integer not null;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ZagisUploadFile {
  key OfferID : String(50) not null;
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.AwardedOfferDistributors {
  key ID : UUID not null;
  OfferID : LargeString;
  CountryCode : LargeString;
  DistributorName : LargeString;
  DistributorID : Integer;
  ProductPackName : LargeString;
  ProductPackID : Integer;
  AssignedProductCode : Integer;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ExtractNLHistoricalInformation {
  key templateId : Integer not null;
  mediaType : LargeString;
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MaxHierarchy {
  key OfferId : String(30) not null;
  key productcode : Integer not null;
  MaxHierarchy : Integer;
  ApproverName : String(100);
  ApprovalStatus : String(100);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.NLDistributorsView {
  key OfferID : LargeString not null;
  key ProductPackID : Integer not null;
  DistributionType : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.SelectedContractDuration {
  key OfferID : LargeString not null;
  key ProductCode : Integer not null;
  ContractDuration : Double;
  @sap.display.format : 'Date'
  ContractStartDate : Date;
  @sap.display.format : 'Date'
  ContractEndDate : Date;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.NLExtractOffers {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  Source : LargeString;
  Inkoopgroep : LargeString;
  InstituteName : String(500);
  TenderName : String(250);
  @sap.display.format : 'Date'
  EffectiveDate : Date;
  @sap.display.format : 'Date'
  ExpiryDate : Date;
  @sap.display.format : 'Date'
  BidDueDate : Date;
  STATUS : String(255);
  ManagedBy : LargeString;
  @sap.display.format : 'Date'
  PublicationDate : Date;
  GOV_CODE : String(255);
  PRODUCTPACKNAME : String(100);
  InstituteID : Integer not null;
  OfferPrice_3 : Double;
  OfferPrice_2 : Double;
  OfferPrice_1 : Double;
  maxContrDur : Double;
  secContrDur : Double;
  minContrDur : Double;
  NetPrice : Double;
  Outcome : String(255);
  childInstituteName : LargeString;
  DistributionType : LargeString;
  ContractDuration : Double;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.NLPriceConditions {
  key ID : UUID not null;
  ContractDuration : Double;
  OfferPrice : Double;
  Discount : Double;
  NetPrice : Double;
  PriceCondition_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  PriceCondition : Association to StandardAppService.PriceCondition on PriceCondition.ID = PriceCondition_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ComplianceOfficerView {
  key OfferID : String(30) not null;
  TenderID : String(50) not null;
  CountryCode : LargeString not null;
  TenderOfferNo : Integer;
  RevisedOfferNo : Integer;
  ActiveOffer : Integer;
  CloneOfferID : String(255);
  @sap.display.format : 'Date'
  CreationDate : Date;
  @sap.display.format : 'Date'
  SubmissionDate : Date;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Active : Integer;
  DistributorID : Integer;
  @sap.display.format : 'Date'
  InternalBidDueDate : Date;
  SellingCompany : String(3);
  ProductCount : Integer;
  Currency : String(255);
  ManualSaveStatus : String(3);
  WholesaleOffer : String(3);
  Comment : String(500);
  OfferRevisionSplitNo : Integer;
  @sap.display.format : 'Date'
  NewOfferDueDate : Date;
  ContinuationOfferNo : Integer;
  APPROVALS_SENT : Integer;
  FOCType : String(255);
  DEFAULT_FOC_ABS_PCT : String(4);
  Division : LargeString;
  ProfitabilityStartMnth : Integer;
  ProfitabilityAgrDur : Integer;
  ProfitabilityYrlyMntCost : Double;
  ProfitabilityDiscRate : Double;
  ProfitabilityGrowthRate : Double;
  IbizWorkflowID : Integer;
  isDirectIbizOpportunity : Boolean;
  PreviousIbizWorkflowID : Integer;
  TenderDistributorID : Integer;
  BusinessUnit : LargeString;
  Responded : Integer;
  @sap.display.format : 'Date'
  DistributorDeadline : Date;
  DistributorComments : LargeString;
  ChannelSwitched : Boolean;
  DecisionSharedWithIBIZ : Boolean;
  isIBIZNotified : Boolean;
  AffiliateOffer : Boolean;
  QuotationInstituteID : Integer;
  DifferentAwardPriceParentOfferID : String(30);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  @cds.ambiguous : 'missing on condition?'
  Tender : Association to StandardAppService.TenderFormView on Tender.TenderID = TenderID;
  @cds.ambiguous : 'missing on condition?'
  Distributor : Association to StandardAppService.PT_TMDIST {  };
  @cds.ambiguous : 'missing on condition?'
  Product : Association to many StandardAppService.ProductPricesCheckView {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatusTable : Association to StandardAppService.PT_TMTNOFST {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatus : Association to StandardAppService.OfferStatus on OfferStatus.OFFER_ID = OfferID;
  @cds.ambiguous : 'missing on condition?'
  Quotation : Association to StandardAppService.PT_TMQUTO {  };
  @cds.ambiguous : 'missing on condition?'
  Signatories : Association to many StandardAppService.CountryLegalEntitySignatories {  };
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.GlobalStrategicMarketingView {
  key OfferID : String(30) not null;
  TenderID : String(50) not null;
  CountryCode : LargeString not null;
  TenderOfferNo : Integer;
  RevisedOfferNo : Integer;
  ActiveOffer : Integer;
  CloneOfferID : String(255);
  @sap.display.format : 'Date'
  CreationDate : Date;
  @sap.display.format : 'Date'
  SubmissionDate : Date;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Active : Integer;
  DistributorID : Integer;
  @sap.display.format : 'Date'
  InternalBidDueDate : Date;
  SellingCompany : String(3);
  ProductCount : Integer;
  Currency : String(255);
  ManualSaveStatus : String(3);
  WholesaleOffer : String(3);
  Comment : String(500);
  OfferRevisionSplitNo : Integer;
  @sap.display.format : 'Date'
  NewOfferDueDate : Date;
  ContinuationOfferNo : Integer;
  APPROVALS_SENT : Integer;
  FOCType : String(255);
  DEFAULT_FOC_ABS_PCT : String(4);
  Division : LargeString;
  ProfitabilityStartMnth : Integer;
  ProfitabilityAgrDur : Integer;
  ProfitabilityYrlyMntCost : Double;
  ProfitabilityDiscRate : Double;
  ProfitabilityGrowthRate : Double;
  IbizWorkflowID : Integer;
  isDirectIbizOpportunity : Boolean;
  PreviousIbizWorkflowID : Integer;
  TenderDistributorID : Integer;
  BusinessUnit : LargeString;
  Responded : Integer;
  @sap.display.format : 'Date'
  DistributorDeadline : Date;
  DistributorComments : LargeString;
  ChannelSwitched : Boolean;
  DecisionSharedWithIBIZ : Boolean;
  isIBIZNotified : Boolean;
  AffiliateOffer : Boolean;
  QuotationInstituteID : Integer;
  DifferentAwardPriceParentOfferID : String(30);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  @cds.ambiguous : 'missing on condition?'
  Tender : Association to StandardAppService.TenderFormView on Tender.TenderID = TenderID;
  @cds.ambiguous : 'missing on condition?'
  Distributor : Association to StandardAppService.PT_TMDIST {  };
  @cds.ambiguous : 'missing on condition?'
  Product : Association to many StandardAppService.ProductPricesCheckView {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatusTable : Association to StandardAppService.PT_TMTNOFST {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatus : Association to StandardAppService.OfferStatus on OfferStatus.OFFER_ID = OfferID;
  @cds.ambiguous : 'missing on condition?'
  Quotation : Association to StandardAppService.PT_TMQUTO {  };
  @cds.ambiguous : 'missing on condition?'
  Signatories : Association to many StandardAppService.CountryLegalEntitySignatories {  };
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.SupplyManagementView {
  key OfferID : String(30) not null;
  TenderID : String(50) not null;
  CountryCode : LargeString not null;
  TenderOfferNo : Integer;
  RevisedOfferNo : Integer;
  ActiveOffer : Integer;
  CloneOfferID : String(255);
  @sap.display.format : 'Date'
  CreationDate : Date;
  @sap.display.format : 'Date'
  SubmissionDate : Date;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Active : Integer;
  DistributorID : Integer;
  @sap.display.format : 'Date'
  InternalBidDueDate : Date;
  SellingCompany : String(3);
  ProductCount : Integer;
  Currency : String(255);
  ManualSaveStatus : String(3);
  WholesaleOffer : String(3);
  Comment : String(500);
  OfferRevisionSplitNo : Integer;
  @sap.display.format : 'Date'
  NewOfferDueDate : Date;
  ContinuationOfferNo : Integer;
  APPROVALS_SENT : Integer;
  FOCType : String(255);
  DEFAULT_FOC_ABS_PCT : String(4);
  Division : LargeString;
  ProfitabilityStartMnth : Integer;
  ProfitabilityAgrDur : Integer;
  ProfitabilityYrlyMntCost : Double;
  ProfitabilityDiscRate : Double;
  ProfitabilityGrowthRate : Double;
  IbizWorkflowID : Integer;
  isDirectIbizOpportunity : Boolean;
  PreviousIbizWorkflowID : Integer;
  TenderDistributorID : Integer;
  BusinessUnit : LargeString;
  Responded : Integer;
  @sap.display.format : 'Date'
  DistributorDeadline : Date;
  DistributorComments : LargeString;
  ChannelSwitched : Boolean;
  DecisionSharedWithIBIZ : Boolean;
  isIBIZNotified : Boolean;
  AffiliateOffer : Boolean;
  QuotationInstituteID : Integer;
  DifferentAwardPriceParentOfferID : String(30);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  @cds.ambiguous : 'missing on condition?'
  Tender : Association to StandardAppService.TenderFormView on Tender.TenderID = TenderID;
  @cds.ambiguous : 'missing on condition?'
  Distributor : Association to StandardAppService.PT_TMDIST {  };
  @cds.ambiguous : 'missing on condition?'
  Product : Association to many StandardAppService.ProductPricesCheckView {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatusTable : Association to StandardAppService.PT_TMTNOFST {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatus : Association to StandardAppService.OfferStatus on OfferStatus.OFFER_ID = OfferID;
  @cds.ambiguous : 'missing on condition?'
  Quotation : Association to StandardAppService.PT_TMQUTO {  };
  @cds.ambiguous : 'missing on condition?'
  Signatories : Association to many StandardAppService.CountryLegalEntitySignatories {  };
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PLOwnerNameView {
  key UserID : String(50) not null;
  UserName : String(100);
  CWID : String(12);
  UserEmail : String(255);
  Role : String(100);
  BU : LargeString;
  CountryCode : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.SalesReportsView {
  key ID : UUID not null;
  @sap.display.format : 'Date'
  DateFrom : Date;
  @sap.display.format : 'Date'
  DateTo : Date;
  OfferID : LargeString;
  DistributorID : Integer;
  DistributorName : LargeString;
  MainInstituteID : Integer;
  MainInstituteName : LargeString;
  External_InstituteId : LargeString;
  @sap.display.format : 'Date'
  FilePeriod : Date;
  BrandId : LargeString;
  BrandName : LargeString;
  ProductPackID : Integer;
  PRODUCTPACKNAME : LargeString;
  EANNumber : LargeString;
  Quantity : Double;
  QuantityMl : Double;
  WholesalerPurchasePrice : Double;
  WholesalerContractPrice : Double;
  WholesalerPurchaseAmount : Double;
  TotalSales : Double;
  RequestedVolume : Integer;
  BrandContractVolume : Double;
  BrandUsedVolume : Double;
  CountryCode : LargeString not null;
  InstituteType : String(50);
  KAM_Territory : LargeString;
  TenderID : String(50) not null;
  Currency : String(3) not null;
  ContractBrandUsage : Double;
  PricePerMl : Double;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.OverviewSectionsView {
  key ID : UUID not null;
  TenderID : String(50) not null;
  OfferID : LargeString;
  CountryCode : LargeString not null;
  DistributorID : Integer;
  MainInstituteName : LargeString;
  MainInstituteID : Integer;
  ProductPackID : Integer;
  InstituteType : String(50);
  KAM_Territory : LargeString;
  Currency : String(3) not null;
  @sap.display.format : 'Date'
  DateFrom : Date;
  @sap.display.format : 'Date'
  DateTo : Date;
  QuantitySold : Double;
  TotalSales : Double;
  MinPrice : Double;
  MaxPrice : Double;
  AvgPrice : Double;
  BrandId : LargeString;
  BrandName : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.SalesReportInstitutesView {
  CountryCode : LargeString not null;
  InstituteID : Integer not null;
  CustomerID : Integer;
  InstituteName : String(500);
  InstituteType : String(50);
  Address : String(500);
  ContactNo : String(50);
  Fax : String(50);
  ContactPerson : String(100);
  ActiveRecord : String(10);
  Comment : String(500);
  City : String(255);
  INSTITUTE_HIERARCHY_ID : Integer;
  State : LargeString;
  MercadoPublicoIssuer : LargeString;
  RegionID : LargeString;
  ProvinceID : LargeString;
  CifCode : String(50);
  RegionalHealthSystem : String(50);
  VatCode : String(50);
  TaxCode : String(50);
  CustomerGroup : LargeString;
  ApplicableTaxRate : String(2);
  INCOTerms : String(500);
  PaymentTerms : String(500);
  ForAllBrands : Boolean;
  DirectTender : Boolean;
  ContactEmail : String(100);
  CNPJ : LargeString;
  Shortname : LargeString;
  KAM_Territory : LargeString;
  External_InstituteId : String(50);
  Class : Integer;
  SAPGroupId : LargeString;
  CG1_Description : LargeString;
  CG2_Description : LargeString;
  CG1_Code : LargeString;
  CG2_Code : LargeString;
  Territory : LargeString;
  IsKAM : Boolean;
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
  @cds.ambiguous : 'missing on condition?'
  Children : Association to many StandardAppService.PT_TMINSHIER {  };
  @cds.ambiguous : 'missing on condition?'
  Region : Association to StandardAppService.CountryRegionsTableView on Region.ID = RegionID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ExtractPolandSalesReport {
  key templateId : LargeString not null;
  key TenderID : LargeString not null;
  key CountryCode : LargeString not null;
  key DistributorID : LargeString not null;
  key BrandID : LargeString not null;
  key ProductPackID : LargeString not null;
  key KAM_Territory : LargeString not null;
  key InstituteType : LargeString not null;
  key InstituteID : LargeString not null;
  key DateFrom : LargeString not null;
  key DateTo : LargeString not null;
  mediaType : LargeString;
  @Core.MediaType : 'application/octet-stream'
  blob : LargeBinary;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.SalesReportTenderView {
  createdBy : String(255);
  modifiedBy : String(255);
  TenderID : LargeString;
  OfferID : LargeString;
  CountryCode : LargeString not null;
  SubmittedBy : String(50);
  Active : Integer;
  InstituteID : Integer not null;
  InstituteType : String(50);
  ProductPackID : Integer;
  BrandId : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ProfitabilityCalcParamView {
  key OfferID : String(30) not null;
  TenderID : String(50) not null;
  CountryCode : LargeString not null;
  TenderOfferNo : Integer;
  RevisedOfferNo : Integer;
  ActiveOffer : Integer;
  CloneOfferID : String(255);
  @sap.display.format : 'Date'
  CreationDate : Date;
  @sap.display.format : 'Date'
  SubmissionDate : Date;
  @sap.display.format : 'Date'
  SubmittedOn : Date;
  SubmittedBy : String(255);
  Active : Integer;
  DistributorID : Integer;
  @sap.display.format : 'Date'
  InternalBidDueDate : Date;
  SellingCompany : String(3);
  ProductCount : Integer;
  Currency : String(255);
  ManualSaveStatus : String(3);
  WholesaleOffer : String(3);
  Comment : String(500);
  OfferRevisionSplitNo : Integer;
  @sap.display.format : 'Date'
  NewOfferDueDate : Date;
  ContinuationOfferNo : Integer;
  APPROVALS_SENT : Integer;
  FOCType : String(255);
  DEFAULT_FOC_ABS_PCT : String(4);
  Division : LargeString;
  ProfitabilityStartMnth : Integer;
  ProfitabilityAgrDur : Integer;
  ProfitabilityYrlyMntCost : Double;
  ProfitabilityDiscRate : Double;
  ProfitabilityGrowthRate : Double;
  IbizWorkflowID : Integer;
  isDirectIbizOpportunity : Boolean;
  PreviousIbizWorkflowID : Integer;
  TenderDistributorID : Integer;
  BusinessUnit : LargeString;
  Responded : Integer;
  @sap.display.format : 'Date'
  DistributorDeadline : Date;
  DistributorComments : LargeString;
  ChannelSwitched : Boolean;
  DecisionSharedWithIBIZ : Boolean;
  isIBIZNotified : Boolean;
  AffiliateOffer : Boolean;
  QuotationInstituteID : Integer;
  DifferentAwardPriceParentOfferID : String(30);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  Custom_Integer_4 : Integer;
  Custom_Integer_5 : Integer;
  Custom_Integer_6 : Integer;
  Custom_Integer_7 : Integer;
  Custom_Integer_8 : Integer;
  Custom_Integer_9 : Integer;
  Custom_Integer_10 : Integer;
  Custom_String_1 : LargeString;
  Custom_String_2 : LargeString;
  Custom_String_3 : LargeString;
  Custom_String_4 : LargeString;
  Custom_String_5 : LargeString;
  Custom_String_6 : LargeString;
  Custom_String_7 : LargeString;
  Custom_String_8 : LargeString;
  Custom_String_9 : LargeString;
  Custom_String_10 : LargeString;
  Custom_String_11 : LargeString;
  Custom_String_12 : LargeString;
  Custom_String_13 : LargeString;
  Custom_String_14 : LargeString;
  Custom_String_15 : LargeString;
  Custom_String_16 : LargeString;
  Custom_String_17 : LargeString;
  Custom_String_18 : LargeString;
  Custom_String_19 : LargeString;
  Custom_String_20 : LargeString;
  Custom_String_21 : LargeString;
  Custom_String_22 : LargeString;
  Custom_String_23 : LargeString;
  Custom_String_24 : LargeString;
  Custom_String_25 : LargeString;
  Custom_String_26 : LargeString;
  Custom_String_27 : LargeString;
  Custom_String_28 : LargeString;
  Custom_String_29 : LargeString;
  Custom_String_30 : LargeString;
  Custom_Double_1 : Double;
  Custom_Double_2 : Double;
  Custom_Double_3 : Double;
  Custom_Double_4 : Double;
  Custom_Double_5 : Double;
  Custom_Double_6 : Double;
  Custom_Double_7 : Double;
  Custom_Double_8 : Double;
  Custom_Double_9 : Double;
  Custom_Double_10 : Double;
  @sap.display.format : 'Date'
  Custom_Date_1 : Date;
  @sap.display.format : 'Date'
  Custom_Date_2 : Date;
  @sap.display.format : 'Date'
  Custom_Date_3 : Date;
  @sap.display.format : 'Date'
  Custom_Date_4 : Date;
  @sap.display.format : 'Date'
  Custom_Date_5 : Date;
  @sap.display.format : 'Date'
  Custom_Date_6 : Date;
  @sap.display.format : 'Date'
  Custom_Date_7 : Date;
  @sap.display.format : 'Date'
  Custom_Date_8 : Date;
  @sap.display.format : 'Date'
  Custom_Date_9 : Date;
  @sap.display.format : 'Date'
  Custom_Date_10 : Date;
  Custom_Boolean_1 : Boolean;
  Custom_Boolean_2 : Boolean;
  Custom_Boolean_3 : Boolean;
  Custom_Boolean_4 : Boolean;
  Custom_Boolean_5 : Boolean;
  Custom_Boolean_6 : Boolean;
  Custom_Boolean_7 : Boolean;
  Custom_Boolean_8 : Boolean;
  Custom_Boolean_9 : Boolean;
  Custom_Boolean_10 : Boolean;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_1 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_2 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_3 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_4 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_5 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_6 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_7 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_8 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_9 : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  Custom_Datetime_10 : DateTime;
  @cds.ambiguous : 'missing on condition?'
  Tender : Association to StandardAppService.TenderFormView on Tender.TenderID = TenderID;
  @cds.ambiguous : 'missing on condition?'
  Distributor : Association to StandardAppService.PT_TMDIST {  };
  @cds.ambiguous : 'missing on condition?'
  Product : Association to many StandardAppService.ProductPricesCheckView {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatusTable : Association to StandardAppService.PT_TMTNOFST {  };
  @cds.ambiguous : 'missing on condition?'
  OfferStatus : Association to StandardAppService.OfferStatus on OfferStatus.OFFER_ID = OfferID;
  @cds.ambiguous : 'missing on condition?'
  Quotation : Association to StandardAppService.PT_TMQUTO {  };
  @cds.ambiguous : 'missing on condition?'
  Signatories : Association to many StandardAppService.CountryLegalEntitySignatories {  };
  @cds.ambiguous : 'missing on condition?'
  Country : Association to StandardAppService.Country on Country.CountryCode = CountryCode;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Settlements {
  key ID : String(10) not null;
  Description : String(50);
  @cds.ambiguous : 'missing on condition?'
  texts : Composition of many StandardAppService.Settlements_texts;
  @cds.ambiguous : 'missing on condition?'
  localized : Association to StandardAppService.Settlements_texts {  };
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.DiscountCondition {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  Volume : Integer;
  Discount : Double;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  PriceCondition_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  PriceCondition : Association to StandardAppService.PriceCondition on PriceCondition.ID = PriceCondition_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.DiscountConditionView {
  key ID : UUID not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Currency : String(255);
  OfferID : String(30) not null;
  ProductCode : Integer not null;
  PriceConditionID : UUID;
  Volume : Integer;
  Discount : Double;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionRappelView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CCMPriceConditionView {
  key OfferID : LargeString not null;
  key TenderID : LargeString not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString;
  MaterialNumber : Integer;
  InstituteID : Integer;
  CustomerID : Integer;
  Currency : LargeString;
  @sap.variable.scale : 'true'
  YP00 : Decimal;
  @sap.variable.scale : 'true'
  YP04 : Decimal;
  @sap.variable.scale : 'true'
  YP10 : Decimal;
  YD75 : Double;
  YD06 : Double;
  YD02 : Double;
  YD30 : Double;
  @sap.variable.scale : 'true'
  SAPBaseGrossPrice : Decimal;
  @sap.variable.scale : 'true'
  SAPTAX : Decimal;
  @sap.variable.scale : 'true'
  SAPPriceWithTax : Decimal;
  RoyalDecree : LargeString;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  NETPRICEWITHOUTTAXAFTERDEDUCTIONRD : Decimal;
  @sap.variable.scale : 'true'
  NETPRICEWITHTAXAFTERDEDUCTIONRD : Decimal;
  @sap.variable.scale : 'true'
  NETPRICEWITHOUTTAX : Decimal;
  @sap.variable.scale : 'true'
  NETPRICEWITHTAX : Decimal;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionDescuentoComercialView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionPVLView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionPrecioNetoView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionDescuentoEspecialView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionRentalView {
  key TenderID : String(50) not null;
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key ConditionType : LargeString not null;
  CountryCode : LargeString not null;
  Region : String(50);
  Custom_Integer_1 : Integer;
  Custom_Integer_2 : Integer;
  Custom_Integer_3 : Integer;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  Division : LargeString;
  isMain : Boolean;
  CurrentBasePrice : Double;
  BasePrice : Double;
  masterPriceAIP : Double;
  @sap.variable.scale : 'true'
  OfferPrice : Decimal;
  Discount : Double;
  Deductions : Double;
  @sap.variable.scale : 'true'
  NetPrice : Decimal;
  @sap.variable.scale : 'true'
  NetOfferPrice : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
  @sap.variable.scale : 'true'
  Price3 : Decimal;
  Level3Discount1 : Double;
  Currency : String(255);
  SpecialPrice : Double;
  Price0 : Double;
  Price1 : Double;
  Price2 : Double;
  Level2Discount1 : Double;
  MaxWholesalerMargin : Double;
  COGS : Double;
  Last12MonthsVolumeMainCustomer : Integer;
  Last12MonthsVolumeBranch : Integer;
  AnticipatedYearlyVolumeMainCustomer : Integer;
  AnticipatedYearlyVolumeBranch : Integer;
  Level2Discount2 : Double;
  TotalDiscountNHI : Double;
  TotalDiscountInvoice : Double;
  TotalYearlyValueMainCustomer : Double;
  TotalYearlyValueBranch : Double;
  AnnualDiscountForBranch : Double;
  NegotiationPrice : Double;
  GeneralDiscount_Amount : Double;
  SecondDiscount_Amount : Double;
  AnnualDiscount_Percentage : Double;
  FreeGoods_Amount : Double;
  FreeGoods_Percentage : Double;
  NLPriceConditionType : many StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions not null;
  @sap.variable.scale : 'true'
  TWCurrentBasePrice : Decimal;
  @sap.variable.scale : 'true'
  CurrentInvoicePrice : Decimal;
  CurrentGeneralDiscount : Double;
  CurrentGeneralDiscount_Amount : Double;
  CurrentSecondDiscount : Double;
  CurrentSecondlDiscount_Amount : Double;
  @sap.variable.scale : 'true'
  CurrentNetOfferPrice : Decimal;
  CurrentAnnualDiscount_Amount_Branch : Double;
  CurrentAnnualDiscount_Amount_Per_Unit : Double;
  CurrentNetPrice : Double;
  CurrentNegotiationPrice : Double;
  CurrentTotalYearlyValueMainCustomer : Double;
  CurrentTotalYearlyValueBranch : Double;
  CurrentTotalDiscountNHI : Double;
  CurrentTotalDiscountInvoice : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  @sap.variable.scale : 'true'
  PVL : Decimal;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : String(10);
  PriceConditionCode : LargeString;
  ESDiscount : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  @sap.variable.scale : 'true'
  AdditionalDiscount : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxBeforeDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  ConfidentialDiscount : Double;
  RoyalDecreePercentage_1 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.FastConditionContractsView {
  key OfferID : String(30) not null;
  TenderID : String(50) not null;
  CountryCode : LargeString;
  InstituteID : Integer not null;
  InstituteName : String(500);
  External_InstituteId : String(50);
  Division : LargeString;
  DistributorID : Integer;
  CustomerID : Integer;
  Owner : LargeString;
  Reference : LargeString;
  ContractType : LargeString;
  SAPID : LargeString;
  ExternalID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.ConditionContractsView {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  TenderID : String(50) not null;
  CountryCode : LargeString;
  OfferPrice : Double;
  ProductPackName : LargeString;
  UoM : LargeString;
  BrandID : LargeString;
  BrandName : LargeString;
  InstituteID : Integer not null;
  InstituteName : String(500);
  CustomerID : Integer;
  InstituteType : String(50);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CCMMaterilsView {
  key ProductCode : Integer not null;
  SKUCode : Integer not null;
  ActiveRecord : String(10) not null;
  CountryCode : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionInvoiceView {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  CountryCode : LargeString not null;
  Region : String(50);
  TenderID : String(50) not null;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  ConditionType : LargeString;
  Division : LargeString;
  isMain : Boolean;
  Currency : String(255);
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  YP00 : Double;
  RoyalDecree : LargeString;
  PriceConditionCode : LargeString;
  YD02 : Double;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  StandardDiscount : Decimal;
  YD75 : Double;
  YP10 : Double;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  MaximumPrice : Double;
  YP04 : Double;
  YD06 : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  @sap.variable.scale : 'true'
  Tax : Decimal;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionRebateView {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  CountryCode : LargeString not null;
  Region : String(50);
  TenderID : String(50) not null;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  PriceConditionID : UUID;
  ClassificationID : UUID;
  Classification : LargeString;
  ConditionType : LargeString;
  Division : LargeString;
  isMain : Boolean;
  Currency : String(255);
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  YP00 : Double;
  RoyalDecree : LargeString;
  PriceConditionCode : LargeString;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  Settlement_ID : UUID;
  Description : String(50);
  @sap.variable.scale : 'true'
  Tax : Decimal;
  MarketIncentiveID : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionDiscountConditionsView {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key PriceConditionID : UUID not null;
  CountryCode : LargeString not null;
  Region : String(50);
  TenderID : String(50) not null;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  ClassificationID : UUID;
  Classification : LargeString;
  ConditionType : LargeString;
  Division : LargeString;
  isMain : Boolean;
  Currency : String(255);
  Volume : Integer;
  Discount : Double;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  @sap.variable.scale : 'true'
  Tax : Decimal;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionFOCView {
  key OfferID : String(30) not null;
  key ProductCode : Integer not null;
  key PriceConditionID : UUID not null;
  CountryCode : LargeString not null;
  Region : String(50);
  TenderID : String(50) not null;
  RequestedVolume : Integer;
  hasPriceCondition : Boolean;
  ClassificationID : UUID;
  Classification : LargeString;
  ConditionType : LargeString;
  Division : LargeString;
  isMain : Boolean;
  Currency : String(255);
  FreeGoodsOther : Double;
  Bonus : LargeString;
  FreeGoodsOther_Step : Double;
  FreeGoodsOther_ABS_PCT : String(4);
  VAT : Double;
  FOCMinAmount : Integer;
  @sap.variable.scale : 'true'
  FOCBonus : Decimal;
  @sap.variable.scale : 'true'
  PotentialGeneratedSavings : Decimal;
  RoyalDecree : LargeString;
  ADD_INCLUDE : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.BankGuarantees {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  TenderID : LargeString;
  CountryCode : LargeString;
  Reference : LargeString;
  @odata.Type : 'Edm.DateTimeOffset'
  IssueDate : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  ClosingDate : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  ExpectedExpiryDate : DateTime;
  Status : LargeString;
  BankStatus : LargeString;
  BankName : LargeString;
  @odata.Type : 'Edm.DateTimeOffset'
  BankRequestDate : DateTime;
  @odata.Type : 'Edm.DateTimeOffset'
  ShippingDate : DateTime;
  Type : LargeString;
  GuaranteedAmount : Double;
  Currency : LargeString;
  Comment : LargeString;
  @cds.ambiguous : 'missing on condition?'
  Tender : Association to StandardAppService.TenderFormView on Tender.TenderID = TenderID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.MarketIncentive {
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  CountryCode : LargeString;
  MarketIncentiveID : LargeString;
  Description : LargeString;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CCMCustomer {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validFrom : Timestamp;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validTo : Timestamp;
  InstituteID : LargeString;
  AssortmentReference : LargeString;
  CustomerID : Integer;
  CountryCode : LargeString;
  InstituteType : LargeString;
  InstituteName : LargeString;
  CCMContract_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  CCMContract : Association to StandardAppService.CCMContract on CCMContract.ID = CCMContract_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CCMMaterial {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validFrom : Timestamp;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validTo : Timestamp;
  CountryCode : LargeString;
  ProductCode : LargeString;
  MaterialNumber : LargeString;
  FOCMaterialNumber : LargeString;
  ActiveRecord : Integer;
  isNewMaterialNumber : Boolean;
  CCMContract_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  CCMContract : Association to StandardAppService.CCMContract on CCMContract.ID = CCMContract_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.CurrentInvoicePrice {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  ConditionType : LargeString;
  CountryCode : LargeString;
  SoldToParty : LargeString;
  Material : LargeString;
  YP00 : Double;
  YP04 : Double;
  YP10 : Double;
  YD75 : Double;
  YD30 : Double;
  YD06 : Double;
  YD02 : Double;
  SapTax : Double;
  CCMContract_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  CCMContract : Association to StandardAppService.CCMContract on CCMContract.ID = CCMContract_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionInvoice {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validFrom : Timestamp;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validTo : Timestamp;
  OfferID : LargeString;
  ProductCode : Integer;
  ConditionType : LargeString;
  Currency : LargeString;
  Region : LargeString;
  CountryCode : LargeString;
  YP00 : Double;
  YP04 : Double;
  YP10 : Double;
  YD75 : Double;
  YD30 : Double;
  YD06 : Double;
  YD02 : Double;
  Tax : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  RoyalDecree : LargeString;
  @sap.variable.scale : 'true'
  RoyalDecreeValue : Decimal;
  RoyalDecreeIncl : Boolean;
  @sap.variable.scale : 'true'
  NetPriceWithoutTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTaxAfterDeductionRD : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  @sap.variable.scale : 'true'
  MaximumPrice : Decimal;
  RequestedVolume : Integer;
  RentalPrice : Double;
  MonthlyRentPerUnit : Double;
  AnnualValue : Double;
  CCMContract_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  CCMContract : Association to StandardAppService.CCMContract on CCMContract.ID = CCMContract_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionRebate {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validFrom : Timestamp;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validTo : Timestamp;
  OfferID : LargeString;
  ProductCode : Integer;
  CountryCode : LargeString;
  YP00 : Double;
  @sap.variable.scale : 'true'
  ConfidentialPrice : Decimal;
  SettlementDescription : LargeString;
  Tax : Double;
  RoyalDecree : LargeString;
  Liquidation : LargeString;
  @sap.display.format : 'Date'
  RefundDate : Date;
  PriceConditionCode : LargeString;
  CCMContract_ID : UUID;
  PriceConditionDiscountCondition_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  CCMContract : Association to StandardAppService.CCMContract on CCMContract.ID = CCMContract_ID;
  @cds.ambiguous : 'missing on condition?'
  PriceConditionDiscountCondition : Composition of many StandardAppService.PriceConditionDiscountCondition;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionFOC {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validFrom : Timestamp;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  validTo : Timestamp;
  OfferID : LargeString;
  CountryCode : LargeString;
  ProductCode : Integer;
  FreeGoodsOther : Double;
  FreeGoodsOther_Step : Double;
  FreeGoodsOther_ABS_PCT : String(4);
  VAT : Double;
  FOCMinAmount : Integer;
  @sap.variable.scale : 'true'
  FOCBonus : Decimal;
  @sap.variable.scale : 'true'
  PotentialGeneratedSavings : Decimal;
  RoyalDecree : LargeString;
  ADD_INCLUDE : LargeString;
  CCMContract_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  CCMContract : Association to StandardAppService.CCMContract on CCMContract.ID = CCMContract_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Tenders_in_Regions {
  key TenderID : LargeString not null;
  key RegionID : UUID not null;
  @cds.ambiguous : 'missing on condition?'
  Region : Association to StandardAppService.CountryRegionsTableView on Region.ID = RegionID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.DistributorDivision {
  key DistributorID : Integer not null;
  key DivisionCode : String(50) not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  CustomerID : Integer;
  DivisionName : String(50);
  CustomerGroup : String(3);
  PriceList : String(2);
  DistributorType : String(50);
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.PriceConditionDiscountCondition {
  key ID : UUID not null;
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  createdAt : Timestamp;
  createdBy : String(255);
  @odata.Type : 'Edm.DateTimeOffset'
  @odata.Precision : 7
  modifiedAt : Timestamp;
  modifiedBy : String(255);
  Volume : Integer;
  Discount : Double;
  @sap.variable.scale : 'true'
  NetPriceWithoutTax : Decimal;
  @sap.variable.scale : 'true'
  NetPriceWithTax : Decimal;
  PriceConditionRebate_ID : UUID;
  @cds.ambiguous : 'missing on condition?'
  PriceConditionRebate : Association to StandardAppService.PriceConditionRebate on PriceConditionRebate.ID = PriceConditionRebate_ID;
};

@cds.external : true
@cds.persistence.skip : true
entity StandardAppService.Settlements_texts {
  key locale : String(14) not null;
  key ID : String(10) not null;
  Description : String(50);
};

@cds.external : true
type StandardAppService.UITemplates_com_bayer_SXTENDER_templates_SelectedField {
  ID : LargeString;
  Name : LargeString;
};

@cds.external : true
type StandardAppService.com_bayer_SXTENDER_TransactionalData_NLConditions {
  ContractDuration : Double;
  OfferPrice : Double;
  Discount : Double;
  NetPrice : Double;
};

@cds.external : true
action StandardAppService.copyOffer(
  offerID : LargeString,
  type : LargeString,
  QuotationInstituteID : Integer
) returns LargeString;

@cds.external : true
action StandardAppService.sendHematologyNotificationMailTemplate(
  offerID : LargeString,
  tenderId : LargeString,
  CountryCode : LargeString,
  url : LargeString
) returns LargeString;

@cds.external : true
action StandardAppService.softDeleteOffer(
  offerID : LargeString
) returns LargeString;

@cds.external : true
function StandardAppService.getNotificationMailTemplate(
  offerID : LargeString,
  templateId : LargeString,
  url : LargeString
) returns LargeString;

@cds.external : true
action StandardAppService.getSAPSalesOrderSimulation(
  offerID : LargeString,
  tenderID : LargeString,
  productCode : Integer,
  instituteID : Integer,
  customerID : LargeString,
  materialNumber : LargeString,
  countryCode : LargeString
) returns LargeString;

@cds.external : true
action StandardAppService.updateFinalContractStartEndDate(
  OfferID : LargeString,
  @sap.display.format : 'Date'
  ContractStartDate : Date,
  @sap.display.format : 'Date'
  ContractEndDate : Date
) returns LargeString;

@cds.external : true
action StandardAppService.createAllFastConditionContracts(
  OfferID : LargeString
) returns LargeString;

