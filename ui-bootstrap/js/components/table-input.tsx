import * as React from 'react';
import * as moment from 'moment';
import registeredComponents from '../constants/registeredComponents';
import ITableInputProps from '../interfaces/ITableInputProps';
import { getTableInputDateTime } from './table-input-datetime';

interface ITableInputState {
    value?: any;
    currentValue?: any;
    isFocused?: boolean;
}

declare let manywho: any;

class TableInput extends React.Component<ITableInputProps, ITableInputState> {

    getInputType(contentType) {

        switch (contentType.toUpperCase()) {
        case manywho.component.contentTypes.string:
            return 'text';
        case manywho.component.contentTypes.number:
            return 'number';
        case manywho.component.contentTypes.boolean:
            return 'checkbox';
        case manywho.component.contentTypes.password:
            return 'password';
        case manywho.component.contentTypes.datetime:
            return 'datetime';
        case manywho.component.contentTypes.date:
            return 'date';
        default:
            return 'text';
        }
    }

    isEmptyDate(date) {

        if (date == null
            || manywho.utils.isNullOrEmpty(date)
            || date.indexOf('01/01/0001') !== -1
            || date.indexOf('1/1/0001') !== -1
            || date.indexOf('0001-01-01') !== -1)
            return true;

        return false;
    }

    renderDateTimeModal(error: string = null): void {
        const TableInputDateTime = getTableInputDateTime();
        manywho.model.setModal(
            this.props.flowKey, 
            {
                content: (
                    <>
                        {error ? (
                            <div className="notification alert alert-danger">
                                <span>{error}</span>
                            </div>
                        ) : null}
                        <TableInputDateTime 
                            value={this.state.value} 
                            onChange={this.onChange} 
                            format={manywho.formatting.toMomentFormat(this.props.contentFormat)} 
                        />
                    </>
                ),
                onConfirm: this.onCommit,
                onCancel: this.onCloseModal,
                flowKey: this.props.flowKey,
            },
        );
    }

    onChange = (e) => {
        if (
            manywho.utils.isEqual(
                this.props.contentType, 
                manywho.component.contentTypes.boolean, 
                true,
            )
        ) {
            const checked = 
                typeof this.state.value === 'string' && 
                manywho.utils.isEqual(this.state.value, 'false', true) ? 
                false : 
                (this.state.value as boolean).valueOf();
                
            this.setState({ value: !checked });

        } else if (
            manywho.utils.isEqual(
                this.props.contentType, 
                manywho.component.contentTypes.datetime, 
                true,
            ) || manywho.utils.isEqual(
                this.props.contentType, 
                manywho.component.contentTypes.date, 
                true,
            )
        ) {
            this.setState({ value: e });
        } else {
            this.setState({ value: e.currentTarget.value });
        }
    }

    onKeyUp = (e) => {
        if (e.keyCode === 13 && !this.props.isDesignTime && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            this.onCommit();
        }
    }

    onFocus = (e) => {
        this.setState({ isFocused: true });
    }

    onBlur = () => {
        this.setState({ isFocused: false });

        if (!this.props.isDesignTime)
            this.onCommit();
    }

    onClick = (e) => {
        e.stopPropagation();

        if (
            manywho.utils.isEqual(
                this.props.contentType, 
                manywho.component.contentTypes.datetime, 
                true,
            ) || manywho.utils.isEqual(
                this.props.contentType, 
                manywho.component.contentTypes.date, 
                true,
            )
        ) {
            this.setState({ currentValue: this.state.value });
            this.renderDateTimeModal();
        }
    };

    onCommit = () => {
        const isDateTimeInput = manywho.utils.isEqual(
            this.props.contentType, 
            manywho.component.contentTypes.datetime, 
            true,
        );
        const isDateInput = manywho.utils.isEqual(
            this.props.contentType, 
            manywho.component.contentTypes.date, 
            true,
        );

        if (isDateTimeInput || isDateInput) {
            const isEmptyDate = this.isEmptyDate(this.state.value);

            if (isEmptyDate) {
                this.renderDateTimeModal('Please select a date');
            } else {
                const dateTime = isDateTimeInput ? moment(
                    this.state.value, 
                    ['MM/DD/YYYY hh:mm:ss A ZZ', moment.ISO_8601, this.props.contentFormat || ''],
                ) : moment(
                    this.state.value, 
                    ['MM/DD/YYYY', this.props.contentFormat || ''],
                );

                this.props.onCommitted(this.props.id, this.props.propertyId, dateTime.format());
                manywho.model.setModal(this.props.flowKey, null);
            }
    
        } else {
            this.props.onCommitted(this.props.id, this.props.propertyId, this.state.value);
        }
    };

    onCloseModal = (e) => {
        this.setState({ value: this.state.currentValue, currentValue: null });
        manywho.model.setModal(this.props.flowKey, null);
    }

    componentWillMount() {
        this.setState({ value: this.props.value });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ value: nextProps.value });
    }

    render() {
        manywho.log.info('Rendering Table Input: ' + this.props.id);

        let className = 'input-sm';

        if (!this.state.isFocused)
            className += ' table-input-display';

        if (
            !manywho.utils.isEqual(
                this.props.contentType, manywho.component.contentTypes.boolean, true,
            )
        ) {
            className += ' form-control';
        }

        const props: any = {
            className,
            onClick: this.onClick,
            onChange: this.onChange,
            onKeyUp: this.onKeyUp,
            value: this.state.value,
            onFocus: this.onFocus,
        };

        if (
            !manywho.utils.isEqual(
                this.props.contentType, manywho.component.contentTypes.datetime, true,
            ) && !manywho.utils.isEqual(
                this.props.contentType, 
                manywho.component.contentTypes.date, 
                true,
            )
        ) {
            props.onBlur = this.onBlur;
        }

        if (
            manywho.utils.isEqual(
                this.props.contentType, 
                manywho.component.contentTypes.boolean, 
                true,
            )
        ) {
            props.checked = 
                this.state.value === true || manywho.utils.isEqual(
                    this.state.value, 'true', true,
                );
        }

        if (
            manywho.utils.isEqual(
                this.props.contentType, manywho.component.contentTypes.string, true,
            )
        ) {
            props.rows = 1;

            props.onDoubleClick = () => {
                manywho.model.setModal(
                    this.props.flowKey, 
                    {
                        content: (
                            <textarea
                                autoFocus
                                className={props.className}
                                defaultValue={props.value}
                                rows={10}
                                onChange={e => this.setState({ currentValue: e.currentTarget.value })}
                            />
                        ),
                        onConfirm: () => {
                            this.props.onCommitted(this.props.id, this.props.propertyId, this.state.currentValue);
                            manywho.model.setModal(this.props.flowKey, null);
                        },
                        onCancel: this.onCloseModal,
                        flowKey: this.props.flowKey,
                    }
                );
            }
            
            return <textarea {...props} />;
        }

        props.type = this.getInputType(this.props.contentType);
        return <input id="myId" {...props}/>;
    }
}

manywho.component.register(registeredComponents.TABLE_INPUT, TableInput);

export const getTableInput = () : typeof TableInput => manywho.component.getByName(registeredComponents.TABLE_INPUT);

export default TableInput;


