import { Collapse, Input, Select } from 'antd';
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
import { BackButton } from '@/components/BackButton';
import { CardItem } from '@/pages/Card';

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
  const [trends, setTrends] = useState<Array<{ value: string; label: string; level: number }>>([]);
  const [searchParams] = useSearchParams();
  const [card, setCard] = useState<CardItem>();

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
      .get(
        `${SERVER_ADDRESS}/api/v1/${
          searchParams.get('type') === 'market' ? 'marketplace' : ''
        }card/${searchParams.get('id')}`,
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .then((res) => {
        setCard({ ...res.data });
      });

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
  }, [searchParams]);

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
      .then((res) => {
        const newItem = {
          label: res.data.title,
          value: res.data.uid,
          level: res.data.strength,
        };
        setTrends((prev) => [newItem, ...prev]);
        setTrendsValue((prev) => [...prev, newItem]);
      });
    setNewTrend('');
    setLevel(undefined);
  };

  const [trendsValue, setTrendsValue] = useState<
    Array<{ value?: string; label?: string; level?: number }>
  >([]);
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
        setTrends((prev) =>
          prev.map((elem) => {
            if (elem.value === id) {
              return {
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

  const onTrendSelected = (
    idx: number,
    elem: { value?: string; label?: string; level?: number },
  ): void => {
    setTrendsValue((prev) => {
      const newValue = [...prev];
      newValue[idx] = elem;
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
          trend_id: trendsValue.map((elem) => elem.value),
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
      <div className={styles.back}>
        <BackButton />
      </div>
      <div className={styles.content}>
        <div className={styles.title}>Генерация карточки товара</div>
        <div className={styles.settings}>
          <h3 className={styles.params}>Параметры</h3>
          <div>
            <Collapse
              ghost
              expandIconPosition="end"
              items={[
                {
                  key: '1',
                  label: <div className={styles.name}>Характеристики</div>,
                  children: (
                    <div className={styles.chars}>
                      {card?.property?.map((elem) => (
                        <div className={styles.char} key={elem?.key}>
                          <div className={styles.charName}>{elem.key}</div>
                          <div className={styles.dots} />
                          <div className={styles.charValue}>{elem.value}</div>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
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
              {trendsValue.map((elem, idx) => (
                <TrendOption
                  key={idx}
                  trends={trends}
                  onLevelChange={onLevelChange}
                  onTrendSelected={(value: { value?: string; label?: string; level?: number }) =>
                    onTrendSelected(idx, value)
                  }
                  value={elem}
                />
              ))}
            </div>
            <div
              className={styles.addTrend}
              onClick={() =>
                setTrendsValue((prev) => [
                  ...prev,
                  { value: undefined, level: undefined, label: undefined },
                ])
              }
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
  value,
}: {
  trends: Option[];
  onLevelChange: (id: string, strength: number, title: string) => void;
  onTrendSelected: (value: { value?: string; label?: string; level?: number }) => void;
  defaultLevel?: number;
  defaultTrend?: string;
  value: { value?: string; label?: string; level?: number };
}): JSX.Element => {
  const onTrend = (e: string): void => {
    const elem = trends.find((elem) => elem.value === e);
    onTrendSelected({ value: e, label: elem?.label, level: elem?.level });
  };

  const handleLevel = (e: number): void => {
    const elem = trends.find((elem) => elem.value === value.value);

    onLevelChange(elem?.value as string, e, elem?.label as string);
    onTrendSelected({ value: elem?.value, label: elem?.label, level: e });
  };

  return (
    <div className={styles.trend}>
      <Select
        className={styles.marketSelect}
        placeholder="Выберите слово"
        options={trends}
        onChange={(e) => onTrend(e)}
        value={value.value}
      />
      <Select
        className={styles.marketSelect}
        placeholder="Выберите уровень"
        options={levelOptions}
        onChange={(e) => handleLevel(e)}
        value={value.level}
        disabled={!value.value}
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

