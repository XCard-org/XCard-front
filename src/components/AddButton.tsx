import { Button } from '@/components/ui/button';
import styles from './AddButton.module.scss';
import Plus from '../assets/Plus.svg?react';
import classNames from 'classnames';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

export const AddButton = ({
  onClick,
  className,
  children,
}: {
  onClick?: () => void;
  className?: string;
  children?: JSX.Element;
}): JSX.Element => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={classNames(styles.add, className)}
          onClick={onClick}
        >
          <Plus />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">{children}</PopoverContent>
    </Popover>
  );
};

