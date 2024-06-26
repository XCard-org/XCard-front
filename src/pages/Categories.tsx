/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './Categories.module.scss';
import { AddButton } from '../components/AddButton';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { Label } from '@radix-ui/react-label';
import { Check, Trash } from 'lucide-react';

export type Direction = {
  label: string;
  id: string;
  elements?: Direction[];
  isLeaf?: boolean;
  type?: string;
  dimension?: string;
  min_value?: number;
  max_value?: number;
  defaultValue?: number;
  scrape?: boolean;
  generation?: string;
  synonyms?: string[];
  value_type?: string;
  unit_of_measure?: string;
  is_must?: boolean;
  value?: string;
};

export const Categories = (): JSX.Element => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [rootElements, setRootElements] = useState<Direction[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  const getElementsFromRequest = (data: any): Direction[] => {
    return data.map((elem: any) => ({ label: elem.title, id: elem.uid, ...elem }));
  };

  const onElementSelected = (direction: Direction, nestValue: number): void => {
    setSelectedElements((prev) => {
      const newValue = [...prev];
      newValue[nestValue] = direction.id;
      return newValue;
    });
  };

  const onElementDeleted = (id: string, nest: number): void => {
    axios
      .delete(`${SERVER_ADDRESS}/api/v1/tag/${id}`, {
        headers: {
          Authorization: TOKEN,
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

  const onSelectDirection = (direction: Direction, nestValue: number): void => {
    if (nestValue < 2) {
      axios
        .get(`${SERVER_ADDRESS}/api/v1/tag/${direction.id}/children`, {
          headers: {
            Authorization: TOKEN,
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
      axios
        .get(`${SERVER_ADDRESS}/api/v1/tag/${direction.id}/property`, {
          headers: {
            Authorization: TOKEN,
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
    }
  };

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/`, {
        params: {
          root: true,
        },
        headers: {
          Authorization: TOKEN,
        },
      })
      .then((res) => setRootElements(getElementsFromRequest(res.data)));
  }, []);

  const onTagCreated = (title: string, parent: string | undefined, nestValue: number): void => {
    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/tag/`,
        {
          title,
          description: '',
          is_main_kb: true,
        },
        {
          params: {
            parent_id: parent,
          },
          headers: {
            Authorization: TOKEN,
          },
        },
      )
      .then((res) => {
        if (parent) {
          setDirections((prev) => {
            const newValue = [...prev];
            console.log(newValue[nestValue - 1]);
            newValue[nestValue - 1].elements = [
              { label: res.data.title, id: res.data.uid },
              ...(newValue[nestValue - 1]?.elements || []),
            ];
            newValue.findIndex((elem) => elem.id === parent);
            return newValue;
          });
        } else {
          setRootElements((prev) => [
            ...prev,
            { label: res.data.title, id: res.data.uid, ...res.data },
          ]);
        }
      });
  };

  const onPropertyCreated = (id: string): void => {
    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/tag/${id}/property`,
        {
          value: '',
          key: '0',
        },
        {
          headers: {
            Authorization: TOKEN,
          },
        },
      )
      .then((res) => {
        setDirections((prev) => {
          const newValue = [...prev];

          newValue[newValue.length - 1].elements = [
            { label: res.data.value, id: res.data.uid },
            ...(newValue[newValue.length - 1]?.elements || []),
          ];

          return newValue;
        });
      });
  };

  const onPropertyDeleted = (tagId: string, id: string): void => {
    setDirections((prev) => {
      const newValues = [...prev];
      newValues[newValues.length - 1].elements = newValues[newValues.length - 1].elements?.filter(
        (elem) => elem.id !== id,
      );
      return newValues;
    });
    axios.delete(`${SERVER_ADDRESS}/api/v1/tag/${tagId}/property/${id}`, {
      headers: {
        Authorization: TOKEN,
      },
    });
  };

  const onPropertyUpdated = (
    tagId: string,
    id: string,
    body: Record<string, string | Array<string> | boolean | number>,
  ): void => {
    axios.put(
      `${SERVER_ADDRESS}/api/v1/tag/${tagId}/property/${id}`,
      { ...body, key: '' },
      {
        headers: {
          Authorization: TOKEN,
        },
      },
    );
  };

  return (
    <div className={styles.categories}>
      <div className={styles.menu}>
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>База знаний</h2>
          </div>
        </div>
        <div className={styles.directions}>
          <Category
            title={'Товарное направление'}
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
                key={direction.id}
                onPropertyCreated={() => onPropertyCreated(direction.id)}
                onDelete={(id) => onPropertyDeleted(direction.id, id)}
                onPropertyUpdated={(id, body) => onPropertyUpdated(direction.id, id, body)}
              />
            ) : (
              <Category
                key={direction.id}
                title={direction.label}
                elements={direction.elements}
                onCategoryClick={(id) => onSelectDirection(id, idx + 1)}
                bordered={false}
                onTagCreated={(title) => onTagCreated(title, direction.id, idx + 1)}
                onElementSelected={(direction) => onElementSelected(direction, idx + 1)}
                selectedElement={selectedElements[idx + 1]}
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
  onDelete,
}: {
  title: string;
  onCategoryClick: (direction: Direction) => void;
  bordered?: boolean;
  onTagCreated: (title: string) => void;
  elements: Direction[] | undefined;
  onElementSelected: (element: Direction) => void;
  selectedElement: string;
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
      <div className={styles.categoryHeader}>
        <div className={styles.categoryTitle}>{title}</div>
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
            key={elem.id}
            onClick={() => onElementClick(elem)}
          >
            {elem.label}
            <Trash
              className={styles.trash}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(elem.id);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const LeafCategory = ({
  direction,
  onPropertyCreated,
  onDelete,
  onPropertyUpdated,
}: {
  direction: Direction;
  onPropertyCreated: () => void;
  onDelete: (id: string) => void;
  onPropertyUpdated: (
    id: string,
    body: Record<string, string | Array<string> | boolean | number>,
  ) => void;
}): JSX.Element => {
  const onSave = (): void => {
    onPropertyCreated();
  };

  return (
    <div className={classNames(styles.direction, styles.lastDirection)}>
      <div className={styles.categoryHeader}>
        <div className={styles.categoryTitle}>{direction.label}</div>
        <AddButton onClick={onSave} />
      </div>
      <div className={styles.leafCategoryList}>
        {direction?.elements?.map((elem) => (
          <Property
            elem={elem}
            onDelete={() => onDelete(elem.id)}
            onPropertyUpdated={(body) => onPropertyUpdated(elem.id, body)}
          />
        ))}
      </div>
    </div>
  );
};

const Property = ({
  elem,
  onDelete,
  onPropertyUpdated,
}: {
  elem: Direction;
  onDelete: () => void;
  onPropertyUpdated: (body: Record<string, string | Array<string> | boolean | number>) => void;
}): JSX.Element => {
  console.log(elem);
  const [value_type, setValue_type] = useState(elem.value_type || '');
  const [typeInitialized, setTypeInitialized] = useState(false);
  const [unit_of_measure, setUnit_of_measure] = useState(elem.unit_of_measure || '');
  const [unit_of_measureInitialized, setUnit_of_measureInitialized] = useState(false);
  const [min_value, setMin_value] = useState(elem.min_value || 0);
  const [min_valueInitialized, setMin_valueInitialized] = useState(false);
  const [max_value, setMax_value] = useState(elem.max_value || 0);
  const [max_valueInitialized, setMax_valueInitialized] = useState(false);
  const [value, setValue] = useState(elem.value || '');
  const [valueInitialized, setValueInitialized] = useState(false);
  const [is_must, setIs_must] = useState<boolean>(elem.is_must || false);
  const [is_mustInitialized, setIs_mustInitialized] = useState(false);

  const [generation] = useState(elem.generation || 'Учитывать');
  const [generationInitialized, setGenerationInitialized] = useState(false);
  const [synonyms, setSynonyms] = useState(elem.synonyms || []);
  const [synonymsInitialized, setSynonymsInitialized] = useState(false);

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (typeInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated({ value_type });
      }, 300);
    } else {
      setTypeInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [onPropertyUpdated, value_type]);

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (unit_of_measureInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated({ unit_of_measure });
      }, 300);
    } else {
      setUnit_of_measureInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [unit_of_measure, onPropertyUpdated]);

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (min_valueInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated({ min_value });
      }, 300);
    } else {
      setMin_valueInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [min_value, onPropertyUpdated]);

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (max_valueInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated({ max_value });
      }, 300);
    } else {
      setMax_valueInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [max_value, onPropertyUpdated]);

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (is_mustInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated({ is_must });
      }, 300);
    } else {
      setIs_mustInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [onPropertyUpdated, is_must]);

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (generationInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated({ generation });
      }, 300);
    } else {
      setGenerationInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [generation, onPropertyUpdated]);

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (synonymsInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated({ synonyms });
      }, 300);
    } else {
      setSynonymsInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [onPropertyUpdated, synonyms]);

  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    if (valueInitialized) {
      handler = setTimeout(() => {
        onPropertyUpdated({ value });
      }, 300);
    } else {
      setValueInitialized(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [onPropertyUpdated, value]);

  const [newSynonym, setNewSynonym] = useState('');

  const onSave = (): void => {
    setSynonyms((prev) => [newSynonym, ...prev]);
    setNewSynonym('');
  };

  return (
    <div className={styles.leaf}>
      <Trash
        className={styles.trashLeaf}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      />
      <div className={styles.leafBlock}>
        <div className={styles.leafTitle}>Название ключа</div>
        <div className={styles.leafInput}>
          <div className={styles.leafInputLabel}>Тип характеристики</div>

          <Input
            placeholder="Device"
            className={styles.input}
            onChange={(e) => setValue_type(e.target.value)}
            value={value_type}
          />
        </div>

        <div className={styles.leafInput}>
          <div className={styles.leafInputLabel}>Размерность</div>
          <Input
            placeholder="Размерность"
            className={styles.input}
            onChange={(e) => setUnit_of_measure(e.target.value)}
            value={unit_of_measure}
          />
        </div>

        <div className={styles.leafInputs}>
          <div className={styles.leafInput}>
            <div className={styles.leafInputLabel}>Мин. знач.</div>
            <Input
              placeholder="Мин"
              className={styles.input}
              onChange={(e) => setMin_value(parseFloat(e.target.value))}
              value={min_value}
            />
          </div>
          <div className={styles.leafInput}>
            <div className={styles.leafInputLabel}>Макс. знач.</div>
            <Input
              placeholder="Макс"
              className={styles.input}
              onChange={(e) => setMax_value(parseFloat(e.target.value))}
              value={max_value}
            />
          </div>
        </div>

        <div className={styles.leafInput}>
          <div className={styles.leafInputLabel}>Значение по умолчанию</div>
          <Input
            placeholder="Значение"
            className={styles.input}
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
        </div>
        <div className={styles.leafInputs}>
          <div className={styles.leafInput}>
            <div className={styles.leafInputLabel}>Скрейпить?</div>
            <Checkbox
              className={styles.checkbox}
              checked={is_must}
              // @ts-expect-error no err
              onCheckedChange={(e) => setIs_must(e)}
            />
          </div>
          <div className={styles.leafInput}>
            <div className={styles.leafInputLabel}>Генерация?</div>
            <div className={styles.leafInputValue}>Учитывать</div>
          </div>
        </div>
      </div>
      <div className={styles.leafBlock}>
        <div className={styles.leafTitle}>
          Синонимы
          <AddButton>
            <div className={styles.tooltip}>
              <div className={classNames('grid w-full max-w-sm items-center gap-1.5')}>
                <Label htmlFor="add">Title</Label>
                <Input
                  id="add"
                  placeholder="Title"
                  value={newSynonym}
                  onChange={(e) => setNewSynonym(e.target.value)}
                />
              </div>
              <Check className={styles.tooltipCheck} onClick={onSave} />
            </div>
          </AddButton>
        </div>
        <div className={styles.synonyms}>
          {synonyms.map((synonym) => (
            <div className={styles.synonym}>{synonym}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

