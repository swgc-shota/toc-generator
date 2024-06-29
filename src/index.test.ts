import { isValidHeadingHierarchy } from './index';

describe('isValidHeadingHierarchy', () => {
  it('should return true for valid heading hierarchy', () => {
    document.body.innerHTML = `
      <div id="content">
        <h1>Title</h1>
        <h2>Subtitle 1</h2>
        <h3>Subtitle 2</h3>
        <h2>Subtitle 3</h2>
        <h1>Another Title</h1>
      </div>
    `;
    const rootElement = document.getElementById('content') as HTMLElement;
    const headings = Array.from(
      rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ) as HTMLHeadingElement[];
    expect(isValidHeadingHierarchy(headings)).toBe(true);
  });

  it('should return false if headings are to be skipped', () => {
    document.body.innerHTML = `
      <div id="content">
        <h1>Title</h1>
        <h3>Invalid Subtitle</h3>
        <h2>Subtitle 1</h2>
        <h4>Invalid Subtitle</h4>
      </div>
    `;
    const rootElement = document.getElementById('content') as HTMLElement;
    const headings = Array.from(
      rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ) as HTMLHeadingElement[];
    expect(isValidHeadingHierarchy(headings)).toBe(false);
  });

  it('should return false if the second or subsequent headings are too shallow', () => {
    document.body.innerHTML = `
      <div id="content">
        <h2>Title</h1>
        <h1>Invalid Subtitle</h1>
      </div>
    `;
    const rootElement = document.getElementById('content') as HTMLElement;
    const headings = Array.from(
      rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ) as HTMLHeadingElement[];
    expect(isValidHeadingHierarchy(headings)).toBe(false);
  });

  it('should handle empty headings', () => {
    document.body.innerHTML = `<div id="content"></div>`;
    const rootElement = document.getElementById('content') as HTMLElement;
    const headings = Array.from(
      rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ) as HTMLHeadingElement[];
    expect(isValidHeadingHierarchy(headings)).toBe(true);
  });
});

import { generateTOC } from './index';

describe('generateTOC', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should return an error string for invalid heading hierarchy', () => {
    document.body.innerHTML = `
      <div id="content">
        <h1>Title</h1>
        <h3>Invalid Subtitle</h3>
      </div>
    `;
    console.warn = jest.fn();
    const rootElement = document.getElementById('content') as HTMLElement;
    const toc = generateTOC(rootElement);
    expect(toc).toBe('');
    expect(console.warn).toHaveBeenCalledWith('Invalid heading hierarchy');
  });

  it('should generate a nested TOC for valid heading hierarchy', () => {
    document.body.innerHTML = `
      <div id="content">
        <h1>1</h1>
        <h2>1-1</h2>
        <h3>1-1-1</h3>
        <h2>1-2</h3>
        <h1>2</h1>
      </div>
    `;
    const rootElement = document.getElementById('content') as HTMLElement;
    const toc = generateTOC(rootElement) as HTMLUListElement;

    expect(toc).toBeInstanceOf(HTMLUListElement);
    expect(toc.querySelectorAll('a').length).toBe(5);
    expect(toc.querySelector('a[href="#toc-0"]')?.textContent).toBe('1');
    expect(toc.querySelector('a[href="#toc-1"]')?.textContent).toBe('1-1');
    expect(toc.querySelector('a[href="#toc-2"]')?.textContent).toBe('1-1-1');
    expect(toc.querySelector('a[href="#toc-3"]')?.textContent).toBe('1-2');
    expect(toc.querySelector('a[href="#toc-4"]')?.textContent).toBe('2');
    expect(toc.outerHTML).toBe(
      '<ul><li><a href="#toc-0">1</a><ul><li><a href="#toc-1">1-1</a><ul><li><a href="#toc-2">1-1-1</a></li></ul></li><li><a href="#toc-3">1-2</a></li></ul></li><li><a href="#toc-4">2</a></li></ul>'
    );
  });

  it('should handle empty container', () => {
    document.body.innerHTML = `<div id="content"></div>`;
    console.warn = jest.fn();
    const rootElement = document.getElementById('content') as HTMLElement;
    const toc = generateTOC(rootElement) as HTMLUListElement;
    expect(toc).toBe('');
    expect(console.warn).toHaveBeenCalledWith('Empty container');
  });

  it('should assign IDs to headings without IDs', () => {
    document.body.innerHTML = `
      <div id="content">
        <h1>Title</h1>
        <h2>Subtitle 1</h2>
      </div>
    `;
    const rootElement = document.getElementById('content') as HTMLElement;
    generateTOC(rootElement);

    expect(document.getElementById('toc-0')).toBeTruthy();
    expect(document.getElementById('toc-1')).toBeTruthy();
  });

  it('should generate nested TOC with correct hierarchy', () => {
    document.body.innerHTML = `
      <div id="content">
        <h2>1</h2>
        <h3>1-1</h3>
        <h2>2</h2>
        <h2>3</h2>
        <h3>3-1</h3>
      </div>
    `;
    const rootElement = document.getElementById('content') as HTMLElement;
    const toc = generateTOC(rootElement) as HTMLUListElement;
    expect(toc.outerHTML).toBe(
      '<ul><li><a href="#toc-0">1</a><ul><li><a href="#toc-1">1-1</a></li></ul></li><li><a href="#toc-2">2</a></li><li><a href="#toc-3">3</a><ul><li><a href="#toc-4">3-1</a></li></ul></li></ul>'
    );
  });
});

describe('generateLinkList', () => {
  it('should return an empty string if headings have the wrong hierarchy', () => {
    document.body.innerHTML = `
    <div id="content">
      <h2>1</h2>
      <h3>1-1</h3>
      <h1>2</h1>
    </div>
  `;
    const rootElement = document.getElementById('content') as HTMLElement;
    const toc = generateTOC(rootElement) as HTMLUListElement;
    expect(toc).toBe('');
  });
});
