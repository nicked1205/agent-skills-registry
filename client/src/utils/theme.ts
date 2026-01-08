export type Theme = "dark" | "light";

export function setTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  localStorage.setItem("theme", theme);
}

export function loadTheme() {
  const saved = localStorage.getItem("theme") as Theme | null;
  if (saved) setTheme(saved);
}
