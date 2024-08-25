import axios from 'axios';

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  daily_volume: number;
}

export async function loadTokenList(tokenList: Token[]): Promise<void> {
  const response = await axios.get<Token[]>('https://tokens.jup.ag/tokens?tags=verified');
  tokenList.push(...response.data);
}

export async function loadMissingToken(tokenList: Token[], tokenAddress: string): Promise<void> {
  const response = await axios.get<Token>('https://tokens.jup.ag/token/'+tokenAddress);
  tokenList.push(response.data);
}