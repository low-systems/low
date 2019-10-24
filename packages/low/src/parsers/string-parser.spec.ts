import { StringParser } from './string-parser';

test('should parse booleans to strings', async () => {
  const parser = new StringParser();

  expect(await parser.parse(true, {})).toBe('true');
  expect(await parser.parse(false, {})).toBe('false');
});

test('should parse booleans to strings with true/falseString replacements', async () => {
  const parser = new StringParser();

  expect(await parser.parse(true, { trueString: 'Yes' })).toBe('Yes');
  expect(await parser.parse(true, { trueString: 'Yes', falseString: 'No' })).toBe('Yes');
  expect(await parser.parse(true, { falseString: 'No' })).toBe('true');
  expect(await parser.parse(false, { trueString: 'Yes' })).toBe('false');
  expect(await parser.parse(false, { trueString: 'Yes', falseString: 'No' })).toBe('No');
  expect(await parser.parse(false, { falseString: 'No' })).toBe('No');
});

test('should parse undefined to empty string or null replacement', async () => {
  const parser = new StringParser();

  expect(await parser.parse(undefined, {})).toBe('');
  expect(await parser.parse(undefined, { undefinedString: 'NULL' })).toBe('NULL');
});

test('should parse numbers to strings', async () => {
  const parser = new StringParser();

  expect(await parser.parse(0, {})).toBe('0');
  expect(await parser.parse(123, {})).toBe('123');
  expect(await parser.parse(-123, {})).toBe('-123');
  expect(await parser.parse(1234567890, {})).toBe('1234567890');
  expect(await parser.parse(-1234567890, {})).toBe('-1234567890');
  expect(await parser.parse(123.321, {})).toBe('123.321');
  expect(await parser.parse(-123.321, {})).toBe('-123.321');
  expect(await parser.parse(1234567890.0987654321, {})).toBe('1234567890.0987654');
  expect(await parser.parse(-1234567890.0987654321, {})).toBe('-1234567890.0987654');
  expect(await parser.parse(4e4, {})).toBe('40000');
});

test('should parse numbers to strings using toExponential', async () => {
  const parser = new StringParser();

  expect(await parser.parse(0, { numberFunction: 'toExponential' })).toBe('0e+0');
  expect(await parser.parse(0, { numberFunction: 'toExponential', fractionDigits: 4 })).toBe('0.0000e+0');
  expect(await parser.parse(123, { numberFunction: 'toExponential' })).toBe('1.23e+2');
  expect(await parser.parse(123, { numberFunction: 'toExponential', fractionDigits: 4 })).toBe('1.2300e+2');
  expect(await parser.parse(-123, { numberFunction: 'toExponential' })).toBe('-1.23e+2');
  expect(await parser.parse(-123, { numberFunction: 'toExponential', fractionDigits: 4 })).toBe('-1.2300e+2');
  expect(await parser.parse(1234567890, { numberFunction: 'toExponential' })).toBe('1.23456789e+9');
  expect(await parser.parse(1234567890, { numberFunction: 'toExponential', fractionDigits: 4 })).toBe('1.2346e+9');
  expect(await parser.parse(-1234567890, { numberFunction: 'toExponential' })).toBe('-1.23456789e+9');
  expect(await parser.parse(-1234567890, { numberFunction: 'toExponential', fractionDigits: 4 })).toBe('-1.2346e+9');
  expect(await parser.parse(123.321, { numberFunction: 'toExponential' })).toBe('1.23321e+2');
  expect(await parser.parse(123.321, { numberFunction: 'toExponential', fractionDigits: 4 })).toBe('1.2332e+2');
  expect(await parser.parse(-123.321, { numberFunction: 'toExponential' })).toBe('-1.23321e+2');
  expect(await parser.parse(-123.321, { numberFunction: 'toExponential', fractionDigits: 4 })).toBe('-1.2332e+2');
  expect(await parser.parse(1234567890.0987654321, { numberFunction: 'toExponential' })).toBe('1.2345678900987654e+9');
  expect(await parser.parse(1234567890.0987654321, { numberFunction: 'toExponential', fractionDigits: 4 })).toBe('1.2346e+9');
  expect(await parser.parse(-1234567890.0987654321, { numberFunction: 'toExponential' })).toBe('-1.2345678900987654e+9');
  expect(await parser.parse(-1234567890.0987654321, { numberFunction: 'toExponential', fractionDigits: 4 })).toBe('-1.2346e+9');
  expect(await parser.parse(4e4, { numberFunction: 'toExponential' })).toBe('4e+4');
  expect(await parser.parse(4e4, { numberFunction: 'toExponential', fractionDigits: 4 })).toBe('4.0000e+4');
});

