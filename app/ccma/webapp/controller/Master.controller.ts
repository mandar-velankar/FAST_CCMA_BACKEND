import Controller from "sap/ui/core/mvc/Controller";
import BaseController, { CompositeMessageType } from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { RowActionItem$PressEvent } from "sap/ui/table/RowActionItem";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import { semantic } from "sap/m/library";
import List from "sap/m/List";
import Component from "../Component";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import FilterType from "sap/ui/model/FilterType";
import ListBinding from "sap/ui/model/ListBinding";
import Event from "sap/ui/base/Event";
import Popup from "sap/ui/core/Popup";
import * as formatter from "com/bayer/tender/ccma/model/formatter";
import Sorter from "sap/ui/model/Sorter";
import Select from "sap/m/Select";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import MessageBox from "sap/m/MessageBox";
import Table from "sap/m/Table";
type TContract = {
	ID: string;
}


/**
 * @namespace com.bayer.tender.ccma.controller
 */
export default class Master extends BaseController {
	public formatter = formatter;
	_oList: List;
	_oListFilterState: { aFilter: [], aSearch: [] };
	orFilters: [];
	andFilters: [];
    oSelCol: string = "ID";
    _oPopover?: any;
    _bKeyboard?: boolean;

	/*eslint-disable @typescript-eslint/no-empty-function*/
	public onInit() {
		// TODO: Remove after binding implementation

		let oList = this.byId("idContractsMasterTable");
		const model = new JSONModel({
		});

		this._oList = oList as List;
		// keeps the filter and search state
		this._oListFilterState = {
			aFilter: [],
			aSearch: []
		};

		this.orFilters = [];
		this.andFilters = [];

		this.getRouter()?.getRoute("master")?.attachPatternMatched(this._onMasterMatched, this);
		this.getRouter().attachBypassed(this.onBypassed, this);

		this.setModel(model, "masterModel");

		this.getView()?.addEventDelegate({
			onBeforeFirstShow: () => {
				this.bindUserCountries();
				(this.getOwnerComponent() as Component).oListSelector.setBoundMasterList(this._oList);
			}
		});

		this.subscribeEventEmitter("ContractMasterTableChannel", "updateContractMasterTable", this.refreshContractsMasterTable.bind(this));
	}

	public async onListItemPress(event: Event) {
		// For sap.m.Table itemPress event
		const listItem = (event as any).getSource();
		const context = listItem.getBindingContext();
		const data = context.getObject() as TContract;
		this.filterMasterTable(data.ID);
		this.getRouter().navTo("detail", { layout: "TwoColumnsMidExpanded", id: data.ID });
	}

	public filterMasterTable(id: string){
		const binding = this._oList.getBinding("items");
		const oFilter = new Filter("ID", FilterOperator.EQ, id);
		binding?.filter([oFilter]);
	}

	async _onMasterMatched(event: Route$PatternMatchedEvent) {
		//Set the layout property of the FCL control to 'OneColumn'
		(this.getModel("appView") as JSONModel)?.setProperty("/layout", "OneColumn");

		this.setFilter();

	}

	public onClick(event: Event) {
        // Get the column title that was clicked
        const source: any = event.getSource();
        this.oSelCol = source.getTitle();

        const oButton = source;

        if (!this._oPopover) {
            // Load the popover fragment only once
            this._oPopover = sap.ui.xmlfragment("com.bayer.tender.ccma.view.fragments.master.TableFilter", this);
            this.getView()?.addDependent(this._oPopover);
        }

        const eDock = Popup.Dock;
        this._oPopover.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
    }

	onBypassed() {
		this._oList.removeSelections(true);
	}

	public async onCountriesReceived (event: Event) {
		const uiModel = this.getModel("ui") as JSONModel;
		const sCountryCode = uiModel.getProperty("/SelectedCountry") || event?.getParameter("data")?.results[0]?.CountryCode || event.getParameter("selectedItem")?.getBindingContext('ui')?.getProperty("CountryCode"); // we default to first country in the list
		const userFullName = event?.getParameter("data")?.results[0]?.UserName || event.getParameter("selectedItem")?.getBindingContext('ui')?.getProperty("UserName")
		const userID = event?.getParameter("data")?.results[0]?.CWID || event.getParameter("selectedItem")?.getBindingContext('ui')?.getProperty("CWID")
		const userEmail = event?.getParameter("data")?.results[0]?.UserEmail || event.getParameter("selectedItem")?.getBindingContext('ui')?.getProperty("UserEmail")
		uiModel.setProperty("/UserFullName", userFullName);
		uiModel.setProperty("/UserID", userID);
		uiModel.setProperty("/UserEmail", userEmail);
		uiModel.setProperty("/SelectedCountry", sCountryCode);
		this.setFilter();
	}

