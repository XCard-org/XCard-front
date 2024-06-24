import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import styles from './RestrictionCard.module.scss';
import { Textarea } from '@/components/ui/textarea';
import { EditButton } from '@/components/EditButton';

export const RestrictionCard = ({
  value,
}: {
  value: {
    label: string;
    value: string;
    id: number;
  };
}): JSX.Element => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>{value.label}</h3>
        <EditButton />
      </div>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Text" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Text</SelectItem>
        </SelectContent>
      </Select>
      <Textarea value={value?.value} className={styles.textarea} />
    </div>
  );
};

