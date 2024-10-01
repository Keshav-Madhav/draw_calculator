import { createBrowserRouter, RouterProvider } from "react-router-dom";
import '@mantine/core/styles.css';
import { MantineProvider } from "@mantine/core";
import Home from "./screens/home";
import "@/index.css";

const paths = [
  {
    path:'/',
    element: (
      <Home />
    )
  }
]

const browserRouter = createBrowserRouter(paths);

const App = () => {
  return (
    <MantineProvider>
      <div className="w-dvw h-dvh overflow-hidden">
        <RouterProvider router={browserRouter} />
      </div>
    </MantineProvider>
  )
}

export default App;