test('should parse numbers to strings using toFixed', async () => {
  const parser = new StringParser();

  expect(await parser.parse(0, { numberFunction: 'toFixed' })).toBe('0');
  expect(await parser.parse(0, { numberFunction: 'toFixed', fractionDigits: 4 })).toBe('0.0000');
  expect(await parser.parse(123, { numberFunction: 'toFixed' })).toBe('123');
  expect(await parser.parse(123, { numberFunction: 'toFixed', fractionDigits: 4 })).toBe('123.0000');
  expect(await parser.parse(-123, { numberFunction: 'toFixed' })).toBe('-123');
  expect(await parser.parse(-123, { numberFunction: 'toFixed', fractionDigits: 4 })).toBe('-123.0000');
  expect(await parser.parse(1234567890, { numberFunction: 'toFixed' })).toBe('1234567890');
  expect(await parser.parse(1234567890, { numberFunction: 'toFixed', fractionDigits: 4 })).toBe('1234567890.0000');
  expect(await parser.parse(-1234567890, { numberFunction: 'toFixed' })).toBe('-1234567890');
  expect(await parser.parse(-1234567890, { numberFunction: 'toFixed', fractionDigits: 4 })).toBe('-1234567890.0000');
  expect(await parser.parse(123.321, { numberFunction: 'toFixed' })).toBe('123');
  expect(await parser.parse(123.321, { numberFunction: 'toFixed', fractionDigits: 1 })).toBe('123.3');
  expect(await parser.parse(123.56, { numberFunction: 'toFixed', fractionDigits: 1 })).toBe('123.6');
  expect(await parser.parse(-123.321, { numberFunction: 'toFixed' })).toBe('-123');
  expect(await parser.parse(-123.321, { numberFunction: 'toFixed', fractionDigits: 1 })).toBe('-123.3');
  expect(await parser.parse(-123.56, { numberFunction: 'toFixed', fractionDigits: 1 })).toBe('-123.6');
  expect(await parser.parse(1234567890.0987654321, { numberFunction: 'toFixed' })).toBe('1234567890');
  expect(await parser.parse(1234567890.0987654321, { numberFunction: 'toFixed', fractionDigits: 1 })).toBe('1234567890.1');
  expect(await parser.parse(-1234567890.0987654321, { numberFunction: 'toFixed' })).toBe('-1234567890');
  expect(await parser.parse(-1234567890.0987654321, { numberFunction: 'toFixed', fractionDigits: 1 })).toBe('-1234567890.1');
  expect(await parser.parse(4e4, { numberFunction: 'toFixed' })).toBe('40000');
  expect(await parser.parse(4e4, { numberFunction: 'toFixed', fractionDigits: 4 })).toBe('40000.0000');
});

test('should parse numbers to strings using toLocaleString', async () => {
  const parser = new StringParser();

  //Using `testVal` over `£ 123,456.79` is a hack but Jest keeps telling me that `£ 123,456.79` does not equal `£ 123,456.79`
  const testVal = await parser.parse(123456.789, { numberFunction: 'toLocaleString', localeOptions: { style: 'currency', currency: 'GBP' } });

  expect(await parser.parse(123456789, { numberFunction: 'toLocaleString', locales: 'en-GB' })).toBe('123,456,789');
  expect(await parser.parse(123456.654321, { numberFunction: 'toLocaleString', locales: 'en-GB' })).toBe('123,456.654');
  expect(await parser.parse(123456.789, { numberFunction: 'toLocaleString', localeOptions: { style: 'currency', currency: 'GBP' }})).toBe(testVal);
  expect(await parser.parse(123456.789, { numberFunction: 'toLocaleString', localeOptions: { maximumSignificantDigits: 3 }})).toBe('123,000');

  //TODO: Internationalisation is not available in stock Node.js without dependencies
  //and one of the aims of the core `low` package is that is has zero dependencies.
  //Leaving these commented out in case we decide to include it or use a different
  //"browser mocking" test framework is used.

  //expect(await parser.parse(123456789, { numberFunction: 'toLocaleString', locales: 'de-DE' })).toBe('123.456.789');
});

