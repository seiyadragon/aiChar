import styles from "./Navigation.module.scss";

export default function Navigation() {
    return (
        <div class={styles.navigation}>
            <div>
                <a href="/">Home</a>
                <a href="/about">About</a>
            </div>
            <div class={styles.alt_nav}>
                <a href="/dashboard">Dashboard</a>
            </div>
        </div>
    )
}