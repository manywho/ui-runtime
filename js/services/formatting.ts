import * as numbro from 'numbro';
import * as moment from 'moment';

import Component from './component';
import * as Log from 'loglevel';
import Settings from './settings';
import Utils from './utils';

const dateTimeFormatRegex = new RegExp('[^dmyhsztkfg]+', 'gi');
const dateTimeFormatMappings: any = [
    { key: 'd', value: 'D' },
    { key: 'dd', value: 'DD' },
    { key: 'ddd', value: 'ddd' },
    { key: 'dddd', value: 'dddd' },
    { key: 'f', value: 'S' },
    { key: 'ff', value: 'SS' },
    { key: 'fff', value: 'SSS' },
    { key: 'ffff', value: 'SSSS' },
    { key: 'fffff', value: 'SSSSS' },
    { key: 'ffffff', value: 'SSSSSS' },
    { key: 'F', value: 'S' },
    { key: 'FF', value: 'SS' },
    { key: 'FFF', value: 'SSS' },
    { key: 'FFFF', value: 'SSSS' },
    { key: 'FFFFF', value: 'SSSSS' },
    { key: 'FFFFFF', value: 'SSSSSS' },
    { key: 'h', value: 'h' },
    { key: 'hh', value: 'hh' },
    { key: 'H', value: 'HH' },
    { key: 'HH', value: 'HH' },
    { key: 'K', value: 'Z' },
    { key: 'm', value: 'm' },
    { key: 'mm', value: 'mm' },
    { key: 'M', value: 'M' },
    { key: 'MM', value: 'MM' },
    { key: 'MMM', value: 'MMM' },
    { key: 'MMMM', value: 'MMMM' },
    { key: 's', value: 's' },
    { key: 'ss', value: 'ss' },
    { key: 't', value: 'a' },
    { key: 'tt', value: 'A' },
    { key: 'y', value: 'YY' },
    { key: 'yy', value: 'YY' },
    { key: 'yyy', value: 'YYYY' },
    { key: 'yyyy', value: 'YYYY' },
    { key: 'z', value: 'ZZ' },
    { key: 'zz', value: 'ZZ' },
    { key: 'zzz', value: 'ZZ' }
];

let culture = 'en-US';

/**
 * Set the initial culture to be used when formatting from the `window.navigator.language` or override by the `i18n.culture` setting
 * @param flowKey
 */
