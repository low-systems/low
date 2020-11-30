/// <reference types="node" />
import PdfMake from 'pdfmake';
import { Doer, TaskConfig, ConnectorContext, IMap } from 'low';
import { TFontDictionary, TDocumentDefinitions, ContextPageSize, Content } from 'pdfmake/interfaces';
export declare class PdfDoer extends Doer<PdfDoerConfig, any> {
    _printer?: PdfMake;
    get printer(): PdfMake;
    setup(): Promise<void>;
    main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: PdfTaskConfig): Promise<Buffer>;
    imageCache: IMap<ImageCacheItem>;
    fetchImages(context: ConnectorContext<any>, images?: (ImageItem | string)[]): Promise<IMap<string>>;
    functionCache: IMap<DynamicContentWithContext>;
    makeDynamicSectionFunction(context: ConnectorContext<any>, code: string, metadata?: any): any;
    generatePdf(context: ConnectorContext<any>, definition: TDocumentDefinitions): Promise<Buffer>;
}
export interface PdfDoerConfig {
    fonts?: TFontDictionary;
}
export interface PdfTaskConfig {
    definition: TDocumentDefinitions;
    images?: (ImageItem | string)[];
    headerFunction?: string;
    footerFunction?: string;
    metadata?: any;
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
export declare type DynamicContentWithContext = (context: ConnectorContext<any>, metadata: any, pageNumber: number, pageCount: number, pageSize: ContextPageSize) => Content | null | undefined;
