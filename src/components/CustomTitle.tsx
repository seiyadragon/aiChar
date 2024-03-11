import { Title } from "@solidjs/meta";
import { ParentProps } from "solid-js";

export default function CustomTitle(props: ParentProps) {
  return <Title>Charactereum - {props.children}</Title>
}