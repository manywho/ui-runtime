import * as React from 'react';
import registeredComponents from '../constants/registeredComponents';
import IComponentProps from '../interfaces/IComponentProps';

declare const manywho: any;

class PdfDownloader extends React.Component<IComponentProps, null> {

    componentDidMount() {
        if (!this.props.isDesignTime) {
            const model = manywho.model.getComponent(this.props.id, this.props.flowKey);
            
            manywho.state.setComponent(            
                this.props.id, { objectData: model.objectData }, this.props.flowKey, true,
            );
        }
    }

    downloadPdf(e: any, flowKey: string, fileId: string, filename: string) {
        const tenantId = manywho.utils.extractTenantId(flowKey);
        const stateId = manywho.utils.extractStateId(flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(flowKey);

        manywho.ajax.downloadPdf(stateId, fileId, filename, tenantId, authenticationToken);
    }

    render() {

        let className = 'btn-link';

        if (!this.props.isDesignTime) {
            const model = manywho.model.getComponent(this.props.id, this.props.flowKey); 
            const file = model.objectData.find((item) => item.developerName === '$File');
            const fileId = file.properties.find((prop) => prop.developerName === 'Id').contentValue;
            const filename = file.properties.find((prop) => prop.developerName === 'Name').contentValue;
            className = model?.attributes?.classes ? model?.attributes?.classes : 'btn-link';

            return <button onClick={(e) => this.downloadPdf(e, this.props.flowKey, fileId, filename)} className={className}>{model.label}</button>;  
        }

        let displayName = 'Download Pdf';
        if (this.props && this.props.id && this.props.flowKey) {
            const model = manywho.model.getComponent(this.props.id, this.props.flowKey);
            if (model && model.label) {
                displayName = model.label;
            }
        }

        return <button className={className}>{displayName}</button>;
    }
}

manywho.component.register(registeredComponents.PDF_DOWNLOADER, PdfDownloader);

export const getPdf = (): typeof PdfDownloader => manywho.component.getByName(registeredComponents.PDF_DOWNLOADER) || PdfDownloader;

export default PdfDownloader;
