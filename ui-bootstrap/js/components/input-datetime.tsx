import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as $ from 'jquery';
import * as moment from 'moment';
import IInputProps from '../interfaces/IInputProps';
import registeredComponents from '../constants/registeredComponents';

import '../lib/100-datetimepicker.js';

declare let manywho: any;

class InputDateTime extends React.Component<IInputProps, null> {
    isDateOnly: boolean;
    isTimeOnly: boolean;

    constructor(props: IInputProps) {
        super(props);

        this.isDateOnly = true;
        this.isTimeOnly = false;

        this.setPickerDate = this.setPickerDate.bind(this);
    }

    format(date) {
        if (this.isDateOnly) {
            return moment({
                year: date.year(),
                month: date.month(),
                day: date.date(),
            }).format('YYYY-MM-DD');
        }

        if (manywho.settings.global('i18n.overrideTimezoneOffset', this.props.flowKey)) {
            return date.local().format();
        }

        return date.utc().format();
    }

    onChange = (e) => {
        if (!this.props.isDesignTime) {
            if (!e.date) {
                this.props.onChange('');
            } else if (e.date.isValid()) {
                // This check is happening as, if just the timepicker is being used
                // the expected behaviour is that the page components default value
                // e.g YYYY-MM-DD should persist and not default back to the current date
                if (
                    this.isTimeOnly &&
                    this.props.value !== null &&
                    !e.date.isSame(this.props.value)
                ) {
                    const defaultDate: any = this.props.value;
                    const defaultMomentDate = moment(defaultDate);
                    const timeGetters = {
                        hour: e.date.get('hour'),
                        minute: e.date.get('minute'),
                        second: e.date.get('second'),
                    };

                    const defaultDateSet = defaultMomentDate.set(timeGetters);
                    this.props.onChange(this.format(defaultDateSet));
                } else {
                    this.props.onChange(this.format(e.date));
                }
            } else {
                this.props.onChange(e.target.value);
            }
        }
    };

    getDate(newDate) {
        const date = moment(newDate, [
            'MM/DD/YYYY hh:mm:ss A ZZ',
            'YYYY-MM-DDTHH:mm:ss.SSSSSSSZ',
            moment.ISO_8601,
        ]);
        const UTCdate = moment.utc(newDate, [
            'MM/DD/YYYY hh:mm:ss A ZZ',
            'YYYY-MM-DDTHH:mm:ss.SSSSSSSZ',
            moment.ISO_8601,
        ]);

        if (newDate === null) {
            return null;
        } else if (this.isDateOnly) {
            // Create a new date with no time information

            // With a Date only input box, we do not show time,
            // so we do not want timezones and so use utc
            return UTCdate;
        } else {
            if (manywho.settings.global('i18n.overrideTimezoneOffset', this.props.flowKey)) {
                return date.local();
            } else {
                return UTCdate;
            }
        }
    }

    setPickerDate(newDate): void {
        // eslint-disable-next-line react/no-find-dom-node
        const datepickerElement = findDOMNode(this.refs['datepicker']);
        const datepickerInstance = $(datepickerElement).data('DateTimePicker');

        const date = this.getDate(newDate);
        datepickerInstance.date(date);
    }

    componentDidMount(): void {
        const model = manywho.model.getComponent(this.props.id, this.props.flowKey);

        let useCurrent = false;
        let customFormat = null;

        if (model.attributes) {
            if (model.attributes.useCurrent !== undefined)
                useCurrent = manywho.utils.isEqual(model.attributes.useCurrent, 'true', true)
                    ? true
                    : false;

            if (model.attributes.dateTimeFormat) customFormat = model.attributes.dateTimeFormat;
        }

        if (customFormat) {
            this.isDateOnly =
                customFormat.toLowerCase().indexOf('h') === -1 &&
                customFormat.indexOf('m') === -1 && // minute is always lower case, M is always month
                customFormat.toLowerCase().indexOf('s') === -1;

            if (!this.isDateOnly) {
                this.isTimeOnly =
                    ((customFormat.toLowerCase().indexOf('h') > -1 &&
                        customFormat.indexOf('m') > -1) ||
                        customFormat.toLowerCase().indexOf('s') > -1) &&
                    customFormat.toLowerCase().indexOf('y') === -1 &&
                    customFormat.toLowerCase().indexOf('d') === -1 &&
                    customFormat.indexOf('M') === -1;
            }
        }

        // eslint-disable-next-line react/no-find-dom-node
        const datepickerElement = findDOMNode(this.refs['datepicker']);

        $(datepickerElement)
            .datetimepicker({
                useCurrent,
                locale: model.attributes.dateTimeLocale || 'en-us',
                focusOnShow: false,
                format:
                    customFormat ||
                    manywho.formatting.toMomentFormat(model.contentFormat) ||
                    'MM/DD/YYYY',
                timeZone: 'UTC',
                date: this.getDate(this.props.value),
            })
            .on('dp.change', !this.props.isDesignTime && this.onChange);

        // Seems that the Bootstrap datepicker ignores Reacts
        // autoFocus attribute... so will have to manually open the picker
        if (model.autoFocus) {
            $(datepickerElement).data('DateTimePicker').show();
        }
    }

    componentWillUnmount() {
        if (this.refs['datepicker']) {
            // eslint-disable-next-line react/no-find-dom-node
            $(findDOMNode(this.refs['datepicker'])).data('DateTimePicker').destroy();
        }
    }

    componentDidUpdate() {
        // This makes sure that the date value gets cleared from the input field when
        // it's visibility is toggled using a page condition
        if (!this.props.value) {
            // eslint-disable-next-line react/no-find-dom-node
            const datepickerElement = findDOMNode(this.refs['datepicker']);
            const datepickerInstance = $(datepickerElement).data('DateTimePicker');
            datepickerInstance.clear();
        } else {
            const newDate = this.props.value === '' ? null : this.props.value;
            this.setPickerDate(newDate);
        }
    }

    render() {
        const model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        return (
            <input
                id={this.props.id}
                placeholder={this.props.placeholder}
                className="form-control datepicker"
                ref="datepicker"
                type="datetime"
                size={this.props.size}
                readOnly={this.props.readOnly}
                disabled={this.props.disabled}
                required={this.props.required}
                onBlur={this.props.onBlur}
                autoComplete={this.props.autoComplete}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={model.autoFocus}
            />
        );
    }
}

manywho.component.register(registeredComponents.INPUT_DATETIME, InputDateTime);

export const getInputDateTime = (): typeof InputDateTime =>
    manywho.component.getByName(registeredComponents.INPUT_DATETIME) || InputDateTime;

export default InputDateTime;
