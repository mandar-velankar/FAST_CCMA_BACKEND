import CompositeType from "sap/ui/model/CompositeType";
import ValidateException from "sap/ui/model/ValidateException";
import DateFormat from "sap/ui/core/format/DateFormat";

/**
 * @namespace com.bayer.tender.ccma.model.datatypes
 */
export default class CustomDateType extends CompositeType {
    constructor() {
        super();
    }

    formatValue(oValue: any): string {
        if (!oValue) {
            return "";
        }
        const oDateFormat = DateFormat.getDateInstance({
            pattern: 'yyyy-MM-dd',
            UTC: false
        });
        return oDateFormat.format(oValue);
    }

    parseValue(oValue: string): Date | string {
        if (!oValue) {
            return "";
        }
        const oDateFormat = DateFormat.getDateInstance({
            pattern: 'dd-MM-yyyy',
            UTC: false
        });
        const parsed = oDateFormat.parse(oValue);
        if (Array.isArray(parsed)) {
            return parsed[0] || "";
        }
        return parsed;
    }

    validateValue(oValue: any): void {
        // if(oValue > 1) {
        //     throw new ValidateException("Not a valid Date!");
        // }
    }

    /**
     * Override
     * see https://sapui5.netweaver.ondemand.com/sdk/#/api/sap.ui.model.SimpleType%23methods/Summary
     */
    getModelFormat() {
        return {
            format: (value: any) => this.formatValue(value),
            parse: (value: any) => this.parseValue(value)
        };
    }
}
