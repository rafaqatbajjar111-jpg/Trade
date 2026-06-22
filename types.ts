// Import React to provide access to the React namespace for ReactNode type
import React from 'react';

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
  history: { time: string; price: number }[];
}

export interface UserWallet {
  mainBalance: number;
  tradingBalance: number;
  totalDeposit: number;
  totalWithdraw: number;
  todayProfit: number;
  holdings: Holding[];
}

export interface Holding {
  assetId: string;
  amount: number;
  avgPrice: number;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}