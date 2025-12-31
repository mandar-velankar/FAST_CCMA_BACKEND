import SimpleType from "sap/ui/model/SimpleType";
import ValidateException from "sap/ui/model/ValidateException";
import NumberFormat from "sap/ui/core/format/NumberFormat";

const oPercentFormat = NumberFormat.getPercentInstance({
    minFractionDigits: 2,
    maxFractionDigits: 2
});

/**
 * @namespace com.bayer.tender.ccma.model.datatypes
 */
export default class PercentageType extends SimpleType {
    constructor() {
        super();
    }

    formatValue(value: any): string {
        return oPercentFormat.format(Number(value));
    }

    parseValue(oValue: string): number {
        const floatNum = parseFloat(oValue.replace(",", "."));
        return floatNum / 100;
    }

    validateValue(oValue: number): void {
        if (oValue > 1) {
            throw new ValidateException("Not a valid percentage!");
        }
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
