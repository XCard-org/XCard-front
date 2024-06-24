import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import styles from './Device.module.scss';
import { AddButton } from '@/components/AddButton';

export const Device = (): JSX.Element => {
  return (
    <div className={styles.device}>
      <h2 className={styles.header}>Тип девайса</h2>
      <div className={styles.topBlock}>
        <div>
          <h3 className={styles.category}>Категория на маркетплейсе</h3>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Free text" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Free text</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={styles.tags}>
          <div className={styles.tagsHeader}>
            <h3>Теги категории</h3>
            <div>
              <AddButton />
            </div>
          </div>
          <div className={styles.tagsList}>
            {tags.map((tag, idx) => (
              <div key={idx} className={styles.tag}>
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
};

const tags = [
  'label',
  'label',
  'label',
  'label',
  'label',
  'label',
  'label',
  'label',
  'label',
  'label',
  'label',
  'label',
  'label',
  'label',
];

