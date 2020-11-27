import PdfMake from 'pdfmake';
import Axios from 'axios';
import Crypto from 'crypto';

import { Doer, TaskConfig, ConnectorContext, IMap } from 'low';
import { TFontDictionary, TDocumentDefinitions, ContextPageSize, Content, DynamicContent } from 'pdfmake/interfaces';

export class PdfDoer extends Doer<PdfDoerConfig, any> {
  _printer?: PdfMake;
  get printer() {
    if (!this._printer) {
      throw new Error('PDF Make is not available, has the module been initialised properly yet?');
    }
    return this._printer;
  }

  async setup() {
    const fonts = {
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
      },
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      },
      Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
      },
      Symbol: {
        normal: 'Symbol'
      },
      ZapfDingbats: {
        normal: 'ZapfDingbats'
      }
    };
    Object.assign(fonts, this.config.fonts || {});

    this._printer = new PdfMake(fonts);
  }

  async main(context: ConnectorContext<any>, taskConfig: TaskConfig, coreConfig: PdfTaskConfig): Promise<Buffer> {
    coreConfig.definition.images = await this.fetchImages(context, coreConfig.images);

    if (typeof coreConfig.headerFunction === 'string') {
      coreConfig.definition.header = this.makeDynamicSectionFunction(context, coreConfig.headerFunction) as DynamicContent;
    }

    if (coreConfig.footerFunction === 'string') {
      coreConfig.definition.footer = this.makeDynamicSectionFunction(context, coreConfig.footerFunction) as DynamicContent;
    }

    const pdfData = this.generatePdf(context, coreConfig.definition);
    return pdfData;
  }

  imageCache: IMap<ImageCacheItem> = {};
  async fetchImages(context: ConnectorContext<any>, images?: (ImageItem | string)[]) {
    if (!images) return {};

    const imageDictionary: IMap<string> = {};
    const now = +new Date();

    const toDownload: ImageItem[] = [];
    for (const image of images) {
      const url = typeof image === 'string' ? image : image.url;
      if (!(url in this.imageCache) || this.imageCache[url].expires < now) {
        toDownload.push(typeof image === 'string' ? { url } : image);
      } else {
        imageDictionary[url] = this.imageCache[url].datauri;
      }
    }

    for (const image of toDownload) {
      try {
        const response = await Axios.get(image.url, { responseType: 'arraybuffer' });
        image.type = image.type || response.headers['content-type'] || 'image/jpeg';
        const imageB64 = Buffer.from(response.data, 'binary').toString('base64');
        const cacheItem: ImageCacheItem = {
          ...image,
          expires: now + (image.ttl || 3600),
          cached: now,
          datauri: `data:${image.type};base64,${imageB64}`
        }
        this.imageCache[image.url] = cacheItem;
        imageDictionary[image.url] = cacheItem.datauri;
      } catch (err) {
        this.env.error(context, `Failed to download image ${image.url}: ${err.message}`);
      }
    }

    return imageDictionary;
  }

  functionCache: IMap<DynamicContentWithContext> = {};
  makeDynamicSectionFunction(context: ConnectorContext<any>, code: string): any {
    const hash = Crypto.createHash('sha1').update(code).digest('base64');
    return (currentPage: number, pageCount: number, pageSize: ContextPageSize) => {
      if (!(hash in this.functionCache)) {
        this.functionCache[hash] = new Function('context', 'currentPage', 'pageCount', 'pageSize', code) as DynamicContentWithContext;
      }
      return this.functionCache[hash](context, currentPage, pageCount, pageSize);
    }
  }

  generatePdf(context: ConnectorContext<any>, definition: TDocumentDefinitions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const pdfDoc = this.printer.createPdfKitDocument(definition);

      const chunks: any[] = [];
      pdfDoc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      pdfDoc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });

      pdfDoc.end();
    });
  }
}

export interface PdfDoerConfig {
  fonts?: TFontDictionary;
}

export interface PdfTaskConfig {
  definition: TDocumentDefinitions;
  images?: (ImageItem | string)[];
  headerFunction?: string;
  footerFunction?: string;
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

export type DynamicContentWithContext = (context: ConnectorContext<any>, pageNumber: number, pageCount: number, pageSize: ContextPageSize) => Content | null | undefined;