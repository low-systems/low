import { QuerystringParser } from './querystring-parser';

test('should parse valid querystrings to an object', async () => {
  const parser = new QuerystringParser();

  const querystring = 'test1=I&test1=am&test1=test&test2=It+worked';
  const parsed = {
    test1: ['I', 'am', 'test'],
    test2: 'It worked'
  }

  expect(await parser.parse(`https://test.com/test?${querystring}`, {})).toMatchObject(parsed);
  expect(await parser.parse(`/test?${querystring}`, {})).toMatchObject(parsed);
  expect(await parser.parse(`?${querystring}`, {})).toMatchObject(parsed);
  expect(await parser.parse(`${querystring}`, {})).toMatchObject(parsed);
});

test('should parse valid querystrings with different separator and equals signs to an object', async () => {
  const parser = new QuerystringParser();

  const querystring = 'test1:I;test1:am;test1:test;test2:It+worked';
  const parsed = {
    test1: ['I', 'am', 'test'],
    test2: 'It worked'
  }

  expect(await parser.parse(`https://test.com/test?${querystring}`, { equals: ':', separator: ';' })).toMatchObject(parsed);
  expect(await parser.parse(`/test?${querystring}`, { equals: ':', separator: ';' })).toMatchObject(parsed);
  expect(await parser.parse(`?${querystring}`, { equals: ':', separator: ';' })).toMatchObject(parsed);
  expect(await parser.parse(`${querystring}`, { equals: ':', separator: ';' })).toMatchObject(parsed);
});

test('should not attempt to parse invalid querystrings', async () => {
  const parser = new QuerystringParser();

  const defaultValue = { test: 'It worked!' };

  await expect(parser.parse({}, {})).rejects.toThrow(/can only be used on strings/);
  expect(await parser.parse({}, { defaultValue })).toStrictEqual(defaultValue);
});