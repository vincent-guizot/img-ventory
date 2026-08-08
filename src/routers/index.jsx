import { createBrowserRouter } from "react-router-dom";
import Layout from '../layouts/MainLayout'
import { ShowImage } from '../pages'

const routes = createBrowserRouter([
    {
        path: "/",
        element: <Layout></Layout>,
        children: [
            {
                path: "/:username",
                element: <ShowImage></ShowImage>
            }
        ]
    }
])

export default routes