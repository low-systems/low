/// <reference types="node" />
import PdfMake from 'pdfmake';
import { Doer, TaskConfig, ConnectorContext, IMap } from 'low';
import { TFontDictionary, TDocumentDefinitions, ContextPageSize } from 'pdfmake/interfaces';
export declare class PdfDoer extends Doer<PdfDoerConfig, any> {
    _printer?: PdfMake;
    get printer(): PdfMake;
    setup(): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: PdfTaskConfig): Promise<Buffer>;
    imageCache: IMap<ImageCacheItem>;
    fetchImages(context: ConnectorContext<any>, images?: (ImageItem | string)[]): Promise<IMap<string>>;
    makeDynamicSectionFunction(context: ConnectorContext<any>, definition: any): (currentPage: number, pageCount: number, pageSize: ContextPageSize) => any;
    generatePdf(context: ConnectorContext<any>, definition: TDocumentDefinitions): Promise<Buffer>;
}
export interface PdfDoerConfig {
    fonts?: TFontDictionary;
}
export interface PdfTaskConfig {
    definition: TDocumentDefinitions;
    images?: (ImageItem | string)[];
    dynamicHeader?: any;
    dynamicFooter?: any;
}
export interface ImageItem {
    url: string;
    ttl?: number;
    type?: string;
}
export interface ImageCacheItem extends ImageItem {
    datauri: string;
    cached: Number;
    expires: Number;
}
