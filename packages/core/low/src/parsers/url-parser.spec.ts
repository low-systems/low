import { URL } from 'url';

import { UrlParser } from './url-parser';

test('should parse valid url to instance of URL', async () => {
  const parser = new UrlParser();

  const testUrl = 'https://user:pass@test.low.systems:8080/some/path?query=string&array=item1&array=item2#anchor';
  const url = await parser.parse(testUrl, {});

  expect(url.hash).toBe('#anchor');
  expect(url.host).toBe('test.low.systems:8080');
  expect(url.hostname).toBe('test.low.systems');
  expect(url.href).toBe(testUrl);
  expect(url.origin).toBe('https://test.low.systems:8080');
  expect(url.password).toBe('pass');
  expect(url.pathname).toBe('/some/path');
  expect(url.port).toBe('8080');
  expect(url.protocol).toBe('https:');
  expect(url.search).toBe('?query=string&array=item1&array=item2');
  expect(url.searchParams.get('query')).toBe('string');
  expect(url.searchParams.getAll('array')).toEqual(['item1', 'item2']);
  expect(url.username).toBe('user');
});

test('should parse valid url input and base to instance of URL', async () => {
  const parser = new UrlParser();

  const testUrl = '/some/path?query=string&array=item1&array=item2#anchor';
  const testBase = 'https://user:pass@test.low.systems:8080';
  const url = await parser.parse(testUrl, { base: testBase });

  expect(url.hash).toBe('#anchor');
  expect(url.host).toBe('test.low.systems:8080');
  expect(url.hostname).toBe('test.low.systems');
  expect(url.href).toBe(testBase + testUrl);
  expect(url.origin).toBe('https://test.low.systems:8080');
  expect(url.password).toBe('pass');
  expect(url.pathname).toBe('/some/path');
  expect(url.port).toBe('8080');
  expect(url.protocol).toBe('https:');
  expect(url.search).toBe('?query=string&array=item1&array=item2');
  expect(url.searchParams.get('query')).toBe('string');
  expect(url.searchParams.getAll('array')).toEqual(['item1', 'item2']);
  expect(url.username).toBe('user');
});

test('should handle invalid url input', async () => {
  const parser = new UrlParser();

  const defaultUrl = new URL('https://user:pass@test.low.systems:8080/some/path?query=string&array=item1&array=item2#anchor');

  await expect(parser.parse('gobbledygook', {})).rejects.toThrow(/Invalid URL/);
  expect(await parser.parse('gobbledygook', { defaultValue: defaultUrl })).toEqual(defaultUrl);
});