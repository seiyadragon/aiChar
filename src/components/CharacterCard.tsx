import styles from './CharacterCard.module.scss';
import { Character } from '~/lib/types';
import { Show, createSignal } from 'solid-js';
import { AiOutlinePlus } from 'solid-icons/ai'

export default function CharacterCard(props: { character?: Character, getCharImage?: Function, onOpen?: Function, isAdd?: boolean, newChar?: Function}) {  
  function onClick() {
    if (props.onOpen)
      props.onOpen(props.character);
  }

  function addNewCharacter() {
    if (props.newChar)
      props.newChar();
  }

  function getCharImage(): string {
    if (props.getCharImage)
      return props.getCharImage(props.character?.image);
    return "";
  }

  return (
    <>
      <Show when={!props.isAdd}>
        <div class={styles.characterCard} onClick={onClick}>
          <div class={styles.image} style={{ "background-image": "url(" + JSON.stringify(getCharImage()) + ")" }} />
          <div>
            <p class={styles.name}>{props.character?.firstName} {props.character?.middleName} {props.character?.lastName}</p>
          </div>
        </div>
      </Show>
      <Show when={props.isAdd}>
        <div class={styles.characterCard} onClick={addNewCharacter}>
          <AiOutlinePlus size={96} />
        </div>
      </Show>
    </>
  );
}