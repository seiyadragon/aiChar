import styles from './InteractiveArray.module.scss';
import { For, createEffect, createSignal, onMount } from 'solid-js';
import { CharacterEvent, CharacterTrait } from '~/lib/types';

export default function InteractiveArray<T extends CharacterTrait | CharacterEvent>(props: { 
  array: Array<T>, 
  title: string, 
  onAdd?: Function, 
  onRemove?: Function, 
  itemBodyFunction?: Function,
  onDoubleClick?: Function,
  style?: string,
}) {
  let [array, setArray] = createSignal([...props.array]);
  let [selected, setSelected] = createSignal("");
  let [justClicked, setJustClicked] = createSignal(false);

  let [style, setStyle] = createSignal("display: flex; flex-direction: column;")

  
  onMount(() => {
    if (props.style) {
      setStyle(style() + " " + props.style);
    }
  })

  createEffect(() => {
    setArray([...props.array])
  })

  function add() {
    if (props.onAdd)
      props.onAdd();
  }

  function remove() {
    if (props.onRemove)
      props.onRemove(array().find((item) => item.name === selected()))
  }

  function bodyFunction(item: T) {
    if (props.itemBodyFunction)
      return props.itemBodyFunction(item);
    else
      return <p>{item.name}</p>
  }

  function click(item: T) {
    setSelected(item.name);

    if (justClicked()) {
      doubleClick(item);
      setJustClicked(false);
    } else {
      setJustClicked(true);

      setTimeout(() => {
        setJustClicked(false);
      }, 250);
    }
  }

  function doubleClick(item: T) {
    if (props.onDoubleClick)
      props.onDoubleClick(item);
  }

  return (
    <div class={styles.interactiveArray} style={style()}>
      <div class={styles.titleSection}>
        <p>{props.title}</p>
      </div>
      <ul class={styles.listSection}>
        <For each={array()}>
          {item => {
            return (
              <li onClick={() => click(item)} style={{ 
                "border": selected() === item.name ? "1px solid #2196f3" : "1px solid #f5f5f5",
              }}>
                <p><em>{ item.name }</em></p>
                {bodyFunction(item)}
              </li>
            )
          }}
        </For>
      </ul>
      <div class={styles.actionBar2}>
        <button type="button" onClick={add}>Add</button>
        <button type="button" onClick={remove}>Remove</button>
      </div>
    </div>
  );
}

