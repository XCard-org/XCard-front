import { SERVER_ADDRESS, TOKEN } from '@/constants';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Card.module.scss';
import { type Card as CardType } from '@/pages/Source';
import Slash from '../assets/Slash.svg?react';
import { ArrowLeft } from 'lucide-react';
import classNames from 'classnames';
import { RootPaths } from '@/pages';

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

export const Card = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [card, setCard] = useState<{
    card: CardType;
    property: Array<{ key: string; value: string }>;
  }>();
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/card/${searchParams.get('id')}`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        setCard(res.data);
      });
  }, [searchParams]);

  const onGenerate = (): void => {
    navigate({
      pathname: RootPaths.generate,
      search: createSearchParams({
        id: searchParams.get('id') || '',
        type: 'source',
      }).toString(),
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.back} onClick={() => navigate(-1)}>
        <ArrowLeft />
        Назад
      </div>
      <div className={styles.topBlock}>
        {card?.card?.images?.length && (
          <div className={styles.imagesWrap}>
            <div className={styles.images}>
              {card?.card?.images
                ?.slice(
                  getImageSelection(selectedImage, card?.card?.images?.length)[0],
                  getImageSelection(selectedImage, card?.card?.images?.length)[1],
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
            <img src={card?.card?.images[selectedImage]} alt="img" className={styles.image} />
          </div>
        )}
        <div className={styles.info}>
          <div className={styles.header}>
            <div className={styles.cardType}>Исходная карточка</div>
            <div className={styles.activeBtn} onClick={onGenerate}>
              Сгенерировать
            </div>
          </div>
          <div className={styles.title}>{card?.card?.title}</div>
          <div className={styles.cats}>
            <div className={styles.cat}>Категория 1</div>
            <Slash />
            <div className={styles.cat}>Категория 2</div>
            <Slash />
            <div className={styles.cat}>Категория 3</div>
          </div>
          <div className={styles.textBlock}>
            <div className={styles.blockTitle}>Описание</div>
            <div className={styles.description}>{card?.card?.description}</div>
          </div>
          {card?.card?.manufacturer_url && (
            <div className={styles.textBlock}>
              <div className={styles.blockTitle}>Ссылка</div>
              <div className={styles.link}>{card?.card?.manufacturer_url}</div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.bottomBlock}>
        <div className={styles.charsTitle}>Характеристики</div>
        <div className={styles.chars}>
          {card?.property?.map((elem) => (
            <div className={styles.char}>
              <div className={styles.charName}>{elem.key}</div>
              <div className={styles.dots} />
              <div className={styles.charValue}>{elem.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

