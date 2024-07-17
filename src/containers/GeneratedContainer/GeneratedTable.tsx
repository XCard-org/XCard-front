import { Card } from '@/pages/Source';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { CardTable } from '@/containers/CardTableContainer/CardTable';

export const GeneratedTable = (): JSX.Element => {
  const [data, setData] = useState<Card[]>([]);

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/marketplacecard/`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      // @ts-expect-error no err
      .then((res) => setData(res.data.map((elem) => elem.card)));
  }, []);

  return <CardTable data={data} />;
};

