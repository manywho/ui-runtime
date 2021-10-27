import * as React from 'react';
import registeredComponents from '../constants/registeredComponents';
import IComponentProps from '../interfaces/IComponentProps';

declare const manywho: any;

class PdfDownloader extends React.Component<IComponentProps, null> {

    downloadPdf(e: any, flowKey: string, fileName: string) {
        

        manywho.engine.getPdf(flowKey, fileName); 
    }

    render() {

        if (!this.props.isDesignTime) {
            const model = manywho.model.getComponent(this.props.id, this.props.flowKey); 
            const file = model.objectData.find((item) => item.developerName === '$File');
            const fileName = file.properties.find((prop) => prop.developerName === 'Name').contentValue;

            return <button onClick={(e) => this.downloadPdf(e, this.props.flowKey, fileName)}>{model.label}</button>;  
        }
        
        return <button>Download Pdf</button>;
    }
}

manywho.component.register(registeredComponents.PDF_DOWNLOADER, PdfDownloader);

export const getPdf = (): typeof PdfDownloader => manywho.component.getByName(registeredComponents.PDF_DOWNLOADER) || PdfDownloader;

export default PdfDownloader;
