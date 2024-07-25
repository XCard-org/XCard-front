import { Card } from '@/pages/Source';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { CardTable } from '@/containers/CardTableContainer/CardTable';

export const SourceTable = (): JSX.Element => {
  const [data, setData] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const [stopLoad, setStopLoad] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!stopLoad && skip === data.length) {
        const res = await axios.get(`${SERVER_ADDRESS}/api/v1/card/`, {
          params: {
            skip,
            limit: skip + 50,
          },
          headers: {
            Authorization: TOKEN(),
          },
        });
        if (res.data.length < 50) {
          setStopLoad(true);
        }
        setData((prevData) => [...prevData, ...res.data.map((elem: { card: Card }) => elem.card)]);
        setSkip((prevSkip) => prevSkip + 50);
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  }, [loading, stopLoad, skip, data]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  return <CardTable data={data} loadMore={loadMore} stopLoad={stopLoad} />;
};