	setFilter() {
		let orFilters = [];
		let andFilters = [];

		const contractsMasterTable = this.byId("idContractsMasterTable");
		const binding = contractsMasterTable?.getBinding("items") as ListBinding;

		let sSearch = this.byId("idSearch")?.getProperty("value");
		let countryCode = (this.byId("idSlctCountry") as Select)?.getSelectedKey();
		let brandID = (this.byId("idSlctBrand") as Select)?.getSelectedKey();
		let productCode = (this.byId("idSelectProduct") as Select)?.getSelectedKey();
		let instituteType = (this.byId("idSelectInstituteType") as Select)?.getSelectedKey();
		let instituteId = (this.byId("idSelectInstituteName") as Select)?.getSelectedKey();

		const selectedKey = this.byId("idslctfilter")?.getSelectedItem()?.getKey()?.toLowerCase();

		if (selectedKey && selectedKey !== "") {
			
			const filterMap = {
				newcontractskey: "hasNewContracts",
				newmaterialnumberskey: "hasNewMaterialNumber",
				activecontractskey: "hasActiveContracts",
				updatedpvlkey: "hasUpdatedPVL",
				updatedconfidentialpricekey: "hasUpdatedConfidentialPrice",
				netpriceabovepvlkey: "hasNetPriceAbovePVL",
				netpricebelowfloorpricekey: "hasNetPriceBelowFloorPrice",
				expiringsoonkey: "hasExpiringSoonContracts",
				expiredkey: "hasExpiredContracts",
				cancelledkey: "hasCancelledContracts"
			};

			const filterProperty = filterMap[selectedKey];

			if (filterProperty) {
				andFilters.push(new Filter(filterProperty, "EQ", true));
			}
		}

		if (sSearch.length > 0) {

			orFilters.push(new Filter({
				path: "OfferID",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));
			
			orFilters.push(new Filter({
				path: "SAPID",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "ExternalID",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "Reference",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));


			orFilters.push(new Filter({
				path: "ContractType",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "InstituteName",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "Owner",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "Division",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "ContractNumbers",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			orFilters.push(new Filter({
				path: "CustomerID",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			// Date filters
			if (isNaN(Number(sSearch))) {
				let reg = /[0-9]+[-][0-9]{2}[-][0-9]{2}/g;
				if (sSearch.search(reg) == 0) {

					orFilters.push(new Filter({
						path: "ContractStartDate",
						operator: FilterOperator.EQ,
						value1: sSearch,
						caseSensitive: false
					}));

					orFilters.push(new Filter({
						path: "ContractEndDate",
						operator: FilterOperator.EQ,
						value1: sSearch,
						caseSensitive: false
					}));
				}
			}

			orFilters.push(new Filter({
				path: "ContractMaterialNumbers",
				operator: FilterOperator.Contains,
				value1: sSearch,
				caseSensitive: false
			}));

			andFilters.push(new Filter(orFilters, false));
		}

		//Country filter
		if (countryCode) {
			andFilters.push(new Filter({
				path: "CountryCode",
				operator: FilterOperator.EQ,
				value1: countryCode,
				caseSensitive: false
			}));
		}

		//Brand filter
		if (brandID && brandID !== "All_Brands") {
			andFilters.push(new Filter({
				path: "ContractBrandIDs",
				operator: FilterOperator.Contains,
				value1: brandID
			}));
		}

		//Product filter
		if (productCode && productCode !== "All_Products") {
			andFilters.push(new Filter({
				path: "CCMContract/ProductCode",
				operator: FilterOperator.EQ,
				value1: productCode,
				caseSensitive: false
			}));
		}

		//InstituteType filter
		if (instituteType && instituteType !== "All") {
			andFilters.push(new Filter({
				path: "InstituteType",
				operator: FilterOperator.EQ,
				value1: instituteType,
				caseSensitive: false
			}));
		}

		//InstituteName filter
		if (instituteId && instituteId !== "All") {
			andFilters.push(new Filter({
				path: "InstituteID",
				operator: FilterOperator.EQ,
				value1: instituteId,
				caseSensitive: false
			}));
		}
		

		if (andFilters.length > 0) {
			var oFilters = new Filter(andFilters, true);

			//Binding to table with the filters and the sorters
			binding?.filter(oFilters, FilterType.Application);
		} else {
			(binding as ListBinding)?.filter();

		}

		if (this.getView()?.byId("idContractsMasterTable")?.getBinding("items")?.isSuspended()) {
			this.getView()?.byId("idContractsMasterTable")?.getBinding("items")?.resume();
		}

	}

    public handleMenuItemAsPress (): void {
        let oSel;

        const sorters = {
            "ID": "OfferID",
            "Owner": "Owner",
            "Classification": "ContractType",
            "Reference": "Reference",
            "Division": "Division",
            "Customer Code": "CustomerID",
            "Institute": "InstituteName",
            "Effective Date": "ContractStartDate",
            "Expiry Date": "ContractEndDate"
        };

        oSel = sorters[this.oSelCol as keyof typeof sorters];
        
        const oBinding = this._oList.getBinding("items");
        const sPath = oSel;
        const bDescending = false;
        const aSorters = [];

        aSorters.push(new Sorter(sPath, bDescending));

		if (oBinding instanceof ListBinding) {
        	// apply the selected sort and group settings
			oBinding.sort(aSorters);
		}
    }

    public handleMenuDesItemPress (): void {
        let oSel;

        const sorters = {
            "ID": "OfferID",
            "Owner": "Owner",
            "Classification": "ContractType",
            "Reference": "Reference",
            "Division": "Division",
            "Customer Code": "CustomerID",
            "Institute": "InstituteName",
            "Effective Date": "ContractStartDate",
            "Expiry Date": "ContractEndDate"
        };

        oSel = sorters[this.oSelCol as keyof typeof sorters];
        
        const oBinding = this._oList.getBinding("items");
        const sPath = oSel;
        const bDescending = true;
        const aSorters = [];

        aSorters.push(new Sorter(sPath, bDescending));

		if (oBinding instanceof ListBinding) {
        	// apply the selected sort and group settings
			oBinding.sort(aSorters);
		}
    }

	handleColumnFilterTextPress (event: Event): void {

		const oSource = event.getSource();
		const table = this._oList;
		const binding = table.getBinding("items") as ListBinding;
		const aExistingFilters = binding instanceof ListBinding && binding.aApplicationFilters;

		let oSel;

		const filters = {
            "ID": ["OfferID", "SAPID", "ExternalID"],
            "Owner": "Owner",
            "Classification": "ContractType",
            "Reference": "Reference",
            "Division": "Division",
            "Customer Code": "CustomerID",
            "Institute": "InstituteName",
            "Effective Date": "ContractStartDate",
            "Expiry Date": "ContractEndDate"
        };

		oSel = filters[this.oSelCol as keyof typeof filters];

		let oTableSearchStatus = [];
		let	query = oSource.getValue(); //get value from filter field in popover
		

		if (query && query.length > 0) {
			

			// Date filters
			let reg = /[0-9]+[-][0-9]{2}[-][0-9]{2}/g;
			if (query.search(reg) == 0) {
				oTableSearchStatus = Array.isArray(oSel) ? oSel.map(item => new Filter({
					path: item, 
					operator: FilterOperator.EQ, 
					value1: query,
					caseSensitive: false
				})) : [new Filter({
					path: oSel, 
					operator: FilterOperator.EQ, 
					value1: query,
					caseSensitive: false
				})];
			}else {
				oTableSearchStatus = Array.isArray(oSel) ? oSel.map(item => new Filter({
					path: item, 
					operator: FilterOperator.Contains, 
					value1: query,
					caseSensitive: false
				})) : [new Filter({
					path: oSel, 
					operator: FilterOperator.Contains, 
					value1: query,
					caseSensitive: false
				})];
			}
			const aNewFilters = aExistingFilters ? [...aExistingFilters] : [];
			aNewFilters.push(oTableSearchStatus.length > 1 ? new Filter(oTableSearchStatus, false) : oTableSearchStatus[0]);

			// Apply the new filter set properly
			binding.filter(aNewFilters, FilterType.Application); 
			// update filter bar
			// this.byId("vsdFilterBar").setVisible(aExistingFilters.length > 0);
			// this.byId("vsdFilterLabel").setText("Latest search for: " + query);
		} else {
			//remove the filter
			let aKeepFilters = [];

			binding.aApplicationFilters.forEach(function (oFilter: any) {
				//remove filter
				if (oFilter.sPath !== oSel) {
					var oFilterKeep = $.extend(true, {}, oFilter);
					aKeepFilters.push(oFilterKeep);
				}
			});
			//set default filtering
			this.setFilter();
			//this.oProductsTable.getBinding("items").filter(aKeepFilters, "Application");
			table?.getModel()?.refresh();
			//update filter bar
			// this.byId("vsdFilterBar").setVisible(false);
		}

	}

	setSelectBrand(event: Event) {
		let brandID = event.getParameter("selectedItem").getKey();
		let productSelect = this.byId("idSelectProduct") as Select;
		productSelect.setSelectedKey("All_Products");
		productSelect.getBinding("items")?.filter([
			new Filter({
				path: "BrandID",
				operator: FilterOperator.EQ,
				value1: brandID,
				caseSensitive: false
			})
		]);
	}

	public refreshContractsMasterTable () {
        const contractMasterTable = this.byId("idContractsMasterTable");
        contractMasterTable?.getBinding("items")?.refresh();
    }

	public bindUserCountries(){
        BusyIndicator.show();
        const getUserCountriesBinding = this.getModel()?.bindContext("/getUserCountries(...)");
        getUserCountriesBinding?.execute().then(
            () => {
                const actionContext = getUserCountriesBinding.getBoundContext();
                this.onbindUserCountriesSuccess(actionContext?.getObject());
            },
            (error: any) => {
                this.onbindUserCountriesFail(error);
            }
        );
    }

    public onbindUserCountriesSuccess(res: any): void {
        BusyIndicator.hide();
        const uiModel = this.getModel("ui") as JSONModel;
        let userCountries = res?.value || [];

		// Filter: Application === "STA" OR Application === "ALL"
		userCountries = userCountries.filter((item: any) =>
			item?.Application === "CCMA" || item?.Application === "ALL"
		);

		// Sort by Country.CountryName, safely:
		userCountries.sort((a: any, b: any) => {
			const nameA = a?.CountryName || "";
			const nameB = b?.CountryName || "";
			return nameA.localeCompare(nameB);
		});

		uiModel.setProperty("/UserCountries", userCountries);
    }

    private onbindUserCountriesFail(error: any): void {
        BusyIndicator.hide();
        console.error("Error in getUserCountries:", error);
    }

	public async onUpdateCCMContracts(): Promise<void> {
		const fastContractsTable = this.byId("idContractsMasterTable") as Table;  
		const fastContracts = fastContractsTable.getItems().map(item => item?.getBindingContext()?.getObject());

		if (fastContracts && Array.isArray(fastContracts) && fastContracts.length === 0) {
			MessageBox.error("No Contracts with new Material Number found");
			return;
		}

		BusyIndicator.show();

		const promises = fastContracts.map(async (contract: any) => {
			const contextBinding = this.getModel()?.bindContext(
				"/addNewMaterialNumberToExistingContract(...)"
			);

			if (!contextBinding) {
				throw new Error("Context binding failed");
			}

			contextBinding.setParameter("FastCCMContractId", contract?.ID);

			return contextBinding.execute().then(() => {
				const oActionContext = contextBinding.getBoundContext();
				return oActionContext?.getObject();
			});
		});

		try {
			const results = await Promise.all(promises);
			// Handle overall success here
			this.onUpdateCCMContractsSuccess(results);
		} catch (error) {
			// Handle overall failure here
			this.onUpdateCCMContractsFail(error);
		} finally {
			BusyIndicator.hide();
		}
	}


    public onUpdateCCMContractsSuccess(res: any): void {
		const table = this._oList;
		const messages: CompositeMessageType[] = [];
		res.forEach((item: any, index:number) => {
			const parsedContracts = JSON.parse(item.value);
			parsedContracts.forEach((pc: any) => {
				messages.push({
					type: pc.success ? 'Success' : 'Error',
					title: pc.message,
					description: pc.message,
					counter: index+1
				});
			});
		});

		this.showMessageCompositeView({sTitle: "Contract Update", aMessages: messages, sState: "None"});
		table?.getModel()?.refresh();
        BusyIndicator.hide();
    }

    public onUpdateCCMContractsFail(res: any): void {
        BusyIndicator.hide();

        let message = "An unexpected error occurred. Please contact SAP support.";

        if (res?.responseText) {
            try {
                const response = JSON.parse(res.responseText);
                message = response.error?.message?.value || response.message || message;
            } catch {
            }
        } else if (res?.message) {
            message = res.message;
        }

        MessageBox.error(message);
    }

}