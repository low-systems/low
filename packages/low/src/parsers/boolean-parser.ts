import { Parser, ParserConfig } from './parser';

export class BooleanParser extends Parser<boolean> {
  //Translations of the words "True" and "Yes" in 89 languages
  //made using https://translatr.varunmalhotra.xyz/ with a couple
  //of extra English options thrown in. Not a perfect solution
  //but a reasonable start
  trueStrings: string[] = [
    'true', 'yes', 'ok', 'correct', '1', 'waar', 'صحيح', 'doğru', 'праўда',
    'вярно', 'সত্য', 'istinito', 'veritat', 'tinuod', 'skutečný', 'gwir',
    'rigtigt', 'wahr', 'αληθής', 'cierto', 'tõsi', 'egia', 'درست است',
    'totta', 'vrai', 'fíor', 'verdade', 'સાચું', 'gaskiya', 'सच', 'pravi',
    'vre', 'igaz', 'ճիշտ', 'benar', 'ezi', 'satt', 'vero', 'נכון', '本当の',
    'bener', 'მართალია', 'шын', 'ពិត','ನಿಜ', '참된', 'ຈິງ', 'tiesa', 'taisnība',
    'marina', 'pono', 'точно', 'ശരി', 'үнэн', 'खरे', 'veru', 'စစ်မှန်တဲ့',
    'सत्य', 'ekte', 'zoona', 'ਸਹੀ', 'prawdziwe', 'adevărat', 'правда', 'සැබෑ',
    'pravdivý', 'prav', 'run', 'i vërtetë', 'истина', 'nete', 'leres', 'sann',
    'kweli', 'உண்மை', 'నిజమైన', 'рост', 'จริง', 'totoo', 'вірно', 'سچ',
    'haqiqiy', 'thật', 'otitọ', '真正', 'kuyiqiniso', 'ja', 'نعم فعلا', 'bəli',
    'так', 'да', 'হাঁ', 'da', 'sí', 'oo', 'ano', 'ie', 'ja', 'ναί', 'sí',
    'jah', 'bai', 'بله', 'joo', 'oui', 'tá', 'si', 'હા', 'eh', 'हाँ', 'da',
    'wi', 'igen', 'այո', 'iya nih', 'ee', 'já', 'sì', 'כן', 'はい', 'ya',
    'დიახ', 'иә', 'បាទ', 'ಹೌದು', '예', 'ແມ່ນແລ້ວ', 'taip', 'jā', 'eny', 'ae',
    'да', 'അതെ', 'тийм ээ', 'हो', 'iva', 'ဟုတ်ကဲ့', 'inde', 'ਹਾਂ', 'tak',
    'sim', 'ඔව්', 'áno', 'haa', 'po', 'e', 'enya', 'ndiyo', 'ஆம்', 'అవును',
    'ҳа', 'ใช่', 'evet', 'جی ہاں', 'ha', 'vâng', 'bẹẹni', '是', 'yebo', 'okay',
    'yas', 'yas queen', 'aye'
  ];

  async parse(input: any, config: BooleanParserConfig): Promise<boolean> {
    try {
      if (config.interperateStrings && typeof input === 'string') {
        if (Array.isArray(config.interperateStrings)) {
          return config.interperateStrings.includes(input.toLowerCase());
        } else if (config.interperateStrings.hasOwnProperty('regex')) {
          const regex = new RegExp((config.interperateStrings as RegularExpression).regex, (config.interperateStrings as RegularExpression).options || 'ig');
          return regex.test(input);
        } else {
          return this.trueStrings.includes(input.toLowerCase());
        }
      } else if (config.emptyObjectsAsFalse && typeof input === 'object') {
        if (Array.isArray(input)) {
          if (config.removeObjectNullValues) {
            return input.filter(item => item !== null && typeof item !== 'undefined').length > 0;
          } else {
            return input.length > 0;
          }
        } else {
          if (config.removeObjectNullValues) {
            return Object.values(input).filter(value => value !== null && typeof value !== 'undefined').length > 0;
          } else {
            return Object.keys(input).length > 0;
          }
        }
      } else {
        return Boolean(input);
      }
    } catch (err) {
      if (typeof config.defaultValue === 'boolean') {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}

export interface BooleanParserConfig extends ParserConfig<boolean> {
  interperateStrings?: boolean|RegularExpression|string[];
  emptyObjectsAsFalse?: boolean;
  removeObjectNullValues?: boolean;
}

export interface RegularExpression {
  regex: string;
  options?: string;
}