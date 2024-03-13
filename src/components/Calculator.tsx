import { createEffect, createSignal, onMount } from 'solid-js';
import styles from './Calculator.module.scss';

export default function Calculator() {
  let [display, setDisplay] = createSignal("0")
  let buttonZeroRef: any;

  function addValue(value: string) {
    setDisplay(display() + value)
  }

  function clearValue() {
    setDisplay("0")
  }

  function calculateExppression() {
    try {
      setDisplay(eval(display()))
    } catch (e: any) {
      setDisplay(e.message)
    }
  }

  createEffect(() => {
    if (display().length > 1 && display().startsWith("0")) {
      setDisplay(display().substring(1))
    }
  })

  function onInput(input: any) {
    addValue(input.data ?? "")
  }

  return (
    <>
        <div class={styles.calculator}>
            <input type="text" class={styles.display} value={display()} onInput={onInput}/>
            <div class={styles.buttons}>
              <button onClick={() => addValue("7")}>7</button>
              <button onClick={() => addValue("8")}>8</button>
              <button onClick={() => addValue("9")}>9</button>
              <button onClick={() => addValue("+")}>+</button>
              <button onClick={() => addValue("4")}>4</button>
              <button onClick={() => addValue("5")}>5</button>
              <button onClick={() => addValue("6")}>6</button>
              <button onClick={() => addValue("-")}>-</button>
              <button onClick={() => addValue("1")}>1</button>
              <button onClick={() => addValue("2")}>2</button>
              <button onClick={() => addValue("3")}>3</button>
              <button onClick={() => addValue("*")}>*</button>
              <button onClick={() => addValue("0")} ref={buttonZeroRef}>0</button>
              <button onClick={() => addValue(".")}>.</button>
              <button onClick={() => calculateExppression()}>=</button>
              <button onClick={() => addValue("/")}>/</button>
            </div>
            <button class={styles.calculate} onClick={clearValue}>Clear</button>
        </div>
    </>
  );
}