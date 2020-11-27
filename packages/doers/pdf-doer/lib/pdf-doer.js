"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfDoer = void 0;
const pdfmake_1 = __importDefault(require("pdfmake"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const low_1 = require("low");
class PdfDoer extends low_1.Doer {
    constructor() {
        super(...arguments);
        this.imageCache = {};
        this.functionCache = {};
    }
    get printer() {
        if (!this._printer) {
            throw new Error('PDF Make is not available, has the module been initialised properly yet?');
        }
        return this._printer;
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
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
            this._printer = new pdfmake_1.default(fonts);
        });
    }
    main(context, taskConfig, coreConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            coreConfig.definition.images = yield this.fetchImages(context, coreConfig.images);
            if (typeof coreConfig.headerFunction === 'string') {
                coreConfig.definition.header = this.makeDynamicSectionFunction(context, coreConfig.headerFunction);
            }
            if (typeof coreConfig.footerFunction === 'string') {
                coreConfig.definition.footer = this.makeDynamicSectionFunction(context, coreConfig.footerFunction);
            }
            const pdfData = this.generatePdf(context, coreConfig.definition);
            return pdfData;
        });
    }
    fetchImages(context, images) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!images)
                return {};
            const imageDictionary = {};
            const now = +new Date();
            const toDownload = [];
            for (const image of images) {
                const url = typeof image === 'string' ? image : image.url;
                if (!(url in this.imageCache) || this.imageCache[url].expires < now) {
                    toDownload.push(typeof image === 'string' ? { url } : image);
                }
                else {
                    imageDictionary[url] = this.imageCache[url].datauri;
                }
            }
            for (const image of toDownload) {
                try {
                    const response = yield axios_1.default.get(image.url, { responseType: 'arraybuffer' });
                    image.type = image.type || response.headers['content-type'] || 'image/jpeg';
                    const imageB64 = Buffer.from(response.data, 'binary').toString('base64');
                    const cacheItem = Object.assign(Object.assign({}, image), { expires: now + (image.ttl || 3600), cached: now, datauri: `data:${image.type};base64,${imageB64}` });
                    this.imageCache[image.url] = cacheItem;
                    imageDictionary[image.url] = cacheItem.datauri;
                }
                catch (err) {
                    this.env.error(context, `Failed to download image ${image.url}: ${err.message}`);
                }
            }
            return imageDictionary;
        });
    }
    makeDynamicSectionFunction(context, code) {
        const hash = crypto_1.default.createHash('sha1').update(code).digest('base64');
        return (currentPage, pageCount, pageSize) => {
            if (!(hash in this.functionCache)) {
                this.functionCache[hash] = new Function('context', 'currentPage', 'pageCount', 'pageSize', code);
            }
            return this.functionCache[hash](context, currentPage, pageCount, pageSize);
        };
    }
    generatePdf(context, definition) {
        return new Promise((resolve, reject) => {
            const pdfDoc = this.printer.createPdfKitDocument(definition);
            const chunks = [];
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
exports.PdfDoer = PdfDoer;
//# sourceMappingURL=pdf-doer.js.map