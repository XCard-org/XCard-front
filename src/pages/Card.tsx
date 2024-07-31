/* eslint-disable react-hooks/exhaustive-deps */
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Card.module.scss';
import { type Card as CardType } from '@/pages/Source';
import Slash from '../assets/Slash.svg?react';
import { ArrowUpRight, Pencil, Trash } from 'lucide-react';
import classNames from 'classnames';
import { RootPaths } from '@/pages';
import Star from '../assets/Star.svg?react';
import ActiveStar from '../assets/ActiveStar.svg?react';
import { Checkbox, Form, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { BackButton } from '@/components/BackButton';
import { timeAgo } from '@/functions/timeAgo';
import { AddButton } from '@/components/AddButton';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import { CardTable } from '@/containers/CardTableContainer/CardTable';

const getImageSelection = (selected: number, amount: number): [number, number] => {
  if (amount < 4) {
    return [0, 4];
  } else {
    if (selected === 0) return [0, 4];
    if (selected + 2 <= amount) {
      return [selected - 1, selected + 2];
    } else {
      return [amount - 4, amount];
    }
  }
};

type Feedback = {
  human_feedback: {
    desc_ok: boolean;
    grammar_ok: boolean;
    irrelevant: boolean;
    semantic_ok: boolean;
    title_ok: boolean;
    graded_at: string;
    reviewed_desc: string;
    reviewed_title: string;
    include_in_regen: boolean;
    uid: string;
    grade: number;
  };
  owner: {
    avatar?: string;
    full_name: string;
  };
  defaultEditing?: boolean;
};

type Category = {
  uid: string;
  title: string;
};

export type CardItem = {
  card?: CardType;
  marketplace_card?: CardType;
  property: Array<{ key: string; value: string; uid: string }>;
  category?: Category;
  human_feedback?: Feedback[];
  categories?: Category[];
  additional_tags?: Category[];
  beautification?: {
    uid: string;
  };
  marketplace?: Array<{ name: string }>;
  source?: string;
  sourceType?: 'source' | 'market';
  generation_pipeline_url?: string;
};

export const Card = ({ isMarket }: { isMarket?: boolean }): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cardPrefix = isMarket ? 'marketplace_card' : 'card';
  const [card, setCard] = useState<CardItem>();
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    axios
      .get(
        `${SERVER_ADDRESS}/api/v1/${isMarket ? 'marketplace' : ''}card/${searchParams.get('id')}`,
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .then((res) => {
        const categories = res?.data?.category?.uid ? [res?.data?.category] : [];
        if (res.data?.category?.uid) {
          axios
            .get(`${SERVER_ADDRESS}/api/v1/tag/${res.data?.category?.uid}/parent`, {
              headers: {
                Authorization: TOKEN(),
              },
            })
            .then((catData) => {
              catData?.data?.category?.uid && categories.push(catData?.data?.category);
              if (catData.data?.category?.uid) {
                axios
                  .get(`${SERVER_ADDRESS}/api/v1/tag/${catData.data?.category?.uid}/parent`, {
                    headers: {
                      Authorization: TOKEN(),
                    },
                  })
                  .then((catData2) => {
                    catData2?.data?.category?.uid && categories.push(catData2?.data?.category);

                    setCard((prev) => ({ ...prev, ...res.data, categories }));
                  });
              } else {
                setCard((prev) => ({ ...prev, ...res.data, categories }));
              }
            });
        } else {
          setCard((prev) => ({ ...prev, ...res.data, categories }));
        }
      });

    if (isMarket) {
      axios
        .get(`${SERVER_ADDRESS}/api/v1/marketplacecard/${searchParams.get('id')}/source`, {
          headers: {
            Authorization: TOKEN(),
          },
        })
        .then((res) =>
          // @ts-expect-error no err
          setCard((prev) => ({
            ...prev,
            source: res?.data?.marketplace_card?.uid || res?.data?.card?.uid,
            sourceType: res?.data?.marketplace_card?.uid ? 'market' : 'source',
          })),
        );
    }
  }, [isMarket, searchParams]);

  const onGenerate = (): void => {
    navigate({
      pathname: RootPaths.generate,
      search: createSearchParams({
        id: searchParams.get('id') || '',
        type: isMarket ? 'market' : 'source',
      }).toString(),
    });
  };

  const addGrade = (): void => {
    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/beauty/${card?.beautification?.uid}/feedback`,
        {
          title_ok: false,
          desc_ok: false,
          grammar_ok: false,
          semantic_ok: false,
        },
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .then((res) => {
        // @ts-expect-error correct
        setCard((prev) => ({
          ...prev,
          // eslint-disable-next-line no-unsafe-optional-chaining
          human_feedback: [{ ...res.data, defaultEditing: true }, ...(prev?.human_feedback || [])],
        }));
      });
  };

  const deleteGrade = (id: string): void => {
    // @ts-expect-error correct
    setCard((prev) => ({
      ...prev,
      human_feedback: prev?.human_feedback?.filter((elem) => elem?.human_feedback?.uid !== id),
    }));
    axios.delete(`${SERVER_ADDRESS}/api/v1/beauty/${card?.beautification?.uid}/feedback/${id}`, {
      headers: {
        Authorization: TOKEN(),
      },
    });
  };

  const onSource = (): void => {
    searchParams.set('id', card?.source as string);
    setCard(undefined);
    navigate({
      pathname: card?.sourceType === 'source' ? RootPaths.card : RootPaths.marketcard,
      search: searchParams.toString(),
    });
  };

  const [data, setData] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const [stopLoad, setStopLoad] = useState(false);
  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!stopLoad && skip === data.length) {
        const res = await axios.get(
          `${SERVER_ADDRESS}/api/v1/marketplacecard/${searchParams.get('id')}/matched-source`,
          {
            params: {
              skip,
              limit: skip + 50,
            },
            headers: {
              Authorization: TOKEN(),
            },
          },
        );
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
  }, []);

  useEffect(() => {
    if (!data?.length) {
      loadMore();
    }
  }, [data]);

  const [dataSource, setDataSource] = useState<CardItem[]>([]);
  const [loadingSource, setLoadingSource] = useState<boolean>(false);
  const [skipSource, setSkipSource] = useState<number>(0);
  const [stopLoadSource, setStopLoadSource] = useState(false);
  const loadMoreSource = useCallback(async () => {
    if (loadingSource) return;
    setLoadingSource(true);
    try {
      if (!stopLoadSource && skipSource === dataSource.length) {
        const res = await axios.get(
          `${SERVER_ADDRESS}/api/v1/card/${searchParams.get('id')}/marketplacecard`,
          {
            params: {
              skip,
              limit: skipSource + 50,
            },
            headers: {
              Authorization: TOKEN(),
            },
          },
        );
        if (res.data.length < 50) {
          setStopLoadSource(true);
        }
        setDataSource((prevData) => [
          ...prevData,
          ...res.data.map((elem: CardItem) => ({
            ...elem,
            card: { ...elem?.marketplace_card, ...elem?.card },
          })),
        ]);
        setSkipSource((prevSkip) => prevSkip + 50);
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  }, [loadingSource, stopLoadSource, skipSource, dataSource]);

  useEffect(() => {
    setDataSource([]);
    setStopLoadSource(false);
    setSkipSource(0);
  }, []);

  useEffect(() => {
    if (!data?.length) {
      loadMoreSource();
    }
  }, [dataSource]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.backBlock}>
          <BackButton />
          <div>
            {card?.marketplace_card ? 'Сгенерированные' : 'Исходные'} / {card?.[cardPrefix]?.uid}
          </div>
        </div>
        {card?.source && (
          <div className={styles.openSource} onClick={onSource}>
            Открыть исходную
          </div>
        )}
        {card?.generation_pipeline_url && (
          <div className={styles.openMalevich} onClick={onSource}>
            Открыть Malevich
          </div>
        )}
        <div className={styles.activeBtn} onClick={onGenerate}>
          Сгенерировать
        </div>
      </div>
      <div className={styles.topBlock}>
        <div className={styles.blockWrap}>
          <div className={styles.header}>
            <div className={styles.cardType}>
              {card?.marketplace?.[0]?.name || 'Исходная карточка'}
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.title}>{card?.[cardPrefix]?.title}</div>
            <div className={styles.time}>
              {card?.[cardPrefix]?.created_at
                ? dayjs(card?.[cardPrefix]?.created_at).format('HH:mm DD.MM.YYYY')
                : null}
            </div>
            <div className={styles.cats}>
              {card?.categories?.map((elem, idx) => (
                <div key={elem.uid}>
                  <div className={styles.cat}>{elem?.title}</div>
                  {idx !== (card?.categories?.length as number) - 1 && <Slash />}
                </div>
              ))}
            </div>
            <div className={styles.textBlock}>
              <div className={styles.blockTitle}>Описание</div>
              <div className={styles.description}>{card?.[cardPrefix]?.description}</div>
            </div>
            {card?.[cardPrefix]?.source_url && (
              <div className={styles.textBlock}>
                <div className={styles.blockTitle}>Ссылка</div>
                <div
                  className={styles.link}
                  onClick={() => window.open(card?.[cardPrefix]?.source_url, '_blank')}
                >
                  {card?.[cardPrefix]?.source_url}
                  <ArrowUpRight className={styles.linkArrow} />
                </div>
              </div>
            )}
          </div>
        </div>
        {card?.[cardPrefix]?.images?.length && (
          <div className={styles.imagesWrap}>
            <img
              src={card?.[cardPrefix]?.images[selectedImage]}
              alt="img"
              className={styles.image}
            />
            <div className={styles.images}>
              {card?.[cardPrefix]?.images
                ?.slice(
                  getImageSelection(selectedImage, card?.[cardPrefix]?.images?.length || 0)[0],
                  getImageSelection(selectedImage, card?.[cardPrefix]?.images?.length || 0)[1],
                )
                .map((img, idx) => (
                  <img
                    src={img}
                    alt="img"
                    className={classNames(
                      styles.imagePreview,
                      idx === selectedImage && styles.imagePreviewSelected,
                    )}
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
      {card?.property ? (
        <div className={styles.bottomBlock}>
          <div className={styles.charsTitle}>Характеристики</div>
          <div className={styles.chars}>
            {card?.property?.map((elem) => (
              <div className={styles.char} key={elem?.uid}>
                <div className={styles.charName}>{elem.key}</div>
                <div className={styles.dots} />
                <div className={styles.charValue}>{elem.value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {isMarket ? (
        <div className={styles.grade}>
          <div className={styles.gradeTitle}>
            Ручная оценка
            <AddButton onClick={addGrade} />
          </div>
          <div className={styles.grades}>
            {card?.human_feedback?.map((elem) => (
              <HandleGrade
                info={elem}
                beautyUid={card?.beautification?.uid as string}
                key={elem?.human_feedback?.uid}
                deleteGrade={() => deleteGrade(elem?.human_feedback?.uid)}
                defaultEditing={elem?.defaultEditing as boolean}
              />
            ))}
          </div>
        </div>
      ) : null}
      {isMarket && (
        <div className={styles.tableBlock}>
          <div className={styles.tableHeader}>Карточки с тем же источником</div>
          <CardTable data={data} loadMore={loadMore} stopLoad={stopLoad} />
        </div>
      )}
      {!isMarket && (
        <div className={styles.tableBlock}>
          <div className={styles.tableHeader}>Источник для карточек</div>
          <CardTable data={dataSource} loadMore={loadMoreSource} stopLoad={stopLoadSource} />
        </div>
      )}
    </div>
  );
};

const HandleGrade = ({
  info,
  beautyUid,
  deleteGrade,
  defaultEditing,
}: {
  info: Feedback;
  beautyUid: string;
  deleteGrade: () => void;
  defaultEditing: boolean;
}): JSX.Element => {
  const [form] = useForm();
  const [grade, setGrade] = useState(info?.human_feedback?.grade || 0);
  const [isEditing, setIsEditing] = useState(defaultEditing);

  const activeStars = [];
  const passiveStars = [];

  for (let i = 0; i < grade; i += 1) {
    activeStars.push(
      <div
        className={classNames(styles.star, styles.activeStar, styles.starWrap)}
        onClick={isEditing ? () => setGrade(grade - i) : undefined}
        key={i}
      >
        <ActiveStar />
      </div>,
    );
  }

  for (let i = grade; i < 5; i += 1) {
    passiveStars.push(
      <div
        className={classNames(
          styles.star,
          styles.passiveStar,
          styles.starWrap,
          isEditing && styles.starEditing,
        )}
        onClick={isEditing ? () => setGrade(5 - i + grade) : undefined}
        key={i}
      >
        <Star />
      </div>,
    );
  }

  const onEdit = useCallback((): void => {
    const values = form.getFieldsValue();
    axios.put(
      `${SERVER_ADDRESS}/api/v1/beauty/${beautyUid}/feedback/${info?.human_feedback?.uid}`,
      { ...values, grade },
      {
        headers: {
          Authorization: TOKEN(),
        },
      },
    );
  }, [beautyUid, form, grade, info?.human_feedback?.uid]);

  useEffect(() => {
    onEdit();
  }, [grade, onEdit]);

  const [includeInRegen, setIncludeInRegen] = useState(info?.human_feedback?.include_in_regen);

  return (
    <Form form={form}>
      <div className={styles.singleGrade}>
        <div className={styles.gradeTop}>
          <div className={styles.gradeHeader}>
            <div className={styles.gradeAuthor}>
              {info?.owner?.avatar ? (
                <img src={info?.owner?.avatar} alt="avatar" className={styles.gradeImg} />
              ) : null}
              <div className={styles.gradePerson}>
                <div className={styles.gradeRole}>Аннотатор</div>
                <div className={styles.gradeName}>{info?.owner?.full_name}</div>
              </div>
            </div>
            <div className={styles.gradeDate}>{timeAgo(info?.human_feedback?.graded_at)}</div>
            <Pencil
              className={classNames(styles.gradeEdit, isEditing && styles.gradeEditing)}
              onClick={() => setIsEditing((prev) => !prev)}
            />
          </div>
          <div className={styles.gradeStars}>
            <div className={styles.stars}>
              {passiveStars.map((elem) => elem)}
              {activeStars.map((elem) => elem)}
            </div>
            <div className={styles.gradeValue}>{grade}/5</div>
            {includeInRegen && <div className={styles.gradeInclude}>Включить в регенерацию</div>}
          </div>
        </div>
        <div className={styles.gradeBlock}>
          <div className={styles.gradeProp}>По частям</div>
          <div className={styles.gradeCheckboxes}>
            <Form.Item
              name={'irrelevant'}
              initialValue={info?.human_feedback?.irrelevant}
              valuePropName="checked"
            >
              <Checkbox className={styles.gradeCheckbox} disabled={!isEditing} onChange={onEdit}>
                Полностью не туда
              </Checkbox>
            </Form.Item>
            <Form.Item
              name={'title_ok'}
              initialValue={info?.human_feedback?.title_ok}
              valuePropName="checked"
            >
              <Checkbox className={styles.gradeCheckbox} disabled={!isEditing} onChange={onEdit}>
                Заголовок
              </Checkbox>
            </Form.Item>
            <Form.Item
              name={'desc_ok'}
              initialValue={info?.human_feedback?.desc_ok}
              valuePropName="checked"
            >
              <Checkbox className={styles.gradeCheckbox} disabled={!isEditing} onChange={onEdit}>
                Описание
              </Checkbox>
            </Form.Item>
          </div>
        </div>
        <div className={styles.gradeBlock}>
          <div className={styles.gradeProp}>Текст</div>
          <div className={styles.gradeCheckboxes}>
            <Form.Item
              name={'grammar_ok'}
              initialValue={info?.human_feedback?.grammar_ok}
              valuePropName="checked"
            >
              <Checkbox className={styles.gradeCheckbox} disabled={!isEditing} onChange={onEdit}>
                Грамматика
              </Checkbox>
            </Form.Item>

            <Form.Item
              name={'semantic_ok'}
              initialValue={info?.human_feedback?.semantic_ok}
              valuePropName="checked"
            >
              <Checkbox className={styles.gradeCheckbox} disabled={!isEditing} onChange={onEdit}>
                Семантика
              </Checkbox>
            </Form.Item>
          </div>
        </div>
        <div>
          <div className={styles.gradeProp}>Исправления</div>

          <Form.Item name={'reviewed_title'} initialValue={info?.human_feedback?.reviewed_title}>
            <Input
              placeholder="Заголовок"
              className={styles.input}
              disabled={!isEditing}
              onBlur={onEdit}
            />
          </Form.Item>

          <Form.Item name={'reviewed_desc'} initialValue={info?.human_feedback?.reviewed_desc}>
            <TextArea placeholder="Описание" disabled={!isEditing} onBlur={onEdit} />
          </Form.Item>
        </div>
        {isEditing && (
          <>
            <div className={styles.regenCheck}>
              <Form.Item
                name={'include_in_regen'}
                initialValue={info?.human_feedback?.include_in_regen}
                valuePropName="checked"
              >
                <Checkbox
                  className={styles.gradeCheckbox}
                  disabled={!isEditing}
                  onChange={(e) => {
                    onEdit();
                    setIncludeInRegen(e.target.checked);
                  }}
                >
                  Включить исправления в регенерацию
                </Checkbox>
              </Form.Item>
            </div>
            <div className={styles.delete} onClick={deleteGrade}>
              <Trash className={styles.gradeTrash} />
              Удалить аннотацию
            </div>
          </>
        )}
      </div>
    </Form>
  );
};

