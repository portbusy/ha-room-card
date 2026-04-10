import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex } from '../../../src/editor/utils/colorConvert.js';

describe('hexToRgb', () => {
  it('converte hex verde accent in rgb', () => {
    expect(hexToRgb('#4E8062')).toEqual([78, 128, 98]);
  });

  it('converte nero', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });

  it('converte bianco', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
  });

  it('converte rosso puro', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
  });
});

describe('rgbToHex', () => {
  it('converte rgb verde accent in hex minuscolo', () => {
    expect(rgbToHex([78, 128, 98])).toBe('#4e8062');
  });

  it('converte nero', () => {
    expect(rgbToHex([0, 0, 0])).toBe('#000000');
  });

  it('converte bianco', () => {
    expect(rgbToHex([255, 255, 255])).toBe('#ffffff');
  });

  it('arrotonda valori float', () => {
    expect(rgbToHex([78.4, 128.6, 98.2])).toBe('#4e8162');
  });
});

describe('round-trip', () => {
  it('hexToRgb → rgbToHex restituisce hex minuscolo equivalente', () => {
    expect(rgbToHex(hexToRgb('#4E8062'))).toBe('#4e8062');
  });

  it('funziona con colori casuali', () => {
    expect(rgbToHex(hexToRgb('#1a2b3c'))).toBe('#1a2b3c');
  });
});
