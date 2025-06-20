import SimpleType from "sap/ui/model/SimpleType";
import ValidateException from "sap/ui/model/ValidateException";
import NumberFormat from "sap/ui/core/format/NumberFormat";

export default class CustomDecimalType extends SimpleType {
    private _oNumberFormat = NumberFormat.getFloatInstance({
        maxFractionDigits: 2,
        groupingEnabled: true,
        groupingSeparator: ",",
        decimalSeparator: "."
    });

    formatValue(oValue: any): string {
        if (oValue) oValue = Number(oValue)?.toFixed(2);
        return this._oNumberFormat.format(oValue);
    }

    parseValue(oValue: string): string {
        oValue = oValue.replace(",", ".");
        return this._oNumberFormat.format(oValue);
    }

    validateValue(oValue: any): void {
        // if(!(/^[0-9]+(\.[0-9]{1,2})?$/).test(oValue)) {
        //     throw new ValidateException("Not a valid decimal number");
        // }
    }
}
