/**
 * Copyright (c) 2023-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, type ClipboardEvent, useRef, useEffect } from 'react';
import { PRIMITIVE_TYPE } from '@finos/legend-engine-ide-client-vscode-shared';
import Select from 'react-select';
import { type Enumeration } from '../../model/Enumeration';
import { type Multiplicity } from '../../model/VariableExpression';

export const getDefaultValueForPrimitiveType = (
  type: string,
  multiplicity: Multiplicity,
  element?: Enumeration | undefined,
): unknown => {
  if (multiplicity.upperBound === 1) {
    if (element) {
      return element.values[0]?.value;
    }
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
  } else {
    return [];
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

interface EnumValueOption {
  label: string;
  value: string;
}

export const EnumValueEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  enumValues: string[];
  isDarkTheme: boolean;
}> = ({ value, onChange, enumValues, isDarkTheme }) => {
  const [val, setVal] = useState<EnumValueOption>({
    label: value,
    value: value,
  });
  const options: EnumValueOption[] = enumValues.map((e) => ({
    label: e,
    value: e,
  }));
  const updateVal = (v: EnumValueOption | null): void => {
    if (v !== null) {
      setVal(v);
      onChange(v.value);
    }
  };
  return (
    <div className="primitive__editor__enum__value__editor">
      <Select
        styles={{
          option: (base) => ({
            ...base,
            backgroundColor: isDarkTheme
              ? 'black'
              : '--vscode-input-background',
            color: '--vscode-input-foreground',
          }),
          control: (base) => ({
            ...base,
            backgroundColor: '--vscode-input-background',
            color: '--vscode-input-foreground',
          }),
          singleValue: (base) => ({
            ...base,
            backgroundColor: '--vscode-input-background',
            color: '--vscode-input-foreground',
          }),
        }}
        className="primitive__editor__enum__value__editor__input"
        options={options}
        value={val}
        onChange={updateVal}
      />
    </div>
  );
};

export const CollectionValueEditor: React.FC<{
  values: unknown;
  type: string | number;
  onChange: (value: unknown) => void;
  parseValue: (value: unknown) => unknown | undefined;
}> = ({ values, type, onChange, parseValue }) => {
  const [collectionValues, setCollectionValues] = useState(
    values as (typeof type)[],
  );
  const [inputValue, setInputValue] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const tagsInputRef = useRef<HTMLDivElement | null>(null);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
    e,
  ): void => {
    if (e.target.value !== '') {
      if (e.target.value.endsWith(',')) {
        const newTag = inputValue.trim();
        const parsedTag = parseValue(newTag);
        if (
          parsedTag &&
          collectionValues.indexOf(parsedTag as typeof type) === -1
        ) {
          setCollectionValues([...collectionValues, newTag]);
          onChange(collectionValues);
        }
        setInputValue('');
      } else {
        setInputValue(e.target.value);
      }
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    e,
  ): void => {
    if (e.key === 'Enter') {
      const newTag = inputValue.trim();
      const parsedTag = parseValue(newTag);
      if (
        parsedTag &&
        collectionValues.indexOf(parsedTag as typeof type) === -1
      ) {
        setCollectionValues([...collectionValues, newTag]);
        onChange(collectionValues);
      }
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: typeof type): void => {
    setCollectionValues((prevSelected) =>
      prevSelected.filter((tag) => tag !== tagToRemove),
    );
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
    const pastedText = e.clipboardData.getData('text');
    const pastedTags = pastedText.split(',').map((tag: string) => tag.trim());
    setCollectionValues([...collectionValues, ...pastedTags]);
    e.preventDefault();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        tagsInputRef.current &&
        !tagsInputRef.current.contains(event.target as Node)
      ) {
        setIsEditMode(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="primitive__editor__collection__value__editor">
      {isEditMode ? (
        <div
          className="primitive__editor__collection__value__editor__tags-input"
          ref={tagsInputRef}
        >
          {collectionValues.map((tag) => (
            <span
              className="primitive__editor__collection__value__editor__tag"
              key={tag}
            >
              {tag}
              <button
                className="primitive__editor__collection__value__editor__delete"
                onClick={() => handleRemoveTag(tag)}
              />
            </span>
          ))}
          <input
            className="primitive__editor__collection__value__editor__tags-input__input"
            type="text"
            placeholder="Add"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            ref={inputRef}
          />
        </div>
      ) : (
        <div className="primitive__editor__collection__value__editor__tags-input-read-only">
          <input
            className="primitive__editor__collection__value__editor__tags-input-read-only__input"
            type="text"
            value={collectionValues.join(', ')}
            readOnly={true}
          />
          <button
            className="primitive__editor__collection__value__editor__tags-input-read-only__btn"
            onClick={(): void => setIsEditMode(!isEditMode)}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export const PrimitiveTypeEditor: React.FC<{
  type: string;
  multiplicity: Multiplicity;
  value: unknown;
  onChange: (val: unknown) => void;
}> = ({ type, multiplicity, value, onChange }) => {
  if (multiplicity.upperBound === 1) {
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
          <DatePrimitiveTypeEditor
            value={value as string}
            onChange={onChange}
          />
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
  } else {
    switch (type) {
      case PRIMITIVE_TYPE.STRING:
        return (
          <CollectionValueEditor
            values={[]}
            type="string"
            onChange={onChange}
            parseValue={(val: unknown): string => val as string}
          />
        );
      case PRIMITIVE_TYPE.NUMBER:
      case PRIMITIVE_TYPE.INTEGER:
      case PRIMITIVE_TYPE.DECIMAL:
      case PRIMITIVE_TYPE.FLOAT:
      case PRIMITIVE_TYPE.BINARY:
      case PRIMITIVE_TYPE.BYTE: {
        const parseValue = (val: unknown): number | undefined =>
          isNaN(Number(val)) ? undefined : Number(val);
        return (
          <CollectionValueEditor
            values={[]}
            type="number"
            onChange={onChange}
            parseValue={parseValue}
          />
        );
      }
      default:
        return <DefaultEditor value={value} onChange={onChange} />;
    }
  }
};

export const InstanceValueEditor: React.FC<{
  type: string;
  multiplicity: Multiplicity;
  value: unknown;
  onChange: (val: unknown) => void;
  isDarkTheme: boolean;
  element: Enumeration | undefined;
}> = ({ type, multiplicity, value, onChange, isDarkTheme, element }) => {
  if (element) {
    if (multiplicity.upperBound === 1) {
      return (
        <EnumValueEditor
          isDarkTheme={isDarkTheme}
          value={value as string}
          onChange={onChange}
          enumValues={element.values.map((e) => e.value)}
        />
      );
    } else {
      const parseValue = (val: unknown): string | undefined => {
        if (element.values.find((v) => v.value === value)) {
          return val as string;
        }
        return undefined;
      };
      return (
        <CollectionValueEditor
          type="string"
          values={[]}
          onChange={onChange}
          parseValue={parseValue}
        />
      );
    }
  } else {
    return (
      <PrimitiveTypeEditor
        value={value}
        type={type}
        multiplicity={multiplicity}
        onChange={onChange}
      />
    );
  }
};
