import { action } from '@ladle/react';
import { Button } from './button';

export default {
  title: 'Components / Button',
};

const onClick = action('onClick');

export const PrimaryButton = () => {
  return <Button onClick={onClick}>Example</Button>;
};

export const PrimaryDisabledButton = () => {
  return (
    <Button onClick={onClick} disabled>
      Example
    </Button>
  );
};

export const PrimaryLoadingButton = () => {
  return (
    <Button onClick={onClick} isLoading>
      Example
    </Button>
  );
};

export const SecondaryButton = () => {
  return (
    <Button variant='secondary' onClick={onClick}>
      Example
    </Button>
  );
};

export const SecondaryDisabledButton = () => {
  return (
    <Button variant='secondary' onClick={onClick} disabled>
      Example
    </Button>
  );
};

export const SecondaryLoadingButton = () => {
  return (
    <Button variant='secondary' onClick={onClick} isLoading>
      Example
    </Button>
  );
};

export const DangerButton = () => {
  return (
    <Button variant='danger' onClick={onClick}>
      Example
    </Button>
  );
};

export const DangerDisabledButton = () => {
  return (
    <Button variant='danger' onClick={onClick} disabled>
      Example
    </Button>
  );
};

export const DangerLoadingButton = () => {
  return (
    <Button variant='danger' onClick={onClick} isLoading>
      Example
    </Button>
  );
};
