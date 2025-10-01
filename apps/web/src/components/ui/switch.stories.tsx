import { Switch } from './switch';

export default {
  title: 'Components / Switch',
};

export const UncheckedSwitch = () => {
  return <Switch />;
};

export const CheckedSwitch = () => {
  return <Switch defaultChecked />;
};

export const DisabledUncheckedSwitch = () => {
  return <Switch disabled />;
};

export const DisabledCheckedSwitch = () => {
  return <Switch defaultChecked disabled />;
};
