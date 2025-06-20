import CompositeType from "sap/ui/model/CompositeType";
import ValidateException from "sap/ui/model/ValidateException";
import NumberFormat from "sap/ui/core/format/NumberFormat";

export default class CustomCurrencyType extends CompositeType {
    constructor() {
        super();
    }

    formatValue(parts: any[]): string {
        if (!parts) {
            return "";
        }
        const countryGroupingSeparators: Record<string, string> = {
            'NL': '.',
            'PL': ' '
        };

        const countryDecimalSeparators: Record<string, string> = {
            'NL': ',',
            'PL': ','
        };

        const minFractionDigits = parts[3] === 'ES' ? 6 : parts[3]?.includes('HM') ? 4 : parts[2] === 'MEA' ? 3 : 2;
        const maxFractionDigits = minFractionDigits;
        const groupingSeparator = countryGroupingSeparators[parts[3]] ? countryGroupingSeparators[parts[3]] : ",";
        const decimalSeparator = countryDecimalSeparators[parts[3]] ? countryDecimalSeparators[parts[3]] : ".";

        const oCurrencyFormat = NumberFormat.getCurrencyInstance({
            minFractionDigits,
            maxFractionDigits,
            groupingSeparator,
            decimalSeparator
        });
        return `${oCurrencyFormat.format(Number(parts[0] ?? 0))} ${parts[1] ?? ''}`;
    }

    parseValue(oValue: string): number | null {
        const oCurrencyFormat = NumberFormat.getCurrencyInstance({
            // minFractionDigits: 2,
            // maxFractionDigits: 2
        });
        const parsed = oCurrencyFormat.parse(oValue);
        if (typeof parsed === 'number') return parsed;
        if (typeof parsed === 'string') return Number(parsed);
        if (Array.isArray(parsed) && typeof parsed[0] === 'number') return parsed[0];
        return null;
    }

    validateValue(oValue: any): void {
        // if(oValue > 1) {
        //     throw new ValidateException("Not a valid Currency!");
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
