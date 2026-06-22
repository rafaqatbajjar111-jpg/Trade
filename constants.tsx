
import React from 'react';
import { CryptoAsset } from './types';

export const MOCK_CRYPTO_DATA: CryptoAsset[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    price: 81732.00,
    change24h: -4.0,
    volume: '$44,733,446,304',
    marketCap: '$1,627,167,948,354',
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}h`, price: 81000 + Math.random() * 2000 }))
  },
  {
    id: 'ethereum',
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    price: 2534.31,
    change24h: -1.70,
    volume: '$12,433,446,304',
    marketCap: '$307,167,948,354',
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}h`, price: 2400 + Math.random() * 300 }))
  },
  {
    id: 'solana',
    symbol: 'SOL/USDT',
    name: 'Solana',
    price: 127.67,
    change24h: -7.0,
    volume: '$4,733,446,304',
    marketCap: '$57,167,948,354',
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}h`, price: 120 + Math.random() * 15 }))
  },
  {
    id: 'ripple',
    symbol: 'XRP/USDT',
    name: 'XRP',
    price: 0.5768,
    change24h: 0.37,
    volume: '$1,233,446,304',
    marketCap: '$32,167,948,354',
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}h`, price: 0.55 + Math.random() * 0.05 }))
  }
];

export const APP_THEME = {
  primary: '#facc15', // Yellow 400
  secondary: '#eab308', // Yellow 500
  background: '#0a0a0a',
  surface: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
};
