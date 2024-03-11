import { Meta, MetaProvider, Title } from "@solidjs/meta"
import CustomTitle from "~/components/CustomTitle"

export default function Index() {
  return (
    <>
      <CustomTitle>Home</CustomTitle>
      <main>
        <h1>Charactereum</h1>
        <p>Your home for building characters!</p>
        <ul>
          <li>Harness the power of AI</li>
          <li>Build your own characters</li>
          <li>Share your characters with the world</li>
          <li>Bring your characters to life</li>
        </ul>
      </main>
    </>
  )
}