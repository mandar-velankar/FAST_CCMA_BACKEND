import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController";
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
				(this.getOwnerComponent() as Component).oListSelector.setBoundMasterList(this._oList);
			}
		});
	}

	public async onListItemPress(event: Event) {
		// For sap.m.Table itemPress event
		const listItem = (event as any).getSource();
		const context = listItem.getBindingContext();
		const data = context.getObject() as TContract;
		this.getRouter().navTo("detail", { layout: "TwoColumnsMidExpanded", id: data.ID });
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

	setFilter() {
		let orFilters = [];
		let andFilters = [];

		const contractsMasterTable = this.byId("idContractsMasterTable");
		const binding = contractsMasterTable?.getBinding("items");

		let sSearch = this.byId("idSearch")?.getProperty("value");
		let countryCode = (this.byId("idSlctCountry") as Select)?.getSelectedKey();
		let brandID = (this.byId("idSlctBrand") as Select)?.getSelectedKey();
		let productCode = (this.byId("idSelectProduct") as Select)?.getSelectedKey();

		const slctfilterSelectedItemKey = this.byId("idNewMaterialNumbers")?.getSelectedItem().getKey().toLowerCase();

		const hasNewMaterialsFilter = slctfilterSelectedItemKey === "newmaterialnumberskey";

		if (sSearch.length > 0) {

			orFilters.push(new Filter({
				path: "OfferID",
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

			if (/^\d+$/.test(sSearch)) {
				orFilters.push(new Filter({
					path: "CustomerID",
					operator: FilterOperator.EQ,
					value1: parseInt(sSearch)
				}));
			}

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
				path: "CCMContract/BrandID",
				operator: FilterOperator.EQ,
				value1: brandID,
				caseSensitive: false
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

		//New Material Numbers filter
		if (slctfilterSelectedItemKey && slctfilterSelectedItemKey !== "all_materials") {
			if(hasNewMaterialsFilter){ 
				andFilters.push(new Filter("hasNewMaterialNumber", "EQ", hasNewMaterialsFilter));
			}
		}

		if (andFilters.length > 0) {
			var oFilters = new Filter(andFilters, true);

			//Binding to table with the filters and the sorters
			(this.getView()?.byId("idContractsMasterTable")?.getBinding("items") as ListBinding)?.filter(oFilters, FilterType.Application);
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

		oSel = filters[this.oSelCol as keyof typeof filters];

		let oTableSearchStatus = [];
		let	query = oSource.getValue(); //get value from filter field in popover
		

		if (query && query.length > 0) {
			

			// Date filters
			let reg = /[0-9]+[-][0-9]{2}[-][0-9]{2}/g;
			if (query.search(reg) == 0) {
				oTableSearchStatus = [new Filter({
					path: oSel, 
					operator: FilterOperator.EQ, 
					value1: query,
					caseSensitive: false
				})];
			}else {
				oTableSearchStatus = [new Filter({
					path: oSel, 
					operator: FilterOperator.Contains, 
					value1: query,
					caseSensitive: false
				})];
			}
			const aNewFilters = aExistingFilters ? [...aExistingFilters] : [];
			aNewFilters.push(oTableSearchStatus[0]);

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

}