test('should parse numbers to strings using toPrecision', async () => {
  const parser = new StringParser();

  expect(await parser.parse(0, { numberFunction: 'toPrecision' })).toBe('0');
  expect(await parser.parse(0, { numberFunction: 'toPrecision', precision: 4 })).toBe('0.000');
  expect(await parser.parse(123, { numberFunction: 'toPrecision' })).toBe('123');
  expect(await parser.parse(123, { numberFunction: 'toPrecision', precision: 4 })).toBe('123.0');
  expect(await parser.parse(-123, { numberFunction: 'toPrecision' })).toBe('-123');
  expect(await parser.parse(-123, { numberFunction: 'toPrecision', precision: 4 })).toBe('-123.0');
  expect(await parser.parse(1234567890, { numberFunction: 'toPrecision' })).toBe('1234567890');
  expect(await parser.parse(1234567890, { numberFunction: 'toPrecision', precision: 4 })).toBe('1.235e+9');
  expect(await parser.parse(-1234567890, { numberFunction: 'toPrecision' })).toBe('-1234567890');
  expect(await parser.parse(-1234567890, { numberFunction: 'toPrecision', precision: 4 })).toBe('-1.235e+9');
  expect(await parser.parse(123.321, { numberFunction: 'toPrecision' })).toBe('123.321');
  expect(await parser.parse(123.321, { numberFunction: 'toPrecision', precision: 1 })).toBe('1e+2');
  expect(await parser.parse(123.56, { numberFunction: 'toPrecision', precision: 1 })).toBe('1e+2');
  expect(await parser.parse(-123.321, { numberFunction: 'toPrecision' })).toBe('-123.321');
  expect(await parser.parse(-123.321, { numberFunction: 'toPrecision', precision: 1 })).toBe('-1e+2');
  expect(await parser.parse(-123.56, { numberFunction: 'toPrecision', precision: 1 })).toBe('-1e+2');
  expect(await parser.parse(1234567890.0987654321, { numberFunction: 'toPrecision' })).toBe('1234567890.0987654');
  expect(await parser.parse(1234567890.0987654321, { numberFunction: 'toPrecision', precision: 5 })).toBe('1.2346e+9');
  expect(await parser.parse(-1234567890.0987654321, { numberFunction: 'toPrecision' })).toBe('-1234567890.0987654');
  expect(await parser.parse(-1234567890.0987654321, { numberFunction: 'toPrecision', precision: 5 })).toBe('-1.2346e+9');
  expect(await parser.parse(4e4, { numberFunction: 'toPrecision' })).toBe('40000');
  expect(await parser.parse(4e4, { numberFunction: 'toPrecision', precision: 4 })).toBe('4.000e+4');
});

test('should parse numbers to strings using toString', async () => {
  const parser = new StringParser();

  expect(await parser.parse(0, { numberFunction: 'toString' })).toBe('0');
  expect(await parser.parse(0, { numberFunction: 'toString', radix: 16 })).toBe('0');
  expect(await parser.parse(42, { numberFunction: 'toString' })).toBe('42');
  expect(await parser.parse(-42, { numberFunction: 'toString' })).toBe('-42');
  expect(await parser.parse(42, { numberFunction: 'toString', radix: 16 })).toBe('2a');
  expect(await parser.parse(-42, { numberFunction: 'toString', radix: 16 })).toBe('-2a');
  expect(await parser.parse(42.5, { numberFunction: 'toString' })).toBe('42.5');
  expect(await parser.parse(-42.5, { numberFunction: 'toString' })).toBe('-42.5');
  expect(await parser.parse(42.5, { numberFunction: 'toString', radix: 16 })).toBe('2a.8');
  expect(await parser.parse(-42.5, { numberFunction: 'toString', radix: 16 })).toBe('-2a.8');
  expect(await parser.parse(1234567890, { numberFunction: 'toString' })).toBe('1234567890');
  expect(await parser.parse(1234567890, { numberFunction: 'toString', radix: 16 })).toBe('499602d2');
});

test('should parse objects to serialised strings', async () => {
  const parser = new StringParser();

  const testObject = {
    obj: {
      test1: 'It worked',
      test2: ['It', 'worked']
    },
    nothing: null,
    neverSet: undefined,
    number: 12345
  };

  const testArray = [
    { test: 'It worked' },
    null,
    undefined,
    12345,
    ['It', 'worked']
  ];

  expect(await parser.parse(testObject, {})).toBe(`{"obj":{"test1":"It worked","test2":["It","worked"]},"nothing":null,"number":12345}`);
  expect(await parser.parse(testArray, {})).toBe(`[{"test":"It worked"},null,null,12345,["It","worked"]]`);

  expect(await parser.parse(testObject, { spaces: 2})).toBe(`{
  "obj": {
    "test1": "It worked",
    "test2": [
      "It",
      "worked"
    ]
  },
  "nothing": null,
  "number": 12345
}`);
  expect(await parser.parse(testArray, { spaces: 2 })).toBe(`[
  {
    "test": "It worked"
  },
  null,
  null,
  12345,
  [
    "It",
    "worked"
  ]
]`);
});

test('should echo strings', async () => {
  const parser = new StringParser();

  expect(await parser.parse('', {})).toBe('');
  expect(await parser.parse('test', {})).toBe('test');
});

test('should throw and handle circular objects', async () => {
  const parser = new StringParser();

  const test: any = { test:  42 };
  test.myself = test;

  await expect(parser.parse(test, {})).rejects.toThrow(/circular structure/);
  expect(await parser.parse(test, { defaultValue: 'It worked' })).toBe('It worked');
});