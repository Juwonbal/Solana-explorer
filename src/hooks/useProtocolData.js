// hooks/useProtocolData.js
import { useEffect, useState } from 'react';

const protocolEndpoints = {
  jupiter: 'https://api.llama.fi/protocol/jupiter',
  tensor: 'https://api.llama.fi/protocol/tensor',
  helium: 'https://api.llama.fi/protocol/helium',
};

export default function useProtocolData() {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const entries = await Promise.all(
        Object.entries(protocolEndpoints).map(async ([key, url]) => {
          try {
            const res = await fetch(url);
            const json = await res.json();
            console.log(`Fetched data for ${key}:`, json);
            return [key, { tvl: json.chainTvls?.Solana || json.tvl || 0 }];
          } catch (err) {
            console.error(`Error fetching ${key}:`, err);
            return [key, { tvl: 0 }];
          }
        })
      );
      setData(Object.fromEntries(entries));
    };

    fetchData();
  }, []);

  return data;
}
