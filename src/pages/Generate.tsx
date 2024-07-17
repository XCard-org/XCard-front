import { Input, Select } from 'antd';
import styles from './Generate.module.scss';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { AddButton } from '@/components/AddButton';
import classNames from 'classnames';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RootPaths } from '@/pages';

type Option = {
  label: string;
  value: string;
  level: number;
};

export const Generate = (): JSX.Element => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState();
  /* const [treeData, setTreeData] = useState<Omit<DefaultOptionType, 'label'>[]>([]);
  const [value, setValue] = useState<string>();*/
  const [trends, setTrends] = useState([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/marketplace/`, {
        params: {
          root: true,
        },
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) =>
        setMarkets(
          res.data.map((elem: { name: string; uid: string }) => ({
            label: elem.name,
            value: elem.uid,
          })),
        ),
      );

    axios
      .get(`${SERVER_ADDRESS}/api/v1/trend/`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        setTrends(
          res.data.map((elem: { title: string; uid: string; strength: number }) => ({
            label: elem.title,
            value: elem.uid,
            level: elem.strength,
          })),
        );
      });
  }, []);

  const [newTrend, setNewTrend] = useState('');

  const onSave = (): void => {
    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/trend/`,
        {
          title: newTrend,
          body: newTrend,
          strength: level,
        },
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .then((res) =>
        // @ts-expect-error npo err
        setTrends((prev) => [
          {
            label: res.data.title,
            value: res.data.uid,
            level: res.data.strength,
          },
          ...prev,
        ]),
      );
    setNewTrend('');
    setLevel(undefined);
  };

  const [trendsValue, setTrendsValue] = useState<string[]>([]);
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);

  const onLevelChange = (id: string, strength: number, title: string): void => {
    axios
      .put(
        `${SERVER_ADDRESS}/api/v1/trend/${id}`,
        {
          strength,
          title,
          body: title,
        },
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .then(() => {
        // @ts-expect-error no err
        setTrends((prev) =>
          prev.map((elem) => {
            // @ts-expect-error no err
            if (elem.value === id) {
              return {
                // @ts-expect-error no err
                ...elem,
                level: strength,
              };
            } else {
              return elem;
            }
          }),
        );
      });
  };

  const onTrendSelected = (idx: number, value: string): void => {
    setTrendsValue((prev) => {
      const newValue = [...prev];
      newValue[idx] = value;
      return newValue;
    });
  };

  const navigate = useNavigate();

  const onGenerate = (): void => {
    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/${
          searchParams.get('type') === 'source' ? 'card' : 'marketplacecard'
        }/${searchParams.get('id')}/beautify`,
        {
          on_marketplace_id: selectedMarket,
          trend_id: [trendsValue],
          mock: false,
          ignore_feedback: false,
        },
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .then(() => navigate(RootPaths.generated));
  };

  return (
    <div className={styles.generate}>
      <div className={styles.content}>
        <div className={styles.title}>Генерация карточки товара</div>
        <div className={styles.settings}>
          <h3 className={styles.params}>Параметры</h3>
          <div className={styles.marketParams}>
            <div>
              <div className={styles.name}>Маркетплейс</div>
              <Select
                className={styles.marketSelect}
                placeholder="Выберите маркетплейс"
                options={markets}
                onChange={(e) => setSelectedMarket(e)}
              />
            </div>
          </div>
          <div>
            <div className={styles.name}>
              Тренды
              <AddButton>
                <div className={styles.tooltip}>
                  <div className={styles.tooltipFields}>
                    <div className={classNames('grid w-full max-w-sm items-center gap-1.5')}>
                      <Label htmlFor="add">Название</Label>
                      <Input
                        id="add"
                        placeholder="Название"
                        value={newTrend}
                        onChange={(e) => setNewTrend(e.target.value)}
                      />
                    </div>
                    <div className={classNames('grid w-full max-w-sm items-center gap-1.5')}>
                      <Label htmlFor="add">Уровень</Label>
                      <Select
                        id="add"
                        placeholder="Выберите уровень"
                        options={levelOptions}
                        onChange={(e) => setLevel(e)}
                        value={level}
                      />
                    </div>
                  </div>
                  <Check className={styles.tooltipCheck} onClick={onSave} />
                </div>
              </AddButton>
            </div>
            <div className={styles.trendWrapper}>
              {trendsValue.map((_, id) => (
                <TrendOption
                  key={id}
                  trends={trends}
                  onLevelChange={onLevelChange}
                  onTrendSelected={(value: string) => onTrendSelected(id, value)}
                />
              ))}
            </div>
            <div
              className={styles.addTrend}
              onClick={() => setTrendsValue((prev) => [...prev, ''])}
            >
              Добавить тренд
            </div>
          </div>
          {/* <div>
              <div className={styles.name}>Параметры подключения</div>
              <div className={styles.label}>Веб-сайт</div>
              <Input placeholder="https://www.figma.com/" className={styles.website} />
            </div> */}
          <div className={styles.start} onClick={onGenerate}>
            Начать
          </div>
        </div>
      </div>
    </div>
  );
};

const TrendOption = ({
  trends,
  onLevelChange,
  onTrendSelected,
}: {
  trends: Option[];
  onLevelChange: (id: string, strength: number, title: string) => void;
  onTrendSelected: (value: string) => void;
}): JSX.Element => {
  const [level, setLevel] = useState<number | undefined>(undefined);
  const [trend, setTrend] = useState<string | undefined>(undefined);

  const onTrend = (e: string): void => {
    setTrend(e);
    const elem = trends.find((elem) => elem.value === e);
    setLevel(elem?.level);
    onTrendSelected(e);
  };

  const handleLevel = (e: number): void => {
    const elem = trends.find((elem) => elem.value === trend);

    setLevel(e);
    onLevelChange(trend as string, e, elem?.label as string);
  };

  return (
    <div className={styles.trend}>
      <Select
        className={styles.marketSelect}
        placeholder="Выберите слово"
        options={trends}
        onChange={(e) => onTrend(e)}
        value={trend}
      />
      <Select
        className={styles.marketSelect}
        placeholder="Выберите уровень"
        options={levelOptions}
        onChange={(e) => handleLevel(e)}
        value={level}
        disabled={!trend}
      />
    </div>
  );
};

const levelOptions = [
  {
    label: 1,
    value: 1,
  },
  {
    label: 2,
    value: 2,
  },
  {
    label: 3,
    value: 3,
  },
  {
    label: 4,
    value: 4,
  },
  {
    label: 5,
    value: 5,
  },
];

