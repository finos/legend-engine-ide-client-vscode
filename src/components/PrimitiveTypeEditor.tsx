import { useState } from 'react';
import { PRIMITIVE_TYPE } from '../utils/Const';

export const getDefaultValueForPrimitiveType = (type: string): unknown => {
  switch (type) {
    case PRIMITIVE_TYPE.STRING:
      return '';
    case PRIMITIVE_TYPE.BOOLEAN:
      return false;
    case PRIMITIVE_TYPE.NUMBER:
    case PRIMITIVE_TYPE.INTEGER:
    case PRIMITIVE_TYPE.DECIMAL:
    case PRIMITIVE_TYPE.FLOAT:
    case PRIMITIVE_TYPE.BINARY:
      return 0;
    case PRIMITIVE_TYPE.BYTE:
      return btoa('');
    case PRIMITIVE_TYPE.DATE:
    case PRIMITIVE_TYPE.STRICTDATE:
      return new Date(Date.now()).toISOString().split('T')[0];
    case PRIMITIVE_TYPE.DATETIME:
      return new Date(Date.now()).toISOString();
    default:
      return '';
  }
};

export const BooleanPrimitiveTypeEditor: React.FC<{
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ value, onChange }) => {
  const [val, setVal] = useState(value);
  const updateVal: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setVal(event.target.checked);
    onChange(event.target.checked);
  };
  return (
    <div className="primitive__editor__boolean__type__editor">
      <input
        className="primitive__editor__boolean__type__editor__input"
        type="checkbox"
        checked={val}
        onChange={updateVal}
      />
    </div>
  );
};

export const StringPrimitiveTypeEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [val, setVal] = useState(value);
  const updateVal: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setVal(event.target.value);
    onChange(event.target.value);
  };
  return (
    <div className="primitive__editor__string__type__editor">
      <input
        className="primitive__editor__string__type__editor__input"
        spellCheck={false}
        placeholder={val === '' ? '(empty)' : undefined}
        value={val}
        onChange={updateVal}
      />
    </div>
  );
};

export const NumberPrimitiveTypeEditor: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const [val, setVal] = useState(value);
  const updateVal: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setVal(Number(event.target.value));
    onChange(Number(event.target.value));
  };
  return (
    <div className="primitive__editor__number__type__editor">
      <input
        className="primitive__editor__number__type__editor__input"
        type="number"
        spellCheck={false}
        value={val}
        onChange={updateVal}
      />
    </div>
  );
};

export const DatePrimitiveTypeEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [val, setVal] = useState(value);
  const updateVal: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setVal(event.target.value);
    onChange(event.target.value);
  };
  return (
    <div className="primitive__editor__date__type__editor">
      <input
        className="primitive__editor__date__type__editor__input"
        type="date"
        spellCheck={false}
        value={val}
        onChange={updateVal}
      />
    </div>
  );
};

export const DateTimePrimitiveTypeEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [val, setVal] = useState(value);
  const updateVal: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setVal(event.target.value);
    onChange(event.target.value);
  };
  return (
    <div className="primitive__editor__date__type__editor">
      <input
        className="primitive__editor__date__type__editor__input"
        // Despite its name this would actually allow us to register time in UTC
        // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#setting_timezones
        type="datetime-local"
        // Configure the step to show seconds picker
        // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#step
        step="1"
        spellCheck={false}
        value={val}
        onChange={updateVal}
      />
    </div>
  );
};

export const DefaultEditor: React.FC<{
  value: unknown;
  onChange: (value: unknown) => void;
}> = ({ value, onChange }) => {
  const [val, setVal] = useState(value);
  const updateVal: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setVal(event.target.value);
    onChange(event.target.value);
  };
  return (
    <div className="primitive__editor__default__editor">
      <textarea
        className="primitive__editor__default__editor__input"
        spellCheck={false}
        value={val as string}
        onChange={updateVal}
      />
    </div>
  );
};

export const PrimitiveTypeEditor: React.FC<{
  type: string;
  value: unknown;
  onChange: (val: unknown) => void;
}> = ({ type, value, onChange }) => {
  switch (type) {
    case PRIMITIVE_TYPE.STRING:
      return (
        <StringPrimitiveTypeEditor
          value={value as string}
          onChange={onChange}
        />
      );
    case PRIMITIVE_TYPE.BOOLEAN:
      return (
        <BooleanPrimitiveTypeEditor
          value={value as boolean}
          onChange={onChange}
        />
      );
    case PRIMITIVE_TYPE.NUMBER:
    case PRIMITIVE_TYPE.INTEGER:
    case PRIMITIVE_TYPE.DECIMAL:
    case PRIMITIVE_TYPE.FLOAT:
    case PRIMITIVE_TYPE.BINARY:
    case PRIMITIVE_TYPE.BYTE:
      return (
        <NumberPrimitiveTypeEditor
          value={value as number}
          onChange={onChange}
        />
      );
    case PRIMITIVE_TYPE.DATE:
    case PRIMITIVE_TYPE.STRICTDATE:
      return (
        <DatePrimitiveTypeEditor value={value as string} onChange={onChange} />
      );
    case PRIMITIVE_TYPE.DATETIME:
      return (
        <DateTimePrimitiveTypeEditor
          value={value as string}
          onChange={onChange}
        />
      );
    default:
      return <DefaultEditor value={value} onChange={onChange} />;
  }
};
