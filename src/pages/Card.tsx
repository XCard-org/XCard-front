import { SERVER_ADDRESS, TOKEN } from '@/constants';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Card.module.scss';
import { type Card as CardType } from '@/pages/Source';
import Slash from '../assets/Slash.svg?react';
import { ArrowLeft, Pencil } from 'lucide-react';
import classNames from 'classnames';
import { RootPaths } from '@/pages';
import Star from '../assets/Star.svg?react';
import ActiveStar from '../assets/ActiveStar.svg?react';
import { Checkbox, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';

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
      <div className={styles.grade}>
        <div className={styles.gradeTitle}>Ручная оценка</div>
        <div className={styles.grades}>
          <HandleGrade />
        </div>
      </div>
    </div>
  );
};

const HandleGrade = (): JSX.Element => {
  const [grade, setGrade] = useState(3);

  const activeStars = [];
  const passiveStars = [];

  for (let i = 0; i < grade; i += 1) {
    activeStars.push(
      <div
        className={classNames(styles.star, styles.activeStar, styles.starWrap)}
        onClick={() => setGrade(grade - i)}
      >
        <ActiveStar />
      </div>,
    );
  }

  for (let i = grade; i < 5; i += 1) {
    passiveStars.push(
      <div
        className={classNames(styles.star, styles.passiveStar, styles.starWrap)}
        onClick={() => setGrade(5 - i + grade)}
      >
        <Star />
      </div>,
    );
  }

  return (
    <div className={styles.singleGrade}>
      <div className={styles.gradeTop}>
        <div className={styles.gradeHeader}>
          <div className={styles.gradeAuthor}>
            <img
              src={
                'https://gravatar.com/avatar/59843dc40f88c947986f9c34072936d9?s=400&d=robohash&r=x'
              }
              alt="avatar"
              className={styles.gradeImg}
            />
            <div className={styles.gradePerson}>
              <div className={styles.gradeRole}>Аннотатор</div>
              <div className={styles.gradeName}>Андрей Давыдов</div>
            </div>
          </div>
          <div className={styles.gradeDate}>2 дня назад</div>
          <Pencil className={styles.gradeEdit} />
        </div>
        <div className={styles.gradeStars}>
          <div className={styles.stars}>
            {passiveStars.map((elem) => elem)}
            {activeStars.map((elem) => elem)}
          </div>
          <div className={styles.gradeValue}>{grade}/5</div>
          <div className={styles.gradeInclude}>Включить в регенерацию</div>
        </div>
      </div>
      <div className={styles.gradeBlock}>
        <div className={styles.gradeProp}>По частям</div>
        <div className={styles.gradeCheckboxes}>
          <Checkbox className={styles.gradeCheckbox}>Полностью не туда</Checkbox>
          <Checkbox className={styles.gradeCheckbox}>Заголовок</Checkbox>
          <Checkbox className={styles.gradeCheckbox}>Описание</Checkbox>
        </div>
      </div>
      <div className={styles.gradeBlock}>
        <div className={styles.gradeProp}>Текст</div>
        <div className={styles.gradeCheckboxes}>
          <Checkbox className={styles.gradeCheckbox}>Грамматика</Checkbox>
          <Checkbox className={styles.gradeCheckbox}>Семантика</Checkbox>
        </div>
      </div>
      <div>
        <div className={styles.gradeProp}>Исправления</div>
        <Input placeholder="Заголовок" className={styles.input} />
        <TextArea placeholder="Описание" className={styles.input} />
      </div>
    </div>
  );
};

