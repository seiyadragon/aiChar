import { ParentProps, Show, createEffect, createSignal } from 'solid-js'
import styles from './Sidebar.module.scss'

export default function Sidebar(props: ParentProps<{onOpen: Function, onClose: Function}>) {
  let [sidebarStyle, setSidebarStyle] = createSignal(styles.sidebar)

  function onSidebarMouseEnter() {
    setSidebarStyle(styles.sidebarOpen)
    props.onOpen()
  }

  function onSidebarMouseLeave() {
    setSidebarStyle(styles.sidebar)
    props.onClose()
  }

  return (
    <aside class={sidebarStyle()} onMouseEnter={onSidebarMouseEnter} onMouseLeave={onSidebarMouseLeave}>
      {props.children}
    </aside>
  )
}

export function SidebarChild(props: ParentProps<{label: string, open: boolean, onClick: Function}>) {
  let [sidebarStyle, setSidebarStyle] = createSignal(styles.sidebarChild)

  createEffect(() => {
    setSidebarStyle(props.open ? styles.sidebarChildOpen : styles.sidebarChild)
  })

  function onSidebarChildClick() {
    props.onClick()
  }

  return (
    <a class={sidebarStyle()} onClick={onSidebarChildClick}>
      <span class={styles.sidebarChildIcon}>
        {props.children}
      </span>
      <Show when={props.open}>
        <span class={styles.sidebarChildText}>{props.label}</span>
      </Show>
    </a>
  )
}