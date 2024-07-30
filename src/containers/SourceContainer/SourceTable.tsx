/* eslint-disable react-hooks/exhaustive-deps */
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { CardTable } from '@/containers/CardTableContainer/CardTable';
import { CardItem } from '@/pages/Card';
import qs from 'qs';

export const SourceTable = ({
  tags,
  categories,
}: {
  tags: string[];
  categories: string[];
}): JSX.Element => {
  const [data, setData] = useState<CardItem[]>([]);
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
            category_id: categories,
            additional_tag_id: tags,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
          },
          headers: {
            Authorization: TOKEN(),
          },
        });
        if (res.data.length < 50) {
          setStopLoad(true);
        }
        setData((prevData) => [
          ...prevData,
          ...res.data.map((elem: CardItem) => ({
            ...elem,
            card: { ...elem?.marketplace_card, ...elem?.card },
          })),
        ]);
        setSkip((prevSkip) => prevSkip + 50);
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  }, [loading, stopLoad, skip, data]);

  useEffect(() => {
    setData([]);
    setStopLoad(false);
    setSkip(0);
  }, [categories, tags]);

  useEffect(() => {
    if (!data?.length) {
      loadMore();
    }
  }, [data]);

  return <CardTable data={data} loadMore={loadMore} stopLoad={stopLoad} />;
};

