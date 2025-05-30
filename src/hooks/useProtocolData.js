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
            const tvl =
  json.tvl ||
  Object.values(json.chainTvls || {})[0]?.tvl ||
  Object.values(json.currentChainTvls || {})[0]?.tvl ||
  0;

return [key, { tvl }];
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
