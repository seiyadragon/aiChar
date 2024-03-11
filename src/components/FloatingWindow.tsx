import { ParentProps } from 'solid-js';
import styles from './FloatingWindow.module.scss';
import { AiOutlineCloseCircle } from 'solid-icons/ai'

export default function FloatingWindow(props: ParentProps<{title: string, onClose: Function, width: number, height: number}>) {
  function close() {
    props.onClose()
  }

  return (
    <div class={styles.floatingWindow} style={{ 
      "width": JSON.stringify(props.width) + "px", 
      "height": JSON.stringify(props.height) + "px" 
    }}>
      <div class={styles.titleBar}>
        <div class={styles.title}>{props.title}</div>
        <div class={styles.controls}>
          <button onClick={close}><AiOutlineCloseCircle /></button>
        </div>
      </div>
      <div class={styles.content}>
        {props.children}
      </div>
    </div>
  );
}