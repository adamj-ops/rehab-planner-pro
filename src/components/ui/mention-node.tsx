'use client';

import * as React from 'react';

import type { TComboboxInputElement, TMentionElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { getMentionOnSelectItem } from '@platejs/mention';
import { IS_APPLE, KEYS } from 'platejs';
import {
  PlateElement,
  useFocused,
  useReadOnly,
  useSelected,
} from 'platejs/react';

import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import { useEditorContext } from '@/components/editor/editor-context';
import {
  useProjectEntities,
  filterEntities,
  groupEntitiesByType,
  getEntityTypeLabel,
  type MentionableEntity,
} from '@/hooks/use-project-entities';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

// Get icon for entity type based on the key prefix
function getEntityIcon(key: string): string {
  if (key.startsWith('room-')) return '🏠';
  if (key.startsWith('vendor-')) return '👷';
  if (key.startsWith('scope-')) return '🔧';
  if (key.startsWith('material-')) return '🪵';
  return '@';
}

export function MentionElement(
  props: PlateElementProps<TMentionElement> & {
    prefix?: string;
  }
) {
  const element = props.element;

  const selected = useSelected();
  const focused = useFocused();
  const mounted = useMounted();
  const readOnly = useReadOnly();

  // Get icon based on the mention key (stored in element data)
  const mentionKey = (element as unknown as { key?: string }).key || '';
  const icon = getEntityIcon(mentionKey);

  return (
    <PlateElement
      {...props}
      className={cn(
        'inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline font-medium text-sm',
        !readOnly && 'cursor-pointer',
        selected && focused && 'ring-2 ring-ring',
        element.children[0][KEYS.bold] === true && 'font-bold',
        element.children[0][KEYS.italic] === true && 'italic',
        element.children[0][KEYS.underline] === true && 'underline'
      )}
      attributes={{
        ...props.attributes,
        contentEditable: false,
        'data-slate-value': element.value,
        'data-mention-type': mentionKey.split('-')[0],
        draggable: true,
      }}
    >
      {mounted && IS_APPLE ? (
        // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
        <>
          {props.children}
          {icon !== '@' && <span className="mr-0.5">{icon}</span>}
          {props.prefix}
          {element.value}
        </>
      ) : (
        // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
        <>
          {icon !== '@' && <span className="mr-0.5">{icon}</span>}
          {props.prefix}
          {element.value}
          {props.children}
        </>
      )}
    </PlateElement>
  );
}

const onSelectItem = getMentionOnSelectItem();

export function MentionInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props;
  const [search, setSearch] = React.useState('');
  
  // Get project context for fetching entities
  const { projectId } = useEditorContext();
  const { data: entities = [], isLoading } = useProjectEntities(projectId);
  
  // Filter and group entities
  const filteredEntities = React.useMemo(
    () => filterEntities(entities, search),
    [entities, search]
  );
  
  const groupedEntities = React.useMemo(
    () => groupEntitiesByType(filteredEntities),
    [filteredEntities]
  );
  
  // Fallback mentionables when no project context
  const fallbackItems: MentionableEntity[] = React.useMemo(() => {
    if (projectId) return [];
    return [
      { key: 'example-room', text: 'Kitchen', type: 'room', icon: '🏠' },
      { key: 'example-room-2', text: 'Master Bath', type: 'room', icon: '🏠' },
      { key: 'example-vendor', text: 'ABC Plumbing', type: 'vendor', icon: '👷' },
      { key: 'example-scope', text: 'Replace HVAC', type: 'scope_item', icon: '🔧' },
    ];
  }, [projectId]);
  
  const displayEntities = projectId ? filteredEntities : fallbackItems;
  const displayGroups = projectId ? groupedEntities : groupEntitiesByType(fallbackItems);

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox
        value={search}
        element={element}
        setValue={setSearch}
        showTrigger={false}
        trigger="@"
      >
        <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm ring-ring focus-within:ring-2">
          <InlineComboboxInput />
        </span>

        <InlineComboboxContent className="my-1.5">
          {isLoading ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : displayEntities.length === 0 ? (
            <InlineComboboxEmpty>
              {search ? 'No matching items' : 'No items available'}
            </InlineComboboxEmpty>
          ) : (
            Object.entries(displayGroups).map(([type, items]) => (
              <InlineComboboxGroup key={type}>
                <InlineComboboxGroupLabel>
                  {getEntityTypeLabel(type)}
                </InlineComboboxGroupLabel>
                {items.map((item) => (
                  <InlineComboboxItem
                    key={item.key}
                    value={item.text}
                    onClick={() => onSelectItem(editor, { key: item.key, text: item.text }, search)}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    {item.text}
                  </InlineComboboxItem>
                ))}
              </InlineComboboxGroup>
            ))
          )}
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}
