import { NextResponse } from 'next/server';

// 60-second revalidation to prevent CoinGecko Rate Limits (429)
export const revalidate = 60;

// Hardcoded safe fallbacks in case ALL APIs are blocked (e.g. by Nigerian ISP DNS filtering)
const FALLBACK_PRICES: Record<string, number> = {
    BTC: 64500.00,
    ETH: 3450.00,
    BNB: 600.00,
    SOL: 145.00,
    TRX: 0.15,
    MATIC: 0.45,
    AVAX: 25.00,
    USDT: 1.00,
    USDC: 1.00
};

export async function GET() {
    let prices = { ...FALLBACK_PRICES };

    try {
        // CoinGecko API (Not blocked by most ISPs, but heavily rate-limited, hence revalidate=60)
        const cgRes = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tron,binancecoin,solana,matic-network,avalanche-2,tether,usd-coin&vs_currencies=usd',
            { next: { revalidate: 60 } }
        );
        
        if (cgRes.ok) {
            const data = await cgRes.json();
            if (data.bitcoin?.usd) prices.BTC = data.bitcoin.usd;
            if (data.ethereum?.usd) prices.ETH = data.ethereum.usd;
            if (data.tron?.usd) prices.TRX = data.tron.usd;
            if (data['binancecoin']?.usd) prices.BNB = data['binancecoin'].usd;
            if (data.solana?.usd) prices.SOL = data.solana.usd;
            if (data['matic-network']?.usd) prices.MATIC = data['matic-network'].usd;
            if (data['avalanche-2']?.usd) prices.AVAX = data['avalanche-2'].usd;
            if (data.tether?.usd) prices.USDT = data.tether.usd;
            if (data['usd-coin']?.usd) prices.USDC = data['usd-coin'].usd;
            
            return NextResponse.json(prices);
        }
    } catch (e) {
        console.error("CoinGecko Fetch Error:", e);
    }

    try {
        // Fallback: CryptoCompare API (Might be DNS blocked, but good if reachable)
        const ccRes = await fetch(
            'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,TRX,BNB,SOL,MATIC,AVAX,USDT,USDC&tsyms=USD',
            { next: { revalidate: 60 } }
        );
        if (ccRes.ok) {
            const data = await ccRes.json();
            if (data.BTC) prices.BTC = data.BTC.USD;
            if (data.ETH) prices.ETH = data.ETH.USD;
            if (data.TRX) prices.TRX = data.TRX.USD;
            if (data.BNB) prices.BNB = data.BNB.USD;
            if (data.SOL) prices.SOL = data.SOL.USD;
            if (data.MATIC) prices.MATIC = data.MATIC.USD;
            if (data.AVAX) prices.AVAX = data.AVAX.USD;
            if (data.USDT) prices.USDT = data.USDT.USD;
            if (data.USDC) prices.USDC = data.USDC.USD;
            
            return NextResponse.json(prices);
        }
    } catch (e) {
         console.error("CryptoCompare Fetch Error:", e);
    }

    // Ultimate fallback: static prices
    return NextResponse.json(prices);
}
