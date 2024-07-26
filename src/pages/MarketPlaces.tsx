/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { Direction } from '@/pages/Categories';
import axios from 'axios';
import styles from './Categories.module.scss';
import { AddButton } from '../components/AddButton';
import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Check, Pencil, Trash } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { getTextWidth } from '@/functions/measureText';
import { useNavigate } from 'react-router';
import { RootPaths } from '@/pages';
import { createSearchParams } from 'react-router-dom';

export const MarketPlaces = (): JSX.Element => {
  const navigate = useNavigate();
  const [directions, setDirections] = useState<Direction[]>(
    JSON.parse(localStorage.getItem('directions') || '[]'),
  );
  const [rootElements, setRootElements] = useState<Direction[]>(
    JSON.parse(localStorage.getItem('rootElements') || '[]'),
  );
  const [selectedElements, setSelectedElements] = useState<string[]>(
    JSON.parse(localStorage.getItem('selectedElements') || '[]'),
  );

  useEffect(() => {
    localStorage.setItem('directions', JSON.stringify(directions));
  }, [directions]);

  useEffect(() => {
    localStorage.setItem('rootElements', JSON.stringify(rootElements));
  }, [rootElements]);

  useEffect(() => {
    localStorage.setItem('selectedElements', JSON.stringify(selectedElements));
  }, [selectedElements]);

  const getElementsFromRequest = (data: any): Direction[] => {
    return data.map((elem: any) => ({
      label: elem.name || elem.title || elem.key,
      id: elem.uid,
      ...elem,
    }));
  };

  const onElementSelected = (direction: Direction, nestValue: number): void => {
    setSelectedElements((prev) => {
      const newValue = [...prev];
      newValue[nestValue] = direction.id;

      return newValue.splice(0, nestValue + 1);
    });
  };

  const onSelectDirection = (direction: Direction, nestValue: number): void => {
    if (!nestValue) {
      setDirections((prev) => [
        ...(prev?.slice(0, nestValue) || []),
        {
          label: direction.label,
          id: direction.id,
          elements: [
            {
              label: 'Ограничения',
              id: '0',
            },
            {
              label: 'Категории',
              id: '1',
            },
          ],
        },
      ]);
    } else if (direction.id === '0') {
      axios
        .get(`${SERVER_ADDRESS}/api/v1/marketplace/${selectedElements[0]}/restriction/`, {
          headers: {
            Authorization: TOKEN(),
          },
        })
        .then((res) => {
          setDirections((prev) => [
            ...(prev?.slice(0, nestValue) || []),
            {
              label: direction.label,
              id: direction.id,
              elements: getElementsFromRequest(res.data),
              isLeaf: true,
            },
          ]);
        });
    } else if (direction.id === '1') {
      axios
        .get(`${SERVER_ADDRESS}/api/v1/tag/`, {
          params: {
            root: true,
            marketplace_id: selectedElements[0],
          },
          headers: {
            Authorization: TOKEN(),
          },
        })
        .then((res) => {
          setDirections((prev) => [
            ...(prev?.slice(0, nestValue) || []),
            {
              label: direction.label,
              id: direction.id,
              elements: getElementsFromRequest(res.data),
            },
          ]);
        });
    } else if (nestValue < 4) {
      axios
        .get(`${SERVER_ADDRESS}/api/v1/tag/${direction.id}/children`, {
          params: {
            marketplace_id: selectedElements[0],
          },
          headers: {
            Authorization: TOKEN(),
          },
        })
        .then((res) => {
          setDirections((prev) => [
            ...(prev?.slice(0, nestValue) || []),
            {
              label: direction.label,
              id: direction.id,
              elements: getElementsFromRequest(res.data),
            },
          ]);
        });
    } else {
      navigate({
        pathname: RootPaths.detail,
        search: createSearchParams({
          id: selectedElements[selectedElements.length - 1],
        }).toString(),
      });
    }
  };

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
      .then((res) => setRootElements(getElementsFromRequest(res.data)));
  }, []);

  const onTagCreated = (title: string, parent: string | undefined, nestValue: number): void => {
    if (!parent) {
      axios
        .post(
          `${SERVER_ADDRESS}/api/v1/marketplace/`,
          {
            name: title,
            url: 'https://www.ozon.ru/',
            icon_url: '',
            is_main_kb: true,
          },
          {
            params: {
              parent_id: parent,
            },
            headers: {
              Authorization: TOKEN(),
            },
          },
        )
        .then((res) => {
          const direction = { label: res.data.name, id: res.data.uid };
          setRootElements((prev) => [...prev, direction]);
          onSelectDirection(direction, 0);
          onElementSelected(direction, 0);
        });
    } else if (parent === '0') {
      axios
        .post(
          `${SERVER_ADDRESS}/api/v1/marketplace/${selectedElements[0]}/restriction/`,
          {
            key: title,
            url: 'https://www.ozon.ru/',
          },
          {
            headers: {
              Authorization: TOKEN(),
            },
          },
        )
        .then((res) => {
          setDirections((prev) => {
            const newValue = [...prev];
            newValue[1].elements = [
              { label: res.data.key, id: res.data.uid },
              ...(newValue[1]?.elements || []),
            ];
            newValue.findIndex((elem) => elem.id === parent);
            return newValue;
          });
        });
    } else {
      axios
        .post(
          `${SERVER_ADDRESS}/api/v1/tag/`,
          {
            title,
            description: '',
            is_main_kb: false,
          },
          {
            params: {
              marketplace_id: selectedElements[0],
              parent_id: nestValue >= 2 ? parent : undefined,
            },
            headers: {
              Authorization: TOKEN(),
            },
          },
        )
        .then((res) => {
          if (nestValue < 4) {
            setDirections((prev) => {
              const newValue = [...prev];
              newValue[nestValue - 1].elements = [
                { label: res.data.title, id: res.data.uid },
                ...(newValue[nestValue - 1]?.elements || []),
              ];

              return newValue;
            });
          } else {
            navigate({
              pathname: RootPaths.category,
              search: createSearchParams({
                id: res.data.uid,
              }).toString(),
            });
          }
        });
    }
  };

  const onElementDeleted = (id: string, nest: number): void => {
    axios
      .delete(`${SERVER_ADDRESS}/api/v1/marketplace/${id}`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then(() => {
        if (nest) {
          setDirections((prev) => {
            const newValues = [...prev];
            newValues[nest - 1].elements = newValues[nest - 1].elements?.filter(
              (elem) => elem.id !== id,
            );
            return newValues;
          });
        } else {
          setRootElements((prev) => prev.filter((elem) => elem.id !== id));
        }
      });
  };

  return (
    <div className={styles.categories}>
      <div className={styles.menu}>
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>По маркетплейсам</h2>
          </div>
        </div>
        <div className={styles.directions}>
          <Category
            title={'Маркетплейс'}
            onCategoryClick={(id) => onSelectDirection(id, 0)}
            onTagCreated={(title) => onTagCreated(title, undefined, 0)}
            elements={rootElements}
            onElementSelected={(direction) => onElementSelected(direction, 0)}
            selectedElement={selectedElements[0]}
            onDelete={(elem) => onElementDeleted(elem, 0)}
          />
          {directions?.map((direction, idx) =>
            direction?.isLeaf ? (
              <LeafCategory
                direction={direction}
                onTagCreated={(title) => onTagCreated(title, direction.id, idx + 1)}
                key={direction.id}
              />
            ) : (
              <Category
                title={direction.label}
                elements={direction.elements}
                onCategoryClick={(id) => onSelectDirection(id, idx + 1)}
                bordered={false}
                onTagCreated={(title) => onTagCreated(title, direction.id, idx + 1)}
                onElementSelected={(direction) => onElementSelected(direction, idx + 1)}
                selectedElement={selectedElements[idx + 1]}
                noAdd={idx === 0}
                key={direction.id}
                onDelete={(elem) => onElementDeleted(elem, idx + 1)}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
};

const Category = ({
  title,
  onCategoryClick,
  bordered = true,
  onTagCreated,
  elements,
  onElementSelected,
  selectedElement,
  noAdd,
  onDelete,
}: {
  title: string;
  onCategoryClick: (direction: Direction) => void;
  bordered?: boolean;
  onTagCreated: (title: string) => void;
  elements: Direction[] | undefined;
  onElementSelected: (element: Direction) => void;
  selectedElement: string;
  noAdd?: boolean;
  onDelete: (id: string) => void;
}): JSX.Element => {
  const onElementClick = (elem: Direction): void => {
    onCategoryClick(elem);
    onElementSelected(elem);
  };

  const [newValue, setNewValue] = useState('');
  const onSave = (): void => {
    onTagCreated(newValue);
    setNewValue('');
  };

  return (
    <div className={styles.direction}>
      <div className={classNames(styles.categoryHeader, noAdd && styles.headerMoved)}>
        <div className={styles.categoryTitle}>{title}</div>
        {!noAdd && (
          <AddButton>
            <div className={styles.tooltip}>
              <div className={classNames('grid w-full max-w-sm items-center gap-1.5')}>
                <Label htmlFor="add">Title</Label>
                <Input
                  id="add"
                  placeholder="Title"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </div>
              <Check className={styles.tooltipCheck} onClick={onSave} />
            </div>
          </AddButton>
        )}
      </div>
      <div
        className={classNames(styles.categoriesList, !bordered && styles.categoriesListNotBordered)}
      >
        {elements?.map((elem) => (
          <div
            className={classNames(
              styles.category,
              selectedElement === elem.id && styles.categorySelected,
            )}
            onClick={() => onElementClick(elem)}
            key={elem.id}
          >
            {elem.label}
            {!noAdd && (
              <Trash
                className={styles.trash}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(elem.id);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const LeafCategory = ({
  direction,
  onTagCreated,
}: {
  direction: Direction;
  onTagCreated: (title: string) => void;
}): JSX.Element => {
  const [newRestriction, setNewRestriction] = useState('');

  const onSave = (): void => {
    onTagCreated(newRestriction);
    setNewRestriction('');
  };

  return (
    <div className={classNames(styles.direction, styles.lastDirection, styles.direction412)}>
      <div className={styles.categoryHeader}>
        <div className={styles.categoryTitle}>{direction.label}</div>
        <AddButton>
          <div className={styles.tooltip}>
            <div className={classNames('grid w-full max-w-sm items-center gap-1.5')}>
              <Label htmlFor="add">Title</Label>
              <Input
                id="add"
                placeholder="Title"
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
              />
            </div>
            <Check className={styles.tooltipCheck} onClick={onSave} />
          </div>
        </AddButton>
      </div>
      <div className={styles.leafCategoryList}>
        {direction?.elements?.map((elem) => (
          <Restriction direction={elem} tagId={direction.id} key={elem.id} />
        ))}
      </div>
    </div>
  );
};

const Restriction = ({
  tagId,
  direction,
}: {
  tagId: string;
  direction: Direction;
}): JSX.Element => {
  const [type, setType] = useState(direction.type || '');
  const [isTypeInitialized, setIsTypeInitialized] = useState(false);
  const [allowed, setAllowed] = useState(direction.allowed || '');
  const [isAllowedInitialized, setIsAllowedInitialized] = useState(false);
  const [not_allowed, setNot_allowed] = useState(direction.not_allowed || '');
  const [isNotAllowedInitialized, setIsNotAllowedInitialized] = useState(false);

  const onPropertyUpdated = useCallback(
    (id: string, body: Record<string, string | Array<string> | boolean | number>): void => {
      axios.put(
        `${SERVER_ADDRESS}/api/v1/marketplace/${tagId}/restriction/${id}`,
        { ...body },
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      );
    },
    [],
  );

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (isTypeInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated(direction.id, { type });
      }, 300);
    } else {
      setIsTypeInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [onPropertyUpdated, type]);

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (isAllowedInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated(direction.id, { allowed });
      }, 300);
    } else {
      setIsAllowedInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [onPropertyUpdated, allowed]);

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (isNotAllowedInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated(direction.id, { not_allowed });
      }, 300);
    } else {
      setIsNotAllowedInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [onPropertyUpdated, not_allowed]);

  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [intermediateTitleValue, setIntermediateTitleValue] = useState(direction.label);

  const saveTitle = (): void => {
    setIsTitleEditing(false);
    onPropertyUpdated(direction.id, { key: intermediateTitleValue });
  };

  return (
    <div className={styles.leaf}>
      <div className={styles.verticalLeaf}>
        <div className={styles.restrictionTitle}>
          {!isTitleEditing ? (
            <>
              <div onDoubleClick={() => setIsTitleEditing(true)}>
                {intermediateTitleValue?.length ? intermediateTitleValue : 'Название ограничения'}
              </div>
              <Pencil className={styles.pencil} onClick={() => setIsTitleEditing(true)} />
            </>
          ) : (
            <Input
              onChange={(e) => setIntermediateTitleValue(e.target.value)}
              value={intermediateTitleValue}
              onBlur={saveTitle}
              autoFocus={true}
              style={{
                width:
                  getTextWidth(
                    intermediateTitleValue,
                    400,
                    16,
                    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                  ) + 20,
              }}
              className={styles.nameInput}
            />
          )}
        </div>
        <div className={classNames(styles.leafInput, styles.input120)}>
          <div className={styles.leafInputLabel}>Тип</div>
          <Input
            placeholder="Тип"
            className={styles.input}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        <div className={classNames(styles.leafInput, styles.inputArea)}>
          <div className={styles.leafInputLabel}>Разрешено</div>
          <Textarea
            placeholder="Описание"
            className={classNames('resize-none', styles.textarea)}
            value={allowed}
            onChange={(e) => setAllowed(e.target.value)}
          />
        </div>
        <div className={classNames(styles.leafInput, styles.inputArea)}>
          <div className={styles.leafInputLabel}>Не разрешено</div>
          <Textarea
            placeholder="Описание"
            className={classNames('resize-none', styles.textarea)}
            value={not_allowed}
            onChange={(e) => setNot_allowed(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