export const initialize = (flowKey) => {
    if (Settings.global('i18n.culture', flowKey) && numbro) {
        culture = Settings.global('i18n.culture', flowKey);
    }
    else if (window.navigator && window.navigator.language && window.navigator.language.indexOf('-') !== -1) {
        const parts = window.navigator.language.split('-');
        const userCulture = `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
        if (numbro.cultures()[userCulture])
            culture = userCulture;
        else
            culture = 'en-US';
    }
    else
        culture = 'en-US';
};

/**
 * Format a value using the defined format string. Currently supports datetimes and numbers only.
 * @param value The value to format
 * @param format Format string to apply to the value
 * @param contentType Type of the value as defined in the metadata e.g. `ContentString`
 * @param flowKey
 */
export const format = (value: string | number, format: string, contentType: string, flowKey: string): string | number => {
    if (!Settings.global('formatting.isEnabled', flowKey, false) || Utils.isNullOrWhitespace(contentType))
        return value;

    switch (contentType.toUpperCase()) {
        case Component.contentTypes.datetime:
            return dateTime(value as string, format, flowKey);

        case Component.contentTypes.number:
            return number(value, format, flowKey);
    }

    return value;
};

/**
 * Converts a .NET datetime format string into a MomentJS format string
 * @param format Format string to convert
 */
export const toMomentFormat = (format: string): string => {
    if (!Utils.isNullOrEmpty(format)) {

        if (format === 'd')
            return 'l';
        else if (format === 'D')
            return 'dddd, MMMM DD, YYYY';
        else if (format === 'f')
            return 'LLLL';
        else if (format === 'F')
            return 'dddd, LL LTS';
        else if (format === 'g')
            return 'L LT';
        else if (format === 'G')
            return 'L LTS';
        else if (format === 'm')
            return 'MMMM D';
        else if (format === 'r')
            return 'ddd, DD MMM YYYY HH:mm:ss [GMT]';
        else if (format === 's')
            return 'YYYY-MM-DD[T]HH:mm:ss';
        else if (format === 't')
            return 'LT';
        else if (format === 'T')
            return 'LTS';
        else if (format === 'u')
            return 'YYYY-MM-DD HH:mm:ss[Z]';
        else if (format === 'U')
            return 'dddd, LL LTS';
        else if (format === 'y')
            return 'MMMM YYYY';

        const parts = format.split(dateTimeFormatRegex);

        if (parts) {
            let parsedFormat = format;

            parts.forEach(part => {
                const mapping = dateTimeFormatMappings.find(item => item.key === part);
                parsedFormat = mapping ? parsedFormat.replace(part, mapping.value) : parsedFormat;
            });

            return parsedFormat;
        }
    }

    return null;
};

/**
 * Format a datetime and return it as a string
 * @param dateTime DateTime to format
 * @param format MomentJS format string
 * @param flowKey
 */
export const dateTime = (dateTime: string, format: string, flowKey: string): string => {
    if (!Settings.global('formatting.isEnabled', flowKey, false))
        return dateTime;

    let offset = moment().utcOffset();
    const overrideTimezoneOffset = Settings.global('i18n.overrideTimezoneOffset', flowKey);

    if (overrideTimezoneOffset && !Utils.isNullOrUndefined(Settings.global('i18n.timezoneOffset', flowKey)))
        offset = Settings.global('i18n.timezoneOffset', flowKey);

    if ((Utils.isNullOrUndefined(offset) || offset === 0) && Utils.isNullOrWhitespace(format) && !overrideTimezoneOffset)
        return dateTime;

    try {
        const momentFormat = Utils.isNullOrWhitespace(format) ? null : toMomentFormat(format);
        const formats: Array<string | moment.MomentBuiltinFormat> = [moment.ISO_8601];

        if (momentFormat)
            formats.unshift(momentFormat);

        let parsedDateTime = moment.utc(dateTime, formats);

        if (!parsedDateTime.isValid())
            return dateTime;

        if (format !== 'r' && format !== 'u' && overrideTimezoneOffset)
            parsedDateTime.utcOffset(offset);

        if (overrideTimezoneOffset)
            return parsedDateTime.format(momentFormat);
        else
            return parsedDateTime.utc().format(momentFormat);
    }
    catch (ex) {
        Log.error(ex);
    }

    return dateTime;
};

/**
 * Format a number and return it as a string
 * @param value Number to format
 * @param format Format string, supported formats include e, E (scientifix); c, C (currency); and symbols as documented here: http://numbrojs.com/format.html
 * @param flowKey
 */
export const number = (value: number | string, format: string, flowKey: string): string => {
    if (Utils.isNullOrWhitespace(format) || !Settings.global('formatting.isEnabled', flowKey, false))
        return value.toString();

    if (typeof value === 'string' && Utils.isNullOrWhitespace(value))
        return value;

    try {
        if (format.indexOf('e') !== -1 || format.indexOf('E') !== -1)
            return (new Number(value)).toExponential();

        if (format.indexOf('c') !== -1 || format.indexOf('C') !== -1) {
            let numbroValue = numbro(value);
            numbro.culture(culture);

            let formattedNumber = numbroValue.formatCurrency(Settings.global('formatting.currency', flowKey, '0[.]00'));
            numbro.culture('en-US');

            return formattedNumber;
        }

        format = format.replace(/^#+\./, match => match.replace(/#/g, '0'));

        if (format.indexOf('.') !== -1) {
            const numberString = value.toString();
            const decimals = numberString.substring(numberString.indexOf('.') + 1);
            const decimalsFormat = format.substring(format.indexOf('.') + 1);

            format = format.substring(0, format.indexOf('.') + 1);

            decimalsFormat.split('').forEach((part, index) => {
                switch (part.toUpperCase()) {
                    case '#':
                        if (index < decimals.length)
                            format += 0;
                        break;

                    case '0':
                        format += '0';
                        break;

                    default:
                        format += part;
                        break;
                }
            });
        }

        let numbroValue = numbro(value);
        numbro.culture(culture);

        let formattedNumber = numbroValue.format(format);
        numbro.culture('en-US');

        return formattedNumber;
    }
    catch (ex) {
        Log.error(ex);
    }

    return value.toString();
};
