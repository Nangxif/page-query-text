import { Select } from 'antd';
import styles from './index.less';

type ShortcutPickerProps = {
  value?: string[];
  onChange?: (shortcut: string[]) => void;
};
// 几个特殊的js的keypress能获取到的键盘按键+26个小写字母
const specialKeys = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'];
const options = [
  { label: 'Ctrl', value: 'ctrlKey' },
  { label: 'Shift', value: 'shiftKey' },
  { label: 'Alt', value: 'altKey' },
  { label: 'Meta', value: 'metaKey' },
].concat(
  Array.from({ length: 26 }, (_, index) => ({
    label: String.fromCharCode(97 + index),
    value: String.fromCharCode(97 + index),
  })),
);

const ShortcutPicker = (props: ShortcutPickerProps) => {
  const { value, onChange } = props;

  const handleChange = (value: string[]) => {
    onChange?.(
      value?.map((item) =>
        specialKeys.includes(item) ? item : item.toLowerCase(),
      ),
    );
  };
  return (
    <Select
      mode="tags"
      style={{ width: '100%' }}
      placeholder="请输入快捷键"
      value={value}
      onChange={handleChange}
      options={options}
      allowClear
      popupClassName={styles['popup-container']}
      className={styles['shortcut-picker']}
    />
  );
};

export default ShortcutPicker;
